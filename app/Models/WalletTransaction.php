<?php

namespace App\Models;

use Database\Factories\WalletTransactionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable([
    'organization_wallet_id',
    'type',
    'amount',
    'balance_after',
    'reference_type',
    'reference_id',
    'description',
    'performed_by_user_id',
    'metadata',
])]
class WalletTransaction extends Model
{
    /** @use HasFactory<WalletTransactionFactory> */
    use HasFactory;

    public const UPDATED_AT = null;

    public const TYPE_TOP_UP = 'top_up';

    public const TYPE_DEBIT = 'debit';

    public const TYPE_REFUND = 'refund';

    public const TYPE_ADJUSTMENT_CREDIT = 'adjustment_credit';

    public const TYPE_ADJUSTMENT_DEBIT = 'adjustment_debit';

    public const CREDIT_TYPES = [
        self::TYPE_TOP_UP,
        self::TYPE_REFUND,
        self::TYPE_ADJUSTMENT_CREDIT,
    ];

    public const DEBIT_TYPES = [
        self::TYPE_DEBIT,
        self::TYPE_ADJUSTMENT_DEBIT,
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'balance_after' => 'integer',
            'metadata' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(OrganizationWallet::class, 'organization_wallet_id');
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }

    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by_user_id');
    }

    public function isCredit(): bool
    {
        return in_array($this->type, self::CREDIT_TYPES, true);
    }
}
