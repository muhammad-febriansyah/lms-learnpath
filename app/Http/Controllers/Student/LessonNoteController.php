<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonNote;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LessonNoteController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $notes = LessonNote::query()
            ->where('user_id', $user->id)
            ->with([
                'course:id,title,slug',
                'lesson:id,title,course_section_id',
            ])
            ->when($request->filled('course_id'), fn ($q) => $q->where('course_id', $request->integer('course_id')))
            ->latest('id')
            ->get()
            ->map(fn (LessonNote $n) => $this->transform($n));

        $courseOptions = LessonNote::query()
            ->where('user_id', $user->id)
            ->with('course:id,title,slug')
            ->get()
            ->pluck('course')
            ->unique('id')
            ->filter()
            ->values()
            ->map(fn ($c) => ['id' => $c->id, 'title' => $c->title, 'slug' => $c->slug]);

        return Inertia::render('student/my-notes/index', [
            'notes' => $notes,
            'courseOptions' => $courseOptions,
            'filters' => [
                'course_id' => $request->integer('course_id') ?: null,
            ],
        ]);
    }

    public function store(Request $request, Lesson $lesson): RedirectResponse
    {
        $data = $this->validated($request);
        $user = $request->user();

        $this->assertEnrolled($user->id, $lesson);

        LessonNote::create([
            'user_id' => $user->id,
            'course_id' => $lesson->course_id,
            'lesson_id' => $lesson->id,
            'timestamp_seconds' => $data['timestamp_seconds'] ?? null,
            'content' => $data['content'],
        ]);

        return back()->with('success', 'Catatan disimpan.');
    }

    public function update(Request $request, LessonNote $note): RedirectResponse
    {
        abort_unless($note->user_id === $request->user()->id, 403);

        $data = $this->validated($request);

        $note->update([
            'content' => $data['content'],
            'timestamp_seconds' => $data['timestamp_seconds'] ?? $note->timestamp_seconds,
        ]);

        return back()->with('success', 'Catatan diperbarui.');
    }

    public function destroy(Request $request, LessonNote $note): RedirectResponse
    {
        abort_unless($note->user_id === $request->user()->id, 403);

        $note->delete();

        return back()->with('success', 'Catatan dihapus.');
    }

    /**
     * @return array{content: string, timestamp_seconds: ?int}
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'content' => ['required', 'string', 'max:5000'],
            'timestamp_seconds' => ['nullable', 'integer', 'min:0', 'max:86400'],
        ]);
    }

    private function assertEnrolled(int $userId, Lesson $lesson): void
    {
        $enrolled = Enrollment::query()
            ->where('user_id', $userId)
            ->where('course_id', $lesson->course_id)
            ->whereIn('status', ['active', 'completed'])
            ->exists();

        abort_unless($enrolled, 403, 'Anda belum terdaftar di course ini.');
    }

    /**
     * @return array<string, mixed>
     */
    private function transform(LessonNote $note): array
    {
        return [
            'id' => $note->id,
            'content' => $note->content,
            'timestamp_seconds' => $note->timestamp_seconds,
            'created_at' => $note->created_at?->toIso8601String(),
            'updated_at' => $note->updated_at?->toIso8601String(),
            'course' => $note->course ? [
                'id' => $note->course->id,
                'title' => $note->course->title,
                'slug' => $note->course->slug,
            ] : null,
            'lesson' => $note->lesson ? [
                'id' => $note->lesson->id,
                'title' => $note->lesson->title,
            ] : null,
        ];
    }
}
