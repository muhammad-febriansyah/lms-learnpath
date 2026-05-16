<?php

namespace App\Models;

use Database\Factories\ScormTrackingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'course_id',
    'lesson_id',
    'scorm_package_id',
    'lesson_status',
    'completion_status',
    'score_raw',
    'score_min',
    'score_max',
    'total_time',
    'session_time',
    'suspend_data',
    'cmi_data',
])]
class ScormTracking extends Model
{
    /** @use HasFactory<ScormTrackingFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'score_raw' => 'decimal:2',
            'score_min' => 'decimal:2',
            'score_max' => 'decimal:2',
            'cmi_data' => 'array',
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

    public function scormPackage(): BelongsTo
    {
        return $this->belongsTo(ScormPackage::class);
    }
}
