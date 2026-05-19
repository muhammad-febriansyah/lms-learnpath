import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Banknote,
    CheckCircle2,
    Clock,
    CreditCard,
    Eye,
} from 'lucide-react';

import { DataTable } from '@/components/data-table/data-table';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import type { Paginator } from '@/components/data-table/data-table-pagination';
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

type Payment = {
    id: number;
    gateway: string;
    payment_method: string | null;
    payment_number: string | null;
    amount: number;
    fee: number;
    status: string;
    completed_at: string | null;
    created_at: string;
    order: {
        id: number;
        order_number: string;
        total: number;
        user: { id: number; name: string; email: string } | null;
    } | null;
};

type Props = {
    payments: Paginator<Payment>;
    filters: { search?: string; gateway?: string; status?: string };
    stats: {
        total: number;
        completed: number;
        pending: number;
        total_received: number;
    };
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

const STATUS_TONES: Record<string, string> = {
    completed: 'border-transparent bg-emerald-50 text-emerald-700',
    pending: 'border-transparent bg-amber-50 text-amber-700',
    expired: 'border-transparent bg-slate-100 text-slate-600',
    cancelled: 'border-transparent bg-slate-100 text-slate-600',
    failed: 'border-transparent bg-red-50 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
    completed: 'Berhasil',
    pending: 'Menunggu',
    expired: 'Kedaluwarsa',
    cancelled: 'Dibatalkan',
    failed: 'Gagal',
};

export default function PaymentsIndex({ payments, filters, stats }: Props) {
    const handleFilter = (next: Record<string, string | undefined>) => {
        router.get(
            '/admin/payments',
            { ...filters, ...next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const columns: ColumnDef<Payment>[] = [
        {
            id: 'order',
            header: 'Order',
            cell: ({ row }) => (
                <div>
                    <Link
                        href={`/admin/orders/${row.original.order?.order_number}`}
                        className="font-mono text-[12.5px] font-semibold text-brand-700 hover:underline"
                    >
                        {row.original.order?.order_number ?? '-'}
                    </Link>
                    <div className="text-[11px] text-slate-500">
                        {row.original.order?.user?.name ?? '-'}
                    </div>
                </div>
            ),
            meta: { label: 'Order' },
        },
        {
            id: 'gateway',
            header: 'Gateway',
            cell: ({ row }) => (
                <div>
                    <Badge className="border-transparent bg-brand-50 text-brand-700">
                        {row.original.gateway.toUpperCase()}
                    </Badge>
                    <div className="mt-1 text-[11.5px] text-slate-500">
                        {row.original.payment_method ?? '-'}
                    </div>
                </div>
            ),
            meta: { label: 'Gateway' },
        },
        {
            id: 'amount',
            header: 'Jumlah',
            cell: ({ row }) => (
                <div>
                    <div className="font-semibold text-slate-900 tabular-nums">
                        {formatRupiah(row.original.amount)}
                    </div>
                    {row.original.fee > 0 && (
                        <div className="text-[11px] text-slate-500">
                            Fee {formatRupiah(row.original.fee)}
                        </div>
                    )}
                </div>
            ),
            meta: { label: 'Jumlah' },
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
            id: 'completed_at',
            header: 'Selesai',
            cell: ({ row }) => (
                <span className="text-[12.5px] text-slate-600">
                    {formatDate(row.original.completed_at)}
                </span>
            ),
            meta: { label: 'Selesai' },
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <Button asChild size="sm" className="h-8 rounded-xl bg-sky-600 text-white shadow-sm hover:bg-sky-700">
                    <Link
                        href={`/admin/orders/${row.original.order?.order_number}`}
                    >
                        <Eye className="mr-1 size-3.5" />
                        Detail
                    </Link>
                </Button>
            ),
            meta: { label: 'Aksi', className: 'w-[100px] text-right' },
            enableSorting: false,
        },
    ];

    return (
        <>
            <Head title="Payment" />
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
                            Payment
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Payment
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Riwayat transaksi pembayaran melalui gateway.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard
                        label="Total Payment"
                        value={stats.total.toLocaleString('id-ID')}
                        icon={CreditCard}
                        tint="bg-brand-50"
                        text="text-brand-600"
                    />
                    <StatCard
                        label="Berhasil"
                        value={stats.completed.toLocaleString('id-ID')}
                        icon={CheckCircle2}
                        tint="bg-emerald-50"
                        text="text-emerald-600"
                    />
                    <StatCard
                        label="Menunggu"
                        value={stats.pending.toLocaleString('id-ID')}
                        icon={Clock}
                        tint="bg-amber-50"
                        text="text-amber-600"
                    />
                    <StatCard
                        label="Total Diterima"
                        value={formatRupiah(stats.total_received)}
                        icon={Banknote}
                        tint="bg-brand-50"
                        text="text-brand-600"
                    />
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4">
                        <h2 className="text-[15px] font-bold text-slate-900">
                            Daftar Payment
                        </h2>
                        <p className="mt-0.5 text-[12.5px] text-slate-500">
                            {payments.total} transaksi
                        </p>
                    </div>

                    <DataTable
                        columns={columns}
                        data={payments.data}
                        searchValue={filters.search ?? ''}
                        searchPlaceholder="Cari nomor order atau nama..."
                        onSearchChange={(v) =>
                            handleFilter({ search: v || undefined })
                        }
                        toolbarSlot={
                            <>
                                <Select
                                    value={filters.gateway ?? 'all'}
                                    onValueChange={(v) =>
                                        handleFilter({
                                            gateway:
                                                v === 'all' ? undefined : v,
                                        })
                                    }
                                >
                                    <SelectTrigger className="h-9 w-[140px]">
                                        <SelectValue placeholder="Gateway" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua Gateway
                                        </SelectItem>
                                        <SelectItem value="pakasir">
                                            Pakasir
                                        </SelectItem>
                                        <SelectItem value="manual_b2b">
                                            Manual B2B
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filters.status ?? 'all'}
                                    onValueChange={(v) =>
                                        handleFilter({
                                            status: v === 'all' ? undefined : v,
                                        })
                                    }
                                >
                                    <SelectTrigger className="h-9 w-[140px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua Status
                                        </SelectItem>
                                        <SelectItem value="completed">
                                            Berhasil
                                        </SelectItem>
                                        <SelectItem value="pending">
                                            Menunggu
                                        </SelectItem>
                                        <SelectItem value="expired">
                                            Kedaluwarsa
                                        </SelectItem>
                                        <SelectItem value="failed">
                                            Gagal
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </>
                        }
                        emptyState={
                            <div className="py-12 text-center">
                                <CreditCard className="mx-auto mb-3 size-6 text-slate-400" />
                                <p className="text-sm font-semibold text-slate-900">
                                    Belum ada transaksi
                                </p>
                            </div>
                        }
                    />

                    <div className="mt-4">
                        <DataTablePagination paginator={payments} />
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
    icon: typeof CreditCard;
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
