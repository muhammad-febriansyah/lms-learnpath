import { Head, Link, router } from '@inertiajs/react';
import {
    Award,
    BookOpen,
    CheckCircle2,
    Clock,
    Download,
    Filter,
    TrendingUp,
    UserCheck,
    Users,
} from 'lucide-react';
import { useState } from 'react';

import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type Kpis = {
    members: number;
    active_learners: number;
    total_enrollments: number;
    completed_enrollments: number;
    completion_rate: number;
    certificates_issued: number;
    total_hours: number;
};

type WeekPoint = { week: string; enrollments: number; completions: number };

type CourseRow = {
    course_id: number;
    title: string;
    slug: string;
    enrollments: number;
    completed: number;
    completion_rate: number;
};

type PositionRow = {
    position: string;
    members: number;
    enrollments: number;
    completed: number;
    completion_rate: number;
};

type Props = {
    organization: { id: number; name: string };
    filters: { from: string; to: string; preset: string };
    kpis: Kpis;
    weeklyTrend: WeekPoint[];
    topCourses: CourseRow[];
    positionBreakdown: PositionRow[];
};

const PRESET_OPTIONS = [
    { value: '7d', label: '7 hari' },
    { value: '30d', label: '30 hari' },
    { value: '90d', label: '90 hari' },
    { value: '12m', label: '12 bulan' },
    { value: 'custom', label: 'Kustom' },
];

