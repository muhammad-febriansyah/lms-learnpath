import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowUpRight,
    Award,
    BookOpen,
    CalendarRange,
    Clock,
    Flame,
    Printer,
    Sparkles,
    TrendingUp,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Stats = {
    total_minutes: number;
    total_hours: number;
    lessons_completed: number;
    courses_enrolled: number;
    courses_completed: number;
    current_streak: number;
    longest_streak: number;
    last_active_date: string | null;
};

type CourseRow = {
    course_id: number;
    title: string | null;
    slug: string | null;
    thumbnail: string | null;
    minutes: number;
    lessons_completed: number;
    lessons_in_progress: number;
    lessons_total: number;
    percent: number;
};

type TimelineDay = {
    date: string;
    label: string;
    lessons: number;
    minutes: number;
};

type WeekRow = {
    week_start: string;
    label: string;
    range: string;
    lessons: number;
    minutes: number;
    active_days: number;
};

type DowRow = {
    label: string;
    count: number;
};

type Props = {
    stats: Stats;
    perCourse: CourseRow[];
    timeline: TimelineDay[];
    weekly: WeekRow[];
    dayOfWeek: DowRow[];
    filters: { weeks: number; days: number };
};

const WEEKS_OPTIONS = [4, 12, 26];
const DAYS_OPTIONS = [7, 30, 90];

function setFilter(key: 'weeks' | 'days', value: number) {
    const params = new URLSearchParams(window.location.search);
    params.set(key, String(value));
    router.get(`/my-insights?${params.toString()}`, {}, {
        preserveScroll: true,
        preserveState: false,
    });
}

function formatMinutes(m: number): string {
    if (m === 0) return '0m';
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    const rest = m % 60;
    return rest === 0 ? `${h}j` : `${h}j ${rest}m`;
}

