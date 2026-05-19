import { Head, Link } from '@inertiajs/react';
import { Check, ClipboardList, FileQuestion, Hourglass, Target, X } from 'lucide-react';

import { IconChevR } from '@/components/learnpath-icons';
import { DateRangeFilter } from '@/components/reports/date-range-filter';
import { ExportCsvButton } from '@/components/reports/export-csv-button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Range = { from: string; to: string; from_iso: string; to_iso: string };

type Totals = {
    total_attempts: number;
    passed: number;
    failed: number;
    in_progress: number;
    avg_score: number;
};

type AssessmentRow = {
    assessment_id: number;
    title: string | null;
    type: string | null;
    course_title: string | null;
    passing_score: number;
    attempt_count: number;
    passed_count: number;
    pass_rate: number;
    avg_score: number;
};

type TypeRow = { type: string; c: number; avg_score: number };

type Props = {
    range: Range;
    totals: Totals;
    perAssessment: AssessmentRow[];
    byType: TypeRow[];
};

const TYPE_LABELS: Record<string, string> = {
    pre_test: 'Pre Test',
    post_test: 'Post Test',
    quiz: 'Quiz',
    final: 'Final',
};

const TYPE_TONES: Record<string, string> = {
    pre_test: 'bg-amber-50 text-amber-700',
    post_test: 'bg-emerald-50 text-emerald-700',
    quiz: 'bg-brand-50 text-brand-700',
    final: 'bg-violet-50 text-violet-700',
};

export default function AssessmentReport({ range, totals, perAssessment, byType }: Props) {
    const passRate = totals.total_attempts > 0
        ? Math.round((totals.passed / totals.total_attempts) * 100)
        : 0;

    return (
        <>
            <Head title="Assessment Report" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="text-slate-500">Reports</span>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Assessment</span>
                    </nav>
                    <div className="mt-1.5 flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                                Assessment Report
                            </h1>
                            <p className="mt-1 text-[13.5px] text-slate-500">
                                Statistik kelulusan dan skor rata-rata per assessment.
                            </p>
                        </div>
                        <ExportCsvButton
                            href="/admin/reports/assessment/export.csv"
                            params={{ from: range.from, to: range.to }}
                        />
                    </div>
                </div>

                <DateRangeFilter from={range.from} to={range.to} basePath="/admin/reports/assessment" />

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                    <StatCard label="Total Attempt" value={totals.total_attempts.toLocaleString('id-ID')} icon={ClipboardList} tint="bg-brand-50" text="text-brand-600" />
                    <StatCard label="Lulus" value={totals.passed.toLocaleString('id-ID')} icon={Check} tint="bg-emerald-50" text="text-emerald-600" />
                    <StatCard label="Tidak Lulus" value={totals.failed.toLocaleString('id-ID')} icon={X} tint="bg-rose-50" text="text-rose-600" />
                    <StatCard label="Berlangsung" value={totals.in_progress.toLocaleString('id-ID')} icon={Hourglass} tint="bg-amber-50" text="text-amber-600" />
                    <StatCard label="Avg Score" value={totals.avg_score.toFixed(1)} icon={Target} tint="bg-violet-50" text="text-violet-600" />
                </div>

                <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
                    <div className="space-y-4">
                        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                            <h2 className="mb-3 text-[14px] font-bold text-slate-900">Overall Pass Rate</h2>
                            <div className="flex items-end gap-2">
                                <span className="text-[36px] font-extrabold text-emerald-600 tabular-nums leading-none">
                                    {passRate}%
                                </span>
                                <span className="pb-1 text-[11.5px] text-slate-500">
                                    {totals.passed} dari {totals.total_attempts} attempt
                                </span>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full rounded-full bg-emerald-500"
                                    style={{ width: `${passRate}%` }}
                                />
                            </div>
                        </div>

                        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                            <h2 className="mb-3 text-[14px] font-bold text-slate-900">Per Tipe Assessment</h2>
                            {byType.length === 0 ? (
                                <p className="py-4 text-center text-[12.5px] text-slate-500">
                                    Belum ada data.
                                </p>
                            ) : (
                                <ul className="space-y-3">
                                    {byType.map((row) => (
                                        <li key={row.type} className="flex items-center justify-between">
                                            <Badge className={cn('border-transparent text-[10.5px] font-bold', TYPE_TONES[row.type] ?? 'bg-slate-100 text-slate-700')}>
                                                {TYPE_LABELS[row.type] ?? row.type}
                                            </Badge>
                                            <div className="text-right">
                                                <div className="text-[13px] font-bold text-slate-900 tabular-nums">
                                                    {row.c.toLocaleString('id-ID')}
                                                </div>
                                                <div className="text-[10.5px] text-slate-500">
                                                    Avg {Number(row.avg_score).toFixed(1)}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <h2 className="mb-4 text-[14px] font-bold text-slate-900">Top 20 Assessment by Attempt</h2>
                        {perAssessment.length === 0 ? (
                            <div className="py-10 text-center">
                                <FileQuestion className="mx-auto mb-3 size-6 text-slate-400" />
                                <p className="text-sm font-semibold text-slate-900">Belum ada attempt</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {perAssessment.map((row) => (
                                    <li key={row.assessment_id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <Badge className={cn('border-transparent text-[10px] font-bold', TYPE_TONES[row.type ?? ''] ?? 'bg-slate-100 text-slate-700')}>
                                                    {TYPE_LABELS[row.type ?? ''] ?? row.type}
                                                </Badge>
                                                <div className="truncate text-[12.5px] font-semibold text-slate-900">
                                                    {row.title}
                                                </div>
                                            </div>
                                            {row.course_title && (
                                                <div className="mt-0.5 truncate text-[11px] text-slate-500">
                                                    {row.course_title}
                                                </div>
                                            )}
                                            <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-600">
                                                <span><b>{row.attempt_count}</b> attempt</span>
                                                <span><b>{row.passed_count}</b> lulus</span>
                                                <span>Avg <b>{row.avg_score.toFixed(1)}</b></span>
                                                <span>Passing <b>{row.passing_score}</b></span>
                                            </div>
                                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className={cn(
                                                        'h-full rounded-full',
                                                        row.pass_rate >= 70
                                                            ? 'bg-emerald-500'
                                                            : row.pass_rate >= 50
                                                                ? 'bg-amber-500'
                                                                : 'bg-rose-500',
                                                    )}
                                                    style={{ width: `${row.pass_rate}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <div className={cn(
                                                'text-[16px] font-extrabold tabular-nums leading-none',
                                                row.pass_rate >= 70 ? 'text-emerald-600' : row.pass_rate >= 50 ? 'text-amber-600' : 'text-rose-600',
                                            )}>
                                                {row.pass_rate}%
                                            </div>
                                            <div className="mt-0.5 text-[10px] text-slate-500">Pass Rate</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function StatCard({
    label,
    value,
    icon: Icon,
    tint,
    text,
}: {
    label: string;
    value: string;
    icon: typeof ClipboardList;
    tint: string;
    text: string;
}) {
    return (
        <div className="rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="flex items-center gap-3">
                <div className={`grid size-10 place-items-center rounded-xl ${tint} ${text}`}>
                    <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                    <div className="text-[11px] tracking-wider text-slate-500 uppercase">{label}</div>
                    <div className="text-[18px] font-extrabold text-slate-900 tabular-nums">{value}</div>
                </div>
            </div>
        </div>
    );
}
