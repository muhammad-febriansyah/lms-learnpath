import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, ClipboardList, Clock, XCircle } from 'lucide-react';

import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import {
    DataTablePagination
    
} from '@/components/data-table/data-table-pagination';
import type {Paginator} from '@/components/data-table/data-table-pagination';
import { IconChevR } from '@/components/learnpath-icons';
import { StatusBadge } from '@/components/status/status-badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Enrollment = {
    id: number;
    status: string;
    progress_percent: number;
    pre_test_status: string;
    post_test_status: string;
    certificate_status: string;
    enrolled_at: string | null;
    completed_at: string | null;
    user: { id: number; name: string; email: string } | null;
    course: { id: number; title: string; slug: string } | null;
};

type Props = {
    enrollments: Paginator<Enrollment>;
    filters: {
        search?: string;
        status?: string;
    };
    stats: {
        total: number;
        active: number;
        completed: number;
        expired: number;
    };
};

function formatDate(value: string | null): string {
    if (!value) {
return '-';
}

    return new Date(value).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function EnrollmentsIndex({ enrollments, filters, stats }: Props) {
    const handleFilter = (next: Record<string, string | undefined>) => {
        router.get(
            '/admin/enrollments',
            { ...filters, ...next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const columns: ColumnDef<Enrollment>[] = [
        {
            id: 'user',
            header: 'Peserta',
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
            meta: { label: 'Peserta' },
        },
        {
            id: 'course',
            header: 'Course',
            cell: ({ row }) => (
                <div className="max-w-[280px] truncate font-medium text-slate-700">
                    {row.original.course?.title ?? '-'}
                </div>
            ),
            meta: { label: 'Course' },
        },
        {
            id: 'progress',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Progress" />
            ),
            accessorKey: 'progress_percent',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700"
                            style={{ width: `${row.original.progress_percent}%` }}
                        />
                    </div>
                    <span className="text-[11.5px] font-semibold text-slate-700 tabular-nums">
                        {row.original.progress_percent}%
                    </span>
                </div>
            ),
            meta: { label: 'Progress' },
        },
        {
            id: 'status',
            header: 'Status',
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
            meta: { label: 'Status' },
        },
        {
            id: 'enrolled_at',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Tanggal Daftar" />
            ),
            accessorKey: 'enrolled_at',
            cell: ({ row }) => (
                <span className="text-[12.5px] text-slate-600">
                    {formatDate(row.original.enrolled_at)}
                </span>
            ),
            meta: { label: 'Tanggal Daftar' },
        },
    ];

    return (
        <>
            <Head title="Enrollment" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Enrollment</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Enrollment
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Daftar pendaftaran peserta pada course.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard
                        label="Total"
                        value={stats.total}
                        icon={ClipboardList}
                        tint="bg-brand-50"
                        text="text-brand-600"
                    />
                    <StatCard
                        label="Aktif"
                        value={stats.active}
                        icon={Clock}
                        tint="bg-amber-50"
                        text="text-amber-600"
                    />
                    <StatCard
                        label="Selesai"
                        value={stats.completed}
                        icon={CheckCircle2}
                        tint="bg-emerald-50"
                        text="text-emerald-600"
                    />
                    <StatCard
                        label="Kedaluwarsa"
                        value={stats.expired}
                        icon={XCircle}
                        tint="bg-slate-100"
                        text="text-slate-600"
                    />
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4">
                        <h2 className="text-[15px] font-bold text-slate-900">
                            Daftar Enrollment
                        </h2>
                        <p className="mt-0.5 text-[12.5px] text-slate-500">
                            {enrollments.total} pendaftaran tercatat
                        </p>
                    </div>

                    <DataTable
                        columns={columns}
                        data={enrollments.data}
                        searchValue={filters.search ?? ''}
                        searchPlaceholder="Cari nama, email, atau judul course..."
                        onSearchChange={(value) =>
                            handleFilter({ search: value || undefined })
                        }
                        toolbarSlot={
                            <Select
                                value={filters.status ?? 'all'}
                                onValueChange={(value) =>
                                    handleFilter({
                                        status: value === 'all' ? undefined : value,
                                    })
                                }
                            >
                                <SelectTrigger className="h-9 w-[160px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="active">Aktif</SelectItem>
                                    <SelectItem value="completed">Selesai</SelectItem>
                                    <SelectItem value="expired">Kedaluwarsa</SelectItem>
                                </SelectContent>
                            </Select>
                        }
                        emptyState={
                            <div className="py-12 text-center">
                                <p className="text-sm font-semibold text-slate-900">
                                    Belum ada enrollment
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Peserta akan muncul di sini setelah mendaftar course.
                                </p>
                            </div>
                        }
                    />

                    <div className="mt-4">
                        <DataTablePagination paginator={enrollments} />
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
    icon: typeof ClipboardList;
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
                    <div className="text-[11px] tracking-wider text-slate-500 uppercase">
                        {label}
                    </div>
                    <div className="text-[20px] font-extrabold text-slate-900 tabular-nums">
                        {value.toLocaleString('id-ID')}
                    </div>
                </div>
            </div>
        </div>
    );
}
