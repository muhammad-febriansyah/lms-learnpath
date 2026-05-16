<?php

namespace App\Actions\Marketplace;

use App\Models\Order;
use App\Models\Payment;
use App\Services\Payment\DTOs\CreatePaymentData;
use App\Services\Payment\Enums\PaymentGateway;
use App\Services\Payment\Enums\PaymentMethod;
use App\Services\Payment\PaymentManager;
use Illuminate\Support\Facades\DB;

/**
 * Buat instance pembayaran di Pakasir untuk Order yang sudah ada.
 * Simpan record Payment dengan status pending + URL pembayaran.
 */
final class InitiatePakasirPayment
{
    public function __construct(
        private readonly PaymentManager $paymentManager,
    ) {}

    public function execute(Order $order, PaymentMethod $method, ?string $redirectUrl = null): Payment
    {
        $gateway = $this->paymentManager->gateway(PaymentGateway::PAKASIR);

        $result = $gateway->createPayment(new CreatePaymentData(
            orderId: $order->order_number,
            amount: $order->total,
            method: $method,
            redirectUrl: $redirectUrl,
        ));

        $paymentUrl = $gateway->getPaymentUrl(
            $order->order_number,
            $order->total,
            $redirectUrl,
        );

        return DB::transaction(fn () => Payment::create([
            'order_id' => $order->id,
            'gateway' => PaymentGateway::PAKASIR->value,
            'payment_method' => $method->value,
            'payment_number' => $result->paymentNumber,
            'payment_url' => $paymentUrl,
            'amount' => $order->total,
            'fee' => $result->fee,
            'total_payment' => $result->totalPayment,
            'status' => $result->status->value,
            'raw_response' => $result->raw,
            'expired_at' => $result->expiredAt,
        ]));
    }
}
