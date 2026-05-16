<?php

use App\Models\AssessmentAttempt;
use App\Models\Badge;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LearningPath;
use App\Models\LearningPathEnrollment;
use App\Models\LearningStreak;
use App\Models\User;
use App\Models\UserBadge;
use App\Services\Gamification\BadgeAwardingService;
use Database\Seeders\BadgeSeeder;

beforeEach(function () {
    $this->service = app(BadgeAwardingService::class);
    $this->seed(BadgeSeeder::class);
});

it('awards course_count milestone when threshold is met', function () {
    $user = User::factory()->create();
    Enrollment::factory()->count(5)->create([
        'user_id' => $user->id,
        'status' => 'completed',
    ]);

    $awarded = $this->service->evaluateForUser($user);
    $slugs = collect($awarded)->pluck('slug')->all();

    expect($slugs)->toContain('first-course', 'five-courses');
    expect($slugs)->not->toContain('ten-courses');
});

it('awards streak_days when current_streak is high enough', function () {
    $user = User::factory()->create();
    LearningStreak::create([
        'user_id' => $user->id,
        'current_streak' => 7,
        'longest_streak' => 7,
        'last_active_date' => today(),
    ]);

    $awarded = $this->service->evaluateForUser($user);
    $slugs = collect($awarded)->pluck('slug')->all();

    expect($slugs)->toContain('streak-3', 'streak-7');
    expect($slugs)->not->toContain('streak-30', 'streak-100');
});

it('awards perfect_score when user has a 100% assessment', function () {
    $user = User::factory()->create();
    AssessmentAttempt::factory()->create([
        'user_id' => $user->id,
        'status' => 'submitted',
        'score' => 100,
        'passed' => true,
    ]);

    $awarded = $this->service->evaluateForUser($user);
    $slugs = collect($awarded)->pluck('slug')->all();

    expect($slugs)->toContain('perfect-score');
});

it('does not award perfect_score for a 95% attempt', function () {
    $user = User::factory()->create();
    AssessmentAttempt::factory()->create([
        'user_id' => $user->id,
        'status' => 'submitted',
        'score' => 95,
    ]);

    $awarded = $this->service->evaluateForUser($user);
    $slugs = collect($awarded)->pluck('slug')->all();

    expect($slugs)->not->toContain('perfect-score');
});

it('awards path_completed when path enrollment is completed', function () {
    $user = User::factory()->create();
    $path = LearningPath::factory()->create();
    LearningPathEnrollment::factory()->completed()->create([
        'user_id' => $user->id,
        'learning_path_id' => $path->id,
    ]);

    $awarded = $this->service->evaluateForUser($user);
    $slugs = collect($awarded)->pluck('slug')->all();

    expect($slugs)->toContain('first-path');
});

it('is idempotent: previously-earned badges are not awarded twice', function () {
    $user = User::factory()->create();
    Enrollment::factory()->count(5)->create([
        'user_id' => $user->id,
        'status' => 'completed',
    ]);

    $first = $this->service->evaluateForUser($user);
    $second = $this->service->evaluateForUser($user);

    expect(count($first))->toBeGreaterThan(0);
    expect($second)->toBeEmpty();
    expect(UserBadge::where('user_id', $user->id)->count())->toBe(count($first));
});

it('does not award when criteria is not met', function () {
    $user = User::factory()->create();

    $awarded = $this->service->evaluateForUser($user);

    expect($awarded)->toBeEmpty();
    expect(UserBadge::where('user_id', $user->id)->count())->toBe(0);
});

it('only considers active badges', function () {
    $user = User::factory()->create();
    Enrollment::factory()->count(5)->create([
        'user_id' => $user->id,
        'status' => 'completed',
    ]);
    Badge::where('slug', 'five-courses')->update(['is_active' => false]);

    $awarded = $this->service->evaluateForUser($user);
    $slugs = collect($awarded)->pluck('slug')->all();

    expect($slugs)->not->toContain('five-courses');
    expect($slugs)->toContain('first-course');
});
