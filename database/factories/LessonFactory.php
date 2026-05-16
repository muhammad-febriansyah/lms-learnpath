<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Lesson;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Lesson>
 */
class LessonFactory extends Factory
{
    public function definition(): array
    {
        $section = CourseSection::factory();

        return [
            'course_id' => Course::factory(),
            'course_section_id' => $section,
            'scorm_package_id' => null,
            'title' => fake()->sentence(4),
            'description' => fake()->sentence(),
            'type' => 'video',
            'content' => null,
            'video_path' => null,
            'embed_url' => null,
            'youtube_url' => 'https://www.youtube.com/watch?v='.fake()->lexify('???????????'),
            'youtube_video_id' => fake()->lexify('???????????'),
            'duration_minutes' => fake()->numberBetween(5, 60),
            'sort_order' => fake()->numberBetween(1, 20),
            'is_preview' => false,
            'is_required' => true,
        ];
    }

    public function youtube(): static
    {
        return $this->state(fn () => [
            'type' => 'youtube',
            'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'youtube_video_id' => 'dQw4w9WgXcQ',
        ]);
    }

    public function text(): static
    {
        return $this->state(fn () => [
            'type' => 'text',
            'content' => fake()->paragraphs(3, true),
            'youtube_url' => null,
            'youtube_video_id' => null,
        ]);
    }
}
