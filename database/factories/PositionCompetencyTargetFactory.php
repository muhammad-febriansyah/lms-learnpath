<?php

namespace Database\Factories;

use App\Models\Competency;
use App\Models\Position;
use App\Models\PositionCompetencyTarget;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PositionCompetencyTarget>
 */
class PositionCompetencyTargetFactory extends Factory
{
    public function definition(): array
    {
        return [
            'position_id' => Position::factory(),
            'competency_id' => Competency::factory(),
            'target_level' => fake()->numberBetween(2, 5),
            'is_required' => true,
        ];
    }
}
