<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'tenant_id',
    'course_id',
    'uploaded_by_user_id',
    'title',
    'source_type',
    'filename',
    'mime',
    'storage_path',
    'status',
    'error_message',
    'total_chunks',
    'total_tokens',
])]
class CourseDocument extends Model
{
    use BelongsToTenant;

    public const STATUS_PENDING = 'pending';

    public const STATUS_READY = 'ready';

    public const STATUS_FAILED = 'failed';

    public const SOURCE_UPLOAD = 'upload';

    public const SOURCE_PASTE = 'paste';

    protected function casts(): array
    {
        return [
            'total_chunks' => 'integer',
            'total_tokens' => 'integer',
        ];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by_user_id');
    }

    public function chunks(): HasMany
    {
        return $this->hasMany(CourseDocumentChunk::class);
    }
}
