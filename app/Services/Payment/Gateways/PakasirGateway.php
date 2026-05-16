<?php

namespace App\Services\Payment\Gateways;

use App\Services\Payment\Contracts\PaymentGatewayInterface;
use App\Services\Payment\DTOs\CreatePaymentData;
use App\Services\Payment\DTOs\PaymentResult;
use App\Services\Payment\Enums\PaymentMethod;
use App\Services\Payment\Enums\PaymentStatus;
use App\Services\Payment\Exceptions\PaymentException;
use Carbon\CarbonImmutable;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Pakasir gateway — link pembayaran QRIS + Virtual Account.
 *
 * Endpoint:
 *  - POST /api/transactioncreate/{method}  — buat transaksi baru
 *  - GET  /api/transactiondetail           — cek status
 *  - POST /api/transactioncancel           — batalkan transaksi pending
 *  - POST /api/paymentsimulation           — sandbox only, simulate paid
 */
final class PakasirGateway implements PaymentGatewayInterface
{
    public function __construct(
        private readonly string $baseUrl,
        private readonly string $project,
        private readonly string $apiKey,
    ) {}

    public function name(): string
    {
        return 'pakasir';
    }

    public function getPaymentUrl(string $orderId, int $amount, ?string $redirectUrl = null): string
    {
        $url = sprintf('%s/pay/%s/%d?order_id=%s', $this->baseUrl, $this->project, $amount, $orderId);

        if ($redirectUrl) {
            $url .= '&redirect='.urlencode($redirectUrl);
        }

        return $url;
    }

    public function createPayment(CreatePaymentData $data): PaymentResult
    {
        $endpoint = "{$this->baseUrl}/api/transactioncreate/{$data->method->value}";

        $response = Http::asJson()
            ->acceptJson()
            ->timeout(15)
            ->retry(2, 1000, throw: false)
            ->post($endpoint, [
                'project' => $this->project,
                'order_id' => $data->orderId,
                'amount' => $data->amount,
                'api_key' => $this->apiKey,
            ]);

        $this->ensureOk($response, 'transactioncreate');

        $payment = $response->json('payment') ?? [];

        return new PaymentResult(
            orderId: $payment['order_id'] ?? $data->orderId,
            amount: (int) ($payment['amount'] ?? $data->amount),
            fee: (int) ($payment['fee'] ?? 0),
            totalPayment: (int) ($payment['total_payment'] ?? $data->amount),
            method: PaymentMethod::from($payment['payment_method'] ?? $data->method->value),
            status: PaymentStatus::PENDING,
            paymentNumber: $payment['payment_number'] ?? null,
            expiredAt: isset($payment['expired_at'])
                ? CarbonImmutable::parse($payment['expired_at'])
                : null,
            raw: $payment,
        );
    }

    public function checkStatus(string $orderId, int $amount): PaymentResult
    {
        $response = Http::acceptJson()
            ->timeout(15)
            ->retry(2, 1000, throw: false)
            ->get("{$this->baseUrl}/api/transactiondetail", [
                'project' => $this->project,
                'amount' => $amount,
                'order_id' => $orderId,
                'api_key' => $this->apiKey,
            ]);

        $this->ensureOk($response, 'transactiondetail');

        $tx = $response->json('transaction') ?? [];

        return new PaymentResult(
            orderId: $tx['order_id'] ?? $orderId,
            amount: (int) ($tx['amount'] ?? $amount),
            fee: 0,
            totalPayment: (int) ($tx['amount'] ?? $amount),
            method: PaymentMethod::tryFrom($tx['payment_method'] ?? '') ?? PaymentMethod::QRIS,
            status: PaymentStatus::tryFrom($tx['status'] ?? '') ?? PaymentStatus::PENDING,
            completedAt: isset($tx['completed_at'])
                ? CarbonImmutable::parse($tx['completed_at'])
                : null,
            raw: $tx,
        );
    }

    public function cancel(string $orderId, int $amount): bool
    {
        $response = Http::asJson()
            ->acceptJson()
            ->timeout(15)
            ->post("{$this->baseUrl}/api/transactioncancel", [
                'project' => $this->project,
                'order_id' => $orderId,
                'amount' => $amount,
                'api_key' => $this->apiKey,
            ]);

        return $response->successful();
    }

    /**
     * Sandbox only — trigger webhook seakan user sudah bayar.
     */
    public function simulatePayment(string $orderId, int $amount): bool
    {
        $response = Http::asJson()
            ->acceptJson()
            ->post("{$this->baseUrl}/api/paymentsimulation", [
                'project' => $this->project,
                'order_id' => $orderId,
                'amount' => $amount,
                'api_key' => $this->apiKey,
            ]);

        return $response->successful();
    }

    private function ensureOk(Response $response, string $endpoint): void
    {
        if ($response->failed()) {
            Log::error('Pakasir API error', [
                'endpoint' => $endpoint,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            throw new PaymentException(
                "Pakasir {$endpoint} gagal: HTTP {$response->status()}",
            );
        }
    }
}
