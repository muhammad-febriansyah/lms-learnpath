<?php

namespace App\Services\Gamification;

use App\Models\PointTransaction;
use App\Models\User;
use App\Models\UserPoint;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;

/**
 * Central awarder for the gamification point system.
 *
 * - All point reasons go through award().
 * - Each award writes a PointTransaction row + bumps the cached UserPoint totals.
 * - Idempotency is enforced via dedupe_key + UNIQUE index.
 * - Daily caps (per reason, per user) prevent farming.
 * - Streak multiplier is applied automatically on `daily_login`.
 *
 * Returns the created PointTransaction, or null when the award was skipped
 * (already awarded, capped, disabled, or no user).
 */
final class PointService
{
    /**
     * @param  array{dedupe_key?: string, meta?: array<string,mixed>}  $options
     */
    public function award(
        ?User $user,
        string $reason,
        ?Model $reference = null,
        array $options = [],
    ): ?PointTransaction {
        if ($user === null) {
            return null;
        }

        $baseAmount = (int) config("points.rewards.{$reason}", 0);
        if ($baseAmount <= 0) {
            return null;
        }

        $bonus = 0;
        $meta = $options['meta'] ?? [];

        if ($reason === 'daily_login') {
            $streak = (int) ($user->learningStreak?->current_streak ?? 1);
            $bonus = $this->streakBonus($streak);
            $meta['streak'] = $streak;
            if ($bonus > 0) {
                $meta['streak_bonus'] = $bonus;
            }
        }

        $amount = $baseAmount + $bonus;
        $dedupeKey = $options['dedupe_key'] ?? $this->defaultDedupeKey($user, $reason, $reference);

        if ($this->isCappedForToday($user, $reason, $amount)) {
            return null;
        }

        return DB::transaction(function () use ($user, $reason, $reference, $amount, $dedupeKey, $meta) {
            try {
                $transaction = PointTransaction::create([
                    'user_id' => $user->id,
                    'reason' => $reason,
                    'amount' => $amount,
                    'reference_type' => $reference ? $reference->getMorphClass() : null,
                    'reference_id' => $reference?->getKey(),
                    'dedupe_key' => $dedupeKey,
                    'meta' => $meta ?: null,
                ]);
            } catch (QueryException $e) {
                // Unique violation on dedupe_key → already awarded.
                if (! str_contains($e->getMessage(), 'UNIQUE') && (int) $e->getCode() !== 23000) {
                    throw $e;
                }

                return null;
            }

            $this->bumpTotals($user, $amount, $reason === 'daily_login');

            return $transaction;
        });
    }

    /**
     * Deduct points from the user. Used by the redemption flow.
     * Throws InsufficientPointsException when balance would go negative.
     *
     * @param  array{dedupe_key?: string, meta?: array<string,mixed>}  $options
     */
    public function spend(
        User $user,
        int $amount,
        string $reason,
        ?Model $reference = null,
        array $options = [],
    ): PointTransaction {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Spend amount must be positive.');
        }

        $point = UserPoint::query()->firstOrCreate(['user_id' => $user->id]);
        if ((int) $point->total_points < $amount) {
            throw new InsufficientPointsException(
                "Saldo poin tidak cukup. Butuh {$amount}, tersedia {$point->total_points}.",
            );
        }

        $dedupeKey = $options['dedupe_key'] ?? $this->defaultDedupeKey($user, $reason, $reference);