export default function ReportsIndex({
    organization,
    filters,
    kpis,
    weeklyTrend,
    topCourses,
    positionBreakdown,
}: Props) {
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);

    const applyPreset = (preset: string) => {
        router.get(
            '/business/reports',
            preset === 'custom' ? { preset, from, to } : { preset },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    const applyCustom = () => {
        router.get(
            '/business/reports',
            { preset: 'custom', from, to },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    const handleExport = () => {
        const params = new URLSearchParams({
            preset: filters.preset,
            from: filters.from,
            to: filters.to,
        }).toString();
        window.location.href = `/business/reports/export.csv?${params}`;
    };

    return (
        <>
            <Head title="Laporan" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/business/dashboard" className="hover:text-slate-700">
                            Business
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Laporan</span>
                    </nav>
                    <div className="mt-1.5 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                                Laporan Pembelajaran
                            </h1>
                            <p className="mt-1 text-[13.5px] text-slate-500">
                                {organization.name} ·{' '}
                                <span className="font-semibold text-slate-700">
                                    {filters.from} → {filters.to}
                                </span>
                            </p>
                        </div>
                        <Button
                            type="button"
                            onClick={handleExport}
                            className="h-10 rounded-xl bg-brand-600 hover:bg-brand-700"
                        >
                            <Download className="mr-1.5 size-4" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* Filter bar */}
                <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 ring-1 ring-slate-200/70">
                    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-600">
                        <Filter className="size-3.5" />
                        Periode
                    </span>
                    <Select value={filters.preset} onValueChange={applyPreset}>
                        <SelectTrigger className="h-9 w-[140px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {PRESET_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {filters.preset === 'custom' && (
                        <>
                            <Input
                                type="date"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                className="h-9 w-[160px]"
                            />
                            <span className="text-slate-400">→</span>
                            <Input
                                type="date"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                className="h-9 w-[160px]"
                            />
                            <Button
                                type="button"
                                size="sm"
                                onClick={applyCustom}
                                className="h-9 rounded-lg bg-slate-900 hover:bg-slate-800"
                            >
                                Terapkan
                            </Button>
                        </>
                    )}
                </div>

                {/* KPI cards */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard
                        label="Anggota Aktif"
                        value={kpis.active_learners}
                        sub={`dari ${kpis.members} anggota`}
                        icon={<UserCheck className="size-4" />}
                        tone="brand"
                    />
                    <KpiCard
                        label="Enrollment"
                        value={kpis.total_enrollments}
                        sub={`${kpis.completed_enrollments} selesai`}
                        icon={<BookOpen className="size-4" />}
                        tone="indigo"
                    />
                    <KpiCard
                        label="Completion Rate"
                        value={`${kpis.completion_rate}%`}
                        sub="periode terpilih"
                        icon={<CheckCircle2 className="size-4" />}
                        tone="emerald"
                    />
                    <KpiCard
                        label="Total Jam Belajar"
                        value={kpis.total_hours.toLocaleString('id-ID')}
                        sub="jam materi diselesaikan"
                        icon={<Clock className="size-4" />}
                        tone="amber"
                    />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard
                        label="Sertifikat Terbit"
                        value={kpis.certificates_issued}
                        sub="periode terpilih"
                        icon={<Award className="size-4" />}
                        tone="rose"
                    />
                    <KpiCard
                        label="Total Anggota"
                        value={kpis.members}
                        sub="terdaftar di organisasi"
                        icon={<Users className="size-4" />}
                        tone="slate"
                    />
                </div>

                {/* Time series */}
                <Card title="Tren Mingguan" icon={<TrendingUp className="size-4" />}>
                    <WeeklyChart points={weeklyTrend} />
                </Card>

                {/* Top courses */}
                <Card title="Top Course (berdasarkan enrollment)">
                    {topCourses.length === 0 ? (
                        <p className="py-6 text-center text-[13px] text-slate-500">
                            Belum ada data enrollment di periode ini.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-[13px]">
                                <thead>
                                    <tr className="border-b border-slate-200 text-left text-[11.5px] font-bold tracking-wider text-slate-500 uppercase">
                                        <th className="py-2.5">Course</th>
                                        <th className="py-2.5 text-right">Enrollment</th>
                                        <th className="py-2.5 text-right">Selesai</th>
                                        <th className="py-2.5 text-right">Completion %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topCourses.map((c) => (
                                        <tr key={c.course_id} className="border-b border-slate-100">
                                            <td className="py-2.5">
                                                <Link
                                                    href={`/admin/courses/${c.course_id}/edit`}
                                                    className="font-semibold text-slate-900 hover:text-brand-700"
                                                >
                                                    {c.title}
                                                </Link>
                                            </td>
                                            <td className="py-2.5 text-right font-semibold tabular-nums">
                                                {c.enrollments}
                                            </td>
                                            <td className="py-2.5 text-right tabular-nums text-slate-600">
                                                {c.completed}
                                            </td>
                                            <td className="py-2.5 text-right">
                                                <CompletionPill rate={c.completion_rate} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                {/* Position breakdown */}
                <Card title="Performa per Jabatan">
                    {positionBreakdown.length === 0 ? (
                        <p className="py-6 text-center text-[13px] text-slate-500">
                            Belum ada data per jabatan.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-[13px]">
                                <thead>
                                    <tr className="border-b border-slate-200 text-left text-[11.5px] font-bold tracking-wider text-slate-500 uppercase">
                                        <th className="py-2.5">Jabatan</th>
                                        <th className="py-2.5 text-right">Anggota</th>
                                        <th className="py-2.5 text-right">Enrollment</th>
                                        <th className="py-2.5 text-right">Selesai</th>
                                        <th className="py-2.5 text-right">Completion %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {positionBreakdown.map((p) => (
                                        <tr key={p.position} className="border-b border-slate-100">
                                            <td className="py-2.5 font-semibold text-slate-900">
                                                {p.position}
                                            </td>
                                            <td className="py-2.5 text-right tabular-nums text-slate-600">
                                                {p.members}
                                            </td>
                                            <td className="py-2.5 text-right font-semibold tabular-nums">
                                                {p.enrollments}
                                            </td>
                                            <td className="py-2.5 text-right tabular-nums text-slate-600">
                                                {p.completed}
                                            </td>
                                            <td className="py-2.5 text-right">
                                                <CompletionPill rate={p.completion_rate} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </>
    );
}

const TONE_CLASSES: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-700 ring-brand-200',
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
    slate: 'bg-slate-50 text-slate-700 ring-slate-200',
};

function KpiCard({
    label,
    value,
    sub,
    icon,
    tone,
}: {
    label: string;
    value: string | number;
    sub: string;
    icon: React.ReactNode;
    tone: string;
}) {
    return (
        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200/70">
            <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-bold tracking-wider text-slate-500 uppercase">
                    {label}
                </span>
                <span
                    className={cn(
                        'grid size-8 place-items-center rounded-lg ring-1',
                        TONE_CLASSES[tone] ?? TONE_CLASSES.slate,
                    )}
                >
                    {icon}
                </span>
            </div>
            <div className="mt-2 text-[26px] leading-none font-extrabold text-slate-900 tabular-nums">
                {value}
            </div>
            <div className="mt-1 text-[11.5px] text-slate-500">{sub}</div>
        </div>
    );
}

function CompletionPill({ rate }: { rate: number }) {
    const tone =
        rate >= 70 ? 'bg-emerald-100 text-emerald-700' :
        rate >= 40 ? 'bg-amber-100 text-amber-700' :
        'bg-rose-100 text-rose-700';
    return (
        <Badge className={cn('border-transparent font-mono tabular-nums', tone)}>
            {rate}%
        </Badge>
    );
}

function WeeklyChart({ points }: { points: WeekPoint[] }) {
    if (points.length === 0) {
        return (
            <p className="py-6 text-center text-[13px] text-slate-500">
                Belum ada data dalam periode ini.
            </p>
        );
    }

    const max = Math.max(
        1,
        ...points.flatMap((p) => [p.enrollments, p.completions]),
    );

    return (
        <div className="space-y-3">
            <div className="flex items-end gap-1.5 sm:gap-2.5">
                {points.map((p, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                        <div className="flex h-32 w-full items-end gap-0.5">
                            <div
                                className="flex-1 rounded-t bg-brand-500 transition-all"
                                style={{ height: `${(p.enrollments / max) * 100}%` }}
                                title={`Enrollment: ${p.enrollments}`}
                            />
                            <div
                                className="flex-1 rounded-t bg-emerald-500 transition-all"
                                style={{ height: `${(p.completions / max) * 100}%` }}
                                title={`Selesai: ${p.completions}`}
                            />
                        </div>
                        <span className="text-[10px] text-slate-500">{p.week}</span>
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-center gap-4 text-[11.5px] text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                    <span className="size-2.5 rounded bg-brand-500" /> Enrollment
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <span className="size-2.5 rounded bg-emerald-500" /> Selesai
                </span>
            </div>
        </div>
    );
}

function Card({
    title,
    icon,
    children,
}: {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200/70">
            <h2 className="mb-3 inline-flex items-center gap-2 text-[14px] font-bold text-slate-900">
                {icon}
                {title}
            </h2>
            <div>{children}</div>
        </div>
    );
}
