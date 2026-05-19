<?php

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Storage::fake('public');

    Role::findOrCreate('hr', 'web');
    Role::findOrCreate('admin_tenant', 'web');
    Role::findOrCreate('employee', 'web');

    $this->org = Organization::create([
        'name' => 'Acme Branding',
        'slug' => 'acme-branding',
        'contact_name' => 'HR',
        'contact_email' => 'hr@acme-branding.test',
        'seat_quota' => 10,
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

it('renders the branding page for HR with current tenant data', function () {
    $this->org->update([
        'display_name' => 'Acme Academy',
        'tagline' => 'Belajar bareng Acme',
        'brand_primary_color' => '#1E40AF',
    ]);

    $this->actingAs($this->hr)
        ->get('/admin/tenant-branding')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/tenant-branding/index')
            ->where('tenant.display_name', 'Acme Academy')
            ->where('tenant.tagline', 'Belajar bareng Acme')
            ->where('tenant.brand_primary_color', '#1E40AF')
        );
});

it('blocks non-admin users from the branding page', function () {
    $employee = User::factory()->create();
    $employee->assignRole('employee');

    $this->actingAs($employee)
        ->get('/admin/tenant-branding')
        ->assertForbidden();
});

it('updates branding fields and stores them', function () {
    $this->actingAs($this->hr)
        ->post('/admin/tenant-branding', [
            'display_name' => 'New Display',
            'tagline' => 'New Tagline',
            'brand_primary_color' => '#0EA5E9',
        ])
        ->assertSessionHas('success');

    $fresh = $this->org->fresh();
    expect($fresh->display_name)->toBe('New Display');
    expect($fresh->tagline)->toBe('New Tagline');
    expect($fresh->brand_primary_color)->toBe('#0EA5E9');
});

it('rejects invalid hex color', function () {
    $this->actingAs($this->hr)
        ->post('/admin/tenant-branding', [
            'brand_primary_color' => 'not-a-color',
        ])
        ->assertSessionHasErrors('brand_primary_color');
});

it('uploads and persists a logo file', function () {
    $file = UploadedFile::fake()->image('logo.png', 256, 256);

    $this->actingAs($this->hr)
        ->post('/admin/tenant-branding', [
            'logo' => $file,
        ])
        ->assertSessionHas('success');

    $fresh = $this->org->fresh();
    expect($fresh->logo_path)->not->toBeNull();
    Storage::disk('public')->assertExists($fresh->logo_path);
});

it('removes the logo when remove_logo flag is set', function () {
    Storage::disk('public')->put('organizations/1/old.png', 'fake');
    $this->org->update(['logo_path' => 'organizations/1/old.png']);

    $this->actingAs($this->hr)
        ->post('/admin/tenant-branding', [
            'remove_logo' => true,
        ])
        ->assertSessionHas('success');

    expect($this->org->fresh()->logo_path)->toBeNull();
    Storage::disk('public')->assertMissing('organizations/1/old.png');
});

it('exposes brand_primary_color in the Inertia tenant payload', function () {
    $this->org->update([
        'display_name' => 'My Brand',
        'tagline' => 'Tag',
        'brand_primary_color' => '#DC2626',
    ]);

    $this->actingAs($this->hr)
        ->get('/admin/tenant-branding')
        ->assertInertia(fn ($page) => $page
            ->where('tenant.brand_primary_color', '#DC2626')
            ->where('tenant.display_name', 'My Brand')
        );
});
