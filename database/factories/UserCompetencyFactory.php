<?php

namespace Database\Factories;

use App\Models\Competency;
use App\Models\User;
use App\Models\UserCompetency;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserCompetency>
 */
class UserCompetencyFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'competency_id' => Competency::factory(),
            'actual_level' => fake()->numberBetween(0, 5),
            'source' => fake()->randomElement(['no_data', 'course_completion', 'ojt', 'supervisor_review']),
            'source_id' => null,
            'confidence_score' => fake()->numberBetween(0, 100),
            'last_evaluated_at' => now(),
        ];
    }
}
