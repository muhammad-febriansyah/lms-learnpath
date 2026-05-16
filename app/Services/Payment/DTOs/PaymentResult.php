<?php

namespace App\Services\Payment\DTOs;

use App\Services\Payment\Enums\PaymentMethod;
use App\Services\Payment\Enums\PaymentStatus;
use Carbon\CarbonImmutable;

final readonly class PaymentResult
{
    /**
     * @param  array<string, mixed>  $raw
     */
    public function __construct(
        public string $orderId,
        public int $amount,
        public int $fee,
        public int $totalPayment,
        public PaymentMethod $method,
        public PaymentStatus $status,
        public ?string $paymentNumber = null,
        public ?CarbonImmutable $expiredAt = null,
        public ?CarbonImmutable $completedAt = null,
        public array $raw = [],
    ) {}
}
