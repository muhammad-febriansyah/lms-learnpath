<?php

use App\Models\Certificate;
use App\Models\ChatMessage;
use App\Models\ChatThread;
use App\Models\Competency;
use App\Models\Course;
use App\Models\EmployeeProfile;
use App\Models\Enrollment;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Position;
use App\Models\SkillGap;
use App\Models\User;
use Carbon\CarbonInterface;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('hr', 'web');
    Role::findOrCreate('employee', 'web');

    $this->org = Organization::create([
        'name' => 'Acme',
        'slug' => 'acme-reports',
        'contact_name' => 'HR',
        'contact_email' => 'hr@acme.test',
        'seat_quota' => 50,
        'seats_used' => 0,
        'status' => 'active',
    ]);

    $this->hr = User::factory()->create(['email_verified_at' => now()]);
    $this->hr->assignRole('hr');
    OrganizationMember::create([
        'organization_id' => $this->org->id,
        'user_id' => $this->hr->id,
        'role' => 'admin',
        'joined_at' => now(),
    ]);
});

function orgEnroll(Organization $org, User $user, Course $course, string $status = 'active', ?CarbonInterface $enrolledAt = null): Enrollment
{
    OrganizationMember::firstOrCreate([
        'organization_id' => $org->id,
        'user_id' => $user->id,
    ], [
        'role' => 'learner',
        'joined_at' => now(),
    ]);

    return Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => $status,
        'enrolled_at' => $enrolledAt ?? now(),
        'completed_at' => $status === 'completed' ? ($enrolledAt ?? now()) : null,
    ]);
}

it('requires HR/admin role', function () {
    $student = User::factory()->create();
    $student->assignRole('employee');

    $this->actingAs($student)
        ->get('/business/reports')
        ->assertForbidden();
});

it('renders the reports page for HR with KPIs and default 30d range', function () {
    $member = User::factory()->create();
    $course = Course::factory()->create();
    orgEnroll($this->org, $member, $course, status: 'completed');

    $this->actingAs($this->hr)
        ->get('/business/reports')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('business/reports/index')
            ->where('filters.preset', '30d')
            ->where('kpis.total_enrollments', 1)
            ->where('kpis.completed_enrollments', 1)
            ->where('kpis.completion_rate', 100)
            ->has('weeklyTrend')
            ->has('topCourses', 1)
        );
});

it('excludes enrollments outside the date range', function () {
    $member = User::factory()->create();
    $course = Course::factory()->create();

    orgEnroll($this->org, $member, $course, enrolledAt: now()->subDays(100));

    $this->actingAs($this->hr)
        ->get('/business/reports?preset=7d')
        ->assertInertia(fn ($page) => $page
            ->where('kpis.total_enrollments', 0)
        );
});

it('aggregates per position', function () {
    $member = User::factory()->create();
    $course = Course::factory()->create();
    orgEnroll($this->org, $member, $course, status: 'completed');

    $position = Position::create([
        'name' => 'Account Officer',
        'level' => 'junior',
    ]);
    EmployeeProfile::create([
        'user_id' => $member->id,
        'position_id' => $position->id,
        'division' => 'Kredit',
    ]);

    $this->actingAs($this->hr)
        ->get('/business/reports')
        ->assertInertia(fn ($page) => $page
            ->has('positionBreakdown', 1)
            ->where('positionBreakdown.0.position', 'Account Officer')
            ->where('positionBreakdown.0.enrollments', 1)
            ->where('positionBreakdown.0.completion_rate', 100)
        );
});

it('returns a CSV export with member detail', function () {
    $member = User::factory()->create(['name' => 'Budi', 'email' => 'budi@test.local']);
    $course = Course::factory()->create();
    orgEnroll($this->org, $member, $course, status: 'completed');

    $response = $this->actingAs($this->hr)
        ->get('/business/reports/export.csv');

    $response->assertOk();
    expect($response->headers->get('Content-Type'))->toContain('text/csv');

    $body = $response->streamedContent();
    expect($body)->toContain('Nama,Email')
        ->and($body)->toContain('Budi')
        ->and($body)->toContain('budi@test.local');
});

it('isolates data between organizations', function () {
    $otherOrg = Organization::create([
        'name' => 'Other Org',
        'slug' => 'other-org',
        'contact_name' => 'X',
        'contact_email' => 'x@x.test',
        'seat_quota' => 50,
        'seats_used' => 0,
        'status' => 'active',
    ]);
    $otherMember = User::factory()->create();
    $otherCourse = Course::factory()->create();
    orgEnroll($otherOrg, $otherMember, $otherCourse);

    $this->actingAs($this->hr)
        ->get('/business/reports')
        ->assertInertia(fn ($page) => $page
            ->where('kpis.total_enrollments', 0)
        );
});

