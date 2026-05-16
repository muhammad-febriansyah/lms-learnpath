<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\ChatThread;
use App\Models\Course;
use App\Models\Lesson;
use App\Services\AI\AiQuotaService;
use App\Services\AI\TutorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class TutorController extends Controller
{
    public function __construct(
        private readonly TutorService $service,
        private readonly AiQuotaService $quota,
    ) {}

    public function index(Request $request): Response
    {
        $threads = ChatThread::query()
            ->where('user_id', $request->user()->id)
            ->with(['course:id,title,slug', 'lesson:id,title'])
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->limit(50)
            ->get()
            ->map(fn (ChatThread $t) => $this->transformThread($t, withMessages: false));

        return Inertia::render('student/my-tutor/index', [
            'threads' => $threads,
            'activeThread' => null,
            'available' => $this->isAvailable(),
            'quota' => $this->quota->withinQuota($request->user()),
        ]);
    }

    public function show(Request $request, ChatThread $thread): Response
    {
        abort_unless($thread->user_id === $request->user()->id, 403);

        $thread->load(['messages', 'course:id,title,slug', 'lesson:id,title']);

        $threads = ChatThread::query()
            ->where('user_id', $request->user()->id)
            ->with(['course:id,title,slug', 'lesson:id,title'])
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->limit(50)
            ->get()
            ->map(fn (ChatThread $t) => $this->transformThread($t, withMessages: false));

        return Inertia::render('student/my-tutor/index', [
            'threads' => $threads,
            'activeThread' => $this->transformThread($thread, withMessages: true),
            'available' => $this->isAvailable(),
            'quota' => $this->quota->withinQuota($request->user()),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'content' => ['required', 'string', 'max:4000'],
            'thread_id' => ['nullable', 'integer', 'exists:chat_threads,id'],
            'course_id' => ['nullable', 'integer', 'exists:courses,id'],
            'lesson_id' => ['nullable', 'integer', 'exists:lessons,id'],
        ]);

        $thread = null;
        if (! empty($data['thread_id'])) {
            $thread = ChatThread::find($data['thread_id']);
            abort_unless($thread && $thread->user_id === $request->user()->id, 403);
        }

        $course = ! empty($data['course_id']) ? Course::find($data['course_id']) : null;
        $lesson = ! empty($data['lesson_id']) ? Lesson::find($data['lesson_id']) : null;

        if (! $this->isAvailable()) {
            return back()->with('error', 'AI Tutor sedang tidak tersedia. Hubungi admin.');
        }

        $quota = $this->quota->withinQuota($request->user());
        if (! $quota['ok']) {
            return back()->with('error', $quota['reason']);
        }

        try {
            $thread = $this->service->sendMessage(
                user: $request->user(),
                userMessage: $data['content'],
                thread: $thread,
                course: $course,
                lesson: $lesson,
            );
        } catch (Throwable $e) {
            return back()->with('error', 'Gagal menghubungi AI Tutor: '.$e->getMessage());
        }

        $redirectTo = $request->input('redirect_to')
            ?: route('my-tutor.show', $thread);

        return redirect($redirectTo)
            ->with('tutor_thread_id', $thread->id);
    }

    public function destroy(Request $request, ChatThread $thread): RedirectResponse
    {
        abort_unless($thread->user_id === $request->user()->id, 403);
        $thread->delete();

        return redirect()->route('my-tutor.index')
            ->with('success', 'Percakapan dihapus.');
    }

    private function transformThread(ChatThread $thread, bool $withMessages): array
    {
        $data = [
            'id' => $thread->id,
            'title' => $thread->title ?? 'Percakapan baru',
            'last_message_at' => $thread->last_message_at?->toIso8601String(),
            'created_at' => $thread->created_at?->toIso8601String(),
            'course' => $thread->course ? [
                'id' => $thread->course->id,
                'title' => $thread->course->title,
                'slug' => $thread->course->slug,
            ] : null,
            'lesson' => $thread->lesson ? [
                'id' => $thread->lesson->id,
                'title' => $thread->lesson->title,
            ] : null,
        ];

        if ($withMessages) {
            $data['messages'] = $thread->messages
                ->filter(fn (ChatMessage $m) => $m->role !== ChatMessage::ROLE_SYSTEM)
                ->map(fn (ChatMessage $m) => [
                    'id' => $m->id,
                    'role' => $m->role,
                    'content' => $m->content,
                    'created_at' => $m->created_at?->toIso8601String(),
                ])
                ->values();
        }

        return $data;
    }

    private function isAvailable(): bool
    {
        return ((string) config('services.openai.api_key')) !== '';
    }
}
