<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'name',
    'display_name',
    'tagline',
    'slug',
    'logo_path',
    'brand_primary_color',
    'industry',
    'size_range',
    'contact_name',
    'contact_email',
    'contact_phone',
    'address',
    'seat_quota',
    'seats_used',
    'status',
    'subscription_plan_id',
    'contract_ends_at',
    'billing_address',
    'billing_tax_id',
    'metadata',
])]
class Organization extends Model
{
    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'seat_quota' => 'integer',
            'seats_used' => 'integer',
            'contract_ends_at' => 'date',
            'metadata' => 'array',
        ];
    }

    public function daysUntilContractEnd(): ?int
    {
        if (! $this->contract_ends_at) {
            return null;
        }

        $today = now()->startOfDay();
        $end = $this->contract_ends_at->copy()->startOfDay();

        return (int) $today->diffInDays($end, absolute: false);
    }

    public function isContractExpiringSoon(int $thresholdDays = 30): bool
    {
        $days = $this->daysUntilContractEnd();

        return $days !== null && $days >= 0 && $days <= $thresholdDays;
    }

    public function isContractExpired(): bool
    {
        $days = $this->daysUntilContractEnd();

        return $days !== null && $days < 0;
    }

    public function members(): HasMany
    {
        return $this->hasMany(OrganizationMember::class);
    }

    public function subscriptionPlan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'organization_members')
            ->withPivot(['role', 'joined_at'])
            ->withTimestamps();
    }

    public function admins(): BelongsToMany
    {
        return $this->users()->wherePivot('role', 'admin');
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(OrganizationInvitation::class);
    }

    public function seatsAvailable(): int
    {
        return max(0, $this->seat_quota - $this->seats_used);
    }

    public function hasSeatAvailable(): bool
    {
        return $this->seatsAvailable() > 0;
    }

    public function wallet(): HasOne
    {
        return $this->hasOne(OrganizationWallet::class);
    }
}
