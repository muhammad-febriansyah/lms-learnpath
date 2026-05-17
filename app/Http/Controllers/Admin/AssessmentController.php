<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AssessmentQuestionRequest;
use App\Http\Requests\Admin\AssessmentRequest;
use App\Models\Assessment;
use App\Models\Course;
use App\Models\Question;
use App\Models\QuestionOption;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AssessmentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isInstructorOnly = $user->hasRole('instructor')
            && ! $user->hasAnyRole(['superadmin', 'admin_tenant']);

        $assessments = Assessment::query()
            ->with(['course:id,title,slug'])
            ->withCount(['questions', 'attempts'])
            ->when($isInstructorOnly, function ($query) use ($user) {
                $query->whereHas('course', fn ($q) => $q->forInstructor($user->id));
            })
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where('title', 'like', "%{$search}%");
            })
            ->when($request->string('type')->toString(), function ($query, $type) {
                $query->where('type', $type);
            })
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/assessments/index', [
            'assessments' => $assessments,
            'filters' => $request->only('search', 'type'),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->ensureCanManage();

        return Inertia::render('admin/assessments/form', [
            'assessment' => null,
            'courses' => $this->courseOptions(),
            'preselectedCourseId' => $request->integer('course_id') ?: null,
        ]);
    }

    public function store(AssessmentRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['is_required'] = $data['is_required'] ?? true;
        $data['sort_order'] = $data['sort_order'] ?? 0;

        $assessment = Assessment::create($data);

        return redirect()
            ->route('admin.assessments.show', $assessment)
            ->with('success', 'Assessment dibuat. Sekarang tambahkan soal.');
    }

    public function show(Assessment $assessment): Response
    {
        $this->ensureCanManage();

        $assessment->load([
            'course:id,title,slug',
            'questions' => fn ($q) => $q->orderBy('sort_order')->orderBy('id'),
            'questions.options' => fn ($q) => $q->orderBy('sort_order')->orderBy('id'),
        ]);
        $assessment->loadCount('attempts');

        return Inertia::render('admin/assessments/show', [
            'assessment' => [
                'id' => $assessment->id,
                'title' => $assessment->title,
                'type' => $assessment->type,
                'description' => $assessment->description,
                'passing_score' => (int) $assessment->passing_score,
                'max_attempts' => (int) $assessment->max_attempts,
                'duration_minutes' => $assessment->duration_minutes,
                'is_required' => (bool) $assessment->is_required,
                'sort_order' => (int) $assessment->sort_order,
                'attempts_count' => $assessment->attempts_count,
                'course' => $assessment->course ? [
                    'id' => $assessment->course->id,
                    'title' => $assessment->course->title,
                    'slug' => $assessment->course->slug,
                ] : null,
                'questions' => $assessment->questions->map(fn ($q) => [
                    'id' => $q->id,
                    'question_text' => $q->question_text,
                    'points' => (int) $q->points,
                    'sort_order' => (int) $q->sort_order,
                    'options' => $q->options->map(fn ($o) => [
                        'id' => $o->id,
                        'option_text' => $o->option_text,
                        'is_correct' => (bool) $o->is_correct,
                        'sort_order' => (int) $o->sort_order,
                    ])->values(),
                ])->values(),
            ],
        ]);
    }

    public function edit(Assessment $assessment): Response
    {
        $this->ensureCanManage();

        return Inertia::render('admin/assessments/form', [
            'assessment' => [
                'id' => $assessment->id,
                'course_id' => $assessment->course_id,
                'title' => $assessment->title,
                'type' => $assessment->type,
                'description' => $assessment->description,
                'passing_score' => (int) $assessment->passing_score,
                'max_attempts' => (int) $assessment->max_attempts,
                'duration_minutes' => $assessment->duration_minutes,
                'is_required' => (bool) $assessment->is_required,
                'sort_order' => (int) $assessment->sort_order,
            ],
            'courses' => $this->courseOptions(),
        ]);
    }

    public function update(AssessmentRequest $request, Assessment $assessment): RedirectResponse
    {
        $data = $request->validated();
        $data['is_required'] = $data['is_required'] ?? $assessment->is_required;
        $data['sort_order'] = $data['sort_order'] ?? $assessment->sort_order;

        $assessment->update($data);

        return redirect()
            ->route('admin.assessments.show', $assessment)
            ->with('success', 'Assessment diperbarui.');
    }

    public function destroy(Assessment $assessment): RedirectResponse
    {
        $this->ensureCanManage();

        $assessment->delete();

        return redirect()
            ->route('admin.assessments.index')
            ->with('success', 'Assessment dihapus.');
    }

    public function storeQuestion(AssessmentQuestionRequest $request, Assessment $assessment): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($assessment, $data) {
            $nextSort = (int) ($assessment->questions()->max('sort_order') ?? 0) + 1;

            $question = Question::create([
                'assessment_id' => $assessment->id,
                'question_text' => $data['question_text'],
                'type' => 'multiple_choice',
                'points' => $data['points'],
                'sort_order' => $data['sort_order'] ?? $nextSort,
            ]);

            foreach ($data['options'] as $idx => $opt) {
                QuestionOption::create([
                    'question_id' => $question->id,
                    'option_text' => $opt['option_text'],
                    'is_correct' => (bool) $opt['is_correct'],
                    'sort_order' => $idx + 1,
                ]);
            }
        });

        return back()->with('success', 'Soal baru ditambahkan.');
    }

    public function updateQuestion(
        AssessmentQuestionRequest $request,
        Assessment $assessment,
        Question $question,
    ): RedirectResponse {
        abort_unless($question->assessment_id === $assessment->id, 404);

        $data = $request->validated();

        DB::transaction(function () use ($question, $data) {
            $question->update([
                'question_text' => $data['question_text'],
                'points' => $data['points'],
                'sort_order' => $data['sort_order'] ?? $question->sort_order,
            ]);

            $question->options()->delete();
            foreach ($data['options'] as $idx => $opt) {
                QuestionOption::create([
                    'question_id' => $question->id,
                    'option_text' => $opt['option_text'],
                    'is_correct' => (bool) $opt['is_correct'],
                    'sort_order' => $idx + 1,
                ]);
            }
        });

        return back()->with('success', 'Soal diperbarui.');
    }

    public function destroyQuestion(
        Request $request,
        Assessment $assessment,
        Question $question,
    ): RedirectResponse {
        $this->ensureCanManage();
        abort_unless($question->assessment_id === $assessment->id, 404);

        $question->delete();

        return back()->with('success', 'Soal dihapus.');
    }

    private function ensureCanManage(): void
    {
        if (! (auth()->user()?->can('assessment.manage') ?? false)) {
            throw new AuthorizationException('Tidak diizinkan.');
        }
    }

    /**
     * @return array<int, array{id: int, title: string}>
     */
    private function courseOptions(): array
    {
        return Course::query()
            ->orderBy('title')
            ->get(['id', 'title'])
            ->map(fn (Course $c) => ['id' => $c->id, 'title' => $c->title])
            ->all();
    }
}
