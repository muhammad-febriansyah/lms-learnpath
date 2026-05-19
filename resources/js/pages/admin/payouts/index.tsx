import { Head, Link, router } from '@inertiajs/react';
import {
    Banknote,
    CheckCircle2,
    ChevronRight,
    Clock,
    Hourglass,
    Search,
    Wallet,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

import {
    DataTablePagination,
    type Paginator,
} from '@/components/data-table/data-table-pagination';
import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Status = 'pending' | 'approved' | 'rejected' | 'paid';

type PayoutRow = {
    id: number;
    user: { id: number; name: string; email: string } | null;
    gross_amount: number;
    fee_amount: number;
    net_amount: number;
    bank_name: string;
    account_number: string;
    account_holder: string;
    status: Status;
    created_at: string | null;
    paid_at: string | null;
};

type Props = {
    payouts: Paginator<PayoutRow>;
    filters: { status: string | null; search: string | null };
    statusOptions: { value: string; label: string }[];
    counts: Record<Status, number>;
};

function rupiah(n: number): string {
    return 'Rp ' + n.toLocaleString('id-ID');
}

function formatDate(iso: string | null): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

const STATUS_META: Record<Status, { label: string; tint: string; icon: typeof Clock }> = {
    pending: { label: 'Menunggu', tint: 'bg-amber-50 text-amber-700', icon: Hourglass },
    approved: { label: 'Disetujui', tint: 'bg-sky-50 text-sky-700', icon: CheckCircle2 },
    rejected: { label: 'Ditolak', tint: 'bg-rose-50 text-rose-700', icon: XCircle },
    paid: { label: 'Lunas', tint: 'bg-emerald-50 text-emerald-700', icon: Banknote },
};

export default function PayoutsIndex({ payouts, filters, counts }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilter = (next: Partial<{ status: string | null; search: string | null }>) => {
        const params: Record<string, string> = {};
        const merged = { ...filters, ...next };
        if (merged.status) params.status = merged.status;
        if (merged.search) params.search = merged.search;
        router.get('/admin/payouts', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title="Penarikan" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Penarikan</span>
                    </nav>
                    <h1 className="mt-1.5 inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
                        <Wallet className="size-6 text-brand-600" />
                        Penarikan Instruktur
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Kelola permintaan penarikan dana dari instruktur. Setujui, tolak,
                        atau tandai lunas dengan bukti transfer.
                    </p>
                </div>

                {/* Status chips */}
                <div className="flex flex-wrap gap-2">
                    <Badge
                        className={cn(
                            'cursor-pointer border-transparent text-[10.5px]',
                            !filters.status
                                ? 'bg-brand-600 text-white hover:bg-brand-600'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                        )}
                        onClick={() => applyFilter({ status: null })}
                    >
                        Semua
                    </Badge>
                    {(['pending', 'approved', 'rejected', 'paid'] as Status[]).map((s) => {
                        const meta = STATUS_META[s];
                        const isActive = filters.status === s;

                        return (
                            <Badge
                                key={s}
                                className={cn(
                                    'cursor-pointer border-transparent text-[10.5px]',
                                    isActive
                                        ? 'bg-brand-600 text-white hover:bg-brand-600'
                                        : meta.tint + ' hover:opacity-80',
                                )}
                                onClick={() => applyFilter({ status: s })}
                            >
                                {meta.label}{' '}
                                <span className="ml-1 opacity-70 tabular-nums">
                                    {counts[s] ?? 0}
                                </span>
                            </Badge>
                        );
                    })}
                </div>

                {/* Search */}
                <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-card p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                        <Input
                            className="pl-8"
                            placeholder="Cari nama / email instruktur…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilter({ search })}
                        />
                    </div>
                    <Button onClick={() => applyFilter({ search })} className="bg-brand-600 hover:bg-brand-700">
                        Filter
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSearch('');
                            router.get('/admin/payouts', {}, { replace: true });
                        }}
                    >
                        Reset
                    </Button>
                </div>

                {/* List */}
                <div className="rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    {payouts.data.length === 0 ? (
                        <div className="px-5 py-16 text-center">
                            <Wallet className="mx-auto mb-3 size-7 text-slate-400" />
                            <p className="text-sm font-semibold text-slate-900">
                                Tidak ada penarikan
                            </p>
                            <p className="mt-1 text-[12.5px] text-slate-500">
                                Belum ada permintaan yang cocok dengan filter.
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {payouts.data.map((p) => {
                                const meta = STATUS_META[p.status];
                                const Icon = meta.icon;

                                return (
                                    <li key={p.id}>
                                        <Link
                                            href={`/admin/payouts/${p.id}`}
                                            className="flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50"
                                        >
                                            <div className={`grid size-10 shrink-0 place-items-center rounded-xl ${meta.tint}`}>
                                                <Icon className="size-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="truncate text-[13.5px] font-bold text-slate-900">
                                                        {p.user?.name ?? '—'}
                                                    </div>
                                                    <Badge className={cn('border-transparent text-[10px]', meta.tint)}>
                                                        {meta.label}
                                                    </Badge>
                                                </div>
                                                <div className="mt-0.5 truncate text-[11.5px] text-slate-500">
                                                    {p.user?.email} · {p.bank_name} {p.account_number}
                                                </div>
                                                <div className="mt-1 text-[11.5px] text-slate-500">
                                                    Diajukan {formatDate(p.created_at)}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[15px] font-extrabold text-slate-900 tabular-nums">
                                                    {rupiah(p.gross_amount)}
                                                </div>
                                                {p.fee_amount > 0 && (
                                                    <div className="text-[11px] text-slate-500 tabular-nums">
                                                        Net {rupiah(p.net_amount)}
                                                    </div>
                                                )}
                                            </div>
                                            <ChevronRight className="size-4 shrink-0 text-slate-400" />
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {payouts.data.length > 0 && (
                        <div className="border-t border-slate-100 p-3">
                            <DataTablePagination paginator={payouts} />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
