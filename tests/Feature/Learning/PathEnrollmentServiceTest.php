<?php

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LearningPath;
use App\Models\LearningPathEnrollment;
use App\Models\User;
use App\Services\Learning\PathEnrollmentService;

beforeEach(function () {
    $this->service = app(PathEnrollmentService::class);
});

function attachCourses(LearningPath $path, int $count = 3, array $states = []): array
{
    $courses = Course::factory()->count($count)->create($states);
    $sync = [];
    foreach ($courses as $idx => $course) {
        $sync[$course->id] = [
            'sort_order' => $idx + 1,
            'is_required' => true,
        ];
    }
    $path->courses()->sync($sync);
    $path->update(['total_courses' => $count]);

    return $courses->all();
}

it('creates a path enrollment + child enrollments for every course in the path', function () {
    $user = User::factory()->create();
    $path = LearningPath::factory()->create();
    $courses = attachCourses($path, 3);

    $result = $this->service->enroll($user, $path);

    expect($result['path_enrolled'])->toBeTrue();
    expect($result['child_enrollments_created'])->toBe(3);

    expect(LearningPathEnrollment::where('user_id', $user->id)->count())->toBe(1);
    expect(Enrollment::where('user_id', $user->id)->count())->toBe(3);
    expect(Enrollment::where('user_id', $user->id)->pluck('course_id')->sort()->values()->all())
        ->toBe(collect($courses)->pluck('id')->sort()->values()->all());
});

it('is idempotent: re-enrolling does not duplicate path or child enrollments', function () {
    $user = User::factory()->create();
    $path = LearningPath::factory()->create();
    attachCourses($path, 2);

    $first = $this->service->enroll($user, $path);
    $second = $this->service->enroll($user, $path);

    expect($first['path_enrolled'])->toBeTrue();
    expect($second['path_enrolled'])->toBeFalse();
    expect($second['child_enrollments_created'])->toBe(0);

    expect(LearningPathEnrollment::where('user_id', $user->id)->count())->toBe(1);
    expect(Enrollment::where('user_id', $user->id)->count())->toBe(2);
});

it('does not duplicate an existing course enrollment when path enrolls the user', function () {
    $user = User::factory()->create();
    $path = LearningPath::factory()->create();
    [$courseA, $courseB] = attachCourses($path, 2);

    Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $courseA->id,
        'status' => 'active',
        'enrolled_at' => now(),
    ]);

    $result = $this->service->enroll($user, $path);

    expect($result['child_enrollments_created'])->toBe(1);
    expect(Enrollment::where('user_id', $user->id)->count())->toBe(2);
});

it('aggregates progress from child course enrollments', function () {
    $user = User::factory()->create();
    $path = LearningPath::factory()->create();
    $courses = attachCourses($path, 4);

    $this->service->enroll($user, $path);

    // Mark course #1 and #2 as fully complete, course #3 as 50%
    Enrollment::where('user_id', $user->id)->where('course_id', $courses[0]->id)
        ->update(['status' => 'completed', 'progress_percent' => 100]);
    Enrollment::where('user_id', $user->id)->where('course_id', $courses[1]->id)
        ->update(['status' => 'completed', 'progress_percent' => 100]);
    Enrollment::where('user_id', $user->id)->where('course_id', $courses[2]->id)
        ->update(['progress_percent' => 50]);

    $progress = $this->service->recomputeProgress($user, $path);

    // (100 + 100 + 50 + 0) / 4 = 62.5 -> rounds to 63
    expect($progress)->toBe(63);

    $pathEnrollment = LearningPathEnrollment::where('user_id', $user->id)->first();
    expect($pathEnrollment->courses_completed)->toBe(2);
    expect($pathEnrollment->status)->toBe('active');
    expect($pathEnrollment->started_at)->not->toBeNull();
});

it('marks path as completed when all child courses are completed', function () {
    $user = User::factory()->create();
    $path = LearningPath::factory()->create();
    $courses = attachCourses($path, 2);

    $this->service->enroll($user, $path);

    Enrollment::where('user_id', $user->id)
        ->update(['status' => 'completed', 'progress_percent' => 100]);

    $this->service->recomputeProgress($user, $path);

    $pathEnrollment = LearningPathEnrollment::where('user_id', $user->id)->first();
    expect($pathEnrollment->status)->toBe('completed');
    expect($pathEnrollment->progress_percent)->toBe(100);
    expect($pathEnrollment->completed_at)->not->toBeNull();
});

it('increments path total_students on first enrollment only', function () {
    $user = User::factory()->create();
    $path = LearningPath::factory()->create(['total_students' => 0]);
    attachCourses($path, 1);

    $this->service->enroll($user, $path);
    expect($path->fresh()->total_students)->toBe(1);

    $this->service->enroll($user, $path);
    expect($path->fresh()->total_students)->toBe(1);
});

it('returns zero progress when path has no courses attached', function () {
    $user = User::factory()->create();
    $path = LearningPath::factory()->create();

    $this->service->enroll($user, $path);
    $progress = $this->service->recomputeProgress($user, $path);

    expect($progress)->toBe(0);
});
