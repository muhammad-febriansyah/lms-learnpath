<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Voucher;
use App\Models\VoucherBatch;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VoucherBatch>
 */
class VoucherBatchFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->company().' Batch',
            'prefix' => null,
            'grant_kind' => Voucher::KIND_COURSE,
            'grantable_type' => Course::class,
            'grantable_id' => Course::factory(),
            'points_amount' => null,
            'valid_from' => null,
            'valid_until' => null,
            'total_codes' => 0,
            'redeemed_count' => 0,
            'single_use_per_user' => true,
            'is_active' => true,
            'created_by' => null,
            'note' => null,
        ];
    }
}
