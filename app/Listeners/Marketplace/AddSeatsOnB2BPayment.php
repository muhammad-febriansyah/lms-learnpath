<?php

namespace App\Listeners\Marketplace;

use App\Events\Marketplace\OrderPaid;
use App\Models\Organization;
use Illuminate\Support\Facades\Log;

final class AddSeatsOnB2BPayment
{
    public function handle(OrderPaid $event): void
    {
        $order = $event->order;

        if ($order->type !== 'b2b_seat') {
            return;
        }

        $orgId = (int) ($order->metadata['organization_id'] ?? 0);
        $seats = (int) ($order->metadata['seats'] ?? 0);

        if ($orgId === 0 || $seats === 0) {
            Log::warning('B2B order missing organization_id or seats metadata', [
                'order_number' => $order->order_number,
                'metadata' => $order->metadata,
            ]);

            return;
        }

        $org = Organization::query()->find($orgId);

        if (! $org) {
            Log::warning('B2B order references missing organization', [
                'order_number' => $order->order_number,
                'organization_id' => $orgId,
            ]);

            return;
        }

        $org->increment('seat_quota', $seats);

        Log::info('Added seats to organization from B2B payment', [
            'order_number' => $order->order_number,
            'organization_id' => $orgId,
            'seats_added' => $seats,
            'new_quota' => $org->fresh()->seat_quota,
        ]);
    }
}
