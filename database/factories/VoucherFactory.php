<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Voucher;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Voucher>
 */
class VoucherFactory extends Factory
{
    public function definition(): array
    {
        return [
            'voucher_batch_id' => null,
            'code' => strtoupper(Str::random(10)),
            'grant_kind' => Voucher::KIND_COURSE,
            'grantable_type' => Course::class,
            'grantable_id' => Course::factory(),
            'points_amount' => null,
            'valid_from' => null,
            'valid_until' => null,
            'max_uses' => 1,
            'uses_count' => 0,
            'single_use_per_user' => true,
            'is_active' => true,
            'bound_email' => null,
            'bound_user_id' => null,
            'created_by' => null,
            'note' => null,
        ];
    }

    public function points(int $amount): static
    {
        return $this->state(fn () => [
            'grant_kind' => Voucher::KIND_POINTS,
            'grantable_type' => null,
            'grantable_id' => null,
            'points_amount' => $amount,
        ]);
    }
}
