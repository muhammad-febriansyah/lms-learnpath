<?php

use App\Actions\Marketplace\MarkOrderAsPaid;
use App\DataTransferObjects\Marketplace\PakasirWebhookData;
use App\Models\Coupon;
use App\Models\CouponRedemption;
use App\Models\Course;
use App\Models\Order;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create(['email_verified_at' => now()]);
    $this->course = Course::factory()->create([
        'price' => 200_000,
        'is_published' => true,
    ]);
});

it('shows checkout with empty quote by default', function () {
    $response = $this->actingAs($this->user)
        ->get(route('checkout.show', ['course' => $this->course->slug]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('checkout/show')
        ->where('quote.valid', false)
        ->where('quote.subtotal', 200_000)
        ->where('quote.discount', 0)
        ->where('quote.total', 200_000)
        ->where('quote.coupon', null)
    );
});

it('applies a valid coupon via query param', function () {
    Coupon::factory()->percentage(25)->create(['code' => 'DISKON25']);

    $response = $this->actingAs($this->user)
        ->get(route('checkout.show', ['course' => $this->course->slug, 'coupon' => 'DISKON25']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('quote.valid', true)
        ->where('quote.discount', 50_000)
        ->where('quote.total', 150_000)
        ->where('quote.coupon.code', 'DISKON25')
    );
});

it('surfaces an error message for invalid code', function () {
    $response = $this->actingAs($this->user)
        ->get(route('checkout.show', ['course' => $this->course->slug, 'coupon' => 'BOGUS']));

    $response->assertInertia(fn ($page) => $page
        ->where('quote.valid', false)
        ->where('quote.discount', 0)
        ->where('quote.error', fn ($e) => is_string($e) && str_contains($e, 'tidak ditemukan'))
    );
});

it('creates an order with coupon attached when submitting checkout', function () {
    $coupon = Coupon::factory()->percentage(20)->create(['code' => 'PAYNOW']);

    $response = $this->actingAs($this->user)->post(
        route('checkout.store', ['course' => $this->course->slug]),
        [
            'payment_method' => 'qris',
            'customer_name' => 'Test User',
            'customer_email' => 'test@example.com',
            'customer_phone' => '081234567890',
            'coupon_code' => 'PAYNOW',
        ],
    );

    $response->assertSessionHasNoErrors();

    $order = Order::query()->where('user_id', $this->user->id)->latest('id')->first();
    expect($order)->not->toBeNull();
    expect($order->coupon_id)->toBe($coupon->id);
    expect($order->coupon_code)->toBe('PAYNOW');
    expect($order->discount)->toBe(40_000);
    expect($order->total)->toBe(160_000);
});

it('rejects checkout when supplied coupon is invalid', function () {
    $response = $this->actingAs($this->user)->post(
        route('checkout.store', ['course' => $this->course->slug]),
        [
            'payment_method' => 'qris',
            'coupon_code' => 'NOPE',
        ],
    );

    $response->assertSessionHasErrors('coupon_code');
    expect(Order::query()->where('user_id', $this->user->id)->exists())->toBeFalse();
});

it('records redemption and increments uses_count on order paid', function () {
    $coupon = Coupon::factory()->percentage(10)->create([
        'code' => 'PAID10',
        'max_uses' => 5,
    ]);

    $this->actingAs($this->user)->post(
        route('checkout.store', ['course' => $this->course->slug]),
        [
            'payment_method' => 'qris',
            'coupon_code' => 'PAID10',
        ],
    );

    $order = Order::query()->where('user_id', $this->user->id)->latest('id')->first();

    app(MarkOrderAsPaid::class)->execute($order, new PakasirWebhookData(
        orderId: $order->order_number,
        amount: $order->total,
        status: 'completed',
        paymentMethod: 'qris',
    ));

    expect($coupon->fresh()->uses_count)->toBe(1);
    expect(CouponRedemption::where('order_id', $order->id)->exists())->toBeTrue();
});

it('does not stack coupon discount on top of corporate free access', function () {
    Coupon::factory()->percentage(50)->create(['code' => 'EXTRA']);

    $org = \App\Models\Organization::create([
        'name' => 'Acme Corp',
        'slug' => 'acme-corp',
        'contact_name' => 'Admin Acme',
        'contact_email' => 'admin@acme.test',
        'seat_quota' => 50,
        'status' => 'active',
    ]);
    $org->members()->create([
        'user_id' => $this->user->id,
        'role' => 'employee',
        'joined_at' => now(),
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('checkout.show', [
            'course' => $this->course->slug,
            'coupon' => 'EXTRA',
        ]));

    $response->assertInertia(fn ($page) => $page
        ->where('quote.valid', false)
        ->where('quote.discount', 0)
        ->where('corporateAccess.organization_name', $org->name)
    );
});
