<?php

use App\Models\Course;
use App\Models\LearningPath;
use App\Models\Position;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('superadmin', 'web');
    Permission::findOrCreate('learning_path.manage', 'web');
    Role::findByName('superadmin', 'web')->givePermissionTo('learning_path.manage');

    $this->admin = User::factory()->create(['email_verified_at' => now()]);
    $this->admin->assignRole('superadmin');
});

it('lists learning paths for admins', function () {
    LearningPath::factory()->count(2)->create();

    $this->actingAs($this->admin)
        ->get('/admin/learning-paths')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/learning-paths/index')
            ->has('paths.data', 2)
        );
});

it('renders the create form with positions', function () {
    Position::factory()->create();

    $this->actingAs($this->admin)
        ->get('/admin/learning-paths/create')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/learning-paths/form')
            ->where('path', null)
            ->has('positions', 1)
        );
});

it('creates a learning path and redirects to show', function () {
    $this->actingAs($this->admin)
        ->post('/admin/learning-paths', [
            'title' => 'Roadmap Test',
            'slug' => 'roadmap-test',
            'subtitle' => 'Path testing',
            'description' => null,
            'level' => 'beginner',
            'duration_weeks' => 8,
            'position_id' => null,
            'target_audience' => ['Karyawan baru'],
            'outcomes' => ['Memahami dasar'],
            'is_published' => false,
        ])
        ->assertSessionHas('success');

    $path = LearningPath::where('slug', 'roadmap-test')->first();
    expect($path)->not->toBeNull();
    expect($path->target_audience)->toBe(['Karyawan baru']);
});

it('rejects duplicate slug on create', function () {
    LearningPath::factory()->create(['slug' => 'duplicate-slug']);

    $this->actingAs($this->admin)
        ->post('/admin/learning-paths', [
            'title' => 'X',
            'slug' => 'duplicate-slug',
            'level' => 'beginner',
            'duration_weeks' => 4,
            'is_published' => false,
        ])
        ->assertSessionHasErrors('slug');
});

it('forbids users without learning_path.manage', function () {
    $stranger = User::factory()->create(['email_verified_at' => now()]);

    $this->actingAs($stranger)
        ->get('/admin/learning-paths')
        ->assertForbidden();
});

it('shows the path with attached courses', function () {
    $path = LearningPath::factory()->create();
    $a = Course::factory()->create();
    $b = Course::factory()->create();
    $path->courses()->sync([
        $a->id => ['sort_order' => 1, 'is_required' => true],
        $b->id => ['sort_order' => 2, 'is_required' => true],
    ]);

    $this->actingAs($this->admin)
        ->get("/admin/learning-paths/{$path->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/learning-paths/show')
            ->has('path.courses', 2)
            ->where('path.courses.0.id', $a->id)
            ->where('path.courses.0.sort_order', 1)
        );
});

it('attaches a course to the path with the next sort_order', function () {
    $path = LearningPath::factory()->create();
    $existing = Course::factory()->create();
    $path->courses()->sync([
        $existing->id => ['sort_order' => 1, 'is_required' => true],
    ]);

    $newCourse = Course::factory()->create();

    $this->actingAs($this->admin)
        ->post("/admin/learning-paths/{$path->id}/courses", [
            'course_id' => $newCourse->id,
            'is_required' => true,
        ])
        ->assertSessionHas('success');

    $row = DB::table('learning_path_courses')
        ->where('learning_path_id', $path->id)
        ->where('course_id', $newCourse->id)
        ->first();
    expect((int) $row->sort_order)->toBe(2);
    expect($path->fresh()->total_courses)->toBe(2);
});

it('returns info flash when attaching duplicate course', function () {
    $path = LearningPath::factory()->create();
    $course = Course::factory()->create();
    $path->courses()->sync([$course->id => ['sort_order' => 1, 'is_required' => true]]);

    $this->actingAs($this->admin)
        ->post("/admin/learning-paths/{$path->id}/courses", [
            'course_id' => $course->id,
            'is_required' => true,
        ])
        ->assertSessionHas('info');
});

it('detaches a course from the path', function () {
    $path = LearningPath::factory()->create();
    $course = Course::factory()->create();
    $path->courses()->sync([$course->id => ['sort_order' => 1, 'is_required' => true]]);
    $path->update(['total_courses' => 1]);

    $this->actingAs($this->admin)
        ->delete("/admin/learning-paths/{$path->id}/courses/{$course->id}")
        ->assertSessionHas('success');

    expect($path->fresh()->courses()->count())->toBe(0);
    expect($path->fresh()->total_courses)->toBe(0);
});

it('reorders courses according to course_ids array', function () {
    $path = LearningPath::factory()->create();
    $a = Course::factory()->create();
    $b = Course::factory()->create();
    $c = Course::factory()->create();
    $path->courses()->sync([
        $a->id => ['sort_order' => 1, 'is_required' => true],
        $b->id => ['sort_order' => 2, 'is_required' => true],
        $c->id => ['sort_order' => 3, 'is_required' => true],
    ]);

    $this->actingAs($this->admin)
        ->patch("/admin/learning-paths/{$path->id}/courses/reorder", [
            'course_ids' => [$c->id, $a->id, $b->id],
        ])
        ->assertSessionHas('success');

    $orders = DB::table('learning_path_courses')
        ->where('learning_path_id', $path->id)
        ->orderBy('sort_order')
        ->pluck('course_id')
        ->all();

    expect($orders)->toBe([$c->id, $a->id, $b->id]);
});

it('updates the path metadata', function () {
    $path = LearningPath::factory()->create([
        'title' => 'Old',
        'slug' => 'old',
        'duration_weeks' => 4,
    ]);

    $this->actingAs($this->admin)
        ->put("/admin/learning-paths/{$path->id}", [
            'title' => 'New Title',
            'slug' => 'new-slug',
            'level' => 'advanced',
            'duration_weeks' => 12,
            'is_published' => true,
        ])
        ->assertSessionHas('success');

    $fresh = $path->fresh();
    expect($fresh->title)->toBe('New Title');
    expect($fresh->slug)->toBe('new-slug');
    expect($fresh->duration_weeks)->toBe(12);
    expect($fresh->is_published)->toBeTrue();
    expect($fresh->published_at)->not->toBeNull();
});

it('deletes a path and redirects to index', function () {
    $path = LearningPath::factory()->create();

    $this->actingAs($this->admin)
        ->delete("/admin/learning-paths/{$path->id}")
        ->assertRedirect('/admin/learning-paths')
        ->assertSessionHas('success');

    expect(LearningPath::count())->toBe(0);
});
