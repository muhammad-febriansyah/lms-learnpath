import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    CalendarClock,
    CheckCircle2,
    Crown,
    History,
    Receipt,
    Sparkles,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

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

type Active = {
    id: number;
    plan_name: string | null;
    plan_code: string | null;
    billing_period: 'monthly' | 'quarterly' | 'yearly' | null;
    started_at: string | null;
    ends_at: string | null;
    days_remaining: number;
    features: string[];
} | null;

type HistoryItem = {
    id: number;
    plan_name: string | null;
    billing_period: 'monthly' | 'quarterly' | 'yearly' | null;
    status: 'active' | 'expired' | 'cancelled';
    started_at: string | null;
    ends_at: string | null;
    last_order: {
        order_number: string;
        total: number;
        paid_at: string | null;
    } | null;
};

type Props = {
    active: Active;
    history: HistoryItem[];
};

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

function formatDate(iso: string | null): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function statusBadge(status: HistoryItem['status']) {
    if (status === 'active') {
        return (
            <Badge className="border-emerald-300 bg-emerald-50 text-emerald-700">
                Aktif
            </Badge>
        );
    }
    if (status === 'cancelled') {
        return (
            <Badge className="border-amber-300 bg-amber-50 text-amber-700">
                Dibatalkan
            </Badge>
        );
    }
    return (
        <Badge className="border-slate-200 bg-slate-50 text-slate-600">
            Berakhir
        </Badge>
    );
}

