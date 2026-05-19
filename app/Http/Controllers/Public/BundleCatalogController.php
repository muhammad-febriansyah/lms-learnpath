<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Bundle;
use App\Models\Course;
use App\Support\PointOfferPresenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BundleCatalogController extends Controller
{
    public function index(Request $request): Response
    {
        $bundles = Bundle::query()
            ->where('is_published', true)
            ->withCount('courses')
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->latest('published_at')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Bundle $b) => [
                'id' => $b->id,
                'title' => $b->title,
                'slug' => $b->slug,
                'description' => $b->description,
                'thumbnail' => $b->thumbnail,
                'price' => $b->price,
                'compare_at_price' => $b->compare_at_price,
                'savings' => $b->savings(),
                'courses_count' => $b->courses_count,
            ]);

        return Inertia::render('public/bundles/index', [
            'bundles' => $bundles,
            'filters' => $request->only('search'),
        ]);
    }

    public function show(Request $request, Bundle $bundle): Response
    {
        abort_unless($bundle->is_published, 404);

        $bundle->load(['courses' => fn ($q) => $q->select('courses.id', 'title', 'subtitle', 'slug', 'thumbnail', 'price', 'level', 'duration_minutes', 'average_rating')]);

        $coursesTotal = $bundle->courses->sum('price');

        return Inertia::render('public/bundles/show', [
            'bundle' => [
                'id' => $bundle->id,
                'title' => $bundle->title,
                'slug' => $bundle->slug,
                'description' => $bundle->description,
                'thumbnail' => $bundle->thumbnail,
                'price' => $bundle->price,
                'compare_at_price' => $bundle->compare_at_price ?? $coursesTotal,
                'savings' => max(0, ($bundle->compare_at_price ?? $coursesTotal) - $bundle->price),
                'courses' => $bundle->courses->map(fn (Course $c) => [
                    'id' => $c->id,
                    'title' => $c->title,
                    'subtitle' => $c->subtitle,
                    'slug' => $c->slug,
                    'thumbnail' => $c->thumbnail,
                    'price' => $c->price,
                    'level' => $c->level,
                    'duration_minutes' => $c->duration_minutes,
                    'average_rating' => (float) $c->average_rating,
                ])->all(),
            ],
            'pointOffer' => PointOfferPresenter::for($bundle, $request->user()),
        ]);
    }
}
