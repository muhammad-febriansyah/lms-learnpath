<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\ScormPackage;
use App\Models\ScormTracking;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ScormTracking>
 */
class ScormTrackingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'course_id' => Course::factory(),
            'lesson_id' => Lesson::factory(),
            'scorm_package_id' => ScormPackage::factory(),
            'lesson_status' => 'incomplete',
            'completion_status' => 'incomplete',
            'score_raw' => null,
            'score_min' => 0,
            'score_max' => 100,
            'total_time' => '00:00:00',
            'session_time' => '00:00:00',
            'suspend_data' => null,
            'cmi_data' => [],
        ];
    }
}
