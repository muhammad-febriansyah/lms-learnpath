<?php

namespace Database\Factories;

use App\Models\EmployeeProfile;
use App\Models\Position;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EmployeeProfile>
 */
class EmployeeProfileFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'position_id' => Position::factory(),
            'supervisor_id' => null,
            'employee_number' => 'EMP-'.fake()->unique()->numberBetween(10000, 99999),
            'division' => fake()->randomElement(['Sales & Lending', 'Operations', 'IT', 'HR', 'Finance']),
            'branch' => fake()->city(),
            'joined_at' => fake()->dateTimeBetween('-5 years'),
        ];
    }
}
