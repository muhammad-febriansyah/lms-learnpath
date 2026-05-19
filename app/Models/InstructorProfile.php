<?php

namespace App\Models;

use Database\Factories\InstructorProfileFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'headline',
    'bio',
    'expertise',
    'photo_path',
    'cv_path',
    'cv_original_name',
    'cv_uploaded_at',
    'social_links',
    'website',
    'is_verified',
    'is_active',
])]
class InstructorProfile extends Model
{
    /** @use HasFactory<InstructorProfileFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'expertise' => 'array',
            'social_links' => 'array',
            'is_verified' => 'boolean',
            'is_active' => 'boolean',
            'cv_uploaded_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
