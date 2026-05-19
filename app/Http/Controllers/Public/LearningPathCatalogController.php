<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\LearningPath;
use App\Models\LearningPathEnrollment;
use App\Support\PointOfferPresenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LearningPathCatalogController extends Controller
{
    public function index(Request $request): Response
    {
        $paths = LearningPath::query()
            ->where('is_published', true)
            ->with(['position:id,name,division'])
            ->withCount(['courses', 'enrollments'])
            ->when($request->string('level')->toString(), function ($q, $level) {
                $q->where('level', $level);
            })
            ->when($request->string('search')->toString(), function ($q, $search) {
                $q->where(function ($qq) use ($search) {
                    $qq->where('title', 'like', "%{$search}%")
                        ->orWhere('subtitle', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('total_students')
            ->orderByDesc('id')
            ->paginate(9)
            ->withQueryString();

        return Inertia::render('public/paths/index', [
            'paths' => $paths,
            'filters' => $request->only('search', 'level'),
        ]);
    }

    public function show(Request $request, LearningPath $path): Response
    {
        abort_unless($path->is_published, 404);

        $path->load([
            'position:id,name,division',
            'courses' => fn ($q) => $q->orderBy('learning_path_courses.sort_order'),
            'courses.category:id,name,slug',
            'courses.instructor:id,name',
        ]);
        $path->loadCount('enrollments');

        $userEnrollment = null;
        $courseProgress = [];

        if ($user = $request->user()) {
            $userEnrollment = LearningPathEnrollment::query()
                ->where('user_id', $user->id)
                ->where('learning_path_id', $path->id)
                ->first();

            $courseProgress = $user->enrollments()
                ->whereIn('course_id', $path->courses->pluck('id'))
                ->get(['course_id', 'status', 'progress_percent'])
                ->keyBy('course_id')
                ->map(fn ($e) => [
                    'status' => $e->status,
                    'progress_percent' => (int) $e->progress_percent,
                ])
                ->all();
        }

        return Inertia::render('public/paths/show', [
            'path' => [
                'id' => $path->id,
                'title' => $path->title,
                'slug' => $path->slug,
                'subtitle' => $path->subtitle,
                'description' => $path->description,
                'thumbnail' => $path->thumbnail,
                'level' => $path->level,
                'duration_weeks' => $path->duration_weeks,
                'target_audience' => $path->target_audience,
                'outcomes' => $path->outcomes,
                'total_courses' => $path->total_courses ?: $path->courses->count(),
                'total_students' => $path->total_students,
                'enrollments_count' => $path->enrollments_count,
                'price' => (int) $path->price,
                'compare_at_price' => $path->compare_at_price,
                'savings' => $path->savings(),
                'position' => $path->position ? [
                    'id' => $path->position->id,
                    'name' => $path->position->name,
                    'division' => $path->position->division,
                ] : null,
                'courses' => $path->courses->map(fn ($c) => [
                    'id' => $c->id,
                    'title' => $c->title,
                    'slug' => $c->slug,
                    'subtitle' => $c->subtitle,
                    'thumbnail' => $c->thumbnail,
                    'duration_minutes' => (int) $c->duration_minutes,
                    'level' => $c->level,
                    'category' => $c->category ? ['id' => $c->category->id, 'name' => $c->category->name] : null,
                    'instructor' => $c->instructor ? ['id' => $c->instructor->id, 'name' => $c->instructor->name] : null,
                    'sort_order' => (int) $c->pivot->sort_order,
                    'is_required' => (bool) $c->pivot->is_required,
                ])->values(),
            ],
            'userEnrollment' => $userEnrollment ? [
                'status' => $userEnrollment->status,
                'progress_percent' => (int) $userEnrollment->progress_percent,
                'courses_completed' => (int) $userEnrollment->courses_completed,
                'enrolled_at' => $userEnrollment->enrolled_at?->toIso8601String(),
                'completed_at' => $userEnrollment->completed_at?->toIso8601String(),
            ] : null,
            'courseProgress' => $courseProgress,
            'pointOffer' => PointOfferPresenter::for($path, $request->user()),
        ]);
    }
}
