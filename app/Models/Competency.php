<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Database\Factories\CompetencyFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'tenant_id',
    'name',
    'category',
    'description',
    'is_active',
])]
class Competency extends Model
{
    /** @use HasFactory<CompetencyFactory> */
    use BelongsToTenant, HasFactory;

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function positionTargets(): HasMany
    {
        return $this->hasMany(PositionCompetencyTarget::class);
    }

    public function courseMappings(): HasMany
    {
        return $this->hasMany(CourseCompetencyMapping::class);
    }

    public function userCompetencies(): HasMany
    {
        return $this->hasMany(UserCompetency::class);
    }

    public function skillGaps(): HasMany
    {
        return $this->hasMany(SkillGap::class);
    }
}
