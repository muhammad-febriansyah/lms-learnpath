<?php

namespace App\Services\Gamification;

use App\Models\Bundle;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LearningPath;
use App\Models\PointRedemption;
use App\Models\PointRedemptionOffer;
use App\Models\User;
use App\Services\Learning\PathEnrollmentService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Marketplace-style point redemption.
 *
 * - Admin curates PointRedemptionOffer rows linked polymorphically to a Course,
 *   Bundle, or LearningPath.
 * - User can redeem an active offer if they meet the gating rules (window,
 *   per-user cap, total cap) and have enough points.
 * - Spend + enrollment + ledger row happen atomically.
 * - Refund credits the points back and (optionally) cancels the enrollment.
 */
final class RedemptionService
{
    public function __construct(
        private readonly PointService $points,
    ) {}

    public function redeem(User $user, PointRedemptionOffer $offer): PointRedemption
    {
        $this->assertEligible($user, $offer);

        return DB::transaction(function () use ($user, $offer) {
            $offer = PointRedemptionOffer::query()
                ->whereKey($offer->id)
                ->lockForUpdate()
                ->firstOrFail();

            $this->assertEligible($user, $offer, lockedCheck: true);

            $redeemable = $offer->redeemable;
            if (! $redeemable) {
                throw new RuntimeException('Item yang dapat ditukar sudah tidak tersedia.');
            }

            $reason = $this->reasonFor($offer->redeemable_type);
            $spend = $this->points->spend(
                $user,
                $offer->point_price,
                $reason,
                $offer,
                ['meta' => [
                    'offer_id' => $offer->id,
                    'redeemable_type' => $offer->redeemable_type,
                    'redeemable_id' => $offer->redeemable_id,
                ]],
            );

            $this->enrollUserInto($user, $redeemable);

            $redemption = PointRedemption::create([
                'user_id' => $user->id,
                'point_redemption_offer_id' => $offer->id,
                'redeemable_type' => $offer->redeemable_type,
                'redeemable_id' => $offer->redeemable_id,
                'points_spent' => $offer->point_price,
                'point_transaction_id' => $spend->id,
                'status' => PointRedemption::STATUS_COMPLETED,
            ]);

            $offer->increment('redemptions_count');

            return $redemption;
        });
    }

    public function refund(
        PointRedemption $redemption,
        ?string $reason = null,
        bool $cancelEnrollment = false,
    ): PointRedemption {
        if (! $redemption->isRefundable()) {
            throw new RuntimeException('Redemption ini tidak dapat di-refund.');
        }

        return DB::transaction(function () use ($redemption, $reason, $cancelEnrollment) {
            $user = $redemption->user;
            if (! $user) {
                throw new RuntimeException('User redemption sudah tidak ada.');
            }

            $credit = $this->points->credit(
                $user,
                $redemption->points_spent,
                'redeem_refund',
                $redemption,
                ['meta' => [
                    'original_transaction_id' => $redemption->point_transaction_id,
                    'reason' => $reason,
                ]],
            );

            $redemption->update([
                'status' => PointRedemption::STATUS_REFUNDED,
                'refund_transaction_id' => $credit->id,
                'refunded_at' => now(),
                'refund_reason' => $reason,
            ]);

            $redemption->offer()->decrement('redemptions_count');

            if ($cancelEnrollment) {
                $this->cancelEnrollment($user, $redemption->redeemable);
            }

            return $redemption->fresh();
        });
    }

    public function offerFor(Model $redeemable): ?PointRedemptionOffer
    {
        return PointRedemptionOffer::query()
            ->where('redeemable_type', $redeemable->getMorphClass())
            ->where('redeemable_id', $redeemable->getKey())
            ->where('is_active', true)
            ->first();
    }

    public function userRedemptionCount(User $user, PointRedemptionOffer $offer): int
    {
        return PointRedemption::query()
            ->where('user_id', $user->id)
            ->where('point_redemption_offer_id', $offer->id)
            ->where('status', PointRedemption::STATUS_COMPLETED)
            ->count();
    }

    private function assertEligible(
        User $user,
        PointRedemptionOffer $offer,
        bool $lockedCheck = false,
    ): void {
        if (! $offer->is_active) {
            throw new RuntimeException('Penawaran tukar poin ini tidak aktif.');
        }

        if (! $offer->isWithinWindow()) {
            throw new RuntimeException('Penawaran tukar poin di luar periode berlaku.');
        }

        $userCount = $this->userRedemptionCount($user, $offer);
        if ($offer->max_per_user !== null && $userCount >= (int) $offer->max_per_user) {
            throw new RuntimeException('Anda sudah mencapai batas tukar untuk penawaran ini.');
        }

        if ($offer->max_total !== null && (int) $offer->redemptions_count >= (int) $offer->max_total) {
            throw new RuntimeException('Kuota penawaran sudah habis.');
        }

        // Allow eligibility checks before the locked transaction reads the actual point balance.
        if (! $lockedCheck) {
            $balance = (int) ($user->userPoint?->total_points ?? 0);
            if ($balance < (int) $offer->point_price) {
                throw new InsufficientPointsException(
                    "Saldo poin tidak cukup. Butuh {$offer->point_price}, tersedia {$balance}.",
                );
            }
        }
    }

    private function reasonFor(string $morphClass): string
    {
        return match ($morphClass) {
            Course::class, 'course' => 'redeem_course',
            Bundle::class, 'bundle' => 'redeem_bundle',
            LearningPath::class, 'learning_path' => 'redeem_path',
            default => 'redeem_other',
        };
    }

    private function enrollUserInto(User $user, Model $redeemable): void
    {
        if ($redeemable instanceof Course) {
            Enrollment::firstOrCreate(
                ['user_id' => $user->id, 'course_id' => $redeemable->id],
                [
                    'status' => 'active',
                    'progress_percent' => 0,
                    'pre_test_status' => 'not_started',
                    'post_test_status' => 'not_started',
                    'certificate_status' => 'not_issued',
                    'enrolled_at' => now(),
                ],
            );

            return;
        }

        if ($redeemable instanceof Bundle) {
            $redeemable->loadMissing('courses:id');
            foreach ($redeemable->courses as $course) {
                Enrollment::firstOrCreate(
                    ['user_id' => $user->id, 'course_id' => $course->id],
                    [
                        'status' => 'active',
                        'progress_percent' => 0,
                        'pre_test_status' => 'not_started',
                        'post_test_status' => 'not_started',
                        'certificate_status' => 'not_issued',
                        'enrolled_at' => now(),
                    ],
                );
            }

            return;
        }

        if ($redeemable instanceof LearningPath) {
            App::make(PathEnrollmentService::class)->enroll($user, $redeemable);

            return;
        }

        throw new RuntimeException('Tipe item tidak didukung untuk redemption.');
    }

    private function cancelEnrollment(User $user, ?Model $redeemable): void
    {
        if (! $redeemable) {
            return;
        }

        if ($redeemable instanceof Course) {
            Enrollment::query()
                ->where('user_id', $user->id)
                ->where('course_id', $redeemable->id)
                ->where('status', '!=', 'completed')
                ->delete();

            return;
        }

        if ($redeemable instanceof Bundle) {
            $courseIds = $redeemable->courses()->pluck('courses.id');
            Enrollment::query()
                ->where('user_id', $user->id)
                ->whereIn('course_id', $courseIds)
                ->where('status', '!=', 'completed')
                ->delete();

            return;
        }

        // LearningPath: keep child enrollments by default — only sever the path link
        // because deleting child rows could destroy progress legitimately earned later.
    }
}
