<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\LessonNote;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LessonNote>
 */
class LessonNoteFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'course_id' => Course::factory(),
            'lesson_id' => Lesson::factory(),
            'timestamp_seconds' => null,
            'content' => fake()->sentence(),
        ];
    }
}
