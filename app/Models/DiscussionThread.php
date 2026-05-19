<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'tenant_id',
    'course_id',
    'lesson_id',
    'user_id',
    'title',
    'body',
    'image_path',
    'upvotes_count',
    'replies_count',
    'last_reply_at',
    'locked_at',
])]
class DiscussionThread extends Model
{
    use BelongsToTenant;

    protected function casts(): array
    {
        return [
            'upvotes_count' => 'integer',
            'replies_count' => 'integer',
            'last_reply_at' => 'datetime',
            'locked_at' => 'datetime',
        ];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function replies(): HasMany
    {
        return $this->hasMany(DiscussionReply::class);
    }

    public function upvoters(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'discussion_thread_upvotes')
            ->withTimestamps();
    }
}
