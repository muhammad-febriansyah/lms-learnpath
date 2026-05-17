<?php

use App\Models\Competency;
use App\Models\Course;
use App\Models\CourseCompetencyMapping;
use App\Models\Enrollment;
use App\Models\LearningPath;
use App\Models\LearningPathEnrollment;
use App\Models\Organization;
use App\Models\OrganizationInvitation;
use App\Models\OrganizationMember;
use App\Models\Position;
use App\Models\PositionCompetencyTarget;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Http::fake([
        'app.mailketing.co.id/*' => Http::response(['status' => 'success'], 200),
    ]);
    config()->set('services.mailketing.api_key', 'test-key');
    Role::findOrCreate('employee', 'web');
    Role::findOrCreate('hr', 'web');

    $this->org = Organization::create([
        'name' => 'Acme Indonesia',
        'slug' => 'acme-auto',
        'contact_name' => 'HR Acme',
        'contact_email' => 'hr@acme.test',
        'seat_quota' => 50,
        'seats_used' => 0,
        'status' => 'active',
    ]);

    tenancy()->runWithTenant($this->org, function () {
        $this->position = Position::factory()->create();
        $this->competency = Competency::factory()->create();
        PositionCompetencyTarget::factory()->create([
            'position_id' => $this->position->id,
            'competency_id' => $this->competency->id,
            'is_required' => true,
        ]);

        $this->mappedCourse = Course::factory()->create();
        CourseCompetencyMapping::factory()->create([
            'course_id' => $this->mappedCourse->id,
            'competency_id' => $this->competency->id,
        ]);
    });

    $this->hr = User::factory()->create(['email_verified_at' => now()]);
    $this->hr->assignRole('hr');
    OrganizationMember::create([
        'organization_id' => $this->org->id,
        'user_id' => $this->hr->id,
        'role' => 'admin',
        'joined_at' => now(),
    ]);
});

it('auto-enrolls user to mapped courses when invitation with position is accepted', function () {
    $invitation = OrganizationInvitation::create([
        'organization_id' => $this->org->id,
        'invited_by_user_id' => $this->hr->id,
        'email' => 'new-hire@acme.test',
        'role' => 'learner',
        'position_id' => $this->position->id,
    ]);

    $this->post(route('business.invitations.accept', ['token' => $invitation->token]), [
        'name' => 'New Hire',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ])->assertRedirect('/dashboard');

    $user = User::where('email', 'new-hire@acme.test')->first();

    expect($user)->not->toBeNull();
    expect(Enrollment::where('user_id', $user->id)->count())->toBe(1);
    expect(Enrollment::where('user_id', $user->id)->first()->course_id)
        ->toBe($this->mappedCourse->id);
});

it('does not auto-enroll when invitation has no position', function () {
    $invitation = OrganizationInvitation::create([
        'organization_id' => $this->org->id,
        'invited_by_user_id' => $this->hr->id,
        'email' => 'no-position@acme.test',
        'role' => 'learner',
    ]);

    $this->post(route('business.invitations.accept', ['token' => $invitation->token]), [
        'name' => 'No Position',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ])->assertRedirect('/dashboard');

    $user = User::where('email', 'no-position@acme.test')->first();
    expect(Enrollment::where('user_id', $user->id)->count())->toBe(0);
});

it('auto-enrolls when HR direct-creates a user with a position', function () {
    $this->actingAs($this->hr)
        ->post(route('business.members.direct-create'), [
            'name' => 'Direct Created',
            'email' => 'direct@acme.test',
            'position_id' => $this->position->id,
        ])
        ->assertSessionHas('success');

    $user = User::where('email', 'direct@acme.test')->first();

    expect(Enrollment::where('user_id', $user->id)->count())->toBe(1);
});

