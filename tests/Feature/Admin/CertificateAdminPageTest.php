<?php

use App\Models\CertificateTemplate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::findOrCreate('superadmin', 'web');
    Permission::findOrCreate('certificate.view', 'web');
    Role::findByName('superadmin', 'web')->givePermissionTo('certificate.view');

    $this->admin = User::factory()->create(['email_verified_at' => now()]);
    $this->admin->assignRole('superadmin');
});

it('shows the certificate page with builder templates inside the same menu', function () {
    CertificateTemplate::factory()->create([
        'name' => 'Sertifikat Course Default',
        'scope' => CertificateTemplate::SCOPE_COURSE,
        'status' => 'active',
    ]);

    $this->actingAs($this->admin)
        ->get('/admin/certificates')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/certificates/index')
            ->has('builderTemplates', 1)
            ->where('builderTemplates.0.name', 'Sertifikat Course Default')
        );
});

it('shows a dedicated create page for certificate templates', function () {
    $this->actingAs($this->admin)
        ->get('/admin/certificates/templates/create')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/certificates/template-form')
            ->where('template', null)
            ->has('backgroundPresets', 4)
            ->where('backgroundPresets.0.key', 'classic-blue')
        );
});

it('stores a certificate template with system preset background', function () {
    $this->actingAs($this->admin)
        ->post('/admin/certificates/templates', [
            'name' => 'Sertifikat Preset Modern',
            'scope' => 'course',
            'orientation' => 'landscape',
            'status' => 'draft',
            'background_type' => 'preset',
            'background_preset' => 'modern-aurora',
            'title' => 'Sertifikat Modern',
            'subtitle' => 'Preset modern bawaan sistem',
            'body_text' => 'Template cepat pakai dengan background bawaan.',
            'show_qr' => true,
            'show_signature' => true,
            'sort_order' => 5,
        ])
        ->assertRedirect();

    $template = CertificateTemplate::query()->where('name', 'Sertifikat Preset Modern')->first();

    expect($template)->not->toBeNull();
    expect($template->background_type)->toBe('preset');
    expect($template->background_preset)->toBe('modern-aurora');
    expect($template->background_path)->toBeNull();
});

it('stores a certificate template with uploaded custom image background', function () {
    Storage::fake('public');

    $this->actingAs($this->admin)
        ->post('/admin/certificates/templates', [
            'name' => 'Sertifikat Banking Batch 01',
            'scope' => 'corporate',
            'orientation' => 'portrait',
            'status' => 'active',
            'background_type' => 'upload',
            'background_preset' => '',
            'title' => 'Sertifikat Pelatihan Banking',
            'subtitle' => 'Diberikan kepada peserta terpilih',
            'body_text' => 'Template corporate untuk batch pelatihan internal.',
            'show_qr' => true,
            'show_signature' => false,
            'sort_order' => 7,
            'background' => UploadedFile::fake()->image('banking-template.png', 1600, 900),
        ])
        ->assertRedirect();

    $template = CertificateTemplate::query()->where('name', 'Sertifikat Banking Batch 01')->first();

    expect($template)->not->toBeNull();
    expect($template->scope)->toBe('corporate');
    expect($template->orientation)->toBe('portrait');
    expect($template->status)->toBe('active');
    expect($template->background_type)->toBe('upload');
    expect($template->background_preset)->toBeNull();
    expect($template->show_qr)->toBeTrue();
    expect($template->show_signature)->toBeFalse();
    expect($template->background_path)->not->toBeNull();

    Storage::disk('public')->assertExists($template->background_path);
});

it('forbids users without certificate.view from opening the certificate page', function () {
    $stranger = User::factory()->create(['email_verified_at' => now()]);

    $this->actingAs($stranger)
        ->get('/admin/certificates')
        ->assertForbidden();
});
