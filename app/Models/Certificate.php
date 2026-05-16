<?php

namespace App\Models;

use Database\Factories\CertificateFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'course_id',
    'learning_path_id',
    'subject_type',
    'certificate_number',
    'verification_code',
    'pdf_path',
    'issued_at',
    'expired_at',
    'status',
])]
class Certificate extends Model
{
    /** @use HasFactory<CertificateFactory> */
    use HasFactory;

    public const SUBJECT_COURSE = 'course';

    public const SUBJECT_PATH = 'path';

    protected function casts(): array
    {
        return [
            'issued_at' => 'datetime',
            'expired_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function learningPath(): BelongsTo
    {
        return $this->belongsTo(LearningPath::class);
    }

    public function isPathCertificate(): bool
    {
        return $this->subject_type === self::SUBJECT_PATH;
    }

    public function subjectTitle(): string
    {
        return $this->isPathCertificate()
            ? ($this->learningPath?->title ?? '')
            : ($this->course?->title ?? '');
    }
}
