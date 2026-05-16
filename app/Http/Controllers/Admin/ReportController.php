<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Assessment;
use App\Models\AssessmentAttempt;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Position;
use App\Models\SkillGap;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function courseProgress(Request $request): Response
    {
        abort_unless($request->user()?->can('report.view'), 403);

        $range = $this->resolveRange($request);

        $totals = [
            'enrollments' => Enrollment::query()
                ->whereBetween('enrolled_at', [$range['from'], $range['to']])
                ->count(),
            'in_progress' => Enrollment::query()
                ->whereBetween('enrolled_at', [$range['from'], $range['to']])
                ->where('status', 'in_progress')
                ->count(),
            'completed' => Enrollment::query()
                ->whereBetween('completed_at', [$range['from'], $range['to']])
                ->whereNotNull('completed_at')
                ->count(),
            'average_progress' => round((float) Enrollment::query()
                ->whereBetween('enrolled_at', [$range['from'], $range['to']])
                ->avg('progress_percent'), 1),
        ];

        $perCourse = Enrollment::query()
            ->select('course_id')
            ->selectRaw('COUNT(*) as enroll_count')
            ->selectRaw('SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed_count')
            ->selectRaw('AVG(progress_percent) as avg_progress')
            ->whereBetween('enrolled_at', [$range['from'], $range['to']])
            ->groupBy('course_id')
            ->orderByDesc('enroll_count')
            ->with('course:id,title,thumbnail')
            ->limit(20)
            ->get()
            ->map(fn ($row) => [
                'course_id' => $row->course_id,
                'title' => $row->course?->title,
                'thumbnail' => $row->course?->thumbnail,
                'enroll_count' => (int) $row->enroll_count,
                'completed_count' => (int) $row->completed_count,
                'completion_rate' => $row->enroll_count > 0
                    ? round(($row->completed_count / $row->enroll_count) * 100)
                    : 0,
                'avg_progress' => round((float) $row->avg_progress, 1),
            ]);

        $byStatus = Enrollment::query()
            ->whereBetween('enrolled_at', [$range['from'], $range['to']])
            ->groupBy('status')
            ->selectRaw('status, COUNT(*) as c')
            ->pluck('c', 'status');

        return Inertia::render('admin/reports/course-progress', [
            'range' => $range,
            'totals' => $totals,
            'perCourse' => $perCourse,
            'byStatus' => [
                'not_started' => (int) ($byStatus['not_started'] ?? 0),
                'in_progress' => (int) ($byStatus['in_progress'] ?? 0),
                'completed' => (int) ($byStatus['completed'] ?? 0),
                'expired' => (int) ($byStatus['expired'] ?? 0),
            ],
        ]);
    }

    public function assessment(Request $request): Response
    {
        abort_unless($request->user()?->can('report.view'), 403);

        $range = $this->resolveRange($request);

        $totals = [
            'total_attempts' => AssessmentAttempt::query()
                ->whereBetween('created_at', [$range['from'], $range['to']])
                ->count(),
            'passed' => AssessmentAttempt::query()
                ->whereBetween('created_at', [$range['from'], $range['to']])
                ->where('passed', true)
                ->count(),
            'failed' => AssessmentAttempt::query()
                ->whereBetween('created_at', [$range['from'], $range['to']])
                ->where('passed', false)
                ->whereNotNull('submitted_at')
                ->count(),
            'in_progress' => AssessmentAttempt::query()
                ->whereBetween('created_at', [$range['from'], $range['to']])
                ->whereNull('submitted_at')
                ->count(),
            'avg_score' => round((float) AssessmentAttempt::query()
                ->whereBetween('created_at', [$range['from'], $range['to']])
                ->whereNotNull('submitted_at')
                ->avg('score'), 1),
        ];

        $perAssessment = AssessmentAttempt::query()
            ->select('assessment_id')
            ->selectRaw('COUNT(*) as attempt_count')
            ->selectRaw('SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) as passed_count')
            ->selectRaw('AVG(score) as avg_score')
            ->whereBetween('created_at', [$range['from'], $range['to']])
            ->whereNotNull('submitted_at')
            ->groupBy('assessment_id')
            ->orderByDesc('attempt_count')
            ->with('assessment:id,title,type,course_id,passing_score', 'assessment.course:id,title')
            ->limit(20)
            ->get()
            ->map(fn ($row) => [
                'assessment_id' => $row->assessment_id,
                'title' => $row->assessment?->title,
                'type' => $row->assessment?->type,
                'course_title' => $row->assessment?->course?->title,
                'passing_score' => (int) ($row->assessment?->passing_score ?? 0),
                'attempt_count' => (int) $row->attempt_count,
                'passed_count' => (int) $row->passed_count,
                'pass_rate' => $row->attempt_count > 0
                    ? round(($row->passed_count / $row->attempt_count) * 100)
                    : 0,
                'avg_score' => round((float) $row->avg_score, 1),
            ]);

        $byType = AssessmentAttempt::query()
            ->join('assessments', 'assessments.id', '=', 'assessment_attempts.assessment_id')
            ->whereBetween('assessment_attempts.created_at', [$range['from'], $range['to']])
            ->whereNotNull('assessment_attempts.submitted_at')
            ->groupBy('assessments.type')
            ->selectRaw('assessments.type, COUNT(*) as c, AVG(assessment_attempts.score) as avg_score')
            ->get();

        return Inertia::render('admin/reports/assessment', [
            'range' => $range,
            'totals' => $totals,
            'perAssessment' => $perAssessment,
            'byType' => $byType,
        ]);
    }

    public function certificate(Request $request): Response
    {
        abort_unless($request->user()?->can('report.view'), 403);

        $range = $this->resolveRange($request);

        $totals = [
            'issued' => Certificate::query()
                ->whereBetween('issued_at', [$range['from'], $range['to']])
                ->count(),
            'active' => Certificate::where('status', 'active')->count(),
            'revoked' => Certificate::where('status', 'revoked')->count(),
            'expiring_soon' => Certificate::where('status', 'active')
                ->whereNotNull('expired_at')
                ->whereBetween('expired_at', [now(), now()->addDays(30)])
                ->count(),
        ];

        $perCourse = Certificate::query()
            ->select('course_id')
            ->selectRaw('COUNT(*) as cert_count')
            ->selectRaw('SUM(CASE WHEN status = "active" THEN 1 ELSE 0 END) as active_count')
            ->whereBetween('issued_at', [$range['from'], $range['to']])
            ->groupBy('course_id')
            ->orderByDesc('cert_count')
            ->with('course:id,title,thumbnail')
            ->limit(20)
            ->get()
            ->map(fn ($row) => [
                'course_id' => $row->course_id,
                'title' => $row->course?->title,
                'thumbnail' => $row->course?->thumbnail,
                'cert_count' => (int) $row->cert_count,
                'active_count' => (int) $row->active_count,
            ]);

        $byMonth = Certificate::query()
            ->whereBetween('issued_at', [$range['from'], $range['to']])
            ->selectRaw('DATE_FORMAT(issued_at, "%Y-%m") as month, COUNT(*) as c')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return Inertia::render('admin/reports/certificate', [
            'range' => $range,
            'totals' => $totals,
            'perCourse' => $perCourse,
            'byMonth' => $byMonth,
        ]);
    }

    public function skillGap(Request $request): Response
    {
        abort_unless($request->user()?->can('report.view'), 403);

        $totals = [
            'evaluated_users' => SkillGap::distinct('user_id')->count('user_id'),
            'positions' => SkillGap::distinct('position_id')->count('position_id'),
            'gap_entries' => SkillGap::where('status', 'gap')->count(),
            'on_target_entries' => SkillGap::whereIn('status', ['on_target', 'exceed'])->count(),
        ];

        $perPosition = SkillGap::query()
            ->select('position_id')
            ->selectRaw('COUNT(*) as total')
            ->selectRaw('SUM(CASE WHEN status = "gap" THEN 1 ELSE 0 END) as gap_count')
            ->selectRaw('SUM(CASE WHEN status IN ("on_target", "exceed") THEN 1 ELSE 0 END) as met_count')
            ->selectRaw('AVG(CASE WHEN gap > 0 THEN gap ELSE 0 END) as avg_gap')
            ->groupBy('position_id')
            ->orderByDesc('gap_count')
            ->with('position:id,name,division')
            ->get()
            ->map(fn ($row) => [
                'position_id' => $row->position_id,
                'name' => $row->position?->name,
                'division' => $row->position?->division,
                'total' => (int) $row->total,
                'gap_count' => (int) $row->gap_count,
                'met_count' => (int) $row->met_count,
                'avg_gap' => round((float) $row->avg_gap, 2),
                'met_percent' => $row->total > 0 ? round(($row->met_count / $row->total) * 100) : 0,
            ]);

        $byDivision = SkillGap::query()
            ->join('positions', 'positions.id', '=', 'skill_gaps.position_id')
            ->selectRaw('positions.division as division')
            ->selectRaw('COUNT(*) as total')
            ->selectRaw('SUM(CASE WHEN skill_gaps.status = "gap" THEN 1 ELSE 0 END) as gap_count')
            ->whereNotNull('positions.division')
            ->groupBy('positions.division')
            ->orderByDesc('gap_count')
            ->get();

        $topCompetencyGaps = SkillGap::query()
            ->where('status', 'gap')
            ->select('competency_id')
            ->selectRaw('COUNT(*) as gap_count')
            ->selectRaw('AVG(gap) as avg_gap')
            ->groupBy('competency_id')
            ->orderByDesc('gap_count')
            ->with('competency:id,name,category')
            ->limit(10)
            ->get();

        return Inertia::render('admin/reports/skill-gap', [
            'totals' => $totals,
            'perPosition' => $perPosition,
            'byDivision' => $byDivision,
            'topCompetencyGaps' => $topCompetencyGaps,
        ]);
    }

    public function sales(Request $request): Response
    {
        abort_unless($request->user()?->can('report.view'), 403);

        $range = $this->resolveRange($request);

        $paidOrders = Order::query()
            ->where('status', 'paid')
            ->whereBetween('paid_at', [$range['from'], $range['to']]);

        $totals = [
            'gross_revenue' => (int) (clone $paidOrders)->sum('total'),
            'orders' => (clone $paidOrders)->count(),
            'aov' => (int) ((clone $paidOrders)->avg('total') ?? 0),
            'completed_payments' => Payment::query()
                ->where('status', 'completed')
                ->whereBetween('completed_at', [$range['from'], $range['to']])
                ->count(),
            'total_fee' => (int) Payment::query()
                ->where('status', 'completed')
                ->whereBetween('completed_at', [$range['from'], $range['to']])
                ->sum('fee'),
        ];

        $byMonth = Order::query()
            ->where('status', 'paid')
            ->whereBetween('paid_at', [$range['from'], $range['to']])
            ->selectRaw('DATE_FORMAT(paid_at, "%Y-%m") as month')
            ->selectRaw('SUM(total) as revenue')
            ->selectRaw('COUNT(*) as orders')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $byGateway = Payment::query()
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$range['from'], $range['to']])
            ->selectRaw('gateway, COUNT(*) as c, SUM(amount) as revenue')
            ->groupBy('gateway')
            ->orderByDesc('revenue')
            ->get();

        $topCourses = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.status', 'paid')
            ->whereBetween('orders.paid_at', [$range['from'], $range['to']])
            ->where('order_items.purchasable_type', Course::class)
            ->selectRaw('order_items.purchasable_id as course_id')
            ->selectRaw('SUM(order_items.subtotal) as revenue')
            ->selectRaw('SUM(order_items.quantity) as qty')
            ->groupBy('order_items.purchasable_id')
            ->orderByDesc('revenue')
            ->limit(10)
            ->get();

        $courses = $topCourses->isNotEmpty()
            ? Course::query()->whereIn('id', $topCourses->pluck('course_id'))->get(['id', 'title', 'thumbnail'])->keyBy('id')
            : collect();

        $topCoursesWithMeta = $topCourses->map(fn ($row) => [
            'course_id' => $row->course_id,
            'title' => $courses[$row->course_id]?->title ?? '-',
            'thumbnail' => $courses[$row->course_id]?->thumbnail,
            'revenue' => (int) $row->revenue,
            'qty' => (int) $row->qty,
        ]);

        return Inertia::render('admin/reports/sales', [
            'range' => $range,
            'totals' => $totals,
            'byMonth' => $byMonth,
            'byGateway' => $byGateway,
            'topCourses' => $topCoursesWithMeta,
        ]);
    }

    /**
     * Resolve `from` and `to` query params (YYYY-MM-DD), defaulting to last 30 days.
     *
     * @return array{from: string, to: string, from_iso: string, to_iso: string}
     */
    private function resolveRange(Request $request): array
    {
        $to = $request->date('to', null, 'Asia/Jakarta') ?? Carbon::now('Asia/Jakarta');
        $from = $request->date('from', null, 'Asia/Jakarta') ?? Carbon::now('Asia/Jakarta')->subDays(30);

        return [
            'from' => $from->startOfDay()->toDateString(),
            'to' => $to->endOfDay()->toDateString(),
            'from_iso' => $from->toIso8601String(),
            'to_iso' => $to->toIso8601String(),
        ];
    }
}
