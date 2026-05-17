<?php

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::findOrCreate('superadmin', 'web');
    Permission::findOrCreate('settings.view', 'web');
    Permission::findOrCreate('settings.update', 'web');
    Role::findByName('superadmin', 'web')->givePermissionTo([
        'settings.view',
        'settings.update',
    ]);

    $this->admin = User::factory()->create(['email_verified_at' => now()]);
    $this->admin->assignRole('superadmin');

    Setting::query()->create([
        'key' => 'legal_terms_title',
        'value' => 'Syarat & Ketentuan Lama',
        'type' => 'text',
        'group' => 'legal',
        'label' => 'Judul Syarat & Ketentuan',
        'is_public' => false,
        'sort_order' => 4,
    ]);

    Setting::query()->create([
        'key' => 'legal_terms_content',
        'value' => '<p>Konten lama syarat.</p>',
        'type' => 'textarea',
        'group' => 'legal',
        'label' => 'Isi Syarat & Ketentuan',
        'is_public' => false,
        'sort_order' => 5,
    ]);

    Setting::query()->create([
        'key' => 'legal_privacy_title',
        'value' => 'Kebijakan Privasi Lama',
        'type' => 'text',
        'group' => 'legal',
        'label' => 'Judul Kebijakan Privasi',
        'is_public' => false,
        'sort_order' => 6,
    ]);

    Setting::query()->create([
        'key' => 'legal_privacy_content',
        'value' => '<p>Konten lama privasi.</p>',
        'type' => 'textarea',
        'group' => 'legal',
        'label' => 'Isi Kebijakan Privasi',
        'is_public' => false,
        'sort_order' => 7,
    ]);
});

it('shows the terms and conditions editor page', function () {
    $this->actingAs($this->admin)
        ->get('/admin/settings/legal/terms')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/settings/legal-document-form')
            ->where('document.type', 'terms')
            ->where('document.label', 'Syarat & Ketentuan')
            ->where('document.title', 'Syarat & Ketentuan Lama')
        );
});

it('shows the privacy policy editor page', function () {
    $this->actingAs($this->admin)
        ->get('/admin/settings/legal/privacy')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/settings/legal-document-form')
            ->where('document.type', 'privacy')
            ->where('document.label', 'Kebijakan Privasi')
            ->where('document.title', 'Kebijakan Privasi Lama')
        );
});

it('updates the terms and conditions rich content', function () {
    $html = '<h2>Ketentuan Umum</h2><p>Pengguna wajib menjaga kerahasiaan akun.</p><ul><li>Dilarang menyalahgunakan sistem.</li><li>Dilarang membagikan materi tanpa izin.</li></ul>';

    $this->actingAs($this->admin)
        ->post('/admin/settings/legal/terms', [
            'title' => 'Syarat & Ketentuan Baru',
            'content' => $html,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(Setting::query()->where('key', 'legal_terms_title')->value('value'))
        ->toBe('Syarat & Ketentuan Baru');
    expect(Setting::query()->where('key', 'legal_terms_content')->value('value'))
        ->toBe($html);
});
