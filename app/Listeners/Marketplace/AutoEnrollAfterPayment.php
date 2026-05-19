<?php

namespace App\Listeners\Marketplace;

use App\Actions\Marketplace\EnrollUserFromOrder;
use App\Events\Marketplace\OrderPaid;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

final class AutoEnrollAfterPayment implements ShouldQueue
{
    public function __construct(
        private readonly EnrollUserFromOrder $enroll,
    ) {}

    public function handle(OrderPaid $event): void
    {
        // B2B seat purchases don't enroll the buyer; they just top up seat quota.
        // Wallet top-ups also don't enroll the buyer; they credit the org wallet.
        if (in_array($event->order->type, ['b2b_seat', 'wallet_topup'], true)) {
            return;
        }

        $enrollments = $this->enroll->execute($event->order);

        Log::info('Auto-enrolled user from paid order', [
            'order_number' => $event->order->order_number,
            'user_id' => $event->order->user_id,
            'enrollment_ids' => array_map(fn ($e) => $e->id, $enrollments),
        ]);
    }
}
