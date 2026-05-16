<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Organization;
use App\Services\Gamification\LeaderboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly LeaderboardService $leaderboard,
    ) {}

    public function index(Request $request): Response
    {
        $org = $this->resolveOrganization($request);

        $memberIds = $org->members()->pluck('user_id');

        $totalEnrollments = Enrollment::query()
            ->whereIn('user_id', $memberIds)
            ->count();
        $completedEnrollments = Enrollment::query()
            ->whereIn('user_id', $memberIds)
            ->where('status', 'completed')
            ->count();

        $recentInvitations = $org->invitations()
            ->latest()
            ->limit(5)
            ->with('acceptedUser:id,name')
            ->get()
            ->map(fn ($i) => [
                'id' => $i->id,
                'email' => $i->email,
                'name' => $i->name,
                'role' => $i->role,
                'accepted_at' => $i->accepted_at?->toIso8601String(),
                'expires_at' => $i->expires_at?->toIso8601String(),
                'is_pending' => $i->isPending(),
                'is_expired' => $i->isExpired(),
                'accepted_user' => $i->acceptedUser?->only(['id', 'name']),
            ]);

        $recentMembers = $org->members()
            ->latest('joined_at')
            ->with('user:id,name,email,avatar_path,created_at')
            ->limit(6)
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'role' => $m->role,
                'joined_at' => $m->joined_at?->toIso8601String(),
                'user' => $m->user ? [
                    'id' => $m->user->id,
                    'name' => $m->user->name,
                    'email' => $m->user->email,
                    'avatar_url' => $m->user->avatar_url,
                ] : null,
            ]);

        return Inertia::render('business/dashboard', [
            'organization' => [
                'id' => $org->id,
                'name' => $org->name,
                'slug' => $org->slug,
                'industry' => $org->industry,
                'seat_quota' => $org->seat_quota,
                'seats_used' => $org->seats_used,
                'seats_available' => $org->seatsAvailable(),
                'status' => $org->status,
            ],
            'stats' => [
                'members' => $memberIds->count(),
                'pending_invites' => $org->invitations()
                    ->whereNull('accepted_at')
                    ->where('expires_at', '>', now())
                    ->count(),
                'total_enrollments' => $totalEnrollments,
                'completed_enrollments' => $completedEnrollments,
                'completion_rate' => $totalEnrollments > 0
                    ? round(($completedEnrollments / $totalEnrollments) * 100)
                    : 0,
            ],
            'recentMembers' => $recentMembers,
            'recentInvitations' => $recentInvitations,
            'topMembers' => $this->leaderboard->forOrganization($org, 5),
        ]);
    }

    public function resolveOrganization(Request $request): Organization
    {
        $org = $request->user()
            ?->organizations()
            ->wherePivot('role', 'admin')
            ->first();

        abort_unless($org, 403, 'Anda bukan admin organisasi.');

        return $org;
    }
}
