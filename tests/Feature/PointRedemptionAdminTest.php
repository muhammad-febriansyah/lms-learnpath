<?php

use App\Models\Course;
use App\Models\PointRedemption;
use App\Models\PointRedemptionOffer;
use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Permission::findOrCreate('point_redemption.manage', 'web');
    Role::findOrCreate('superadmin', 'web')->givePermissionTo('point_redemption.manage');

    $this->admin = User::factory()->create(['email_verified_at' => now()]);
    $this->admin->assignRole('superadmin');
});

it('renders the index with offers and stats', function () {
    PointRedemptionOffer::factory()->count(2)->create();

    $this->actingAs($this->admin)
        ->withoutVite()
        ->get('/admin/point-redemptions')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/point-redemptions/index')
            ->has('offers.data', 2)
            ->where('stats.total_offers', 2)
        );
});

it('creates a course offer', function () {
    $course = Course::factory()->create();

    $this->actingAs($this->admin)
        ->post('/admin/point-redemptions', [
            'redeemable_type' => 'course',
            'redeemable_id' => $course->id,
            'point_price' => 250,
            'is_active' => true,
        ])
        ->assertRedirect('/admin/point-redemptions');

    expect(PointRedemptionOffer::query()->where('redeemable_id', $course->id)->exists())
        ->toBeTrue();
});

it('rejects a duplicate offer for the same item', function () {
    $course = Course::factory()->create();
    PointRedemptionOffer::factory()->create([
        'redeemable_type' => $course->getMorphClass(),
        'redeemable_id' => $course->id,
    ]);

    $this->actingAs($this->admin)
        ->post('/admin/point-redemptions', [
            'redeemable_type' => 'course',
            'redeemable_id' => $course->id,
            'point_price' => 200,
            'is_active' => true,
        ])
        ->assertSessionHasErrors('redeemable_id');
});

it('updates an offer', function () {
    $offer = PointRedemptionOffer::factory()->create(['point_price' => 100]);

    $this->actingAs($this->admin)
        ->patch("/admin/point-redemptions/{$offer->id}", [
            'point_price' => 300,
            'is_active' => false,
        ])
        ->assertRedirect();

    expect($offer->fresh()->point_price)->toBe(300);
    expect($offer->fresh()->is_active)->toBeFalse();
});

it('does not delete an offer that has redemptions', function () {
    $offer = PointRedemptionOffer::factory()->create();
    PointRedemption::factory()->create([
        'point_redemption_offer_id' => $offer->id,
        'redeemable_type' => $offer->redeemable_type,
        'redeemable_id' => $offer->redeemable_id,
    ]);

    $this->actingAs($this->admin)
        ->delete("/admin/point-redemptions/{$offer->id}")
        ->assertRedirect();

    expect(PointRedemptionOffer::query()->whereKey($offer->id)->exists())->toBeTrue();
});

it('refunds a redemption through the admin endpoint', function () {
    $user = User::factory()->create();
    UserPoint::create([
        'user_id' => $user->id,
        'total_points' => 0,
        'lifetime_points' => 250,
        'level' => 'bronze',
    ]);

    $course = Course::factory()->create();
    $offer = PointRedemptionOffer::factory()->create([
        'redeemable_type' => $course->getMorphClass(),
        'redeemable_id' => $course->id,
        'point_price' => 250,
        'redemptions_count' => 1,
    ]);
    $redemption = PointRedemption::factory()->create([
        'user_id' => $user->id,
        'point_redemption_offer_id' => $offer->id,
        'redeemable_type' => $course->getMorphClass(),
        'redeemable_id' => $course->id,
        'points_spent' => 250,
        'status' => 'completed',
    ]);

    $this->actingAs($this->admin)
        ->post("/admin/point-redemptions/redemptions/{$redemption->id}/refund", [
            'reason' => 'tester',
        ])
        ->assertRedirect();

    expect($redemption->fresh()->status)->toBe('refunded');
    expect($user->fresh()->userPoint->total_points)->toBe(250);
});

it('forbids users without point_redemption.manage', function () {
    $stranger = User::factory()->create(['email_verified_at' => now()]);

    $this->actingAs($stranger)
        ->get('/admin/point-redemptions')
        ->assertForbidden();
});
