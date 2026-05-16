<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    public function definition(): array
    {
        $subtotal = fake()->numberBetween(50000, 1500000);

        return [
            'user_id' => User::factory(),
            'order_number' => 'ORD-'.fake()->unique()->numerify('##########'),
            'type' => 'course',
            'subtotal' => $subtotal,
            'discount' => 0,
            'tax' => 0,
            'total' => $subtotal,
            'currency' => 'IDR',
            'status' => 'pending',
            'customer_name' => fake()->name(),
            'customer_email' => fake()->safeEmail(),
            'customer_phone' => fake()->phoneNumber(),
            'metadata' => null,
            'expires_at' => now()->addHours(24),
            'paid_at' => null,
        ];
    }

    public function paid(): static
    {
        return $this->state(fn () => [
            'status' => 'paid',
            'paid_at' => now(),
        ]);
    }
}
