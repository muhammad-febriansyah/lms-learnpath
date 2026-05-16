<?php

use App\Actions\Marketplace\MarkOrderAsPaid;
use App\DataTransferObjects\Marketplace\PakasirWebhookData;
use App\Models\Course;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Http::fake([
        'app.mailketing.co.id/*' => Http::response(['status' => 'success'], 200),
    ]);
    config()->set('services.mailketing.api_key', 'test-key');
});

it('dispatches a Mailketing email when an order is marked as paid', function () {
    $user = User::factory()->create(['email' => 'buyer@example.test']);
    $course = Course::factory()->create(['price' => 200_000]);

    $order = Order::create([
        'user_id' => $user->id,
        'order_number' => 'ORD-TEST-001',
        'type' => 'course',
        'subtotal' => 200_000,
        'discount' => 0,
        'total' => 200_000,
        'currency' => 'IDR',
        'status' => 'pending',
        'customer_name' => $user->name,
        'customer_email' => $user->email,
    ]);

    OrderItem::create([
        'order_id' => $order->id,
        'purchasable_type' => Course::class,
        'purchasable_id' => $course->id,
        'name' => $course->title,
        'quantity' => 1,
        'unit_price' => 200_000,
        'subtotal' => 200_000,
    ]);

    app(MarkOrderAsPaid::class)->execute($order, new PakasirWebhookData(
        orderId: $order->order_number,
        amount: $order->total,
        status: 'completed',
        paymentMethod: 'qris',
    ));

    Http::assertSent(function ($request) use ($user) {
        if (! str_contains($request->url(), 'app.mailketing.co.id/api/v1/send')) {
            return false;
        }
        $body = $request->data();

        return $body['recipient'] === $user->email
            && str_contains($body['subject'], 'Pembayaran berhasil')
            && str_contains($body['subject'], 'ORD-TEST-001');
    });
});

it('does not send Mailketing email when API key is missing', function () {
    config()->set('services.mailketing.api_key', '');

    $user = User::factory()->create();
    $course = Course::factory()->create(['price' => 100_000]);

    $order = Order::create([
        'user_id' => $user->id,
        'order_number' => 'ORD-TEST-NOKEY',
        'type' => 'course',
        'subtotal' => 100_000,
        'discount' => 0,
        'total' => 100_000,
        'currency' => 'IDR',
        'status' => 'pending',
        'customer_email' => $user->email,
    ]);

    OrderItem::create([
        'order_id' => $order->id,
        'purchasable_type' => Course::class,
        'purchasable_id' => $course->id,
        'name' => $course->title,
        'quantity' => 1,
        'unit_price' => 100_000,
        'subtotal' => 100_000,
    ]);

    app(MarkOrderAsPaid::class)->execute($order, new PakasirWebhookData(
        orderId: $order->order_number,
        amount: $order->total,
        status: 'completed',
        paymentMethod: 'qris',
    ));

    Http::assertNothingSent();
});
