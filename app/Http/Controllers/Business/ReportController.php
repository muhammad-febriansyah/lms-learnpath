<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Services\Reporting\OrgReportAggregator;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function __construct(
        private readonly DashboardController $resolver,
        private readonly OrgReportAggregator $aggregator,
    ) {}

    public function index(Request $request): Response
    {
        $org = $this->resolver->resolveOrganization($request);
        [$from, $to] = $this->resolveRange($request);

        return Inertia::render('business/reports/index', [
            'organization' => [
                'id' => $org->id,
                'name' => $org->name,
            ],
            'filters' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
                'preset' => $request->string('preset')->toString() ?: '30d',
            ],
            'kpis' => $this->aggregator->kpis($org, $from, $to),
            'weeklyTrend' => $this->aggregator->weeklyTrend($org, $from, $to),
            'topCourses' => $this->aggregator->topCourses($org, $from, $to, 10),
            'positionBreakdown' => $this->aggregator->positionBreakdown($org, $from, $to),
            'divisionBreakdown' => $this->aggregator->divisionBreakdown($org, $from, $to),
            'onTimeStatus' => $this->aggregator->onTimeStatus($org),
            'topSkillGaps' => $this->aggregator->topSkillGaps($org, 5),
            'aiTutorUsage' => $this->aggregator->aiTutorUsage($org, $from, $to),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $org = $this->resolver->resolveOrganization($request);
        [$from, $to] = $this->resolveRange($request);

        $rows = $this->aggregator->memberDetail($org, $from, $to);

        $filename = sprintf(
            'report-%s-%s-to-%s.csv',
            Str::slug($org->name),
            $from->toDateString(),
            $to->toDateString(),
        );

        return response()->streamDownload(function () use ($rows) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'User ID',
                'Nama',
                'Email',
                'Jabatan',
                'Divisi',
                'Enrollment (periode)',
                'Selesai (periode)',
                'Sertifikat (periode)',
                'Aktif terakhir',
            ]);
            foreach ($rows as $row) {
                fputcsv($handle, [
                    $row['user_id'],
                    $row['name'],
                    $row['email'],
                    $row['position'] ?? '',
                    $row['division'] ?? '',
                    $row['enrollments'],
                    $row['completed'],
                    $row['certificates'],
                    $row['last_active_at'] ?? '',
                ]);
            }
            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * @return array{0: Carbon, 1: Carbon}
     */
    private function resolveRange(Request $request): array
    {
        $preset = $request->string('preset')->toString() ?: '30d';

        $to = Carbon::now()->endOfDay();
        $from = match ($preset) {
            '7d' => Carbon::now()->subDays(6)->startOfDay(),
            '90d' => Carbon::now()->subDays(89)->startOfDay(),
            '12m' => Carbon::now()->subMonths(12)->startOfDay(),
            'custom' => Carbon::parse($request->string('from')->toString() ?: '-30 days')->startOfDay(),
            default => Carbon::now()->subDays(29)->startOfDay(),
        };

        if ($preset === 'custom' && $request->filled('to')) {
            $to = Carbon::parse($request->string('to')->toString())->endOfDay();
        }

        if ($from->gt($to)) {
            [$from, $to] = [$to->copy()->startOfDay(), $from->copy()->endOfDay()];
        }

        return [$from, $to];
    }
}
