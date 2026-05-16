<?php

namespace Database\Factories;

use App\Models\Competency;
use App\Models\Course;
use App\Models\CourseCompetencyMapping;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CourseCompetencyMapping>
 */
class CourseCompetencyMappingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'course_id' => Course::factory(),
            'competency_id' => Competency::factory(),
            'weight' => fake()->numberBetween(1, 100),
            'target_level_impact' => fake()->numberBetween(1, 3),
        ];
    }
}
