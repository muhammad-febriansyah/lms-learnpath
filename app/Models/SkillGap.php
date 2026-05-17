<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Database\Factories\SkillGapFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'tenant_id',
    'user_id',
    'position_id',
    'competency_id',
    'target_level',
    'actual_level',
    'gap',
    'recommendation',
    'status',
    'calculated_at',
])]
class SkillGap extends Model
{
    /** @use HasFactory<SkillGapFactory> */
    use BelongsToTenant, HasFactory;

    protected function casts(): array
    {
        return [
            'target_level' => 'integer',
            'actual_level' => 'integer',
            'gap' => 'integer',
            'calculated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
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
