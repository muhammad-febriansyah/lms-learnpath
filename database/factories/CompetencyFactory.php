<?php

namespace Database\Factories;

use App\Models\Competency;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Competency>
 */
class CompetencyFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(2, true),
            'category' => fake()->randomElement(['Technical Skill', 'Soft Skill', 'Leadership', 'Compliance']),
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
