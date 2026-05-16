<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Services\Gamification\LeaderboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeaderboardController extends Controller
{
    public function __construct(
        private readonly LeaderboardService $service,
    ) {}

    public function index(Request $request): Response
    {
        $org = $this->resolveOrganization($request);

        $entries = $this->service->forOrganization($org, 100);

        return Inertia::render('business/leaderboard', [
            'organization' => [
                'id' => $org->id,
                'name' => $org->name,
                'seat_quota' => $org->seat_quota,
                'seats_used' => $org->seats_used,
            ],
            'entries' => $entries,
            'scoring' => [
                'per_course' => LeaderboardService::POINTS_PER_COURSE,
                'per_badge' => LeaderboardService::POINTS_PER_BADGE,
                'per_streak_day' => LeaderboardService::POINTS_PER_STREAK_DAY,
                'per_path' => LeaderboardService::POINTS_PER_PATH,
            ],
        ]);
    }

    private function resolveOrganization(Request $request): Organization
    {
        $org = $request->user()
            ?->organizations()
            ->wherePivot('role', 'admin')
            ->first();

        abort_unless($org, 403, 'Anda bukan admin organisasi.');

        return $org;
    }
}
