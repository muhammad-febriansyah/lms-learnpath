<?php

namespace Database\Factories;

use App\Models\Coupon;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Coupon>
 */
class CouponFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => Str::upper(Str::random(8)),
            'name' => fake()->sentence(3),
            'discount_type' => Coupon::TYPE_PERCENTAGE,
            'discount_value' => 10,
            'max_discount' => null,
            'applicable_to' => Coupon::SCOPE_ALL,
            'max_uses' => null,
            'uses_count' => 0,
            'is_active' => true,
        ];
    }

    public function percentage(int $percent, ?int $maxDiscount = null): static
    {
        return $this->state(fn () => [
            'discount_type' => Coupon::TYPE_PERCENTAGE,
            'discount_value' => $percent,
            'max_discount' => $maxDiscount,
        ]);
    }

    public function fixed(int $amount): static
    {
        return $this->state(fn () => [
            'discount_type' => Coupon::TYPE_FIXED,
            'discount_value' => $amount,
            'max_discount' => null,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }

    public function exhausted(): static
    {
        return $this->state(fn () => [
            'max_uses' => 1,
            'uses_count' => 1,
        ]);
    }
}
