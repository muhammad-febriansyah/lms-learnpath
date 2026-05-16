<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'name',
    'slug',
    'logo_path',
    'industry',
    'size_range',
    'contact_name',
    'contact_email',
    'contact_phone',
    'address',
    'seat_quota',
    'seats_used',
    'status',
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
            'metadata' => 'array',
        ];
    }

    public function members(): HasMany
    {
        return $this->hasMany(OrganizationMember::class);
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
}
