<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\PointRedemptionOffer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PointRedemptionOffer>
 */
class PointRedemptionOfferFactory extends Factory
{
    public function definition(): array
    {
        return [
            'redeemable_type' => Course::class,
            'redeemable_id' => Course::factory(),
            'point_price' => 100,
            'is_active' => true,
            'redeemable_from' => null,
            'redeemable_until' => null,
            'max_per_user' => null,
            'max_total' => null,
            'redemptions_count' => 0,
            'created_by' => null,
            'note' => null,
        ];
    }
}
