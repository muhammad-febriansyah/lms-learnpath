import { Head, Link } from '@inertiajs/react';
import { Award, BarChart3, Briefcase, ChevronRight, TrendingUp } from 'lucide-react';

import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Profile = {
    employee_number: string | null;
    division: string | null;
    branch: string | null;
} | null;

type Position = {
    id: number;
    name: string;
    division: string | null;
} | null;

type Competency = {
    id: number;
    name: string | null;
    category: string | null;
    actual_level: number;
    source: string;
    confidence_score: number;
    last_evaluated_at: string | null;
};

type Gap = {
    id: number;
    competency_id: number;
    competency_name: string | null;
    category: string | null;
    target_level: number;
    actual_level: number;
    gap: number;
    status: string;
};

type Props = {
    profile: Profile;
    position: Position;
    competencies: Competency[];
    gaps: Gap[];
    totalCompetencies: number;
};

const SOURCE_LABELS: Record<string, string> = {
    no_data: 'Belum dinilai',
    course: 'Course',
    ojt: 'OJT',
    supervisor_review: 'Supervisor',
};

const LEVEL_LABELS = ['—', 'Awareness', 'Basic', 'Intermediate', 'Advanced', 'Expert'];

export default function MySkillMatrix({ position, competencies, gaps, totalCompetencies }: Props) {
    const assessed = competencies.length;
    const onTarget = gaps.filter((g) => g.status === 'on_target' || g.status === 'exceed').length;
    const totalGap = gaps.filter((g) => g.status === 'gap').length;

    const grouped = competencies.reduce<Record<string, Competency[]>>((acc, c) => {
        const key = c.category ?? 'Lainnya';
        acc[key] = acc[key] ?? [];
        acc[key].push(c);
        return acc;
    }, {});

    return (
        <>
            <Head title="Skill Matrix Saya" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Skill Matrix Saya</span>
                    </nav>
                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                                Skill Matrix Saya
                            </h1>
                            {position && (
                                <p className="mt-1 inline-flex items-center gap-1.5 text-[13.5px] text-slate-500">
                                    <Briefcase className="size-3.5" />
                                    {position.name}
                                    {position.division && ` · ${position.division}`}
                                </p>
                            )}
                        </div>
                        {gaps.length > 0 && (
                            <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                                <Link href="/my-recommendations">
                                    Lihat Rekomendasi
                                    <ChevronRight className="ml-1 size-4" />
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {!position ? (
                    <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
                        <div className="flex items-start gap-3">
                            <Briefcase className="size-5 shrink-0 text-amber-700" />
                            <div className="text-[13px] text-amber-900">
                                <p className="font-semibold">Belum ada jabatan tertaut.</p>
                                <p className="mt-1">
                                    Skill matrix membutuhkan jabatan untuk membandingkan dengan target. Hubungi HR untuk
                                    pengisian data karyawan Anda.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <StatCard label="Total Kompetensi" value={totalCompetencies} icon={Award} tint="bg-brand-50" text="text-brand-600" />
                        <StatCard label="Sudah Dinilai" value={assessed} icon={BarChart3} tint="bg-violet-50" text="text-violet-600" />
                        <StatCard label="On Target" value={onTarget} icon={TrendingUp} tint="bg-emerald-50" text="text-emerald-600" />
                        <StatCard label="Ada Gap" value={totalGap} icon={TrendingUp} tint="bg-rose-50" text="text-rose-600" />
                    </div>
                )}

                {gaps.length > 0 && (
                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <h2 className="mb-4 text-[15px] font-bold text-slate-900">
                            Perbandingan Target vs Aktual
                        </h2>
                        <ul className="space-y-3">
                            {gaps.map((gap) => (
                                <li key={gap.id}>
                                    <div className="mb-1 flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="truncate text-[13.5px] font-semibold text-slate-900">
                                                {gap.competency_name}
                                            </div>
                                            {gap.category && (
                                                <Badge className="mt-0.5 border-transparent bg-violet-50 px-1.5 py-0 text-[10.5px] font-semibold text-violet-700">
                                                    {gap.category}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-[12px] font-bold tabular-nums">
                                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-700">
                                                Target {gap.target_level}
                                            </span>
                                            <span
                                                className={cn(
                                                    'rounded-md px-2 py-0.5',
                                                    gap.actual_level >= gap.target_level
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : 'bg-rose-50 text-rose-700',
                                                )}
                                            >
                                                Aktual {gap.actual_level}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="relative h-3 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="absolute inset-y-0 left-0 bg-slate-300"
                                            style={{ width: `${(gap.target_level / 5) * 100}%` }}
                                        />
                                        <div
                                            className={cn(
                                                'relative h-full',
                                                gap.actual_level >= gap.target_level
                                                    ? 'bg-emerald-500'
                                                    : 'bg-brand-500',
                                            )}
                                            style={{ width: `${(gap.actual_level / 5) * 100}%` }}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {Object.keys(grouped).length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-[16px] font-bold text-slate-900">Detail Kompetensi</h2>
                        {Object.entries(grouped).map(([category, items]) => (
                            <div
                                key={category}
                                className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70"
                            >
                                <h3 className="mb-3 inline-flex items-center gap-2 text-[13px] font-bold text-slate-900">
                                    <Badge className="border-transparent bg-violet-50 text-violet-700">
                                        {category}
                                    </Badge>
                                </h3>
                                <ul className="divide-y divide-slate-100">
                                    {items.map((c) => (
                                        <li
                                            key={c.id}
                                            className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0"
                                        >
                                            <div>
                                                <div className="text-[13px] font-semibold text-slate-900">
                                                    {c.name}
                                                </div>
                                                <div className="mt-0.5 text-[11px] text-slate-500">
                                                    Sumber: {SOURCE_LABELS[c.source] ?? c.source}
                                                    {c.confidence_score > 0 && ` · ${c.confidence_score}% confidence`}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((lv) => (
                                                        <div
                                                            key={lv}
                                                            className={cn(
                                                                'size-5 rounded',
                                                                lv <= c.actual_level
                                                                    ? 'bg-brand-500'
                                                                    : 'bg-slate-100',
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-[11.5px] font-bold text-slate-700 tabular-nums">
                                                    {LEVEL_LABELS[c.actual_level]}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
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
    icon: typeof Award;
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
