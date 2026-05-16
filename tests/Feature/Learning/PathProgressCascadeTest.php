<?php

use App\Actions\Learning\MarkLessonComplete;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LearningPath;
use App\Models\LearningPathEnrollment;
use App\Models\Lesson;
use App\Models\User;
use App\Services\Learning\PathEnrollmentService;

it('cascades course completion into path progress automatically via observer', function () {
    $user = User::factory()->create();

    $course = Course::factory()->create();
    $lessonA = Lesson::factory()->create(['course_id' => $course->id, 'is_required' => true]);
    $lessonB = Lesson::factory()->create(['course_id' => $course->id, 'is_required' => true]);

    $path = LearningPath::factory()->create();
    $path->courses()->sync([$course->id => ['sort_order' => 1, 'is_required' => true]]);
    $path->update(['total_courses' => 1]);

    app(PathEnrollmentService::class)->enroll($user, $path);

    expect(LearningPathEnrollment::where('user_id', $user->id)->first()->progress_percent)
        ->toBe(0);

    // Complete first lesson -> 50% course progress
    app(MarkLessonComplete::class)->execute($user, $lessonA);

    $pathEnrollment = LearningPathEnrollment::where('user_id', $user->id)->first();
    expect($pathEnrollment->progress_percent)->toBe(50);
    expect($pathEnrollment->status)->toBe('active');

    // Complete second lesson -> 100% course -> path completes
    app(MarkLessonComplete::class)->execute($user, $lessonB);

    $pathEnrollment->refresh();
    expect($pathEnrollment->progress_percent)->toBe(100);
    expect($pathEnrollment->courses_completed)->toBe(1);
    expect($pathEnrollment->status)->toBe('completed');
    expect($pathEnrollment->completed_at)->not->toBeNull();
});

it('does not recompute when an unrelated enrollment field changes', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create();
    $path = LearningPath::factory()->create();
    $path->courses()->sync([$course->id => ['sort_order' => 1, 'is_required' => true]]);

    app(PathEnrollmentService::class)->enroll($user, $path);

    $pathEnrollment = LearningPathEnrollment::where('user_id', $user->id)->first();
    $originalUpdatedAt = $pathEnrollment->updated_at;

    sleep(1);

    // Update a field the observer ignores
    Enrollment::where('user_id', $user->id)->update(['pre_test_status' => 'in_progress']);

    expect($pathEnrollment->fresh()->updated_at->equalTo($originalUpdatedAt))->toBeTrue();
});

it('does nothing when the user has no path enrollment for the course', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create();
    $lesson = Lesson::factory()->create(['course_id' => $course->id, 'is_required' => true]);

    Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => 'active',
        'progress_percent' => 0,
        'enrolled_at' => now(),
    ]);

    expect(fn () => app(MarkLessonComplete::class)->execute($user, $lesson))
        ->not->toThrow(\Throwable::class);

    expect(LearningPathEnrollment::count())->toBe(0);
});
