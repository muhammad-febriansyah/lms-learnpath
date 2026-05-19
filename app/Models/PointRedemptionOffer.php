<?php

namespace App\Models;

use Database\Factories\PointRedemptionOfferFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable([
    'redeemable_type',
    'redeemable_id',
    'point_price',
    'is_active',
    'redeemable_from',
    'redeemable_until',
    'max_per_user',
    'max_total',
    'redemptions_count',
    'created_by',
    'note',
])]
class PointRedemptionOffer extends Model
{
    /** @use HasFactory<PointRedemptionOfferFactory> */
    use HasFactory;

    public const REDEEMABLE_TYPES = [
        'course' => Course::class,
        'bundle' => Bundle::class,
        'learning_path' => LearningPath::class,
    ];

    protected function casts(): array
    {
        return [
            'point_price' => 'integer',
            'is_active' => 'boolean',
            'redeemable_from' => 'datetime',
            'redeemable_until' => 'datetime',
            'max_per_user' => 'integer',
            'max_total' => 'integer',
            'redemptions_count' => 'integer',
        ];
    }

    public function redeemable(): MorphTo
    {
        return $this->morphTo();
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function redemptions(): HasMany
    {
        return $this->hasMany(PointRedemption::class);
    }

    public function isWithinWindow(?\DateTimeInterface $at = null): bool
    {
        $at = $at ?: now();

        if ($this->redeemable_from && $at < $this->redeemable_from) {
            return false;
        }

        if ($this->redeemable_until && $at > $this->redeemable_until) {
            return false;
        }

        return true;
    }
}
