<?php

namespace App\Models;

use Database\Factories\CertificateTemplateFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'name',
    'scope',
    'orientation',
    'status',
    'background_type',
    'background_preset',
    'background_path',
    'title',
    'subtitle',
    'body_text',
    'show_qr',
    'show_signature',
    'sort_order',
])]
class CertificateTemplate extends Model
{
    /** @use HasFactory<CertificateTemplateFactory> */
    use HasFactory;

    public const SCOPE_COURSE = 'course';

    public const SCOPE_LEARNING_PATH = 'learning_path';

    public const SCOPE_CORPORATE = 'corporate';

    public const BACKGROUND_PRESET = 'preset';

    public const BACKGROUND_UPLOAD = 'upload';

    /**
     * @return array<string, array{key: string, label: string, description: string}>
     */
    public static function backgroundPresets(): array
    {
        return [
            'classic-blue' => [
                'key' => 'classic-blue',
                'label' => 'Classic Blue',
                'description' => 'Formal, bersih, dan cocok untuk course umum.',
            ],
            'premium-gold' => [
                'key' => 'premium-gold',
                'label' => 'Premium Gold',
                'description' => 'Nuansa eksklusif untuk sertifikat premium.',
            ],
            'modern-aurora' => [
                'key' => 'modern-aurora',
                'label' => 'Modern Aurora',
                'description' => 'Lebih modern dengan gradien lembut dan dinamis.',
            ],
            'corporate-slate' => [
                'key' => 'corporate-slate',
                'label' => 'Corporate Slate',
                'description' => 'Cocok untuk kebutuhan corporate dan in-house training.',
            ],
        ];
    }

    protected function casts(): array
    {
        return [
            'show_qr' => 'boolean',
            'show_signature' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
