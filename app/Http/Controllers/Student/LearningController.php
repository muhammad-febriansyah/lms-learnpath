<?php

namespace App\Http\Controllers\Student;

use App\Actions\Learning\MarkLessonComplete;
use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\ChatThread;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonNote;
use App\Models\LessonProgress;
use App\Models\Review;
use App\Services\AI\AiQuotaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LearningController extends Controller
{
    public function show(Request $request, Course $course): Response|RedirectResponse
    {
        $userId = $request->user()->id;

        $enrollment = Enrollment::query()
            ->where('user_id', $userId)
            ->where('course_id', $course->id)
            ->first();

        if (! $enrollment) {
            return redirect()
                ->route('courses.show', ['course' => $course->slug])
                ->with('error', 'Anda belum terdaftar di kursus ini.');
        }

        $course->load([
            'sections' => fn ($q) => $q->orderBy('sort_order'),
            'sections.lessons' => fn ($q) => $q->orderBy('sort_order'),
            'category:id,name',
            'instructor:id,name',
        ]);

        $progressMap = LessonProgress::query()
            ->where('user_id', $userId)
            ->where('course_id', $course->id)
            ->get()
            ->keyBy('lesson_id');

        // Pilih lesson aktif: lesson pertama yang belum completed, atau lesson pertama
        $firstLesson = $course->sections
            ->flatMap->lessons
            ->first(fn ($l) => ! isset($progressMap[$l->id]) || $progressMap[$l->id]->status !== 'completed');

        if (! $firstLesson) {
            $firstLesson = $course->sections->flatMap->lessons->first();
        }

        if (! $firstLesson) {
            return Inertia::render('student/learn/empty', [
                'course' => $course->only(['id', 'title', 'slug']),
            ]);
        }

        return redirect()->route('learn.lesson', [
            'course' => $course->slug,
            'lesson' => $firstLesson->id,
        ]);
    }

    public function lesson(Request $request, Course $course, Lesson $lesson): Response|RedirectResponse
    {
        $userId = $request->user()->id;

        if ($lesson->course_id !== $course->id) {
            abort(404);
        }

        $enrollment = Enrollment::query()
            ->where('user_id', $userId)
            ->where('course_id', $course->id)
            ->first();

        if (! $enrollment) {
            return redirect()
                ->route('courses.show', ['course' => $course->slug])
                ->with('error', 'Anda belum terdaftar di kursus ini.');
        }

        $course->load([
            'sections' => fn ($q) => $q->orderBy('sort_order'),
            'sections.lessons' => fn ($q) => $q->orderBy('sort_order'),
            'category:id,name',
            'instructor:id,name',
            'preTest:id,course_id,title,type,passing_score,max_attempts,duration_minutes',
            'postTest:id,course_id,title,type,passing_score,max_attempts,duration_minutes',
        ]);

        $progressMap = LessonProgress::query()
            ->where('user_id', $userId)
            ->where('course_id', $course->id)
            ->get()
            ->keyBy('lesson_id')
            ->map(fn ($p) => [
                'status' => $p->status,
                'progress_percent' => $p->progress_percent,
                'completed_at' => $p->completed_at,
            ]);

        // Tentukan prev & next
        $allLessons = $course->sections->flatMap->lessons->values();
        $currentIndex = $allLessons->search(fn ($l) => $l->id === $lesson->id);
        $prevLesson = $currentIndex > 0 ? $allLessons[$currentIndex - 1] : null;
        $nextLesson = $currentIndex < $allLessons->count() - 1 ? $allLessons[$currentIndex + 1] : null;

        $tutorThread = $this->resolveTutorThread($userId, $course->id, $lesson->id);

        return Inertia::render('student/learn/show', [
            'course' => $course,
            'enrollment' => [
                'id' => $enrollment->id,
                'status' => $enrollment->status,
                'progress_percent' => (int) $enrollment->progress_percent,
                'pre_test_status' => $enrollment->pre_test_status,
                'post_test_status' => $enrollment->post_test_status,
            ],
            'currentLesson' => $lesson,
            'progress' => $progressMap,
            'prevLesson' => $prevLesson ? $prevLesson->only(['id', 'title']) : null,
            'nextLesson' => $nextLesson ? $nextLesson->only(['id', 'title']) : null,
            'assessments' => [
                'pre_test' => $course->preTest ? [
                    'id' => $course->preTest->id,
                    'title' => $course->preTest->title,
                    'passing_score' => (int) $course->preTest->passing_score,
                    'status' => $enrollment->pre_test_status,
                ] : null,
                'post_test' => $course->postTest ? [
                    'id' => $course->postTest->id,
                    'title' => $course->postTest->title,
                    'passing_score' => (int) $course->postTest->passing_score,
                    'status' => $enrollment->post_test_status,
                    'is_required' => (bool) $course->post_test_required,
                ] : null,
            ],
            'tutorThread' => $tutorThread,
            'tutorAvailable' => ((string) config('services.openai.api_key')) !== '',
            'tutorQuota' => app(AiQuotaService::class)->withinQuota($request->user()),
            'myReview' => $this->resolveMyReview($userId, $course->id),
            'lessonNotes' => $this->resolveLessonNotes($userId, $lesson->id),
        ]);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function resolveLessonNotes(int $userId, int $lessonId): array
    {
        return LessonNote::query()
            ->where('user_id', $userId)
            ->where('lesson_id', $lessonId)
            ->latest('id')
            ->get()
            ->map(fn (LessonNote $n) => [
                'id' => $n->id,
                'content' => $n->content,
                'timestamp_seconds' => $n->timestamp_seconds,
                'created_at' => $n->created_at?->toIso8601String(),
                'updated_at' => $n->updated_at?->toIso8601String(),
            ])
            ->all();
    }

    /**
     * @return array{id: int, rating: int, content: ?string}|null
     */
    private function resolveMyReview(int $userId, int $courseId): ?array
    {
        $review = Review::query()
            ->where('user_id', $userId)
            ->where('course_id', $courseId)
            ->first();

        if (! $review) {
            return null;
        }

        return [
            'id' => $review->id,
            'rating' => (int) $review->rating,
            'content' => $review->content,
        ];
    }

    /**
     * Latest AI Tutor thread for this user scoped to the current course+lesson,
     * or just this course if no lesson-specific thread exists.
     */
    private function resolveTutorThread(int $userId, int $courseId, int $lessonId): ?array
    {
        $thread = ChatThread::query()
            ->where('user_id', $userId)
            ->where(function ($q) use ($courseId, $lessonId) {
                $q->where('lesson_id', $lessonId)
                    ->orWhere(function ($qq) use ($courseId) {
                        $qq->where('course_id', $courseId)->whereNull('lesson_id');
                    });
            })
            ->orderByRaw('CASE WHEN lesson_id IS NULL THEN 1 ELSE 0 END')
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->with(['messages'])
            ->first();

        if (! $thread) {
            return null;
        }

        return [
            'id' => $thread->id,
            'title' => $thread->title ?? 'Percakapan',
            'last_message_at' => $thread->last_message_at?->toIso8601String(),
            'messages' => $thread->messages
                ->filter(fn (ChatMessage $m) => $m->role !== ChatMessage::ROLE_SYSTEM)
                ->map(fn (ChatMessage $m) => [
                    'id' => $m->id,
                    'role' => $m->role,
                    'content' => $m->content,
                    'created_at' => $m->created_at?->toIso8601String(),
                ])
                ->values(),
        ];
    }

    public function complete(Request $request, Lesson $lesson, MarkLessonComplete $action): RedirectResponse
    {
        $user = $request->user();

        $enrollment = Enrollment::query()
            ->where('user_id', $user->id)
            ->where('course_id', $lesson->course_id)
            ->first();

        if (! $enrollment) {
            return back()->with('error', 'Anda belum terdaftar di kursus ini.');
        }

        $action->execute($user, $lesson);

        return back()->with('success', 'Lesson ditandai selesai.');
    }
}
