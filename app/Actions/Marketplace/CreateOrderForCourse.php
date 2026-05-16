<?php

namespace App\Actions\Marketplace;

use App\DataTransferObjects\Marketplace\CreateOrderData;
use App\Models\Course;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

/**
 * Buat Order baru (1 course = 1 order item).
 * Tidak meng-call gateway, hanya menyiapkan database state.
 */
final class CreateOrderForCourse
{
    public function __construct(
        private readonly GenerateOrderNumber $generateOrderNumber,
    ) {}

    public function execute(CreateOrderData $data): Order
    {
        return DB::transaction(function () use ($data) {
            $expiryHours = (int) config('services.pakasir.order_expiry_hours', 24);
            $price = (int) $data->course->price;
            $subtotal = max(0, $price);
            $total = max(0, $subtotal - $data->discount);

            $order = Order::create([
                'user_id' => $data->user->id,
                'order_number' => ($this->generateOrderNumber)(),
                'type' => 'course',
                'subtotal' => $subtotal,
                'discount' => $data->discount,
                'coupon_id' => $data->coupon?->id,
                'coupon_code' => $data->coupon?->code,
                'tax' => 0,
                'total' => $total,
                'currency' => 'IDR',
                'status' => 'pending',
                'customer_name' => $data->customerName ?? $data->user->name,
                'customer_email' => $data->customerEmail ?? $data->user->email,
                'customer_phone' => $data->customerPhone ?? $data->user->phone,
                'expires_at' => now()->addHours($expiryHours),
                'metadata' => [
                    'course_id' => $data->course->id,
                    'course_title' => $data->course->title,
                ],
            ]);

            $order->items()->create([
                'purchasable_type' => Course::class,
                'purchasable_id' => $data->course->id,
                'name' => $data->course->title,
                'quantity' => 1,
                'unit_price' => $price,
                'subtotal' => $subtotal,
            ]);

            return $order->fresh(['items']);
        });
    }
}
