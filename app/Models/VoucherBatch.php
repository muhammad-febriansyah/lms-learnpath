<?php

namespace App\Models;

use Database\Factories\VoucherBatchFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable([
    'name',
    'prefix',
    'grant_kind',
    'grantable_type',
    'grantable_id',
    'points_amount',
    'valid_from',
    'valid_until',
    'total_codes',
    'redeemed_count',
    'single_use_per_user',
    'is_active',
    'created_by',
    'note',
])]
class VoucherBatch extends Model
{
    /** @use HasFactory<VoucherBatchFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'points_amount' => 'integer',
            'valid_from' => 'datetime',
            'valid_until' => 'datetime',
            'total_codes' => 'integer',
            'redeemed_count' => 'integer',
            'single_use_per_user' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function grantable(): MorphTo
    {
        return $this->morphTo();
    }

    public function vouchers(): HasMany
    {
        return $this->hasMany(Voucher::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
