<?php

use App\Models\Competency;
use App\Models\Course;
use App\Models\CourseCompetencyMapping;
use App\Models\EmployeeProfile;
use App\Models\Enrollment;
use App\Models\LearningPath;
use App\Models\LearningPathEnrollment;
use App\Models\Position;
use App\Models\PositionCompetencyTarget;
use App\Models\User;
use App\Services\Learning\PositionCourseAutoEnrollService;

beforeEach(function () {
    $this->service = app(PositionCourseAutoEnrollService::class);
});

it('returns zero when user has no position', function () {
    $user = User::factory()->create();

    $result = $this->service->syncForUser($user);

    expect($result['enrolled'])->toBe(0)
        ->and($result['course_ids'])->toBe([]);
    expect(Enrollment::count())->toBe(0);
});

it('enrolls user into published courses mapped to their position competencies', function () {
    $position = Position::factory()->create();
    $competency = Competency::factory()->create();

    PositionCompetencyTarget::factory()->create([
        'position_id' => $position->id,
        'competency_id' => $competency->id,
        'is_required' => true,
    ]);

    $courseA = Course::factory()->create();
    $courseB = Course::factory()->create();
    CourseCompetencyMapping::factory()->create([
        'course_id' => $courseA->id,
        'competency_id' => $competency->id,
    ]);
    CourseCompetencyMapping::factory()->create([
        'course_id' => $courseB->id,
        'competency_id' => $competency->id,
    ]);

    $user = User::factory()->create();
    EmployeeProfile::factory()->create([
        'user_id' => $user->id,
        'position_id' => $position->id,
    ]);

    $result = $this->service->syncForUser($user->fresh());

    expect($result['enrolled'])->toBe(2);
    expect(Enrollment::where('user_id', $user->id)->count())->toBe(2);
    expect(Enrollment::where('user_id', $user->id)->pluck('status')->all())
        ->each->toBe('active');
});

it('is idempotent: re-running does not duplicate enrollments', function () {
    $position = Position::factory()->create();
    $competency = Competency::factory()->create();
    PositionCompetencyTarget::factory()->create([
        'position_id' => $position->id,
        'competency_id' => $competency->id,
    ]);
    $course = Course::factory()->create();
    CourseCompetencyMapping::factory()->create([
        'course_id' => $course->id,
        'competency_id' => $competency->id,
    ]);

    $user = User::factory()->create();
    EmployeeProfile::factory()->create([
        'user_id' => $user->id,
        'position_id' => $position->id,
    ]);

    $first = $this->service->syncForUser($user->fresh());
    $second = $this->service->syncForUser($user->fresh());

    expect($first['enrolled'])->toBe(1);
    expect($second['enrolled'])->toBe(0);
    expect($second['skipped'])->toBe(1);
    expect(Enrollment::where('user_id', $user->id)->count())->toBe(1);
});

it('skips unpublished courses', function () {
    $position = Position::factory()->create();
    $competency = Competency::factory()->create();
    PositionCompetencyTarget::factory()->create([
        'position_id' => $position->id,
        'competency_id' => $competency->id,
    ]);
    $draftCourse = Course::factory()->draft()->create();
    CourseCompetencyMapping::factory()->create([
        'course_id' => $draftCourse->id,
        'competency_id' => $competency->id,
    ]);

    $user = User::factory()->create();
    EmployeeProfile::factory()->create([
        'user_id' => $user->id,
        'position_id' => $position->id,
    ]);

    $result = $this->service->syncForUser($user->fresh());

    expect($result['enrolled'])->toBe(0);
    expect(Enrollment::count())->toBe(0);
});

it('ignores competencies that are not required for the position', function () {
    $position = Position::factory()->create();
    $required = Competency::factory()->create();
    $optional = Competency::factory()->create();

    PositionCompetencyTarget::factory()->create([
        'position_id' => $position->id,
        'competency_id' => $required->id,
        'is_required' => true,
    ]);
    PositionCompetencyTarget::factory()->create([
        'position_id' => $position->id,
        'competency_id' => $optional->id,
        'is_required' => false,
    ]);

    $requiredCourse = Course::factory()->create();
    $optionalCourse = Course::factory()->create();
    CourseCompetencyMapping::factory()->create([
        'course_id' => $requiredCourse->id,
        'competency_id' => $required->id,
    ]);
    CourseCompetencyMapping::factory()->create([
        'course_id' => $optionalCourse->id,
        'competency_id' => $optional->id,
    ]);

    $user = User::factory()->create();
    EmployeeProfile::factory()->create([
        'user_id' => $user->id,
        'position_id' => $position->id,
    ]);

    $result = $this->service->syncForUser($user->fresh());

    expect($result['enrolled'])->toBe(1);
    expect($result['course_ids'])->toBe([$requiredCourse->id]);
});

