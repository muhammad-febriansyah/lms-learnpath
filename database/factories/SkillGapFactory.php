<?php

namespace Database\Factories;

use App\Models\Competency;
use App\Models\Position;
use App\Models\SkillGap;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SkillGap>
 */
class SkillGapFactory extends Factory
{
    public function definition(): array
    {
        $target = fake()->numberBetween(2, 5);
        $actual = fake()->numberBetween(0, 5);
        $gap = $actual - $target;

        return [
            'user_id' => User::factory(),
            'position_id' => Position::factory(),
            'competency_id' => Competency::factory(),
            'target_level' => $target,
            'actual_level' => $actual,
            'gap' => $gap,
            'recommendation' => fake()->sentence(),
            'status' => match (true) {
                $actual === 0 => 'no_data',
                $gap > 0 => 'exceeded',
                $gap === 0 => 'met',
                default => 'gap',
            },
            'calculated_at' => now(),
        ];
    }
}
