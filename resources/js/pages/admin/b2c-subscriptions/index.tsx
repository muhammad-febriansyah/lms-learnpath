import { Head, Link, router } from '@inertiajs/react';
import { CalendarClock, Crown, Search, Users } from 'lucide-react';

import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import type { Paginator } from '@/components/data-table/data-table-pagination';
import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Subscription = {
    id: number;
    user: { id: number; name: string; email: string } | null;
    plan: {
        id: number;
        name: string;
        code: string;
        billing_period: 'monthly' | 'quarterly' | 'yearly';
    } | null;
    status: 'active' | 'expired' | 'cancelled';
    started_at: string | null;
    ends_at: string | null;
    cancelled_at: string | null;
};

type Stats = {
    total: number;
    active: number;
    expired: number;
    cancelled: number;
};

type Props = {
    subscriptions: Paginator<Subscription>;
    stats: Stats;
    filters: { status?: string | null; search?: string | null };
};

const STATUS_LABEL: Record<Subscription['status'], string> = {
    active: 'Aktif',
    expired: 'Berakhir',
    cancelled: 'Dibatalkan',
};

const STATUS_STYLE: Record<Subscription['status'], string> = {
    active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    expired: 'border-slate-200 bg-slate-50 text-slate-500',
    cancelled: 'border-amber-200 bg-amber-50 text-amber-700',
};

function formatDate(iso: string | null): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function B2cSubscriptionsIndex({ subscriptions, stats, filters }: Props) {
    const handleFilter = (next: Record<string, string | undefined>) => {
        router.get(
            '/admin/b2c-subscriptions',
            { ...filters, ...next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Pelanggan Langganan B2C" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <Link href="/admin/b2c-plans" className="hover:text-slate-700">
                            Paket Langganan
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Pelanggan</span>
                    </nav>
                    <h1 className="mt-1.5 inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
                        <Crown className="size-6 text-brand-600" />
                        Pelanggan Langganan B2C
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Pengguna yang berlangganan paket personal.
                    </p>
                </div>

                <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                    <StatCard
                        label="Total"
                        value={stats.total}
                        active={!filters.status}
                        onClick={() => handleFilter({ status: undefined })}
                        icon={<Users className="size-4" />}
                    />
                    <StatCard
                        label="Aktif"
                        value={stats.active}
                        active={filters.status === 'active'}
                        onClick={() =>
                            handleFilter({
                                status: filters.status === 'active' ? undefined : 'active',
                            })
                        }
                        tone="emerald"
                    />
                    <StatCard
                        label="Berakhir"
                        value={stats.expired}
                        active={filters.status === 'expired'}
                        onClick={() =>
                            handleFilter({
                                status: filters.status === 'expired' ? undefined : 'expired',
                            })
                        }
                        tone="slate"
                    />
                    <StatCard
                        label="Dibatalkan"
                        value={stats.cancelled}
                        active={filters.status === 'cancelled'}
                        onClick={() =>
                            handleFilter({
                                status:
                                    filters.status === 'cancelled' ? undefined : 'cancelled',
                            })
                        }
                        tone="amber"
                    />
                </div>

                <div className="rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="flex items-center gap-3 border-b border-slate-100 p-4">
                        <div className="relative max-w-xs flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                defaultValue={filters.search ?? ''}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleFilter({
                                            search: (e.target as HTMLInputElement).value || undefined,
                                        });
                                    }
                                }}
                                placeholder="Cari nama atau email pengguna…"
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {subscriptions.data.length === 0 ? (
                        <div className="px-5 py-12 text-center text-[13px] text-slate-500">
                            Belum ada pelanggan untuk filter ini.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-[13px]">
                                <thead>
                                    <tr className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        <th className="px-5 py-2.5">Pengguna</th>
                                        <th className="px-5 py-2.5">Paket</th>
                                        <th className="px-5 py-2.5">Status</th>
                                        <th className="px-5 py-2.5">Mulai</th>
                                        <th className="px-5 py-2.5">Berakhir</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {subscriptions.data.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-slate-50/60">
                                            <td className="px-5 py-3">
                                                <div className="font-semibold text-slate-900">
                                                    {sub.user?.name ?? '-'}
                                                </div>
                                                <div className="text-[11.5px] text-slate-500">
                                                    {sub.user?.email}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="font-semibold text-slate-900">
                                                    {sub.plan?.name ?? '-'}
                                                </div>
                                                <div className="text-[11.5px] capitalize text-slate-500">
                                                    {sub.plan?.billing_period}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <Badge className={STATUS_STYLE[sub.status]}>
                                                    {STATUS_LABEL[sub.status]}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-3 text-slate-600">
                                                <span className="inline-flex items-center gap-1">
                                                    <CalendarClock className="size-3 text-slate-400" />
                                                    {formatDate(sub.started_at)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-slate-600">
                                                {formatDate(sub.ends_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="border-t border-slate-100 px-5 py-3">
                        <DataTablePagination paginator={subscriptions} />
                    </div>
                </div>
            </div>
        </>
    );
}

function StatCard({
    label,
    value,
    active,
    onClick,
    icon,
    tone,
}: {
    label: string;
    value: number;
    active: boolean;
    onClick: () => void;
    icon?: React.ReactNode;
    tone?: 'emerald' | 'amber' | 'slate';
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'rounded-2xl border p-3 text-left transition',
                active
                    ? 'border-brand-300 bg-brand-50 ring-2 ring-brand-200'
                    : 'border-slate-200 bg-card hover:border-slate-300',
            )}
        >
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {label}
            </div>
            <div
                className={cn(
                    'mt-1 text-2xl font-extrabold tabular-nums',
                    tone === 'emerald'
                        ? 'text-emerald-700'
                        : tone === 'amber'
                          ? 'text-amber-700'
                          : 'text-slate-900',
                )}
            >
                {value}
            </div>
        </button>
    );
}
