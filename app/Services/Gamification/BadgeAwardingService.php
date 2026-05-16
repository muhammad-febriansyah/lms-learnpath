<?php

namespace App\Services\Gamification;

use App\Models\AssessmentAttempt;
use App\Models\Badge;
use App\Models\Enrollment;
use App\Models\LearningPathEnrollment;
use App\Models\LearningStreak;
use App\Models\User;
use App\Models\UserBadge;

/**
 * Evaluates badge criteria for a user and awards any newly-qualified badges.
 * Idempotent: already-earned badges are skipped.
 */
final class BadgeAwardingService
{
    /**
     * @return array<int, Badge> Newly earned badges
     */
    public function evaluateForUser(User $user): array
    {
        $alreadyEarned = UserBadge::query()
            ->where('user_id', $user->id)
            ->pluck('badge_id')
            ->all();

        $candidates = Badge::query()
            ->where('is_active', true)
            ->whereNotIn('id', $alreadyEarned)
            ->get();

        if ($candidates->isEmpty()) {
            return [];
        }

        $context = $this->buildContext($user);
        $newlyEarned = [];

        foreach ($candidates as $badge) {
            if ($this->qualifies($badge, $context)) {
                UserBadge::create([
                    'user_id' => $user->id,
                    'badge_id' => $badge->id,
                    'earned_at' => now(),
                ]);
                $newlyEarned[] = $badge;
            }
        }

        return $newlyEarned;
    }

    /**
     * @param  array{course_completions: int, current_streak: int, has_perfect_score: bool, path_completions: int}  $context
     */
    private function qualifies(Badge $badge, array $context): bool
    {
        $criteria = $badge->criteria;
        $type = $criteria['type'] ?? null;
        $threshold = (int) ($criteria['threshold'] ?? 1);

        return match ($type) {
            'course_count' => $context['course_completions'] >= $threshold,
            'streak_days' => $context['current_streak'] >= $threshold,
            'perfect_score' => $context['has_perfect_score'],
            'path_completed' => $context['path_completions'] >= $threshold,
            default => false,
        };
    }

    /**
     * @return array{course_completions: int, current_streak: int, has_perfect_score: bool, path_completions: int}
     */
    private function buildContext(User $user): array
    {
        return [
            'course_completions' => Enrollment::query()
                ->where('user_id', $user->id)
                ->where('status', 'completed')
                ->count(),
            'current_streak' => (int) (LearningStreak::query()
                ->where('user_id', $user->id)
                ->value('current_streak') ?? 0),
            'has_perfect_score' => AssessmentAttempt::query()
                ->where('user_id', $user->id)
                ->where('status', 'submitted')
                ->where('score', 100)
                ->exists(),
            'path_completions' => LearningPathEnrollment::query()
                ->where('user_id', $user->id)
                ->where('status', 'completed')
                ->count(),
        ];
    }
}