it('exposes a re-sync endpoint that enrolls into newly-mapped courses', function () {
    $invitation = OrganizationInvitation::create([
        'organization_id' => $this->org->id,
        'invited_by_user_id' => $this->hr->id,
        'email' => 'employee@acme.test',
        'role' => 'learner',
        'position_id' => $this->position->id,
    ]);
    $this->post(route('business.invitations.accept', ['token' => $invitation->token]), [
        'name' => 'Employee',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $user = User::where('email', 'employee@acme.test')->first();
    $member = OrganizationMember::where('user_id', $user->id)->first();
    expect(Enrollment::where('user_id', $user->id)->count())->toBe(1);

    tenancy()->runWithTenant($this->org, function () {
        $newCourse = Course::factory()->create();
        CourseCompetencyMapping::factory()->create([
            'course_id' => $newCourse->id,
            'competency_id' => $this->competency->id,
        ]);
    });

    $this->actingAs($this->hr)
        ->post(route('business.members.resync-enrollments', ['member' => $member->id]))
        ->assertSessionHas('success');

    expect(Enrollment::where('user_id', $user->id)->count())->toBe(2);
});

it('auto-enrolls into linked learning paths when invitation accepted', function () {
    $path = tenancy()->runWithTenant($this->org, function () {
        $path = LearningPath::factory()->create(['position_id' => $this->position->id]);
        $pathCourse = Course::factory()->create();
        $path->courses()->sync([$pathCourse->id => ['sort_order' => 1, 'is_required' => true]]);

        return $path;
    });

    $invitation = OrganizationInvitation::create([
        'organization_id' => $this->org->id,
        'invited_by_user_id' => $this->hr->id,
        'email' => 'pathuser@acme.test',
        'role' => 'learner',
        'position_id' => $this->position->id,
    ]);

    $this->post(route('business.invitations.accept', ['token' => $invitation->token]), [
        'name' => 'Path User',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ])->assertRedirect('/dashboard');

    $user = User::where('email', 'pathuser@acme.test')->first();

    expect(LearningPathEnrollment::where('user_id', $user->id)->count())->toBe(1);
    expect(LearningPathEnrollment::where('user_id', $user->id)->first()->learning_path_id)
        ->toBe($path->id);
    // 1 from competency mapping + 1 from path's child enrollment
    expect(Enrollment::where('user_id', $user->id)->count())->toBe(2);
});

it('resync endpoint enrolls into newly-linked paths', function () {
    $invitation = OrganizationInvitation::create([
        'organization_id' => $this->org->id,
        'invited_by_user_id' => $this->hr->id,
        'email' => 'employee2@acme.test',
        'role' => 'learner',
        'position_id' => $this->position->id,
    ]);
    $this->post(route('business.invitations.accept', ['token' => $invitation->token]), [
        'name' => 'Employee 2',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $user = User::where('email', 'employee2@acme.test')->first();
    $member = OrganizationMember::where('user_id', $user->id)->first();
    expect(LearningPathEnrollment::where('user_id', $user->id)->count())->toBe(0);

    tenancy()->runWithTenant($this->org, function () {
        $path = LearningPath::factory()->create(['position_id' => $this->position->id]);
        $newCourse = Course::factory()->create();
        $path->courses()->sync([$newCourse->id => ['sort_order' => 1, 'is_required' => true]]);
    });

    $this->actingAs($this->hr)
        ->post(route('business.members.resync-enrollments', ['member' => $member->id]))
        ->assertSessionHas('success');

    expect(LearningPathEnrollment::where('user_id', $user->id)->count())->toBe(1);
});

it('re-sync returns info flash when member has no position', function () {
    $randomUser = User::factory()->create(['email_verified_at' => now()]);
    $member = OrganizationMember::create([
        'organization_id' => $this->org->id,
        'user_id' => $randomUser->id,
        'role' => 'learner',
        'joined_at' => now(),
    ]);

    $this->actingAs($this->hr)
        ->post(route('business.members.resync-enrollments', ['member' => $member->id]))
        ->assertSessionHas('info');

    expect(Enrollment::where('user_id', $randomUser->id)->count())->toBe(0);
});
