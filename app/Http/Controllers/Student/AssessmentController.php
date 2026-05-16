<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Assessment;
use App\Models\AssessmentAttempt;
use App\Models\Course;
use App\Models\Enrollment;
use App\Services\Learning\AssessmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class AssessmentController extends Controller
{
    public function __construct(
        private readonly AssessmentService $service,
    ) {}

    public function show(Request $request, Course $course, Assessment $assessment): Response|RedirectResponse
    {
        abort_unless($assessment->course_id === $course->id, 404);

        $userId = $request->user()->id;
        $enrollment = $this->resolveEnrollment($userId, $course);
        if ($enrollment instanceof RedirectResponse) {
            return $enrollment;
        }

        $attempts = AssessmentAttempt::query()
            ->where('assessment_id', $assessment->id)
            ->where('user_id', $userId)
            ->orderByDesc('id')
            ->get(['id', 'started_at', 'submitted_at', 'score', 'status', 'passed']);

        $submittedCount = $attempts->where('status', 'submitted')->count();
        $hasInProgress = $attempts->where('status', 'in_progress')->isNotEmpty();
        $hasPassed = $attempts->where('passed', true)->isNotEmpty();
        $attemptsLeft = max(0, (int) $assessment->max_attempts - $submittedCount);
        $canStart = ! $hasPassed && ($hasInProgress || $attemptsLeft > 0);

        return Inertia::render('student/assessments/show', [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
            ],
            'assessment' => [
                'id' => $assessment->id,
                'title' => $assessment->title,
                'type' => $assessment->type,
                'description' => $assessment->description,
                'passing_score' => (int) $assessment->passing_score,
                'max_attempts' => (int) $assessment->max_attempts,
                'duration_minutes' => $assessment->duration_minutes,
                'question_count' => $assessment->questions()->count(),
            ],
            'attempts' => $attempts->map(fn (AssessmentAttempt $a) => [
                'id' => $a->id,
                'started_at' => $a->started_at?->toIso8601String(),
                'submitted_at' => $a->submitted_at?->toIso8601String(),
                'score' => (int) $a->score,
                'status' => $a->status,
                'passed' => (bool) $a->passed,
            ]),
            'state' => [
                'submitted_count' => $submittedCount,
                'attempts_left' => $attemptsLeft,
                'has_in_progress' => $hasInProgress,
                'has_passed' => $hasPassed,
                'can_start' => $canStart,
            ],
        ]);
    }

    public function start(Request $request, Course $course, Assessment $assessment): RedirectResponse
    {
        abort_unless($assessment->course_id === $course->id, 404);

        $enrollment = $this->resolveEnrollment($request->user()->id, $course);
        if ($enrollment instanceof RedirectResponse) {
            return $enrollment;
        }

        try {
            $attempt = $this->service->startAttempt($request->user(), $assessment);
        } catch (RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()->route('assessments.take', [
            'course' => $course->slug,
            'assessment' => $assessment->id,
            'attempt' => $attempt->id,
        ]);
    }

    public function take(Request $request, Course $course, Assessment $assessment, AssessmentAttempt $attempt): Response|RedirectResponse
    {
        abort_unless($assessment->course_id === $course->id, 404);
        abort_unless($attempt->assessment_id === $assessment->id, 404);
        abort_unless($attempt->user_id === $request->user()->id, 403);

        if ($attempt->status === 'submitted') {
            return redirect()->route('assessments.result', [
                'course' => $course->slug,
                'assessment' => $assessment->id,
                'attempt' => $attempt->id,
            ]);
        }

        $assessment->load('questions.options');

        return Inertia::render('student/assessments/take', [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
            ],
            'assessment' => [
                'id' => $assessment->id,
                'title' => $assessment->title,
                'type' => $assessment->type,
                'description' => $assessment->description,
                'passing_score' => (int) $assessment->passing_score,
                'duration_minutes' => $assessment->duration_minutes,
            ],
            'attempt' => [
                'id' => $attempt->id,
                'started_at' => $attempt->started_at?->toIso8601String(),
            ],
            'questions' => $assessment->questions->map(fn ($q) => [
                'id' => $q->id,
                'question_text' => $q->question_text,
                'points' => (int) $q->points,
                'options' => $q->options->map(fn ($o) => [
                    'id' => $o->id,
                    'option_text' => $o->option_text,
                ])->values(),
            ])->values(),
        ]);
    }

    public function submit(Request $request, Course $course, Assessment $assessment, AssessmentAttempt $attempt): RedirectResponse
    {
        abort_unless($assessment->course_id === $course->id, 404);
        abort_unless($attempt->assessment_id === $assessment->id, 404);
        abort_unless($attempt->user_id === $request->user()->id, 403);

        $data = $request->validate([
            'answers' => ['required', 'array'],
            'answers.*' => ['nullable', 'integer'],
        ]);

        try {
            $this->service->submitAttempt($attempt, $data['answers']);
        } catch (RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()->route('assessments.result', [
            'course' => $course->slug,
            'assessment' => $assessment->id,
            'attempt' => $attempt->id,
        ]);
    }

    public function result(Request $request, Course $course, Assessment $assessment, AssessmentAttempt $attempt): Response
    {
        abort_unless($assessment->course_id === $course->id, 404);
        abort_unless($attempt->assessment_id === $assessment->id, 404);
        abort_unless($attempt->user_id === $request->user()->id, 403);
        abort_unless($attempt->status === 'submitted', 404);

        $attempt->load(['answers', 'assessment.questions.options']);

        $answerByQuestion = $attempt->answers->keyBy('question_id');

        return Inertia::render('student/assessments/result', [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
            ],
            'assessment' => [
                'id' => $assessment->id,
                'title' => $assessment->title,
                'type' => $assessment->type,
                'passing_score' => (int) $assessment->passing_score,
            ],
            'attempt' => [
                'id' => $attempt->id,
                'submitted_at' => $attempt->submitted_at?->toIso8601String(),
                'score' => (int) $attempt->score,
                'passed' => (bool) $attempt->passed,
            ],
            'questions' => $attempt->assessment->questions->map(function ($q) use ($answerByQuestion) {
                $answer = $answerByQuestion->get($q->id);

                return [
                    'id' => $q->id,
                    'question_text' => $q->question_text,
                    'points' => (int) $q->points,
                    'options' => $q->options->map(fn ($o) => [
                        'id' => $o->id,
                        'option_text' => $o->option_text,
                        'is_correct' => (bool) $o->is_correct,
                    ])->values(),
                    'selected_option_id' => $answer?->selected_option_id,
                    'is_correct' => (bool) ($answer?->is_correct ?? false),
                    'point_earned' => (int) ($answer?->point_earned ?? 0),
                ];
            })->values(),
        ]);
    }

    private function resolveEnrollment(int $userId, Course $course): Enrollment|RedirectResponse
    {
        $enrollment = Enrollment::query()
            ->where('user_id', $userId)
            ->where('course_id', $course->id)
            ->first();

        if (! $enrollment) {
            return redirect()
                ->route('courses.show', ['course' => $course->slug])
                ->with('error', 'Anda belum terdaftar di kursus ini.');
        }

        return $enrollment;
    }
}
