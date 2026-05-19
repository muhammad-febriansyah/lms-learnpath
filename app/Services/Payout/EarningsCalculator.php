<?php

namespace App\Services\Payout;

use App\Models\Course;
use App\Models\PayoutRequest;
use App\Models\User;
use App\Support\Setting;
use Illuminate\Support\Facades\DB;

/**
 * Hitung saldo instructor & potongan fee tarik.
 *
 * Sumber penghasilan: order_items pada course yang dia ajar, dari order yang sudah paid.
 * gross  = SUM(order_items.subtotal) untuk course milik instructor
 * share  = gross × payout_revenue_share_percent / 100
 * paid   = SUM(net_amount) PayoutRequest status=paid
 * locked = SUM(gross_amount) PayoutRequest status in (pending, approved)
 * available = share − paid − locked
 */
final class EarningsCalculator
{
    public function grossEarnings(User $user): int
    {
        return (int) DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('courses', function ($join) {
                $join->on('courses.id', '=', 'order_items.purchasable_id')
                    ->where('order_items.purchasable_type', Course::class);
            })
            ->where('orders.status', 'paid')
            ->where('courses.instructor_id', $user->id)
            ->sum('order_items.subtotal');
    }

    public function shareEarnings(User $user): int
    {
        $gross = $this->grossEarnings($user);
        $sharePct = (float) Setting::get('payout_revenue_share_percent', 100);

        return (int) round($gross * $sharePct / 100);
    }

    public function totalPaid(User $user): int
    {
        return (int) PayoutRequest::query()
            ->where('user_id', $user->id)
            ->where('status', PayoutRequest::STATUS_PAID)
            ->sum('net_amount');
    }

    public function locked(User $user): int
    {
        return (int) PayoutRequest::query()
            ->where('user_id', $user->id)
            ->whereIn('status', [PayoutRequest::STATUS_PENDING, PayoutRequest::STATUS_APPROVED])
            ->sum('gross_amount');
    }

    public function availableBalance(User $user): int
    {
        $balance = $this->shareEarnings($user) - $this->totalPaid($user) - $this->locked($user);

        return max(0, $balance);
    }

    /**
     * Hitung fee & net untuk amount tertentu (untuk preview di form).
     *
     * @return array{fee: int, net: int}
     */
    public function quoteFee(int $grossAmount): array
    {
        $pct = (float) Setting::get('payout_fee_percent', 0);

        $fee = (int) round($grossAmount * $pct / 100);
        $fee = min($fee, $grossAmount);

        return [
            'fee' => $fee,
            'net' => $grossAmount - $fee,
        ];
    }
}
