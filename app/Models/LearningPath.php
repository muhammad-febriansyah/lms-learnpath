<?php

namespace App\Models;

use Database\Factories\LearningPathFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'title',
    'slug',
    'subtitle',
    'description',
    'thumbnail',
    'level',
    'duration_weeks',
    'target_audience',
    'outcomes',
    'position_id',
    'total_courses',
    'total_students',
    'is_published',
    'published_at',
])]
class LearningPath extends Model
{
    /** @use HasFactory<LearningPathFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'duration_weeks' => 'integer',
            'target_audience' => 'array',
            'outcomes' => 'array',
            'total_courses' => 'integer',
            'total_students' => 'integer',
            'is_published' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }

    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'learning_path_courses')
            ->withPivot(['sort_order', 'is_required'])
            ->withTimestamps()
            ->orderBy('learning_path_courses.sort_order');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(LearningPathEnrollment::class);
    }
}
