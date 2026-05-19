import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    CalendarClock,
    Coins,
    FileText,
    Receipt,
    Wallet,
} from 'lucide-react';

import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import type { Paginator } from '@/components/data-table/data-table-pagination';
import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Organization = {
    id: number;
    name: string;
    slug: string;
    industry: string | null;
    seat_quota: number;
    seats_used: number;
    seats_available: number;
    contact_email: string | null;
    billing_address: string | null;
    billing_tax_id: string | null;
};

type Order = {
    id: number;
    order_number: string;
    type: string;
    status: string;
    total: number;
    currency: string;
    created_at: string | null;
    paid_at: string | null;
    description: string;
};

type Stats = {
    total_spent: number;
    paid_count: number;
    pending_count: number;
    last_payment_at: string | null;
};

type Contract = {
    ends_at: string | null;
    days_left: number | null;
    expiring_soon: boolean;
    expired: boolean;
};

type Props = {
    organization: Organization;
    orders: Paginator<Order>;
    stats: Stats;
    contract: Contract;
};

const TYPE_LABEL: Record<string, string> = {
    b2b_seat: 'Paket Seat',
    bundle: 'Bundle',
    course: 'Course',
    learning_path: 'Learning Path',
};

const STATUS_STYLE: Record<string, string> = {
    paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    pending: 'border-amber-200 bg-amber-50 text-amber-700',
    expired: 'border-slate-200 bg-slate-50 text-slate-500',
    cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
};

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

