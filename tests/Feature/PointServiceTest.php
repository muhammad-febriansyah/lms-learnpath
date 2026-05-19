<?php

use App\Models\Course;
use App\Models\LearningStreak;
use App\Models\Lesson;
use App\Models\PointTransaction;
use App\Models\User;
use App\Models\UserPoint;
use App\Services\Gamification\PointService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->service = app(PointService::class);
});

it('awards points and creates a user_points row', function () {
    $course = Course::factory()->create();
    $lesson = Lesson::factory()->create(['course_id' => $course->id]);

    $tx = $this->service->award($this->user, 'lesson_complete', $lesson);

    expect($tx)->not->toBeNull();
    expect($tx->amount)->toBe(config('points.rewards.lesson_complete'));

    $point = UserPoint::query()->where('user_id', $this->user->id)->first();
    expect($point->total_points)->toBe(config('points.rewards.lesson_complete'));
    expect($point->lifetime_points)->toBe(config('points.rewards.lesson_complete'));
    expect($point->level)->toBe('bronze');
});

it('is idempotent per reference via dedupe key', function () {
    $course = Course::factory()->create();
    $lesson = Lesson::factory()->create(['course_id' => $course->id]);

    $first = $this->service->award($this->user, 'lesson_complete', $lesson);
    $second = $this->service->award($this->user, 'lesson_complete', $lesson);

    expect($first)->not->toBeNull();
    expect($second)->toBeNull();
    expect(PointTransaction::query()->count())->toBe(1);
});

it('returns null for disabled (zero-config) reasons', function () {
    $tx = $this->service->award($this->user, 'totally_unknown_reason');
    expect($tx)->toBeNull();
});

it('applies streak bonus on daily login', function () {
    LearningStreak::query()->create([
        'user_id' => $this->user->id,
        'current_streak' => 7,
        'longest_streak' => 7,
        'last_active_date' => Carbon::yesterday()->toDateString(),
    ]);

    $tx = $this->service->awardDailyLogin($this->user);

    expect($tx)->not->toBeNull();
    $base = config('points.rewards.daily_login');
    $bonus = config('points.streak_bonus.7');
    expect($tx->amount)->toBe($base + $bonus);
    expect($tx->meta['streak_bonus'])->toBe($bonus);
});

it('blocks a second daily login award on the same day', function () {
    $first = $this->service->awardDailyLogin($this->user);
    $second = $this->service->awardDailyLogin($this->user);

    expect($first)->not->toBeNull();
    expect($second)->toBeNull();
});

it('respects per-reason daily cap', function () {
    config()->set('points.daily_caps.lesson_complete', 30);
    $course = Course::factory()->create();
    $lessons = Lesson::factory()->count(5)->create(['course_id' => $course->id]);

    $awarded = 0;
    foreach ($lessons as $lesson) {
        if ($this->service->award($this->user, 'lesson_complete', $lesson)) {
            $awarded++;
        }
    }

    // 10 per lesson, cap 30 → only 3 should be awarded
    expect($awarded)->toBe(3);
});

it('promotes level based on lifetime points', function () {
    expect($this->service->levelFor(0))->toBe('bronze');
    expect($this->service->levelFor(499))->toBe('bronze');
    expect($this->service->levelFor(500))->toBe('silver');
    expect($this->service->levelFor(2000))->toBe('gold');
    expect($this->service->levelFor(99999))->toBe('diamond');
});

it('returns 0 streak bonus below the first threshold', function () {
    expect($this->service->streakBonus(0))->toBe(0);
    expect($this->service->streakBonus(2))->toBe(0);
    expect($this->service->streakBonus(3))->toBe(config('points.streak_bonus.3'));
    expect($this->service->streakBonus(100))->toBe(config('points.streak_bonus.100'));
});

it('returns null gracefully when user is null', function () {
    expect($this->service->award(null, 'lesson_complete'))->toBeNull();
});
