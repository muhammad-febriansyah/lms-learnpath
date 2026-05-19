<?php

namespace App\Models;

use Database\Factories\VoucherRedemptionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable([
    'voucher_id',
    'user_id',
    'grant_kind',
    'grantable_type',
    'grantable_id',
    'points_credited',
    'result_summary',
    'redeemed_at',
])]
class VoucherRedemption extends Model
{
    /** @use HasFactory<VoucherRedemptionFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'points_credited' => 'integer',
            'result_summary' => 'array',
            'redeemed_at' => 'datetime',
        ];
    }

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function grantable(): MorphTo
    {
        return $this->morphTo();
    }
}
