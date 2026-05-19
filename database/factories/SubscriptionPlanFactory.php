<?php

namespace Database\Factories;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<SubscriptionPlan>
 */
class SubscriptionPlanFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => Str::lower(Str::random(6)),
            'name' => fake()->word(),
            'tagline' => fake()->sentence(),
            'min_users' => 1,
            'max_users' => 49,
            'price_per_user_per_month' => 500000,
            'currency' => 'IDR',
            'features' => ['Akses Course', 'Sertifikat'],
            'addons' => null,
            'is_popular' => false,
            'is_active' => true,
            'contact_sales_only' => true,
            'sort_order' => 0,
        ];
    }
}
