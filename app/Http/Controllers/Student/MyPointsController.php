<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\PointTransaction;
use App\Models\UserPoint;
use App\Services\Gamification\PointService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MyPointsController extends Controller
{
    public function __construct(private readonly PointService $points) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $point = UserPoint::query()->firstOrNew(['user_id' => $user->id]);
        $streak = $user->learningStreak;

        $transactions = PointTransaction::query()
            ->where('user_id', $user->id)
            ->when($request->string('reason')->toString(), fn ($q, $reason) => $q->where('reason', $reason))
            ->latest('created_at')
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        $byReason = PointTransaction::query()
            ->where('user_id', $user->id)
            ->selectRaw('reason, SUM(amount) as total, COUNT(*) as cnt')
            ->groupBy('reason')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'reason' => $row->reason,
                'total' => (int) $row->total,
                'count' => (int) $row->cnt,
            ]);

        $levels = config('points.levels', []);
        $thresholds = array_keys($levels);
        sort($thresholds);

        $currentLevel = $point->level ?? 'bronze';
        $lifetime = (int) ($point->lifetime_points ?? 0);
        $nextThreshold = null;
        $nextLevel = null;
        foreach ($thresholds as $threshold) {
            if ($threshold > $lifetime) {
                $nextThreshold = (int) $threshold;
                $nextLevel = $levels[$threshold];
                break;
            }
        }

        return Inertia::render('student/my-points/index', [
            'summary' => [
                'total_points' => (int) ($point->total_points ?? 0),
                'lifetime_points' => $lifetime,
                'level' => $currentLevel,
                'next_level' => $nextLevel,
                'next_threshold' => $nextThreshold,
                'current_streak' => (int) ($streak?->current_streak ?? 0),
                'longest_streak' => (int) ($streak?->longest_streak ?? 0),
            ],
            'transactions' => $transactions->through(fn (PointTransaction $t) => [
                'id' => $t->id,
                'reason' => $t->reason,
                'amount' => (int) $t->amount,
                'meta' => $t->meta,
                'created_at' => $t->created_at?->toIso8601String(),
            ]),
            'by_reason' => $byReason,
            'filters' => $request->only('reason'),
            'config' => [
                'rewards' => config('points.rewards', []),
                'streak_bonus' => config('points.streak_bonus', []),
                'levels' => $levels,
            ],
        ]);
    }
}
