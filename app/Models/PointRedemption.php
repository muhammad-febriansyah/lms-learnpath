<?php

namespace App\Models;

use Database\Factories\PointRedemptionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable([
    'user_id',
    'point_redemption_offer_id',
    'redeemable_type',
    'redeemable_id',
    'points_spent',
    'point_transaction_id',
    'status',
    'refund_transaction_id',
    'refunded_at',
    'refund_reason',
    'meta',
])]
class PointRedemption extends Model
{
    /** @use HasFactory<PointRedemptionFactory> */
    use HasFactory;

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_REFUNDED = 'refunded';

    protected function casts(): array
    {
        return [
            'points_spent' => 'integer',
            'refunded_at' => 'datetime',
            'meta' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function offer(): BelongsTo
    {
        return $this->belongsTo(PointRedemptionOffer::class, 'point_redemption_offer_id');
    }

    public function redeemable(): MorphTo
    {
        return $this->morphTo();
    }

    public function pointTransaction(): BelongsTo
    {
        return $this->belongsTo(PointTransaction::class);
    }

    public function refundTransaction(): BelongsTo
    {
        return $this->belongsTo(PointTransaction::class, 'refund_transaction_id');
    }

    public function isRefundable(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }
}
