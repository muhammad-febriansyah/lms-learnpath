<?php

use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Setting::query()->create([
        'key' => 'site_name',
        'value' => 'LearnPath',
        'type' => 'text',
        'group' => 'general',
        'label' => 'Nama Website',
        'is_public' => true,
        'sort_order' => 1,
    ]);

    Setting::query()->create([
        'key' => 'site_description',
        'value' => 'Platform LMS untuk pelatihan karyawan, sertifikasi digital, dan pengembangan kompetensi.',
        'type' => 'textarea',
        'group' => 'general',
        'label' => 'Deskripsi Website',
        'is_public' => true,
        'sort_order' => 2,
    ]);

    Setting::query()->create([
        'key' => 'site_favicon',
        'value' => 'https://cdn.example.com/brand/favicon-learnpath.png',
        'type' => 'image',
        'group' => 'general',
        'label' => 'Favicon',
        'is_public' => true,
        'sort_order' => 3,
    ]);

    Setting::query()->create([
        'key' => 'site_logo',
        'value' => 'https://cdn.example.com/brand/logo-learnpath.png',
        'type' => 'image',
        'group' => 'general',
        'label' => 'Logo',
        'is_public' => true,
        'sort_order' => 4,
    ]);

    Setting::query()->create([
        'key' => 'seo_meta_title',
        'value' => 'LearnPath | LMS, Kursus Online, Sertifikasi, dan Corporate Training',
        'type' => 'text',
        'group' => 'seo',
        'label' => 'Meta Title',
        'is_public' => true,
        'sort_order' => 1,
    ]);

    Setting::query()->create([
        'key' => 'seo_meta_description',
        'value' => 'Kelola pembelajaran digital dengan LMS modern untuk training perusahaan, kursus online, dan sertifikasi digital.',
        'type' => 'textarea',
        'group' => 'seo',
        'label' => 'Meta Description',
        'is_public' => true,
        'sort_order' => 2,
    ]);

    Setting::query()->create([
        'key' => 'seo_meta_keywords',
        'value' => 'lms indonesia, kursus online, corporate training, sertifikasi digital, learning path',
        'type' => 'text',
        'group' => 'seo',
        'label' => 'Meta Keywords',
        'is_public' => true,
        'sort_order' => 3,
    ]);

    Setting::query()->create([
        'key' => 'seo_og_image',
        'value' => 'https://cdn.example.com/brand/og-learnpath.jpg',
        'type' => 'image',
        'group' => 'seo',
        'label' => 'Open Graph Image',
        'is_public' => true,
        'sort_order' => 4,
    ]);
});

it('renders seo-friendly metadata from settings on the root inertia view', function () {
    $response = $this->get('/login');

    $response->assertOk();
    $response->assertSee('<meta name="application-name" content="LearnPath">', false);
    $response->assertSee('<meta name="description" content="Kelola pembelajaran digital dengan LMS modern untuk training perusahaan, kursus online, dan sertifikasi digital.">', false);
    $response->assertSee('<meta name="keywords" content="lms indonesia, kursus online, corporate training, sertifikasi digital, learning path">', false);
    $response->assertSee('<meta property="og:site_name" content="LearnPath">', false);
    $response->assertSee('<meta property="og:title" content="LearnPath | LMS, Kursus Online, Sertifikasi, dan Corporate Training">', false);
    $response->assertSee('<meta property="og:image" content="https://cdn.example.com/brand/og-learnpath.jpg">', false);
    $response->assertSee('<meta name="twitter:image" content="https://cdn.example.com/brand/og-learnpath.jpg">', false);
    $response->assertSee('<link rel="icon" href="https://cdn.example.com/brand/favicon-learnpath.png" sizes="any">', false);
    $response->assertSee('<link rel="apple-touch-icon" href="https://cdn.example.com/brand/logo-learnpath.png">', false);
});

it('shares computed site asset urls with inertia pages', function () {
    $this->get('/login')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('auth/login')
            ->where('site.site_name', 'LearnPath')
            ->where('site.site_favicon', 'https://cdn.example.com/brand/favicon-learnpath.png')
            ->where('site.site_favicon_url', 'https://cdn.example.com/brand/favicon-learnpath.png')
            ->where('site.seo_og_image_url', 'https://cdn.example.com/brand/og-learnpath.jpg')
        );
});
