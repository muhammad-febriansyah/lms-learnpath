<?php

namespace Database\Factories;

use App\Models\Assessment;
use App\Models\Course;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Assessment>
 */
class AssessmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'course_id' => Course::factory(),
            'title' => 'Quiz '.fake()->words(2, true),
            'type' => 'quiz',
            'description' => fake()->sentence(),
            'passing_score' => 70,
            'max_attempts' => 3,
            'duration_minutes' => 30,
            'is_required' => true,
            'sort_order' => fake()->numberBetween(1, 10),
        ];
    }

    public function preTest(): static
    {
        return $this->state(fn () => [
            'type' => 'pre_test',
            'title' => 'Pre Test',
        ]);
    }

    public function postTest(): static
    {
        return $this->state(fn () => [
            'type' => 'post_test',
            'title' => 'Post Test',
        ]);
    }
}
