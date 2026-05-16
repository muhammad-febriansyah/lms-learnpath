<?php

namespace App\DataTransferObjects\Marketplace;

/**
 * Payload webhook Pakasir setelah verifikasi.
 *
 * @see docs Pakasir: webhook fires POST dengan order_id + amount + status.
 */
final readonly class PakasirWebhookData
{
    public function __construct(
        public string $orderId,
        public int $amount,
        public string $status,
        public ?string $paymentMethod = null,
        public ?string $completedAt = null,
        /** @var array<string, mixed> */
        public array $raw = [],
    ) {}
}
