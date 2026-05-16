<?php

namespace Database\Factories;

use App\Models\Assessment;
use App\Models\AssessmentAttempt;
use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AssessmentAttempt>
 */
class AssessmentAttemptFactory extends Factory
{
    public function definition(): array
    {
        return [
            'assessment_id' => Assessment::factory(),
            'user_id' => User::factory(),
            'course_id' => Course::factory(),
            'started_at' => now(),
            'submitted_at' => null,
            'score' => 0,
            'status' => 'in_progress',
            'passed' => false,
        ];
    }
}
