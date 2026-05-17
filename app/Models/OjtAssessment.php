<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Database\Factories\OjtAssessmentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'tenant_id',
    'user_id',
    'course_id',
    'competency_id',
    'supervisor_id',
    'rubric_score',
    'actual_level',
    'notes',
    'status',
    'assessed_at',
])]
class OjtAssessment extends Model
{
    /** @use HasFactory<OjtAssessmentFactory> */
    use BelongsToTenant, HasFactory;

    protected function casts(): array
    {
        return [
            'rubric_score' => 'integer',
            'actual_level' => 'integer',
            'assessed_at' => 'datetime',
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

    public function competency(): BelongsTo
    {
        return $this->belongsTo(Competency::class);
    }

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }
}