function formatDate(iso: string | null): string {
    if (!iso) {
        return '-';
    }
    return new Date(iso).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function BillingIndex({
    organization,
    orders,
    stats,
    contract,
}: Props) {
    return (
        <>
            <Head title="Tagihan & Invoice" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/business/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            Tagihan & Invoice
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Tagihan & Invoice
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Riwayat transaksi {organization.name}. Download invoice untuk
                        keperluan akuntansi & perpajakan.
                    </p>
                </div>

                {/* Renewal banner */}
                {contract.expired && (
                    <ContractBanner
                        tone="rose"
                        icon={AlertTriangle}
                        title="Kontrak sudah berakhir"
                        message={`Kontrak Anda telah berakhir pada ${formatDate(contract.ends_at)}. Hubungi tim sales untuk perpanjangan.`}
                    />
                )}
                {!contract.expired && contract.expiring_soon && (
                    <ContractBanner
                        tone="amber"
                        icon={CalendarClock}
                        title={`Kontrak akan berakhir dalam ${contract.days_left} hari`}
                        message={`Berakhir pada ${formatDate(contract.ends_at)}. Hubungi sales untuk diskusi perpanjangan.`}
                    />
                )}

                {/* Stat cards */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={Coins}
                        label="Total Pembayaran"
                        value={formatRupiah(stats.total_spent)}
                        tone="brand"
                    />
                    <StatCard
                        icon={Receipt}
                        label="Invoice Lunas"
                        value={String(stats.paid_count)}
                        tone="emerald"
                    />
                    <StatCard
                        icon={CalendarClock}
                        label="Menunggu Bayar"
                        value={String(stats.pending_count)}
                        tone="amber"
                    />
                    <StatCard
                        icon={Wallet}
                        label="Pembayaran Terakhir"
                        value={formatDate(stats.last_payment_at)}
                        tone="violet"
                    />
                </div>

                {/* Orders table */}
                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <h2 className="text-[15px] font-bold text-slate-900">
                        Daftar Transaksi
                    </h2>
                    <p className="mt-0.5 text-[12.5px] text-slate-500">
                        {orders.total} transaksi tercatat
                    </p>

                    {orders.data.length === 0 ? (
                        <div className="mt-6 py-12 text-center">
                            <Receipt className="mx-auto mb-2 size-6 text-slate-300" />
                            <p className="text-sm font-semibold text-slate-900">
                                Belum ada transaksi
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                Transaksi pembelian paket seat akan muncul di sini.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                            <table className="w-full text-[13px]">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        <th className="px-4 py-2.5">Order #</th>
                                        <th className="px-4 py-2.5">Deskripsi</th>
                                        <th className="px-4 py-2.5">Tipe</th>
                                        <th className="px-4 py-2.5">Tanggal</th>
                                        <th className="px-4 py-2.5">Status</th>
                                        <th className="px-4 py-2.5 text-right">Total</th>
                                        <th className="px-4 py-2.5"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.data.map((o) => (
                                        <tr
                                            key={o.id}
                                            className="border-b border-slate-100 transition hover:bg-slate-50"
                                        >
                                            <td className="px-4 py-3 font-mono text-[11.5px] font-semibold text-slate-700">
                                                {o.order_number}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="max-w-[280px] truncate font-semibold text-slate-900">
                                                    {o.description}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant="outline"
                                                    className="font-mono text-[10.5px]"
                                                >
                                                    {TYPE_LABEL[o.type] ?? o.type}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-[11.5px] text-slate-600">
                                                {formatDate(o.paid_at ?? o.created_at)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    className={cn(
                                                        STATUS_STYLE[o.status] ??
                                                            'border-slate-200 bg-slate-50 text-slate-500',
                                                    )}
                                                >
                                                    {o.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-900">
                                                {formatRupiah(o.total)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 rounded-lg text-[11px]"
                                                >
                                                    <Link href={`/business/billing/${o.id}`}>
                                                        Detail
                                                    </Link>
                                                </Button>
                                                {o.status === 'paid' && (
                                                    <Button
                                                        asChild
                                                        size="sm"
                                                        variant="outline"
                                                        className="ml-1.5 h-7 rounded-lg text-[11px]"
                                                    >
                                                        <a
                                                            href={`/business/billing/${o.id}/invoice`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            <FileText className="mr-0.5 size-3" />
                                                            Invoice
                                                        </a>
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="mt-4">
                        <DataTablePagination paginator={orders} />
                    </div>
                </div>
            </div>
        </>
    );
}

function ContractBanner({
    tone,
    icon: Icon,
    title,
    message,
}: {
    tone: 'rose' | 'amber';
    icon: typeof AlertTriangle;
    title: string;
    message: string;
}) {
    const toneClass =
        tone === 'rose'
            ? 'border-rose-200 bg-rose-50 text-rose-900'
            : 'border-amber-200 bg-amber-50 text-amber-900';
    const iconClass =
        tone === 'rose' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white';

    return (
        <div
            className={cn(
                'flex items-start gap-3 rounded-2xl border p-4',
                toneClass,
            )}
        >
            <div
                className={cn(
                    'grid size-9 shrink-0 place-items-center rounded-xl',
                    iconClass,
                )}
            >
                <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-bold">{title}</div>
                <div className="mt-0.5 text-[12px] opacity-90">{message}</div>
            </div>
            <Button
                asChild
                size="sm"
                className={cn(
                    'shrink-0 rounded-xl text-[11.5px] font-bold',
                    tone === 'rose'
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : 'bg-amber-600 hover:bg-amber-700',
                )}
            >
                <a href="mailto:sales@learnpath.id">Hubungi Sales</a>
            </Button>
        </div>
    );
}

type StatTone = 'brand' | 'emerald' | 'amber' | 'violet';

function StatCard({
    icon: Icon,
    label,
    value,
    tone,
}: {
    icon: typeof Coins;
    label: string;
    value: string;
    tone: StatTone;
}) {
    const toneClass: Record<StatTone, string> = {
        brand: 'from-brand-500/10 to-brand-600/15 text-brand-700 ring-brand-200',
        emerald: 'from-emerald-500/10 to-emerald-600/15 text-emerald-700 ring-emerald-200',
        amber: 'from-amber-500/10 to-amber-600/15 text-amber-700 ring-amber-200',
        violet: 'from-brand-500/10 to-brand-600/15 text-brand-700 ring-brand-200',
    };

    return (
        <div
            className={cn(
                'flex items-center gap-3 rounded-2xl bg-gradient-to-br p-4 ring-1',
                toneClass[tone],
            )}
        >
            <div className="grid size-10 place-items-center rounded-xl bg-white/70">
                <Icon className="size-4" />
            </div>
            <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                    {label}
                </div>
                <div className="text-[15px] font-extrabold tabular-nums text-slate-900">
                    {value}
                </div>
            </div>
        </div>
    );
}
