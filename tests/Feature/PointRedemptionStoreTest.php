<?php

use App\Models\Bundle;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\PointRedemptionOffer;
use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create(['email_verified_at' => now()]);
    UserPoint::create([
        'user_id' => $this->user->id,
        'total_points' => 800,
        'lifetime_points' => 800,
        'level' => 'bronze',
    ]);
});

it('lets a user redeem a course with points and redirects to learn page', function () {
    $course = Course::factory()->create(['is_published' => true]);
    PointRedemptionOffer::factory()->create([
        'redeemable_type' => $course->getMorphClass(),
        'redeemable_id' => $course->id,
        'point_price' => 300,
    ]);

    $this->actingAs($this->user)
        ->post('/redemptions', [
            'redeemable_type' => 'course',
            'redeemable_id' => $course->id,
        ])
        ->assertRedirect("/learn/{$course->slug}");

    expect(Enrollment::query()
        ->where('user_id', $this->user->id)
        ->where('course_id', $course->id)
        ->exists())->toBeTrue();

    expect($this->user->fresh()->userPoint->total_points)->toBe(500);
});

it('shows a friendly flash error when points are insufficient', function () {
    $course = Course::factory()->create();
    PointRedemptionOffer::factory()->create([
        'redeemable_type' => $course->getMorphClass(),
        'redeemable_id' => $course->id,
        'point_price' => 5000,
    ]);

    $response = $this->actingAs($this->user)
        ->post('/redemptions', [
            'redeemable_type' => 'course',
            'redeemable_id' => $course->id,
        ]);

    $response->assertRedirect();
    $this->assertEquals(800, $this->user->fresh()->userPoint->total_points);
    $this->assertStringContainsString('cukup', session('error') ?? '');
});

it('validates redeemable_type', function () {
    $this->actingAs($this->user)
        ->post('/redemptions', [
            'redeemable_type' => 'invalid_type',
            'redeemable_id' => 1,
        ])
        ->assertSessionHasErrors('redeemable_type');
});

it('returns validation error when no offer exists for the item', function () {
    $course = Course::factory()->create();

    $this->actingAs($this->user)
        ->post('/redemptions', [
            'redeemable_type' => 'course',
            'redeemable_id' => $course->id,
        ])
        ->assertSessionHasErrors('redeemable_id');
});

it('redeems a bundle and creates enrollments for each course', function () {
    $bundle = Bundle::factory()->create();
    $courses = Course::factory()->count(2)->create();
    $bundle->courses()->attach($courses->pluck('id'));

    PointRedemptionOffer::factory()->create([
        'redeemable_type' => $bundle->getMorphClass(),
        'redeemable_id' => $bundle->id,
        'point_price' => 500,
    ]);

    $this->actingAs($this->user)
        ->post('/redemptions', [
            'redeemable_type' => 'bundle',
            'redeemable_id' => $bundle->id,
        ])
        ->assertRedirect('/my-courses');

    expect(Enrollment::query()
        ->where('user_id', $this->user->id)
        ->whereIn('course_id', $courses->pluck('id'))
        ->count())->toBe(2);
});
