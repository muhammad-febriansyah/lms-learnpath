<?php

use App\Models\Assessment;
use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('student', 'web');
    $this->user = User::factory()->create(['email_verified_at' => now()]);
    $this->user->assignRole('student');

    $this->course = Course::factory()->create(['post_test_required' => true]);
    $this->section = CourseSection::create([
        'course_id' => $this->course->id,
        'title' => 'Bab 1',
        'sort_order' => 1,
    ]);
    $this->lesson = Lesson::factory()->create([
        'course_id' => $this->course->id,
        'course_section_id' => $this->section->id,
        'is_required' => true,
    ]);
});

it('passes pre_test and post_test props to the lesson player', function () {
    Enrollment::create([
        'user_id' => $this->user->id,
        'course_id' => $this->course->id,
        'status' => 'active',
        'enrolled_at' => now(),
    ]);
    $preTest = Assessment::factory()->preTest()->create(['course_id' => $this->course->id]);
    $postTest = Assessment::factory()->postTest()->create(['course_id' => $this->course->id]);

    $this->actingAs($this->user)
        ->get(route('learn.lesson', ['course' => $this->course->slug, 'lesson' => $this->lesson->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('student/learn/show')
            ->where('assessments.pre_test.id', $preTest->id)
            ->where('assessments.post_test.id', $postTest->id)
            ->where('assessments.post_test.is_required', true)
            ->where('enrollment.pre_test_status', 'not_started')
            ->where('enrollment.post_test_status', 'not_started')
        );
});

it('reflects pre_test_status=passed in lesson player props after pre-test passes', function () {
    Enrollment::create([
        'user_id' => $this->user->id,
        'course_id' => $this->course->id,
        'status' => 'active',
        'pre_test_status' => 'passed',
        'enrolled_at' => now(),
    ]);
    Assessment::factory()->preTest()->create(['course_id' => $this->course->id]);

    $this->actingAs($this->user)
        ->get(route('learn.lesson', ['course' => $this->course->slug, 'lesson' => $this->lesson->id]))
        ->assertInertia(fn ($page) => $page
            ->where('assessments.pre_test.status', 'passed')
        );
});

it('exposes null when the course has no assessments', function () {
    Enrollment::create([
        'user_id' => $this->user->id,
        'course_id' => $this->course->id,
        'status' => 'active',
        'enrolled_at' => now(),
    ]);

    $this->actingAs($this->user)
        ->get(route('learn.lesson', ['course' => $this->course->slug, 'lesson' => $this->lesson->id]))
        ->assertInertia(fn ($page) => $page
            ->where('assessments.pre_test', null)
            ->where('assessments.post_test', null)
        );
});
