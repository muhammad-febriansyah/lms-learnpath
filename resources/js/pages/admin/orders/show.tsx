import { Head, Link, router } from '@inertiajs/react';
import { Ban, CreditCard, Receipt } from 'lucide-react';
import { useState } from 'react';

import { IconChevR } from '@/components/learnpath-icons';
import { StatusBadge } from '@/components/status/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Payment = {
    id: number;
    gateway: string;
    payment_method: string | null;
    payment_number: string | null;
    amount: number;
    fee: number;
    total_payment: number;
    status: string;
    expired_at: string | null;
    completed_at: string | null;
    created_at: string;
};

type OrderItem = {
    id: number;
    name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
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
    expires_at: string | null;
    paid_at: string | null;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
    } | null;
    items: OrderItem[];
    payments: Payment[];
};

type Props = {
    order: Order;
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

function formatDateTime(value: string | null): string {
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

export default function AdminOrderShow({ order }: Props) {
    const [cancelOpen, setCancelOpen] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const performCancel = () => {
        setCancelling(true);
        router.post(
            `/admin/orders/${order.order_number}/cancel`,
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setCancelling(false);
                    setCancelOpen(false);
                },
            },
        );
    };

    return (
        <>
            <Head title={`Order ${order.order_number}`} />
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
                        <Link
                            href="/admin/orders"
                            className="hover:text-slate-700"
                        >
                            Order
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-mono font-semibold text-slate-900">
                            {order.order_number}
                        </span>
                    </nav>
                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
                        <h1 className="inline-flex items-center gap-3 text-2xl font-extrabold tracking-tight text-slate-900">
                            Detail Order
                            <StatusBadge
                                status={
                                    STATUS_TO_BADGE[order.status] ??
                                    order.status
                                }
                            />
                        </h1>
                        {order.status === 'pending' && (
                            <Button
                                variant="outline"
                                onClick={() => setCancelOpen(true)}
                                className="rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            >
                                <Ban className="mr-1.5 size-4" />
                                Batalkan Order
                            </Button>
                        )}
                    </div>
                    <p className="mt-1 text-[12.5px] text-slate-500">
                        Dibuat {formatDateTime(order.created_at)}
                    </p>
                </div>

                <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                    <div className="space-y-5">
                        <Card
                            title="Item Pesanan"
                            icon={<Receipt className="size-4" />}
                        >
                            <ul className="divide-y divide-slate-100">
                                {order.items.map((it) => (
                                    <li
                                        key={it.id}
                                        className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                                    >
                                        <div>
                                            <div className="text-[13.5px] font-semibold text-slate-900">
                                                {it.name}
                                            </div>
                                            <div className="text-[11.5px] text-slate-500">
                                                {it.quantity}× ·{' '}
                                                {formatRupiah(it.unit_price)}
                                            </div>
                                        </div>
                                        <div className="font-semibold text-slate-900 tabular-nums">
                                            {formatRupiah(it.subtotal)}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        <Card
                            title="Riwayat Pembayaran"
                            icon={<CreditCard className="size-4" />}
                        >
                            {order.payments.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">
                                    Belum ada attempt pembayaran.
                                </p>
                            ) : (
                                <ul className="space-y-2">
                                    {order.payments.map((p) => (
                                        <li
                                            key={p.id}
                                            className="rounded-xl bg-slate-50/60 p-3"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <div className="text-[12.5px] font-semibold text-slate-900">
                                                        {p.gateway.toUpperCase()}{' '}
                                                        ·{' '}
                                                        {p.payment_method ??
                                                            '-'}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500">
                                                        {formatDateTime(
                                                            p.created_at,
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-900 tabular-nums">
                                                        {formatRupiah(p.amount)}
                                                    </span>
                                                    <Badge
                                                        className={
                                                            p.status ===
                                                            'completed'
                                                                ? 'border-transparent bg-emerald-50 text-emerald-700'
                                                                : 'border-transparent bg-amber-50 text-amber-700'
                                                        }
                                                    >
                                                        {p.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                            {p.payment_number && (
                                                <div className="mt-2 rounded-lg bg-white px-3 py-2 font-mono text-[12px] text-slate-700">
                                                    {p.payment_number}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>
                    </div>

                    <aside className="space-y-4">
                        <Card title="Ringkasan">
                            <dl className="space-y-2 text-[13px]">
                                <Row
                                    label="Subtotal"
                                    value={formatRupiah(order.subtotal)}
                                />
                                <Row
                                    label="Diskon"
                                    value={`- ${formatRupiah(order.discount)}`}
                                />
                                <Row
                                    label="PPN"
                                    value={formatRupiah(order.tax)}
                                />
                                <div className="border-t border-slate-100 pt-2">
                                    <Row
                                        label="Total"
                                        value={formatRupiah(order.total)}
                                        emphasis
                                    />
                                </div>
                            </dl>
                        </Card>

                        <Card title="Data Pemesan">
                            <dl className="space-y-2 text-[12.5px]">
                                <Field
                                    label="Nama"
                                    value={
                                        order.user?.name ??
                                        order.customer_name ??
                                        '-'
                                    }
                                />
                                <Field
                                    label="Email"
                                    value={
                                        order.user?.email ??
                                        order.customer_email ??
                                        '-'
                                    }
                                />
                                <Field
                                    label="Telepon"
                                    value={
                                        order.user?.phone ??
                                        order.customer_phone ??
                                        '-'
                                    }
                                />
                            </dl>
                        </Card>

                        <Card title="Tanggal Penting">
                            <dl className="space-y-2 text-[12.5px]">
                                <Field
                                    label="Dibuat"
                                    value={formatDateTime(order.created_at)}
                                />
                                <Field
                                    label="Kedaluwarsa"
                                    value={formatDateTime(order.expires_at)}
                                />
                                <Field
                                    label="Dibayar"
                                    value={formatDateTime(order.paid_at)}
                                />
                            </dl>
                        </Card>
                    </aside>
                </div>
            </div>

            <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Batalkan order?</DialogTitle>
                        <DialogDescription>
                            Order{' '}
                            <span className="font-mono font-semibold">
                                {order.order_number}
                            </span>{' '}
                            akan ditandai sebagai dibatalkan dan tidak bisa
                            dibayar lagi.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCancelOpen(false)}
                        >
                            Tutup
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={performCancel}
                            disabled={cancelling}
                        >
                            {cancelling ? 'Memproses...' : 'Batalkan Order'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function Card({
    title,
    icon,
    children,
}: {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <h2 className="mb-3 inline-flex items-center gap-2 text-[15px] font-bold text-slate-900">
                {icon}
                {title}
            </h2>
            <div>{children}</div>
        </div>
    );
}

function Row({
    label,
    value,
    emphasis,
}: {
    label: string;
    value: string;
    emphasis?: boolean;
}) {
    return (
        <div className="flex justify-between">
            <dt
                className={
                    emphasis ? 'font-semibold text-slate-900' : 'text-slate-600'
                }
            >
                {label}
            </dt>
            <dd
                className={
                    emphasis
                        ? 'text-[16px] font-extrabold text-slate-900 tabular-nums'
                        : 'text-slate-900 tabular-nums'
                }
            >
                {value}
            </dd>
        </div>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-slate-500">{label}</dt>
            <dd className="font-medium text-slate-900">{value}</dd>
        </div>
    );
}
