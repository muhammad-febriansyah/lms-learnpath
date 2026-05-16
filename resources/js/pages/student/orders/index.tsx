import { Head, Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { ChevronRight, Receipt } from 'lucide-react';

import { DataTable } from '@/components/data-table/data-table';
import {
    DataTablePagination
    
} from '@/components/data-table/data-table-pagination';
import type {Paginator} from '@/components/data-table/data-table-pagination';
import { IconChevR } from '@/components/learnpath-icons';
import { StatusBadge } from '@/components/status/status-badge';
import { Button } from '@/components/ui/button';

type OrderItem = {
    id: number;
    name: string;
    quantity: number;
    subtotal: number;
};

type Order = {
    id: number;
    order_number: string;
    total: number;
    status: string;
    created_at: string;
    paid_at: string | null;
    expires_at: string | null;
    items: OrderItem[];
};

type Props = {
    orders: Paginator<Order>;
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

    return new Date(value).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function OrdersIndex({ orders }: Props) {
    const columns: ColumnDef<Order>[] = [
        {
            id: 'order_number',
            header: 'Nomor Pesanan',
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
            meta: { label: 'Nomor Pesanan' },
        },
        {
            id: 'items',
            header: 'Item',
            cell: ({ row }) => (
                <div className="max-w-[300px]">
                    {row.original.items.slice(0, 2).map((it) => (
                        <div key={it.id} className="truncate text-[13px] text-slate-700">
                            {it.name}
                        </div>
                    ))}
                    {row.original.items.length > 2 && (
                        <div className="text-[11px] text-slate-400">
                            + {row.original.items.length - 2} lainnya
                        </div>
                    )}
                </div>
            ),
            meta: { label: 'Item' },
        },
        {
            id: 'total',
            header: 'Total',
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
            cell: ({ row }) => {
                const map: Record<string, string> = {
                    paid: 'completed',
                    pending: 'pending_review',
                    expired: 'expired',
                    cancelled: 'failed',
                    refunded: 'failed',
                };

                return <StatusBadge status={map[row.original.status] ?? row.original.status} />;
            },
            meta: { label: 'Status' },
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <Button asChild size="sm" variant="ghost" className="h-8">
                    <Link href={`/orders/${row.original.order_number}`}>
                        Detail
                        <ChevronRight className="ml-1 size-3.5" />
                    </Link>
                </Button>
            ),
            meta: { label: 'Aksi', className: 'w-[80px] text-right' },
            enableSorting: false,
        },
    ];

    return (
        <>
            <Head title="Pesanan Saya" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Pesanan Saya</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Pesanan Saya
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Riwayat semua pesanan kursus dan status pembayarannya.
                    </p>
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <DataTable
                        columns={columns}
                        data={orders.data}
                        showColumnToggle={false}
                        emptyState={
                            <div className="py-12 text-center">
                                <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                                    <Receipt className="size-5" />
                                </div>
                                <p className="text-sm font-semibold text-slate-900">
                                    Belum ada pesanan
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Jelajahi katalog kursus untuk mulai belajar.
                                </p>
                                <Button
                                    asChild
                                    className="mt-3 rounded-xl bg-brand-600 hover:bg-brand-700"
                                >
                                    <Link href="/courses">Lihat Katalog</Link>
                                </Button>
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
