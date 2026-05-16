<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    public function definition(): array
    {
        $amount = fake()->numberBetween(50000, 1500000);

        return [
            'order_id' => Order::factory(),
            'gateway' => 'pakasir',
            'payment_method' => 'qris',
            'payment_number' => null,
            'payment_url' => null,
            'amount' => $amount,
            'fee' => 0,
            'total_payment' => $amount,
            'status' => 'pending',
            'gateway_reference' => null,
            'raw_response' => null,
            'expired_at' => now()->addDay(),
            'completed_at' => null,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn () => [
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }
}
