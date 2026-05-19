import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    AlertCircle,
    BarChart3,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Loader2,
    RefreshCw,
    Sparkles,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

import { DataTable } from '@/components/data-table/data-table';
import { DataTablePagination, type Paginator } from '@/components/data-table/data-table-pagination';
import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type AiRecommendation = {
    summary: string;
    recommendations: Array<{
        course_id: number;
        title: string;
        slug: string;
        rationale: string;
        order: number;
    }>;
    generated_at: string;
};

type Gap = {
    id: number;
    target_level: number;
    actual_level: number;
    gap: number;
    status: string;
    calculated_at: string | null;
    ai_recommendation: AiRecommendation | null;
    ai_recommended_at: string | null;
    user: { id: number; name: string; email: string } | null;
    position: { id: number; name: string; division: string | null } | null;
    competency: { id: number; name: string; category: string | null } | null;
};

type Props = {
    gaps: Paginator<Gap>;
    filters: { search?: string; position?: string; status?: string };
    positionOptions: { id: number; name: string }[];
    stats: {
        total_employees: number;
        gap: number;
        on_target: number;
        exceed: number;
        last_calculated_at: string | null;
    };
};

const STATUS_TONES: Record<string, string> = {
    no_data: 'border-transparent bg-slate-100 text-slate-600',
    gap: 'border-transparent bg-rose-50 text-rose-700',
    on_target: 'border-transparent bg-emerald-50 text-emerald-700',
    exceed: 'border-transparent bg-sky-50 text-sky-700',
};

const STATUS_LABELS: Record<string, string> = {
    no_data: 'No Data',
    gap: 'Gap',
    on_target: 'On Target',
    exceed: 'Lebih',
};

