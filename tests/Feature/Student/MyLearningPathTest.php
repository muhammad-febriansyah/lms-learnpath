<?php

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LearningPath;
use App\Models\LearningPathEnrollment;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('student', 'web');
    $this->user = User::factory()->create(['email_verified_at' => now()]);
    $this->user->assignRole('student');
});

it('requires authentication to view my-paths', function () {
    $this->get('/my-paths')->assertRedirect('/login');
});

it('renders the my-paths page with enrolled paths and stats', function () {
    $path = LearningPath::factory()->create(['total_courses' => 3]);
    LearningPathEnrollment::factory()->create([
        'user_id' => $this->user->id,
        'learning_path_id' => $path->id,
        'progress_percent' => 33,
        'courses_completed' => 1,
    ]);

    $response = $this->actingAs($this->user)->get('/my-paths');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('student/my-paths/index')
        ->where('stats.total', 1)
        ->has('enrollments.data', 1)
        ->where('enrollments.data.0.progress_percent', 33)
    );
});

it('enrolls the user into a path via POST endpoint and creates child course enrollments', function () {
    $path = LearningPath::factory()->create();
    $courses = Course::factory()->count(2)->create();
    $path->courses()->sync([
        $courses[0]->id => ['sort_order' => 1, 'is_required' => true],
        $courses[1]->id => ['sort_order' => 2, 'is_required' => true],
    ]);
    $path->update(['total_courses' => 2]);

    $this->actingAs($this->user)
        ->post("/paths/{$path->slug}/enroll")
        ->assertRedirect(route('paths.show', $path))
        ->assertSessionHas('success');

    expect(LearningPathEnrollment::where('user_id', $this->user->id)->count())->toBe(1);
    expect(Enrollment::where('user_id', $this->user->id)->count())->toBe(2);
});

it('returns an info flash when user is already enrolled', function () {
    $path = LearningPath::factory()->create();
    LearningPathEnrollment::factory()->create([
        'user_id' => $this->user->id,
        'learning_path_id' => $path->id,
    ]);

    $this->actingAs($this->user)
        ->post("/paths/{$path->slug}/enroll")
        ->assertSessionHas('info');
});

it('exposes user enrollment state on the path detail page when logged in', function () {
    $path = LearningPath::factory()->create();
    $course = Course::factory()->create();
    $path->courses()->sync([$course->id => ['sort_order' => 1, 'is_required' => true]]);

    LearningPathEnrollment::factory()->create([
        'user_id' => $this->user->id,
        'learning_path_id' => $path->id,
        'progress_percent' => 25,
    ]);
    Enrollment::create([
        'user_id' => $this->user->id,
        'course_id' => $course->id,
        'status' => 'active',
        'progress_percent' => 25,
        'enrolled_at' => now(),
    ]);

    $response = $this->actingAs($this->user)->get("/paths/{$path->slug}");

    $response->assertInertia(fn ($page) => $page
        ->where('userEnrollment.progress_percent', 25)
        ->where("courseProgress.{$course->id}.progress_percent", 25)
    );
});
