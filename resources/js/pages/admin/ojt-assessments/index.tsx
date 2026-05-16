import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Check, ClipboardCheck, Clock, Plus, X } from 'lucide-react';

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

type Assessment = {
    id: number;
    rubric_score: number;
    actual_level: number;
    notes: string | null;
    status: string;
    assessed_at: string | null;
    user: { id: number; name: string; email: string } | null;
    supervisor: { id: number; name: string } | null;
    competency: { id: number; name: string; category: string | null } | null;
    course: { id: number; title: string } | null;
};

type Props = {
    assessments: Paginator<Assessment>;
    filters: { search?: string; status?: string; competency?: string };
    competencyOptions: { id: number; name: string }[];
    stats: { total: number; pending: number; approved: number; rejected: number };
};

const STATUS_TONES: Record<string, string> = {
    pending_review: 'border-transparent bg-amber-50 text-amber-700',
    approved: 'border-transparent bg-emerald-50 text-emerald-700',
    rejected: 'border-transparent bg-rose-50 text-rose-700',
};

const STATUS_LABELS: Record<string, string> = {
    pending_review: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
};

function formatDate(value: string | null): string {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function OjtAssessmentsIndex({
    assessments,
    filters,
    competencyOptions,
    stats,
}: Props) {
    const handleFilter = (next: Record<string, string | undefined>) => {
        router.get(
            '/admin/ojt-assessments',
            { ...filters, ...next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleStatus = (id: number, status: 'approved' | 'rejected') => {
        router.post(
            `/admin/ojt-assessments/${id}/status`,
            { status, _method: 'patch' },
            { preserveScroll: true },
        );
    };

    const columns: ColumnDef<Assessment>[] = [
        {
            id: 'user',
            header: 'Karyawan',
            cell: ({ row }) => (
                <div>
                    <div className="font-semibold text-slate-900">
                        {row.original.user?.name ?? '-'}
                    </div>
                    <div className="text-[11.5px] text-slate-500">
                        {row.original.user?.email ?? '-'}
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
            id: 'score',
            header: 'Skor / Level',
            cell: ({ row }) => (
                <div className="text-[12.5px]">
                    <div className="font-semibold text-slate-900 tabular-nums">
                        {row.original.rubric_score} / 100
                    </div>
                    <div className="text-slate-500">Level {row.original.actual_level}</div>
                </div>
            ),
            meta: { label: 'Skor' },
        },
        {
            id: 'supervisor',
            header: 'Supervisor',
            cell: ({ row }) => (
                <div className="text-[12.5px] text-slate-700">
                    {row.original.supervisor?.name ?? '-'}
                </div>
            ),
            meta: { label: 'Supervisor' },
        },
        {
            id: 'assessed_at',
            header: 'Tanggal',
            cell: ({ row }) => (
                <span className="text-[12px] text-slate-600">
                    {formatDate(row.original.assessed_at)}
                </span>
            ),
            meta: { label: 'Tanggal' },
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
            id: 'actions',
            header: '',
            cell: ({ row }) =>
                row.original.status === 'pending_review' ? (
                    <div className="flex items-center justify-end gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-emerald-600 hover:bg-emerald-50"
                            title="Setujui"
                            onClick={() => handleStatus(row.original.id, 'approved')}
                        >
                            <Check className="size-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-rose-500 hover:bg-rose-50"
                            title="Tolak"
                            onClick={() => handleStatus(row.original.id, 'rejected')}
                        >
                            <X className="size-4" />
                        </Button>
                    </div>
                ) : null,
            meta: { label: 'Aksi', className: 'w-[100px] text-right' },
            enableSorting: false,
        },
    ];

    return (
        <>
            <Head title="OJT Assessment" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">OJT Assessment</span>
                    </nav>
                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                            OJT Assessment
                        </h1>
                        <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                            <Link href="/admin/ojt-assessments/create">
                                <Plus className="mr-1.5 size-4" />
                                Input OJT Baru
                            </Link>
                        </Button>
                    </div>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Catat hasil penilaian on-the-job training oleh supervisor.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard label="Total" value={stats.total} icon={ClipboardCheck} tint="bg-brand-50" text="text-brand-600" />
                    <StatCard label="Menunggu" value={stats.pending} icon={Clock} tint="bg-amber-50" text="text-amber-600" />
                    <StatCard label="Disetujui" value={stats.approved} icon={Check} tint="bg-emerald-50" text="text-emerald-600" />
                    <StatCard label="Ditolak" value={stats.rejected} icon={X} tint="bg-rose-50" text="text-rose-600" />
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4">
                        <h2 className="text-[15px] font-bold text-slate-900">Daftar OJT</h2>
                        <p className="mt-0.5 text-[12.5px] text-slate-500">{assessments.total} entri</p>
                    </div>

                    <DataTable
                        columns={columns}
                        data={assessments.data}
                        searchValue={filters.search ?? ''}
                        searchPlaceholder="Cari nama karyawan..."
                        onSearchChange={(v) => handleFilter({ search: v || undefined })}
                        toolbarSlot={
                            <>
                                <Select
                                    value={filters.status ?? 'all'}
                                    onValueChange={(v) => handleFilter({ status: v === 'all' ? undefined : v })}
                                >
                                    <SelectTrigger className="h-9 w-[140px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua</SelectItem>
                                        <SelectItem value="pending_review">Menunggu</SelectItem>
                                        <SelectItem value="approved">Disetujui</SelectItem>
                                        <SelectItem value="rejected">Ditolak</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filters.competency ?? 'all'}
                                    onValueChange={(v) => handleFilter({ competency: v === 'all' ? undefined : v })}
                                >
                                    <SelectTrigger className="h-9 w-[180px]">
                                        <SelectValue placeholder="Kompetensi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kompetensi</SelectItem>
                                        {competencyOptions.map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </>
                        }
                        emptyState={
                            <div className="py-12 text-center">
                                <ClipboardCheck className="mx-auto mb-3 size-6 text-slate-400" />
                                <p className="text-sm font-semibold text-slate-900">
                                    Belum ada OJT assessment
                                </p>
                            </div>
                        }
                    />

                    <div className="mt-4">
                        <DataTablePagination paginator={assessments} />
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
    value: number;
    icon: typeof ClipboardCheck;
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
