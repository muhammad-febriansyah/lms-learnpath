<?php

use App\Models\Setting;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    // Force production-like behaviour so Laravel doesn't show its debug page.
    config()->set('app.debug', false);

    Setting::factory()->create([
        'key' => 'site_name',
        'value' => 'Karivia',
        'type' => 'text',
        'is_public' => true,
    ]);
    Setting::factory()->create([
        'key' => 'site_logo',
        'value' => 'branding/site-logo.png',
        'type' => 'text',
        'is_public' => true,
    ]);

    Role::findOrCreate('superadmin', 'web');
    Role::findOrCreate('admin_tenant', 'web');
    Role::findOrCreate('employee', 'web');
    Role::findOrCreate('hr', 'web');
    Role::findOrCreate('instructor', 'web');
    Role::findOrCreate('user_public', 'web');
    $this->seed(RolePermissionSeeder::class);
});

it('renders the Inertia error page for an unknown route (404)', function () {
    $this->get('/this-route-does-not-exist')
        ->assertStatus(404)
        ->assertInertia(fn ($page) => $page
            ->component('errors/index')
            ->where('status', 404)
            ->where('site.site_name', 'Karivia')
            ->where('site.site_logo_url', '/storage/branding/site-logo.png')
        );
});

it('renders the Inertia error page for a 403 forbidden response', function () {
    $employee = User::factory()->create(['email_verified_at' => now()]);
    $employee->assignRole('employee');

    $this->actingAs($employee)
        ->get('/admin/audit-log')
        ->assertStatus(403)
        ->assertInertia(fn ($page) => $page
            ->component('errors/index')
            ->where('status', 403)
        );
});

it('does not hijack JSON / API requests', function () {
    $this->get('/this-route-does-not-exist', ['Accept' => 'application/json'])
        ->assertStatus(404)
        ->assertHeader('Content-Type', 'application/json');
});
