import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    Lock,
    Plus,
    QrCode,
    ShieldCheck,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import { RupiahInput } from '@/components/form/rupiah-input';
import { IconChevR } from '@/components/learnpath-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type PaymentMethodOption = {
    value: string;
    label: string;
    is_va: boolean;
};

type Props = {
    organization: { id: number; name: string };
    wallet: { balance: number; currency: string };
    presetAmounts: number[];
    paymentMethods: PaymentMethodOption[];
    customer: { name: string; email: string; phone: string | null };
};

function formatRupiah(value: number | string | null): string {
    const amount = Number(value || 0);

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export default function WalletTopUp({
    organization,
    wallet,
    presetAmounts,
    paymentMethods,
    customer,
}: Props) {
    const [customAmount, setCustomAmount] = useState(false);

    const form = useForm<{
        amount: number | '';
        payment_method: string;
        customer_name: string;
        customer_email: string;
        customer_phone: string;
    }>({
        amount: presetAmounts[0] ?? 500_000,
        payment_method: paymentMethods[0]?.value ?? 'qris',
        customer_name: customer.name ?? '',
        customer_email: customer.email ?? '',
        customer_phone: customer.phone ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/business/wallet/top-up');
    };

    return (
        <>
            <Head title="Top Up E-Wallet" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link
                            href="/business/wallet"
                            className="hover:text-slate-700"
                        >
                            E-Wallet
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Top Up</span>
                    </nav>
                    <h1 className="mt-1.5 inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
                        <Plus className="size-6 text-brand-600" />
                        Top Up E-Wallet
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Tambah saldo wallet {organization.name}. Saldo saat ini:{' '}
                        <strong className="text-slate-900">
                            {formatRupiah(wallet.balance)}
                        </strong>
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="grid gap-5 lg:grid-cols-[1fr_360px]"
                >
                    <div className="space-y-5">
                        {/* Amount selection */}
                        <Card title="Pilih Jumlah Top Up">
                            <div className="grid gap-2.5 sm:grid-cols-3">
                                {presetAmounts.map((amt) => {
                                    const active = !customAmount && form.data.amount === amt;

                                    return (
                                        <button
                                            type="button"
                                            key={amt}
                                            onClick={() => {
                                                setCustomAmount(false);
                                                form.setData('amount', amt);
                                            }}
                                            className={cn(
                                                'rounded-xl border p-4 text-center transition',
                                                active
                                                    ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-200'
                                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                                            )}
                                        >
                                            <div className="text-[15px] font-extrabold text-slate-900 tabular-nums">
                                                {formatRupiah(amt)}
                                            </div>
                                        </button>
                                    );
                                })}
                                <button
                                    type="button"
                                    onClick={() => setCustomAmount(true)}
                                    className={cn(
                                        'rounded-xl border p-4 text-center transition',
                                        customAmount
                                            ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-200'
                                            : 'border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50',
                                    )}
                                >
                                    <div className="text-[13px] font-bold text-slate-600">
                                        Jumlah Lain
                                    </div>
                                </button>
                            </div>

                            {customAmount && (
                                <div className="mt-4">
                                    <RequiredLabel htmlFor="custom_amount">
                                        Jumlah (Rupiah)
                                    </RequiredLabel>
                                    <RupiahInput
                                        id="custom_amount"
                                        value={form.data.amount}
                                        onChange={(value) =>
                                            form.setData('amount', value)
                                        }
                                        onClear={() => form.setData('amount', '')}
                                        placeholder="Rp 500.000"
                                    />
                                    <p className="mt-1 text-[11px] text-slate-500">
                                        Minimal Rp 50.000
                                    </p>
                                </div>
                            )}
                            <FieldError message={form.errors.amount} />
                        </Card>

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
                                >
                                    <Input
                                        placeholder="081234567890"
                                        value={form.data.customer_phone}
                                        onChange={(e) =>
                                            form.setData('customer_phone', e.target.value)
                                        }
                                    />
                                </Field>
                            </div>
                        </Card>

                        {/* Payment methods */}
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
                    </div>

                    {/* Summary sidebar */}
                    <aside className="space-y-3">
                        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                            <h3 className="text-[14px] font-bold text-slate-900">
                                Ringkasan
                            </h3>
                            <dl className="mt-3 space-y-2 text-[13px]">
                                <div className="flex items-baseline justify-between">
                                    <dt className="text-slate-500">Saldo saat ini</dt>
                                    <dd className="font-semibold text-slate-900 tabular-nums">
                                        {formatRupiah(wallet.balance)}
                                    </dd>
                                </div>
                                <div className="flex items-baseline justify-between text-emerald-700">
                                    <dt>Top up</dt>
                                    <dd className="font-bold tabular-nums">
                                        +{formatRupiah(form.data.amount)}
                                    </dd>
                                </div>
                                <div className="flex items-baseline justify-between border-t border-slate-100 pt-2.5">
                                    <dt className="font-bold text-slate-900">
                                        Saldo setelah top up
                                    </dt>
                                    <dd className="text-[16px] font-extrabold text-brand-700 tabular-nums">
                                        {formatRupiah(
                                            wallet.balance + Number(form.data.amount || 0),
                                        )}
                                    </dd>
                                </div>
                            </dl>

                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="mt-4 w-full rounded-xl bg-brand-600 py-5 text-[14px] font-bold hover:bg-brand-700"
                            >
                                {form.processing
                                    ? 'Memproses...'
                                    : `Bayar ${formatRupiah(form.data.amount)}`}
                                <ArrowRight className="ml-1.5 size-4" />
                            </Button>

                            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-[11.5px] text-slate-600">
                                <div className="flex items-center gap-2">
                                    <Wallet className="size-3.5 text-brand-600" />
                                    Saldo tidak ada expiry
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="size-3.5 text-brand-600" />
                                    Tercatat di ledger untuk audit
                                </div>
                                <div className="flex items-center gap-2">
                                    <Lock className="size-3.5 text-brand-600" />
                                    Pembayaran aman via Pakasir
                                </div>
                            </div>
                        </div>
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
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
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
            <FieldError message={error} />
        </div>
    );
}
