<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LessonProgress>
 */
class LessonProgressFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'course_id' => Course::factory(),
            'lesson_id' => Lesson::factory(),
            'status' => 'not_started',
            'progress_percent' => 0,
            'last_position' => 0,
            'started_at' => null,
            'completed_at' => null,
        ];
    }
}