it('increments course total_students counter', function () {
    $position = Position::factory()->create();
    $competency = Competency::factory()->create();
    PositionCompetencyTarget::factory()->create([
        'position_id' => $position->id,
        'competency_id' => $competency->id,
    ]);
    $course = Course::factory()->create(['total_students' => 5]);
    CourseCompetencyMapping::factory()->create([
        'course_id' => $course->id,
        'competency_id' => $competency->id,
    ]);

    $user = User::factory()->create();
    EmployeeProfile::factory()->create([
        'user_id' => $user->id,
        'position_id' => $position->id,
    ]);

    $this->service->syncForUser($user->fresh());

    expect($course->fresh()->total_students)->toBe(6);
});

it('syncPathsForUser enrolls user into all paths linked to their position', function () {
    $position = Position::factory()->create();
    $path = LearningPath::factory()->create(['position_id' => $position->id]);
    $course = Course::factory()->create();
    $path->courses()->sync([$course->id => ['sort_order' => 1, 'is_required' => true]]);
    $path->update(['total_courses' => 1]);

    $user = User::factory()->create();
    EmployeeProfile::factory()->create([
        'user_id' => $user->id,
        'position_id' => $position->id,
    ]);

    $result = $this->service->syncPathsForUser($user->fresh());

    expect($result['paths_enrolled'])->toBe(1);
    expect($result['child_courses_created'])->toBe(1);
    expect(LearningPathEnrollment::where('user_id', $user->id)->count())->toBe(1);
    expect(Enrollment::where('user_id', $user->id)->count())->toBe(1);
});

it('syncPathsForUser ignores unpublished paths', function () {
    $position = Position::factory()->create();
    LearningPath::factory()->draft()->create(['position_id' => $position->id]);

    $user = User::factory()->create();
    EmployeeProfile::factory()->create([
        'user_id' => $user->id,
        'position_id' => $position->id,
    ]);

    $result = $this->service->syncPathsForUser($user->fresh());

    expect($result['paths_enrolled'])->toBe(0);
});

it('syncPathsForUser is idempotent', function () {
    $position = Position::factory()->create();
    $path = LearningPath::factory()->create(['position_id' => $position->id]);
    $course = Course::factory()->create();
    $path->courses()->sync([$course->id => ['sort_order' => 1, 'is_required' => true]]);

    $user = User::factory()->create();
    EmployeeProfile::factory()->create([
        'user_id' => $user->id,
        'position_id' => $position->id,
    ]);

    $first = $this->service->syncPathsForUser($user->fresh());
    $second = $this->service->syncPathsForUser($user->fresh());

    expect($first['paths_enrolled'])->toBe(1);
    expect($second['paths_enrolled'])->toBe(0);
    expect(LearningPathEnrollment::where('user_id', $user->id)->count())->toBe(1);
});

it('syncForPosition enrolls every employee that holds the position', function () {
    $position = Position::factory()->create();
    $competency = Competency::factory()->create();
    PositionCompetencyTarget::factory()->create([
        'position_id' => $position->id,
        'competency_id' => $competency->id,
    ]);
    $course = Course::factory()->create();
    CourseCompetencyMapping::factory()->create([
        'course_id' => $course->id,
        'competency_id' => $competency->id,
    ]);

    $userA = User::factory()->create();
    $userB = User::factory()->create();
    EmployeeProfile::factory()->create([
        'user_id' => $userA->id,
        'position_id' => $position->id,
    ]);
    EmployeeProfile::factory()->create([
        'user_id' => $userB->id,
        'position_id' => $position->id,
    ]);

    $result = $this->service->syncForPosition($position);

    expect($result['users'])->toBe(2);
    expect($result['enrolled'])->toBe(2);
    expect(Enrollment::count())->toBe(2);
});
