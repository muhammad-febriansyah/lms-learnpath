<?php

namespace Database\Factories;

use App\Models\LearningStreak;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LearningStreak>
 */
class LearningStreakFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'current_streak' => 0,
            'longest_streak' => 0,
            'last_active_date' => null,
        ];
    }
}
