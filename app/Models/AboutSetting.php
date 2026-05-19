<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'title',
    'tagline',
    'hero_image',
    'description',
    'founded_year',
    'vision',
    'mission',
    'values',
    'stats',
    'founder_name',
    'founder_role',
    'founder_photo',
    'founder_message',
    'contact_email',
    'contact_phone',
    'contact_address',
    'contact_map_url',
    'social_facebook',
    'social_instagram',
    'social_twitter',
    'social_linkedin',
    'social_youtube',
])]
class AboutSetting extends Model
{
    protected function casts(): array
    {
        return [
            'values' => 'array',
            'stats' => 'array',
            'founded_year' => 'integer',
        ];
    }

    public static function current(): self
    {
        return static::query()->firstOrCreate(['id' => 1]);
    }
}
