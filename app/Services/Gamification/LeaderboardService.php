<?php

namespace App\Services\Gamification;

use App\Models\Enrollment;
use App\Models\LearningPathEnrollment;
use App\Models\LearningStreak;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\User;
use App\Models\UserBadge;
use Illuminate\Support\Collection;

/**
 * Computes per-member leaderboard for an organization.
 *
 * Score formula (designed to reward diverse engagement):
 *   - 10 pts per completed course
 *   - 25 pts per earned badge
 *   - 2 pts per day of longest_streak
 *   - 50 pts per completed learning path
 */
final class LeaderboardService
{
    public const POINTS_PER_COURSE = 10;

    public const POINTS_PER_BADGE = 25;

    public const POINTS_PER_STREAK_DAY = 2;

    public const POINTS_PER_PATH = 50;

    /**
     * @return Collection<int, array{
     *   rank: int,
     *   user: array{id: int, name: string, email: string, avatar_url: string|null},
     *   employee: array{division: string|null, branch: string|null, position: string|null}|null,
     *   courses_completed: int,
     *   badges_count: int,
     *   current_streak: int,
     *   longest_streak: int,
     *   paths_completed: int,
     *   score: int
     * }>
     */
    public function forOrganization(Organization $organization, int $limit = 100): Collection
    {
        $members = OrganizationMember::query()
            ->where('organization_id', $organization->id)
            ->with([
                'user:id,name,email,avatar_path',
                'user.employeeProfile:id,user_id,position_id,division,branch',
                'user.employeeProfile.position:id,name',
            ])
            ->get();

        if ($members->isEmpty()) {
            return collect();
        }

        $userIds = $members->pluck('user_id')->all();

        $courseCompletions = Enrollment::query()
            ->whereIn('user_id', $userIds)
            ->where('status', 'completed')
            ->selectRaw('user_id, COUNT(*) as total')
            ->groupBy('user_id')
            ->pluck('total', 'user_id');

        $badgeCounts = UserBadge::query()
            ->whereIn('user_id', $userIds)
            ->selectRaw('user_id, COUNT(*) as total')
            ->groupBy('user_id')
            ->pluck('total', 'user_id');

        $streaks = LearningStreak::query()
            ->whereIn('user_id', $userIds)
            ->get(['user_id', 'current_streak', 'longest_streak'])
            ->keyBy('user_id');

        $pathCompletions = LearningPathEnrollment::query()
            ->whereIn('user_id', $userIds)
            ->where('status', 'completed')
            ->selectRaw('user_id, COUNT(*) as total')
            ->groupBy('user_id')
            ->pluck('total', 'user_id');

        $rows = $members
            ->map(function (OrganizationMember $member) use ($courseCompletions, $badgeCounts, $streaks, $pathCompletions) {
                $user = $member->user;
                if (! $user) {
                    return null;
                }

                $courses = (int) ($courseCompletions[$user->id] ?? 0);
                $badges = (int) ($badgeCounts[$user->id] ?? 0);
                $streak = $streaks->get($user->id);
                $currentStreak = (int) ($streak->current_streak ?? 0);
                $longestStreak = (int) ($streak->longest_streak ?? 0);
                $paths = (int) ($pathCompletions[$user->id] ?? 0);

                $score = $courses * self::POINTS_PER_COURSE
                    + $badges * self::POINTS_PER_BADGE
                    + $longestStreak * self::POINTS_PER_STREAK_DAY
                    + $paths * self::POINTS_PER_PATH;

                return [
                    'user_id' => $user->id,
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'avatar_url' => $user->avatar_url,
                    ],
                    'employee' => $user->employeeProfile ? [
                        'division' => $user->employeeProfile->division,
                        'branch' => $user->employeeProfile->branch,
                        'position' => $user->employeeProfile->position?->name,
                    ] : null,
                    'courses_completed' => $courses,
                    'badges_count' => $badges,
                    'current_streak' => $currentStreak,
                    'longest_streak' => $longestStreak,
                    'paths_completed' => $paths,
                    'score' => $score,
                ];
            })
            ->filter()
            ->sortByDesc(fn ($row) => [$row['score'], -$row['user_id']])
            ->values();

        return $rows
            ->take($limit)
            ->map(fn (array $row, int $idx) => ['rank' => $idx + 1] + $row)
            ->values();
    }

    /**
     * Resolve the rank of a single user within an organization.
     */
    public function rankForMember(Organization $organization, User $user): ?array
    {
        return $this->forOrganization($organization, 1000)
            ->firstWhere('user_id', $user->id);
    }
}
