<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\User;
use App\Models\Voucher;
use App\Models\VoucherRedemption;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VoucherRedemption>
 */
class VoucherRedemptionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'voucher_id' => Voucher::factory(),
            'user_id' => User::factory(),
            'grant_kind' => Voucher::KIND_COURSE,
            'grantable_type' => Course::class,
            'grantable_id' => Course::factory(),
            'points_credited' => null,
            'result_summary' => null,
            'redeemed_at' => now(),
        ];
    }
}
