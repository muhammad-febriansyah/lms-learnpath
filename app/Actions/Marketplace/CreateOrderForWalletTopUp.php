<?php

namespace App\Actions\Marketplace;

use App\DataTransferObjects\Marketplace\CreateWalletTopUpOrderData;
use App\Models\Order;
use App\Models\Organization;
use Illuminate\Support\Facades\DB;

/**
 * Buat Order untuk top-up e-wallet organisasi. Saat order paid, listener
 * CreditWalletOnTopUpPayment akan menambah saldo wallet org.
 */
final class CreateOrderForWalletTopUp
{
    public function __construct(
        private readonly GenerateOrderNumber $generateOrderNumber,
    ) {}

    public function execute(CreateWalletTopUpOrderData $data): Order
    {
        return DB::transaction(function () use ($data) {
            $expiryHours = (int) config('services.pakasir.order_expiry_hours', 24);
            $amount = $data->amount;

            $order = Order::create([
                'user_id' => $data->user->id,
                'order_number' => ($this->generateOrderNumber)(),
                'type' => 'wallet_topup',
                'subtotal' => $amount,
                'discount' => 0,
                'tax' => 0,
                'total' => $amount,
                'currency' => 'IDR',
                'status' => 'pending',
                'customer_name' => $data->customerName ?? $data->user->name,
                'customer_email' => $data->customerEmail ?? $data->user->email,
                'customer_phone' => $data->customerPhone ?? $data->user->phone,
                'expires_at' => now()->addHours($expiryHours),
                'metadata' => [
                    'organization_id' => $data->organization->id,
                    'organization_name' => $data->organization->name,
                    'amount' => $amount,
                ],
            ]);

            $order->items()->create([
                'purchasable_type' => Organization::class,
                'purchasable_id' => $data->organization->id,
                'name' => 'Top up wallet — '.$data->organization->name,
                'quantity' => 1,
                'unit_price' => $amount,
                'subtotal' => $amount,
            ]);

            return $order->fresh(['items']);
        });
    }
}