function formatDateTime(value: string | null): string {
    if (!value) return 'Belum pernah dihitung';
    return new Date(value).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function SkillGapsIndex({ gaps, filters, positionOptions, stats }: Props) {
    const [busyId, setBusyId] = useState<number | null>(null);
    const [activeAi, setActiveAi] = useState<Gap | null>(null);

    const triggerAi = (gap: Gap) => {
        setBusyId(gap.id);
        router.post(
            `/admin/skill-gaps/${gap.id}/recommend-ai`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    // After the page reloads with fresh gaps, open the dialog
                    // for this gap if its recommendation is now available.
                    setTimeout(() => {
                        const refreshed = gaps.data.find((g) => g.id === gap.id);
                        if (refreshed?.ai_recommendation) setActiveAi(refreshed);
                    }, 50);
                },
                onFinish: () => setBusyId(null),
            },
        );
    };

    const handleFilter = (next: Record<string, string | undefined>) => {
        router.get(
            '/admin/skill-gaps',
            { ...filters, ...next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const recalc = () => {
        router.post('/admin/skill-gaps/recalculate', {}, { preserveScroll: true });
    };

    const columns: ColumnDef<Gap>[] = [
        {
            id: 'user',
            header: 'Karyawan',
            cell: ({ row }) => (
                <div>
                    <div className="font-semibold text-slate-900">
                        {row.original.user?.name ?? '-'}
                    </div>
                    <div className="text-[11.5px] text-slate-500">
                        {row.original.position?.name ?? '-'}
                    </div>
                </div>
            ),
            meta: { label: 'Karyawan' },
        },
        {
            id: 'competency',
            header: 'Kompetensi',
            cell: ({ row }) => (
                <div>
                    <div className="text-[13px] font-semibold text-slate-900">
                        {row.original.competency?.name ?? '-'}
                    </div>
                    {row.original.competency?.category && (
                        <Badge className="mt-0.5 border-transparent bg-violet-50 px-1.5 py-0 text-[10.5px] font-semibold text-violet-700">
                            {row.original.competency.category}
                        </Badge>
                    )}
                </div>
            ),
            meta: { label: 'Kompetensi' },
        },
        {
            id: 'levels',
            header: 'Target / Aktual',
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-[13px] font-bold tabular-nums">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-700">
                        {row.original.target_level}
                    </span>
                    <span className="text-slate-400">→</span>
                    <span
                        className={cn(
                            'rounded-md px-2 py-0.5',
                            row.original.actual_level >= row.original.target_level
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700',
                        )}
                    >
                        {row.original.actual_level}
                    </span>
                </div>
            ),
            meta: { label: 'Levels' },
        },
        {
            id: 'gap',
            header: 'Gap',
            cell: ({ row }) => {
                const gap = row.original.gap;
                return (
                    <span
                        className={cn(
                            'text-[14px] font-extrabold tabular-nums',
                            gap > 0 ? 'text-rose-600' : gap === 0 ? 'text-emerald-600' : 'text-sky-600',
                        )}
                    >
                        {gap > 0 ? `-${gap}` : gap === 0 ? '0' : `+${Math.abs(gap)}`}
                    </span>
                );
            },
            meta: { label: 'Gap', className: 'w-[80px]' },
        },
        {
            id: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge className={STATUS_TONES[row.original.status] ?? ''}>
                    {STATUS_LABELS[row.original.status] ?? row.original.status}
                </Badge>
            ),
            meta: { label: 'Status' },
        },
        {
            id: 'ai',
            header: 'AI',
            cell: ({ row }) => (
                <AiButton
                    gap={row.original}
                    busy={busyId === row.original.id}
                    onGenerate={(g) => triggerAi(g)}
                    onView={(g) => setActiveAi(g)}
                />
            ),
            meta: { label: 'AI' },
        },
    ];

    return (
        <>
            <Head title="Skill Gap" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Skill Gap</span>
                    </nav>
                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                                Skill Gap Analysis
                            </h1>
                            <p className="mt-1 text-[12px] text-slate-500">
                                Terakhir dihitung: {formatDateTime(stats.last_calculated_at)}
                            </p>
                        </div>
                        <Button onClick={recalc} className="rounded-xl bg-brand-600 hover:bg-brand-700">
                            <RefreshCw className="mr-1.5 size-4" />
                            Hitung Ulang
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard label="Karyawan" value={stats.total_employees} icon={BarChart3} tint="bg-brand-50" text="text-brand-600" />
                    <StatCard label="Ada Gap" value={stats.gap} icon={AlertCircle} tint="bg-rose-50" text="text-rose-600" />
                    <StatCard label="On Target" value={stats.on_target} icon={CheckCircle2} tint="bg-emerald-50" text="text-emerald-600" />
                    <StatCard label="Lebih Tinggi" value={stats.exceed} icon={TrendingUp} tint="bg-sky-50" text="text-sky-600" />
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4">
                        <h2 className="text-[15px] font-bold text-slate-900">Daftar Skill Gap</h2>
                        <p className="mt-0.5 text-[12.5px] text-slate-500">{gaps.total} entri</p>
                    </div>

                    <DataTable
                        columns={columns}
                        data={gaps.data}
                        searchValue={filters.search ?? ''}
                        searchPlaceholder="Cari nama karyawan..."
                        onSearchChange={(v) => handleFilter({ search: v || undefined })}
                        toolbarSlot={
                            <>
                                <Select
                                    value={filters.position ?? 'all'}
                                    onValueChange={(v) => handleFilter({ position: v === 'all' ? undefined : v })}
                                >
                                    <SelectTrigger className="h-9 w-[180px]">
                                        <SelectValue placeholder="Jabatan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Jabatan</SelectItem>
                                        {positionOptions.map((p) => (
                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filters.status ?? 'all'}
                                    onValueChange={(v) => handleFilter({ status: v === 'all' ? undefined : v })}
                                >
                                    <SelectTrigger className="h-9 w-[140px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua</SelectItem>
                                        <SelectItem value="gap">Gap</SelectItem>
                                        <SelectItem value="on_target">On Target</SelectItem>
                                        <SelectItem value="exceed">Lebih</SelectItem>
                                        <SelectItem value="no_data">No Data</SelectItem>
                                    </SelectContent>
                                </Select>
                            </>
                        }
                        emptyState={
                            <div className="py-12 text-center">
                                <BarChart3 className="mx-auto mb-3 size-6 text-slate-400" />
                                <p className="text-sm font-semibold text-slate-900">
                                    Belum ada skill gap dihitung
                                </p>
                                <p className="mt-1 text-[12.5px] text-slate-500">
                                    Klik tombol "Hitung Ulang" untuk mulai analisis.
                                </p>
                            </div>
                        }
                    />

                    <div className="mt-4">
                        <DataTablePagination paginator={gaps} />
                    </div>
                </div>
            </div>

            <AiRecommendationDialog
                gap={activeAi}
                onClose={() => setActiveAi(null)}
            />
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
    icon: typeof BarChart3;
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

function AiButton({
    gap,
    busy,
    onGenerate,
    onView,
}: {
    gap: Gap;
    busy: boolean;
    onGenerate: (gap: Gap) => void;
    onView: (gap: Gap) => void;
}) {
    const hasRec = !!gap.ai_recommendation;
    if (busy) {
        return (
            <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-lg"
                disabled
            >
                <Loader2 className="mr-1 size-3.5 animate-spin" />
                AI…
            </Button>
        );
    }
    if (hasRec) {
        return (
            <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-lg border-brand-200 text-brand-700 hover:bg-brand-50"
                onClick={() => onView(gap)}
            >
                <Sparkles className="mr-1 size-3.5" />
                Lihat
            </Button>
        );
    }
    return (
        <Button
            size="sm"
            className="h-8 rounded-lg bg-brand-600 text-white hover:bg-brand-700"
            onClick={() => onGenerate(gap)}
        >
            <Sparkles className="mr-1 size-3.5" />
            Rekomendasi
        </Button>
    );
}

function AiRecommendationDialog({
    gap,
    onClose,
}: {
    gap: Gap | null;
    onClose: () => void;
}) {
    const rec = gap?.ai_recommendation;

    return (
        <Dialog open={!!gap} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="inline-flex items-center gap-2">
                        <Sparkles className="size-5 text-brand-600" />
                        Rekomendasi AI — {gap?.competency?.name ?? ''}
                    </DialogTitle>
                    <DialogDescription>
                        Untuk {gap?.user?.name ?? '-'} · gap {gap?.gap} level
                        (target {gap?.target_level} → aktual {gap?.actual_level})
                    </DialogDescription>
                </DialogHeader>

                {rec ? (
                    <div className="space-y-4">
                        <p className="rounded-xl bg-brand-50 p-3 text-[13px] text-brand-900 ring-1 ring-brand-200/60">
                            {rec.summary}
                        </p>

                        {rec.recommendations.length === 0 ? (
                            <p className="rounded-xl bg-amber-50 p-3 text-[12.5px] text-amber-800 ring-1 ring-amber-200/60">
                                AI tidak menemukan course internal yang cocok untuk gap
                                ini. Pertimbangkan menambahkan course baru atau memetakan
                                course existing ke kompetensi ini.
                            </p>
                        ) : (
                            <ol className="space-y-3">
                                {rec.recommendations.map((r, i) => (
                                    <li
                                        key={r.course_id}
                                        className="rounded-xl bg-white p-3 ring-1 ring-slate-200/70"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-600 text-[12px] font-bold text-white">
                                                {i + 1}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <Link
                                                    href={`/courses/${r.slug}`}
                                                    className="text-[13.5px] font-bold text-slate-900 hover:text-brand-700"
                                                >
                                                    {r.title}
                                                </Link>
                                                <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
                                                    {r.rationale}
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        )}

                        <p className="text-[10.5px] text-slate-400">
                            Dibuat {new Date(rec.generated_at).toLocaleString('id-ID')}
                        </p>
                    </div>
                ) : (
                    <p className="text-[13px] text-slate-500">
                        Belum ada rekomendasi.
                    </p>
                )}
            </DialogContent>
        </Dialog>
    );
}
