<?php

namespace App\Services\Voucher;

use App\Models\Bundle;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LearningPath;
use App\Models\User;
use App\Models\Voucher;
use App\Models\VoucherRedemption;
use App\Services\Gamification\PointService;
use App\Services\Learning\PathEnrollmentService;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;

/**
 * Validates and redeems voucher codes.
 *
 * Code → grants Course / Bundle / LearningPath enrollment, or credits points.
 * Idempotent per (voucher_id, user_id) via UNIQUE index on voucher_redemptions.
 */
final class VoucherService
{
    public function findByCode(string $code): ?Voucher
    {
        $normalized = $this->normalize($code);
        if ($normalized === '') {
            return null;
        }

        return Voucher::query()
            ->where('code', $normalized)
            ->first();
    }

    public function redeem(User $user, string $code): VoucherRedemption
    {
        $voucher = $this->findByCode($code);
        if (! $voucher) {
            throw new InvalidVoucherException('Kode voucher tidak ditemukan.');
        }

        $this->assertEligible($voucher, $user);

        return DB::transaction(function () use ($voucher, $user) {
            $voucher = Voucher::query()
                ->whereKey($voucher->id)
                ->lockForUpdate()
                ->firstOrFail();

            $this->assertEligible($voucher, $user);

            $result = $this->applyGrant($voucher, $user);

            $redemption = VoucherRedemption::create([
                'voucher_id' => $voucher->id,
                'user_id' => $user->id,
                'grant_kind' => $voucher->grant_kind,
                'grantable_type' => $voucher->grantable_type,
                'grantable_id' => $voucher->grantable_id,
                'points_credited' => $voucher->grant_kind === Voucher::KIND_POINTS
                    ? (int) $voucher->points_amount
                    : null,
                'result_summary' => $result,
                'redeemed_at' => now(),
            ]);

            $voucher->increment('uses_count');

            if ($voucher->voucher_batch_id) {
                $voucher->batch()->increment('redeemed_count');
            }

            return $redemption;
        });
    }

    public function describeGrant(Voucher $voucher): string
    {
        return match ($voucher->grant_kind) {
            Voucher::KIND_POINTS => 'Top-up '.number_format((int) $voucher->points_amount, 0, ',', '.').' poin',
            Voucher::KIND_COURSE => 'Akses course "'.($voucher->grantable?->title ?? '-').'"',
            Voucher::KIND_BUNDLE => 'Akses bundle "'.($voucher->grantable?->name ?? $voucher->grantable?->title ?? '-').'"',
            Voucher::KIND_LEARNING_PATH => 'Akses learning path "'.($voucher->grantable?->title ?? '-').'"',
            default => 'Hadiah tidak dikenali',
        };
    }

    private function assertEligible(Voucher $voucher, User $user): void
    {
        if (! $voucher->is_active) {
            throw new InvalidVoucherException('Voucher tidak aktif.');
        }

        if (! $voucher->isWithinWindow()) {
            throw new InvalidVoucherException('Voucher di luar masa berlaku.');
        }

        if ($voucher->hasReachedUsageLimit()) {
            throw new InvalidVoucherException('Kuota voucher sudah habis.');
        }

        if ($voucher->bound_user_id && (int) $voucher->bound_user_id !== (int) $user->id) {
            throw new InvalidVoucherException('Voucher ini bukan untuk akun Anda.');
        }

        if ($voucher->bound_email && strcasecmp($voucher->bound_email, (string) $user->email) !== 0) {
            throw new InvalidVoucherException('Voucher ini terdaftar untuk email lain.');
        }

        if ($voucher->single_use_per_user) {
            $alreadyUsed = VoucherRedemption::query()
                ->where('voucher_id', $voucher->id)
                ->where('user_id', $user->id)
                ->exists();
            if ($alreadyUsed) {
                throw new InvalidVoucherException('Voucher ini sudah Anda pakai sebelumnya.');
            }
        }

        // For grants that enroll, skip if user is already enrolled — voucher should not be wasted.
        $grantable = $voucher->grantable;
        if ($grantable instanceof Course) {
            $exists = Enrollment::query()
                ->where('user_id', $user->id)
                ->where('course_id', $grantable->id)
                ->exists();
            if ($exists) {
                throw new InvalidVoucherException('Anda sudah terdaftar di course ini.');
            }
        }
    }

    private function applyGrant(Voucher $voucher, User $user): array
    {
        if ($voucher->grant_kind === Voucher::KIND_POINTS) {
            $amount = (int) $voucher->points_amount;
            App::make(PointService::class)->credit(
                $user,
                $amount,
                'voucher_topup',
                $voucher,
                ['meta' => ['voucher_code' => $voucher->code]],
            );

            return [
                'kind' => 'points',
                'points' => $amount,
                'message' => "Top-up {$amount} poin masuk ke saldo.",
            ];
        }

        $grantable = $voucher->grantable;
        if (! $grantable) {
            throw new InvalidVoucherException('Item voucher tidak tersedia.');
        }

        if ($grantable instanceof Course) {
            $this->ensureCourseEnrollment($user, $grantable);

            return [
                'kind' => 'course',
                'title' => $grantable->title,
                'slug' => $grantable->slug,
                'href' => "/learn/{$grantable->slug}",
                'message' => "Akses course \"{$grantable->title}\" sudah aktif.",
            ];
        }

        if ($grantable instanceof Bundle) {
            $grantable->loadMissing('courses:id,title');
            foreach ($grantable->courses as $course) {
                $this->ensureCourseEnrollment($user, $course);
            }

            return [
                'kind' => 'bundle',
                'name' => $grantable->name ?? $grantable->title ?? '-',
                'courses_count' => $grantable->courses->count(),
                'href' => '/my-courses',
                'message' => 'Akses bundle berhasil dibuka.',
            ];
        }

        if ($grantable instanceof LearningPath) {
            App::make(PathEnrollmentService::class)->enroll($user, $grantable);

            return [
                'kind' => 'learning_path',
                'title' => $grantable->title,
                'href' => '/my-paths',
                'message' => "Akses learning path \"{$grantable->title}\" sudah aktif.",
            ];
        }

        throw new InvalidVoucherException('Tipe hadiah voucher tidak didukung.');
    }

    private function ensureCourseEnrollment(User $user, Course $course): void
    {
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

    private function normalize(string $code): string
    {
        return strtoupper(trim($code));
    }
}
