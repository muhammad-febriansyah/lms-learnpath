<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Services\Course\RatingAggregator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    public function __construct(
        private readonly RatingAggregator $aggregator,
    ) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('review.moderate'), 403);

        $reviews = Review::query()
            ->with([
                'user:id,name,email',
                'course:id,title,slug',
            ])
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where('content', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('course', fn ($q) => $q->where('title', 'like', "%{$search}%"));
            })
            ->when($request->filled('rating'), function ($query) use ($request) {
                $query->where('rating', $request->integer('rating'));
            })
            ->when($request->string('visibility')->toString(), function ($query, $visibility) {
                if ($visibility === 'public') {
                    $query->where('is_public', true);
                } elseif ($visibility === 'hidden') {
                    $query->where('is_public', false);
                }
            })
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/reviews/index', [
            'reviews' => $reviews,
            'filters' => $request->only('search', 'rating', 'visibility'),
            'stats' => [
                'total' => Review::count(),
                'public' => Review::where('is_public', true)->count(),
                'hidden' => Review::where('is_public', false)->count(),
                'avg_rating' => round((float) Review::avg('rating'), 2),
            ],
        ]);
    }

    public function toggle(Request $request, Review $review): RedirectResponse
    {
        abort_unless($request->user()?->can('review.moderate'), 403);

        $review->update([
            'is_public' => ! $review->is_public,
        ]);

        $this->aggregator->recompute($review->course);

        return back()->with(
            'success',
            $review->is_public ? 'Review ditampilkan.' : 'Review disembunyikan.',
        );
    }

    public function destroy(Request $request, Review $review): RedirectResponse
    {
        abort_unless($request->user()?->can('review.moderate'), 403);

        $course = $review->course;
        $review->delete();
        $this->aggregator->recompute($course);

        return back()->with('success', 'Review berhasil dihapus.');
    }
}
