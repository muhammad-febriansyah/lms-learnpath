<?php

namespace Database\Factories;

use App\Models\Competency;
use App\Models\OjtAssessment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OjtAssessment>
 */
class OjtAssessmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'course_id' => null,
            'competency_id' => Competency::factory(),
            'supervisor_id' => User::factory(),
            'rubric_score' => fake()->numberBetween(60, 100),
            'actual_level' => fake()->numberBetween(1, 5),
            'notes' => fake()->sentence(),
            'status' => 'pending_review',
            'assessed_at' => now(),
        ];
    }

    public function approved(): static
    {
        return $this->state(fn () => [
            'status' => 'approved',
        ]);
    }
}
