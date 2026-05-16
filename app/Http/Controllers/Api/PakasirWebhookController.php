<?php

namespace App\Http\Controllers\Api;

use App\Actions\Marketplace\MarkOrderAsPaid;
use App\DataTransferObjects\Marketplace\PakasirWebhookData;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Payment\Enums\PaymentGateway;
use App\Services\Payment\Enums\PaymentStatus;
use App\Services\Payment\PaymentManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PakasirWebhookController extends Controller
{
    public function __construct(
        private readonly PaymentManager $paymentManager,
        private readonly MarkOrderAsPaid $markPaid,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->validate([
            'order_id' => ['required', 'string'],
            'amount' => ['required', 'integer', 'min:0'],
            'status' => ['nullable', 'string'],
            'payment_method' => ['nullable', 'string'],
            'completed_at' => ['nullable', 'string'],
        ]);

        Log::info('Pakasir webhook received', $data);

        $order = Order::query()
            ->where('order_number', $data['order_id'])
            ->first();

        if (! $order) {
            Log::warning('Pakasir webhook for unknown order', ['order_id' => $data['order_id']]);

            return response()->json(['status' => 'order_not_found'], 404);
        }

        // Anti-spoofing: tarik status terbaru langsung dari Pakasir API.
        $gateway = $this->paymentManager->gateway(PaymentGateway::PAKASIR);
        $verified = $gateway->checkStatus($order->order_number, $order->total);

        if ($verified->status !== PaymentStatus::COMPLETED) {
            Log::info('Pakasir status not completed yet', [
                'order_id' => $order->order_number,
                'status' => $verified->status->value,
            ]);

            return response()->json([
                'status' => 'pending',
                'gateway_status' => $verified->status->value,
            ], 202);
        }

        $this->markPaid->execute($order, new PakasirWebhookData(
            orderId: $order->order_number,
            amount: $verified->amount,
            status: 'completed',
            paymentMethod: $verified->method->value,
            completedAt: $verified->completedAt?->toIso8601String(),
            raw: array_merge($verified->raw, $data),
        ));

        return response()->json(['status' => 'ok']);
    }
}
