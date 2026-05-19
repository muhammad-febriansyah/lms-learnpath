<?php

namespace App\Listeners\Marketplace;

use App\Events\Marketplace\OrderPaid;
use App\Models\Organization;
use App\Models\WalletTransaction;
use App\Services\Wallet\WalletService;
use Illuminate\Support\Facades\Log;

final class CreditWalletOnTopUpPayment
{
    public function __construct(
        private readonly WalletService $wallet,
    ) {}

    public function handle(OrderPaid $event): void
    {
        $order = $event->order;

        if ($order->type !== 'wallet_topup') {
            return;
        }

        $orgId = (int) ($order->metadata['organization_id'] ?? 0);
        $amount = (int) ($order->metadata['amount'] ?? $order->total);

        if ($orgId === 0 || $amount <= 0) {
            Log::warning('wallet_topup order missing organization_id or amount metadata', [
                'order_number' => $order->order_number,
                'metadata' => $order->metadata,
            ]);

            return;
        }

        // Idempotency: if a top-up transaction already exists for this order,
        // skip — listeners can fire twice in Laravel 11+ (auto-discovery + Event::listen).
        $existing = WalletTransaction::query()
            ->where('reference_type', $order::class)
            ->where('reference_id', $order->id)
            ->where('type', WalletTransaction::TYPE_TOP_UP)
            ->exists();
        if ($existing) {
            return;
        }

        $org = Organization::query()->find($orgId);
        if (! $org) {
            Log::warning('wallet_topup order references missing organization', [
                'order_number' => $order->order_number,
                'organization_id' => $orgId,
            ]);

            return;
        }

        $wallet = $this->wallet->ensureFor($org);
        $this->wallet->credit(
            wallet: $wallet,
            amount: $amount,
            type: WalletTransaction::TYPE_TOP_UP,
            reference: $order,
            description: 'Top up via order '.$order->order_number,
        );

        Log::info('Wallet credited from top-up payment', [
            'order_number' => $order->order_number,
            'organization_id' => $orgId,
            'amount' => $amount,
            'new_balance' => $wallet->fresh()->balance,
        ]);
    }
}
