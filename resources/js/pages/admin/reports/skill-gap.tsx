import { Head, Link } from '@inertiajs/react';
import { AlertCircle, Award, BarChart3, Briefcase, Building2, CheckCircle2, Users } from 'lucide-react';

import { IconChevR } from '@/components/learnpath-icons';
import { ExportCsvButton } from '@/components/reports/export-csv-button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Totals = {
    evaluated_users: number;
    positions: number;
    gap_entries: number;
    on_target_entries: number;
};

type PositionRow = {
    position_id: number;
    name: string | null;
    division: string | null;
    total: number;
    gap_count: number;
    met_count: number;
    avg_gap: number;
    met_percent: number;
};

type DivisionRow = {
    division: string;
    total: number;
    gap_count: number;
};

type CompetencyGapRow = {
    competency_id: number;
    gap_count: number;
    avg_gap: number;
    competency: { id: number; name: string; category: string | null } | null;
};

type Props = {
    totals: Totals;
    perPosition: PositionRow[];
    byDivision: DivisionRow[];
    topCompetencyGaps: CompetencyGapRow[];
};

export default function SkillGapReport({ totals, perPosition, byDivision, topCompetencyGaps }: Props) {
    const overallMet = totals.gap_entries + totals.on_target_entries;
    const metPct = overallMet > 0 ? Math.round((totals.on_target_entries / overallMet) * 100) : 0;
    const maxDivision = Math.max(1, ...byDivision.map((d) => d.total));

    return (
        <>
            <Head title="Skill Gap Report" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="text-slate-500">Reports</span>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Skill Gap</span>
                    </nav>
                    <div className="mt-1.5 flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                                Skill Gap Report
                            </h1>
                            <p className="mt-1 text-[13.5px] text-slate-500">
                                Rangkuman gap kompetensi seluruh organisasi.{' '}
                                <Link href="/admin/skill-gaps" className="text-brand-600 hover:underline">
                                    Detail per karyawan →
                                </Link>
                            </p>
                        </div>
                        <ExportCsvButton href="/admin/reports/skill-gap/export.csv" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard label="Karyawan Dinilai" value={totals.evaluated_users} icon={Users} tint="bg-brand-50" text="text-brand-600" />
                    <StatCard label="Jabatan Tercakup" value={totals.positions} icon={Briefcase} tint="bg-violet-50" text="text-violet-600" />
                    <StatCard label="Total Gap" value={totals.gap_entries} icon={AlertCircle} tint="bg-rose-50" text="text-rose-600" />
                    <StatCard label="On Target" value={totals.on_target_entries} icon={CheckCircle2} tint="bg-emerald-50" text="text-emerald-600" />
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <h2 className="mb-3 text-[14px] font-bold text-slate-900">Overall Compliance</h2>
                    <div className="flex items-end gap-3">
                        <span className="text-[36px] font-extrabold text-emerald-600 tabular-nums leading-none">
                            {metPct}%
                        </span>
                        <span className="pb-1 text-[11.5px] text-slate-500">
                            {totals.on_target_entries} dari {overallMet} target kompetensi terpenuhi
                        </span>
                    </div>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${metPct}%` }}
                        />
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <h2 className="mb-4 inline-flex items-center gap-2 text-[14px] font-bold text-slate-900">
                            <Building2 className="size-4 text-slate-500" />
                            Per Divisi
                        </h2>
                        {byDivision.length === 0 ? (
                            <p className="py-8 text-center text-[12.5px] text-slate-500">
                                Belum ada data divisi.
                            </p>
                        ) : (
                            <ul className="space-y-3">
                                {byDivision.map((row) => (
                                    <li key={row.division}>
                                        <div className="mb-1 flex items-center justify-between">
                                            <div className="text-[12.5px] font-semibold text-slate-900">
                                                {row.division}
                                            </div>
                                            <div className="text-[11.5px] text-slate-600">
                                                <b className="text-rose-600">{row.gap_count}</b> gap / {row.total} total
                                            </div>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className="h-full rounded-full bg-rose-400"
                                                style={{ width: `${(row.gap_count / maxDivision) * 100}%` }}
                                            />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <h2 className="mb-4 inline-flex items-center gap-2 text-[14px] font-bold text-slate-900">
                            <Award className="size-4 text-slate-500" />
                            Top 10 Kompetensi Bermasalah
                        </h2>
                        {topCompetencyGaps.length === 0 ? (
                            <p className="py-8 text-center text-[12.5px] text-slate-500">
                                Tidak ada gap.
                            </p>
                        ) : (
                            <ul className="space-y-2.5">
                                {topCompetencyGaps.map((row, idx) => (
                                    <li
                                        key={row.competency_id}
                                        className="flex items-center justify-between gap-3"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="grid size-6 place-items-center rounded-full bg-rose-50 text-[11px] font-bold text-rose-700">
                                                {idx + 1}
                                            </span>
                                            <div className="min-w-0">
                                                <div className="truncate text-[12.5px] font-semibold text-slate-900">
                                                    {row.competency?.name ?? '-'}
                                                </div>
                                                {row.competency?.category && (
                                                    <Badge className="mt-0.5 border-transparent bg-violet-50 px-1.5 py-0 text-[10px] font-semibold text-violet-700">
                                                        {row.competency.category}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[13px] font-extrabold text-rose-600 tabular-nums leading-none">
                                                {row.gap_count}
                                            </div>
                                            <div className="text-[10px] text-slate-500">
                                                avg -{Number(row.avg_gap).toFixed(1)}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <h2 className="mb-4 inline-flex items-center gap-2 text-[14px] font-bold text-slate-900">
                        <BarChart3 className="size-4 text-slate-500" />
                        Kesiapan per Jabatan
                    </h2>
                    {perPosition.length === 0 ? (
                        <p className="py-8 text-center text-[12.5px] text-slate-500">
                            Belum ada data per jabatan.
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {perPosition.map((row) => (
                                <li key={row.position_id}>
                                    <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="text-[13px] font-bold text-slate-900">
                                                {row.name ?? '-'}
                                            </div>
                                            {row.division && (
                                                <div className="text-[10.5px] text-slate-500">
                                                    {row.division}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-[11.5px]">
                                            <span className="font-semibold text-slate-600">
                                                {row.met_count} / {row.total} target tercapai
                                            </span>
                                            <span
                                                className={cn(
                                                    'rounded-md px-2 py-0.5 text-[12px] font-bold tabular-nums',
                                                    row.met_percent >= 80
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : row.met_percent >= 50
                                                            ? 'bg-amber-50 text-amber-700'
                                                            : 'bg-rose-50 text-rose-700',
                                                )}
                                            >
                                                {row.met_percent}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className={cn(
                                                'h-full rounded-full',
                                                row.met_percent >= 80
                                                    ? 'bg-emerald-500'
                                                    : row.met_percent >= 50
                                                        ? 'bg-amber-500'
                                                        : 'bg-rose-500',
                                            )}
                                            style={{ width: `${row.met_percent}%` }}
                                        />
                                    </div>
                                    {row.gap_count > 0 && (
                                        <div className="mt-1 text-[10.5px] text-slate-500">
                                            Rata-rata gap: -{row.avg_gap.toFixed(1)} level
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
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
    value: number;
    icon: typeof Users;
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
                    <div className="text-[18px] font-extrabold text-slate-900 tabular-nums">
                        {value.toLocaleString('id-ID')}
                    </div>
                </div>
            </div>
        </div>
    );
}
