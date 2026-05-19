<?php

namespace App\Actions\Marketplace;

use App\DataTransferObjects\Marketplace\CreateB2cSubscriptionOrderData;
use App\Models\B2cPlan;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

/**
 * Buat Order untuk pembelian B2C subscription plan.
 * OrderItem.purchasable_type = B2cPlan. Saat order paid, EnrollUserFromOrder
 * memanggil B2cSubscriptionService::extendOrCreate().
 */
final class CreateOrderForB2cSubscription
{
    public function __construct(
        private readonly GenerateOrderNumber $generateOrderNumber,
    ) {}

    public function execute(CreateB2cSubscriptionOrderData $data): Order
    {
        return DB::transaction(function () use ($data) {
            $expiryHours = (int) config('services.pakasir.order_expiry_hours', 24);
            $price = (int) $data->plan->price;

            $order = Order::create([
                'user_id' => $data->user->id,
                'order_number' => ($this->generateOrderNumber)(),
                'type' => 'b2c_subscription',
                'subtotal' => $price,
                'discount' => 0,
                'tax' => 0,
                'total' => $price,
                'currency' => 'IDR',
                'status' => 'pending',
                'customer_name' => $data->customerName ?? $data->user->name,
                'customer_email' => $data->customerEmail ?? $data->user->email,
                'customer_phone' => $data->customerPhone ?? $data->user->phone,
                'expires_at' => now()->addHours($expiryHours),
                'metadata' => [
                    'b2c_plan_id' => $data->plan->id,
                    'b2c_plan_code' => $data->plan->code,
                    'b2c_plan_name' => $data->plan->name,
                    'billing_period' => $data->plan->billing_period,
                ],
            ]);

            $order->items()->create([
                'purchasable_type' => B2cPlan::class,
                'purchasable_id' => $data->plan->id,
                'name' => 'Langganan '.$data->plan->name.' ('.$data->plan->periodLabel().')',
                'quantity' => 1,
                'unit_price' => $price,
                'subtotal' => $price,
            ]);

            return $order->fresh(['items']);
        });
    }
}
