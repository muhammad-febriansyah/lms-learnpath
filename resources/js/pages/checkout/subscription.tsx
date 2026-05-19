import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarClock,
    CheckCircle2,
    Crown,
    Infinity as InfinityIcon,
    Lock,
    QrCode,
    ShieldCheck,
} from 'lucide-react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type PaymentMethodOption = {
    value: string;
    label: string;
    is_va: boolean;
};

type Plan = {
    id: number;
    code: string;
    name: string;
    tagline: string | null;
    price: number;
    compare_at_price: number | null;
    savings: number;
    billing_period: 'monthly' | 'quarterly' | 'yearly';
    period_label: string;
    duration_days: number;
    features: string[];
    is_popular: boolean;
};

type Customer = { name: string; email: string; phone: string | null };

type Props = {
    plan: Plan;
    paymentMethods: PaymentMethodOption[];
    customer: Customer;
};

function formatRupiah(value: number): string {
    if (value === 0) {
        return 'Gratis';
    }
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

export default function SubscriptionCheckout({
    plan,
    paymentMethods,
    customer,
}: Props) {
    const form = useForm({
        payment_method: paymentMethods[0]?.value ?? 'qris',
        customer_name: customer.name ?? '',
        customer_email: customer.email ?? '',
        customer_phone: customer.phone ?? '',
    });

    const hasSavings = plan.savings > 0;
    const discountPct =
        hasSavings && plan.compare_at_price
            ? Math.round((plan.savings / plan.compare_at_price) * 100)
            : 0;
    const isFree = plan.price === 0;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/checkout/subscription/${plan.code}`);
    };

    return (
        <>
            <Head title={`Checkout — ${plan.name}`} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/subscribe" className="hover:text-slate-700">
                            Langganan
                        </Link>
                        <span className="text-slate-300">/</span>
                        <span className="font-semibold text-slate-900">
                            {plan.name}
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Mulai Berlangganan
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Akses semua kursus selama masa berlaku langganan. Tidak ada
                        auto-renewal — perpanjang manual saat masa berlaku habis.
                    </p>
                </div>

                <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-5">
                        {/* Plan hero */}
                        <div
                            className={cn(
                                'overflow-hidden rounded-2xl p-5 ring-1',
                                plan.is_popular
                                    ? 'bg-gradient-to-br from-brand-50 via-brand-50 to-pink-50 ring-brand-200'
                                    : 'bg-gradient-to-br from-brand-50 via-sky-50 to-brand-50 ring-brand-200',
                            )}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={cn(
                                        'grid size-12 shrink-0 place-items-center rounded-2xl text-white shadow-md',
                                        plan.is_popular
                                            ? 'bg-gradient-to-br from-brand-500 to-brand-600'
                                            : 'bg-gradient-to-br from-brand-500 to-sky-600',
                                    )}
                                >
                                    <Crown className="size-6" />
                                </div>
                                <div className="min-w-0">
                                    <div
                                        className={cn(
                                            'inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider backdrop-blur',
                                            plan.is_popular
                                                ? 'text-brand-700'
                                                : 'text-brand-700',
                                        )}
                                    >
                                        Paket {plan.period_label}
                                    </div>
                                    <h2 className="mt-1.5 text-[16px] font-bold leading-tight text-slate-900">
                                        {plan.name}
                                    </h2>
                                    {plan.tagline && (
                                        <p className="mt-0.5 text-[12.5px] text-slate-600">
                                            {plan.tagline}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Customer */}
                        <Card title="Data Pemesan">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field
                                    label="Nama Lengkap"
                                    required
                                    error={form.errors.customer_name}
                                >
                                    <Input
                                        value={form.data.customer_name}
                                        onChange={(e) =>
                                            form.setData('customer_name', e.target.value)
                                        }
                                    />
                                </Field>
                                <Field
                                    label="Email"
                                    required
                                    error={form.errors.customer_email}
                                >
                                    <Input
                                        type="email"
                                        value={form.data.customer_email}
                                        onChange={(e) =>
                                            form.setData('customer_email', e.target.value)
                                        }
                                    />
                                </Field>
                                <Field
                                    label="Nomor WhatsApp"
                                    error={form.errors.customer_phone}
                                    hint="Untuk notifikasi pembayaran."
                                >
                                    <Input
                                        placeholder="Contoh: 081234567890"
                                        value={form.data.customer_phone}
                                        onChange={(e) =>
                                            form.setData('customer_phone', e.target.value)
                                        }
                                    />
                                </Field>
                            </div>
                        </Card>

                        {/* Features */}
                        <Card title="Yang Anda dapatkan">
                            <ul className="grid gap-2 sm:grid-cols-2">
                                {plan.features.map((feat, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-2 text-[13px] text-slate-700"
                                    >
                                        <CheckCircle2
                                            className={cn(
                                                'mt-0.5 size-4 shrink-0',
                                                plan.is_popular
                                                    ? 'text-brand-500'
                                                    : 'text-emerald-500',
                                            )}
                                        />
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        {/* Payment methods */}
                        {!isFree && (
                            <Card title="Metode Pembayaran">
                                <div className="grid gap-2.5 sm:grid-cols-2">
                                    {paymentMethods.map((method) => {
                                        const active =
                                            form.data.payment_method === method.value;
                                        return (
                                            <button
                                                type="button"
                                                key={method.value}
                                                onClick={() =>
                                                    form.setData('payment_method', method.value)
                                                }
                                                className={cn(
                                                    'flex items-center gap-3 rounded-xl border p-3.5 text-left transition',
                                                    active
                                                        ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-200'
                                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        'grid size-10 shrink-0 place-items-center rounded-lg',
                                                        method.is_va
                                                            ? 'bg-sky-50 text-sky-600'
                                                            : 'bg-emerald-50 text-emerald-600',
                                                    )}
                                                >
                                                    <QrCode className="size-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-[13px] font-semibold text-slate-900">
                                                        {method.label}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500">
                                                        {method.is_va
                                                            ? 'Bayar via transfer VA'
                                                            : 'Bayar dengan QRIS'}
                                                    </div>
                                                </div>
                                                {active && (
                                                    <CheckCircle2 className="ml-auto size-4 text-brand-600" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                <FieldError message={form.errors.payment_method} />
                            </Card>
                        )}
                    </div>

                    {/* Sidebar summary */}
                    <aside className="space-y-3">
                        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                            <h3 className="text-[14px] font-bold text-slate-900">
                                Ringkasan
                            </h3>
                            <dl className="mt-3 space-y-2 text-[13px]">
                                <div className="flex items-baseline justify-between">
                                    <dt className="text-slate-500">Paket</dt>
                                    <dd className="font-semibold text-slate-900">
                                        {plan.name}
                                    </dd>
                                </div>
                                <div className="flex items-baseline justify-between">
                                    <dt className="text-slate-500">Durasi</dt>
                                    <dd className="font-semibold text-slate-900">
                                        {plan.duration_days} hari
                                    </dd>
                                </div>
                                {hasSavings && plan.compare_at_price && (
                                    <div className="flex items-baseline justify-between text-emerald-700">
                                        <dt>Hemat {discountPct}%</dt>
                                        <dd className="font-bold tabular-nums">
                                            -{formatRupiah(plan.savings)}
                                        </dd>
                                    </div>
                                )}
                                <div className="flex items-baseline justify-between border-t border-slate-100 pt-2.5">
                                    <dt className="font-bold text-slate-900">Total</dt>
                                    <dd className="text-[18px] font-extrabold text-brand-700 tabular-nums">
                                        {formatRupiah(plan.price)}
                                    </dd>
                                </div>
                            </dl>

                            <Button
                                type="submit"
                                disabled={form.processing}
                                className={cn(
                                    'mt-4 w-full rounded-xl py-5 text-[14px] font-bold',
                                    plan.is_popular
                                        ? 'bg-brand-600 hover:bg-brand-700'
                                        : 'bg-brand-600 hover:bg-brand-700',
                                )}
                            >
                                {form.processing
                                    ? 'Memproses...'
                                    : isFree
                                      ? 'Aktifkan Langganan'
                                      : `Bayar ${formatRupiah(plan.price)}`}
                                <ArrowRight className="ml-1.5 size-4" />
                            </Button>

                            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-[11.5px] text-slate-600">
                                <div className="flex items-center gap-2">
                                    <InfinityIcon className="size-3.5 text-brand-600" />
                                    Akses semua kursus aktif
                                </div>
                                <div className="flex items-center gap-2">
                                    <CalendarClock className="size-3.5 text-brand-600" />
                                    {plan.duration_days} hari akses penuh
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="size-3.5 text-brand-600" />
                                    Sertifikat untuk tiap kursus
                                </div>
                                <div className="flex items-center gap-2">
                                    <Lock className="size-3.5 text-brand-600" />
                                    Pembayaran aman via Pakasir
                                </div>
                            </div>
                        </div>

                        {hasSavings && (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-center text-[12px]">
                                <Badge className="border-emerald-300 bg-emerald-100 text-emerald-800">
                                    Hemat {formatRupiah(plan.savings)} dari harga normal
                                </Badge>
                            </div>
                        )}
                    </aside>
                </form>
            </div>
        </>
    );
}

function Card({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <h3 className="text-[14px] font-bold text-slate-900">{title}</h3>
            <div className="mt-3">{children}</div>
        </div>
    );
}

function Field({
    label,
    required = false,
    error,
    hint,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            {required ? (
                <RequiredLabel>{label}</RequiredLabel>
            ) : (
                <label className="text-[12.5px] font-semibold text-slate-700">
                    {label}
                </label>
            )}
            <div className="mt-1">{children}</div>
            {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
            <FieldError message={error} />
        </div>
    );
}
