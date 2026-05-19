<?php

use App\Models\Bundle;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LearningPath;
use App\Models\LearningPathEnrollment;
use App\Models\PointRedemptionOffer;
use App\Models\User;
use App\Models\UserPoint;
use App\Services\Gamification\InsufficientPointsException;
use App\Services\Gamification\RedemptionService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    UserPoint::create([
        'user_id' => $this->user->id,
        'total_points' => 1000,
        'lifetime_points' => 1000,
        'level' => 'silver',
    ]);
    $this->service = app(RedemptionService::class);
});

it('redeems a course offer and enrolls the user', function () {
    $course = Course::factory()->create();
    $offer = PointRedemptionOffer::factory()->create([
        'redeemable_type' => $course->getMorphClass(),
        'redeemable_id' => $course->id,
        'point_price' => 250,
    ]);

    $redemption = $this->service->redeem($this->user->fresh(), $offer);

    expect($redemption->status)->toBe('completed');
    expect($redemption->points_spent)->toBe(250);
    expect($this->user->userPoint->fresh()->total_points)->toBe(750);
    expect($this->user->userPoint->fresh()->lifetime_points)->toBe(1000);
    expect(Enrollment::query()
        ->where('user_id', $this->user->id)
        ->where('course_id', $course->id)
        ->exists())->toBeTrue();
    expect($offer->fresh()->redemptions_count)->toBe(1);
});

it('expands a bundle into enrollments for each course', function () {
    $bundle = Bundle::factory()->create();
    $courses = Course::factory()->count(3)->create();
    $bundle->courses()->attach($courses->pluck('id'));

    $offer = PointRedemptionOffer::factory()->create([
        'redeemable_type' => $bundle->getMorphClass(),
        'redeemable_id' => $bundle->id,
        'point_price' => 600,
    ]);

    $this->service->redeem($this->user->fresh(), $offer);

    expect(Enrollment::query()
        ->where('user_id', $this->user->id)
        ->whereIn('course_id', $courses->pluck('id'))
        ->count())->toBe(3);
});

it('blocks redemption when user has insufficient points', function () {
    $course = Course::factory()->create();
    $offer = PointRedemptionOffer::factory()->create([
        'redeemable_type' => $course->getMorphClass(),
        'redeemable_id' => $course->id,
        'point_price' => 5000,
    ]);

    expect(fn () => $this->service->redeem($this->user->fresh(), $offer))
        ->toThrow(InsufficientPointsException::class);

    expect($this->user->userPoint->fresh()->total_points)->toBe(1000);
    expect($offer->fresh()->redemptions_count)->toBe(0);
});

it('blocks redemption when offer is inactive', function () {
    $course = Course::factory()->create();
    $offer = PointRedemptionOffer::factory()->create([
        'redeemable_type' => $course->getMorphClass(),
        'redeemable_id' => $course->id,
        'point_price' => 100,
        'is_active' => false,
    ]);

    expect(fn () => $this->service->redeem($this->user->fresh(), $offer))
        ->toThrow(RuntimeException::class, 'tidak aktif');
});

it('blocks redemption outside the redeemable window', function () {
    $course = Course::factory()->create();
    $offer = PointRedemptionOffer::factory()->create([
        'redeemable_type' => $course->getMorphClass(),
        'redeemable_id' => $course->id,
        'point_price' => 100,
        'redeemable_from' => now()->addDay(),
    ]);

    expect(fn () => $this->service->redeem($this->user->fresh(), $offer))
        ->toThrow(RuntimeException::class, 'periode');
});

it('blocks redemption when per-user limit reached', function () {
    $course = Course::factory()->create();
    $offer = PointRedemptionOffer::factory()->create([
        'redeemable_type' => $course->getMorphClass(),
        'redeemable_id' => $course->id,
        'point_price' => 100,
        'max_per_user' => 1,
    ]);

    $this->service->redeem($this->user->fresh(), $offer);

    expect(fn () => $this->service->redeem($this->user->fresh(), $offer))
        ->toThrow(RuntimeException::class, 'batas tukar');
});

it('blocks redemption when total quota is exhausted', function () {
    $course = Course::factory()->create();
    $offer = PointRedemptionOffer::factory()->create([
        'redeemable_type' => $course->getMorphClass(),
        'redeemable_id' => $course->id,
        'point_price' => 100,
        'max_total' => 1,
        'redemptions_count' => 1,
    ]);

    expect(fn () => $this->service->redeem($this->user->fresh(), $offer))
        ->toThrow(RuntimeException::class, 'habis');
});

it('refunds a redemption and credits points back', function () {
    $course = Course::factory()->create();
    $offer = PointRedemptionOffer::factory()->create([
        'redeemable_type' => $course->getMorphClass(),
        'redeemable_id' => $course->id,
        'point_price' => 250,
    ]);

    $redemption = $this->service->redeem($this->user->fresh(), $offer);
    expect($this->user->userPoint->fresh()->total_points)->toBe(750);

    $refunded = $this->service->refund($redemption->fresh(), 'test refund');

    expect($refunded->status)->toBe('refunded');
    expect($refunded->refund_reason)->toBe('test refund');
    expect($this->user->userPoint->fresh()->total_points)->toBe(1000);
    expect($offer->fresh()->redemptions_count)->toBe(0);
});

it('optionally cancels the enrollment on refund', function () {
    $course = Course::factory()->create();
    $offer = PointRedemptionOffer::factory()->create([
        'redeemable_type' => $course->getMorphClass(),
        'redeemable_id' => $course->id,
        'point_price' => 250,
    ]);

    $redemption = $this->service->redeem($this->user->fresh(), $offer);
    expect(Enrollment::query()->where('user_id', $this->user->id)->where('course_id', $course->id)->exists())->toBeTrue();

    $this->service->refund($redemption->fresh(), 'change of mind', cancelEnrollment: true);

    expect(Enrollment::query()->where('user_id', $this->user->id)->where('course_id', $course->id)->exists())->toBeFalse();
});

it('does not double-refund an already refunded redemption', function () {
    $course = Course::factory()->create();
    $offer = PointRedemptionOffer::factory()->create([
        'redeemable_type' => $course->getMorphClass(),
        'redeemable_id' => $course->id,
        'point_price' => 100,
    ]);

    $redemption = $this->service->redeem($this->user->fresh(), $offer);
    $this->service->refund($redemption->fresh());

    expect(fn () => $this->service->refund($redemption->fresh()))
        ->toThrow(RuntimeException::class, 'tidak dapat di-refund');
});

it('enrolls into a learning path including its courses', function () {
    $path = LearningPath::factory()->create();
    $courses = Course::factory()->count(2)->create();
    $path->courses()->attach($courses->pluck('id')->mapWithKeys(fn ($id, $i) => [$id => ['sort_order' => $i + 1]])->all());

    $offer = PointRedemptionOffer::factory()->create([
        'redeemable_type' => $path->getMorphClass(),
        'redeemable_id' => $path->id,
        'point_price' => 800,
    ]);

    $this->service->redeem($this->user->fresh(), $offer);

    expect(Enrollment::query()->where('user_id', $this->user->id)->count())->toBe(2);
    expect(LearningPathEnrollment::query()
        ->where('user_id', $this->user->id)
        ->where('learning_path_id', $path->id)
        ->exists())->toBeTrue();
});
