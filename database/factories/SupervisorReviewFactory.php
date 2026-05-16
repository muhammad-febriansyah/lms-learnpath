<?php

namespace Database\Factories;

use App\Models\Competency;
use App\Models\SupervisorReview;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SupervisorReview>
 */
class SupervisorReviewFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'competency_id' => Competency::factory(),
            'reviewer_id' => User::factory(),
            'rating' => fake()->numberBetween(1, 5),
            'actual_level' => fake()->numberBetween(1, 5),
            'notes' => fake()->sentence(),
            'approval_status' => 'pending_review',
            'reviewed_at' => now(),
        ];
    }

    public function approved(): static
    {
        return $this->state(fn () => [
            'approval_status' => 'approved',
        ]);
    }
}
