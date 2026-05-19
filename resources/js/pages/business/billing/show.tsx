import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, Receipt } from 'lucide-react';

import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Org = { id: number; name: string };

type Item = {
    id: number;
    name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
};

type Payment = {
    id: number;
    amount: number;
    method: string | null;
    status: string;
    paid_at: string | null;
};

type Order = {
    id: number;
    order_number: string;
    type: string;
    status: string;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    currency: string;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    created_at: string | null;
    paid_at: string | null;
    expires_at: string | null;
    items: Item[];
    payments: Payment[];
    requested_by: { id: number; name: string; email: string } | null;
};

type Props = {
    organization: Org;
    order: Order;
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

function formatDateTime(iso: string | null): string {
    if (!iso) {
        return '-';
    }
    return new Date(iso).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatLabel(value: string | null): string {
    if (!value) {
        return '-';
    }

    return value.replaceAll('_', ' ');
}

export default function BillingShow({ order }: Props) {
    return (
        <>
            <Head title={`Order ${order.order_number}`} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link
                            href="/business/billing"
                            className="hover:text-slate-700"
                        >
                            Tagihan
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-mono font-semibold text-slate-900">
                            {order.order_number}
                        </span>
                    </nav>
                </div>

                <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                    <div className="space-y-4">
                        {/* Header card */}
                        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-700">
                                        <Receipt className="size-3" />
                                        Order {formatLabel(order.type)}
                                    </div>
                                    <h2 className="mt-2 font-mono text-xl font-extrabold tracking-wide text-slate-900">
                                        {order.order_number}
                                    </h2>
                                    <p className="mt-1 text-[12.5px] text-slate-500">
                                        Dibuat {formatDateTime(order.created_at)}
                                    </p>
                                </div>
                                <Badge
                                    className={cn(
                                        'text-[11px] font-bold uppercase',
                                        STATUS_STYLE[order.status] ??
                                            'border-slate-200 bg-slate-50 text-slate-500',
                                    )}
                                >
                                    {order.status}
                                </Badge>
                            </div>

                            {order.status === 'paid' && order.paid_at && (
                                <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-[12.5px] text-emerald-800 ring-1 ring-emerald-200">
                                    Lunas pada {formatDateTime(order.paid_at)}
                                </div>
                            )}
                        </div>

                        {/* Items */}
                        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                            <h3 className="text-[14px] font-bold text-slate-900">
                                Detail Item
                            </h3>
                            <ul className="mt-3 divide-y divide-slate-100">
                                {order.items.map((item) => (
                                    <li
                                        key={item.id}
                                        className="flex items-center gap-3 py-3 text-[13px]"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="font-semibold text-slate-900">
                                                {item.name}
                                            </div>
                                            <div className="text-[11.5px] text-slate-500">
                                                {item.quantity}x ·{' '}
                                                {formatRupiah(item.unit_price)}
                                            </div>
                                        </div>
                                        <div className="shrink-0 text-right font-semibold tabular-nums text-slate-900">
                                            {formatRupiah(item.subtotal)}
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-[13px]">
                                <Row label="Subtotal" value={formatRupiah(order.subtotal)} />
                                {order.discount > 0 && (
                                    <Row
                                        label="Diskon"
                                        value={`-${formatRupiah(order.discount)}`}
                                        tone="emerald"
                                    />
                                )}
                                {order.tax > 0 && (
                                    <Row label="Pajak" value={formatRupiah(order.tax)} />
                                )}
                                <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-3">
                                    <span className="text-[14px] font-bold text-slate-900">
                                        Total
                                    </span>
                                    <span className="text-[18px] font-extrabold tabular-nums text-brand-700">
                                        {formatRupiah(order.total)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Payments */}
                        {order.payments.length > 0 && (
                            <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                                <h3 className="text-[14px] font-bold text-slate-900">
                                    Riwayat Pembayaran
                                </h3>
                                <ul className="mt-3 divide-y divide-slate-100">
                                    {order.payments.map((p) => (
                                        <li
                                            key={p.id}
                                            className="flex items-center justify-between py-3 text-[13px]"
                                        >
                                            <div>
                                                <div className="font-semibold text-slate-900">
                                                    {formatLabel(p.method)}
                                                </div>
                                                <div className="text-[11px] text-slate-500">
                                                    {formatDateTime(p.paid_at)}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge
                                                    className={cn(
                                                        'text-[10.5px]',
                                                        STATUS_STYLE[p.status] ??
                                                            'border-slate-200 bg-slate-50 text-slate-500',
                                                    )}
                                                >
                                                    {p.status}
                                                </Badge>
                                                <span className="font-semibold tabular-nums text-slate-900">
                                                    {formatRupiah(p.amount)}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-3">
                        {order.status === 'paid' && (
                            <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                                <h3 className="text-[13.5px] font-bold text-slate-900">
                                    Invoice
                                </h3>
                                <p className="mt-1 text-[11.5px] text-slate-500">
                                    Untuk keperluan akuntansi & pajak.
                                </p>
                                <Button
                                    asChild
                                    className="mt-3 w-full rounded-xl bg-brand-600 hover:bg-brand-700"
                                >
                                    <a
                                        href={`/business/billing/${order.id}/invoice`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <FileText className="mr-1.5 size-4" />
                                        Lihat / Print Invoice
                                    </a>
                                </Button>
                            </div>
                        )}

                        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                            <h3 className="text-[13.5px] font-bold text-slate-900">
                                Data Pemesan
                            </h3>
                            <dl className="mt-3 space-y-2 text-[12px]">
                                <DetailRow
                                    label="Nama"
                                    value={order.customer_name ?? '-'}
                                />
                                <DetailRow
                                    label="Email"
                                    value={order.customer_email ?? '-'}
                                />
                                {order.customer_phone && (
                                    <DetailRow
                                        label="Telepon"
                                        value={order.customer_phone}
                                    />
                                )}
                                {order.requested_by && (
                                    <DetailRow
                                        label="Diminta oleh"
                                        value={order.requested_by.name}
                                    />
                                )}
                            </dl>
                        </div>

                        <Button asChild variant="outline" className="w-full">
                            <Link href="/business/billing">
                                <ArrowLeft className="mr-1.5 size-4" />
                                Kembali
                            </Link>
                        </Button>
                    </aside>
                </div>
            </div>
        </>
    );
}

function Row({
    label,
    value,
    tone,
}: {
    label: string;
    value: string;
    tone?: 'emerald';
}) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-slate-500">{label}</span>
            <span
                className={cn(
                    'font-semibold tabular-nums',
                    tone === 'emerald' ? 'text-emerald-600' : 'text-slate-900',
                )}
            >
                {value}
            </span>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-baseline justify-between gap-2">
            <dt className="text-slate-500">{label}</dt>
            <dd className="text-right font-semibold text-slate-900">{value}</dd>
        </div>
    );
}
