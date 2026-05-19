<?php

use App\Actions\Learning\MarkLessonComplete;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\PointTransaction;
use App\Models\User;
use Illuminate\Auth\Events\Login;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('awards daily-login points when a Login event fires', function () {
    Event::dispatch(new Login('web', $this->user, false));

    $tx = PointTransaction::query()
        ->where('user_id', $this->user->id)
        ->where('reason', 'daily_login')
        ->first();

    expect($tx)->not->toBeNull();
    expect($tx->amount)->toBeGreaterThan(0);
});

it('awards lesson_complete points when MarkLessonComplete runs', function () {
    $course = Course::factory()->create();
    $lesson = Lesson::factory()->create(['course_id' => $course->id]);

    Enrollment::create([
        'user_id' => $this->user->id,
        'course_id' => $course->id,
        'status' => 'active',
        'progress_percent' => 0,
        'pre_test_status' => 'not_started',
    ]);

    app(MarkLessonComplete::class)->execute($this->user, $lesson);

    $tx = PointTransaction::query()
        ->where('user_id', $this->user->id)
        ->where('reason', 'lesson_complete')
        ->first();

    expect($tx)->not->toBeNull();
    expect($tx->reference_id)->toBe($lesson->id);
});

it('awards course_complete points when the last lesson completes the enrollment', function () {
    $course = Course::factory()->create([
        'post_test_required' => false,
    ]);
    $lesson = Lesson::factory()->create([
        'course_id' => $course->id,
        'is_required' => true,
    ]);

    Enrollment::create([
        'user_id' => $this->user->id,
        'course_id' => $course->id,
        'status' => 'active',
        'progress_percent' => 0,
        'pre_test_status' => 'not_started',
    ]);

    app(MarkLessonComplete::class)->execute($this->user, $lesson);

    $tx = PointTransaction::query()
        ->where('user_id', $this->user->id)
        ->where('reason', 'course_complete')
        ->first();

    expect($tx)->not->toBeNull();
});
