import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowRight, Building2, CheckCircle2, Clock, CreditCard, Wallet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PaymentMethod = { value: string; label: string; is_va: boolean };

type Order = {
    order_number: string;
    status: string;
    subtotal: number;
    tax: number;
    total: number;
    seats: number;
    price_per_seat: number;
    paid_at: string | null;
    expires_at: string | null;
};

type CurrentPayment = {
    status: string;
    payment_url: string | null;
    payment_method: string | null;
};

type Props = {
    order: Order;
    paymentMethods: PaymentMethod[];
    currentPayment: CurrentPayment | null;
};

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

function formatDateTime(iso: string | null): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function BusinessCheckout({ order, paymentMethods, currentPayment }: Props) {
    const form = useForm({
        payment_method: currentPayment?.payment_method ?? 'qris',
    });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post(`/business/checkout/${order.order_number}/pay`);
    }

    const isPaid = order.status === 'paid';

    if (isPaid) {
        return (
            <>
                <Head title="Pembayaran Berhasil" />
                <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16">
                    <div className="mx-auto max-w-2xl px-6 text-center">
                        <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                            <CheckCircle2 className="size-8" />
                        </div>
                        <h1 className="mt-6 text-3xl font-extrabold text-slate-900">
                            Pembayaran Berhasil!
                        </h1>
                        <p className="mt-3 text-[14px] text-slate-600">
                            Paket {order.seats} seat sudah aktif. Anda bisa langsung mengundang karyawan
                            dari dashboard HR.
                        </p>
                        <div className="mt-8 rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200/70">
                            <Row label="Order Number" value={order.order_number} mono />
                            <Row label="Total" value={formatRupiah(order.total)} emphasis />
                            <Row label="Dibayar pada" value={formatDateTime(order.paid_at)} />
                        </div>
                        <Button
                            asChild
                            className="mt-6 rounded-xl bg-brand-600 px-6 py-5 hover:bg-brand-700"
                        >
                            <Link href="/business/dashboard">
                                Lanjut ke Dashboard HR
                                <ArrowRight className="ml-2 size-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Pembayaran" />
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
                <nav className="border-b border-slate-100 bg-white/80 backdrop-blur">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <Link href="/" className="text-[18px] font-extrabold text-brand-700">
                            Learnpath
                        </Link>
                        <div className="text-[12px] text-slate-500">Order #{order.order_number}</div>
                    </div>
                </nav>

                <div className="mx-auto grid max-w-5xl gap-8 px-6 py-12 lg:grid-cols-[1fr_360px]">
                    <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[11.5px] font-bold tracking-wider text-brand-700 uppercase">
                            <Building2 className="size-3.5" />
                            Selesaikan Pembayaran
                        </div>
                        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
                            Pilih metode pembayaran
                        </h1>
                        <p className="mt-2 text-[14px] text-slate-600">
                            Setelah pembayaran berhasil, paket seat langsung aktif dan Anda otomatis
                            diarahkan ke dashboard HR.
                        </p>

                        {currentPayment?.payment_url && currentPayment.status === 'pending' && (
                            <div className="mt-6 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
                                <div className="flex items-start gap-3">
                                    <Clock className="size-5 shrink-0 text-amber-600" />
                                    <div className="flex-1">
                                        <div className="text-[13px] font-bold text-amber-900">
                                            Pembayaran belum diselesaikan
                                        </div>
                                        <p className="mt-1 text-[12px] text-amber-800">
                                            Anda sudah memilih{' '}
                                            <b>{currentPayment.payment_method?.toUpperCase()}</b>. Lanjutkan
                                            pembayaran atau pilih metode lain.
                                        </p>
                                        <Button
                                            onClick={() => router.visit(currentPayment.payment_url!)}
                                            className="mt-3 rounded-xl bg-amber-600 hover:bg-amber-700"
                                        >
                                            Lanjut Bayar
                                            <ArrowRight className="ml-2 size-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form
                            onSubmit={submit}
                            className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70"
                        >
                            <h2 className="text-[14px] font-bold text-slate-900">QRIS</h2>
                            <div className="mt-3 grid gap-2">
                                {paymentMethods
                                    .filter((m) => !m.is_va)
                                    .map((m) => (
                                        <PaymentOption
                                            key={m.value}
                                            method={m}
                                            checked={form.data.payment_method === m.value}
                                            onChange={() => form.setData('payment_method', m.value)}
                                        />
                                    ))}
                            </div>

                            <h2 className="mt-6 text-[14px] font-bold text-slate-900">
                                Virtual Account
                            </h2>
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                {paymentMethods
                                    .filter((m) => m.is_va)
                                    .map((m) => (
                                        <PaymentOption
                                            key={m.value}
                                            method={m}
                                            checked={form.data.payment_method === m.value}
                                            onChange={() => form.setData('payment_method', m.value)}
                                        />
                                    ))}
                            </div>

                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="mt-6 w-full rounded-xl bg-brand-600 py-6 text-[15px] font-bold hover:bg-brand-700"
                            >
                                {form.processing ? 'Memproses...' : `Bayar ${formatRupiah(order.total)}`}
                                <ArrowRight className="ml-2 size-4" />
                            </Button>
                        </form>
                    </div>

                    <aside>
                        <div className="sticky top-6 rounded-2xl bg-slate-900 p-6 text-white">
                            <div className="text-[11px] font-bold tracking-wider uppercase opacity-70">
                                Ringkasan Order
                            </div>
                            <div className="mt-3 space-y-2 text-[13px]">
                                <Row
                                    label="Order Number"
                                    value={order.order_number}
                                    mono
                                    dark
                                />
                                <Row label="Jumlah seat" value={order.seats.toString()} dark />
                                <Row
                                    label="Per seat"
                                    value={formatRupiah(order.price_per_seat)}
                                    dark
                                />
                                <Row
                                    label="Subtotal"
                                    value={formatRupiah(order.subtotal)}
                                    dark
                                />
                                {order.tax > 0 && (
                                    <Row label="PPN" value={formatRupiah(order.tax)} dark />
                                )}
                            </div>
                            <div className="mt-4 border-t border-white/20 pt-4">
                                <div className="text-[11px] opacity-70">Total Bayar</div>
                                <div className="mt-1 text-[28px] font-extrabold tabular-nums leading-none">
                                    {formatRupiah(order.total)}
                                </div>
                                {order.expires_at && (
                                    <div className="mt-3 inline-flex items-center gap-1.5 text-[10.5px] opacity-70">
                                        <Clock className="size-3" />
                                        Berlaku sampai {formatDateTime(order.expires_at)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
}

function PaymentOption({
    method,
    checked,
    onChange,
}: {
    method: PaymentMethod;
    checked: boolean;
    onChange: () => void;
}) {
    return (
        <label
            className={cn(
                'flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-colors',
                checked ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:bg-slate-50',
            )}
        >
            <input
                type="radio"
                name="payment_method"
                value={method.value}
                checked={checked}
                onChange={onChange}
                className="size-4"
            />
            <div className="grid size-9 place-items-center rounded-lg bg-white ring-1 ring-slate-200">
                {method.is_va ? (
                    <Wallet className="size-4 text-slate-600" />
                ) : (
                    <CreditCard className="size-4 text-slate-600" />
                )}
            </div>
            <span className="text-[13px] font-semibold text-slate-900">{method.label}</span>
        </label>
    );
}

function Row({
    label,
    value,
    mono,
    emphasis,
    dark,
}: {
    label: string;
    value: string;
    mono?: boolean;
    emphasis?: boolean;
    dark?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-3 py-1">
            <span className={cn('text-[12px]', dark ? 'opacity-70' : 'text-slate-500')}>
                {label}
            </span>
            <span
                className={cn(
                    'tabular-nums',
                    mono && 'font-mono',
                    emphasis ? 'text-[16px] font-extrabold' : 'text-[13px] font-semibold',
                    dark ? 'text-white' : 'text-slate-900',
                )}
            >
                {value}
            </span>
        </div>
    );
}
