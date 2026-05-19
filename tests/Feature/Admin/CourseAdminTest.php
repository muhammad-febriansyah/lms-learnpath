<?php

use App\Models\Category;
use App\Models\Course;
use App\Models\ScormPackage;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);

    $this->superAdmin = User::factory()->create(['email_verified_at' => now()]);
    $this->superAdmin->assignRole('superadmin');

    $this->admin = User::factory()->create(['email_verified_at' => now()]);
    $this->admin->assignRole('admin_tenant');

    $this->instructor = User::factory()->create(['email_verified_at' => now()]);
    $this->instructor->assignRole('instructor');

    $this->otherInstructor = User::factory()->create(['email_verified_at' => now()]);
    $this->otherInstructor->assignRole('instructor');

    $this->category = Category::factory()->create(['is_active' => true]);
});

it('admin and super admin can view list', function () {
    $this->actingAs($this->admin)
        ->get('/admin/courses')
        ->assertOk()
        ->assertInertia(fn ($p) => $p
            ->component('admin/courses/index')
            ->where('courses.per_page', 8)
        );

    $this->actingAs($this->superAdmin)
        ->get('/admin/courses')
        ->assertOk();
});

it('admin cannot access create form', function () {
    $this->actingAs($this->admin)
        ->get('/admin/courses/create')
        ->assertForbidden();
});

it('super admin cannot access create form', function () {
    $this->actingAs($this->superAdmin)
        ->get('/admin/courses/create')
        ->assertForbidden();
});

it('instructor can access create form', function () {
    $this->actingAs($this->instructor)
        ->get('/admin/courses/create')
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('admin/courses/form'));
});

it('instructor only sees own courses in list', function () {
    Course::factory()->create([
        'instructor_id' => $this->instructor->id,
        'title' => 'My Course',
        'category_id' => $this->category->id,
    ]);
    Course::factory()->create([
        'instructor_id' => $this->otherInstructor->id,
        'title' => 'Not Mine',
        'category_id' => $this->category->id,
    ]);

    $this->actingAs($this->instructor)
        ->get('/admin/courses')
        ->assertOk()
        ->assertInertia(fn ($p) => $p
            ->component('admin/courses/index')
            ->has('courses.data', 1)
            ->where('courses.data.0.title', 'My Course')
        );
});

it('instructor can store a course as draft owned by self', function () {
    $payload = courseFormPayload();

    $response = $this->actingAs($this->instructor)
        ->post('/admin/courses', $payload);

    $course = Course::where('title', $payload['title'])->first();
    expect($course)->not->toBeNull()
        ->and($course->instructor_id)->toBe($this->instructor->id)
        ->and($course->review_status)->toBe(Course::REVIEW_DRAFT)
        ->and($course->is_published)->toBeFalse();

    $response->assertRedirect("/admin/courses/{$course->id}")
        ->assertSessionHas('success');
});

it('instructor cannot edit course owned by another instructor', function () {
    $course = Course::factory()->create([
        'instructor_id' => $this->otherInstructor->id,
        'category_id' => $this->category->id,
        'review_status' => Course::REVIEW_DRAFT,
    ]);

    $this->actingAs($this->instructor)
        ->get("/admin/courses/{$course->id}/edit")
        ->assertForbidden();
});

it('instructor can submit own draft for review', function () {
    $course = Course::factory()->create([
        'instructor_id' => $this->instructor->id,
        'category_id' => $this->category->id,
        'review_status' => Course::REVIEW_DRAFT,
    ]);

    $this->actingAs($this->instructor)
        ->post("/admin/courses/{$course->id}/submit-review")
        ->assertRedirect("/admin/courses/{$course->id}");

    expect($course->fresh())
        ->review_status->toBe(Course::REVIEW_PENDING)
        ->submitted_at->not->toBeNull();
});

it('instructor cannot submit course twice', function () {
    $course = Course::factory()->create([
        'instructor_id' => $this->instructor->id,
        'category_id' => $this->category->id,
        'review_status' => Course::REVIEW_PENDING,
    ]);

    $this->actingAs($this->instructor)
        ->post("/admin/courses/{$course->id}/submit-review")
        ->assertForbidden();
});

it('super admin can approve a pending course', function () {
    $course = Course::factory()->create([
        'instructor_id' => $this->instructor->id,
        'category_id' => $this->category->id,
        'review_status' => Course::REVIEW_PENDING,
        'is_published' => false,
    ]);

    $this->actingAs($this->superAdmin)
        ->post("/admin/courses/{$course->id}/approve")
        ->assertRedirect("/admin/courses/{$course->id}");

    expect($course->fresh())
        ->review_status->toBe(Course::REVIEW_PUBLISHED)
        ->is_published->toBeTrue()
        ->reviewed_by->toBe($this->superAdmin->id);
});

