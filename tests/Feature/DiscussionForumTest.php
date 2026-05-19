<?php

use App\Models\Course;
use App\Models\DiscussionReply;
use App\Models\DiscussionThread;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('admin_tenant', 'web');
    Role::findOrCreate('instructor', 'web');
    Role::findOrCreate('employee', 'web');

    $this->course = Course::factory()->create([
        'is_published' => true,
        'slug' => 'test-discussion-course',
    ]);

    $this->student = User::factory()->create(['email_verified_at' => now()]);
    $this->student->assignRole('employee');
    Enrollment::create([
        'user_id' => $this->student->id,
        'course_id' => $this->course->id,
        'status' => 'active',
        'enrolled_at' => now(),
    ]);

    $this->outsider = User::factory()->create(['email_verified_at' => now()]);
    $this->outsider->assignRole('employee');
});

it('blocks non-enrolled users from the discussion index', function () {
    $this->actingAs($this->outsider)
        ->get("/learn/{$this->course->slug}/discussions")
        ->assertForbidden();
});

it('lets an enrolled student post a thread', function () {
    $this->actingAs($this->student)
        ->post("/learn/{$this->course->slug}/discussions", [
            'title' => 'Bagaimana cara hitung 5C?',
            'body' => 'Saya bingung di bagian Capacity.',
        ])
        ->assertSessionHas('success');

    $thread = DiscussionThread::first();
    expect($thread)->not->toBeNull();
    expect($thread->user_id)->toBe($this->student->id);
    expect($thread->course_id)->toBe($this->course->id);
    expect($thread->last_reply_at)->not->toBeNull();
});

it('lets an enrolled student reply to a thread and bumps counters', function () {
    $thread = DiscussionThread::create([
        'course_id' => $this->course->id,
        'user_id' => $this->student->id,
        'title' => 'Q', 'body' => 'B',
        'last_reply_at' => now(),
    ]);

    $this->actingAs($this->student)
        ->post("/learn/{$this->course->slug}/discussions/{$thread->id}/replies", [
            'body' => 'Coba lihat lesson 3.',
        ])
        ->assertSessionHas('success');

    $fresh = $thread->fresh();
    expect($fresh->replies_count)->toBe(1);
    expect($fresh->replies()->count())->toBe(1);
});

it('toggles upvote per user (idempotent)', function () {
    $thread = DiscussionThread::create([
        'course_id' => $this->course->id,
        'user_id' => $this->student->id,
        'title' => 'Q', 'body' => 'B',
        'last_reply_at' => now(),
    ]);

    // First click → upvote
    $this->actingAs($this->student)
        ->post("/discussions/threads/{$thread->id}/upvote");
    expect($thread->fresh()->upvotes_count)->toBe(1);
    expect(DB::table('discussion_thread_upvotes')->where('discussion_thread_id', $thread->id)->count())->toBe(1);

    // Second click → undo
    $this->actingAs($this->student)
        ->post("/discussions/threads/{$thread->id}/upvote");
    expect($thread->fresh()->upvotes_count)->toBe(0);
    expect(DB::table('discussion_thread_upvotes')->count())->toBe(0);
});

it('lets the thread owner delete their thread', function () {
    $thread = DiscussionThread::create([
        'course_id' => $this->course->id,
        'user_id' => $this->student->id,
        'title' => 'Q', 'body' => 'B',
    ]);

    $this->actingAs($this->student)
        ->delete("/learn/{$this->course->slug}/discussions/{$thread->id}")
        ->assertSessionHas('success');

    expect(DiscussionThread::find($thread->id))->toBeNull();
});

it('blocks other students from deleting someone elses thread', function () {
    $thread = DiscussionThread::create([
        'course_id' => $this->course->id,
        'user_id' => $this->student->id,
        'title' => 'Q', 'body' => 'B',
    ]);

    $other = User::factory()->create();
    $other->assignRole('employee');
    Enrollment::create([
        'user_id' => $other->id,
        'course_id' => $this->course->id,
        'status' => 'active',
        'enrolled_at' => now(),
    ]);

    $this->actingAs($other)
        ->delete("/learn/{$this->course->slug}/discussions/{$thread->id}")
        ->assertForbidden();

    expect(DiscussionThread::find($thread->id))->not->toBeNull();
});

it('lets the course instructor moderate any thread', function () {
    $instructor = User::factory()->create();
    $instructor->assignRole('instructor');
    $this->course->update(['instructor_id' => $instructor->id]);

    $thread = DiscussionThread::create([
        'course_id' => $this->course->id,
        'user_id' => $this->student->id,
        'title' => 'Q', 'body' => 'B',
    ]);

    $this->actingAs($instructor)
        ->delete("/learn/{$this->course->slug}/discussions/{$thread->id}")
        ->assertSessionHas('success');

    expect(DiscussionThread::find($thread->id))->toBeNull();
});

it('decrements replies_count when a reply is deleted', function () {
    $thread = DiscussionThread::create([
        'course_id' => $this->course->id,
        'user_id' => $this->student->id,
        'title' => 'Q', 'body' => 'B',
        'replies_count' => 0,
    ]);
    $reply = DiscussionReply::create([
        'discussion_thread_id' => $thread->id,
        'user_id' => $this->student->id,
        'body' => 'isi',
    ]);
    $thread->update(['replies_count' => 1]);

    $this->actingAs($this->student)
        ->delete("/learn/{$this->course->slug}/discussions/{$thread->id}/replies/{$reply->id}")
        ->assertSessionHas('success');

    expect(DiscussionReply::find($reply->id))->toBeNull();
    expect($thread->fresh()->replies_count)->toBe(0);
});
