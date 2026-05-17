import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Award,
    BookOpen,
    CheckCircle2,
    Clock,
    PlayCircle,
    Sparkles,
    Target,
    TrendingDown,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

type Stats = {
    total_enrolled: number;
    in_progress: number;
    completed: number;
    completion_rate: number;
    total_certificates: number;
    total_skill_gaps: number;
    critical_gaps: number;
};

type Enrollment = {
    id: number;
    status: string;
    progress_percent: number;
    enrolled_at: string | null;
    course: { id: number; title: string; slug: string; thumbnail: string | null } | null;
};

type Gap = {
    id: number;
    gap: number;
    target_level: number;
    actual_level: number;
    competency: { id: number; name: string; category: string } | null;
};

type Props = {
    employee: { name: string; email: string };
    stats: Stats;
    recentEnrollments: Enrollment[];
    topGaps: Gap[];
};

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
    });
}

export default function DashboardEmployee({
    employee,
    stats,
    recentEnrollments,
    topGaps,
}: Props) {
    return (
        <>
            <Head title="Dashboard Saya" />
            <div className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                            Halo, {employee.name.split(' ')[0]} 👋
                        </h1>
                        <p className="mt-1 text-[13.5px] text-slate-500">
                            Lanjutkan belajar dan tutup gap kompetensi Anda.
                        </p>
                    </div>
                    <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                        <Link href="/my-courses">
                            <PlayCircle className="mr-1.5 size-4" />
                            Lanjut Belajar
                        </Link>
                    </Button>
                </div>

                {/* KPI grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={<BookOpen className="size-5" />}
                        label="Total Kelas"
                        value={stats.total_enrolled}
                        sub={`${stats.in_progress} sedang berjalan`}
                        tone="brand"
                    />
                    <StatCard
                        icon={<CheckCircle2 className="size-5" />}
                        label="Selesai"
                        value={stats.completed}
                        sub={`${stats.completion_rate}% completion`}
                        tone="emerald"
                    />
                    <StatCard
                        icon={<Award className="size-5" />}
                        label="Sertifikat"
                        value={stats.total_certificates}
                        sub="Terbit untuk Anda"
                        tone="amber"
                    />
                    <StatCard
                        icon={<TrendingDown className="size-5" />}
                        label="Skill Gap"
                        value={stats.total_skill_gaps}
                        sub={stats.critical_gaps > 0 ? `${stats.critical_gaps} kritis` : 'Aman'}
                        tone={stats.critical_gaps > 0 ? 'rose' : 'slate'}
                    />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                    {/* Recent enrollments */}
                    <Section
                        title="Lanjut Belajar"
                        subtitle="Kelas yang sedang Anda ikuti."
                        action={
                            <Link
                                href="/my-courses"
                                className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-600 hover:text-brand-700"
                            >
                                Lihat semua <ArrowRight className="size-3" />
                            </Link>
                        }
                        empty="Belum ada kelas yang Anda ikuti. Hubungi HR untuk penugasan training."
                        emptyIcon={<BookOpen className="size-5 text-slate-400" />}
                    >
                        {recentEnrollments.length > 0 && (
                            <div className="space-y-2.5">
                                {recentEnrollments.map((e) => (
                                    <Link
                                        key={e.id}
                                        href={`/learn/${e.course?.slug ?? ''}`}
                                        className="block rounded-xl bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-[13px] font-semibold text-slate-900">
                                                    {e.course?.title ?? '—'}
                                                </div>
                                                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                                                    <Clock className="size-3" />
                                                    Mulai {formatDate(e.enrolled_at)}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[12px] font-bold text-slate-700 tabular-nums">
                                                    {e.progress_percent}%
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                                            <div
                                                className={
                                                    'h-full ' +
                                                    (e.progress_percent >= 100
                                                        ? 'bg-emerald-500'
                                                        : e.progress_percent >= 50
                                                            ? 'bg-brand-500'
                                                            : 'bg-amber-400')
                                                }
                                                style={{
                                                    width: `${Math.min(100, e.progress_percent)}%`,
                                                }}
                                            />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </Section>

                    {/* Top skill gaps */}
                    <Section
                        title="Skill Gap Saya"
                        subtitle="Kompetensi yang masih perlu Anda kembangkan."
                        action={
                            <Link
                                href="/my-skill-matrix"
                                className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-600 hover:text-brand-700"
                            >
                                Detail <ArrowRight className="size-3" />
                            </Link>
                        }
                        empty="Tidak ada skill gap. Pertahankan!"
                        emptyIcon={<CheckCircle2 className="size-5 text-emerald-500" />}
                    >
                        {topGaps.length > 0 && (
                            <div className="space-y-2.5">
                                {topGaps.map((g) => (
                                    <div
                                        key={g.id}
                                        className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                                    >
                                        <div className="min-w-0 flex-1 pr-3">
                                            <div className="truncate text-[13px] font-semibold text-slate-900">
                                                {g.competency?.name ?? '—'}
                                            </div>
                                            <div className="text-[11px] text-slate-500">
                                                {g.competency?.category}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Target className="size-3.5 text-slate-400" />
                                            <span className="text-[11.5px] text-slate-600 tabular-nums">
                                                {g.actual_level}
                                                <span className="text-slate-400">/{g.target_level}</span>
                                            </span>
                                            <span
                                                className={
                                                    'ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ' +
                                                    (g.gap >= 2
                                                        ? 'bg-rose-100 text-rose-700'
                                                        : 'bg-amber-100 text-amber-700')
                                                }
                                            >
                                                gap {g.gap}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Section>
                </div>

                {stats.critical_gaps > 0 && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
                            <div className="flex-1">
                                <p className="text-[13.5px] font-semibold text-amber-900">
                                    Anda punya {stats.critical_gaps} kompetensi kritis
                                </p>
                                <p className="mt-0.5 text-[12.5px] text-amber-800">
                                    Lihat rekomendasi training untuk menutup gap dan naik level
                                    karier.
                                </p>
                                <Link
                                    href="/my-recommendations"
                                    className="mt-2 inline-flex items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1 text-[12px] font-semibold text-white transition hover:bg-amber-700"
                                >
                                    <Sparkles className="size-3" />
                                    Lihat Rekomendasi Training
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function StatCard({
    icon,
    label,
    value,
    sub,
    tone,
}: {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    sub: string;
    tone: 'brand' | 'emerald' | 'amber' | 'rose' | 'slate';
}) {
    const toneClass = {
        brand: 'bg-brand-100 text-brand-700',
        emerald: 'bg-emerald-100 text-emerald-700',
        amber: 'bg-amber-100 text-amber-700',
        rose: 'bg-rose-100 text-rose-700',
        slate: 'bg-slate-100 text-slate-700',
    }[tone];

    return (
        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className={`inline-flex size-10 items-center justify-center rounded-xl ${toneClass}`}>
                {icon}
            </div>
            <div className="mt-3 text-[12px] font-medium text-slate-500">{label}</div>
            <div className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                {value}
            </div>
            <div className="mt-1 text-[11.5px] text-slate-500">{sub}</div>
        </div>
    );
}

function Section({
    title,
    subtitle,
    action,
    children,
    empty,
    emptyIcon,
}: {
    title: string;
    subtitle: string;
    action?: React.ReactNode;
    children?: React.ReactNode;
    empty: string;
    emptyIcon: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="mb-3 flex items-start justify-between">
                <div>
                    <h2 className="text-[14px] font-bold text-slate-900">{title}</h2>
                    <p className="mt-0.5 text-[12px] text-slate-500">{subtitle}</p>
                </div>
                {action}
            </div>
            {children ? (
                children
            ) : (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-slate-50 py-8 text-center">
                    <div className="grid size-10 place-items-center rounded-full bg-white shadow-sm">
                        {emptyIcon}
                    </div>
                    <p className="text-[12.5px] text-slate-500">{empty}</p>
                </div>
            )}
        </div>
    );
}
