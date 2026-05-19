<?php

namespace App\DataTransferObjects\Marketplace;

use App\Models\Coupon;
use App\Models\LearningPath;
use App\Models\User;

final readonly class CreateLearningPathOrderData
{
    public function __construct(
        public User $user,
        public LearningPath $path,
        public ?string $customerName = null,
        public ?string $customerEmail = null,
        public ?string $customerPhone = null,
        public int $discount = 0,
        public ?Coupon $coupon = null,
    ) {}
}
