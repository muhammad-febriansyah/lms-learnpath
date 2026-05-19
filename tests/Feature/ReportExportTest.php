<?php

use App\Models\Assessment;
use App\Models\AssessmentAttempt;
use App\Models\AuditLog;
use App\Models\Certificate;
use App\Models\Competency;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Position;
use App\Models\SkillGap;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('superadmin', 'web');
    Role::findOrCreate('admin_tenant', 'web');
    Role::findOrCreate('hr', 'web');
    Role::findOrCreate('instructor', 'web');
    Role::findOrCreate('employee', 'web');

    $this->seed(RolePermissionSeeder::class);

    $this->admin = User::factory()->create(['email_verified_at' => now()]);
    $this->admin->assignRole('superadmin');

    $this->employee = User::factory()->create(['email_verified_at' => now()]);
    $this->employee->assignRole('employee');
});

it('exports course progress as a CSV with UTF-8 BOM and expected headers', function () {
    $course = Course::factory()->create(['title' => 'Pelatihan K3']);
    Enrollment::factory()->count(3)->create([
        'course_id' => $course->id,
        'enrolled_at' => now()->subDays(2),
        'progress_percent' => 50,
    ]);

    $response = $this->actingAs($this->admin)
        ->get('/admin/reports/course-progress/export.csv?from='.now()->subDays(7)->toDateString().'&to='.now()->toDateString());

    $response->assertOk();
    $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');

    $body = $response->streamedContent();
    expect(substr($body, 0, 3))->toBe("\xEF\xBB\xBF");
    expect($body)->toContain('Course ID');
    expect($body)->toContain('Judul Course');
    expect($body)->toContain('Pelatihan K3');
});

it('exports assessment report as CSV including pass rate', function () {
    $course = Course::factory()->create();
    $assessment = Assessment::factory()->create([
        'title' => 'Quiz Modul 1',
        'course_id' => $course->id,
        'passing_score' => 70,
    ]);

    foreach (range(1, 3) as $i) {
        AssessmentAttempt::factory()->create([
            'assessment_id' => $assessment->id,
            'course_id' => $course->id,
            'user_id' => $this->employee->id,
            'created_at' => now()->subDays(1),
            'submitted_at' => now()->subDays(1),
            'status' => 'submitted',
            'passed' => $i < 3,
            'score' => 80,
        ]);
    }

    $response = $this->actingAs($this->admin)
        ->get('/admin/reports/assessment/export.csv?from='.now()->subDays(7)->toDateString().'&to='.now()->toDateString());

    $response->assertOk();
    $body = $response->streamedContent();
    expect($body)->toContain('Quiz Modul 1');
    expect($body)->toContain('Pass Rate %');
});

it('exports certificate report as CSV', function () {
    $course = Course::factory()->create(['title' => 'Certified Course']);
    Certificate::factory()->count(2)->create([
        'course_id' => $course->id,
        'user_id' => $this->employee->id,
        'status' => 'active',
        'issued_at' => now()->subDays(1),
    ]);

    $response = $this->actingAs($this->admin)
        ->get('/admin/reports/certificate/export.csv?from='.now()->subDays(7)->toDateString().'&to='.now()->toDateString());

    $response->assertOk();
    expect($response->streamedContent())->toContain('Certified Course');
});

it('exports skill gap report as CSV', function () {
    $position = Position::create(['name' => 'Sales Rep', 'division' => 'Commercial', 'is_active' => true]);
    $competency = Competency::create(['name' => 'Negotiation', 'category' => 'Soft Skill']);
    SkillGap::create([
        'user_id' => $this->employee->id,
        'position_id' => $position->id,
        'competency_id' => $competency->id,
        'target_level' => 4,
        'gap' => 2,
        'status' => 'gap',
    ]);

    $response = $this->actingAs($this->admin)
        ->get('/admin/reports/skill-gap/export.csv');

    $response->assertOk();
    $body = $response->streamedContent();
    expect($body)->toContain('Sales Rep');
    expect($body)->toContain('Commercial');
});

