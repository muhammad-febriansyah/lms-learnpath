<?php

namespace Database\Factories;

use App\Models\PayoutRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PayoutRequest>
 */
class PayoutRequestFactory extends Factory
{
    public function definition(): array
    {
        $gross = $this->faker->numberBetween(100_000, 5_000_000);
        $fee = (int) ($gross * 0.05);

        return [
            'user_id' => User::factory(),
            'gross_amount' => $gross,
            'fee_amount' => $fee,
            'net_amount' => $gross - $fee,
            'bank_name' => 'BCA',
            'account_number' => $this->faker->numerify('##########'),
            'account_holder' => $this->faker->name(),
            'status' => PayoutRequest::STATUS_PENDING,
        ];
    }
}
