<?php

namespace App\Models;

use Database\Factories\UserPointFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'total_points',
    'lifetime_points',
    'level',
    'last_login_award_date',
])]
class UserPoint extends Model
{
    /** @use HasFactory<UserPointFactory> */
    use HasFactory;

    protected $primaryKey = 'user_id';

    public $incrementing = false;

    protected $keyType = 'int';

    protected function casts(): array
    {
        return [
            'total_points' => 'integer',
            'lifetime_points' => 'integer',
            'last_login_award_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
