<?php

namespace App\DataTransferObjects\Marketplace;

use App\Models\Organization;
use App\Models\User;

final readonly class CreateWalletTopUpOrderData
{
    public function __construct(
        public User $user,
        public Organization $organization,
        public int $amount,
        public ?string $customerName = null,
        public ?string $customerEmail = null,
        public ?string $customerPhone = null,
    ) {}
}
