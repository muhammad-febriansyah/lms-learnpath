<?php

use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('super_admin', 'web');
    Permission::findOrCreate('certificate.view', 'web');
    Role::findByName('super_admin', 'web')->givePermissionTo('certificate.view');

    $this->admin = User::factory()->create(['email_verified_at' => now()]);
    $this->admin->assignRole('super_admin');
});

it('shows the certificate page with builder templates inside the same menu', function () {
    $this->actingAs($this->admin)
        ->get('/admin/certificates')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/certificates/index')
            ->has('builderTemplates', 3)
            ->where('builderTemplates.0.name', 'Sertifikat Course Default')
        );
});

it('forbids users without certificate.view from opening the certificate page', function () {
    $stranger = User::factory()->create(['email_verified_at' => now()]);

    $this->actingAs($stranger)
        ->get('/admin/certificates')
        ->assertForbidden();
});
