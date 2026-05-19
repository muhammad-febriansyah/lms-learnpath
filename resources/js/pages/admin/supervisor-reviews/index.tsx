import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Check, Clock, MessageSquare, Plus, Star, X } from 'lucide-react';

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
import { cn } from '@/lib/utils';

type Review = {
    id: number;
    rating: number;
    actual_level: number;
    notes: string | null;
    approval_status: string;
    reviewed_at: string | null;
    user: { id: number; name: string; email: string } | null;
    reviewer: { id: number; name: string } | null;
    competency: { id: number; name: string; category: string | null } | null;
};

type Props = {
    reviews: Paginator<Review>;
    filters: { search?: string; status?: string };
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

export default function SupervisorReviewsIndex({ reviews, filters, stats }: Props) {
    const handleFilter = (next: Record<string, string | undefined>) => {
        router.get(
            '/admin/supervisor-reviews',
            { ...filters, ...next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleStatus = (id: number, status: 'approved' | 'rejected') => {
        router.post(
            `/admin/supervisor-reviews/${id}/status`,
            { approval_status: status, _method: 'patch' },
            { preserveScroll: true },
        );
    };

    const columns: ColumnDef<Review>[] = [
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
                        <Badge className="mt-0.5 border-transparent bg-brand-50 px-1.5 py-0 text-[10.5px] font-semibold text-brand-700">
                            {row.original.competency.category}
                        </Badge>
                    )}
                </div>
            ),
            meta: { label: 'Kompetensi' },
        },
        {
            id: 'rating',
            header: 'Rating',
            cell: ({ row }) => (
                <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                            key={n}
                            className={cn(
                                'size-3.5',
                                n <= row.original.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-200',
                            )}
                        />
                    ))}
                </div>
            ),
            meta: { label: 'Rating' },
        },
        {
            id: 'level',
            header: 'Level',
            cell: ({ row }) => (
                <span className="font-semibold text-slate-900 tabular-nums">
                    {row.original.actual_level}
                </span>
            ),
            meta: { label: 'Level', className: 'w-[80px]' },
        },
        {
            id: 'reviewer',
            header: 'Reviewer',
            cell: ({ row }) => (
                <div className="text-[12.5px] text-slate-700">
                    {row.original.reviewer?.name ?? '-'}
                </div>
            ),
            meta: { label: 'Reviewer' },
        },
        {
            id: 'reviewed_at',
            header: 'Tanggal',
            cell: ({ row }) => (
                <span className="text-[12px] text-slate-600">
                    {formatDate(row.original.reviewed_at)}
                </span>
            ),
            meta: { label: 'Tanggal' },
        },
        {
            id: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge className={STATUS_TONES[row.original.approval_status] ?? ''}>
                    {STATUS_LABELS[row.original.approval_status] ?? row.original.approval_status}
                </Badge>
            ),
            meta: { label: 'Status' },
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) =>
                row.original.approval_status === 'pending_review' ? (
                    <div className="flex items-center justify-end gap-1.5">
                        <Button
                            size="sm"
                            className="h-8 rounded-xl bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                            title="Setujui"
                            onClick={() => handleStatus(row.original.id, 'approved')}
                        >
                            <Check className="mr-1 size-3.5" />
                            Setujui
                        </Button>
                        <Button
                            size="sm"
                            className="h-8 rounded-xl bg-rose-600 text-white shadow-sm hover:bg-rose-700"
                            title="Tolak"
                            onClick={() => handleStatus(row.original.id, 'rejected')}
                        >
                            <X className="mr-1 size-3.5" />
                            Tolak
                        </Button>
                    </div>
                ) : null,
            meta: { label: 'Aksi', className: 'w-[180px] text-right' },
            enableSorting: false,
        },
    ];

    return (
        <>
            <Head title="Supervisor Review" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Supervisor Review</span>
                    </nav>
                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                            Supervisor Review
                        </h1>
                        <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                            <Link href="/admin/supervisor-reviews/create">
                                <Plus className="mr-1.5 size-4" />
                                Review Baru
                            </Link>
                        </Button>
                    </div>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Penilaian kualitatif supervisor terhadap kompetensi bawahannya.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard label="Total" value={stats.total} icon={MessageSquare} tint="bg-brand-50" text="text-brand-600" />
                    <StatCard label="Menunggu" value={stats.pending} icon={Clock} tint="bg-amber-50" text="text-amber-600" />
                    <StatCard label="Disetujui" value={stats.approved} icon={Check} tint="bg-emerald-50" text="text-emerald-600" />
                    <StatCard label="Ditolak" value={stats.rejected} icon={X} tint="bg-rose-50" text="text-rose-600" />
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4">
                        <h2 className="text-[15px] font-bold text-slate-900">Daftar Review</h2>
                        <p className="mt-0.5 text-[12.5px] text-slate-500">{reviews.total} review</p>
                    </div>

                    <DataTable
                        columns={columns}
                        data={reviews.data}
                        searchValue={filters.search ?? ''}
                        searchPlaceholder="Cari nama karyawan..."
                        onSearchChange={(v) => handleFilter({ search: v || undefined })}
                        toolbarSlot={
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
                        }
                        emptyState={
                            <div className="py-12 text-center">
                                <MessageSquare className="mx-auto mb-3 size-6 text-slate-400" />
                                <p className="text-sm font-semibold text-slate-900">
                                    Belum ada review
                                </p>
                            </div>
                        }
                    />

                    <div className="mt-4">
                        <DataTablePagination paginator={reviews} />
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
    icon: typeof MessageSquare;
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
