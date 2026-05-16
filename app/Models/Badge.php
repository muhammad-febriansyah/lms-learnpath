<?php

namespace App\Models;

use Database\Factories\BadgeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable([
    'slug',
    'name',
    'description',
    'icon',
    'category',
    'criteria',
    'is_active',
    'sort_order',
])]
class Badge extends Model
{
    /** @use HasFactory<BadgeFactory> */
    use HasFactory;

    public const CATEGORY_MILESTONE = 'milestone';

    public const CATEGORY_STREAK = 'streak';

    public const CATEGORY_MASTERY = 'mastery';

    public const CATEGORY_PATH = 'path';

    protected function casts(): array
    {
        return [
            'criteria' => 'array',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_badges')
            ->withPivot('earned_at')
            ->withTimestamps();
    }
}
