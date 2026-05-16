<?php

namespace Database\Factories;

use App\Models\Bundle;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Bundle>
 */
class BundleFactory extends Factory
{
    public function definition(): array
    {
        $title = 'Paket '.fake()->words(2, true);

        return [
            'title' => $title,
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(1, 99999),
            'description' => fake()->paragraph(),
            'thumbnail' => null,
            'price' => fake()->numberBetween(199_000, 1_499_000),
            'compare_at_price' => null,
            'is_published' => true,
            'published_at' => now(),
        ];
    }

    public function unpublished(): static
    {
        return $this->state(fn () => [
            'is_published' => false,
            'published_at' => null,
        ]);
    }
}
