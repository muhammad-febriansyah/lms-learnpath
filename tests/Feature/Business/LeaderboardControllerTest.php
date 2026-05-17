<?php

use App\Models\Enrollment;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('hr', 'web');
    Role::findOrCreate('employee', 'web');

    $this->org = Organization::create([
        'name' => 'Acme',
        'slug' => 'acme-leaderboard-ctrl',
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

it('renders the leaderboard for HR with entries', function () {
    $learner = User::factory()->create();
    OrganizationMember::create([
        'organization_id' => $this->org->id,
        'user_id' => $learner->id,
        'role' => 'learner',
        'joined_at' => now(),
    ]);
    Enrollment::factory()->count(2)->create([
        'user_id' => $learner->id,
        'status' => 'completed',
    ]);

    $this->actingAs($this->hr)
        ->get('/business/leaderboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('business/leaderboard')
            ->where('organization.name', 'Acme')
            ->has('entries', 2)
            ->where('scoring.per_course', 10)
            ->where('scoring.per_badge', 25)
        );
});

it('forbids users that are not org admins', function () {
    $stranger = User::factory()->create(['email_verified_at' => now()]);
    $stranger->assignRole('employee');

    $this->actingAs($stranger)
        ->get('/business/leaderboard')
        ->assertForbidden();
});

it('includes topMembers on the business dashboard', function () {
    $a = User::factory()->create();
    $b = User::factory()->create();
    OrganizationMember::create([
        'organization_id' => $this->org->id,
        'user_id' => $a->id,
        'role' => 'learner',
        'joined_at' => now(),
    ]);
    OrganizationMember::create([
        'organization_id' => $this->org->id,
        'user_id' => $b->id,
        'role' => 'learner',
        'joined_at' => now(),
    ]);
    Enrollment::factory()->count(3)->create(['user_id' => $a->id, 'status' => 'completed']);
    Enrollment::factory()->create(['user_id' => $b->id, 'status' => 'completed']);

    $this->actingAs($this->hr)
        ->get('/business/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('business/dashboard')
            ->has('topMembers')
            ->where('topMembers.0.user.id', $a->id)
            ->where('topMembers.1.user.id', $b->id)
        );
});
