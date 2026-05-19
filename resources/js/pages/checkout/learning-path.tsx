import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Clock,
    Compass,
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

type Course = {
    id: number;
    title: string;
    slug: string;
    thumbnail: string | null;
    price: number;
    duration_minutes: number;
    level: string | null;
};

type LearningPath = {
    id: number;
    title: string;
    slug: string;
    subtitle: string | null;
    description: string | null;
    thumbnail: string | null;
    level: string | null;
    price: number;
    compare_at_price: number | null;
    savings: number;
    total_courses: number;
    courses: Course[];
};

type Customer = { name: string; email: string; phone: string | null };

type Quote = {
    valid: boolean;
    subtotal: number;
    discount: number;
    total: number;
    error: string | null;
};

type Props = {
    path: LearningPath;
    paymentMethods: PaymentMethodOption[];
    customer: Customer;
    quote: Quote;
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

function formatDuration(minutes: number): string {
    if (!minutes) {
        return '-';
    }
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) {
        return `${m}m`;
    }
    if (m === 0) {
        return `${h}j`;
    }
    return `${h}j ${m}m`;
}

export default function LearningPathCheckout({
    path,
    paymentMethods,
    customer,
    quote,
}: Props) {
    const form = useForm({
        payment_method: paymentMethods[0]?.value ?? 'qris',
        customer_name: customer.name ?? '',
        customer_email: customer.email ?? '',
        customer_phone: customer.phone ?? '',
    });

    const isFree = quote.total === 0;
    const hasSavings = path.savings > 0;
    const discountPct = hasSavings && path.compare_at_price
        ? Math.round((path.savings / path.compare_at_price) * 100)
        : 0;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/checkout/path/${path.slug}`);
    };

    return (
        <>
            <Head title={`Checkout — ${path.title}`} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/paths" className="hover:text-slate-700">
                            Learning Path
                        </Link>
                        <span className="text-slate-300">/</span>
                        <Link
                            href={`/paths/${path.slug}`}
                            className="hover:text-slate-700"
                        >
                            {path.title}
                        </Link>
                        <span className="text-slate-300">/</span>
                        <span className="font-semibold text-slate-900">Checkout</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Beli Paket Learning Path
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Akses semua {path.total_courses} kursus dalam paket setelah
                        pembayaran sukses.
                    </p>
                </div>

                <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-5">
                        {/* Path hero */}
                        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 via-brand-50 to-brand-50 p-5 ring-1 ring-brand-200">
                            <div className="flex items-start gap-4">
                                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md">
                                    <Compass className="size-6" />
                                </div>
                                <div className="min-w-0">
                                    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-brand-700 backdrop-blur">
                                        Jalur Belajar
                                    </div>
                                    <h2 className="mt-1.5 text-[16px] font-bold leading-tight text-slate-900">
                                        {path.title}
                                    </h2>
                                    {path.subtitle && (
                                        <p className="mt-0.5 text-[12.5px] text-slate-600">
                                            {path.subtitle}
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

                        {/* Course list */}
                        <Card title={`${path.total_courses} kursus dalam paket`}>
                            <ul className="divide-y divide-slate-100">
                                {path.courses.map((c, idx) => (
                                    <li
                                        key={c.id}
                                        className="flex items-center gap-3 py-3 text-[13px]"
                                    >
                                        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 font-bold text-brand-700">
                                            {idx + 1}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate font-semibold text-slate-900">
                                                {c.title}
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                                <Clock className="size-3" />
                                                {formatDuration(c.duration_minutes)}
                                                {c.level && (
                                                    <>
                                                        <span className="size-1 rounded-full bg-slate-300" />
                                                        <span>{c.level}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="shrink-0 text-[11.5px] text-slate-400 line-through">
                                            {formatRupiah(c.price)}
                                        </div>
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
                                Ringkasan Pesanan
                            </h3>
                            <dl className="mt-3 space-y-2 text-[13px]">
                                <div className="flex items-baseline justify-between">
                                    <dt className="text-slate-500">
                                        Subtotal paket
                                    </dt>
                                    <dd className="font-semibold text-slate-900 tabular-nums">
                                        {formatRupiah(quote.subtotal)}
                                    </dd>
                                </div>
                                {hasSavings && path.compare_at_price && (
                                    <div className="flex items-baseline justify-between text-emerald-700">
                                        <dt>Hemat {discountPct}%</dt>
                                        <dd className="font-bold tabular-nums">
                                            -{formatRupiah(path.savings)}
                                        </dd>
                                    </div>
                                )}
                                <div className="flex items-baseline justify-between border-t border-slate-100 pt-2.5">
                                    <dt className="font-bold text-slate-900">Total</dt>
                                    <dd className="text-[18px] font-extrabold text-brand-700 tabular-nums">
                                        {formatRupiah(quote.total)}
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
                                    : isFree
                                      ? 'Daftar Sekarang'
                                      : `Bayar ${formatRupiah(quote.total)}`}
                                <ArrowRight className="ml-1.5 size-4" />
                            </Button>

                            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-[11.5px] text-slate-600">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="size-3.5 text-brand-600" />
                                    {path.total_courses} kursus akses penuh
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
                                    Hemat {formatRupiah(path.savings)} vs beli satuan
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
