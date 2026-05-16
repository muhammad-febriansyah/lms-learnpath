<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Enrollment>
 */
class EnrollmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'course_id' => Course::factory(),
            'status' => 'active',
            'progress_percent' => 0,
            'pre_test_status' => 'not_started',
            'post_test_status' => 'not_started',
            'certificate_status' => 'not_issued',
            'enrolled_at' => now(),
            'started_at' => null,
            'completed_at' => null,
            'expired_at' => null,
        ];
    }
}
