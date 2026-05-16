<?php

namespace App\Actions\Marketplace;

use App\DataTransferObjects\Marketplace\PakasirWebhookData;
use App\Events\Marketplace\OrderPaid;
use App\Models\Order;
use App\Models\Payment;
use App\Services\Marketplace\CouponService;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Transisikan Order ke status `paid` dan rekam Payment yang sukses.
 * Idempotent: aman dipanggil ulang oleh webhook retry — tidak akan
 * dispatch event ganda atau bikin enrollment dobel.
 */
final class MarkOrderAsPaid
{
    public function __construct(
        private readonly CouponService $coupons,
    ) {}

    public function execute(Order $order, PakasirWebhookData $data): Order
    {
        if ($order->status === 'paid') {
            Log::info('Order already paid, skipping', ['order_number' => $order->order_number]);

            return $order;
        }

        return DB::transaction(function () use ($order, $data) {
            $completedAt = $data->completedAt
                ? CarbonImmutable::parse($data->completedAt)
                : CarbonImmutable::now();

            $order->update([
                'status' => 'paid',
                'paid_at' => $completedAt,
            ]);

            $payment = $order->payments()
                ->where('gateway', 'pakasir')
                ->latest('id')
                ->first();

            if ($payment) {
                $payment->update([
                    'status' => 'completed',
                    'completed_at' => $completedAt,
                    'raw_response' => array_merge(
                        (array) $payment->raw_response,
                        ['webhook' => $data->raw],
                    ),
                ]);
            } else {
                Payment::create([
                    'order_id' => $order->id,
                    'gateway' => 'pakasir',
                    'payment_method' => $data->paymentMethod,
                    'amount' => $data->amount,
                    'total_payment' => $data->amount,
                    'status' => 'completed',
                    'completed_at' => $completedAt,
                    'raw_response' => $data->raw,
                ]);
            }

            if ($order->coupon_id && $order->discount > 0) {
                $order->loadMissing('coupon');
                if ($order->coupon) {
                    $this->coupons->redeem($order->coupon, $order, $order->discount);
                }
            }

            OrderPaid::dispatch($order->fresh());

            return $order;
        });
    }
}
