<?php

namespace Database\Factories;

use App\Models\LearningPath;
use App\Models\LearningPathEnrollment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LearningPathEnrollment>
 */
class LearningPathEnrollmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'learning_path_id' => LearningPath::factory(),
            'status' => 'active',
            'progress_percent' => 0,
            'courses_completed' => 0,
            'enrolled_at' => now(),
            'started_at' => null,
            'completed_at' => null,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn () => [
            'status' => 'completed',
            'progress_percent' => 100,
            'completed_at' => now(),
        ]);
    }
}
