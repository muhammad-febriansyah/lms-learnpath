<?php

namespace App\Models;

use Database\Factories\LearningStreakFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'current_streak',
    'longest_streak',
    'last_active_date',
])]
class LearningStreak extends Model
{
    /** @use HasFactory<LearningStreakFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'current_streak' => 'integer',
            'longest_streak' => 'integer',
            'last_active_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
