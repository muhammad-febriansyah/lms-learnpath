import { Head, useForm } from '@inertiajs/react';
import {
    ArrowRight,
    Check,
    Crown,
    Rocket,
    Send,
    Sparkles,
    Star,
    Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { FieldError } from '@/components/form/field-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Addon = { name: string; price: number; note: string | null };

type Plan = {
    id: number;
    code: string;
    name: string;
    tagline: string | null;
    min_users: number;
    max_users: number | null;
    user_range: string;
    price_per_user_per_month: number;
    currency: string;
    features: string[];
    addons: Addon[];
    is_popular: boolean;
    contact_sales_only: boolean;
    is_custom_price: boolean;
};

type Props = {
    plans: Plan[];
};

type Billing = 'monthly' | 'annual';

const ANNUAL_DISCOUNT = 0.2; // 20% off

type Accent = {
    text: string;
    badge: string;
    icon: typeof Sparkles;
    iconBg: string;
    button: string;
    check: string;
    ring: string;
};

const ACCENTS: Record<string, Accent> = {
    default: {
        text: 'text-slate-900',
        badge: 'bg-slate-50 text-slate-700 ring-slate-200',
        icon: Sparkles,
        iconBg: 'bg-slate-100 text-slate-600',
        button: 'bg-slate-900 hover:bg-slate-800 text-white',
        check: 'text-emerald-500',
        ring: 'ring-slate-200',
    },
    starter: {
        text: 'text-slate-900',
        badge: 'bg-slate-50 text-slate-700 ring-slate-200',
        icon: Sparkles,
        iconBg: 'bg-slate-100 text-slate-600',
        button: 'bg-slate-900 hover:bg-slate-800 text-white',
        check: 'text-slate-500',
        ring: 'ring-slate-200',
    },
    growth: {
        text: 'text-brand-700',
        badge: 'bg-brand-50 text-brand-700 ring-brand-100',
        icon: Rocket,
        iconBg: 'bg-brand-100 text-brand-600',
        button: 'bg-brand-600 hover:bg-brand-700 text-white',
        check: 'text-brand-500',
        ring: 'ring-brand-100',
    },
    pro: {
        text: 'text-brand-700',
        badge: 'bg-brand-50 text-brand-700 ring-brand-100',
        icon: Crown,
        iconBg: 'bg-gradient-to-br from-brand-500 to-brand-600 text-white',
        button: 'bg-gradient-to-br from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white',
        check: 'text-brand-500',
        ring: 'ring-brand-200',
    },
    enterprise: {
        text: 'text-amber-700',
        badge: 'bg-amber-50 text-amber-700 ring-amber-100',
        icon: Zap,
        iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
        button: 'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white',
        check: 'text-amber-500',
        ring: 'ring-amber-200',
    },
};

function getAccent(plan: Plan): Accent {
    const code = plan.code.toLowerCase();
    if (ACCENTS[code]) return ACCENTS[code];
    if (plan.is_custom_price) return ACCENTS.enterprise;
    if (plan.is_popular) return ACCENTS.pro;
    return ACCENTS.default;
}

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

export default function CorporatePricing({ plans }: Props) {
    const [contactPlan, setContactPlan] = useState<Plan | null>(null);
    const [billing, setBilling] = useState<Billing>('monthly');

    const form = useForm({
        subscription_plan_id: '' as number | '',
        company_name: '',
        contact_name: '',
        email: '',
        phone: '',
        employee_count: '' as number | '',
        message: '',
    });

    const visiblePlans = useMemo(
        () => plans.filter((p) => !!p.name && p.name.trim() !== ''),
        [plans],
    );

    const openContact = (plan: Plan) => {
        setContactPlan(plan);
        form.setData('subscription_plan_id', plan.id);
        if (!form.data.employee_count) {
            form.setData('employee_count', plan.min_users);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/corporate/pricing/contact', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset(
                    'company_name',
                    'contact_name',
                    'email',
                    'phone',
                    'employee_count',
                    'message',
                );
                setContactPlan(null);
            },
        });
    };

    const calcPrice = (basePrice: number) => {
        if (billing === 'annual') {
            return Math.round(basePrice * (1 - ANNUAL_DISCOUNT));
        }
        return basePrice;
    };

    return (
        <>
            <Head title="Paket Harga — Corporate Solution" />
            <div className="space-y-14 py-10 lg:py-14">
                {/* Hero */}
                <div className="mx-auto max-w-3xl px-4 text-center">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[11.5px] font-bold tracking-wider text-brand-700 uppercase">
                        <Sparkles className="size-3" />
                        Corporate Solution
                    </div>
                    <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                        Paket Harga{' '}
                        <span className="bg-gradient-to-br from-brand-600 to-brand-700 bg-clip-text text-transparent">
                            Langganan
                        </span>
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600">
                        Pilih paket yang sesuai dengan ukuran tim Anda. Semua
                        paket termasuk akses katalog course lengkap,
                        sertifikat resmi, dan dashboard analytics HR.
                    </p>

                    {/* Billing toggle */}
                    <div className="mt-7 inline-flex items-center gap-1 rounded-full bg-slate-100 p-1 ring-1 ring-slate-200">
                        <BillingToggleBtn
                            label="Bulanan"
                            active={billing === 'monthly'}
                            onClick={() => setBilling('monthly')}
                        />
                        <BillingToggleBtn
                            label="Tahunan"
                            active={billing === 'annual'}
                            badge="Hemat 20%"
                            onClick={() => setBilling('annual')}
                        />
                    </div>
                </div>

                {/* Plans */}
                <div className="mx-auto max-w-7xl px-4">
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
                        {visiblePlans.map((plan) => {
                            const accent = getAccent(plan);
                            const Icn = accent.icon;
                            const price = calcPrice(
                                plan.price_per_user_per_month,
                            );

                            return (
                                <div
                                    key={plan.id}
                                    className={cn(
                                        'group relative flex flex-col rounded-3xl bg-white p-6 transition-all duration-300',
                                        plan.is_popular
                                            ? 'scale-[1.03] shadow-[0_24px_60px_-24px_rgba(18,35,125,0.4)] ring-2 ring-brand-500'
                                            : `shadow-sm ring-1 hover:-translate-y-1 hover:shadow-lg ${accent.ring}`,
                                    )}
                                >
                                    {plan.is_popular && (
                                        <div className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-brand-600 to-brand-600 px-3 py-1 text-[10.5px] font-bold tracking-wider text-white uppercase shadow-md">
                                            <Star className="size-3 fill-current" />
                                            Paling Populer
                                        </div>
                                    )}

                                    {/* Plan header */}
                                    <div className="flex items-center gap-2.5">
                                        <span
                                            className={cn(
                                                'grid size-9 shrink-0 place-items-center rounded-xl',
                                                accent.iconBg,
                                            )}
                                        >
                                            <Icn className="size-4" />
                                        </span>
                                        <div className="min-w-0">
                                            <h2
                                                className={cn(
                                                    'text-[15.5px] font-extrabold tracking-tight',
                                                    accent.text,
                                                )}
                                            >
                                                {plan.name}
                                            </h2>
                                            <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                                                {plan.user_range}
                                            </p>
                                        </div>
                                    </div>

                                    {plan.tagline && (
                                        <p className="mt-3 text-[12.5px] leading-relaxed text-slate-600">
                                            {plan.tagline}
                                        </p>
                                    )}

                                    {/* Price */}
                                    <div className="mt-5 border-y border-slate-100 py-5">
                                        {plan.is_custom_price ? (
                                            <>
                                                <div className="text-[20px] leading-tight font-extrabold tracking-tight text-slate-900">
                                                    Custom
                                                </div>
                                                <p className="mt-1 text-[11.5px] text-slate-500">
                                                    Sesuai kebutuhan enterprise
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-[10.5px] font-bold tracking-wider text-slate-500 uppercase">
                                                        Rp
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            'text-[28px] font-extrabold tracking-tight tabular-nums',
                                                            plan.is_popular
                                                                ? 'bg-gradient-to-br from-brand-600 to-brand-700 bg-clip-text text-transparent'
                                                                : 'text-slate-900',
                                                        )}
                                                    >
                                                        {price.toLocaleString(
                                                            'id-ID',
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500">
                                                    per user / bulan
                                                    {billing === 'annual' && (
                                                        <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9.5px] font-bold text-emerald-700">
                                                            <Check className="size-2.5" />
                                                            Hemat 20%
                                                        </span>
                                                    )}
                                                </p>
                                                {billing === 'annual' && (
                                                    <p className="mt-1 text-[10.5px] text-slate-400 line-through">
                                                        {formatRupiah(
                                                            plan.price_per_user_per_month,
                                                        )}
                                                        /user/bulan
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* CTA */}
                                    <Button
                                        type="button"
                                        onClick={() => openContact(plan)}
                                        className={cn(
                                            'mt-5 h-11 w-full rounded-xl text-[13px] font-bold shadow-sm transition',
                                            accent.button,
                                        )}
                                    >
                                        {plan.is_custom_price
                                            ? 'Hubungi Sales'
                                            : 'Mulai Sekarang'}
                                        <ArrowRight className="ml-1.5 size-3.5" />
                                    </Button>

                                    {/* Features */}
                                    {plan.features.length > 0 && (
                                        <ul className="mt-6 space-y-2.5">
                                            {plan.features.map((feat, i) => (
                                                <li
                                                    key={i}
                                                    className="flex items-start gap-2 text-[12.5px] leading-relaxed text-slate-700"
                                                >
                                                    <Check
                                                        className={cn(
                                                            'mt-0.5 size-3.5 shrink-0',
                                                            accent.check,
                                                        )}
                                                        strokeWidth={3}
                                                    />
                                                    <span>{feat}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {plan.addons.length > 0 && (
                                        <div className="mt-5 border-t border-dashed border-slate-200 pt-4">
                                            <div className="text-[10.5px] font-bold tracking-wider text-slate-500 uppercase">
                                                Tambahan Opsional
                                            </div>
                                            <ul className="mt-2 space-y-1.5 text-[12px] text-slate-600">
                                                {plan.addons.map((addon, i) => (
                                                    <li
                                                        key={`addon-${i}`}
                                                        className="flex items-start justify-between gap-2"
                                                    >
                                                        <span>
                                                            {addon.name}
                                                        </span>
                                                        <strong className="shrink-0 text-slate-900 tabular-nums">
                                                            {formatRupiah(
                                                                addon.price,
                                                            )}
                                                        </strong>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Trust strip */}
                <div className="mx-auto max-w-6xl px-4">
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-6 sm:px-10">
                        <div className="grid items-center gap-6 sm:grid-cols-3 sm:divide-x sm:divide-slate-200">
                            <TrustItem
                                value="50+"
                                label="Perusahaan klien"
                            />
                            <TrustItem
                                value="100rb+"
                                label="Karyawan aktif belajar"
                            />
                            <TrustItem
                                value="4 minggu"
                                label="Avg. implementasi"
                            />
                        </div>
                    </div>
                </div>

                {/* CTA bottom */}
                <div className="mx-auto max-w-3xl px-4 text-center">
                    <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-brand-950 p-8 text-white shadow-xl sm:p-10">
                        <h3 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                            Butuh kustomisasi lebih lanjut?
                        </h3>
                        <p className="mx-auto mt-2 max-w-xl text-[13.5px] text-white/80">
                            Integrasi LMS internal, white-label, atau custom
                            course development? Tim sales kami bantu menyusun
                            paket khusus.
                        </p>
                        <Button
                            asChild
                            size="lg"
                            className="mt-5 h-12 rounded-xl bg-white px-6 text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-brand-50 hover:text-brand-700"
                        >
                            <a href="/corporate/demo">
                                Request Demo
                                <ArrowRight className="ml-1.5 size-4" />
                            </a>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Contact form modal */}
            <Dialog
                open={contactPlan !== null}
                onOpenChange={(open) => !open && setContactPlan(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            Hubungi Sales — Paket {contactPlan?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Isi data perusahaan Anda. Tim sales akan menghubungi
                            dalam 1×24 jam untuk diskusi penawaran khusus.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submit} className="space-y-3">
                        <div>
                            <Label htmlFor="company_name">
                                Nama Perusahaan *
                            </Label>
                            <Input
                                id="company_name"
                                value={form.data.company_name}
                                onChange={(e) =>
                                    form.setData('company_name', e.target.value)
                                }
                                placeholder="PT Maju Bersama"
                            />
                            <FieldError message={form.errors.company_name} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="contact_name">Nama Anda *</Label>
                                <Input
                                    id="contact_name"
                                    value={form.data.contact_name}
                                    onChange={(e) =>
                                        form.setData(
                                            'contact_name',
                                            e.target.value,
                                        )
                                    }
                                />
                                <FieldError
                                    message={form.errors.contact_name}
                                />
                            </div>
                            <div>
                                <Label htmlFor="employee_count">
                                    Jumlah Karyawan
                                </Label>
                                <Input
                                    id="employee_count"
                                    type="number"
                                    min={1}
                                    value={form.data.employee_count}
                                    onChange={(e) =>
                                        form.setData(
                                            'employee_count',
                                            e.target.value === ''
                                                ? ''
                                                : Number(e.target.value),
                                        )
                                    }
                                />
                                <FieldError
                                    message={form.errors.employee_count}
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.data.email}
                                onChange={(e) =>
                                    form.setData('email', e.target.value)
                                }
                                placeholder="hr@perusahaan.com"
                            />
                            <FieldError message={form.errors.email} />
                        </div>
                        <div>
                            <Label htmlFor="phone">No. HP / WhatsApp</Label>
                            <Input
                                id="phone"
                                value={form.data.phone}
                                onChange={(e) =>
                                    form.setData('phone', e.target.value)
                                }
                                placeholder="081234567890"
                            />
                            <FieldError message={form.errors.phone} />
                        </div>
                        <div>
                            <Label htmlFor="message">Pesan (opsional)</Label>
                            <Textarea
                                id="message"
                                rows={3}
                                value={form.data.message}
                                onChange={(e) =>
                                    form.setData('message', e.target.value)
                                }
                                placeholder="Kebutuhan training, timeline, dll..."
                                maxLength={2000}
                            />
                            <FieldError message={form.errors.message} />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setContactPlan(null)}
                                disabled={form.processing}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className={cn(
                                    'rounded-xl font-bold',
                                    contactPlan
                                        ? getAccent(contactPlan).button
                                        : 'bg-brand-600 hover:bg-brand-700',
                                )}
                            >
                                <Send className="mr-1.5 size-4" />
                                {form.processing
                                    ? 'Mengirim...'
                                    : 'Kirim Permintaan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

function BillingToggleBtn({
    label,
    active,
    onClick,
    badge,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
    badge?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition',
                active
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900',
            )}
        >
            {label}
            {badge && (
                <span
                    className={cn(
                        'rounded-full px-1.5 py-0.5 text-[9.5px] font-bold tracking-wider uppercase',
                        active
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-emerald-50 text-emerald-600',
                    )}
                >
                    {badge}
                </span>
            )}
        </button>
    );
}

function TrustItem({ value, label }: { value: string; label: string }) {
    return (
        <div className="px-4 text-center first:pl-0 last:pr-0">
            <div className="text-[24px] font-extrabold tracking-tight text-slate-900 tabular-nums sm:text-[28px]">
                {value}
            </div>
            <div className="mt-0.5 text-[11.5px] font-semibold tracking-wider text-slate-500 uppercase">
                {label}
            </div>
        </div>
    );
}
