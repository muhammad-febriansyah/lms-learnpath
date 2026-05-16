<?php

namespace App\Models;

use Database\Factories\LessonFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'course_id',
    'course_section_id',
    'scorm_package_id',
    'title',
    'description',
    'type',
    'content',
    'video_path',
    'embed_url',
    'youtube_url',
    'youtube_video_id',
    'duration_minutes',
    'sort_order',
    'is_preview',
    'is_required',
])]
class Lesson extends Model
{
    /** @use HasFactory<LessonFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'duration_minutes' => 'integer',
            'sort_order' => 'integer',
            'is_preview' => 'boolean',
            'is_required' => 'boolean',
        ];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(CourseSection::class, 'course_section_id');
    }

    public function scormPackage(): BelongsTo
    {
        return $this->belongsTo(ScormPackage::class);
    }

    public function progresses(): HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }
}
