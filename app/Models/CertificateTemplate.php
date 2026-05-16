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

    protected function casts(): array
    {
        return [
            'show_qr' => 'boolean',
            'show_signature' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
