<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LearningStreak;
use App\Models\PointTransaction;
use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserPointController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeSuperAdmin($request);

        $sort = $request->string('sort')->toString() ?: 'points_desc';
        $level = $request->string('level')->toString();
        $search = $request->string('search')->toString();

        $rows = User::query()
            ->select([
                'users.id',
                'users.name',
                'users.email',
                'users.avatar_path',
                'users.created_at',
            ])
            ->leftJoin('user_points', 'user_points.user_id', '=', 'users.id')
            ->leftJoin('learning_streaks', 'learning_streaks.user_id', '=', 'users.id')
            ->selectRaw('COALESCE(user_points.total_points, 0) as total_points')
            ->selectRaw('COALESCE(user_points.lifetime_points, 0) as lifetime_points')
            ->selectRaw('user_points.level as level')
            ->selectRaw('COALESCE(learning_streaks.current_streak, 0) as current_streak')
            ->selectRaw('COALESCE(learning_streaks.longest_streak, 0) as longest_streak')
            ->when($search, function ($q, $term) {
                $q->where(function ($qq) use ($term) {
                    $qq->where('users.name', 'like', "%{$term}%")
                        ->orWhere('users.email', 'like', "%{$term}%");
                });
            })
            ->when($level, function ($q, $lvl) {
                $q->where('user_points.level', $lvl);
            })
            ->whereDoesntHave('roles', function ($q) {
                $q->where('name', 'superadmin');
            });

        $rows = match ($sort) {
            'points_asc' => $rows->orderByRaw('COALESCE(user_points.total_points, 0) asc'),
            'lifetime_desc' => $rows->orderByRaw('COALESCE(user_points.lifetime_points, 0) desc'),
            'streak_desc' => $rows->orderByRaw('COALESCE(learning_streaks.current_streak, 0) desc'),
            'newest' => $rows->latest('users.id'),
            default => $rows->orderByRaw('COALESCE(user_points.total_points, 0) desc'),
        };

        $users = $rows->paginate(20)->withQueryString()
            ->through(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'avatar' => $u->avatar_url,
                'total_points' => (int) ($u->total_points ?? 0),
                'lifetime_points' => (int) ($u->lifetime_points ?? 0),
                'level' => $u->level ?? 'bronze',
                'current_streak' => (int) ($u->current_streak ?? 0),
                'longest_streak' => (int) ($u->longest_streak ?? 0),
                'joined_at' => $u->created_at?->toIso8601String(),
            ]);

        $stats = [
            'total_users' => (int) UserPoint::query()->count(),
            'total_points' => (int) UserPoint::query()->sum('total_points'),
            'lifetime_points' => (int) UserPoint::query()->sum('lifetime_points'),
            'active_streaks' => (int) LearningStreak::query()
                ->where('current_streak', '>', 0)
                ->count(),
        ];

        $levels = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

        $levelCounts = UserPoint::query()
            ->selectRaw('level, COUNT(*) as cnt')
            ->groupBy('level')
            ->pluck('cnt', 'level')
            ->all();

        $levelDistribution = collect($levels)->map(fn ($lvl) => [
            'level' => $lvl,
            'count' => (int) ($levelCounts[$lvl] ?? 0),
        ])->values();

        $recentTransactions = PointTransaction::query()
            ->with('user:id,name,avatar_path')
            ->latest('created_at')
            ->limit(10)
            ->get()
            ->map(fn (PointTransaction $t) => [
                'id' => $t->id,
                'reason' => $t->reason,
                'amount' => (int) $t->amount,
                'created_at' => $t->created_at?->toIso8601String(),
                'user' => $t->user ? [
                    'id' => $t->user->id,
                    'name' => $t->user->name,
                    'avatar' => $t->user->avatar_url,
                ] : null,
            ]);

        return Inertia::render('admin/user-points/index', [
            'users' => $users,
            'filters' => [
                'search' => $search ?: null,
                'level' => $level ?: null,
                'sort' => $sort,
            ],
            'stats' => $stats,
            'levelDistribution' => $levelDistribution,
            'recentTransactions' => $recentTransactions,
            'levels' => $levels,
        ]);
    }

    public function show(Request $request, User $user): Response
    {
        $this->authorizeSuperAdmin($request);

        $point = UserPoint::query()->firstOrNew(['user_id' => $user->id]);
        $streak = $user->learningStreak;

        $transactions = PointTransaction::query()
            ->where('user_id', $user->id)
            ->latest('created_at')
            ->latest('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (PointTransaction $t) => [
                'id' => $t->id,
                'reason' => $t->reason,
                'amount' => (int) $t->amount,
                'meta' => $t->meta,
                'created_at' => $t->created_at?->toIso8601String(),
            ]);

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

        return Inertia::render('admin/user-points/show', [
            'student' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar_url,
                'joined_at' => $user->created_at?->toIso8601String(),
            ],
            'summary' => [
                'total_points' => (int) ($point->total_points ?? 0),
                'lifetime_points' => (int) ($point->lifetime_points ?? 0),
                'level' => $point->level ?? 'bronze',
                'current_streak' => (int) ($streak?->current_streak ?? 0),
                'longest_streak' => (int) ($streak?->longest_streak ?? 0),
                'last_active_date' => $streak?->last_active_date?->toIso8601String(),
            ],
            'transactions' => $transactions,
            'byReason' => $byReason,
        ]);
    }

    private function authorizeSuperAdmin(Request $request): void
    {
        abort_unless(
            $request->user()?->hasRole('superadmin'),
            403,
            'Hanya superadmin yang bisa mengakses Poin Pengguna.',
        );
    }
}
