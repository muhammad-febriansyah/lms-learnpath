import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    ArrowRight,
    BookOpen,
    Building2,
    CheckCircle2,
    Lock,
    Package,
    QrCode,
    ShieldCheck,
    Tag,
    X,
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

type Course = {
    id: number;
    title: string;
    slug: string;
    thumbnail: string | null;
    price: number;
};

type Bundle = {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    thumbnail: string | null;
    price: number;
    compare_at_price: number | null;
    savings: number;
    courses: Course[];
};

type Customer = {
    name: string;
    email: string;
    phone: string | null;
};

type AppliedCoupon = {
    code: string;
    name: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
};

type Quote = {
    valid: boolean;
    subtotal: number;
    discount: number;
    total: number;
    error: string | null;
    coupon: AppliedCoupon | null;
};

type Props = {
    bundle: Bundle;
    paymentMethods: PaymentMethodOption[];
    customer: Customer;
    quote: Quote;
};

function formatRupiah(value: number): string {
    if (value === 0) return 'Gratis';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

export default function BundleCheckout({ bundle, paymentMethods, customer, quote }: Props) {
    const form = useForm({
        payment_method: paymentMethods[0]?.value ?? 'qris',
        customer_name: customer.name ?? '',
        customer_email: customer.email ?? '',
        customer_phone: customer.phone ?? '',
        coupon_code: quote.coupon?.code ?? '',
    });

    const [voucherInput, setVoucherInput] = useState(quote.coupon?.code ?? '');
    const [applying, setApplying] = useState(false);

    useEffect(() => {
        form.setData('coupon_code', quote.coupon?.code ?? '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quote.coupon?.code]);

    const isFree = quote.total === 0;

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post(`/checkout/bundle/${bundle.slug}`);
    }

    function applyVoucher() {
        const code = voucherInput.trim();
        if (code === '') return;
        setApplying(true);
        router.reload({
            only: ['quote'],
            data: { coupon: code },
            onFinish: () => setApplying(false),
        });
    }

    function removeVoucher() {
        setVoucherInput('');
        setApplying(true);
        router.reload({
            only: ['quote'],
            data: { coupon: '' },
            onFinish: () => setApplying(false),
        });
    }

    return (
        <>
            <Head title="Checkout Paket" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/bundles" className="hover:text-slate-700">
                            Paket
                        </Link>
                        <span className="text-slate-300">/</span>
                        <Link href={`/bundles/${bundle.slug}`} className="hover:text-slate-700">
                            {bundle.title}
                        </Link>
                        <span className="text-slate-300">/</span>
                        <span className="font-semibold text-slate-900">Checkout</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Checkout Paket
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Selesaikan pembayaran untuk akses semua kursus dalam paket.
                    </p>
                </div>

                <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-5">
                        <Card title="Data Pemesan">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Nama Lengkap" required error={form.errors.customer_name}>
                                    <Input
                                        value={form.data.customer_name}
                                        onChange={(e) =>
                                            form.setData('customer_name', e.target.value)
                                        }
                                    />
                                </Field>
                                <Field label="Email" required error={form.errors.customer_email}>
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

                        <Card title="Kode Voucher">
                            {quote.coupon ? (
                                <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="grid size-9 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                                            <Tag className="size-4" />
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-bold text-emerald-900">
                                                {quote.coupon.code}
                                            </div>
                                            <div className="text-[11.5px] text-emerald-700">
                                                Hemat {formatRupiah(quote.discount)}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removeVoucher}
                                        disabled={applying}
                                        className="text-emerald-700 hover:text-emerald-900 disabled:opacity-50"
                                        aria-label="Hapus voucher"
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Masukkan kode voucher"
                                            value={voucherInput}
                                            onChange={(e) =>
                                                setVoucherInput(e.target.value.toUpperCase())
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    applyVoucher();
                                                }
                                            }}
                                            className="font-mono uppercase tracking-wider"
                                        />
                                        <Button
                                            type="button"
                                            onClick={applyVoucher}
                                            disabled={applying || voucherInput.trim() === ''}
                                            className="rounded-xl bg-brand-600 hover:bg-brand-700"
                                        >
                                            {applying ? 'Memeriksa...' : 'Terapkan'}
                                        </Button>
                                    </div>
                                    {quote.error && (
                                        <p className="text-[12px] text-rose-600">{quote.error}</p>
                                    )}
                                    <FieldError message={form.errors.coupon_code} />
                                    <p className="text-[11.5px] text-slate-500">
                                        Voucher khusus kursus tertentu tidak berlaku di paket.
                                    </p>
                                </div>
                            )}
                        </Card>

                        {!isFree && (
                            <Card title="Metode Pembayaran">
                                <div className="grid gap-2.5 sm:grid-cols-2">
                                    {paymentMethods.map((method) => {
                                        const active = form.data.payment_method === method.value;
                                        return (
                                            <button
                                                type="button"
                                                key={method.value}
                                                onClick={() =>
                                                    form.setData('payment_method', method.value)
                                                }
                                                className={cn(
                                                    'group flex items-center gap-3 rounded-xl border p-3.5 text-left transition',
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
                                                    {method.is_va ? (
                                                        <Building2 className="size-5" />
                                                    ) : (
                                                        <QrCode className="size-5" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[13.5px] font-semibold text-slate-900">
                                                        {method.label}
                                                    </div>
                                                    <div className="text-[11.5px] text-slate-500">
                                                        {method.is_va ? 'Virtual Account' : 'QR Code'}
                                                    </div>
                                                </div>
                                                <div
                                                    className={cn(
                                                        'grid size-5 place-items-center rounded-full ring-2 transition',
                                                        active
                                                            ? 'bg-brand-600 ring-brand-600 text-white'
                                                            : 'bg-white ring-slate-300',
                                                    )}
                                                >
                                                    {active && <CheckCircle2 className="size-3.5" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                <FieldError message={form.errors.payment_method} />
                            </Card>
                        )}
                    </div>

                    <aside className="space-y-4">
                        <Card title="Ringkasan Paket" sticky>
                            <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
                                <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                                    {bundle.thumbnail ? (
                                        <img
                                            src={bundle.thumbnail}
                                            alt={bundle.title}
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <Package className="size-5" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="line-clamp-2 text-[13.5px] font-semibold text-slate-900">
                                        {bundle.title}
                                    </div>
                                    <div className="text-[11.5px] text-slate-500">
                                        {bundle.courses.length} kursus
                                    </div>
                                </div>
                            </div>

                            <ul className="space-y-1.5 border-b border-slate-100 py-3 text-[11.5px] text-slate-600">
                                {bundle.courses.slice(0, 5).map((c) => (
                                    <li key={c.id} className="flex items-center gap-1.5">
                                        <BookOpen className="size-3 text-brand-600" />
                                        <span className="truncate">{c.title}</span>
                                    </li>
                                ))}
                                {bundle.courses.length > 5 && (
                                    <li className="pl-4 text-slate-400">
                                        +{bundle.courses.length - 5} kursus lainnya
                                    </li>
                                )}
                            </ul>

                            <dl className="space-y-2 py-4 text-[13px]">
                                <div className="flex items-center justify-between">
                                    <dt className="text-slate-600">Subtotal</dt>
                                    <dd className="tabular-nums font-medium text-slate-900">
                                        {formatRupiah(bundle.price)}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between">
                                    <dt className="text-slate-600">
                                        Diskon
                                        {quote.coupon && (
                                            <span className="ml-1.5 text-[11px] font-semibold text-emerald-600">
                                                ({quote.coupon.code})
                                            </span>
                                        )}
                                    </dt>
                                    <dd
                                        className={cn(
                                            'tabular-nums',
                                            quote.discount > 0
                                                ? 'font-medium text-emerald-600'
                                                : 'text-slate-500',
                                        )}
                                    >
                                        {quote.discount > 0
                                            ? `-${formatRupiah(quote.discount)}`
                                            : 'Rp 0'}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                    <dt className="font-semibold text-slate-900">Total</dt>
                                    <dd
                                        className={cn(
                                            'text-[18px] font-extrabold tabular-nums',
                                            isFree ? 'text-emerald-600' : 'text-slate-900',
                                        )}
                                    >
                                        {formatRupiah(quote.total)}
                                    </dd>
                                </div>
                            </dl>

                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="w-full rounded-xl bg-brand-600 hover:bg-brand-700"
                            >
                                {form.processing
                                    ? 'Memproses...'
                                    : isFree
                                      ? 'Daftar Gratis'
                                      : 'Lanjut ke Pembayaran'}
                                <ArrowRight className="ml-1.5 size-4" />
                            </Button>

                            <div className="mt-4 space-y-2 text-[11.5px] text-slate-500">
                                <div className="inline-flex items-center gap-1.5">
                                    <ShieldCheck className="size-3.5 text-emerald-500" />
                                    Transaksi aman lewat Pakasir
                                </div>
                                <div className="inline-flex items-center gap-1.5">
                                    <Lock className="size-3.5 text-slate-400" />
                                    Data Anda terenkripsi
                                </div>
                            </div>
                            <Badge className="mt-3 border-transparent bg-slate-100 text-slate-600">
                                Pesanan kedaluwarsa dalam 24 jam jika belum dibayar
                            </Badge>
                        </Card>
                    </aside>
                </form>
            </div>
        </>
    );
}

function Card({
    title,
    sticky,
    children,
}: {
    title: string;
    sticky?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div
            className={cn(
                'rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:p-6',
                sticky && 'lg:sticky lg:top-24',
            )}
        >
            <h2 className="mb-4 text-[15px] font-bold text-slate-900">{title}</h2>
            {children}
        </div>
    );
}

function Field({
    label,
    required,
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
        <div className="space-y-2">
            <RequiredLabel required={required}>{label}</RequiredLabel>
            {children}
            {hint && !error && <p className="text-[11.5px] text-slate-500">{hint}</p>}
            <FieldError message={error} />
        </div>
    );
}
