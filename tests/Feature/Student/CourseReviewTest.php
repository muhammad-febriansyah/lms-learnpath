<?php

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Review;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('student', 'web');
    $this->user = User::factory()->create(['email_verified_at' => now()]);
    $this->user->assignRole('student');

    $this->course = Course::factory()->create();
});

it('lets a user with a completed enrollment submit a review', function () {
    Enrollment::create([
        'user_id' => $this->user->id,
        'course_id' => $this->course->id,
        'status' => 'completed',
        'enrolled_at' => now(),
        'completed_at' => now(),
    ]);

    $this->actingAs($this->user)
        ->post("/courses/{$this->course->slug}/reviews", [
            'rating' => 5,
            'content' => 'Mantap sekali',
        ])
        ->assertRedirect();

    $review = Review::where('user_id', $this->user->id)
        ->where('course_id', $this->course->id)
        ->first();

    expect($review)->not->toBeNull()
        ->and($review->rating)->toBe(5)
        ->and($review->content)->toBe('Mantap sekali')
        ->and($review->is_public)->toBeTrue();

    expect($this->course->fresh()->reviews_count)->toBe(1)
        ->and((float) $this->course->fresh()->average_rating)->toBe(5.0);
});

it('blocks review when the user has not completed the course', function () {
    Enrollment::create([
        'user_id' => $this->user->id,
        'course_id' => $this->course->id,
        'status' => 'active',
        'enrolled_at' => now(),
    ]);

    $this->actingAs($this->user)
        ->from("/courses/{$this->course->slug}")
        ->post("/courses/{$this->course->slug}/reviews", [
            'rating' => 5,
        ])
        ->assertSessionHasErrors('rating');

    expect(Review::count())->toBe(0);
});

it('blocks review when the user is not enrolled at all', function () {
    $this->actingAs($this->user)
        ->from("/courses/{$this->course->slug}")
        ->post("/courses/{$this->course->slug}/reviews", [
            'rating' => 4,
        ])
        ->assertSessionHasErrors('rating');

    expect(Review::count())->toBe(0);
});

it('updates the existing review on resubmit (idempotent)', function () {
    Enrollment::create([
        'user_id' => $this->user->id,
        'course_id' => $this->course->id,
        'status' => 'completed',
        'enrolled_at' => now(),
        'completed_at' => now(),
    ]);

    $this->actingAs($this->user)
        ->post("/courses/{$this->course->slug}/reviews", ['rating' => 3, 'content' => 'awal'])
        ->assertRedirect();

    $this->actingAs($this->user)
        ->post("/courses/{$this->course->slug}/reviews", ['rating' => 5, 'content' => 'revisi'])
        ->assertRedirect();

    expect(Review::where('user_id', $this->user->id)->count())->toBe(1);

    $review = Review::where('user_id', $this->user->id)->first();
    expect($review->rating)->toBe(5)
        ->and($review->content)->toBe('revisi');

    expect((float) $this->course->fresh()->average_rating)->toBe(5.0);
});

it('validates rating must be 1-5', function () {
    Enrollment::create([
        'user_id' => $this->user->id,
        'course_id' => $this->course->id,
        'status' => 'completed',
        'enrolled_at' => now(),
        'completed_at' => now(),
    ]);

    $this->actingAs($this->user)
        ->from("/courses/{$this->course->slug}")
        ->post("/courses/{$this->course->slug}/reviews", ['rating' => 6])
        ->assertSessionHasErrors('rating');

    $this->actingAs($this->user)
        ->from("/courses/{$this->course->slug}")
        ->post("/courses/{$this->course->slug}/reviews", ['rating' => 0])
        ->assertSessionHasErrors('rating');
});

it('lets the owner delete their review and recomputes aggregate', function () {
    Enrollment::create([
        'user_id' => $this->user->id,
        'course_id' => $this->course->id,
        'status' => 'completed',
        'enrolled_at' => now(),
        'completed_at' => now(),
    ]);

    $review = Review::create([
        'user_id' => $this->user->id,
        'course_id' => $this->course->id,
        'rating' => 4,
        'is_public' => true,
    ]);
    $this->course->update(['reviews_count' => 1, 'average_rating' => 4.0]);

    $this->actingAs($this->user)
        ->delete("/reviews/{$review->id}")
        ->assertRedirect();

    expect(Review::find($review->id))->toBeNull()
        ->and($this->course->fresh()->reviews_count)->toBe(0)
        ->and((float) $this->course->fresh()->average_rating)->toBe(0.0);
});

it('forbids deleting another users review', function () {
    $stranger = User::factory()->create();
    $review = Review::create([
        'user_id' => $stranger->id,
        'course_id' => $this->course->id,
        'rating' => 4,
        'is_public' => true,
    ]);

    $this->actingAs($this->user)
        ->delete("/reviews/{$review->id}")
        ->assertForbidden();

    expect(Review::find($review->id))->not->toBeNull();
});

it('shows reviews and breakdown on public course detail', function () {
    $this->course->update(['is_published' => true]);

    $reviewer = User::factory()->create(['name' => 'Andi']);
    Enrollment::create([
        'user_id' => $reviewer->id,
        'course_id' => $this->course->id,
        'status' => 'completed',
        'enrolled_at' => now(),
        'completed_at' => now(),
    ]);
    Review::create([
        'user_id' => $reviewer->id,
        'course_id' => $this->course->id,
        'rating' => 5,
        'content' => 'Bagus',
        'is_public' => true,
    ]);
    $this->course->update(['reviews_count' => 1, 'average_rating' => 5.0]);

    $this->get("/courses/{$this->course->slug}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('reviews', 1)
            ->where('reviews.0.user.name', 'Andi')
            ->where('reviews.0.rating', 5)
            ->where('ratingBreakdown.5', 1)
            ->where('ratingBreakdown.4', 0)
        );
});
