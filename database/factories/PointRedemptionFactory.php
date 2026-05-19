<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\PointRedemption;
use App\Models\PointRedemptionOffer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PointRedemption>
 */
class PointRedemptionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'point_redemption_offer_id' => PointRedemptionOffer::factory(),
            'redeemable_type' => Course::class,
            'redeemable_id' => Course::factory(),
            'points_spent' => 100,
            'point_transaction_id' => null,
            'status' => 'completed',
            'refund_transaction_id' => null,
            'refunded_at' => null,
            'refund_reason' => null,
            'meta' => null,
        ];
    }
}
