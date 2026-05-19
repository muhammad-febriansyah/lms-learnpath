<?php

namespace Database\Factories;

use App\Models\B2cPlan;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<B2cPlan>
 */
class B2cPlanFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => Str::lower(Str::random(8)),
            'name' => fake()->word(),
            'tagline' => fake()->sentence(),
            'price' => 99_000,
            'billing_period' => B2cPlan::PERIOD_MONTHLY,
            'currency' => 'IDR',
            'compare_at_price' => null,
            'features' => ['Akses katalog', 'Sertifikat'],
            'is_popular' => false,
            'is_active' => true,
            'sort_order' => 0,
        ];
    }
}
