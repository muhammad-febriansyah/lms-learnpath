<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserPoint>
 */
class UserPointFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'total_points' => 0,
            'lifetime_points' => 0,
            'level' => 'bronze',
            'last_login_award_date' => null,
        ];
    }
}
