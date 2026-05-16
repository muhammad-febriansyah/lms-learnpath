<?php

namespace App\Models;

use Database\Factories\CouponFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'code',
    'name',
    'discount_type',
    'discount_value',
    'max_discount',
    'applicable_to',
    'max_uses',
    'uses_count',
    'is_active',
])]
class Coupon extends Model
{
    /** @use HasFactory<CouponFactory> */
    use HasFactory;

    public const TYPE_PERCENTAGE = 'percentage';

    public const TYPE_FIXED = 'fixed';

    public const SCOPE_ALL = 'all';

    public const SCOPE_SPECIFIC = 'specific';

    protected function casts(): array
    {
        return [
            'discount_value' => 'integer',
            'max_discount' => 'integer',
            'max_uses' => 'integer',
            'uses_count' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'coupon_course');
    }

    public function redemptions(): HasMany
    {
        return $this->hasMany(CouponRedemption::class);
    }

    public function isPercentage(): bool
    {
        return $this->discount_type === self::TYPE_PERCENTAGE;
    }

    public function isFixed(): bool
    {
        return $this->discount_type === self::TYPE_FIXED;
    }

    public function isScopedToAll(): bool
    {
        return $this->applicable_to === self::SCOPE_ALL;
    }

    public function hasReachedUsageLimit(): bool
    {
        return $this->max_uses !== null && $this->uses_count >= $this->max_uses;
    }

    public function appliesToCourse(Course $course): bool
    {
        if ($this->isScopedToAll()) {
            return true;
        }

        return $this->courses()->whereKey($course->id)->exists();
    }
}
