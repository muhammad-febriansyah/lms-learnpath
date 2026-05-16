<?php

namespace Database\Factories;

use App\Models\Assessment;
use App\Models\Question;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Question>
 */
class QuestionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'assessment_id' => Assessment::factory(),
            'question_text' => fake()->sentence().' ?',
            'type' => 'multiple_choice',
            'points' => 1,
            'sort_order' => fake()->numberBetween(1, 20),
        ];
    }
}
