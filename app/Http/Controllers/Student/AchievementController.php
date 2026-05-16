<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use App\Models\LearningStreak;
use App\Models\UserBadge;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AchievementController extends Controller
{
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;

        $badges = Badge::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $earnedAtMap = UserBadge::query()
            ->where('user_id', $userId)
            ->get(['badge_id', 'earned_at'])
            ->keyBy('badge_id');

        $streak = LearningStreak::query()
            ->where('user_id', $userId)
            ->first();

        $grouped = $badges
            ->groupBy('category')
            ->map(fn ($items, $category) => [
                'category' => $category,
                'badges' => $items->map(function (Badge $b) use ($earnedAtMap) {
                    $earned = $earnedAtMap->get($b->id);

                    return [
                        'id' => $b->id,
                        'slug' => $b->slug,
                        'name' => $b->name,
                        'description' => $b->description,
                        'icon' => $b->icon,
                        'category' => $b->category,
                        'criteria' => $b->criteria,
                        'earned' => $earned !== null,
                        'earned_at' => $earned?->earned_at?->toIso8601String(),
                    ];
                })->values(),
            ])
            ->values();

        return Inertia::render('student/my-achievements/index', [
            'groups' => $grouped,
            'streak' => $streak ? [
                'current' => (int) $streak->current_streak,
                'longest' => (int) $streak->longest_streak,
                'last_active_date' => $streak->last_active_date?->toDateString(),
            ] : [
                'current' => 0,
                'longest' => 0,
                'last_active_date' => null,
            ],
            'stats' => [
                'earned' => $earnedAtMap->count(),
                'total' => $badges->count(),
            ],
        ]);
    }
}
