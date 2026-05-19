<?php

namespace App\Models;

use Database\Factories\OrganizationWalletFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'organization_id',
    'balance',
    'currency',
    'low_balance_threshold',
])]
class OrganizationWallet extends Model
{
    /** @use HasFactory<OrganizationWalletFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'balance' => 'integer',
            'low_balance_threshold' => 'integer',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class);
    }

    public function isLow(): bool
    {
        return $this->low_balance_threshold > 0
            && $this->balance <= $this->low_balance_threshold;
    }
}
