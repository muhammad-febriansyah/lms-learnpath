<?php

namespace Database\Factories;

use App\Models\LearningPath;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<LearningPath>
 */
class LearningPathFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->unique()->sentence(3);

        return [
            'title' => $title,
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(1, 99999),
            'subtitle' => fake()->sentence(8),
            'description' => fake()->paragraphs(2, true),
            'thumbnail' => null,
            'level' => fake()->randomElement(['beginner', 'intermediate', 'advanced']),
            'duration_weeks' => fake()->numberBetween(4, 12),
            'target_audience' => [fake()->jobTitle(), fake()->jobTitle()],
            'outcomes' => [fake()->sentence(), fake()->sentence(), fake()->sentence()],
            'position_id' => null,
            'total_courses' => 0,
            'total_students' => 0,
            'is_published' => true,
            'published_at' => now(),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn () => [
            'is_published' => false,
            'published_at' => null,
        ]);
    }
}
