<?php

use App\Models\Course;
use App\Models\Lesson;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('superadmin', 'web');
    Role::findOrCreate('instructor', 'web');
    Role::findOrCreate('employee', 'web');
    Role::findOrCreate('user_public', 'web');
    $this->seed(RolePermissionSeeder::class);

    $this->course = Course::factory()->create([
        'is_published' => true,
        'slug' => 'preview-test-course',
    ]);
    $this->preview = Lesson::factory()->create([
        'course_id' => $this->course->id,
        'is_preview' => true,
        'title' => 'Preview Pertama',
        'type' => 'text',
        'content' => '<p>Halo dunia preview.</p>',
    ]);
    $this->locked = Lesson::factory()->create([
        'course_id' => $this->course->id,
        'is_preview' => false,
        'title' => 'Lesson Terkunci',
    ]);
});

it('lets guest visitors open a preview lesson', function () {
    $this->get("/courses/{$this->course->slug}/preview/{$this->preview->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/courses/preview')
            ->where('lesson.id', $this->preview->id)
            ->where('course.slug', $this->course->slug)
        );
});

it('returns 403 when the lesson is not marked as preview', function () {
    $this->get("/courses/{$this->course->slug}/preview/{$this->locked->id}")
        ->assertForbidden();
});

it('returns 404 when the lesson belongs to a different course', function () {
    $otherCourse = Course::factory()->create(['is_published' => true]);

    $this->get("/courses/{$otherCourse->slug}/preview/{$this->preview->id}")
        ->assertNotFound();
});

it('returns 404 when the course is not published', function () {
    $this->course->update(['is_published' => false]);

    $this->get("/courses/{$this->course->slug}/preview/{$this->preview->id}")
        ->assertNotFound();
});

it('lets superadmin toggle a lesson preview flag', function () {
    $admin = User::factory()->create(['email_verified_at' => now()]);
    $admin->assignRole('superadmin');

    $this->actingAs($admin)
        ->post("/admin/lessons/{$this->locked->id}/toggle-preview")
        ->assertSessionHas('success');

    expect($this->locked->fresh()->is_preview)->toBeTrue();
});

it('lets the course instructor toggle their own lesson', function () {
    $instructor = User::factory()->create(['email_verified_at' => now()]);
    $instructor->assignRole('instructor');
    $this->course->update(['instructor_id' => $instructor->id]);

    $this->actingAs($instructor)
        ->post("/admin/lessons/{$this->locked->id}/toggle-preview")
        ->assertSessionHas('success');

    expect($this->locked->fresh()->is_preview)->toBeTrue();
});

it('blocks an instructor who does not own the course', function () {
    $owner = User::factory()->create(['email_verified_at' => now()]);
    $owner->assignRole('instructor');
    $this->course->update(['instructor_id' => $owner->id]);

    $stranger = User::factory()->create(['email_verified_at' => now()]);
    $stranger->assignRole('instructor');

    $this->actingAs($stranger)
        ->post("/admin/lessons/{$this->locked->id}/toggle-preview")
        ->assertForbidden();

    expect($this->locked->fresh()->is_preview)->toBeFalse();
});
