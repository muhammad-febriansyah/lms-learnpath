import { Head, Link, router } from '@inertiajs/react';
import { CalendarClock, Edit3, Plus, Star, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

import { IconChevR } from '@/components/learnpath-icons';
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
    currency: string;
    features: string[];
    is_popular: boolean;
    is_active: boolean;
    sort_order: number;
    subscriptions_count: number;
    active_count: number;
};

type Props = {
    plans: Plan[];
};

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

export default function B2cPlansIndex({ plans }: Props) {
    const [deletePlan, setDeletePlan] = useState<Plan | null>(null);
    const [processing, setProcessing] = useState(false);

    const performDelete = () => {
        if (!deletePlan) return;
        setProcessing(true);
        router.delete(`/admin/b2c-plans/${deletePlan.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setDeletePlan(null);
            },
        });
    };

    return (
        <>
            <Head title="Paket Langganan B2C" />
            <div className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                            <Link href="/admin/dashboard" className="hover:text-slate-700">
                                Dashboard
                            </Link>
                            <IconChevR size={12} className="text-slate-300" />
                            <span className="font-semibold text-slate-900">
                                Paket Langganan B2C
                            </span>
                        </nav>
                        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                            Paket Langganan B2C
                        </h1>
                        <p className="mt-1 text-[13.5px] text-slate-500">
                            Paket langganan personal yang tampil di halaman /subscribe.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline" className="rounded-xl">
                            <Link href="/admin/b2c-subscriptions">
                                <Users className="mr-1.5 size-4" />
                                Daftar Pelanggan
                            </Link>
                        </Button>
                        <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                            <Link href="/admin/b2c-plans/create">
                                <Plus className="mr-1.5 size-4" />
                                Tambah Paket
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={cn(
                                'relative rounded-2xl bg-card p-5 ring-1 transition',
                                plan.is_popular
                                    ? 'shadow-md ring-brand-300'
                                    : 'ring-slate-200',
                                !plan.is_active && 'opacity-60',
                            )}
                        >
                            {plan.is_popular && (
                                <div className="absolute -top-2 right-4 inline-flex items-center gap-1 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                                    <Star className="size-2.5" />
                                    Popular
                                </div>
                            )}

                            <div>
                                <Badge
                                    variant="outline"
                                    className="font-mono text-[10.5px]"
                                >
                                    {plan.code}
                                </Badge>
                                <h2 className="mt-2 text-lg font-extrabold text-slate-900">
                                    {plan.name}
                                </h2>
                                {plan.tagline && (
                                    <p className="mt-0.5 text-[12px] text-slate-500">
                                        {plan.tagline}
                                    </p>
                                )}
                            </div>

                            <div className="mt-3">
                                {plan.compare_at_price &&
                                    plan.compare_at_price > plan.price && (
                                        <div className="text-[11px] text-slate-400 line-through">
                                            {formatRupiah(plan.compare_at_price)}
                                        </div>
                                    )}
                                <div className="text-2xl font-extrabold text-brand-700">
                                    {formatRupiah(plan.price)}
                                </div>
                                <div className="text-[10.5px] text-slate-500">
                                    per {plan.period_label}
                                </div>
                            </div>

                            <div className="mt-3 flex items-center gap-3 text-[11.5px] text-slate-600">
                                <span className="inline-flex items-center gap-1">
                                    <CalendarClock className="size-3.5 text-slate-400" />
                                    {plan.duration_days} hari
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <Users className="size-3.5 text-slate-400" />
                                    <strong className="text-slate-900">
                                        {plan.active_count}
                                    </strong>
                                    /{plan.subscriptions_count}
                                </span>
                            </div>

                            {!plan.is_active && (
                                <Badge className="mt-3 border-slate-200 bg-slate-100 text-slate-600">
                                    Non-aktif
                                </Badge>
                            )}

                            <div className="mt-4 flex gap-1.5">
                                <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                    className="h-8 flex-1 rounded-xl"
                                >
                                    <Link href={`/admin/b2c-plans/${plan.id}/edit`}>
                                        <Edit3 className="mr-1 size-3.5" />
                                        Edit
                                    </Link>
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 rounded-xl text-rose-600 hover:bg-rose-50"
                                    onClick={() => setDeletePlan(plan)}
                                    disabled={plan.subscriptions_count > 0}
                                    title={
                                        plan.subscriptions_count > 0
                                            ? 'Ada subscriber, nonaktifkan saja'
                                            : 'Hapus'
                                    }
                                >
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {plans.length === 0 && (
                        <div className="col-span-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center text-[13px] text-slate-500">
                            Belum ada paket. Klik "Tambah Paket" untuk membuat paket pertama.
                        </div>
                    )}
                </div>
            </div>

            <Dialog
                open={deletePlan !== null}
                onOpenChange={(open) => !open && setDeletePlan(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus paket {deletePlan?.name}?</DialogTitle>
                        <DialogDescription>
                            Paket akan dihapus permanen. Tidak bisa di-undo.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeletePlan(null)}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={performDelete}
                            disabled={processing}
                        >
                            {processing ? 'Menghapus...' : 'Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
