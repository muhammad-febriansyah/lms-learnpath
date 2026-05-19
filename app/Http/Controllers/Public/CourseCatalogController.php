<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Review;
use App\Support\PointOfferPresenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseCatalogController extends Controller
{
    public function index(Request $request): Response
    {
        $courses = Course::query()
            ->where('is_published', true)
            ->with([
                'category:id,name,slug',
                'instructor:id,name',
                'instructor.instructorProfile:id,user_id,headline,photo_path',
            ])
            ->withCount(['lessons', 'enrollments'])
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('subtitle', 'like', "%{$search}%");
                });
            })
            ->when($request->string('category')->toString(), function ($query, $slug) {
                $query->whereHas('category', fn ($q) => $q->where('slug', $slug));
            })
            ->when($request->string('level')->toString(), function ($query, $level) {
                $query->where('level', $level);
            })
            ->when($request->string('price')->toString(), function ($query, $price) {
                if ($price === 'free') {
                    $query->where('price', 0);
                } elseif ($price === 'paid') {
                    $query->where('price', '>', 0);
                }
            })
            ->when($request->string('format')->toString(), function ($query, $format) {
                $query->where('delivery_format', $format);
            })
            ->when($request->boolean('certified'), function ($query) {
                $query->where('is_certified', true);
            })
            ->orderByDesc('total_students')
            ->orderByDesc('id')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('public/courses/index', [
            'courses' => $courses,
            'filters' => $request->only('search', 'category', 'level', 'price', 'format', 'certified'),
            'categories' => Category::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'slug']),
            'formatOptions' => [
                ['value' => 'on_demand', 'label' => 'On-demand'],
                ['value' => 'online_live', 'label' => 'Online Live'],
                ['value' => 'offline', 'label' => 'Offline'],
                ['value' => 'hybrid', 'label' => 'Hybrid'],
                ['value' => 'bootcamp', 'label' => 'Bootcamp'],
            ],
        ]);
    }

    public function show(Request $request, Course $course): Response
    {
        abort_unless($course->is_published, 404);

        $course->load([
            'category:id,name,slug',
            'instructor:id,name,email',
            'instructor.instructorProfile:id,user_id,headline,bio,photo_path,expertise',
            'sections' => fn ($q) => $q->orderBy('sort_order'),
            'sections.lessons' => fn ($q) => $q->orderBy('sort_order'),
            'tags:id,name,slug',
        ]);

        $course->loadCount(['lessons', 'enrollments', 'reviews']);

        $isEnrolled = false;
        if ($user = $request->user()) {
            $isEnrolled = Enrollment::query()
                ->where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->exists();
        }

        $reviews = $course->reviews()
            ->where('is_public', true)
            ->with('user:id,name')
            ->latest('id')
            ->limit(20)
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'rating' => (int) $r->rating,
                'content' => $r->content,
                'created_at' => $r->created_at?->toIso8601String(),
                'user' => [
                    'id' => $r->user->id,
                    'name' => $r->user->name,
                ],
            ]);

        $ratingBreakdown = $this->ratingBreakdown($course->id);

        return Inertia::render('public/courses/show', [
            'course' => $course,
            'isEnrolled' => $isEnrolled,
            'reviews' => $reviews,
            'ratingBreakdown' => $ratingBreakdown,
            'pointOffer' => PointOfferPresenter::for($course, $request->user()),
            'related' => Course::query()
                ->where('is_published', true)
                ->where('id', '!=', $course->id)
                ->when($course->category_id, fn ($q) => $q->where('category_id', $course->category_id))
                ->with(['category:id,name', 'instructor:id,name'])
                ->limit(4)
                ->get(),
        ]);
    }

    /**
     * @return array<int, int> map rating => count
     */
    private function ratingBreakdown(int $courseId): array
    {
        $rows = Review::query()
            ->where('course_id', $courseId)
            ->where('is_public', true)
            ->selectRaw('rating, COUNT(*) as total')
            ->groupBy('rating')
            ->pluck('total', 'rating')
            ->all();

        return [
            5 => (int) ($rows[5] ?? 0),
            4 => (int) ($rows[4] ?? 0),
            3 => (int) ($rows[3] ?? 0),
            2 => (int) ($rows[2] ?? 0),
            1 => (int) ($rows[1] ?? 0),
        ];
    }
}
