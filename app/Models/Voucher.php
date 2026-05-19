<?php

namespace App\Models;

use Database\Factories\VoucherFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable([
    'voucher_batch_id',
    'code',
    'grant_kind',
    'grantable_type',
    'grantable_id',
    'points_amount',
    'valid_from',
    'valid_until',
    'max_uses',
    'uses_count',
    'single_use_per_user',
    'is_active',
    'bound_email',
    'bound_user_id',
    'created_by',
    'note',
])]
class Voucher extends Model
{
    /** @use HasFactory<VoucherFactory> */
    use HasFactory;

    public const KIND_COURSE = 'course';

    public const KIND_BUNDLE = 'bundle';

    public const KIND_LEARNING_PATH = 'learning_path';

    public const KIND_POINTS = 'points';

    public const KINDS_MORPH_MAP = [
        self::KIND_COURSE => Course::class,
        self::KIND_BUNDLE => Bundle::class,
        self::KIND_LEARNING_PATH => LearningPath::class,
    ];

    protected function casts(): array
    {
        return [
            'points_amount' => 'integer',
            'valid_from' => 'datetime',
            'valid_until' => 'datetime',
            'max_uses' => 'integer',
            'uses_count' => 'integer',
            'single_use_per_user' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(VoucherBatch::class, 'voucher_batch_id');
    }

    public function grantable(): MorphTo
    {
        return $this->morphTo();
    }

    public function boundUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'bound_user_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function redemptions(): HasMany
    {
        return $this->hasMany(VoucherRedemption::class);
    }

    public function isWithinWindow(?\DateTimeInterface $at = null): bool
    {
        $at = $at ?: now();

        if ($this->valid_from && $at < $this->valid_from) {
            return false;
        }

        if ($this->valid_until && $at > $this->valid_until) {
            return false;
        }

        return true;
    }

    public function hasReachedUsageLimit(): bool
    {
        return (int) $this->uses_count >= (int) $this->max_uses;
    }
}
