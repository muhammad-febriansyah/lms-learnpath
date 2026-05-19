<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\DiscussionReply;
use App\Models\DiscussionThread;
use App\Models\Enrollment;
use App\Models\User;
use App\Services\Gamification\PointService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DiscussionController extends Controller
{
    public function index(Request $request, Course $course): Response
    {
        $this->authorizeAccess($request->user(), $course);

        $threads = DiscussionThread::query()
            ->where('course_id', $course->id)
            ->with('user:id,name')
            ->orderByDesc('last_reply_at')
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString();

        $userId = $request->user()->id;
        $upvoted = $threads->getCollection()->isNotEmpty()
            ? DB::table('discussion_thread_upvotes')
                ->where('user_id', $userId)
                ->whereIn('discussion_thread_id', $threads->getCollection()->pluck('id'))
                ->pluck('discussion_thread_id')
                ->all()
            : [];

        $threads->getCollection()->transform(fn (DiscussionThread $t) => [
            'id' => $t->id,
            'title' => $t->title,
            'body_excerpt' => mb_substr(strip_tags($t->body), 0, 160),
            'replies_count' => $t->replies_count,
            'upvotes_count' => $t->upvotes_count,
            'last_reply_at' => $t->last_reply_at?->toIso8601String(),
            'created_at' => $t->created_at?->toIso8601String(),
            'user' => $t->user ? ['id' => $t->user->id, 'name' => $t->user->name] : null,
            'has_upvoted' => in_array($t->id, $upvoted, true),
        ]);

        return Inertia::render('student/discussions/index', [
            'course' => ['id' => $course->id, 'title' => $course->title, 'slug' => $course->slug],
            'threads' => $threads,
            'canPost' => true,
        ]);
    }

    public function show(Request $request, Course $course, DiscussionThread $thread): Response
    {
        $this->authorizeAccess($request->user(), $course);
        abort_unless($thread->course_id === $course->id, 404);

        $thread->load('user:id,name');
        $replies = $thread->replies()
            ->with('user:id,name')
            ->orderBy('created_at')
            ->get();

        $userId = $request->user()->id;
        $threadUpvoted = DB::table('discussion_thread_upvotes')
            ->where('discussion_thread_id', $thread->id)
            ->where('user_id', $userId)
            ->exists();
        $upvotedReplyIds = DB::table('discussion_reply_upvotes')
            ->where('user_id', $userId)
            ->whereIn('discussion_reply_id', $replies->pluck('id'))
            ->pluck('discussion_reply_id')
            ->all();

        return Inertia::render('student/discussions/show', [
            'course' => ['id' => $course->id, 'title' => $course->title, 'slug' => $course->slug],
            'thread' => [
                'id' => $thread->id,
                'title' => $thread->title,
                'body' => $thread->body,
                'upvotes_count' => $thread->upvotes_count,
                'has_upvoted' => $threadUpvoted,
                'created_at' => $thread->created_at?->toIso8601String(),
                'user' => $thread->user ? ['id' => $thread->user->id, 'name' => $thread->user->name] : null,
                'can_delete' => $this->canModerate($request->user(), $thread, $course),
                'is_locked' => $thread->locked_at !== null,
            ],
            'replies' => $replies->map(fn (DiscussionReply $r) => [
                'id' => $r->id,
                'body' => $r->body,
                'upvotes_count' => $r->upvotes_count,
                'has_upvoted' => in_array($r->id, $upvotedReplyIds, true),
                'created_at' => $r->created_at?->toIso8601String(),
                'user' => $r->user ? ['id' => $r->user->id, 'name' => $r->user->name] : null,
                'can_delete' => $this->canModerateReply($request->user(), $r, $course),
            ])->values(),
        ]);
    }

    public function store(Request $request, Course $course): RedirectResponse
    {
        $this->authorizeAccess($request->user(), $course);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'body' => ['required', 'string', 'max:5000'],
        ], [
            'required' => ':attribute wajib diisi.',
            'max' => ':attribute terlalu panjang.',
        ], [
            'title' => 'Judul',
            'body' => 'Pesan',
        ]);

        $thread = DiscussionThread::create([
            'course_id' => $course->id,
            'user_id' => $request->user()->id,
            'title' => $data['title'],
            'body' => $data['body'],
            'last_reply_at' => now(),
        ]);

        App::make(PointService::class)
            ->award($request->user(), 'discussion_thread', $thread);

        return redirect()
            ->route('learn.discussions.show', ['course' => $course->slug, 'thread' => $thread->id])
            ->with('success', 'Pertanyaan diposting.');
    }

    public function reply(Request $request, Course $course, DiscussionThread $thread): RedirectResponse
    {
        $this->authorizeAccess($request->user(), $course);
        abort_unless($thread->course_id === $course->id, 404);
        abort_if($thread->locked_at !== null, 403, 'Thread sudah dikunci.');

        $data = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
        ], [
            'required' => ':attribute wajib diisi.',
        ], [
            'body' => 'Balasan',
        ]);

        $reply = DB::transaction(function () use ($data, $thread, $request) {
            $reply = DiscussionReply::create([
                'discussion_thread_id' => $thread->id,
                'user_id' => $request->user()->id,
                'body' => $data['body'],
            ]);
            $thread->forceFill([
                'replies_count' => $thread->replies_count + 1,
                'last_reply_at' => now(),
            ])->save();

            return $reply;
        });

        App::make(PointService::class)
            ->award($request->user(), 'discussion_reply', $reply);

        return back()->with('success', 'Balasan terkirim.');
    }

    public function toggleThreadUpvote(Request $request, DiscussionThread $thread): RedirectResponse
    {
        $userId = $request->user()->id;
        $course = $thread->course;
        abort_unless($course, 404);
        $this->authorizeAccess($request->user(), $course);

        DB::transaction(function () use ($thread, $userId) {
            $existing = DB::table('discussion_thread_upvotes')
                ->where('discussion_thread_id', $thread->id)
                ->where('user_id', $userId)
                ->first();

            if ($existing) {
                DB::table('discussion_thread_upvotes')->where('id', $existing->id)->delete();
                $thread->decrement('upvotes_count');
            } else {
                DB::table('discussion_thread_upvotes')->insert([
                    'discussion_thread_id' => $thread->id,
                    'user_id' => $userId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $thread->increment('upvotes_count');
            }
        });

        return back();
    }

    public function toggleReplyUpvote(Request $request, DiscussionReply $reply): RedirectResponse
    {
        $userId = $request->user()->id;
        $course = $reply->thread?->course;
        abort_unless($course, 404);
        $this->authorizeAccess($request->user(), $course);

        DB::transaction(function () use ($reply, $userId) {
            $existing = DB::table('discussion_reply_upvotes')
                ->where('discussion_reply_id', $reply->id)
                ->where('user_id', $userId)
                ->first();

            if ($existing) {
                DB::table('discussion_reply_upvotes')->where('id', $existing->id)->delete();
                $reply->decrement('upvotes_count');
            } else {
                DB::table('discussion_reply_upvotes')->insert([
                    'discussion_reply_id' => $reply->id,
                    'user_id' => $userId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $reply->increment('upvotes_count');
            }
        });

        return back();
    }

    public function destroyThread(Request $request, Course $course, DiscussionThread $thread): RedirectResponse
    {
        abort_unless($thread->course_id === $course->id, 404);
        abort_unless($this->canModerate($request->user(), $thread, $course), 403);

        $thread->delete();

        return redirect()
            ->route('learn.discussions.index', ['course' => $course->slug])
            ->with('success', 'Pertanyaan dihapus.');
    }

    public function destroyReply(Request $request, Course $course, DiscussionThread $thread, DiscussionReply $reply): RedirectResponse
    {
        abort_unless($thread->course_id === $course->id, 404);
        abort_unless($reply->discussion_thread_id === $thread->id, 404);
        abort_unless($this->canModerateReply($request->user(), $reply, $course), 403);

        DB::transaction(function () use ($reply, $thread) {
            $reply->delete();
            $thread->forceFill(['replies_count' => max(0, $thread->replies_count - 1)])->save();
        });

        return back()->with('success', 'Balasan dihapus.');
    }

    private function authorizeAccess(User $user, Course $course): void
    {
        if ($user->hasAnyRole(['superadmin', 'admin_tenant'])) {
            return;
        }
        if ($course->instructor_id === $user->id) {
            return;
        }
        $enrolled = Enrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->exists();
        abort_unless($enrolled, 403, 'Anda harus enrolled di course ini untuk akses diskusi.');
    }

    private function canModerate(User $user, DiscussionThread $thread, Course $course): bool
    {
        if ($user->hasAnyRole(['superadmin', 'admin_tenant'])) {
            return true;
        }
        if ($course->instructor_id === $user->id) {
            return true;
        }

        return $thread->user_id === $user->id;
    }

    private function canModerateReply(User $user, DiscussionReply $reply, Course $course): bool
    {
        if ($user->hasAnyRole(['superadmin', 'admin_tenant'])) {
            return true;
        }
        if ($course->instructor_id === $user->id) {
            return true;
        }

        return $reply->user_id === $user->id;
    }
}
