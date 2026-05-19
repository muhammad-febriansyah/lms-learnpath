<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Review;
use App\Services\Course\RatingAggregator;
use App\Services\Gamification\PointService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
    public function __construct(
        private readonly RatingAggregator $aggregator,
        private readonly PointService $points,
    ) {}

    public function store(Request $request, Course $course): RedirectResponse
    {
        $data = $this->validated($request);
        $user = $request->user();

        $enrollment = Enrollment::query()
            ->where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->where('status', 'completed')
            ->first();

        if (! $enrollment) {
            throw ValidationException::withMessages([
                'rating' => 'Hanya peserta yang telah menyelesaikan course yang dapat memberi ulasan.',
            ]);
        }

        $review = Review::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'course_id' => $course->id,
            ],
            [
                'enrollment_id' => $enrollment->id,
                'rating' => $data['rating'],
                'content' => $data['content'] ?: null,
                'is_public' => true,
            ],
        );

        $this->aggregator->recompute($course);
        $this->points->award($user, 'review_course', $review);

        return back()->with('success', 'Terima kasih atas ulasannya!');
    }

    public function destroy(Request $request, Review $review): RedirectResponse
    {
        abort_unless($review->user_id === $request->user()->id, 403);

        $course = $review->course;
        $review->delete();
        $this->aggregator->recompute($course);

        return back()->with('success', 'Ulasan dihapus.');
    }

    /**
     * @return array{rating: int, content: ?string}
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'rating' => ['required', 'integer', Rule::in([1, 2, 3, 4, 5])],
            'content' => ['nullable', 'string', 'max:2000'],
        ]);
    }
}
