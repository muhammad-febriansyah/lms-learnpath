<?php

use App\Models\AuditLog;
use App\Models\Course;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Event;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('superadmin', 'web');
    Role::findOrCreate('admin_tenant', 'web');
    Role::findOrCreate('hr', 'web');
    Role::findOrCreate('instructor', 'web');
    Role::findOrCreate('employee', 'web');

    // Re-seed permissions so audit.view exists on admin roles for nav permission.
    $this->seed(RolePermissionSeeder::class);

    $this->orgA = Organization::create([
        'name' => 'Tenant A',
        'slug' => 'tenant-a',
        'contact_name' => 'A',
        'contact_email' => 'a@a.test',
        'seat_quota' => 5,
        'seats_used' => 0,
        'status' => 'active',
    ]);

    $this->orgB = Organization::create([
        'name' => 'Tenant B',
        'slug' => 'tenant-b',
        'contact_name' => 'B',
        'contact_email' => 'b@b.test',
        'seat_quota' => 5,
        'seats_used' => 0,
        'status' => 'active',
    ]);

    $this->adminA = User::factory()->create(['email_verified_at' => now()]);
    $this->adminA->assignRole('admin_tenant');
    OrganizationMember::create([
        'organization_id' => $this->orgA->id,
        'user_id' => $this->adminA->id,
        'role' => 'admin',
        'joined_at' => now(),
    ]);

    $this->superadmin = User::factory()->create(['email_verified_at' => now()]);
    $this->superadmin->assignRole('superadmin');

    $this->employee = User::factory()->create(['email_verified_at' => now()]);
    $this->employee->assignRole('employee');
});

it('records auth.login when a Login event fires', function () {
    Event::dispatch(new Login('web', $this->adminA, false));

    $log = AuditLog::where('action', 'auth.login')->latest('id')->first();
    expect($log)->not->toBeNull();
    expect($log->user_id)->toBe($this->adminA->id);
});

it('records auth.failed with attempted email when a Failed event fires', function () {
    Event::dispatch(new Failed('web', null, ['email' => 'bad@example.test', 'password' => 'x']));

    $log = AuditLog::where('action', 'auth.failed')->latest('id')->first();
    expect($log)->not->toBeNull();
    expect($log->changes['email'] ?? null)->toBe('bad@example.test');
    expect($log->user_id)->toBeNull();
});

it('records course.published with title when a course is approved', function () {
    $course = Course::factory()->create([
        'instructor_id' => $this->adminA->id,
        'review_status' => Course::REVIEW_PENDING,
        'is_published' => false,
        'title' => 'Pelatihan K3',
    ]);

    $this->actingAs($this->superadmin)
        ->post("/admin/courses/{$course->id}/approve")
        ->assertSessionHas('success');

    $log = AuditLog::where('action', 'course.published')->latest('id')->first();
    expect($log)->not->toBeNull();
    expect($log->subject_id)->toBe($course->id);
    expect($log->changes['title'] ?? null)->toBe('Pelatihan K3');
    expect($log->user_id)->toBe($this->superadmin->id);
});

it('records course.rejected with notes when a course is rejected', function () {
    $course = Course::factory()->create([
        'instructor_id' => $this->adminA->id,
        'review_status' => Course::REVIEW_PENDING,
        'is_published' => false,
        'title' => 'Pelatihan K3',
    ]);

    $this->actingAs($this->superadmin)
        ->post("/admin/courses/{$course->id}/reject", [
            'review_notes' => 'Kurikulum belum lengkap, tolong perbaiki.',
        ])
        ->assertSessionHas('success');

    $log = AuditLog::where('action', 'course.rejected')->latest('id')->first();
    expect($log)->not->toBeNull();
    expect($log->changes['notes'] ?? null)->toContain('belum lengkap');
});

it('records course.deleted before the course row is removed', function () {
    $instructor = User::factory()->create(['email_verified_at' => now()]);
    $instructor->assignRole('instructor');

    $course = Course::factory()->create([
        'instructor_id' => $instructor->id,
        'review_status' => Course::REVIEW_DRAFT,
        'is_published' => false,
        'title' => 'Course To Delete',
    ]);

    $this->actingAs($instructor)
        ->delete("/admin/courses/{$course->id}")
        ->assertSessionHas('success');

    $log = AuditLog::where('action', 'course.deleted')->latest('id')->first();
    expect($log)->not->toBeNull();
    expect($log->subject_id)->toBe($course->id);
    expect($log->changes['title'] ?? null)->toBe('Course To Delete');
    expect(Course::find($course->id))->toBeNull();
});

it('records branding.updated with before/after diff', function () {
    $this->orgA->update([
        'display_name' => 'Old Name',
        'brand_primary_color' => '#111111',
    ]);

    $this->actingAs($this->adminA)
        ->post('/admin/tenant-branding', [
            'display_name' => 'New Name',
            'brand_primary_color' => '#22337D',
        ])
        ->assertSessionHas('success');

    $log = AuditLog::where('action', 'branding.updated')->latest('id')->first();
    expect($log)->not->toBeNull();
    expect($log->changes['before']['display_name'] ?? null)->toBe('Old Name');
    expect($log->changes['after']['display_name'] ?? null)->toBe('New Name');
    expect($log->changes['after']['brand_primary_color'] ?? null)->toBe('#22337D');
});

it('blocks employees from viewing the audit log page', function () {
    $this->actingAs($this->employee)
        ->get('/admin/audit-log')
        ->assertForbidden();
});

it('lets superadmin view the audit log page', function () {
    $this->actingAs($this->superadmin)
        ->get('/admin/audit-log')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/audit-log/index'));
});

it('scopes audit log to the current tenant for admin_tenant', function () {
    AuditLog::create([
        'tenant_id' => $this->orgA->id,
        'user_id' => $this->adminA->id,
        'action' => 'course.published',
        'subject_type' => null,
        'subject_id' => null,
        'changes' => ['title' => 'A only'],
        'ip' => '127.0.0.1',
        'user_agent' => 'test',
    ]);

    AuditLog::create([
        'tenant_id' => $this->orgB->id,
        'user_id' => null,
        'action' => 'course.published',
        'subject_type' => null,
        'subject_id' => null,
        'changes' => ['title' => 'B only'],
        'ip' => '127.0.0.1',
        'user_agent' => 'test',
    ]);

    $this->actingAs($this->adminA)
        ->get('/admin/audit-log')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/audit-log/index')
            ->where('logs.data', fn ($data) => collect($data)->every(
                fn ($row) => ($row['changes']['title'] ?? null) !== 'B only',
            ))
        );
});

it('lets superadmin see logs from all tenants', function () {
    AuditLog::create([
        'tenant_id' => $this->orgA->id,
        'user_id' => $this->adminA->id,
        'action' => 'course.published',
        'subject_type' => null,
        'subject_id' => null,
        'changes' => ['title' => 'from A'],
        'ip' => '127.0.0.1',
        'user_agent' => 'test',
    ]);

    AuditLog::create([
        'tenant_id' => $this->orgB->id,
        'user_id' => null,
        'action' => 'course.published',
        'subject_type' => null,
        'subject_id' => null,
        'changes' => ['title' => 'from B'],
        'ip' => '127.0.0.1',
        'user_agent' => 'test',
    ]);

    $this->actingAs($this->superadmin)
        ->get('/admin/audit-log')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/audit-log/index')
            ->where('logs.data', fn ($data) => collect($data)
                ->pluck('changes.title')
                ->intersect(['from A', 'from B'])
                ->count() === 2
            )
        );
});
