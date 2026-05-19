<?php

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\User;
use App\Notifications\TrainingAssigned;
use App\Services\Business\BulkEnrollmentService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Notification;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('employee', 'web');
    Role::findOrCreate('hr', 'web');

    $this->org = Organization::create([
        'name' => 'Acme Enroll',
        'slug' => 'acme-enroll',
        'contact_name' => 'HR',
        'contact_email' => 'hr@acme-enroll.test',
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

    $this->course = Course::factory()->create([
        'is_published' => true,
        'title' => 'Onboarding 2026',
        'total_students' => 0,
    ]);

    $this->employees = collect(range(1, 3))->map(function (int $i) {
        $u = User::factory()->create([
            'name' => "Karyawan {$i}",
            'email_verified_at' => now(),
        ]);
        $u->assignRole('employee');

        return $u;
    });
});

it('returns preview rows with will_enroll vs already_enrolled status', function () {
    Enrollment::create([
        'user_id' => $this->employees[0]->id,
        'course_id' => $this->course->id,
        'status' => 'active',
        'progress_percent' => 0,
        'pre_test_status' => 'not_started',
        'post_test_status' => 'not_started',
        'certificate_status' => 'not_issued',
        'enrolled_at' => now(),
    ]);

    $result = app(BulkEnrollmentService::class)->previewForCourse(
        $this->course,
        $this->employees->pluck('id')->all(),
    );

    expect($result['summary']['total'])->toBe(3);
    expect($result['summary']['will_enroll'])->toBe(2);
    expect($result['summary']['already_enrolled'])->toBe(1);

    $byEmail = collect($result['rows'])->keyBy('email');
    expect($byEmail[$this->employees[0]->email]['status'])->toBe('already_enrolled');
    expect($byEmail[$this->employees[1]->email]['status'])->toBe('will_enroll');
});

it('commits only non-enrolled users and stores due_at + assigned_by', function () {
    Notification::fake();

    $due = Carbon::parse('2026-12-31')->endOfDay();
    $result = app(BulkEnrollmentService::class)->commitForCourse(
        course: $this->course,
        userIds: $this->employees->pluck('id')->all(),
        dueAt: $due,
        assignedBy: $this->hr,
    );

    expect($result['enrolled'])->toBe(3);
    expect($result['skipped'])->toBe(0);

    $enrollments = Enrollment::where('course_id', $this->course->id)->get();
    expect($enrollments)->toHaveCount(3);
    expect($enrollments->first()->due_at?->toDateString())->toBe('2026-12-31');
    expect($enrollments->first()->assigned_by_user_id)->toBe($this->hr->id);

    Notification::assertSentTo($this->employees, TrainingAssigned::class);
});

it('is idempotent — second commit enrolls nobody', function () {
    Notification::fake();

    $svc = app(BulkEnrollmentService::class);
    $svc->commitForCourse($this->course, $this->employees->pluck('id')->all(), assignedBy: $this->hr);
    $second = $svc->commitForCourse($this->course, $this->employees->pluck('id')->all(), assignedBy: $this->hr);

    expect($second['enrolled'])->toBe(0);
    expect($second['skipped'])->toBe(3);
    expect(Enrollment::where('course_id', $this->course->id)->count())->toBe(3);
});

it('exposes a 2-step preview/commit HTTP flow for HR', function () {
    Notification::fake();

    $preview = $this->actingAs($this->hr)
        ->post(route('admin.enrollments.assign.preview'), [
            'course_id' => $this->course->id,
            'user_ids' => $this->employees->pluck('id')->all(),
            'due_date' => '2026-12-31',
        ])
        ->assertSessionHas('assign_preview');

    $token = session('assign_preview')['token'];

    $this->actingAs($this->hr)
        ->post(route('admin.enrollments.assign.commit'), ['token' => $token])
        ->assertRedirect(route('admin.enrollments.index'))
        ->assertSessionHas('success');

    expect(Enrollment::where('course_id', $this->course->id)->count())->toBe(3);
});

it('blocks non-HR/non-admin users from the assign endpoints', function () {
    $randomUser = User::factory()->create();
    $randomUser->assignRole('employee');

    $this->actingAs($randomUser)
        ->get(route('admin.enrollments.assign'))
        ->assertForbidden();

    $this->actingAs($randomUser)
        ->post(route('admin.enrollments.assign.preview'), [
            'course_id' => $this->course->id,
            'user_ids' => [$this->employees->first()->id],
        ])
        ->assertForbidden();
});

it('rejects commit with invalid token', function () {
    $this->actingAs($this->hr)
        ->post(route('admin.enrollments.assign.commit'), ['token' => 'does-not-exist'])
        ->assertSessionHasErrors('token');

    expect(Enrollment::count())->toBe(0);
});
