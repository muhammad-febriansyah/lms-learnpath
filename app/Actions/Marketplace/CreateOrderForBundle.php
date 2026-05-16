<?php

namespace App\Actions\Marketplace;

use App\DataTransferObjects\Marketplace\CreateBundleOrderData;
use App\Models\Bundle;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

/**
 * Buat Order untuk pembelian satu Bundle.
 * OrderItem disimpan dengan purchasable_type Bundle — enrollment ke setiap
 * course di-expand oleh EnrollUserFromOrder saat order paid.
 */
final class CreateOrderForBundle
{
    public function __construct(
        private readonly GenerateOrderNumber $generateOrderNumber,
    ) {}

    public function execute(CreateBundleOrderData $data): Order
    {
        return DB::transaction(function () use ($data) {
            $expiryHours = (int) config('services.pakasir.order_expiry_hours', 24);
            $price = (int) $data->bundle->price;
            $subtotal = max(0, $price);
            $total = max(0, $subtotal - $data->discount);

            $order = Order::create([
                'user_id' => $data->user->id,
                'order_number' => ($this->generateOrderNumber)(),
                'type' => 'bundle',
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
                    'bundle_id' => $data->bundle->id,
                    'bundle_title' => $data->bundle->title,
                ],
            ]);

            $order->items()->create([
                'purchasable_type' => Bundle::class,
                'purchasable_id' => $data->bundle->id,
                'name' => $data->bundle->title,
                'quantity' => 1,
                'unit_price' => $price,
                'subtotal' => $subtotal,
            ]);

            return $order->fresh(['items']);
        });
    }
}
