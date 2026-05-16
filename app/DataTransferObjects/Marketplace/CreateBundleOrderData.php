<?php

namespace App\DataTransferObjects\Marketplace;

use App\Models\Bundle;
use App\Models\Coupon;
use App\Models\User;

final readonly class CreateBundleOrderData
{
    public function __construct(
        public User $user,
        public Bundle $bundle,
        public ?string $customerName = null,
        public ?string $customerEmail = null,
        public ?string $customerPhone = null,
        public int $discount = 0,
        public ?Coupon $coupon = null,
    ) {}
}
