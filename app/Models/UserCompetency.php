<?php

namespace App\Models;

use Database\Factories\UserCompetencyFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'competency_id',
    'actual_level',
    'source',
    'source_id',
    'confidence_score',
    'last_evaluated_at',
])]
class UserCompetency extends Model
{
    /** @use HasFactory<UserCompetencyFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'actual_level' => 'integer',
            'confidence_score' => 'integer',
            'last_evaluated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function competency(): BelongsTo
    {
        return $this->belongsTo(Competency::class);
    }
}
