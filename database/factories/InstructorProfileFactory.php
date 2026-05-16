<?php

namespace Database\Factories;

use App\Models\InstructorProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InstructorProfile>
 */
class InstructorProfileFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'headline' => fake()->jobTitle(),
            'bio' => fake()->paragraphs(2, true),
            'expertise' => fake()->randomElements(
                ['Digital Marketing', 'Credit Analysis', 'Leadership', 'Sales', 'Coaching'],
                3,
            ),
            'photo_path' => null,
            'social_links' => [
                'linkedin' => 'https://linkedin.com/in/'.fake()->userName(),
            ],
            'website' => fake()->url(),
            'is_verified' => false,
            'is_active' => true,
        ];
    }

    public function verified(): static
    {
        return $this->state(fn () => [
            'is_verified' => true,
        ]);
    }
}
