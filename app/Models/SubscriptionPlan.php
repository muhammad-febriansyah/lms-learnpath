<?php

namespace App\Models;

use Database\Factories\SubscriptionPlanFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'code',
    'name',
    'tagline',
    'min_users',
    'max_users',
    'price_per_user_per_month',
    'currency',
    'features',
    'addons',
    'is_popular',
    'is_active',
    'contact_sales_only',
    'sort_order',
])]
class SubscriptionPlan extends Model
{
    /** @use HasFactory<SubscriptionPlanFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'min_users' => 'integer',
            'max_users' => 'integer',
            'price_per_user_per_month' => 'integer',
            'features' => 'array',
            'addons' => 'array',
            'is_popular' => 'boolean',
            'is_active' => 'boolean',
            'contact_sales_only' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function organizations(): HasMany
    {
        return $this->hasMany(Organization::class);
    }

    public function leads(): HasMany
    {
        return $this->hasMany(SubscriptionLead::class);
    }

    public function userRange(): string
    {
        if ($this->max_users === null) {
            return $this->min_users.' User Keatas';
        }

        return $this->min_users.'-'.$this->max_users.' User';
    }
}
