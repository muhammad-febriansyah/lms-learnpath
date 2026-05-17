import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Banknote,
    CheckCircle2,
    Clock,
    Eye,
    Receipt,
} from 'lucide-react';

import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import type { Paginator } from '@/components/data-table/data-table-pagination';
import { IconChevR } from '@/components/learnpath-icons';
import { StatusBadge } from '@/components/status/status-badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Order = {
    id: number;
    order_number: string;
    total: number;
    status: string;
    customer_name: string | null;
    created_at: string;
    paid_at: string | null;
    user: { id: number; name: string; email: string } | null;
    items: Array<{ id: number; name: string }>;
};

type Props = {
    orders: Paginator<Order>;
    filters: { search?: string; status?: string };
    stats: { total: number; pending: number; paid: number; revenue: number };
};

const STATUS_TO_BADGE: Record<string, string> = {
    pending: 'pending_review',
    paid: 'completed',
    expired: 'expired',
    cancelled: 'failed',
    refunded: 'failed',
};

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

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

export default function OrdersIndex({ orders, filters, stats }: Props) {
    const handleFilter = (next: Record<string, string | undefined>) => {
        router.get(
            '/admin/orders',
            { ...filters, ...next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const columns: ColumnDef<Order>[] = [
        {
            id: 'order_number',
            header: 'Nomor',
            cell: ({ row }) => (
                <div>
                    <div className="font-mono text-[12.5px] font-semibold text-slate-900">
                        {row.original.order_number}
                    </div>
                    <div className="text-[11px] text-slate-500">
                        {formatDate(row.original.created_at)}
                    </div>
                </div>
            ),
            meta: { label: 'Nomor' },
        },
        {
            id: 'customer',
            header: 'Peserta',
            cell: ({ row }) => (
                <div>
                    <div className="font-semibold text-slate-900">
                        {row.original.user?.name ??
                            row.original.customer_name ??
                            '-'}
                    </div>
                    <div className="text-[11.5px] text-slate-500">
                        {row.original.user?.email ?? '-'}
                    </div>
                </div>
            ),
            meta: { label: 'Peserta' },
        },
        {
            id: 'items',
            header: 'Item',
            cell: ({ row }) => (
                <div className="max-w-[260px] truncate text-[13px] text-slate-700">
                    {row.original.items.length > 0
                        ? row.original.items.map((i) => i.name).join(', ')
                        : '-'}
                </div>
            ),
            meta: { label: 'Item' },
        },
        {
            id: 'total',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Total" />
            ),
            accessorKey: 'total',
            cell: ({ row }) => (
                <span className="font-semibold text-slate-900 tabular-nums">
                    {formatRupiah(row.original.total)}
                </span>
            ),
            meta: { label: 'Total' },
        },
        {
            id: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <StatusBadge
                    status={
                        STATUS_TO_BADGE[row.original.status] ??
                        row.original.status
                    }
                />
            ),
            meta: { label: 'Status' },
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <Button asChild size="sm" className="h-8 rounded-xl bg-sky-600 text-white shadow-sm hover:bg-sky-700">
                    <Link href={`/admin/orders/${row.original.order_number}`}>
                        <Eye className="mr-1 size-3.5" />
                        Detail
                    </Link>
                </Button>
            ),
            meta: { label: 'Aksi', className: 'w-[80px] text-right' },
            enableSorting: false,
        },
    ];

    return (
        <>
            <Head title="Order" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link
                            href="/admin/dashboard"
                            className="hover:text-slate-700"
                        >
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            Order
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Order
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Riwayat seluruh pesanan course dari peserta.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard
                        label="Total Order"
                        value={stats.total.toLocaleString('id-ID')}
                        icon={Receipt}
                        tint="bg-brand-50"
                        text="text-brand-600"
                    />
                    <StatCard
                        label="Pending"
                        value={stats.pending.toLocaleString('id-ID')}
                        icon={Clock}
                        tint="bg-amber-50"
                        text="text-amber-600"
                    />
                    <StatCard
                        label="Berhasil"
                        value={stats.paid.toLocaleString('id-ID')}
                        icon={CheckCircle2}
                        tint="bg-emerald-50"
                        text="text-emerald-600"
                    />
                    <StatCard
                        label="Total Revenue"
                        value={formatRupiah(stats.revenue)}
                        icon={Banknote}
                        tint="bg-violet-50"
                        text="text-violet-600"
                    />
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4">
                        <h2 className="text-[15px] font-bold text-slate-900">
                            Daftar Order
                        </h2>
                        <p className="mt-0.5 text-[12.5px] text-slate-500">
                            {orders.total} order tercatat
                        </p>
                    </div>

                    <DataTable
                        columns={columns}
                        data={orders.data}
                        searchValue={filters.search ?? ''}
                        searchPlaceholder="Cari nomor, nama, atau email..."
                        onSearchChange={(value) =>
                            handleFilter({ search: value || undefined })
                        }
                        toolbarSlot={
                            <Select
                                value={filters.status ?? 'all'}
                                onValueChange={(v) =>
                                    handleFilter({
                                        status: v === 'all' ? undefined : v,
                                    })
                                }
                            >
                                <SelectTrigger className="h-9 w-[160px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Status
                                    </SelectItem>
                                    <SelectItem value="pending">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="paid">
                                        Berhasil
                                    </SelectItem>
                                    <SelectItem value="expired">
                                        Kedaluwarsa
                                    </SelectItem>
                                    <SelectItem value="cancelled">
                                        Dibatalkan
                                    </SelectItem>
                                    <SelectItem value="refunded">
                                        Refunded
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        }
                        emptyState={
                            <div className="py-12 text-center">
                                <Receipt className="mx-auto mb-3 size-6 text-slate-400" />
                                <p className="text-sm font-semibold text-slate-900">
                                    Belum ada order
                                </p>
                            </div>
                        }
                    />

                    <div className="mt-4">
                        <DataTablePagination paginator={orders} />
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
    value: string;
    icon: typeof Receipt;
    tint: string;
    text: string;
}) {
    return (
        <div className="rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="flex items-center gap-3">
                <div
                    className={`grid size-10 place-items-center rounded-xl ${tint} ${text}`}
                >
                    <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                    <div className="text-[11px] tracking-wider text-slate-500 uppercase">
                        {label}
                    </div>
                    <div className="truncate text-[18px] font-extrabold text-slate-900 tabular-nums">
                        {value}
                    </div>
                </div>
            </div>
        </div>
    );
}
