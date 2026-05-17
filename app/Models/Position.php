<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Database\Factories\PositionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'tenant_id',
    'name',
    'division',
    'branch',
    'description',
    'is_active',
])]
class Position extends Model
{
    /** @use HasFactory<PositionFactory> */
    use BelongsToTenant, HasFactory;

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function employeeProfiles(): HasMany
    {
        return $this->hasMany(EmployeeProfile::class);
    }

    public function competencyTargets(): HasMany
    {
        return $this->hasMany(PositionCompetencyTarget::class);
    }

    public function competencies(): BelongsToMany
    {
        return $this->belongsToMany(Competency::class, 'position_competency_targets')
            ->withPivot(['target_level', 'is_required'])
            ->withTimestamps();
    }

    public function learningPaths(): HasMany
    {
        return $this->hasMany(LearningPath::class);
    }
}
