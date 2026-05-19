<?php

namespace App\Models;

use Database\Factories\B2cPlanFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'code',
    'name',
    'tagline',
    'price',
    'billing_period',
    'currency',
    'compare_at_price',
    'features',
    'is_popular',
    'is_active',
    'sort_order',
])]
class B2cPlan extends Model
{
    /** @use HasFactory<B2cPlanFactory> */
    use HasFactory;

    public const PERIOD_MONTHLY = 'monthly';

    public const PERIOD_QUARTERLY = 'quarterly';

    public const PERIOD_YEARLY = 'yearly';

    public const PERIODS = [
        self::PERIOD_MONTHLY,
        self::PERIOD_QUARTERLY,
        self::PERIOD_YEARLY,
    ];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'compare_at_price' => 'integer',
            'features' => 'array',
            'is_popular' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(B2cSubscription::class);
    }

    public function durationDays(): int
    {
        return match ($this->billing_period) {
            self::PERIOD_MONTHLY => 30,
            self::PERIOD_QUARTERLY => 90,
            self::PERIOD_YEARLY => 365,
            default => 30,
        };
    }

    public function periodLabel(): string
    {
        return match ($this->billing_period) {
            self::PERIOD_MONTHLY => 'bulan',
            self::PERIOD_QUARTERLY => '3 bulan',
            self::PERIOD_YEARLY => 'tahun',
            default => $this->billing_period,
        };
    }

    public function savings(): int
    {
        if (! $this->compare_at_price || $this->compare_at_price <= $this->price) {
            return 0;
        }

        return (int) $this->compare_at_price - (int) $this->price;
    }
}
