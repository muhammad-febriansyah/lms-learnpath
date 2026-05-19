import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    CheckCircle2,
    CircleDollarSign,
    Crown,
    Sparkles,
    Star,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    currency: string;
    features: string[];
    is_popular: boolean;
};

type CurrentSubscription = {
    id: number;
    plan_name: string | null;
    ends_at: string | null;
    days_remaining: number;
} | null;

type Props = {
    plans: Plan[];
    currentSubscription: CurrentSubscription;
};

type Cycle = 'monthly' | 'yearly';

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export default function SubscribeIndex({ plans, currentSubscription }: Props) {
    const [cycle, setCycle] = useState<Cycle>('monthly');

    const visiblePlans = useMemo(() => {
        if (cycle === 'yearly') {
            return plans.filter((p) => p.billing_period === 'yearly');
        }
        return plans.filter((p) => p.billing_period !== 'yearly');
    }, [cycle, plans]);

    const yearlyAvailable = plans.some((p) => p.billing_period === 'yearly');

    return (
        <>
            <Head title="Langganan Personal — Belajar Tanpa Batas" />
            <div className="space-y-10 py-8">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[11.5px] font-bold uppercase tracking-wider text-brand-700">
                        <Sparkles className="size-3" />
                        Langganan Personal
                    </div>
                    <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                        Akses Semua Kursus, Satu Langganan
                    </h1>
                    <p className="mt-3 text-[15px] text-slate-600">
                        Belajar tanpa batas. Pilih paket sesuai ritme Anda — bayar bulanan,
                        kuartalan, atau hemat lebih dengan paket tahunan.
                    </p>
                </div>

                {currentSubscription && (
                    <div className="mx-auto max-w-3xl rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="grid size-10 place-items-center rounded-xl bg-emerald-600 text-white">
                                    <BadgeCheck className="size-5" />
                                </div>
                                <div>
                                    <div className="text-[13.5px] font-bold text-emerald-900">
                                        Langganan aktif: {currentSubscription.plan_name}
                                    </div>
                                    <div className="text-[12px] text-emerald-700">
                                        Berlaku sampai{' '}
                                        {currentSubscription.ends_at &&
                                            formatDate(currentSubscription.ends_at)}{' '}
                                        ({currentSubscription.days_remaining} hari lagi)
                                    </div>
                                </div>
                            </div>
                            <Link
                                href="/my-subscription"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[12.5px] font-semibold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-50"
                            >
                                Kelola Langganan
                                <ArrowRight className="size-3.5" />
                            </Link>
                        </div>
                    </div>
                )}

                {yearlyAvailable && (
                    <div className="flex justify-center">
                        <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1 text-[12.5px]">
                            <button
                                type="button"
                                onClick={() => setCycle('monthly')}
                                className={cn(
                                    'rounded-full px-4 py-1.5 font-semibold transition',
                                    cycle === 'monthly'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700',
                                )}
                            >
                                Bulanan / Kuartalan
                            </button>
                            <button
                                type="button"
                                onClick={() => setCycle('yearly')}
                                className={cn(
                                    'inline-flex items-center gap-1 rounded-full px-4 py-1.5 font-semibold transition',
                                    cycle === 'yearly'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700',
                                )}
                            >
                                Tahunan
                                <Badge className="border-emerald-300 bg-emerald-100 px-1.5 py-0 text-[9.5px] text-emerald-700">
                                    Hemat
                                </Badge>
                            </button>
                        </div>
                    </div>
                )}

                <div
                    className={cn(
                        'mx-auto grid max-w-5xl gap-5 px-4 lg:px-0',
                        visiblePlans.length === 1
                            ? 'lg:grid-cols-1 lg:max-w-md'
                            : visiblePlans.length === 2
                              ? 'lg:grid-cols-2 lg:max-w-3xl'
                              : 'lg:grid-cols-3',
                    )}
                >
                    {visiblePlans.map((plan) => {
                        const monthlyEquivalent =
                            plan.billing_period === 'yearly'
                                ? Math.round(plan.price / 12)
                                : plan.billing_period === 'quarterly'
                                  ? Math.round(plan.price / 3)
                                  : plan.price;
                        const discountPct =
                            plan.compare_at_price && plan.compare_at_price > plan.price
                                ? Math.round(
                                      ((plan.compare_at_price - plan.price) /
                                          plan.compare_at_price) *
                                          100,
                                  )
                                : 0;

                        return (
                            <div
                                key={plan.id}
                                className={cn(
                                    'relative flex flex-col rounded-3xl bg-card p-6 ring-1 transition',
                                    plan.is_popular
                                        ? 'shadow-[0_20px_50px_-20px_rgba(18,35,125,0.4)] ring-2 ring-brand-500'
                                        : 'shadow-sm ring-slate-200',
                                )}
                            >
                                {plan.is_popular && (
                                    <div className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-500 to-brand-500 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-white shadow-md">
                                        <Star className="size-3" />
                                        Paling Populer
                                    </div>
                                )}

                                <div className="text-center">
                                    <div
                                        className={cn(
                                            'mx-auto grid size-12 place-items-center rounded-2xl',
                                            plan.is_popular
                                                ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white'
                                                : 'bg-brand-50 text-brand-700',
                                        )}
                                    >
                                        {plan.is_popular ? (
                                            <Crown className="size-6" />
                                        ) : (
                                            <CircleDollarSign className="size-6" />
                                        )}
                                    </div>
                                    <h2 className="mt-3 text-2xl font-extrabold text-slate-900">
                                        {plan.name}
                                    </h2>
                                    {plan.tagline && (
                                        <p className="mt-1 text-[12.5px] text-slate-500">
                                            {plan.tagline}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-5 text-center">
                                    {plan.compare_at_price &&
                                        plan.compare_at_price > plan.price && (
                                            <div className="text-[12px] text-slate-400 line-through">
                                                {formatRupiah(plan.compare_at_price)}
                                            </div>
                                        )}
                                    <div
                                        className={cn(
                                            'text-4xl font-extrabold tracking-tight',
                                            plan.is_popular
                                                ? 'text-brand-700'
                                                : 'text-slate-900',
                                        )}
                                    >
                                        {formatRupiah(plan.price)}
                                    </div>
                                    <div className="mt-0.5 text-[12px] text-slate-500">
                                        per {plan.period_label}
                                    </div>
                                    {plan.billing_period !== 'monthly' && (
                                        <div className="mt-1 text-[11px] text-slate-500">
                                            Setara {formatRupiah(monthlyEquivalent)} / bulan
                                        </div>
                                    )}
                                    {discountPct > 0 && (
                                        <Badge className="mt-2 border-emerald-300 bg-emerald-100 text-emerald-700">
                                            Hemat {discountPct}%
                                        </Badge>
                                    )}
                                </div>

                                <Link
                                    href={`/checkout/subscription/${plan.code}`}
                                    className={cn(
                                        'mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-[13px] font-bold text-white shadow-sm transition',
                                        plan.is_popular
                                            ? 'bg-brand-600 hover:bg-brand-700'
                                            : 'bg-brand-600 hover:bg-brand-700',
                                    )}
                                >
                                    {currentSubscription
                                        ? 'Perpanjang / Upgrade'
                                        : 'Mulai Berlangganan'}
                                    <ArrowRight className="size-4" />
                                </Link>

                                <ul className="mt-6 space-y-2 border-t border-slate-100 pt-5">
                                    {plan.features.map((feat, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-2 text-[12.5px] text-slate-700"
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
                            </div>
                        );
                    })}
                </div>

                <div className="mx-auto max-w-3xl rounded-2xl bg-slate-50 p-6 text-center text-[13px] text-slate-600 ring-1 ring-slate-200">
                    <p>
                        <strong className="text-slate-900">
                            Butuh paket korporat untuk tim?
                        </strong>{' '}
                        Kunjungi{' '}
                        <Link
                            href="/corporate/pricing"
                            className="font-semibold text-brand-700 hover:underline"
                        >
                            paket Corporate
                        </Link>{' '}
                        untuk pembelian skala perusahaan dengan dashboard HR & invoice.
                    </p>
                </div>
            </div>
        </>
    );
}
