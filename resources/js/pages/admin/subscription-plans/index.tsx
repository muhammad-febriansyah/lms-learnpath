import { Head, Link, router } from '@inertiajs/react';
import { Edit3, Plus, Star, Trash2 } from 'lucide-react';
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
    user_range: string;
    price_per_user_per_month: number;
    is_popular: boolean;
    is_active: boolean;
    sort_order: number;
    organizations_count: number;
};

type Props = {
    plans: Plan[];
};

function formatRupiah(value: number): string {
    if (value === 0) {
        return 'Custom';
    }
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

export default function PlansIndex({ plans }: Props) {
    const [deletePlan, setDeletePlan] = useState<Plan | null>(null);
    const [processing, setProcessing] = useState(false);

    const performDelete = () => {
        if (!deletePlan) {
            return;
        }
        setProcessing(true);
        router.delete(`/admin/subscription-plans/${deletePlan.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setDeletePlan(null);
            },
        });
    };

    return (
        <>
            <Head title="Paket Subscription B2B" />
            <div className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                            <Link href="/admin/dashboard" className="hover:text-slate-700">
                                Dashboard
                            </Link>
                            <IconChevR size={12} className="text-slate-300" />
                            <span className="font-semibold text-slate-900">
                                Paket Subscription
                            </span>
                        </nav>
                        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                            Paket Subscription B2B
                        </h1>
                        <p className="mt-1 text-[13.5px] text-slate-500">
                            Tier pricing yang tampil di halaman /corporate/pricing.
                        </p>
                    </div>
                    <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                        <Link href="/admin/subscription-plans/create">
                            <Plus className="mr-1.5 size-4" />
                            Tambah Paket
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 lg:grid-cols-4">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={cn(
                                'relative rounded-2xl bg-card p-5 ring-1 transition',
                                plan.is_popular
                                    ? 'shadow-md ring-rose-300'
                                    : 'ring-slate-200',
                                !plan.is_active && 'opacity-60',
                            )}
                        >
                            {plan.is_popular && (
                                <div className="absolute -top-2 right-4 inline-flex items-center gap-1 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                                    <Star className="size-2.5" />
                                    Popular
                                </div>
                            )}

                            <div className="flex items-baseline justify-between gap-2">
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
                                </div>
                            </div>

                            <p className="mt-1 text-[12px] text-slate-500">
                                {plan.user_range}
                            </p>

                            <div className="mt-3">
                                <div className="text-2xl font-extrabold text-brand-700">
                                    {formatRupiah(plan.price_per_user_per_month)}
                                </div>
                                {plan.price_per_user_per_month > 0 && (
                                    <div className="text-[10.5px] text-slate-500">
                                        per user / bulan
                                    </div>
                                )}
                            </div>

                            {plan.tagline && (
                                <p className="mt-3 text-[12px] text-slate-600">
                                    {plan.tagline}
                                </p>
                            )}

                            <div className="mt-4 border-t border-slate-100 pt-3 text-[11.5px] text-slate-500">
                                <strong className="text-slate-900">
                                    {plan.organizations_count}
                                </strong>{' '}
                                organisasi memakai
                            </div>

                            <div className="mt-3 flex gap-1.5">
                                <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                    className="h-8 flex-1 rounded-xl"
                                >
                                    <Link
                                        href={`/admin/subscription-plans/${plan.id}/edit`}
                                    >
                                        <Edit3 className="mr-1 size-3.5" />
                                        Edit
                                    </Link>
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 rounded-xl text-rose-600 hover:bg-rose-50"
                                    onClick={() => setDeletePlan(plan)}
                                    disabled={plan.organizations_count > 0}
                                    title={
                                        plan.organizations_count > 0
                                            ? 'Tidak bisa dihapus, ada org yang pakai'
                                            : 'Hapus'
                                    }
                                >
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
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
                            Paket subscription akan dihapus permanen. Tidak bisa di-undo.
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
