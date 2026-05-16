<?php

namespace App\Services\Course;

use App\Models\Course;
use App\Models\Review;

/**
 * Recomputes a course's denormalized average_rating + reviews_count
 * from its public reviews. Cheap enough to run inline after every
 * write — no caching needed.
 */
class RatingAggregator
{
    public function recompute(Course $course): void
    {
        $publicReviews = Review::query()
            ->where('course_id', $course->id)
            ->where('is_public', true);

        $count = (clone $publicReviews)->count();
        $avg = $count > 0
            ? (float) (clone $publicReviews)->avg('rating')
            : 0.0;

        $course->forceFill([
            'average_rating' => round($avg, 2),
            'reviews_count' => $count,
        ])->save();
    }
}
