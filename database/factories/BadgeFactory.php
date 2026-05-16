<?php

namespace Database\Factories;

use App\Models\Badge;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Badge>
 */
class BadgeFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1, 99999),
            'name' => Str::title($name),
            'description' => fake()->sentence(),
            'icon' => 'Award',
            'category' => 'milestone',
            'criteria' => ['type' => 'course_count', 'threshold' => 1],
            'is_active' => true,
            'sort_order' => 0,
        ];
    }
}
