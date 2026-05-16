<?php

namespace App\DataTransferObjects\Marketplace;

use App\Models\Coupon;
use App\Models\Course;
use App\Models\User;

/**
 * Input untuk pembuatan order satu course.
 * Disengaja immutable + framework-agnostic agar mudah di-test.
 */
final readonly class CreateOrderData
{
    public function __construct(
        public User $user,
        public Course $course,
        public ?string $customerName = null,
        public ?string $customerEmail = null,
        public ?string $customerPhone = null,
        public int $discount = 0,
        public ?Coupon $coupon = null,
    ) {}
}
