import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    Award,
    BarChart3,
    Briefcase,
    ClipboardCheck,
    MessageSquare,
    Target,
    Users,
} from 'lucide-react';

import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Overview = {
    positions: number;
    competencies: number;
    targets: number;
    users_assessed: number;
    gap_count: number;
    pending_ojt: number;
    pending_reviews: number;
};

type CriticalCompetency = {
    competency_id: number;
    gap_count: number;
    avg_gap: number;
    competency: { id: number; name: string; category: string | null } | null;
};

type PositionReadiness = {
    position_id: number;
    position_name: string | null;
    division: string | null;
    met: number;
    total: number;
    percent: number;
};

type Props = {
    overview: Overview;
    criticalCompetencies: CriticalCompetency[];
    positionReadiness: PositionReadiness[];
};

export default function SkillMatrixDashboard({
    overview,
    criticalCompetencies,
    positionReadiness,
}: Props) {
    return (
        <>
            <Head title="Skill Matrix Dashboard" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Skill Matrix</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Skill Matrix Dashboard
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Overview kesiapan kompetensi organisasi.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    <Card title="Total Jabatan" value={overview.positions} icon={Briefcase} tone="brand" />
                    <Card title="Total Kompetensi" value={overview.competencies} icon={Award} tone="violet" />
                    <Card title="Total Target" value={overview.targets} icon={Target} tone="amber" />
                    <Card title="Karyawan Dinilai" value={overview.users_assessed} icon={Users} tone="emerald" />
                </div>

                <div className="grid gap-5 lg:grid-cols-3">
                    <ActionCard
                        title="Ada Gap"
                        value={overview.gap_count}
                        description="entri di mana level aktual < target"
                        href="/admin/skill-gaps?status=gap"
                        icon={AlertCircle}
                        tone="rose"
                    />
                    <ActionCard
                        title="OJT Menunggu"
                        value={overview.pending_ojt}
                        description="butuh approval HR/Admin"
                        href="/admin/ojt-assessments?status=pending_review"
                        icon={ClipboardCheck}
                        tone="amber"
                    />
                    <ActionCard
                        title="Review Menunggu"
                        value={overview.pending_reviews}
                        description="supervisor review menunggu approval"
                        href="/admin/supervisor-reviews?status=pending_review"
                        icon={MessageSquare}
                        tone="sky"
                    />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                    <Section title="Top Kompetensi dengan Gap Terbanyak" icon={<AlertCircle className="size-4 text-rose-500" />}>
                        {criticalCompetencies.length === 0 ? (
                            <p className="py-6 text-center text-[12.5px] text-slate-500">
                                Belum ada skill gap. Hitung ulang dulu di halaman Skill Gap.
                            </p>
                        ) : (
                            <ul className="space-y-3">
                                {criticalCompetencies.map((row, idx) => (
                                    <li key={row.competency_id} className="flex items-center gap-3">
                                        <span className="grid size-7 place-items-center rounded-full bg-rose-50 text-[12px] font-bold text-rose-700">
                                            {idx + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="truncate text-[13px] font-semibold text-slate-900">
                                                {row.competency?.name ?? '-'}
                                            </div>
                                            {row.competency?.category && (
                                                <Badge className="mt-0.5 border-transparent bg-brand-50 px-1.5 py-0 text-[10.5px] font-semibold text-brand-700">
                                                    {row.competency.category}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[13.5px] font-extrabold text-rose-600 tabular-nums">
                                                {row.gap_count}
                                            </div>
                                            <div className="text-[10.5px] text-slate-500">orang</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Section>

                    <Section title="Position Readiness" icon={<Target className="size-4 text-brand-600" />}>
                        {positionReadiness.length === 0 ? (
                            <p className="py-6 text-center text-[12.5px] text-slate-500">
                                Belum ada data readiness per posisi.
                            </p>
                        ) : (
                            <ul className="space-y-3">
                                {positionReadiness.map((row) => (
                                    <li key={row.position_id}>
                                        <div className="mb-1 flex items-center justify-between">
                                            <div className="min-w-0">
                                                <div className="truncate text-[13px] font-semibold text-slate-900">
                                                    {row.position_name ?? '-'}
                                                </div>
                                                <div className="text-[10.5px] text-slate-500">
                                                    {row.division ?? '—'}
                                                </div>
                                            </div>
                                            <div className="text-[12.5px] font-bold tabular-nums text-slate-700">
                                                {row.percent}%
                                            </div>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className={cn(
                                                    'h-full rounded-full transition-all',
                                                    row.percent >= 80
                                                        ? 'bg-emerald-500'
                                                        : row.percent >= 50
                                                            ? 'bg-amber-500'
                                                            : 'bg-rose-500',
                                                )}
                                                style={{ width: `${row.percent}%` }}
                                            />
                                        </div>
                                        <div className="mt-0.5 text-[10.5px] text-slate-500">
                                            {row.met} / {row.total} target tercapai
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Section>
                </div>

                <Section title="Aksi Cepat" icon={<BarChart3 className="size-4 text-brand-600" />}>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        <QuickLink href="/admin/positions" label="Posisi / Jabatan" />
                        <QuickLink href="/admin/competencies" label="Kompetensi" />
                        <QuickLink href="/admin/position-competency-targets" label="Target Jabatan" />
                        <QuickLink href="/admin/course-competency-mappings" label="Mapping Course" />
                        <QuickLink href="/admin/ojt-assessments" label="OJT Assessment" />
                        <QuickLink href="/admin/supervisor-reviews" label="Supervisor Review" />
                        <QuickLink href="/admin/skill-gaps" label="Skill Gap" />
                        <QuickLink href="/admin/training-recommendations" label="Rekomendasi Training" />
                    </div>
                </Section>
            </div>
        </>
    );
}

function Card({
    title,
    value,
    icon: Icon,
    tone,
}: {
    title: string;
    value: number;
    icon: typeof Briefcase;
    tone: 'brand' | 'violet' | 'amber' | 'emerald';
}) {
    const tones: Record<string, string> = {
        brand: 'bg-brand-50 text-brand-600',
        violet: 'bg-brand-50 text-brand-600',
        amber: 'bg-amber-50 text-amber-600',
        emerald: 'bg-emerald-50 text-emerald-600',
    };

    return (
        <div className="rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="flex items-center gap-3">
                <div className={cn('grid size-10 place-items-center rounded-xl', tones[tone])}>
                    <Icon className="size-5" />
                </div>
                <div>
                    <div className="text-[11px] tracking-wider text-slate-500 uppercase">{title}</div>
                    <div className="text-[18px] font-extrabold text-slate-900 tabular-nums">
                        {value.toLocaleString('id-ID')}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ActionCard({
    title,
    value,
    description,
    href,
    icon: Icon,
    tone,
}: {
    title: string;
    value: number;
    description: string;
    href: string;
    icon: typeof AlertCircle;
    tone: 'rose' | 'amber' | 'sky';
}) {
    const tones: Record<string, string> = {
        rose: 'bg-rose-50 text-rose-700',
        amber: 'bg-amber-50 text-amber-700',
        sky: 'bg-sky-50 text-sky-700',
    };

    return (
        <Link
            href={href}
            className="block rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 transition-shadow hover:shadow-md"
        >
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-[12.5px] font-bold text-slate-700">{title}</div>
                    <div className="mt-1 text-[28px] font-extrabold text-slate-900 tabular-nums leading-none">
                        {value.toLocaleString('id-ID')}
                    </div>
                    <div className="mt-1 text-[11.5px] text-slate-500">{description}</div>
                </div>
                <div className={cn('grid size-9 place-items-center rounded-xl', tones[tone])}>
                    <Icon className="size-4" />
                </div>
            </div>
        </Link>
    );
}

function Section({
    title,
    icon,
    children,
}: {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <h2 className="mb-3 inline-flex items-center gap-2 text-[14px] font-bold text-slate-900">
                {icon}
                {title}
            </h2>
            {children}
        </div>
    );
}

function QuickLink({ href, label }: { href: string; label: string }) {
    return (
        <Button asChild variant="outline" className="justify-start rounded-xl text-[12.5px]">
            <Link href={href}>{label}</Link>
        </Button>
    );
}
