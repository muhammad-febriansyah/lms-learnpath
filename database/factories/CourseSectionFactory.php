<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\CourseSection;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CourseSection>
 */
class CourseSectionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'course_id' => Course::factory(),
            'title' => 'Modul '.fake()->randomLetter().' - '.fake()->words(2, true),
            'description' => fake()->sentence(),
            'sort_order' => fake()->numberBetween(1, 10),
        ];
    }
}