        return DB::transaction(function () use ($user, $reason, $reference, $amount, $dedupeKey, $options) {
            $transaction = PointTransaction::create([
                'user_id' => $user->id,
                'reason' => $reason,
                'amount' => -$amount,
                'reference_type' => $reference ? $reference->getMorphClass() : null,
                'reference_id' => $reference?->getKey(),
                'dedupe_key' => $dedupeKey,
                'meta' => ($options['meta'] ?? []) ?: null,
            ]);

            $point = UserPoint::query()->lockForUpdate()->find($user->id);
            $point->total_points = max(0, (int) $point->total_points - $amount);
            // lifetime_points is never decremented — it tracks all-time earnings.
            $point->save();

            return $transaction;
        });
    }

    /**
     * Credit positive points without going through the rewards config (e.g. refunds).
     *
     * @param  array{dedupe_key?: string, meta?: array<string,mixed>}  $options
     */
    public function credit(
        User $user,
        int $amount,
        string $reason,
        ?Model $reference = null,
        array $options = [],
    ): PointTransaction {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Credit amount must be positive.');
        }

        $dedupeKey = $options['dedupe_key'] ?? $this->defaultDedupeKey($user, $reason, $reference);

        return DB::transaction(function () use ($user, $reason, $reference, $amount, $dedupeKey, $options) {
            $transaction = PointTransaction::create([
                'user_id' => $user->id,
                'reason' => $reason,
                'amount' => $amount,
                'reference_type' => $reference ? $reference->getMorphClass() : null,
                'reference_id' => $reference?->getKey(),
                'dedupe_key' => $dedupeKey,
                'meta' => ($options['meta'] ?? []) ?: null,
            ]);

            $this->bumpTotals($user, $amount);

            return $transaction;
        });
    }

    public function syncUserPoint(User $user): UserPoint
    {
        $lifetime = (int) PointTransaction::query()
            ->where('user_id', $user->id)
            ->sum('amount');

        $point = UserPoint::query()->firstOrNew(['user_id' => $user->id]);
        $point->lifetime_points = $lifetime;
        $point->total_points = $lifetime;
        $point->level = $this->levelFor($lifetime);
        $point->save();

        return $point;
    }

    public function levelFor(int $lifetimePoints): string
    {
        $levels = config('points.levels', [0 => 'bronze']);
        $thresholds = array_keys($levels);
        sort($thresholds);

        $matched = $levels[$thresholds[0]] ?? 'bronze';
        foreach ($thresholds as $threshold) {
            if ($lifetimePoints >= $threshold) {
                $matched = $levels[$threshold];
            }
        }

        return $matched;
    }

    public function streakBonus(int $currentStreak): int
    {
        $table = config('points.streak_bonus', []);
        $thresholds = array_keys($table);
        sort($thresholds);

        $bonus = 0;
        foreach ($thresholds as $threshold) {
            if ($currentStreak >= (int) $threshold) {
                $bonus = (int) $table[$threshold];
            }
        }

        return $bonus;
    }

    /**
     * Run a daily-login award + ensure streak is recorded. Returns transaction
     * (or null when already awarded today). Centralised so we can call it both
     * from the auth listener and from any "first action of the day" hook later.
     */
    public function awardDailyLogin(User $user, ?Carbon $now = null): ?PointTransaction
    {
        $today = ($now ?? Carbon::now())->toDateString();

        // Touch the streak first so the bonus computation reads fresh value.
        App::make(StreakService::class)->recordActivity($user, $now);

        $point = UserPoint::query()->firstOrCreate(['user_id' => $user->id]);
        if ($point->last_login_award_date && $point->last_login_award_date->toDateString() === $today) {
            return null;
        }

        $transaction = $this->award(
            $user,
            'daily_login',
            null,
            ['dedupe_key' => "daily_login:{$user->id}:{$today}"],
        );

        if ($transaction) {
            $point->last_login_award_date = $today;
            $point->save();
        }

        return $transaction;
    }

    private function isCappedForToday(User $user, string $reason, int $nextAmount): bool
    {
        $cap = config("points.daily_caps.{$reason}");
        if ($cap === null) {
            return false;
        }

        $todayTotal = (int) PointTransaction::query()
            ->where('user_id', $user->id)
            ->where('reason', $reason)
            ->whereDate('created_at', Carbon::today())
            ->sum('amount');

        return ($todayTotal + $nextAmount) > (int) $cap;
    }

    private function defaultDedupeKey(User $user, string $reason, ?Model $reference): ?string
    {
        if ($reference === null) {
            return null;
        }

        return sprintf(
            '%s:%d:%s:%s',
            $reason,
            $user->id,
            $reference->getMorphClass(),
            $reference->getKey(),
        );
    }

    private function bumpTotals(User $user, int $amount, bool $isLogin = false): void
    {
        $point = UserPoint::query()->firstOrCreate(['user_id' => $user->id]);
        $point->total_points = (int) $point->total_points + $amount;
        $point->lifetime_points = (int) $point->lifetime_points + max(0, $amount);
        $point->level = $this->levelFor((int) $point->lifetime_points);
        $point->save();
    }
}
