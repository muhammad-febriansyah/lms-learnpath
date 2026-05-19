<?php

namespace App\Support;

use App\Models\PointRedemption;
use App\Models\PointRedemptionOffer;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * Builds the front-end payload describing whether a Course/Bundle/LearningPath
 * can be redeemed with points by the current user.
 */
final class PointOfferPresenter
{
    public static function for(Model $redeemable, ?User $user): ?array
    {
        $offer = PointRedemptionOffer::query()
            ->where('redeemable_type', $redeemable->getMorphClass())
            ->where('redeemable_id', $redeemable->getKey())
            ->where('is_active', true)
            ->first();

        if (! $offer) {
            return null;
        }

        $typeKey = array_search($offer->redeemable_type, PointRedemptionOffer::REDEEMABLE_TYPES, true) ?: 'unknown';
        $userPoints = (int) ($user?->userPoint?->total_points ?? 0);
        $now = now();

        $reason = null;
        if ($offer->redeemable_from && $now < $offer->redeemable_from) {
            $reason = 'not_started';
        } elseif ($offer->redeemable_until && $now > $offer->redeemable_until) {
            $reason = 'expired';
        } elseif ($offer->max_total !== null && (int) $offer->redemptions_count >= (int) $offer->max_total) {
            $reason = 'sold_out';
        } elseif ($user && $offer->max_per_user !== null) {
            $userCount = PointRedemption::query()
                ->where('user_id', $user->id)
                ->where('point_redemption_offer_id', $offer->id)
                ->where('status', 'completed')
                ->count();
            if ($userCount >= (int) $offer->max_per_user) {
                $reason = 'limit_reached';
            }
        }

        if ($reason === null && $user && $userPoints < (int) $offer->point_price) {
            $reason = 'insufficient';
        }

        if ($reason === null && ! $user) {
            $reason = 'login_required';
        }

        return [
            'id' => $offer->id,
            'redeemable_type' => $typeKey,
            'redeemable_id' => $offer->redeemable_id,
            'point_price' => (int) $offer->point_price,
            'redeemable_from' => $offer->redeemable_from?->toIso8601String(),
            'redeemable_until' => $offer->redeemable_until?->toIso8601String(),
            'max_per_user' => $offer->max_per_user,
            'remaining_quota' => $offer->max_total !== null
                ? max(0, (int) $offer->max_total - (int) $offer->redemptions_count)
                : null,
            'user_points' => $userPoints,
            'eligible' => $reason === null,
            'ineligible_reason' => $reason,
        ];
    }
}
