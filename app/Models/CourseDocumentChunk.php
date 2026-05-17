<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'course_document_id',
    'chunk_index',
    'content',
    'embedding',
    'token_count',
])]
class CourseDocumentChunk extends Model
{
    protected function casts(): array
    {
        return [
            'embedding' => 'array',
            'chunk_index' => 'integer',
            'token_count' => 'integer',
        ];
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(CourseDocument::class, 'course_document_id');
    }
}
