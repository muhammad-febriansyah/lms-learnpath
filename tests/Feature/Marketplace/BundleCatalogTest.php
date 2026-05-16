<?php

use App\Models\Bundle;
use App\Models\Course;

it('lists published bundles on the public catalog', function () {
    $published = Bundle::factory()->create(['title' => 'Paket Dasar']);
    $published->courses()->attach(Course::factory()->create()->id, ['sort_order' => 0]);

    Bundle::factory()->unpublished()->create(['title' => 'Draft Paket']);

    $response = $this->get(route('bundles.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/bundles/index')
        ->where('bundles.total', 1)
        ->where('bundles.data.0.title', 'Paket Dasar')
    );
});

it('shows bundle detail with courses and computed savings', function () {
    $bundle = Bundle::factory()->create([
        'slug' => 'paket-mantap',
        'price' => 300_000,
        'compare_at_price' => 500_000,
    ]);

    $a = Course::factory()->create(['title' => 'Course A', 'price' => 200_000]);
    $b = Course::factory()->create(['title' => 'Course B', 'price' => 300_000]);
    $bundle->courses()->attach([
        $a->id => ['sort_order' => 0],
        $b->id => ['sort_order' => 1],
    ]);

    $response = $this->get(route('bundles.show', ['bundle' => $bundle->slug]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('public/bundles/show')
        ->where('bundle.price', 300_000)
        ->where('bundle.compare_at_price', 500_000)
        ->where('bundle.savings', 200_000)
        ->has('bundle.courses', 2)
        ->where('bundle.courses.0.title', 'Course A')
    );
});

it('returns 404 for an unpublished bundle', function () {
    $bundle = Bundle::factory()->unpublished()->create();

    $this->get(route('bundles.show', ['bundle' => $bundle->slug]))
        ->assertNotFound();
});