it('counts certificates issued in the period', function () {
    $member = User::factory()->create();
    $course = Course::factory()->create();
    OrganizationMember::create([
        'organization_id' => $this->org->id,
        'user_id' => $member->id,
        'role' => 'learner',
        'joined_at' => now(),
    ]);

    Certificate::create([
        'user_id' => $member->id,
        'course_id' => $course->id,
        'certificate_number' => 'C-001',
        'verification_code' => 'V-001',
        'issued_at' => now(),
        'status' => 'issued',
    ]);

    $this->actingAs($this->hr)
        ->get('/business/reports')
        ->assertInertia(fn ($page) => $page
            ->where('kpis.certificates_issued', 1)
        );
});

it('classifies enrollments by on-time / overdue / due-soon status', function () {
    $course = Course::factory()->create();

    // On-time completion: completed before due_at
    $u1 = User::factory()->create();
    OrganizationMember::create(['organization_id' => $this->org->id, 'user_id' => $u1->id, 'role' => 'learner', 'joined_at' => now()]);
    Enrollment::create([
        'user_id' => $u1->id, 'course_id' => $course->id,
        'status' => 'completed', 'enrolled_at' => now()->subDays(10),
        'completed_at' => now()->subDays(2),
        'due_at' => now()->subDay(),
    ]);

    // Overdue active: due_at < now, not completed
    $u2 = User::factory()->create();
    OrganizationMember::create(['organization_id' => $this->org->id, 'user_id' => $u2->id, 'role' => 'learner', 'joined_at' => now()]);
    $c2 = Course::factory()->create();
    Enrollment::create([
        'user_id' => $u2->id, 'course_id' => $c2->id,
        'status' => 'active', 'enrolled_at' => now()->subDays(15),
        'due_at' => now()->subDays(2),
    ]);

    // Due soon: due_at in 3 days
    $u3 = User::factory()->create();
    OrganizationMember::create(['organization_id' => $this->org->id, 'user_id' => $u3->id, 'role' => 'learner', 'joined_at' => now()]);
    $c3 = Course::factory()->create();
    Enrollment::create([
        'user_id' => $u3->id, 'course_id' => $c3->id,
        'status' => 'active', 'enrolled_at' => now()->subDay(),
        'due_at' => now()->addDays(3),
    ]);

    $this->actingAs($this->hr)
        ->get('/business/reports')
        ->assertInertia(fn ($page) => $page
            ->where('onTimeStatus.on_time_completed', 1)
            ->where('onTimeStatus.overdue_active', 1)
            ->where('onTimeStatus.due_soon_active', 1)
        );
});

it('aggregates per division', function () {
    $member = User::factory()->create();
    $course = Course::factory()->create();
    orgEnroll($this->org, $member, $course, status: 'completed');
    EmployeeProfile::create([
        'user_id' => $member->id,
        'division' => 'Sales',
    ]);

    $this->actingAs($this->hr)
        ->get('/business/reports')
        ->assertInertia(fn ($page) => $page
            ->has('divisionBreakdown', 1)
            ->where('divisionBreakdown.0.division', 'Sales')
            ->where('divisionBreakdown.0.completion_rate', 100)
        );
});

it('returns top skill gaps for the organization', function () {
    $member = User::factory()->create();
    OrganizationMember::create([
        'organization_id' => $this->org->id,
        'user_id' => $member->id, 'role' => 'learner', 'joined_at' => now(),
    ]);
    tenancy()->runWithTenant($this->org, function () use ($member) {
        $competency = Competency::create(['name' => 'Analisa Kredit', 'is_active' => true]);
        $position = Position::create(['name' => 'AO', 'is_active' => true]);

        SkillGap::create([
            'user_id' => $member->id,
            'position_id' => $position->id,
            'competency_id' => $competency->id,
            'target_level' => 5,
            'actual_level' => 2,
            'gap' => 3,
            'status' => 'open',
            'calculated_at' => now(),
        ]);
    });

    $this->actingAs($this->hr)
        ->get('/business/reports')
        ->assertInertia(fn ($page) => $page
            ->has('topSkillGaps', 1)
            ->where('topSkillGaps.0.competency', 'Analisa Kredit')
            ->where('topSkillGaps.0.affected_employees', 1)
            ->where('topSkillGaps.0.avg_gap', 3)
        );
});

it('counts AI Tutor threads and messages for org members in window', function () {
    $member = User::factory()->create();
    OrganizationMember::create([
        'organization_id' => $this->org->id,
        'user_id' => $member->id, 'role' => 'learner', 'joined_at' => now(),
    ]);

    $thread = ChatThread::create([
        'user_id' => $member->id,
        'title' => 'Tanya 5C',
        'last_message_at' => now(),
    ]);
    ChatMessage::create([
        'chat_thread_id' => $thread->id,
        'role' => 'user',
        'content' => 'Apa itu 5C?',
    ]);
    ChatMessage::create([
        'chat_thread_id' => $thread->id,
        'role' => 'assistant',
        'content' => 'Character...',
    ]);

    $this->actingAs($this->hr)
        ->get('/business/reports')
        ->assertInertia(fn ($page) => $page
            ->where('aiTutorUsage.threads', 1)
            ->where('aiTutorUsage.messages', 2)
            ->where('aiTutorUsage.active_users', 1)
        );
});
