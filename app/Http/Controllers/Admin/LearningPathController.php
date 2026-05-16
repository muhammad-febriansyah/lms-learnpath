<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\LearningPathRequest;
use App\Models\Course;
use App\Models\LearningPath;
use App\Models\Position;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LearningPathController extends Controller
{
    public function index(Request $request): Response
    {
        $this->ensureCanManage();

        $paths = LearningPath::query()
            ->with(['position:id,name'])
            ->withCount(['courses', 'enrollments'])
            ->when($request->string('search')->toString(), function ($q, $search) {
                $q->where('title', 'like', "%{$search}%");
            })
            ->when($request->string('status')->toString(), function ($q, $status) {
                if ($status === 'published') {
                    $q->where('is_published', true);
                } elseif ($status === 'draft') {
                    $q->where('is_published', false);
                }
            })
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/learning-paths/index', [
            'paths' => $paths,
            'filters' => $request->only('search', 'status'),
        ]);
    }

    public function create(): Response
    {
        $this->ensureCanManage();

        return Inertia::render('admin/learning-paths/form', [
            'path' => null,
            'positions' => $this->positionOptions(),
        ]);
    }

    public function store(LearningPathRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['is_published'] = $data['is_published'] ?? false;
        if ($data['is_published'] && empty($data['published_at'] ?? null)) {
            $data['published_at'] = now();
        }
        $data['total_courses'] = 0;

        $path = LearningPath::create($data);

        return redirect()
            ->route('admin.learning-paths.show', $path)
            ->with('success', 'Learning path dibuat. Sekarang tambahkan course ke path.');
    }

    public function show(LearningPath $learningPath): Response
    {
        $this->ensureCanManage();

        $learningPath->load([
            'position:id,name',
            'courses' => fn ($q) => $q->orderBy('learning_path_courses.sort_order'),
        ]);
        $learningPath->loadCount('enrollments');

        $attachedIds = $learningPath->courses->pluck('id')->all();
        $availableCourses = Course::query()
            ->whereNotIn('id', $attachedIds)
            ->where('is_published', true)
            ->orderBy('title')
            ->get(['id', 'title', 'level', 'duration_minutes'])
            ->map(fn (Course $c) => [
                'id' => $c->id,
                'title' => $c->title,
                'level' => $c->level,
                'duration_minutes' => (int) $c->duration_minutes,
            ])
            ->all();

        return Inertia::render('admin/learning-paths/show', [
            'path' => [
                'id' => $learningPath->id,
                'title' => $learningPath->title,
                'slug' => $learningPath->slug,
                'subtitle' => $learningPath->subtitle,
                'level' => $learningPath->level,
                'duration_weeks' => $learningPath->duration_weeks,
                'is_published' => (bool) $learningPath->is_published,
                'total_courses' => $learningPath->courses->count(),
                'total_students' => $learningPath->total_students,
                'enrollments_count' => $learningPath->enrollments_count,
                'position' => $learningPath->position ? [
                    'id' => $learningPath->position->id,
                    'name' => $learningPath->position->name,
                ] : null,
                'courses' => $learningPath->courses->map(fn (Course $c) => [
                    'id' => $c->id,
                    'title' => $c->title,
                    'level' => $c->level,
                    'duration_minutes' => (int) $c->duration_minutes,
                    'sort_order' => (int) $c->pivot->sort_order,
                    'is_required' => (bool) $c->pivot->is_required,
                ])->values(),
            ],
            'availableCourses' => $availableCourses,
        ]);
    }

    public function edit(LearningPath $learningPath): Response
    {
        $this->ensureCanManage();

        return Inertia::render('admin/learning-paths/form', [
            'path' => [
                'id' => $learningPath->id,
                'title' => $learningPath->title,
                'slug' => $learningPath->slug,
                'subtitle' => $learningPath->subtitle,
                'description' => $learningPath->description,
                'thumbnail' => $learningPath->thumbnail,
                'level' => $learningPath->level,
                'duration_weeks' => $learningPath->duration_weeks,
                'position_id' => $learningPath->position_id,
                'target_audience' => $learningPath->target_audience,
                'outcomes' => $learningPath->outcomes,
                'is_published' => (bool) $learningPath->is_published,
            ],
            'positions' => $this->positionOptions(),
        ]);
    }

    public function update(LearningPathRequest $request, LearningPath $learningPath): RedirectResponse
    {
        $data = $request->validated();
        $data['is_published'] = $data['is_published'] ?? $learningPath->is_published;
        if ($data['is_published'] && ! $learningPath->published_at) {
            $data['published_at'] = now();
        }

        $learningPath->update($data);

        return redirect()
            ->route('admin.learning-paths.show', $learningPath)
            ->with('success', 'Learning path diperbarui.');
    }

    public function destroy(LearningPath $learningPath): RedirectResponse
    {
        $this->ensureCanManage();
        $learningPath->delete();

        return redirect()
            ->route('admin.learning-paths.index')
            ->with('success', 'Learning path dihapus.');
    }

    public function attachCourse(Request $request, LearningPath $learningPath): RedirectResponse
    {
        $this->ensureCanManage();

        $data = $request->validate([
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'is_required' => ['boolean'],
        ]);

        if ($learningPath->courses()->where('courses.id', $data['course_id'])->exists()) {
            return back()->with('info', 'Course sudah terdaftar di path ini.');
        }

        $nextSort = (int) DB::table('learning_path_courses')
            ->where('learning_path_id', $learningPath->id)
            ->max('sort_order') + 1;

        $learningPath->courses()->attach($data['course_id'], [
            'sort_order' => $nextSort,
            'is_required' => $data['is_required'] ?? true,
        ]);

        $learningPath->update(['total_courses' => $learningPath->courses()->count()]);

        return back()->with('success', 'Course ditambahkan ke path.');
    }

    public function detachCourse(LearningPath $learningPath, Course $course): RedirectResponse
    {
        $this->ensureCanManage();

        $learningPath->courses()->detach($course->id);
        $learningPath->update(['total_courses' => $learningPath->courses()->count()]);

        return back()->with('success', 'Course dilepas dari path.');
    }

    public function reorderCourses(Request $request, LearningPath $learningPath): RedirectResponse
    {
        $this->ensureCanManage();

        $data = $request->validate([
            'course_ids' => ['required', 'array', 'min:1'],
            'course_ids.*' => ['integer', 'exists:courses,id'],
        ]);

        DB::transaction(function () use ($learningPath, $data) {
            foreach ($data['course_ids'] as $idx => $courseId) {
                DB::table('learning_path_courses')
                    ->where('learning_path_id', $learningPath->id)
                    ->where('course_id', $courseId)
                    ->update(['sort_order' => $idx + 1]);
            }
        });

        return back()->with('success', 'Urutan course diperbarui.');
    }

    private function ensureCanManage(): void
    {
        if (! (auth()->user()?->can('learning_path.manage') ?? false)) {
            throw new AuthorizationException('Tidak diizinkan.');
        }
    }

    /**
     * @return array<int, array{id: int, name: string}>
     */
    private function positionOptions(): array
    {
        return Position::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Position $p) => ['id' => $p->id, 'name' => $p->name])
            ->all();
    }
}
