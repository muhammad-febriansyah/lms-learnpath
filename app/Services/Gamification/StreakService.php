<?php

namespace App\Services\Gamification;

use App\Models\LearningStreak;
use App\Models\User;
use Illuminate\Support\Carbon;

/**
 * Tracks consecutive-day learning activity per user.
 */
final class StreakService
{
    /**
     * Record that the user did a meaningful learning activity today.
     * Idempotent within the same day. Returns the updated streak row.
     */
    public function recordActivity(User $user, ?Carbon $now = null): LearningStreak
    {
        $today = ($now ?? Carbon::now())->toDateString();

        $streak = LearningStreak::firstOrNew(
            ['user_id' => $user->id],
            ['current_streak' => 0, 'longest_streak' => 0, 'last_active_date' => null],
        );

        $last = $streak->last_active_date;

        if ($last === null) {
            $streak->current_streak = 1;
        } else {
            $lastDate = Carbon::parse($last)->toDateString();

            if ($lastDate === $today) {
                // Already counted today — idempotent.
                if (! $streak->exists) {
                    $streak->save();
                }

                return $streak;
            }

            $yesterday = Carbon::parse($today)->subDay()->toDateString();
            if ($lastDate === $yesterday) {
                $streak->current_streak = (int) $streak->current_streak + 1;
            } else {
                // Gap >= 2 days → reset
                $streak->current_streak = 1;
            }
        }

        $streak->last_active_date = $today;
        if ($streak->current_streak > $streak->longest_streak) {
            $streak->longest_streak = $streak->current_streak;
        }

        $streak->save();

        return $streak;
    }
}
