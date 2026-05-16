<?php

namespace Database\Factories;

use App\Models\AssessmentAnswer;
use App\Models\AssessmentAttempt;
use App\Models\Question;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AssessmentAnswer>
 */
class AssessmentAnswerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'assessment_attempt_id' => AssessmentAttempt::factory(),
            'question_id' => Question::factory(),
            'selected_option_id' => null,
            'answer_text' => null,
            'is_correct' => false,
            'point_earned' => 0,
        ];
    }
}
