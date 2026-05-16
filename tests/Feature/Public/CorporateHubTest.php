<?php

use App\Models\Category;
use App\Models\Course;

it('renders the corporate hub page with curated categories', function () {
    Category::factory()->create(['name' => 'Leadership', 'slug' => 'leadership', 'is_active' => true]);
    Category::factory()->create(['name' => 'Compliance', 'slug' => 'compliance', 'is_active' => true]);

    $leadershipCategory = Category::where('slug', 'leadership')->first();
    Course::factory()->create([
        'category_id' => $leadershipCategory->id,
        'is_published' => true,
    ]);

    $response = $this->get('/corporate');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/corporate')
        ->has('categories')
        ->has('courses')
        ->has('stats')
        ->where('stats.total_courses', 1)
    );
});

it('filters courses by the selected category tab', function () {
    Category::factory()->create(['name' => 'Leadership', 'slug' => 'leadership', 'is_active' => true]);
    Category::factory()->create(['name' => 'Compliance', 'slug' => 'compliance', 'is_active' => true]);

    $leadership = Category::where('slug', 'leadership')->first();
    $compliance = Category::where('slug', 'compliance')->first();

    Course::factory()->count(2)->create([
        'category_id' => $leadership->id,
        'is_published' => true,
    ]);
    Course::factory()->create([
        'category_id' => $compliance->id,
        'is_published' => true,
    ]);

    $response = $this->get('/corporate?category=compliance');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('activeSlug', 'compliance')
        ->has('courses', 1)
    );
});

it('falls back to all active categories when no curated ones exist', function () {
    Category::factory()->create([
        'name' => 'Custom Domain',
        'slug' => 'custom-domain',
        'is_active' => true,
    ]);
    $custom = Category::where('slug', 'custom-domain')->first();
    Course::factory()->create([
        'category_id' => $custom->id,
        'is_published' => true,
    ]);

    $response = $this->get('/corporate');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('activeSlug', 'custom-domain')
        ->has('categories', 1)
    );
});

it('only counts published courses in the corporate hub', function () {
    Category::factory()->create(['name' => 'Leadership', 'slug' => 'leadership', 'is_active' => true]);
    $leadership = Category::where('slug', 'leadership')->first();

    Course::factory()->create([
        'category_id' => $leadership->id,
        'is_published' => true,
    ]);
    Course::factory()->draft()->create([
        'category_id' => $leadership->id,
    ]);

    $response = $this->get('/corporate');

    $response->assertInertia(fn ($page) => $page
        ->where('stats.total_courses', 1)
        ->has('courses', 1)
    );
});
