import { Head, Link, router } from '@inertiajs/react';
import { Coins, Download, Eye, Package, Plus, Tag } from 'lucide-react';

import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import type { Paginator } from '@/components/data-table/data-table-pagination';
import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Batch = {
    id: number;
    name: string;
    prefix: string | null;
    grant_kind: string;
    grantable_title: string | null;
    points_amount: number | null;
    valid_from: string | null;
    valid_until: string | null;
    total_codes: number;
    redeemed_count: number;
    single_use_per_user: boolean;
    is_active: boolean;
    note: string | null;
    creator: { id: number; name: string } | null;
    created_at: string | null;
};

type Props = {
    batches: Paginator<Batch>;
    filters: { search?: string };
};

const KIND_LABEL: Record<string, string> = {
    course: 'Course',
    bundle: 'Bundle',
    learning_path: 'Learning Path',
    points: 'Top-up Poin',
};

function formatNumber(n: number): string {
    return new Intl.NumberFormat('id-ID').format(n);
}

function formatDate(iso: string | null): string {
    if (!iso) {
        return '-';
    }
    return new Date(iso).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function BatchesIndex({ batches, filters }: Props) {
    const handleSearch = (value: string) => {
        router.get(
            '/admin/voucher-batches',
            { search: value || undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Batch Voucher" />
            <div className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                            <Link href="/admin/vouchers" className="hover:text-slate-700">
                                Voucher Akses
                            </Link>
                            <IconChevR size={12} className="text-slate-300" />
                            <span className="font-semibold text-slate-900">Batch</span>
                        </nav>
                        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                            Batch Voucher
                        </h1>
                        <p className="mt-1 text-[13.5px] text-slate-500">
                            Generate banyak kode sekaligus untuk event/marketing campaign.
                        </p>
                    </div>
                    <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                        <Link href="/admin/voucher-batches/create">
                            <Plus className="mr-1.5 size-4" />
                            Generate Batch
                        </Link>
                    </Button>
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4 max-w-md">
                        <Input
                            value={filters.search ?? ''}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Cari nama batch atau prefix..."
                            className="h-9"
                        />
                    </div>

                    {batches.data.length === 0 ? (
                        <div className="py-12 text-center">
                            <Package className="mx-auto mb-3 size-6 text-slate-400" />
                            <p className="text-sm font-semibold text-slate-900">
                                Belum ada batch
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                Buat batch pertama untuk generate puluhan/ratusan kode sekaligus.
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {batches.data.map((b) => {
                                const remaining = b.total_codes - b.redeemed_count;
                                const usagePct =
                                    b.total_codes > 0
                                        ? Math.round((b.redeemed_count / b.total_codes) * 100)
                                        : 0;
                                return (
                                    <li
                                        key={b.id}
                                        className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center"
                                    >
                                        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                                            <Package className="size-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Link
                                                    href={`/admin/voucher-batches/${b.id}`}
                                                    className="text-[14px] font-bold text-slate-900 hover:text-brand-600"
                                                >
                                                    {b.name}
                                                </Link>
                                                {b.prefix && (
                                                    <Badge
                                                        variant="outline"
                                                        className="font-mono text-[10.5px]"
                                                    >
                                                        {b.prefix}-
                                                    </Badge>
                                                )}
                                                {b.is_active ? (
                                                    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                                                        Aktif
                                                    </Badge>
                                                ) : (
                                                    <Badge className="border-slate-200 bg-slate-100 text-slate-500">
                                                        Nonaktif
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11.5px] text-slate-500">
                                                <span>{KIND_LABEL[b.grant_kind]}</span>
                                                <span className="size-1 rounded-full bg-slate-300" />
                                                <span>
                                                    {b.grant_kind === 'points'
                                                        ? `${formatNumber(b.points_amount ?? 0)} poin / kode`
                                                        : b.grantable_title ?? '-'}
                                                </span>
                                                {(b.valid_from || b.valid_until) && (
                                                    <>
                                                        <span className="size-1 rounded-full bg-slate-300" />
                                                        <span>
                                                            {formatDate(b.valid_from)} →{' '}
                                                            {formatDate(b.valid_until)}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            <div className="mt-2 max-w-md">
                                                <div className="flex items-center justify-between text-[11px] text-slate-500">
                                                    <span>
                                                        <strong className="text-slate-900">
                                                            {b.redeemed_count}
                                                        </strong>{' '}
                                                        /{' '}
                                                        <strong className="text-slate-900">
                                                            {b.total_codes}
                                                        </strong>{' '}
                                                        terpakai · sisa{' '}
                                                        <strong
                                                            className={cn(
                                                                'tabular-nums',
                                                                remaining > 0
                                                                    ? 'text-emerald-600'
                                                                    : 'text-rose-600',
                                                            )}
                                                        >
                                                            {remaining}
                                                        </strong>
                                                    </span>
                                                    <span>{usagePct}%</span>
                                                </div>
                                                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                                                        style={{ width: `${usagePct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1.5">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 rounded-xl"
                                                asChild
                                            >
                                                <a
                                                    href={`/admin/voucher-batches/${b.id}/export`}
                                                >
                                                    <Download className="mr-1 size-3.5" />
                                                    CSV
                                                </a>
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-8 rounded-xl bg-brand-600 hover:bg-brand-700"
                                                asChild
                                            >
                                                <Link
                                                    href={`/admin/voucher-batches/${b.id}`}
                                                >
                                                    <Eye className="mr-1 size-3.5" />
                                                    Detail
                                                </Link>
                                            </Button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    <div className="mt-4">
                        <DataTablePagination paginator={batches} />
                    </div>
                </div>
            </div>
        </>
    );
}
