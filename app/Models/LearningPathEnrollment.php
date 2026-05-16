<?php

namespace App\Models;

use Database\Factories\LearningPathEnrollmentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'learning_path_id',
    'status',
    'progress_percent',
    'courses_completed',
    'enrolled_at',
    'started_at',
    'completed_at',
])]
class LearningPathEnrollment extends Model
{
    /** @use HasFactory<LearningPathEnrollmentFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'progress_percent' => 'integer',
            'courses_completed' => 'integer',
            'enrolled_at' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function learningPath(): BelongsTo
    {
        return $this->belongsTo(LearningPath::class);
    }
}
