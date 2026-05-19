import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    BadgeCheck,
    BarChart3,
    Briefcase,
    CheckCircle2,
    ClipboardList,
    Mail,
    Sparkles,
    Target,
    TrendingDown,
    TrendingUp,
    Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

type Stats = {
    total_employees: number;
    total_positions: number;
    total_competencies: number;
    skill_gap_total: number;
    skill_gap_critical: number;
    enroll_in_progress: number;
    enroll_completed: number;
    completion_rate: number;
    pending_invitations: number;
};

type GapItem = {
    competency_id: number;
    affected_count: number;
    avg_gap: number;
    competency: { id: number; name: string } | null;
};

type EnrollItem = {
    id: number;
    status: string;
    progress_percent: number;
    enrolled_at: string | null;
    user: { id: number; name: string; email: string } | null;
    course: { id: number; title: string; slug: string } | null;
};

type Props = {
    hr: { name: string; email: string };
    stats: Stats;
    topSkillGaps: GapItem[];
    recentEnrollments: EnrollItem[];
};

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
    });
}

const STATUS_LABEL: Record<string, string> = {
    active: 'Aktif',
    completed: 'Selesai',
    expired: 'Kedaluwarsa',
    locked: 'Terkunci',
};

const STATUS_TONE: Record<string, string> = {
    active: 'bg-sky-100 text-sky-700',
    completed: 'bg-emerald-100 text-emerald-700',
    expired: 'bg-slate-100 text-slate-600',
    locked: 'bg-amber-100 text-amber-700',
};

