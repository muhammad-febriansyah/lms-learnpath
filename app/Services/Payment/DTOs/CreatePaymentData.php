<?php

namespace App\Services\Payment\DTOs;

use App\Services\Payment\Enums\PaymentMethod;

final readonly class CreatePaymentData
{
    public function __construct(
        public string $orderId,
        public int $amount,
        public PaymentMethod $method,
        public ?string $redirectUrl = null,
    ) {}
}
