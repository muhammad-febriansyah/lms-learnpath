import { Head, Link } from '@inertiajs/react';
import { BookOpen, CheckCircle2, Clock, GraduationCap, Hourglass, TrendingUp, XCircle } from 'lucide-react';

import { IconChevR } from '@/components/learnpath-icons';
import { DateRangeFilter } from '@/components/reports/date-range-filter';
import { ExportCsvButton } from '@/components/reports/export-csv-button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Range = { from: string; to: string; from_iso: string; to_iso: string };

type Totals = {
    enrollments: number;
    in_progress: number;
    completed: number;
    average_progress: number;
};

type CourseRow = {
    course_id: number;
    title: string | null;
    thumbnail: string | null;
    enroll_count: number;
    completed_count: number;
    completion_rate: number;
    avg_progress: number;
};

type Props = {
    range: Range;
    totals: Totals;
    perCourse: CourseRow[];
    byStatus: {
        not_started: number;
        in_progress: number;
        completed: number;
        expired: number;
    };
};

function thumbUrl(path: string | null): string | undefined {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    return `/storage/${path}`;
}

export default function CourseProgressReport({ range, totals, perCourse, byStatus }: Props) {
    const statusTotal = byStatus.not_started + byStatus.in_progress + byStatus.completed + byStatus.expired || 1;

    return (
        <>
            <Head title="Course Progress Report" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="text-slate-500">Reports</span>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Course Progress</span>
                    </nav>
                    <div className="mt-1.5 flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                                Course Progress Report
                            </h1>
                            <p className="mt-1 text-[13.5px] text-slate-500">
                                Statistik enrollment dan tingkat penyelesaian course pada periode terpilih.
                            </p>
                        </div>
                        <ExportCsvButton
                            href="/admin/reports/course-progress/export.csv"
                            params={{ from: range.from, to: range.to }}
                        />
                    </div>
                </div>

                <DateRangeFilter from={range.from} to={range.to} basePath="/admin/reports/course-progress" />

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard label="Enrollment Baru" value={totals.enrollments.toLocaleString('id-ID')} icon={GraduationCap} tint="bg-brand-50" text="text-brand-600" />
                    <StatCard label="Sedang Belajar" value={totals.in_progress.toLocaleString('id-ID')} icon={Hourglass} tint="bg-amber-50" text="text-amber-600" />
                    <StatCard label="Selesai" value={totals.completed.toLocaleString('id-ID')} icon={CheckCircle2} tint="bg-emerald-50" text="text-emerald-600" />
                    <StatCard label="Rata Progress" value={`${totals.average_progress}%`} icon={TrendingUp} tint="bg-violet-50" text="text-violet-600" />
                </div>

                <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <h2 className="mb-4 text-[14px] font-bold text-slate-900">Distribusi Status</h2>
                        <StatusBar label="Belum Mulai" value={byStatus.not_started} total={statusTotal} color="bg-slate-400" icon={<Clock className="size-3 text-slate-500" />} />
                        <StatusBar label="Sedang Belajar" value={byStatus.in_progress} total={statusTotal} color="bg-amber-500" icon={<Hourglass className="size-3 text-amber-600" />} />
                        <StatusBar label="Selesai" value={byStatus.completed} total={statusTotal} color="bg-emerald-500" icon={<CheckCircle2 className="size-3 text-emerald-600" />} />
                        <StatusBar label="Expired" value={byStatus.expired} total={statusTotal} color="bg-rose-400" icon={<XCircle className="size-3 text-rose-500" />} />
                    </div>

                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <h2 className="mb-4 text-[14px] font-bold text-slate-900">Top 20 Course by Enrollment</h2>
                        {perCourse.length === 0 ? (
                            <div className="py-10 text-center">
                                <BookOpen className="mx-auto mb-3 size-6 text-slate-400" />
                                <p className="text-sm font-semibold text-slate-900">Belum ada data enrollment</p>
                                <p className="mt-1 text-[12.5px] text-slate-500">
                                    Pada rentang waktu ini belum ada peserta yang mendaftar.
                                </p>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {perCourse.map((row) => (
                                    <li key={row.course_id} className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                'h-10 w-14 shrink-0 overflow-hidden rounded-lg',
                                                !row.thumbnail && 'bg-gradient-to-br from-brand-400 to-violet-500',
                                            )}
                                            style={
                                                row.thumbnail
                                                    ? {
                                                          backgroundImage: `url(${thumbUrl(row.thumbnail)})`,
                                                          backgroundSize: 'cover',
                                                          backgroundPosition: 'center',
                                                      }
                                                    : undefined
                                            }
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="truncate text-[12.5px] font-semibold text-slate-900">
                                                    {row.title ?? '-'}
                                                </div>
                                                <Badge className="border-transparent bg-brand-50 text-[10.5px] font-bold text-brand-700">
                                                    {row.completion_rate}%
                                                </Badge>
                                            </div>
                                            <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                                                <span>{row.enroll_count} peserta</span>
                                                <span>·</span>
                                                <span>{row.completed_count} selesai</span>
                                                <span>·</span>
                                                <span>Avg {row.avg_progress}%</span>
                                            </div>
                                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full rounded-full bg-brand-500"
                                                    style={{ width: `${row.completion_rate}%` }}
                                                />
                                            </div>
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
    icon: typeof BookOpen;
    tint: string;
    text: string;
}) {
    return (
        <div className="rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="flex items-center gap-3">
                <div className={`grid size-10 place-items-center rounded-xl ${tint} ${text}`}>
                    <Icon className="size-5" />
                </div>
                <div>
                    <div className="text-[11px] tracking-wider text-slate-500 uppercase">{label}</div>
                    <div className="text-[18px] font-extrabold text-slate-900 tabular-nums">{value}</div>
                </div>
            </div>
        </div>
    );
}

function StatusBar({
    label,
    value,
    total,
    color,
    icon,
}: {
    label: string;
    value: number;
    total: number;
    color: string;
    icon?: React.ReactNode;
}) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;

    return (
        <div className="mb-3 last:mb-0">
            <div className="mb-1 flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-700">
                    {icon}
                    {label}
                </div>
                <div className="text-[11.5px] font-bold tabular-nums text-slate-900">
                    {value.toLocaleString('id-ID')}{' '}
                    <span className="text-[10.5px] font-normal text-slate-500">({pct}%)</span>
                </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}
