<?php

use App\Models\EmployeeProfile;
use App\Models\Organization;
use App\Models\OrganizationInvitation;
use App\Models\OrganizationMember;
use App\Models\Position;
use App\Models\User;
use Illuminate\Http\UploadedFile;
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
        'slug' => 'acme',
        'contact_name' => 'HR Acme',
        'contact_email' => 'hr@acme.test',
        'seat_quota' => 50,
        'seats_used' => 0,
        'status' => 'active',
    ]);

    tenancy()->runWithTenant($this->org, function () {
        Position::create(['name' => 'HR Officer', 'is_active' => true]);
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

it('creates invitations and dispatches mailketing email when HR pastes emails', function () {
    $position = Position::first();

    $this->actingAs($this->hr)->post(route('business.invitations.store'), [
        'emails' => 'first@acme.test, second@acme.test',
        'position_id' => $position->id,
        'division' => 'Engineering',
    ])->assertSessionHas('success');

    expect(OrganizationInvitation::count())->toBe(2);
    expect(OrganizationInvitation::where('email', 'first@acme.test')->first()->position_id)
        ->toBe($position->id);
    expect(OrganizationInvitation::where('email', 'first@acme.test')->first()->last_sent_at)
        ->not->toBeNull();

    Http::assertSentCount(2);
    Http::assertSent(fn ($request) => str_contains($request->url(), 'app.mailketing.co.id/api/v1/send'));
});

it('resends an invitation email and updates last_sent_at', function () {
    $invitation = OrganizationInvitation::create([
        'organization_id' => $this->org->id,
        'invited_by_user_id' => $this->hr->id,
        'email' => 'reminder@acme.test',
        'role' => 'learner',
    ]);

    $this->actingAs($this->hr)
        ->post(route('business.invitations.resend', ['invitation' => $invitation->id]))
        ->assertSessionHas('success');

    expect($invitation->fresh()->last_sent_at)->not->toBeNull();
    Http::assertSentCount(1);
});

it('parses a CSV bulk upload and creates invitations per row', function () {
    tenancy()->runWithTenant($this->org, function () {
        Position::create(['name' => 'Sales Rep', 'is_active' => true]);
    });

    $csv = "name,email,employee_number,position,division,branch\n"
        ."Andi Sales,andi@acme.test,A001,Sales Rep,Sales,Jakarta\n"
        ."Budi Tech,budi@acme.test,B002,HR Officer,HR,Bandung\n";

    $file = UploadedFile::fake()->createWithContent('karyawan.csv', $csv);

    $this->actingAs($this->hr)
        ->post(route('business.invitations.bulk-upload'), ['file' => $file])
        ->assertSessionHas('success');

    expect(OrganizationInvitation::count())->toBe(2);
    $andi = OrganizationInvitation::where('email', 'andi@acme.test')->first();
    expect($andi->name)->toBe('Andi Sales');
    expect($andi->employee_number)->toBe('A001');
    expect($andi->division)->toBe('Sales');
    expect($andi->position->name)->toBe('Sales Rep');

    Http::assertSentCount(2);
});

it('directly creates a user and sends a temp password email', function () {
    $position = Position::first();

    $this->actingAs($this->hr)
        ->post(route('business.members.direct-create'), [
            'name' => 'Citra Karyawan',
            'email' => 'citra@acme.test',
            'phone' => '081234567890',
            'position_id' => $position->id,
            'employee_number' => 'C003',
            'division' => 'HR',
            'branch' => 'HQ',
        ])
        ->assertSessionHas('success');

    $user = User::where('email', 'citra@acme.test')->first();
    expect($user)->not->toBeNull();
    expect($user->hasRole('employee'))->toBeTrue();

    expect(OrganizationMember::where('user_id', $user->id)->where('organization_id', $this->org->id)->exists())->toBeTrue();
    expect(EmployeeProfile::where('user_id', $user->id)->first()->position_id)->toBe($position->id);

    expect($this->org->fresh()->seats_used)->toBe(1);

    Http::assertSentCount(1);
});

it('blocks HR from direct-creating a user that already exists', function () {
    User::factory()->create(['email' => 'exists@acme.test']);

    $this->actingAs($this->hr)
        ->post(route('business.members.direct-create'), [
            'name' => 'Already Exists',
            'email' => 'exists@acme.test',
        ])
        ->assertSessionHasErrors('email');
});

it('creates EmployeeProfile when invitation with position is accepted', function () {
    $position = Position::first();

    $invitation = OrganizationInvitation::create([
        'organization_id' => $this->org->id,
        'invited_by_user_id' => $this->hr->id,
        'email' => 'new@acme.test',
        'role' => 'learner',
        'position_id' => $position->id,
        'division' => 'HR',
    ]);

    $this->post(route('business.invitations.accept', ['token' => $invitation->token]), [
        'name' => 'New Karyawan',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ])->assertRedirect('/dashboard');

    $user = User::where('email', 'new@acme.test')->first();
    expect($user)->not->toBeNull();
    expect(EmployeeProfile::where('user_id', $user->id)->first()->position_id)
        ->toBe($position->id);
});
