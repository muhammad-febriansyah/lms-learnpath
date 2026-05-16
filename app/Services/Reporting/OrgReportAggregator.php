<?php

namespace App\Services\Reporting;

use App\Models\Certificate;
use App\Models\Enrollment;
use App\Models\LessonProgress;
use App\Models\Organization;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Aggregates learning metrics for an organization across a date range.
 *
 * Each method runs a focused query so the controller can pull only the
 * panels it needs. Member IDs are resolved once and reused.
 */
class OrgReportAggregator
{
    /**
     * Top-line KPIs for the org over the given window.
     *
     * @return array{
     *   members: int,
     *   active_learners: int,
     *   total_enrollments: int,
     *   completed_enrollments: int,
     *   completion_rate: int,
     *   certificates_issued: int,
     *   total_hours: float
     * }
     */
    public function kpis(Organization $org, Carbon $from, Carbon $to): array
    {
        $memberIds = $this->memberIds($org);

        $totalEnrollments = Enrollment::query()
            ->whereIn('user_id', $memberIds)
            ->whereBetween('enrolled_at', [$from, $to])
            ->count();

        $completedEnrollments = Enrollment::query()
            ->whereIn('user_id', $memberIds)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$from, $to])
            ->count();

        $activeLearners = LessonProgress::query()
            ->whereIn('user_id', $memberIds)
            ->whereBetween('updated_at', [$from, $to])
            ->distinct('user_id')
            ->count('user_id');

        $certificates = Certificate::query()
            ->whereIn('user_id', $memberIds)
            ->whereBetween('issued_at', [$from, $to])
            ->count();

        $minutes = LessonProgress::query()
            ->whereIn('lesson_progress.user_id', $memberIds)
            ->whereBetween('lesson_progress.updated_at', [$from, $to])
            ->where('lesson_progress.status', 'completed')
            ->join('lessons', 'lessons.id', '=', 'lesson_progress.lesson_id')
            ->sum('lessons.duration_minutes');

        return [
            'members' => $memberIds->count(),
            'active_learners' => $activeLearners,
            'total_enrollments' => $totalEnrollments,
            'completed_enrollments' => $completedEnrollments,
            'completion_rate' => $totalEnrollments > 0
                ? (int) round(($completedEnrollments / $totalEnrollments) * 100)
                : 0,
            'certificates_issued' => $certificates,
            'total_hours' => round(((int) $minutes) / 60, 1),
        ];
    }

    /**
     * Weekly time-series of enrollments + completions.
     *
     * @return array<int, array{week: string, enrollments: int, completions: int}>
     */
    public function weeklyTrend(Organization $org, Carbon $from, Carbon $to): array
    {
        $memberIds = $this->memberIds($org);
        $weeks = [];

        $cursor = $from->copy()->startOfWeek();
        while ($cursor->lte($to)) {
            $weekEnd = $cursor->copy()->endOfWeek();
            $weeks[$cursor->format('Y-m-d')] = [
                'week' => $cursor->format('d M'),
                'enrollments' => 0,
                'completions' => 0,
                'start' => $cursor->copy(),
                'end' => $weekEnd->lt($to) ? $weekEnd : $to->copy(),
            ];
            $cursor->addWeek();
        }

        foreach ($weeks as $key => &$bucket) {
            $bucket['enrollments'] = Enrollment::query()
                ->whereIn('user_id', $memberIds)
                ->whereBetween('enrolled_at', [$bucket['start'], $bucket['end']])
                ->count();
            $bucket['completions'] = Enrollment::query()
                ->whereIn('user_id', $memberIds)
                ->where('status', 'completed')
                ->whereBetween('completed_at', [$bucket['start'], $bucket['end']])
                ->count();
        }

        return array_values(array_map(
            fn ($b) => ['week' => $b['week'], 'enrollments' => $b['enrollments'], 'completions' => $b['completions']],
            $weeks,
        ));
    }

    /**
     * Per-course breakdown: enrollment count + completion rate.
     *
     * @return array<int, array{
     *   course_id: int,
     *   title: string,
     *   slug: string,
     *   enrollments: int,
     *   completed: int,
     *   completion_rate: int
     * }>
     */
    public function topCourses(Organization $org, Carbon $from, Carbon $to, int $limit = 10): array
    {
        $memberIds = $this->memberIds($org);

        return Enrollment::query()
            ->select('courses.id as course_id', 'courses.title', 'courses.slug')
            ->selectRaw('COUNT(*) as enrollments')
            ->selectRaw('SUM(CASE WHEN enrollments.status = "completed" THEN 1 ELSE 0 END) as completed')
            ->join('courses', 'courses.id', '=', 'enrollments.course_id')
            ->whereIn('enrollments.user_id', $memberIds)
            ->whereBetween('enrollments.enrolled_at', [$from, $to])
            ->groupBy('courses.id', 'courses.title', 'courses.slug')
            ->orderByDesc('enrollments')
            ->limit($limit)
            ->get()
            ->map(fn ($row) => [
                'course_id' => (int) $row->course_id,
                'title' => (string) $row->title,
                'slug' => (string) $row->slug,
                'enrollments' => (int) $row->enrollments,
                'completed' => (int) $row->completed,
                'completion_rate' => $row->enrollments > 0
                    ? (int) round(((int) $row->completed / (int) $row->enrollments) * 100)
                    : 0,
            ])
            ->all();
    }

    /**
     * Per-position breakdown: how each role is performing.
     *
     * @return array<int, array{
     *   position: string,
     *   members: int,
     *   enrollments: int,
     *   completed: int,
     *   completion_rate: int
     * }>
     */
    public function positionBreakdown(Organization $org, Carbon $from, Carbon $to): array
    {
        $memberIds = $this->memberIds($org);

        $rows = Enrollment::query()
            ->select('positions.name as position_name')
            ->selectRaw('COUNT(DISTINCT enrollments.user_id) as members')
            ->selectRaw('COUNT(*) as enrollments')
            ->selectRaw('SUM(CASE WHEN enrollments.status = "completed" THEN 1 ELSE 0 END) as completed')
            ->leftJoin('employee_profiles', 'employee_profiles.user_id', '=', 'enrollments.user_id')
            ->leftJoin('positions', 'positions.id', '=', 'employee_profiles.position_id')
            ->whereIn('enrollments.user_id', $memberIds)
            ->whereBetween('enrollments.enrolled_at', [$from, $to])
            ->groupBy('positions.name')
            ->orderByDesc('enrollments')
            ->get();

        return $rows->map(fn ($row) => [
            'position' => $row->position_name ?? '(Tanpa jabatan)',
            'members' => (int) $row->members,
            'enrollments' => (int) $row->enrollments,
            'completed' => (int) $row->completed,
            'completion_rate' => $row->enrollments > 0
                ? (int) round(((int) $row->completed / (int) $row->enrollments) * 100)
                : 0,
        ])->all();
    }

    /**
     * Per-member detail used for CSV export.
     *
     * @return array<int, array{
     *   user_id: int,
     *   name: string,
     *   email: string,
     *   position: ?string,
     *   division: ?string,
     *   enrollments: int,
     *   completed: int,
     *   certificates: int,
     *   last_active_at: ?string
     * }>
     */
    public function memberDetail(Organization $org, Carbon $from, Carbon $to): array
    {
        $memberIds = $this->memberIds($org);

        $rows = \DB::table('users')
            ->select('users.id as user_id', 'users.name', 'users.email')
            ->addSelect('positions.name as position_name')
            ->addSelect('employee_profiles.division as division')
            ->selectSub(
                Enrollment::query()
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('enrollments.user_id', 'users.id')
                    ->whereBetween('enrollments.enrolled_at', [$from, $to]),
                'enrollments',
            )
            ->selectSub(
                Enrollment::query()
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('enrollments.user_id', 'users.id')
                    ->where('enrollments.status', 'completed')
                    ->whereBetween('enrollments.completed_at', [$from, $to]),
                'completed',
            )
            ->selectSub(
                Certificate::query()
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('certificates.user_id', 'users.id')
                    ->whereBetween('certificates.issued_at', [$from, $to]),
                'certificates',
            )
            ->selectSub(
                LessonProgress::query()
                    ->selectRaw('MAX(updated_at)')
                    ->whereColumn('lesson_progress.user_id', 'users.id'),
                'last_active_at',
            )
            ->leftJoin('employee_profiles', 'employee_profiles.user_id', '=', 'users.id')
            ->leftJoin('positions', 'positions.id', '=', 'employee_profiles.position_id')
            ->whereIn('users.id', $memberIds)
            ->orderBy('users.name')
            ->get();

        return $rows->map(fn ($row) => [
            'user_id' => (int) $row->user_id,
            'name' => (string) $row->name,
            'email' => (string) $row->email,
            'position' => $row->position_name ?: null,
            'division' => $row->division ?: null,
            'enrollments' => (int) $row->enrollments,
            'completed' => (int) $row->completed,
            'certificates' => (int) $row->certificates,
            'last_active_at' => $row->last_active_at,
        ])->all();
    }

    private function memberIds(Organization $org): Collection
    {
        return $org->members()->pluck('user_id');
    }
}
