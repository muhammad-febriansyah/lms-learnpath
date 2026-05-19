<?php

namespace Database\Factories;

use App\Models\PointTransaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PointTransaction>
 */
class PointTransactionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'reason' => 'lesson_complete',
            'amount' => 10,
            'reference_type' => null,
            'reference_id' => null,
            'dedupe_key' => null,
            'meta' => null,
        ];
    }
}
