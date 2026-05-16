<?php

namespace App\Services\Marketplace;

use App\DataTransferObjects\Marketplace\CouponQuote;
use App\Models\Bundle;
use App\Models\Coupon;
use App\Models\CouponRedemption;
use App\Models\Course;
use App\Models\Order;
use Closure;
use Illuminate\Support\Facades\DB;

final class CouponService
{
    public function quote(?string $code, Course $course): CouponQuote
    {
        return $this->resolveQuote(
            $code,
            (int) $course->price,
            fn (Coupon $coupon) => $coupon->appliesToCourse($course),
            scopeMismatchMessage: 'Voucher tidak berlaku untuk kursus ini.',
            zeroDiscountMessage: 'Voucher tidak memberi potongan untuk kursus ini.',
        );
    }

    public function quoteForBundle(?string $code, Bundle $bundle): CouponQuote
    {
        return $this->resolveQuote(
            $code,
            (int) $bundle->price,
            fn (Coupon $coupon) => $coupon->isScopedToAll(),
            scopeMismatchMessage: 'Voucher tidak berlaku untuk paket bundle.',
            zeroDiscountMessage: 'Voucher tidak memberi potongan untuk paket ini.',
        );
    }

    private function resolveQuote(
        ?string $code,
        int $subtotal,
        Closure $scopeAllowed,
        string $scopeMismatchMessage,
        string $zeroDiscountMessage,
    ): CouponQuote {
        if (! is_string($code) || trim($code) === '') {
            return CouponQuote::empty($subtotal);
        }

        $coupon = Coupon::query()
            ->whereRaw('UPPER(code) = ?', [strtoupper(trim($code))])
            ->first();

        if (! $coupon) {
            return CouponQuote::invalid($subtotal, 'Kode voucher tidak ditemukan.');
        }

        if (! $coupon->is_active) {
            return CouponQuote::invalid($subtotal, 'Voucher tidak aktif.');
        }

        if ($coupon->hasReachedUsageLimit()) {
            return CouponQuote::invalid($subtotal, 'Voucher sudah habis dipakai.');
        }

        if (! $scopeAllowed($coupon)) {
            return CouponQuote::invalid($subtotal, $scopeMismatchMessage);
        }

        $discount = $this->calculateDiscount($coupon, $subtotal);

        if ($discount <= 0) {
            return CouponQuote::invalid($subtotal, $zeroDiscountMessage);
        }

        return CouponQuote::valid($coupon, $subtotal, $discount);
    }

    public function calculateDiscount(Coupon $coupon, int $subtotal): int
    {
        if ($subtotal <= 0) {
            return 0;
        }

        $raw = $coupon->isPercentage()
            ? (int) floor($subtotal * $coupon->discount_value / 100)
            : (int) $coupon->discount_value;

        if ($coupon->isPercentage() && $coupon->max_discount !== null) {
            $raw = min($raw, (int) $coupon->max_discount);
        }

        return min($raw, $subtotal);
    }

    /**
     * Atomically increment uses_count and create a redemption record.
     * Returns null if the coupon hit its usage limit before we could claim it.
     */
    public function redeem(Coupon $coupon, Order $order, int $discountApplied): ?CouponRedemption
    {
        return DB::transaction(function () use ($coupon, $order, $discountApplied) {
            $locked = Coupon::query()
                ->whereKey($coupon->id)
                ->lockForUpdate()
                ->first();

            if (! $locked) {
                return null;
            }

            if ($locked->hasReachedUsageLimit()) {
                return null;
            }

            $locked->increment('uses_count');

            return CouponRedemption::create([
                'coupon_id' => $locked->id,
                'user_id' => $order->user_id,
                'order_id' => $order->id,
                'discount_applied' => $discountApplied,
            ]);
        });
    }
}
