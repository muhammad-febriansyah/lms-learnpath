import { Head, Link, router } from '@inertiajs/react';
import {
    Ban,
    Calendar,
    CalendarClock,
    CheckCircle2,
    Copy,
    CreditCard,
    Hash,
    Mail,
    Phone,
    Receipt,
    ShoppingBag,
    Sparkles,
    User,
    Wallet,
} from 'lucide-react';
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
import { cn } from '@/lib/utils';

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

const PAYMENT_STATUS_TONE: Record<string, string> = {
    completed: 'border-transparent bg-emerald-50 text-emerald-700 ',
    pending: 'border-transparent bg-amber-50 text-amber-700 ',
    failed: 'border-transparent bg-rose-50 text-rose-700 ',
    expired: 'border-transparent bg-slate-100 text-slate-600 ',
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

function getInitials(name: string | null | undefined): string {
    if (!name) {
        return '?';
    }
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? '')
        .join('');
}

export default function AdminOrderShow({ order }: Props) {
    const [cancelOpen, setCancelOpen] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

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

    const copyToClipboard = async (text: string, key: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedKey(key);
            window.setTimeout(() => setCopiedKey(null), 1500);
        } catch {
            // ignore
        }
    };

    const customerName = order.user?.name ?? order.customer_name ?? '-';
    const customerEmail = order.user?.email ?? order.customer_email ?? null;
    const customerPhone = order.user?.phone ?? order.customer_phone ?? null;
    const totalItems = order.items.reduce((acc, it) => acc + it.quantity, 0);
    const lastPayment = order.payments[0];
    const isPaid = order.status === 'paid';
    const canCancel = order.status === 'pending';

    return (
        <>
            <Head title={`Order ${order.order_number}`} />
            <div className="space-y-6">
                <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500 ">
                    <Link
                        href="/admin/dashboard"
                        className="transition hover:text-slate-700 "
                    >
                        Dashboard
                    </Link>
                    <IconChevR size={12} className="text-slate-300" />
                    <Link
                        href="/admin/orders"
                        className="transition hover:text-slate-700 "
                    >
                        Order
                    </Link>
                    <IconChevR size={12} className="text-slate-300" />
                    <span className="font-mono font-semibold text-slate-900 ">
                        {order.order_number}
                    </span>
                </nav>

                {/* Hero */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950 p-6 text-white shadow-[0_10px_40px_-20px_rgba(15,23,42,0.5)] sm:p-8 ">
                    <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-brand-500/20 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-brand-500/10 blur-3xl" />

                    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase ring-1 ring-white/15 backdrop-blur">
                                    <Sparkles className="size-3" />
                                    Detail Order
                                </span>
                                <StatusBadge
                                    status={
                                        STATUS_TO_BADGE[order.status] ??
                                        order.status
                                    }
                                />
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <h1 className="font-mono text-2xl font-extrabold tracking-tight break-all sm:text-3xl">
                                    {order.order_number}
                                </h1>
                                <button
                                    type="button"
                                    onClick={() =>
                                        copyToClipboard(
                                            order.order_number,
                                            'order',
                                        )
                                    }
                                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11.5px] font-medium ring-1 ring-white/15 backdrop-blur transition hover:bg-white/20"
                                >
                                    {copiedKey === 'order' ? (
                                        <>
                                            <CheckCircle2 className="size-3.5 text-emerald-300" />
                                            Tersalin
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="size-3.5" />
                                            Salin
                                        </>
                                    )}
                                </button>
                            </div>

                            <p className="mt-2 flex items-center gap-1.5 text-[12.5px] text-white/60">
                                <CalendarClock className="size-3.5" />
                                Dibuat {formatDateTime(order.created_at)}
                            </p>

                            {/* Quick stats */}
                            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <QuickStat
                                    icon={<Wallet className="size-4" />}
                                    label="Total"
                                    value={formatRupiah(order.total)}
                                    emphasis
                                />
                                <QuickStat
                                    icon={<ShoppingBag className="size-4" />}
                                    label="Item"
                                    value={`${totalItems} item`}
                                />
                                <QuickStat
                                    icon={<CreditCard className="size-4" />}
                                    label="Pembayaran"
                                    value={
                                        lastPayment
                                            ? lastPayment.gateway.toUpperCase()
                                            : 'Belum ada'
                                    }
                                />
                                <QuickStat
                                    icon={<Calendar className="size-4" />}
                                    label={isPaid ? 'Dibayar' : 'Kedaluwarsa'}
                                    value={
                                        isPaid
                                            ? formatDateTime(order.paid_at)
                                            : formatDateTime(order.expires_at)
                                    }
                                />
                            </div>
                        </div>

                        {canCancel && (
                            <div className="flex shrink-0 items-start">
                                <Button
                                    variant="outline"
                                    onClick={() => setCancelOpen(true)}
                                    className="rounded-xl border-rose-300/30 bg-rose-500/10 text-rose-100 ring-1 ring-rose-300/20 backdrop-blur transition hover:bg-rose-500/20 hover:text-white"
                                >
                                    <Ban className="mr-1.5 size-4" />
                                    Batalkan Order
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                    {/* Main column */}
                    <div className="min-w-0 space-y-5">
                        <Card
                            title="Item Pesanan"
                            icon={<Receipt className="size-4" />}
                            badge={`${order.items.length} produk`}
                        >
                            <ul className="divide-y divide-slate-100 ">
                                {order.items.map((it) => (
                                    <li
                                        key={it.id}
                                        className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                                    >
                                        <div className="flex min-w-0 items-start gap-3">
                                            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-50 text-brand-600 ring-1 ring-brand-100 ">
                                                <ShoppingBag className="size-4" />
                                            </span>
                                            <div className="min-w-0">
                                                <div className="text-[13.5px] font-semibold break-words text-slate-900 ">
                                                    {it.name}
                                                </div>
                                                <div className="mt-0.5 text-[11.5px] text-slate-500 ">
                                                    {it.quantity}× ·{' '}
                                                    {formatRupiah(it.unit_price)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <div className="text-[13.5px] font-bold text-slate-900 tabular-nums ">
                                                {formatRupiah(it.subtotal)}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        <Card
                            title="Riwayat Pembayaran"
                            icon={<CreditCard className="size-4" />}
                            badge={
                                order.payments.length > 0
                                    ? `${order.payments.length} attempt`
                                    : undefined
                            }
                        >
                            {order.payments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 py-10 text-center ">
                                    <div className="grid size-10 place-items-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 ">
                                        <CreditCard className="size-4 text-slate-400" />
                                    </div>
                                    <p className="text-sm text-slate-500 ">
                                        Belum ada attempt pembayaran.
                                    </p>
                                </div>
                            ) : (
                                <ol className="relative space-y-3 before:absolute before:top-3 before:bottom-3 before:left-[15px] before:w-px before:bg-slate-200 ">
                                    {order.payments.map((p) => (
                                        <li
                                            key={p.id}
                                            className="relative pl-9"
                                        >
                                            <span
                                                className={cn(
                                                    'absolute top-3 left-0 grid size-8 place-items-center rounded-full ring-4 ring-white ',
                                                    p.status === 'completed'
                                                        ? 'bg-emerald-100 text-emerald-700 '
                                                        : p.status === 'failed'
                                                          ? 'bg-rose-100 text-rose-700 '
                                                          : 'bg-amber-100 text-amber-700 ',
                                                )}
                                            >
                                                {p.status === 'completed' ? (
                                                    <CheckCircle2 className="size-4" />
                                                ) : (
                                                    <CreditCard className="size-4" />
                                                )}
                                            </span>
                                            <div className="rounded-xl bg-slate-50/70 p-3.5 ring-1 ring-slate-100 transition hover:bg-slate-50 ">
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="text-[12.5px] font-bold text-slate-900 ">
                                                                {p.gateway.toUpperCase()}
                                                            </span>
                                                            {p.payment_method && (
                                                                <span className="rounded-md bg-white px-1.5 py-0.5 font-mono text-[10.5px] text-slate-600 ring-1 ring-slate-200 ">
                                                                    {
                                                                        p.payment_method
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="mt-0.5 text-[11px] text-slate-500 ">
                                                            {formatDateTime(
                                                                p.created_at,
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-2">
                                                        <span className="text-[13px] font-bold text-slate-900 tabular-nums ">
                                                            {formatRupiah(
                                                                p.amount,
                                                            )}
                                                        </span>
                                                        <Badge
                                                            className={
                                                                PAYMENT_STATUS_TONE[
                                                                    p.status
                                                                ] ??
                                                                'border-transparent bg-slate-100 text-slate-600 '
                                                            }
                                                        >
                                                            {p.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                {p.payment_number && (
                                                    <div className="mt-3 flex items-stretch gap-2">
                                                        <div className="min-w-0 flex-1 rounded-lg bg-white px-3 py-2 font-mono text-[11.5px] break-all text-slate-700 ring-1 ring-slate-200 ">
                                                            {p.payment_number}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                copyToClipboard(
                                                                    p.payment_number!,
                                                                    `pay-${p.id}`,
                                                                )
                                                            }
                                                            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-white px-2 ring-1 ring-slate-200 transition hover:bg-slate-50 "
                                                            aria-label="Salin nomor pembayaran"
                                                        >
                                                            {copiedKey ===
                                                            `pay-${p.id}` ? (
                                                                <CheckCircle2 className="size-3.5 text-emerald-600" />
                                                            ) : (
                                                                <Copy className="size-3.5 text-slate-500" />
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-5">
                        <Card
                            title="Ringkasan"
                            icon={<Receipt className="size-4" />}
                        >
                            <dl className="space-y-2.5 text-[13px]">
                                <Row
                                    label="Subtotal"
                                    value={formatRupiah(order.subtotal)}
                                />
                                {order.discount > 0 && (
                                    <Row
                                        label="Diskon"
                                        value={`− ${formatRupiah(order.discount)}`}
                                        valueClass="text-emerald-600 "
                                    />
                                )}
                                <Row
                                    label="PPN"
                                    value={formatRupiah(order.tax)}
                                />
                                <div className="mt-3 rounded-xl bg-gradient-to-br from-brand-50 to-brand-50 p-3 ring-1 ring-brand-100 ">
                                    <div className="flex items-center justify-between">
                                        <dt className="text-[12px] font-semibold tracking-wider text-brand-700 uppercase ">
                                            Total
                                        </dt>
                                        <dd className="text-[18px] font-extrabold text-brand-900 tabular-nums ">
                                            {formatRupiah(order.total)}
                                        </dd>
                                    </div>
                                </div>
                            </dl>
                        </Card>

                        <Card
                            title="Data Pemesan"
                            icon={<User className="size-4" />}
                        >
                            <div className="flex items-center gap-3 rounded-xl bg-slate-50/70 p-3 ring-1 ring-slate-100 ">
                                <div className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-[13px] font-bold text-white shadow-sm">
                                    {getInitials(customerName)}
                                </div>
                                <div className="min-w-0">
                                    <div className="truncate text-[13.5px] font-bold text-slate-900 ">
                                        {customerName}
                                    </div>
                                    <div className="text-[11px] text-slate-500 ">
                                        {order.user
                                            ? 'Pengguna terdaftar'
                                            : 'Tamu'}
                                    </div>
                                </div>
                            </div>

                            <dl className="mt-3 space-y-2.5 text-[12.5px]">
                                <ContactRow
                                    icon={<Mail className="size-3.5" />}
                                    label="Email"
                                    value={customerEmail}
                                />
                                <ContactRow
                                    icon={<Phone className="size-3.5" />}
                                    label="Telepon"
                                    value={customerPhone}
                                />
                                <ContactRow
                                    icon={<Hash className="size-3.5" />}
                                    label="Tipe"
                                    value={order.type}
                                />
                            </dl>
                        </Card>

                        <Card
                            title="Tanggal Penting"
                            icon={<CalendarClock className="size-4" />}
                        >
                            <ol className="relative space-y-3 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-px before:bg-slate-200 ">
                                <Timeline
                                    label="Dibuat"
                                    value={formatDateTime(order.created_at)}
                                    tone="slate"
                                />
                                <Timeline
                                    label="Kedaluwarsa"
                                    value={formatDateTime(order.expires_at)}
                                    tone="amber"
                                />
                                <Timeline
                                    label="Dibayar"
                                    value={formatDateTime(order.paid_at)}
                                    tone={order.paid_at ? 'emerald' : 'slate'}
                                />
                            </ol>
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
    badge,
    children,
}: {
    title: string;
    icon?: React.ReactNode;
    badge?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 ">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="inline-flex items-center gap-2 text-[14.5px] font-bold text-slate-900 ">
                    {icon && (
                        <span className="grid size-7 place-items-center rounded-lg bg-brand-50 text-brand-600 ">
                            {icon}
                        </span>
                    )}
                    {title}
                </h2>
                {badge && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10.5px] font-semibold tracking-wider text-slate-600 uppercase ">
                        {badge}
                    </span>
                )}
            </div>
            <div>{children}</div>
        </div>
    );
}

function QuickStat({
    icon,
    label,
    value,
    emphasis,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    emphasis?: boolean;
}) {
    return (
        <div
            className={cn(
                'min-w-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur',
                emphasis && 'bg-white/10',
            )}
        >
            <div className="flex items-center gap-1.5 text-[10.5px] font-semibold tracking-wider text-white/60 uppercase">
                {icon}
                {label}
            </div>
            <div
                className={cn(
                    'mt-1 truncate text-[14px] font-bold text-white tabular-nums',
                    emphasis && 'text-[15px]',
                )}
            >
                {value}
            </div>
        </div>
    );
}

function Row({
    label,
    value,
    valueClass,
}: {
    label: string;
    value: string;
    valueClass?: string;
}) {
    return (
        <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-600 ">{label}</dt>
            <dd
                className={cn(
                    'font-medium text-slate-900 tabular-nums ',
                    valueClass,
                )}
            >
                {value}
            </dd>
        </div>
    );
}

function ContactRow({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | null;
}) {
    return (
        <div className="flex items-start gap-2.5">
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-500 ">
                {icon}
            </span>
            <div className="min-w-0 flex-1">
                <dt className="text-[10.5px] font-semibold tracking-wider text-slate-400 uppercase ">
                    {label}
                </dt>
                <dd className="font-medium break-words text-slate-900 ">
                    {value ?? '-'}
                </dd>
            </div>
        </div>
    );
}

function Timeline({
    label,
    value,
    tone,
}: {
    label: string;
    value: string;
    tone: 'slate' | 'amber' | 'emerald';
}) {
    const toneClass =
        tone === 'emerald'
            ? 'bg-emerald-500 ring-emerald-100 '
            : tone === 'amber'
              ? 'bg-amber-500 ring-amber-100 '
              : 'bg-slate-300 ring-slate-100 ';
    return (
        <li className="relative pl-6">
            <span
                className={cn(
                    'absolute top-1.5 left-0 size-3.5 rounded-full ring-4',
                    toneClass,
                )}
            />
            <dt className="text-[10.5px] font-semibold tracking-wider text-slate-400 uppercase ">
                {label}
            </dt>
            <dd className="text-[12.5px] font-medium text-slate-900 ">
                {value}
            </dd>
        </li>
    );
}
