<?php

namespace App\Services\Subscription;

use App\Models\B2cPlan;
use App\Models\B2cSubscription;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Lifecycle management for B2C subscriptions (Netflix-style).
 *
 * - User has at most one ACTIVE subscription at a time.
 * - Manual renewal model (since Pakasir is one-time payment, not recurring).
 * - When user subscribes again before current ends_at, the new period
 *   is appended (extend), not replaced.
 */
final class B2cSubscriptionService
{
    public function activeFor(User $user): ?B2cSubscription
    {
        return B2cSubscription::query()
            ->where('user_id', $user->id)
            ->where('status', B2cSubscription::STATUS_ACTIVE)
            ->where('ends_at', '>', now())
            ->latest('ends_at')
            ->first();
    }

    public function hasAccess(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        return $this->activeFor($user) !== null;
    }

    /**
     * Create a new subscription or extend the existing active one.
     * Returns the resulting subscription row.
     */
    public function extendOrCreate(User $user, B2cPlan $plan, ?Order $order = null): B2cSubscription
    {
        return DB::transaction(function () use ($user, $plan, $order) {
            // Idempotency: if we've already activated for this order, return as-is.
            if ($order) {
                $alreadyApplied = B2cSubscription::query()
                    ->where('user_id', $user->id)
                    ->where('last_order_id', $order->id)
                    ->first();
                if ($alreadyApplied) {
                    return $alreadyApplied;
                }
            }

            $existing = B2cSubscription::query()
                ->where('user_id', $user->id)
                ->whereIn('status', [B2cSubscription::STATUS_ACTIVE])
                ->lockForUpdate()
                ->latest('ends_at')
                ->first();

            $duration = $plan->durationDays();

            if ($existing && $existing->isActive()) {
                $existing->update([
                    'b2c_plan_id' => $plan->id,
                    'ends_at' => $existing->ends_at->addDays($duration),
                    'last_order_id' => $order?->id ?? $existing->last_order_id,
                ]);

                return $existing->fresh();
            }

            // Mark old expired/cancelled rows so we don't have multiple "active".
            B2cSubscription::query()
                ->where('user_id', $user->id)
                ->where('status', B2cSubscription::STATUS_ACTIVE)
                ->update(['status' => B2cSubscription::STATUS_EXPIRED]);

            return B2cSubscription::create([
                'user_id' => $user->id,
                'b2c_plan_id' => $plan->id,
                'status' => B2cSubscription::STATUS_ACTIVE,
                'started_at' => now(),
                'ends_at' => now()->addDays($duration),
                'last_order_id' => $order?->id,
            ]);
        });
    }

    public function cancel(B2cSubscription $subscription): B2cSubscription
    {
        $subscription->update([
            'status' => B2cSubscription::STATUS_CANCELLED,
            'cancelled_at' => now(),
        ]);

        return $subscription->fresh();
    }
}
