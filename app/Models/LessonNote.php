<?php

namespace App\Models;

use Database\Factories\LessonNoteFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'course_id',
    'lesson_id',
    'timestamp_seconds',
    'content',
])]
class LessonNote extends Model
{
    /** @use HasFactory<LessonNoteFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'timestamp_seconds' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }
}
