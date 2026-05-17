<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Database\Factories\PositionCompetencyTargetFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'tenant_id',
    'position_id',
    'competency_id',
    'target_level',
    'is_required',
])]
class PositionCompetencyTarget extends Model
{
    /** @use HasFactory<PositionCompetencyTargetFactory> */
    use BelongsToTenant, HasFactory;

    protected function casts(): array
    {
        return [
            'target_level' => 'integer',
            'is_required' => 'boolean',
        ];
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }

    public function competency(): BelongsTo
    {
        return $this->belongsTo(Competency::class);
    }
}
