<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    public function definition(): array
    {
        $price = fake()->numberBetween(50000, 1500000);

        return [
            'order_id' => Order::factory(),
            'purchasable_type' => Course::class,
            'purchasable_id' => Course::factory(),
            'name' => fake()->sentence(4),
            'quantity' => 1,
            'unit_price' => $price,
            'subtotal' => $price,
            'metadata' => null,
        ];
    }
}