function formatDateShort(iso: string | null): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default function MyInsightsIndex({
    stats,
    perCourse,
    timeline,
    weekly,
    dayOfWeek,
    filters,
}: Props) {
    const completionRate =
        stats.courses_enrolled > 0
            ? Math.round((stats.courses_completed / stats.courses_enrolled) * 100)
            : 0;

    const printNow = () => window.print();

    return (
        <>
            <Head title="Insight Belajar" />
            <PrintStyles />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between print:hidden">
                    <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-brand-700">
                            <TrendingUp className="size-3" />
                            Analytics
                        </div>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                            Insight Belajar
                        </h1>
                        <p className="mt-1 text-[13.5px] text-slate-500">
                            Total waktu, course paling aktif, dan konsistensi mingguan
                            Anda.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {stats.last_active_date && (
                            <span className="text-[12.5px] text-slate-500">
                                Aktif terakhir:{' '}
                                <strong className="text-slate-900">
                                    {formatDateShort(stats.last_active_date)}
                                </strong>
                            </span>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={printNow}
                            className="rounded-xl"
                        >
                            <Printer className="mr-1.5 size-4" />
                            Cetak / PDF
                        </Button>
                    </div>
                </div>

                {/* Print-only header */}
                <div className="hidden print:block">
                    <h1 className="text-2xl font-extrabold">Insight Belajar — LearnPath</h1>
                    <p className="mt-1 text-[12px] text-slate-600">
                        Generated:{' '}
                        {new Date().toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </p>
                </div>

                {/* Hero stat card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-violet-600 to-indigo-700 p-6 sm:p-8 text-white shadow-[0_20px_50px_-20px_rgba(99,102,241,0.5)]">
                    <div className="absolute -right-12 -top-12 size-48 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-16 -left-12 size-56 rounded-full bg-fuchsia-400/20 blur-3xl" />
                    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider backdrop-blur">
                                <Clock className="size-3" />
                                Total Waktu Belajar
                            </div>
                            <div className="mt-3 flex items-baseline gap-2 font-extrabold tracking-tight">
                                <span className="text-5xl sm:text-6xl tabular-nums">
                                    {Math.floor(stats.total_minutes / 60)}
                                </span>
                                <span className="text-2xl opacity-80">jam</span>
                                <span className="ml-1 text-3xl tabular-nums">
                                    {stats.total_minutes % 60}
                                </span>
                                <span className="text-2xl opacity-80">menit</span>
                            </div>
                            <div className="mt-2 text-[13px] opacity-90">
                                Dari{' '}
                                <strong>
                                    {stats.lessons_completed.toLocaleString('id-ID')}
                                </strong>{' '}
                                lesson di {stats.courses_enrolled} course
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <MiniStat
                                icon={<Flame className="size-4" />}
                                value={`${stats.current_streak}`}
                                label="hari streak"
                                sub={`terlama ${stats.longest_streak}`}
                            />
                            <MiniStat
                                icon={<Award className="size-4" />}
                                value={`${stats.courses_completed}`}
                                label="course tuntas"
                                sub={`${completionRate}% selesai`}
                            />
                        </div>
                    </div>
                </div>

                {/* Two-column: timeline + day of week */}
                <div className="grid gap-5 lg:grid-cols-3">
                    <PanelCard
                        className="lg:col-span-2"
                        title={`Aktivitas ${filters.days} Hari`}
                        subtitle="Menit belajar per hari"
                        icon={<Sparkles className="size-4" />}
                        action={
                            <FilterTabs
                                options={DAYS_OPTIONS}
                                value={filters.days}
                                onChange={(v) => setFilter('days', v)}
                                suffix="h"
                            />
                        }
                    >
                        <TimelineChart data={timeline} />
                    </PanelCard>

                    <PanelCard
                        title="Hari Paling Produktif"
                        subtitle="Sebaran lesson per hari"
                        icon={<CalendarRange className="size-4" />}
                    >
                        <DayOfWeekChart data={dayOfWeek} />
                    </PanelCard>
                </div>

                {/* Weekly bar chart */}
                <PanelCard
                    title={`Konsistensi ${filters.weeks} Minggu Terakhir`}
                    subtitle="Total menit & hari aktif per minggu"
                    icon={<TrendingUp className="size-4" />}
                    action={
                        <FilterTabs
                            options={WEEKS_OPTIONS}
                            value={filters.weeks}
                            onChange={(v) => setFilter('weeks', v)}
                            suffix="m"
                        />
                    }
                >
                    <WeeklyChart data={weekly} />
                </PanelCard>

                {/* Per course */}
                <PanelCard
                    title="Waktu Belajar per Course"
                    subtitle="Top 8 course paling banyak waktu"
                    icon={<BookOpen className="size-4" />}
                >
                    {perCourse.length === 0 ? (
                        <EmptyState
                            title="Belum ada lesson yang diselesaikan"
                            description="Mulai belajar untuk melihat statistik di sini."
                        />
                    ) : (
                        <div className="grid gap-3 md:grid-cols-2">
                            {perCourse.map((c) => (
                                <CourseInsightCard
                                    key={c.course_id}
                                    row={c}
                                />
                            ))}
                        </div>
                    )}
                </PanelCard>
            </div>
        </>
    );
}

/* ============== sub-components ============== */

function MiniStat({
    icon,
    value,
    label,
    sub,
}: {
    icon: React.ReactNode;
    value: string;
    label: string;
    sub: string;
}) {
    return (
        <div className="rounded-2xl bg-white/15 p-3 backdrop-blur ring-1 ring-white/20">
            <div className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider opacity-80">
                {icon}
                {label}
            </div>
            <div className="mt-1 text-2xl font-extrabold tabular-nums">
                {value}
            </div>
            <div className="text-[10.5px] opacity-80">{sub}</div>
        </div>
    );
}

function PanelCard({
    title,
    subtitle,
    icon,
    children,
    className,
    action,
}: {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    action?: React.ReactNode;
}) {
    return (
        <div
            className={cn(
                'rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:p-6',
                className,
            )}
        >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand-600">
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-[14px] font-bold text-slate-900">
                            {title}
                        </h3>
                        {subtitle && (
                            <p className="text-[11.5px] text-slate-500">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
                {action && <div className="print:hidden">{action}</div>}
            </div>
            {children}
        </div>
    );
}

function FilterTabs({
    options,
    value,
    onChange,
    suffix,
}: {
    options: number[];
    value: number;
    onChange: (v: number) => void;
    suffix: string;
}) {
    return (
        <div className="inline-flex items-center gap-0.5 rounded-lg bg-slate-100 p-0.5 text-[11.5px]">
            {options.map((opt) => (
                <button
                    key={opt}
                    type="button"
                    onClick={() => onChange(opt)}
                    className={cn(
                        'rounded-md px-2.5 py-1 font-semibold transition',
                        value === opt
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700',
                    )}
                >
                    {opt}
                    {suffix}
                </button>
            ))}
        </div>
    );
}

function PrintStyles() {
    return (
        <style>{`
            @media print {
                @page { margin: 14mm; size: A4; }
                body { background: white !important; }
                aside, nav, header, [data-sidebar],
                .print\\:hidden { display: none !important; }
                main { padding: 0 !important; }
                .group:hover .opacity-0 { opacity: 0 !important; }
                a { color: inherit !important; text-decoration: none !important; }
                .shadow-\\[0_1px_2px_rgba\\(15\\,23\\,42\\,0\\.04\\)\\],
                .shadow-\\[0_20px_50px_-20px_rgba\\(99\\,102\\,241\\,0\\.5\\)\\] {
                    box-shadow: none !important;
                }
                .ring-1 { box-shadow: 0 0 0 1px rgb(226, 232, 240) !important; }
                /* Force colors */
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            }
        `}</style>
    );
}

function TimelineChart({ data }: { data: TimelineDay[] }) {
    const maxMinutes = Math.max(1, ...data.map((d) => d.minutes));
    const W = 600;
    const H = 180;
    const padL = 32;
    const padR = 8;
    const padT = 8;
    const padB = 22;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;
    const step = innerW / Math.max(1, data.length - 1);

    const points = data.map((d, i) => ({
        x: padL + i * step,
        y: padT + innerH - (d.minutes / maxMinutes) * innerH,
        d,
    }));

    const path = points
        .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
        .join(' ');
    const area = `${path} L${points[points.length - 1]?.x ?? padL},${padT + innerH} L${padL},${padT + innerH} Z`;

    const gridSteps = 4;
    const gridLines = Array.from({ length: gridSteps + 1 }, (_, i) => ({
        y: padT + (innerH / gridSteps) * i,
        val: Math.round((maxMinutes / gridSteps) * (gridSteps - i)),
    }));

    return (
        <div className="w-full overflow-x-auto">
            <svg
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                className="h-[200px] w-full min-w-[480px]"
            >
                <defs>
                    <linearGradient id="timelineFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(99,102,241)" stopOpacity="0.30" />
                        <stop offset="100%" stopColor="rgb(99,102,241)" stopOpacity="0.02" />
                    </linearGradient>
                </defs>
                {gridLines.map((g, i) => (
                    <g key={i}>
                        <line
                            x1={padL}
                            x2={W - padR}
                            y1={g.y}
                            y2={g.y}
                            stroke="rgb(226,232,240)"
                            strokeDasharray="3 4"
                        />
                        <text
                            x={padL - 6}
                            y={g.y + 3}
                            textAnchor="end"
                            fontSize="9"
                            fill="rgb(148,163,184)"
                        >
                            {g.val}m
                        </text>
                    </g>
                ))}
                <path d={area} fill="url(#timelineFill)" />
                <path
                    d={path}
                    fill="none"
                    stroke="rgb(99,102,241)"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
                {points.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r={p.d.minutes > 0 ? 3 : 0}
                        fill="white"
                        stroke="rgb(99,102,241)"
                        strokeWidth="1.5"
                    >
                        <title>{`${p.d.label}: ${p.d.lessons} lesson · ${p.d.minutes}m`}</title>
                    </circle>
                ))}
                {data.map((d, i) =>
                    i % 5 === 0 || i === data.length - 1 ? (
                        <text
                            key={i}
                            x={padL + i * step}
                            y={H - 6}
                            textAnchor="middle"
                            fontSize="9.5"
                            fill="rgb(100,116,139)"
                        >
                            {d.label}
                        </text>
                    ) : null,
                )}
            </svg>
        </div>
    );
}

function DayOfWeekChart({ data }: { data: DowRow[] }) {
    const max = Math.max(1, ...data.map((d) => d.count));
    return (
        <div className="space-y-2.5">
            {data.map((d) => (
                <div
                    key={d.label}
                    className="flex items-center gap-3 text-[12.5px]"
                >
                    <div className="w-9 font-semibold text-slate-600">
                        {d.label}
                    </div>
                    <div className="relative h-6 flex-1 overflow-hidden rounded-lg bg-slate-100">
                        <div
                            className="h-full rounded-lg bg-gradient-to-r from-brand-500 to-violet-500 transition-all"
                            style={{
                                width: `${Math.max(2, (d.count / max) * 100)}%`,
                            }}
                        />
                    </div>
                    <div className="w-7 text-right font-bold tabular-nums text-slate-900">
                        {d.count}
                    </div>
                </div>
            ))}
        </div>
    );
}

function WeeklyChart({ data }: { data: WeekRow[] }) {
    if (data.every((w) => w.minutes === 0)) {
        return (
            <EmptyState
                title="Belum ada aktivitas mingguan"
                description="Selesaikan lesson untuk mengisi grafik mingguan."
            />
        );
    }

    const maxMinutes = Math.max(1, ...data.map((w) => w.minutes));
    const totalMinutes = data.reduce((s, w) => s + w.minutes, 0);
    const avgMinutes = Math.round(totalMinutes / data.length);
    const activeWeeks = data.filter((w) => w.minutes > 0).length;

    return (
        <div className="space-y-4">
            {/* Summary chips */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <SummaryChip
                    label="Rata-rata"
                    value={formatMinutes(avgMinutes)}
                    sub="per minggu"
                />
                <SummaryChip
                    label="Total"
                    value={formatMinutes(totalMinutes)}
                    sub="12 minggu"
                />
                <SummaryChip
                    label="Minggu Aktif"
                    value={`${activeWeeks}/${data.length}`}
                    sub={`${Math.round((activeWeeks / data.length) * 100)}% konsisten`}
                />
            </div>

            {/* Bar chart */}
            <div className="flex items-end gap-1.5 sm:gap-2.5">
                {data.map((w, i) => {
                    const heightPct = (w.minutes / maxMinutes) * 100;
                    const isCurrent = i === data.length - 1;
                    return (
                        <div
                            key={w.week_start}
                            className="group relative flex flex-1 flex-col items-center gap-1.5"
                        >
                            <div
                                className="flex w-full items-end justify-center"
                                style={{ height: '140px' }}
                            >
                                <div
                                    className={cn(
                                        'w-full rounded-t-lg transition-all hover:opacity-80',
                                        w.minutes === 0
                                            ? 'bg-slate-100'
                                            : isCurrent
                                              ? 'bg-gradient-to-t from-brand-600 to-violet-500 shadow-[0_-4px_20px_-4px_rgba(99,102,241,0.5)]'
                                              : 'bg-gradient-to-t from-brand-400 to-brand-300',
                                    )}
                                    style={{
                                        height: w.minutes === 0
                                            ? '4px'
                                            : `${Math.max(6, heightPct)}%`,
                                    }}
                                    title={`${w.range}: ${w.lessons} lesson · ${w.minutes}m · ${w.active_days} hari aktif`}
                                />
                            </div>
                            <div
                                className={cn(
                                    'text-[9.5px] tabular-nums',
                                    isCurrent
                                        ? 'font-bold text-brand-700'
                                        : 'text-slate-500',
                                )}
                            >
                                {w.label}
                            </div>
                            {/* Tooltip on hover */}
                            <div className="pointer-events-none absolute -top-12 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                                <div className="font-semibold">{w.range}</div>
                                <div className="opacity-80">
                                    {formatMinutes(w.minutes)} · {w.lessons} lesson
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="size-2.5 rounded-sm bg-gradient-to-t from-brand-400 to-brand-300" />
                        Minggu lalu
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="size-2.5 rounded-sm bg-gradient-to-t from-brand-600 to-violet-500" />
                        Minggu ini
                    </div>
                </div>
                <div>Hover bar untuk detail</div>
            </div>
        </div>
    );
}

function SummaryChip({
    label,
    value,
    sub,
}: {
    label: string;
    value: string;
    sub: string;
}) {
    return (
        <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                {label}
            </div>
            <div className="mt-0.5 text-[16px] font-extrabold tabular-nums text-slate-900">
                {value}
            </div>
            <div className="text-[10.5px] text-slate-500">{sub}</div>
        </div>
    );
}

function CourseInsightCard({ row }: { row: CourseRow }) {
    const isDone = row.percent >= 100;
    return (
        <Link
            href={`/learn/${row.slug}`}
            className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-md"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 text-[13px] font-bold text-slate-900 group-hover:text-brand-700">
                        {row.title ?? 'Course'}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[11.5px] text-slate-500">
                        <Clock className="size-3" />
                        <span className="font-semibold text-slate-700 tabular-nums">
                            {formatMinutes(row.minutes)}
                        </span>
                        <span>·</span>
                        <span className="tabular-nums">
                            {row.lessons_completed}/{row.lessons_total} lesson
                        </span>
                    </div>
                </div>
                <Badge
                    className={cn(
                        'shrink-0',
                        isDone
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : row.percent >= 50
                              ? 'border-sky-200 bg-sky-50 text-sky-700'
                              : 'border-slate-200 bg-slate-50 text-slate-600',
                    )}
                >
                    {row.percent}%
                </Badge>
            </div>

            <div className="relative h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                    className={cn(
                        'h-full rounded-full transition-all',
                        isDone
                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                            : 'bg-gradient-to-r from-brand-500 via-violet-500 to-fuchsia-500',
                    )}
                    style={{ width: `${Math.max(2, row.percent)}%` }}
                />
            </div>

            <ArrowUpRight className="absolute right-3 top-3 size-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>
    );
}

function EmptyState({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <div className="text-[13.5px] font-bold text-slate-700">{title}</div>
            <div className="mt-1 text-[12px] text-slate-500">{description}</div>
        </div>
    );
}
