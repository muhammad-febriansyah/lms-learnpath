<?php

namespace App\DataTransferObjects\Marketplace;

use App\Models\Coupon;

final readonly class CouponQuote
{
    public function __construct(
        public bool $valid,
        public int $subtotal,
        public int $discount,
        public int $total,
        public ?Coupon $coupon = null,
        public ?string $error = null,
    ) {}

    public static function invalid(int $subtotal, string $error): self
    {
        return new self(
            valid: false,
            subtotal: $subtotal,
            discount: 0,
            total: $subtotal,
            coupon: null,
            error: $error,
        );
    }

    public static function valid(Coupon $coupon, int $subtotal, int $discount): self
    {
        return new self(
            valid: true,
            subtotal: $subtotal,
            discount: $discount,
            total: max(0, $subtotal - $discount),
            coupon: $coupon,
            error: null,
        );
    }

    public static function empty(int $subtotal): self
    {
        return new self(
            valid: false,
            subtotal: $subtotal,
            discount: 0,
            total: $subtotal,
            coupon: null,
            error: null,
        );
    }
}
