<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Course>
 */
class CourseFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->unique()->sentence(4);

        return [
            'category_id' => Category::factory(),
            'instructor_id' => User::factory(),
            'title' => $title,
            'subtitle' => fake()->sentence(),
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(1, 99999),
            'description' => fake()->paragraphs(2, true),
            'thumbnail' => null,
            'price' => fake()->randomElement([0, 99000, 199000, 349000, 499000]),
            'level' => fake()->randomElement(['beginner', 'intermediate', 'advanced']),
            'delivery_format' => Course::FORMAT_ON_DEMAND,
            'is_certified' => false,
            'language' => 'id',
            'duration_minutes' => fake()->numberBetween(60, 600),
            'pre_test_required' => false,
            'post_test_required' => true,
            'passing_score' => 70,
            'max_attempts' => 3,
            'average_rating' => 0,
            'reviews_count' => 0,
            'total_students' => 0,
            'is_published' => true,
            'published_at' => now(),
        ];
    }

    public function free(): static
    {
        return $this->state(fn () => ['price' => 0]);
    }

    public function draft(): static
    {
        return $this->state(fn () => [
            'is_published' => false,
            'published_at' => null,
        ]);
    }
}
