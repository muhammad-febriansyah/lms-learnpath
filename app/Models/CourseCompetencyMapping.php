<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Database\Factories\CourseCompetencyMappingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'tenant_id',
    'course_id',
    'competency_id',
    'weight',
    'target_level_impact',
])]
class CourseCompetencyMapping extends Model
{
    /** @use HasFactory<CourseCompetencyMappingFactory> */
    use BelongsToTenant, HasFactory;

    protected function casts(): array
    {
        return [
            'weight' => 'integer',
            'target_level_impact' => 'integer',
        ];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function competency(): BelongsTo
    {
        return $this->belongsTo(Competency::class);
    }
}
