<?php

namespace Database\Factories;

use App\Models\B2cPlan;
use App\Models\B2cSubscription;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<B2cSubscription>
 */
class B2cSubscriptionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'b2c_plan_id' => B2cPlan::factory(),
            'status' => B2cSubscription::STATUS_ACTIVE,
            'started_at' => now(),
            'ends_at' => now()->addDays(30),
            'last_order_id' => null,
            'cancelled_at' => null,
        ];
    }

    public function expired(): static
    {
        return $this->state(fn () => [
            'status' => B2cSubscription::STATUS_EXPIRED,
            'started_at' => now()->subDays(60),
            'ends_at' => now()->subDay(),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn () => [
            'status' => B2cSubscription::STATUS_CANCELLED,
            'cancelled_at' => now(),
        ]);
    }
}
