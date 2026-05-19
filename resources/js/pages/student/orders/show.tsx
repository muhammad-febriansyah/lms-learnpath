import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    CreditCard,
    ExternalLink,
    Receipt,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { FieldError } from '@/components/form/field-error';
import { IconChevR } from '@/components/learnpath-icons';
import { StatusBadge } from '@/components/status/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Payment = {
    id: number;
    gateway: string;
    payment_method: string | null;
    payment_number: string | null;
    payment_url: string | null;
    amount: number;
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
    items: OrderItem[];
    payments: Payment[];
};

type PaymentMethodOption = { value: string; label: string; is_va: boolean };

type Props = {
    order: Order;
    paymentMethods: PaymentMethodOption[];
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

const STATUS_MAP: Record<string, string> = {
    paid: 'completed',
    pending: 'pending_review',
    expired: 'expired',
    cancelled: 'failed',
    refunded: 'failed',
};

export default function OrderShow({ order, paymentMethods }: Props) {
    const isPending = order.status === 'pending';
    const isPaid = order.status === 'paid';
    const latestPayment = order.payments[0];

    return (
        <>
            <Head title={`Pesanan ${order.order_number}`} />
            <div className="mx-auto max-w-4xl space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <Link href="/orders" className="hover:text-slate-700">
                            Pesanan
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-mono font-semibold text-slate-900">
                            {order.order_number}
                        </span>
                    </nav>
                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
                        <h1 className="inline-flex items-center gap-3 text-2xl font-extrabold tracking-tight text-slate-900">
                            Detail Pesanan
                            <StatusBadge status={STATUS_MAP[order.status] ?? order.status} />
                        </h1>
                        <p className="text-[12.5px] text-slate-500">
                            Dibuat {formatDateTime(order.created_at)}
                        </p>
                    </div>
                </div>

                {isPaid && <PaidBanner paidAt={order.paid_at} />}
                {isPending && <PendingBanner expiresAt={order.expires_at} />}

                <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                    <div className="space-y-5">
                        <Card title="Item Pesanan" icon={<Receipt className="size-4" />}>
                            <ul className="divide-y divide-slate-100">
                                {order.items.map((it) => (
                                    <li
                                        key={it.id}
                                        className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                                    >
                                        <div className="min-w-0">
                                            <div className="text-[13.5px] font-semibold text-slate-900">
                                                {it.name}
                                            </div>
                                            <div className="text-[11.5px] text-slate-500">
                                                {it.quantity}× · {formatRupiah(it.unit_price)}
                                            </div>
                                        </div>
                                        <div className="text-[13px] font-semibold text-slate-900 tabular-nums">
                                            {formatRupiah(it.subtotal)}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        {isPending && latestPayment?.payment_url && (
                            <PaymentInstruction payment={latestPayment} orderTotal={order.total} />
                        )}

                        {isPending && !latestPayment?.payment_url && (
                            <RetryPaymentCard
                                order={order}
                                paymentMethods={paymentMethods}
                            />
                        )}

                        {order.payments.length > 0 && (
                            <Card title="Riwayat Pembayaran" icon={<CreditCard className="size-4" />}>
                                <ul className="space-y-2">
                                    {order.payments.map((p) => (
                                        <li
                                            key={p.id}
                                            className="flex items-center justify-between gap-3 rounded-xl bg-slate-50/60 px-3 py-2.5"
                                        >
                                            <div>
                                                <div className="text-[12.5px] font-semibold text-slate-900">
                                                    {p.gateway.toUpperCase()} ·{' '}
                                                    {p.payment_method ?? '-'}
                                                </div>
                                                <div className="text-[11px] text-slate-500">
                                                    {formatDateTime(p.created_at)}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[12px] font-semibold text-slate-700 tabular-nums">
                                                    {formatRupiah(p.amount)}
                                                </span>
                                                <Badge
                                                    className={
                                                        p.status === 'completed'
                                                            ? 'border-transparent bg-emerald-50 text-emerald-700'
                                                            : 'border-transparent bg-amber-50 text-amber-700'
                                                    }
                                                >
                                                    {p.status}
                                                </Badge>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}
                    </div>

                    <aside className="space-y-4">
                        <Card title="Ringkasan">
                            <dl className="space-y-2 text-[13px]">
                                <div className="flex justify-between">
                                    <dt className="text-slate-600">Subtotal</dt>
                                    <dd className="tabular-nums">{formatRupiah(order.subtotal)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-600">Diskon</dt>
                                    <dd className="tabular-nums text-emerald-600">
                                        - {formatRupiah(order.discount)}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-600">PPN</dt>
                                    <dd className="tabular-nums">{formatRupiah(order.tax)}</dd>
                                </div>
                                <div className="flex justify-between border-t border-slate-100 pt-2">
                                    <dt className="font-semibold text-slate-900">Total</dt>
                                    <dd className="text-[16px] font-extrabold tabular-nums text-slate-900">
                                        {formatRupiah(order.total)}
                                    </dd>
                                </div>
                            </dl>

                            {isPaid && (
                                <Button
                                    asChild
                                    className="mt-4 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <Link href="/my-courses">
                                        Mulai Belajar
                                        <ArrowRight className="ml-1.5 size-4" />
                                    </Link>
                                </Button>
                            )}
                        </Card>

                        <Card title="Data Pemesan">
                            <dl className="space-y-2 text-[12.5px]">
                                <div>
                                    <dt className="text-slate-500">Nama</dt>
                                    <dd className="font-medium text-slate-900">
                                        {order.customer_name ?? '-'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Email</dt>
                                    <dd className="text-slate-900">{order.customer_email ?? '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Telepon</dt>
                                    <dd className="text-slate-900">{order.customer_phone ?? '-'}</dd>
                                </div>
                            </dl>
                        </Card>
                    </aside>
                </div>
            </div>
        </>
    );
}

function PaidBanner({ paidAt }: { paidAt: string | null }) {
    return (
        <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
            <div>
                <div className="text-[14px] font-semibold text-emerald-900">
                    Pembayaran Berhasil
                </div>
                <div className="text-[12.5px] text-emerald-700">
                    Pesanan Anda dibayar pada {formatDateTime(paidAt)}. Anda sudah otomatis
                    terdaftar di kursus.
                </div>
            </div>
        </div>
    );
}

function PendingBanner({ expiresAt }: { expiresAt: string | null }) {
    return (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
            <Clock className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <div>
                <div className="text-[14px] font-semibold text-amber-900">
                    Menunggu Pembayaran
                </div>
                <div className="text-[12.5px] text-amber-700">
                    Selesaikan pembayaran sebelum {formatDateTime(expiresAt)}. Halaman ini akan
                    auto-refresh setiap 30 detik.
                </div>
            </div>
        </div>
    );
}

function PaymentInstruction({
    payment,
    orderTotal,
}: {
    payment: Payment;
    orderTotal: number;
}) {
    const flashUrl = usePage<{ flash?: { payment_url?: string } }>().props.flash
        ?.payment_url;
    const url = flashUrl ?? payment.payment_url;
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            router.reload({ only: ['order'] });
        }, 30_000);

        return () => clearInterval(timer);
    }, []);

    const copy = async () => {
        if (!payment.payment_number) return;
        try {
            await navigator.clipboard.writeText(payment.payment_number);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // clipboard may be blocked in some browsers
        }
    };

    const isQris = payment.payment_method?.toLowerCase() === 'qris';

    return (
        <div className="overflow-hidden rounded-2xl bg-card p-5 ring-1 ring-slate-200/70">
            <h2 className="mb-3 text-[15px] font-bold text-slate-900">
                Instruksi Pembayaran
            </h2>
            <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-brand-50/60 p-3">
                    <CreditCard className="size-5 text-brand-600" />
                    <div className="min-w-0 flex-1">
                        <div className="text-[12px] tracking-wider text-slate-500 uppercase">
                            Metode
                        </div>
                        <div className="text-[14px] font-semibold text-slate-900">
                            {payment.payment_method?.toUpperCase()}
                        </div>
                    </div>
                </div>
                {payment.payment_number && (
                    <div className="rounded-xl bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-2">
                            <div className="text-[11px] tracking-wider text-slate-500 uppercase">
                                {isQris ? 'Kode QRIS' : 'Nomor / Kode'}
                            </div>
                            <button
                                type="button"
                                onClick={copy}
                                className={
                                    'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition ' +
                                    (copied
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100')
                                }
                                title="Salin kode"
                            >
                                {copied ? (
                                    <>
                                        <Check className="size-3" />
                                        Tersalin
                                    </>
                                ) : (
                                    <>
                                        <Copy className="size-3" />
                                        Salin
                                    </>
                                )}
                            </button>
                        </div>
                        <div
                            className={
                                'mt-1.5 font-mono font-bold text-slate-900 break-all ' +
                                ((payment.payment_number?.length ?? 0) > 24
                                    ? 'text-[12px] leading-relaxed'
                                    : 'text-[16px]')
                            }
                        >
                            {payment.payment_number}
                        </div>
                        {isQris && (
                            <p className="mt-2 text-[11.5px] text-slate-500">
                                Scan QRIS via aplikasi e-wallet / mobile banking.
                                Kode ini dapat juga di-copy untuk pembayaran manual.
                            </p>
                        )}
                    </div>
                )}
                <div className="rounded-xl bg-slate-50 p-4">
                    <div className="text-[11px] tracking-wider text-slate-500 uppercase">
                        Jumlah yang harus dibayar
                    </div>
                    <div className="mt-1 text-[20px] font-extrabold text-slate-900 tabular-nums">
                        {formatRupiah(orderTotal)}
                    </div>
                </div>
                {url && (
                    <Button
                        asChild
                        className="w-full rounded-xl bg-brand-600 hover:bg-brand-700"
                    >
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-1.5 size-4" />
                            Buka halaman pembayaran
                        </a>
                    </Button>
                )}
            </div>
        </div>
    );
}

function RetryPaymentCard({
    order,
    paymentMethods,
}: {
    order: Order;
    paymentMethods: PaymentMethodOption[];
}) {
    const [selected, setSelected] = useState(paymentMethods[0]?.value ?? 'qris');
    const form = useForm({ payment_method: selected });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.setData('payment_method', selected);
        form.post(`/orders/${order.order_number}/pay`);
    };

    return (
        <Card title="Pilih Metode Pembayaran" icon={<CreditCard className="size-4" />}>
            <form onSubmit={submit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    {paymentMethods.map((m) => (
                        <button
                            type="button"
                            key={m.value}
                            onClick={() => setSelected(m.value)}
                            className={
                                'rounded-xl border px-3 py-2.5 text-left text-[13px] font-semibold transition ' +
                                (selected === m.value
                                    ? 'border-brand-600 bg-brand-50/50 text-brand-700 ring-2 ring-brand-200'
                                    : 'border-slate-200 text-slate-700 hover:border-slate-300')
                            }
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
                <FieldError message={form.errors.payment_method} />
                <Button
                    type="submit"
                    disabled={form.processing}
                    className="w-full rounded-xl bg-brand-600 hover:bg-brand-700"
                >
                    Lanjut Bayar
                    <ArrowRight className="ml-1.5 size-4" />
                </Button>
            </form>
        </Card>
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