it('exports sales report as CSV', function () {
    $course = Course::factory()->create(['title' => 'Paid Course']);

    $order = Order::factory()->create([
        'status' => 'paid',
        'paid_at' => now()->subDays(2),
        'total' => 500000,
    ]);
    OrderItem::create([
        'order_id' => $order->id,
        'purchasable_type' => Course::class,
        'purchasable_id' => $course->id,
        'name' => 'Paid Course',
        'quantity' => 1,
        'unit_price' => 500000,
        'subtotal' => 500000,
    ]);

    $response = $this->actingAs($this->admin)
        ->get('/admin/reports/sales/export.csv?from='.now()->subDays(7)->toDateString().'&to='.now()->toDateString());

    $response->assertOk();
    expect($response->streamedContent())->toContain('Paid Course');
});

it('blocks users without report.view from any admin report export', function () {
    foreach (['course-progress', 'assessment', 'certificate', 'skill-gap', 'sales'] as $slug) {
        $this->actingAs($this->employee)
            ->get("/admin/reports/{$slug}/export.csv")
            ->assertForbidden();
    }
});

it('exports filtered audit log to CSV', function () {
    AuditLog::create([
        'tenant_id' => null,
        'user_id' => $this->admin->id,
        'action' => 'auth.login',
        'subject_type' => null,
        'subject_id' => null,
        'changes' => ['note' => 'first'],
        'ip' => '127.0.0.1',
        'user_agent' => 'test-agent',
    ]);
    AuditLog::create([
        'tenant_id' => null,
        'user_id' => $this->admin->id,
        'action' => 'course.published',
        'subject_type' => 'Course',
        'subject_id' => 42,
        'changes' => ['title' => 'X'],
        'ip' => '127.0.0.1',
        'user_agent' => 'test-agent',
    ]);

    $response = $this->actingAs($this->admin)
        ->get('/admin/audit-log/export.csv?action=auth');

    $response->assertOk();
    $body = $response->streamedContent();
    expect($body)->toContain('auth.login');
    expect($body)->not->toContain('course.published');
});

it('blocks employees from exporting audit log', function () {
    $this->actingAs($this->employee)
        ->get('/admin/audit-log/export.csv')
        ->assertForbidden();
});

it('scopes audit log export to current tenant for admin_tenant', function () {
    $orgA = Organization::create([
        'name' => 'Tenant A', 'slug' => 'tenant-a',
        'contact_name' => 'A', 'contact_email' => 'a@a.test',
        'seat_quota' => 5, 'seats_used' => 0, 'status' => 'active',
    ]);
    $orgB = Organization::create([
        'name' => 'Tenant B', 'slug' => 'tenant-b',
        'contact_name' => 'B', 'contact_email' => 'b@b.test',
        'seat_quota' => 5, 'seats_used' => 0, 'status' => 'active',
    ]);

    $tenantAdmin = User::factory()->create(['email_verified_at' => now()]);
    $tenantAdmin->assignRole('admin_tenant');
    OrganizationMember::create([
        'organization_id' => $orgA->id,
        'user_id' => $tenantAdmin->id,
        'role' => 'admin',
        'joined_at' => now(),
    ]);

    AuditLog::create([
        'tenant_id' => $orgA->id, 'user_id' => null,
        'action' => 'branding.updated',
        'changes' => ['title' => 'A only'],
        'ip' => '127.0.0.1', 'user_agent' => 'test',
    ]);
    AuditLog::create([
        'tenant_id' => $orgB->id, 'user_id' => null,
        'action' => 'branding.updated',
        'changes' => ['title' => 'B only'],
        'ip' => '127.0.0.1', 'user_agent' => 'test',
    ]);

    $body = $this->actingAs($tenantAdmin)
        ->get('/admin/audit-log/export.csv')
        ->streamedContent();

    expect($body)->toContain('A only');
    expect($body)->not->toContain('B only');
});