it('admin cannot approve a pending course', function () {
    $course = Course::factory()->create([
        'instructor_id' => $this->instructor->id,
        'category_id' => $this->category->id,
        'review_status' => Course::REVIEW_PENDING,
    ]);

    $this->actingAs($this->admin)
        ->post("/admin/courses/{$course->id}/approve")
        ->assertForbidden();
});

it('super admin can reject a pending course with notes', function () {
    $course = Course::factory()->create([
        'instructor_id' => $this->instructor->id,
        'category_id' => $this->category->id,
        'review_status' => Course::REVIEW_PENDING,
    ]);

    $this->actingAs($this->superAdmin)
        ->post("/admin/courses/{$course->id}/reject", [
            'review_notes' => 'Mohon lengkapi deskripsi dan thumbnail.',
        ])
        ->assertRedirect("/admin/courses/{$course->id}");

    expect($course->fresh())
        ->review_status->toBe(Course::REVIEW_REJECTED)
        ->review_notes->toContain('thumbnail');
});

it('rejection requires notes', function () {
    $course = Course::factory()->create([
        'instructor_id' => $this->instructor->id,
        'category_id' => $this->category->id,
        'review_status' => Course::REVIEW_PENDING,
    ]);

    $this->actingAs($this->superAdmin)
        ->post("/admin/courses/{$course->id}/reject", ['review_notes' => ''])
        ->assertSessionHasErrors('review_notes');
});

it('admin can view course detail but sees no edit actions', function () {
    $course = Course::factory()->create([
        'instructor_id' => $this->instructor->id,
        'category_id' => $this->category->id,
    ]);

    $this->actingAs($this->admin)
        ->get("/admin/courses/{$course->id}")
        ->assertOk()
        ->assertInertia(fn ($p) => $p
            ->component('admin/courses/show')
            ->where('permissions.canEdit', false)
            ->where('permissions.canDelete', false)
            ->where('permissions.canReview', false)
        );
});

it('storing with lms_format=scorm requires scorm_package_id', function () {
    $payload = courseFormPayload([
        'lms_format' => 'scorm',
        'scorm_package_id' => null,
    ]);

    $this->actingAs($this->instructor)
        ->post('/admin/courses', $payload)
        ->assertSessionHasErrors('scorm_package_id');
});

it('stores scorm_package_id when lms_format=scorm', function () {
    $pkg = ScormPackage::factory()->create();

    $payload = courseFormPayload([
        'lms_format' => 'scorm',
        'scorm_package_id' => $pkg->id,
    ]);

    $this->actingAs($this->instructor)
        ->post('/admin/courses', $payload)
        ->assertSessionHasNoErrors();

    $course = Course::where('title', $payload['title'])->first();
    expect($course->lms_format)->toBe('scorm')
        ->and($course->scorm_package_id)->toBe($pkg->id);
});

it('nulls scorm_package_id when lms_format is not scorm', function () {
    $pkg = ScormPackage::factory()->create();

    $payload = courseFormPayload([
        'lms_format' => 'video',
        'scorm_package_id' => $pkg->id,
    ]);

    $this->actingAs($this->instructor)
        ->post('/admin/courses', $payload)
        ->assertSessionHasNoErrors();

    $course = Course::where('title', $payload['title'])->first();
    expect($course->scorm_package_id)->toBeNull();
});

it('rejects invalid lms_format', function () {
    $payload = courseFormPayload(['lms_format' => 'pdf']);

    $this->actingAs($this->instructor)
        ->post('/admin/courses', $payload)
        ->assertSessionHasErrors('lms_format');
});

it('rejected course becomes draft again on edit/update', function () {
    $course = Course::factory()->create([
        'instructor_id' => $this->instructor->id,
        'category_id' => $this->category->id,
        'review_status' => Course::REVIEW_REJECTED,
    ]);

    $payload = courseFormPayload(['title' => 'Updated Title']);

    $this->actingAs($this->instructor)
        ->put("/admin/courses/{$course->id}", $payload)
        ->assertRedirect("/admin/courses/{$course->id}");

    expect($course->fresh())->review_status->toBe(Course::REVIEW_DRAFT);
});

function courseFormPayload(array $overrides = []): array
{
    return array_merge([
        'category_id' => test()->category->id,
        'title' => 'Sample Course '.uniqid(),
        'subtitle' => 'Test subtitle',
        'slug' => 'sample-course-'.uniqid(),
        'description' => 'Course description here.',
        'price' => 0,
        'compare_at_price' => null,
        'level' => 'beginner',
        'delivery_format' => 'on_demand',
        'lms_format' => 'video',
        'scorm_package_id' => null,
        'is_certified' => false,
        'language' => 'id',
        'duration_minutes' => 120,
        'pre_test_required' => false,
        'post_test_required' => false,
        'passing_score' => 70,
        'max_attempts' => 3,
        'learning_objectives' => ['Belajar A', 'Belajar B'],
        'requirements' => [],
        'target_audience' => [],
        'tag_ids' => [],
    ], $overrides);
}
