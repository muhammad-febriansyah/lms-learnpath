<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable([
    'discussion_thread_id',
    'user_id',
    'body',
    'upvotes_count',
])]
class DiscussionReply extends Model
{
    protected function casts(): array
    {
        return [
            'upvotes_count' => 'integer',
        ];
    }

    public function thread(): BelongsTo
    {
        return $this->belongsTo(DiscussionThread::class, 'discussion_thread_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function upvoters(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'discussion_reply_upvotes')
            ->withTimestamps();
    }
}