export default function DashboardHR({
    hr,
    stats,
    topSkillGaps,
    recentEnrollments,
}: Props) {
    return (
        <>
            <Head title="Dashboard HR" />
            <div className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                            Halo, {hr.name.split(' ')[0]} 👋
                        </h1>
                        <p className="mt-1 text-[13.5px] text-slate-500">
                            Ringkasan kompetensi karyawan, training, dan rekomendasi pengembangan.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline" className="rounded-xl">
                            <Link href="/business/invitations">
                                <Mail className="mr-1.5 size-4" />
                                Undang Karyawan
                            </Link>
                        </Button>
                        <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                            <Link href="/admin/enrollments">
                                <ClipboardList className="mr-1.5 size-4" />
                                Tugaskan Training
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* KPI grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={<Users className="size-5" />}
                        label="Total Karyawan"
                        value={stats.total_employees}
                        sub={
                            stats.pending_invitations > 0
                                ? `+${stats.pending_invitations} undangan pending`
                                : 'Semua sudah join'
                        }
                        tone="brand"
                    />
                    <StatCard
                        icon={<TrendingDown className="size-5" />}
                        label="Total Skill Gap"
                        value={stats.skill_gap_total}
                        sub={
                            stats.skill_gap_critical > 0
                                ? `${stats.skill_gap_critical} kritis (gap ≥ 2)`
                                : 'Tidak ada gap kritis'
                        }
                        tone={stats.skill_gap_critical > 0 ? 'rose' : 'emerald'}
                    />
                    <StatCard
                        icon={<ClipboardList className="size-5" />}
                        label="Training Berjalan"
                        value={stats.enroll_in_progress}
                        sub={`${stats.enroll_completed} selesai`}
                        tone="sky"
                    />
                    <StatCard
                        icon={<TrendingUp className="size-5" />}
                        label="Completion Rate"
                        value={`${stats.completion_rate}%`}
                        sub="Dari semua enrollment"
                        tone="emerald"
                    />
                </div>

                {/* Quick stats - org structure */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <QuickTile
                        icon={<Briefcase className="size-4" />}
                        label="Posisi & Jabatan"
                        value={stats.total_positions}
                        href="/admin/positions"
                        bg="bg-slate-100"
                        text="text-slate-700"
                    />
                    <QuickTile
                        icon={<BadgeCheck className="size-4" />}
                        label="Kompetensi Terdaftar"
                        value={stats.total_competencies}
                        href="/admin/competencies"
                        bg="bg-brand-100"
                        text="text-brand-700"
                    />
                    <QuickTile
                        icon={<Target className="size-4" />}
                        label="Skill Matrix"
                        value="Lihat"
                        href="/admin/skill-matrix"
                        bg="bg-emerald-100"
                        text="text-emerald-700"
                        valueIsLabel
                    />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                    {/* Top skill gaps */}
                    <Section
                        title="Top Skill Gap Kompetensi"
                        subtitle="Kompetensi dengan paling banyak karyawan mengalami gap."
                        action={
                            <Link
                                href="/admin/skill-gaps"
                                className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-600 hover:text-brand-700"
                            >
                                Detail <ArrowRight className="size-3" />
                            </Link>
                        }
                        empty="Tidak ada skill gap saat ini."
                        emptyIcon={<CheckCircle2 className="size-5 text-emerald-500" />}
                    >
                        {topSkillGaps.length > 0 && (
                            <div className="space-y-2.5">
                                {topSkillGaps.map((g) => (
                                    <div
                                        key={g.competency_id}
                                        className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                                    >
                                        <div className="min-w-0 flex-1 pr-3">
                                            <div className="truncate text-[13.5px] font-semibold text-slate-900">
                                                {g.competency?.name ?? 'Kompetensi #' + g.competency_id}
                                            </div>
                                            <div className="text-[11.5px] text-slate-500">
                                                Avg gap: {Number(g.avg_gap).toFixed(1)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Users className="size-3.5 text-slate-400" />
                                            <span className="text-[13px] font-extrabold text-rose-600 tabular-nums">
                                                {g.affected_count}
                                            </span>
                                            <span className="text-[11px] text-slate-500">
                                                karyawan
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Section>

                    {/* Recent enrollments */}
                    <Section
                        title="Training Terbaru"
                        subtitle="Enrollment karyawan ke training."
                        action={
                            <Link
                                href="/admin/enrollments"
                                className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-600 hover:text-brand-700"
                            >
                                Lihat semua <ArrowRight className="size-3" />
                            </Link>
                        }
                        empty="Belum ada enrollment training."
                        emptyIcon={<ClipboardList className="size-5 text-slate-400" />}
                    >
                        {recentEnrollments.length > 0 && (
                            <div className="space-y-2.5">
                                {recentEnrollments.map((e) => (
                                    <div
                                        key={e.id}
                                        className="rounded-xl bg-slate-50 px-4 py-3"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-[13px] font-semibold text-slate-900">
                                                    {e.user?.name ?? '—'}
                                                </div>
                                                <div className="truncate text-[11.5px] text-slate-500">
                                                    {e.course?.title ?? '—'}
                                                </div>
                                            </div>
                                            <span
                                                className={
                                                    'shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ' +
                                                    (STATUS_TONE[e.status] ??
                                                        'bg-slate-100 text-slate-600')
                                                }
                                            >
                                                {STATUS_LABEL[e.status] ?? e.status}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white">
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
                                            <span className="text-[11px] font-semibold text-slate-700 tabular-nums">
                                                {e.progress_percent}%
                                            </span>
                                            <span className="text-[10.5px] text-slate-400 tabular-nums">
                                                {formatDate(e.enrolled_at)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Section>
                </div>

                {stats.skill_gap_critical > 0 && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
                            <div className="flex-1">
                                <p className="text-[13.5px] font-semibold text-amber-900">
                                    {stats.skill_gap_critical} skill gap kritis perlu ditangani
                                </p>
                                <p className="mt-0.5 text-[12.5px] text-amber-800">
                                    Karyawan dengan gap ≥ 2 level membutuhkan training prioritas.
                                    Lihat rekomendasi AI untuk training yang tepat.
                                </p>
                                <div className="mt-2 flex gap-2">
                                    <Link
                                        href="/admin/skill-gaps"
                                        className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1 text-[12px] font-semibold text-white transition hover:bg-amber-700"
                                    >
                                        Lihat Skill Gap{' '}
                                        <ArrowRight className="size-3" />
                                    </Link>
                                    <Link
                                        href="/admin/training-recommendations"
                                        className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-[12px] font-semibold text-amber-800 transition hover:bg-amber-50"
                                    >
                                        <Sparkles className="size-3" />
                                        Rekomendasi Training
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-[14px] font-bold text-slate-900">
                                Laporan Lengkap
                            </h3>
                            <p className="text-[12px] text-slate-500">
                                Akses semua laporan training & kompetensi.
                            </p>
                        </div>
                        <Button asChild variant="outline" className="rounded-xl">
                            <Link href="/admin/reports/course-progress">
                                <BarChart3 className="mr-1.5 size-4" />
                                Buka Laporan
                            </Link>
                        </Button>
                    </div>
                </div>
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
    tone: 'brand' | 'emerald' | 'sky' | 'rose' | 'slate';
}) {
    const toneClass = {
        brand: 'bg-brand-100 text-brand-700',
        emerald: 'bg-emerald-100 text-emerald-700',
        sky: 'bg-sky-100 text-sky-700',
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

function QuickTile({
    icon,
    label,
    value,
    href,
    bg,
    text,
    valueIsLabel,
}: {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    href: string;
    bg: string;
    text: string;
    valueIsLabel?: boolean;
}) {
    return (
        <Link
            href={href}
            className="flex items-center justify-between gap-3 rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 transition hover:bg-slate-50"
        >
            <div className="flex items-center gap-3">
                <div className={`grid size-9 place-items-center rounded-xl ${bg} ${text}`}>
                    {icon}
                </div>
                <div>
                    <div className="text-[11.5px] font-medium text-slate-500">{label}</div>
                    <div
                        className={
                            'text-slate-900 tabular-nums ' +
                            (valueIsLabel
                                ? 'text-[13.5px] font-semibold'
                                : 'text-xl font-extrabold')
                        }
                    >
                        {value}
                    </div>
                </div>
            </div>
            <ArrowRight className="size-4 text-slate-300" />
        </Link>
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
