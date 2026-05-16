<?php

namespace App\Models;

use Database\Factories\BundleFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable([
    'title',
    'slug',
    'description',
    'thumbnail',
    'price',
    'compare_at_price',
    'is_published',
    'published_at',
])]
class Bundle extends Model
{
    /** @use HasFactory<BundleFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'compare_at_price' => 'integer',
            'is_published' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'bundle_course')
            ->withPivot('sort_order')
            ->orderBy('bundle_course.sort_order');
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function savings(): int
    {
        if (! $this->compare_at_price) {
            return 0;
        }

        return max(0, (int) $this->compare_at_price - (int) $this->price);
    }
}
