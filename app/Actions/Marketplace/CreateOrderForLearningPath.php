<?php

namespace App\Actions\Marketplace;

use App\DataTransferObjects\Marketplace\CreateLearningPathOrderData;
use App\Models\LearningPath;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

/**
 * Buat Order untuk pembelian satu Learning Path (paket multi-course).
 * OrderItem disimpan dengan purchasable_type LearningPath — enrollment
 * di-expand oleh EnrollUserFromOrder via PathEnrollmentService saat order paid.
 */
final class CreateOrderForLearningPath
{
    public function __construct(
        private readonly GenerateOrderNumber $generateOrderNumber,
    ) {}

    public function execute(CreateLearningPathOrderData $data): Order
    {
        return DB::transaction(function () use ($data) {
            $expiryHours = (int) config('services.pakasir.order_expiry_hours', 24);
            $price = (int) $data->path->price;
            $subtotal = max(0, $price);
            $total = max(0, $subtotal - $data->discount);

            $order = Order::create([
                'user_id' => $data->user->id,
                'order_number' => ($this->generateOrderNumber)(),
                'type' => 'learning_path',
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
                    'learning_path_id' => $data->path->id,
                    'learning_path_title' => $data->path->title,
                ],
            ]);

            $order->items()->create([
                'purchasable_type' => LearningPath::class,
                'purchasable_id' => $data->path->id,
                'name' => $data->path->title,
                'quantity' => 1,
                'unit_price' => $price,
                'subtotal' => $subtotal,
            ]);

            return $order->fresh(['items']);
        });
    }
}
