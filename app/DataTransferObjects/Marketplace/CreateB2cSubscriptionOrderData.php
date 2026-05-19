<?php

namespace App\DataTransferObjects\Marketplace;

use App\Models\B2cPlan;
use App\Models\User;

final readonly class CreateB2cSubscriptionOrderData
{
    public function __construct(
        public User $user,
        public B2cPlan $plan,
        public ?string $customerName = null,
        public ?string $customerEmail = null,
        public ?string $customerPhone = null,
    ) {}
}
