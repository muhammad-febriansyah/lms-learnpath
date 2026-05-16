<?php

use App\Actions\Marketplace\MarkOrderAsPaid;
use App\DataTransferObjects\Marketplace\PakasirWebhookData;
use App\Models\Bundle;
use App\Models\Coupon;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create(['email_verified_at' => now()]);
    $this->course1 = Course::factory()->create(['title' => 'Course 1', 'price' => 200_000]);
    $this->course2 = Course::factory()->create(['title' => 'Course 2', 'price' => 300_000]);
    $this->bundle = Bundle::factory()->create([
        'slug' => 'paket-belajar',
        'price' => 350_000,
        'compare_at_price' => 500_000,
    ]);
    $this->bundle->courses()->attach([
        $this->course1->id => ['sort_order' => 0],
        $this->course2->id => ['sort_order' => 1],
    ]);
});

it('renders bundle checkout for an authenticated user', function () {
    $response = $this->actingAs($this->user)
        ->get(route('checkout.bundle.show', ['bundle' => $this->bundle->slug]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('checkout/bundle')
        ->where('bundle.price', 350_000)
        ->where('quote.subtotal', 350_000)
        ->where('quote.total', 350_000)
        ->has('bundle.courses', 2)
    );
});

it('creates a bundle order with Bundle line item', function () {
    $this->actingAs($this->user)->post(
        route('checkout.bundle.store', ['bundle' => $this->bundle->slug]),
        [
            'payment_method' => 'qris',
            'customer_name' => 'Test User',
            'customer_email' => 'test@example.com',
            'customer_phone' => '081234567890',
        ],
    );

    $order = Order::query()->where('user_id', $this->user->id)->latest('id')->first();
    expect($order)->not->toBeNull();
    expect($order->type)->toBe('bundle');
    expect($order->total)->toBe(350_000);

    $item = $order->items->first();
    expect($item->purchasable_type)->toBe(Bundle::class);
    expect($item->purchasable_id)->toBe($this->bundle->id);
});

it('enrolls user into all courses of the bundle on payment', function () {
    $this->actingAs($this->user)->post(
        route('checkout.bundle.store', ['bundle' => $this->bundle->slug]),
        ['payment_method' => 'qris'],
    );

    $order = Order::query()->where('user_id', $this->user->id)->latest('id')->first();

    app(MarkOrderAsPaid::class)->execute($order, new PakasirWebhookData(
        orderId: $order->order_number,
        amount: $order->total,
        status: 'completed',
        paymentMethod: 'qris',
    ));

    expect(Enrollment::where('user_id', $this->user->id)->where('course_id', $this->course1->id)->exists())->toBeTrue();
    expect(Enrollment::where('user_id', $this->user->id)->where('course_id', $this->course2->id)->exists())->toBeTrue();
});

it('applies an "all" scope voucher to a bundle', function () {
    Coupon::factory()->percentage(20)->create(['code' => 'BUNDLE20']);

    $response = $this->actingAs($this->user)
        ->get(route('checkout.bundle.show', [
            'bundle' => $this->bundle->slug,
            'coupon' => 'BUNDLE20',
        ]));

    $response->assertInertia(fn ($page) => $page
        ->where('quote.valid', true)
        ->where('quote.discount', 70_000)
        ->where('quote.total', 280_000)
    );
});

it('rejects a course-specific voucher when used on a bundle', function () {
    $coupon = Coupon::factory()->create([
        'code' => 'CRSONLY',
        'applicable_to' => Coupon::SCOPE_SPECIFIC,
    ]);
    $coupon->courses()->attach($this->course1);

    $response = $this->actingAs($this->user)
        ->get(route('checkout.bundle.show', [
            'bundle' => $this->bundle->slug,
            'coupon' => 'CRSONLY',
        ]));

    $response->assertInertia(fn ($page) => $page
        ->where('quote.valid', false)
        ->where('quote.error', fn ($e) => is_string($e) && str_contains($e, 'paket bundle'))
    );
});
