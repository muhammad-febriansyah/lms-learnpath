import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Building2,
    Search,
    Wallet as WalletIcon,
} from 'lucide-react';

import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import type { Paginator } from '@/components/data-table/data-table-pagination';
import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type WalletRow = {
    id: number;
    organization: { id: number | null; name: string | null; slug: string | null };
    balance: number;
    currency: string;
    low_balance_threshold: number;
    is_low: boolean;
    updated_at: string | null;
};

type Props = {
    wallets: Paginator<WalletRow>;
    stats: {
        total_wallets: number;
        total_balance: number;
        low_count: number;
    };
    filters: { search?: string | null };
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
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function OrganizationWalletsIndex({
    wallets,
    stats,
    filters,
}: Props) {
    const handleSearch = (value: string) => {
        router.get(
            '/admin/organization-wallets',
            { search: value || undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title="E-Wallet Organisasi" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            E-Wallet Organisasi
                        </span>
                    </nav>
                    <h1 className="mt-1.5 inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
                        <WalletIcon className="size-6 text-brand-600" />
                        E-Wallet Organisasi
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Saldo wallet seluruh tenant. Klik detail untuk lihat ledger atau
                        lakukan penyesuaian manual.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <StatTile
                        label="Total Wallet"
                        value={stats.total_wallets.toLocaleString('id-ID')}
                    />
                    <StatTile
                        label="Total Saldo"
                        value={formatRupiah(stats.total_balance)}
                        tone="emerald"
                    />
                    <StatTile
                        label="Saldo Rendah"
                        value={stats.low_count.toLocaleString('id-ID')}
                        tone={stats.low_count > 0 ? 'amber' : 'slate'}
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
                                        handleSearch((e.target as HTMLInputElement).value);
                                    }
                                }}
                                placeholder="Cari nama organisasi…"
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {wallets.data.length === 0 ? (
                        <div className="px-5 py-12 text-center text-[13px] text-slate-500">
                            Belum ada wallet organisasi.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-[13px]">
                                <thead>
                                    <tr className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        <th className="px-5 py-2.5">Organisasi</th>
                                        <th className="px-5 py-2.5 text-right">Saldo</th>
                                        <th className="px-5 py-2.5">Threshold</th>
                                        <th className="px-5 py-2.5">Update</th>
                                        <th className="px-5 py-2.5"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {wallets.data.map((w) => (
                                        <tr key={w.id} className="hover:bg-slate-50/60">
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="grid size-8 place-items-center rounded-lg bg-slate-100 text-slate-500">
                                                        <Building2 className="size-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-900">
                                                            {w.organization.name ?? '-'}
                                                        </div>
                                                        <div className="text-[11.5px] text-slate-500">
                                                            {w.organization.slug}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td
                                                className={cn(
                                                    'px-5 py-3 text-right font-bold tabular-nums',
                                                    w.is_low
                                                        ? 'text-amber-700'
                                                        : 'text-slate-900',
                                                )}
                                            >
                                                {formatRupiah(w.balance)}
                                                {w.is_low && (
                                                    <Badge className="ml-2 border-amber-200 bg-amber-50 text-amber-700">
                                                        <AlertTriangle className="mr-1 size-3" />
                                                        Rendah
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-slate-600">
                                                {w.low_balance_threshold === 0
                                                    ? '-'
                                                    : formatRupiah(w.low_balance_threshold)}
                                            </td>
                                            <td className="px-5 py-3 text-slate-600">
                                                {formatDate(w.updated_at)}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <Link
                                                    href={`/admin/organization-wallets/${w.id}`}
                                                    className="inline-flex items-center gap-1 text-brand-700 hover:underline"
                                                >
                                                    Detail
                                                    <ArrowRight className="size-3.5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="border-t border-slate-100 px-5 py-3">
                        <DataTablePagination paginator={wallets} />
                    </div>
                </div>
            </div>
        </>
    );
}

function StatTile({
    label,
    value,
    tone,
}: {
    label: string;
    value: string;
    tone?: 'emerald' | 'amber' | 'slate';
}) {
    return (
        <div
            className={cn(
                'rounded-2xl bg-card p-4 ring-1',
                tone === 'amber'
                    ? 'ring-amber-200'
                    : 'ring-slate-200',
            )}
        >
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {label}
            </div>
            <div
                className={cn(
                    'mt-1 text-xl font-extrabold tabular-nums',
                    tone === 'emerald'
                        ? 'text-emerald-700'
                        : tone === 'amber'
                          ? 'text-amber-700'
                          : 'text-slate-900',
                )}
            >
                {value}
            </div>
        </div>
    );
}
