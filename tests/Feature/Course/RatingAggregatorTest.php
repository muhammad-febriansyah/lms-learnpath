<?php

use App\Models\Course;
use App\Models\Review;
use App\Models\User;
use App\Services\Course\RatingAggregator;

beforeEach(function () {
    $this->service = app(RatingAggregator::class);
    $this->course = Course::factory()->create();
});

it('computes average and count from public reviews only', function () {
    $u1 = User::factory()->create();
    $u2 = User::factory()->create();
    $u3 = User::factory()->create();

    Review::create([
        'user_id' => $u1->id,
        'course_id' => $this->course->id,
        'rating' => 5,
        'is_public' => true,
    ]);
    Review::create([
        'user_id' => $u2->id,
        'course_id' => $this->course->id,
        'rating' => 3,
        'is_public' => true,
    ]);
    Review::create([
        'user_id' => $u3->id,
        'course_id' => $this->course->id,
        'rating' => 1,
        'is_public' => false,
    ]);

    $this->service->recompute($this->course);

    expect($this->course->fresh()->reviews_count)->toBe(2)
        ->and((float) $this->course->fresh()->average_rating)->toBe(4.0);
});

it('resets to zero when no public reviews exist', function () {
    $this->course->update(['reviews_count' => 5, 'average_rating' => 4.5]);

    $this->service->recompute($this->course);

    expect($this->course->fresh()->reviews_count)->toBe(0)
        ->and((float) $this->course->fresh()->average_rating)->toBe(0.0);
});
