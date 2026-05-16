<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Competency;
use App\Models\OjtAssessment;
use App\Models\Position;
use App\Models\PositionCompetencyTarget;
use App\Models\SkillGap;
use App\Models\SupervisorReview;
use App\Models\UserCompetency;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SkillMatrixController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('skill_matrix.view'), 403);

        $totalPositions = Position::count();
        $totalCompetencies = Competency::count();
        $totalGaps = SkillGap::where('status', 'gap')->count();

        // Top 5 critical competencies (most users with gap).
        $criticalCompetencies = SkillGap::query()
            ->where('status', 'gap')
            ->selectRaw('competency_id, COUNT(*) as gap_count, AVG(gap) as avg_gap')
            ->groupBy('competency_id')
            ->orderByDesc('gap_count')
            ->limit(5)
            ->with('competency:id,name,category')
            ->get();

        // Position readiness: count on_target vs gap per position.
        $positionReadiness = SkillGap::query()
            ->selectRaw('position_id, SUM(CASE WHEN status = "on_target" OR status = "exceed" THEN 1 ELSE 0 END) as met, COUNT(*) as total')
            ->groupBy('position_id')
            ->with('position:id,name,division')
            ->get()
            ->map(fn ($row) => [
                'position_id' => $row->position_id,
                'position_name' => $row->position?->name,
                'division' => $row->position?->division,
                'met' => (int) $row->met,
                'total' => (int) $row->total,
                'percent' => $row->total > 0 ? round(($row->met / $row->total) * 100) : 0,
            ]);

        return Inertia::render('admin/skill-matrix/index', [
            'overview' => [
                'positions' => $totalPositions,
                'competencies' => $totalCompetencies,
                'targets' => PositionCompetencyTarget::count(),
                'users_assessed' => UserCompetency::distinct('user_id')->count('user_id'),
                'gap_count' => $totalGaps,
                'pending_ojt' => OjtAssessment::where('status', 'pending_review')->count(),
                'pending_reviews' => SupervisorReview::where('approval_status', 'pending_review')->count(),
            ],
            'criticalCompetencies' => $criticalCompetencies,
            'positionReadiness' => $positionReadiness,
        ]);
    }
}
