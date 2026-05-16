<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CorporateHubController extends Controller
{
    /**
     * Slugs of the categories surfaced as tabs in the corporate hub.
     * Falls back to all active categories when none of these exist in DB.
     */
    private const CORPORATE_CATEGORY_SLUGS = [
        'leadership',
        'sales-lending',
        'operations',
        'compliance',
        'digital-marketing',
    ];

    public function index(Request $request): Response
    {
        $categories = $this->resolveCorporateCategories();

        $activeSlug = $request->string('category')->toString() ?: ($categories->first()?->slug ?? '');

        $courses = Course::query()
            ->where('is_published', true)
            ->when($activeSlug, fn ($q) => $q->whereHas('category', fn ($qq) => $qq->where('slug', $activeSlug)))
            ->with([
                'category:id,name,slug',
                'instructor:id,name',
                'instructor.instructorProfile:id,user_id,headline,photo_path',
            ])
            ->withCount(['lessons', 'enrollments'])
            ->orderByDesc('total_students')
            ->orderByDesc('id')
            ->limit(12)
            ->get();

        return Inertia::render('public/corporate', [
            'categories' => $categories->map(fn (Category $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'slug' => $c->slug,
                'courses_count' => $c->courses_count,
            ])->values(),
            'activeSlug' => $activeSlug,
            'courses' => $courses,
            'stats' => [
                'total_courses' => Course::where('is_published', true)->count(),
                'total_categories' => $categories->count(),
            ],
        ]);
    }

    /**
     * @return \Illuminate\Support\Collection<int, Category>
     */
    private function resolveCorporateCategories()
    {
        $base = Category::query()
            ->where('is_active', true)
            ->whereHas('courses', fn ($q) => $q->where('is_published', true))
            ->withCount(['courses' => fn ($q) => $q->where('is_published', true)])
            ->orderBy('name');

        $curated = (clone $base)
            ->whereIn('slug', self::CORPORATE_CATEGORY_SLUGS)
            ->get();

        if ($curated->isNotEmpty()) {
            return $curated;
        }

        return $base->get();
    }
}
