<?php

namespace App\Services\Payment\Contracts;

use App\Services\Payment\DTOs\CreatePaymentData;
use App\Services\Payment\DTOs\PaymentResult;

interface PaymentGatewayInterface
{
    public function name(): string;

    /**
     * URL halaman pembayaran (untuk gateway yang support redirect mode).
     */
    public function getPaymentUrl(string $orderId, int $amount, ?string $redirectUrl = null): string;

    /**
     * Buat instance pembayaran baru di gateway. Pakai sebelum tampilkan QR/VA ke user.
     */
    public function createPayment(CreatePaymentData $data): PaymentResult;

    /**
     * Cek status pembayaran ke gateway (re-verify, anti-spoofing webhook).
     */
    public function checkStatus(string $orderId, int $amount): PaymentResult;

    /**
     * Batalkan transaksi pending.
     */
    public function cancel(string $orderId, int $amount): bool;
}