export default function MySubscriptionIndex({ active, history }: Props) {
    const [confirmCancel, setConfirmCancel] = useState(false);

    const handleCancel = () => {
        router.post(
            '/my-subscription/cancel',
            {},
            {
                preserveScroll: true,
                onSuccess: () => setConfirmCancel(false),
            },
        );
    };

    return (
        <>
            <Head title="Langganan Saya" />
            <div className="space-y-5">
                <div>
                    <h1 className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
                        <Crown className="size-6 text-brand-600" />
                        Langganan Saya
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Kelola langganan personal Anda dan lihat riwayat pembayaran.
                    </p>
                </div>

                {active ? (
                    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-600 to-pink-600 p-1 shadow-[0_20px_50px_-20px_rgba(18,35,125,0.5)]">
                        <div className="rounded-[1rem] bg-white p-6">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-emerald-700">
                                        <BadgeCheck className="size-3" />
                                        Langganan Aktif
                                    </div>
                                    <h2 className="mt-2 text-[20px] font-extrabold text-slate-900">
                                        {active.plan_name}
                                    </h2>
                                    <p className="mt-1 text-[13px] text-slate-600">
                                        Berlaku sampai{' '}
                                        <strong className="text-slate-900">
                                            {formatDate(active.ends_at)}
                                        </strong>{' '}
                                        ({active.days_remaining} hari lagi)
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Link
                                        href="/subscribe"
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-[12.5px] font-semibold text-white hover:bg-brand-700"
                                    >
                                        Perpanjang / Upgrade
                                        <ArrowRight className="size-3.5" />
                                    </Link>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setConfirmCancel(true)}
                                        className="rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50"
                                    >
                                        Batalkan
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-xl bg-slate-50 p-3.5 ring-1 ring-slate-200">
                                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        <CalendarClock className="size-3.5" />
                                        Mulai
                                    </div>
                                    <div className="mt-1 text-[13.5px] font-bold text-slate-900">
                                        {formatDate(active.started_at)}
                                    </div>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-3.5 ring-1 ring-slate-200">
                                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        <CalendarClock className="size-3.5" />
                                        Berakhir
                                    </div>
                                    <div className="mt-1 text-[13.5px] font-bold text-slate-900">
                                        {formatDate(active.ends_at)}
                                    </div>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-3.5 ring-1 ring-slate-200">
                                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        <Sparkles className="size-3.5" />
                                        Periode
                                    </div>
                                    <div className="mt-1 text-[13.5px] font-bold capitalize text-slate-900">
                                        {active.billing_period === 'monthly'
                                            ? 'Bulanan'
                                            : active.billing_period === 'quarterly'
                                              ? 'Kuartalan'
                                              : active.billing_period === 'yearly'
                                                ? 'Tahunan'
                                                : '-'}
                                    </div>
                                </div>
                            </div>

                            {active.features.length > 0 && (
                                <div className="mt-5 rounded-xl border border-slate-200 p-4">
                                    <div className="text-[12px] font-bold uppercase tracking-wider text-slate-500">
                                        Termasuk dalam paket
                                    </div>
                                    <ul className="mt-2.5 grid gap-1.5 sm:grid-cols-2">
                                        {active.features.map((feat, i) => (
                                            <li
                                                key={i}
                                                className="flex items-start gap-2 text-[12.5px] text-slate-700"
                                            >
                                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                                                <span>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-100 text-brand-600">
                            <Crown className="size-7" />
                        </div>
                        <h2 className="mt-3 text-[16px] font-bold text-slate-900">
                            Belum punya langganan aktif
                        </h2>
                        <p className="mt-1 text-[13px] text-slate-500">
                            Mulai berlangganan untuk akses semua kursus tanpa batas.
                        </p>
                        <Link
                            href="/subscribe"
                            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-brand-700"
                        >
                            Lihat Paket Langganan
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>
                )}

                <div className="rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
                        <History className="size-4 text-slate-500" />
                        <h3 className="text-[14px] font-bold text-slate-900">
                            Riwayat Langganan
                        </h3>
                    </div>

                    {history.length === 0 ? (
                        <div className="px-5 py-10 text-center text-[13px] text-slate-500">
                            Belum ada riwayat langganan.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-[13px]">
                                <thead>
                                    <tr className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        <th className="px-5 py-2.5">Paket</th>
                                        <th className="px-5 py-2.5">Periode</th>
                                        <th className="px-5 py-2.5">Status</th>
                                        <th className="px-5 py-2.5">Pembayaran</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {history.map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-50/60">
                                            <td className="px-5 py-3">
                                                <div className="font-semibold text-slate-900">
                                                    {row.plan_name ?? '-'}
                                                </div>
                                                <div className="text-[11.5px] capitalize text-slate-500">
                                                    {row.billing_period ?? '-'}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-slate-600">
                                                <div>{formatDate(row.started_at)}</div>
                                                <div className="text-[11.5px] text-slate-400">
                                                    s/d {formatDate(row.ends_at)}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                {statusBadge(row.status)}
                                            </td>
                                            <td className="px-5 py-3">
                                                {row.last_order ? (
                                                    <Link
                                                        href={`/orders/${row.last_order.order_number}`}
                                                        className="inline-flex items-center gap-1.5 text-brand-700 hover:underline"
                                                    >
                                                        <Receipt className="size-3.5" />
                                                        <span className="font-mono text-[11.5px]">
                                                            {row.last_order.order_number}
                                                        </span>
                                                        <span className="ml-2 text-[12px] text-slate-600">
                                                            {formatRupiah(row.last_order.total)}
                                                        </span>
                                                    </Link>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="inline-flex items-center gap-2">
                            <XCircle className="size-5 text-rose-600" />
                            Batalkan langganan?
                        </DialogTitle>
                        <DialogDescription>
                            Akses Anda tetap aktif sampai{' '}
                            <strong className="text-slate-900">
                                {formatDate(active?.ends_at ?? null)}
                            </strong>
                            . Setelah itu langganan tidak akan diperpanjang otomatis dan
                            akses ke kursus akan dibatasi.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmCancel(false)}
                        >
                            Tidak, lanjutkan
                        </Button>
                        <Button
                            onClick={handleCancel}
                            className={cn(
                                'rounded-xl bg-rose-600 font-bold hover:bg-rose-700',
                            )}
                        >
                            Ya, batalkan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
