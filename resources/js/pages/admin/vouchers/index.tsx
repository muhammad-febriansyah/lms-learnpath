import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    BookOpen,
    Coins,
    Copy,
    Eye,
    Package,
    Plus,
    Tag,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { DataTable } from '@/components/data-table/data-table';
import {
    DataTablePagination,
} from '@/components/data-table/data-table-pagination';
import type { Paginator } from '@/components/data-table/data-table-pagination';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type Voucher = {
    id: number;
    code: string;
    grant_kind: 'course' | 'bundle' | 'learning_path' | 'points';
    grantable_title: string | null;
    points_amount: number | null;
    valid_from: string | null;
    valid_until: string | null;
    max_uses: number;
    uses_count: number;
    single_use_per_user: boolean;
    is_active: boolean;
    bound_email: string | null;
    bound_user: { id: number; name: string; email: string } | null;
    batch: { id: number; name: string } | null;
    note: string | null;
    created_at: string | null;
};

type Stats = {
    total: number;
    active: number;
    redeemed: number;
    remaining: number;
};

type Props = {
    vouchers: Paginator<Voucher>;
    filters: { search?: string; kind?: string; status?: string };
    stats: Stats;
};

const KIND_LABEL: Record<string, string> = {
    course: 'Course',
    bundle: 'Bundle',
    learning_path: 'Learning Path',
    points: 'Top-up Poin',
};

const KIND_ICON: Record<string, typeof Coins> = {
    course: BookOpen,
    bundle: Package,
    learning_path: Tag,
    points: Coins,
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

export default function VouchersIndex({ vouchers, filters, stats }: Props) {
    const [deleteVoucher, setDeleteVoucher] = useState<Voucher | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleFilter = (next: Record<string, string | undefined>) => {
        router.get(
            '/admin/vouchers',
            { ...filters, ...next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const copyCode = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            toast.success('Kode disalin');
        } catch {
            toast.error('Gagal menyalin');
        }
    };

    const toggleActive = (voucher: Voucher) => {
        router.post(
            `/admin/vouchers/${voucher.id}/toggle`,
            {},
            { preserveScroll: true },
        );
    };

    const performDelete = () => {
        if (!deleteVoucher) {
            return;
        }
        setProcessing(true);
        router.delete(`/admin/vouchers/${deleteVoucher.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setDeleteVoucher(null);
            },
        });
    };

    const columns: ColumnDef<Voucher>[] = [
        {
            id: 'code',
            header: 'Kode',
            cell: ({ row }) => (
                <div className="flex items-center gap-2.5">
                    <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white">
                        <Tag className="size-4" />
                    </div>
                    <div className="min-w-0">
                        <button
                            type="button"
                            onClick={() => copyCode(row.original.code)}
                            className="inline-flex items-center gap-1 font-mono text-[13px] font-bold text-slate-900 hover:text-brand-600"
                        >
                            {row.original.code}
                            <Copy className="size-3 opacity-50" />
                        </button>
                        {row.original.batch && (
                            <div className="text-[11px] text-slate-500">
                                Batch: {row.original.batch.name}
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            id: 'grant',
            header: 'Hadiah',
            cell: ({ row }) => {
                const kind = row.original.grant_kind;
                const Icon = KIND_ICON[kind] ?? Tag;
                return (
                    <div className="flex items-center gap-2 text-[13px]">
                        <Icon className="size-3.5 text-slate-400" />
                        <div className="min-w-0">
                            <div className="font-semibold text-slate-900">
                                {KIND_LABEL[kind]}
                            </div>
                            <div className="max-w-[200px] truncate text-[11.5px] text-slate-500">
                                {kind === 'points'
                                    ? `${formatNumber(row.original.points_amount ?? 0)} poin`
                                    : row.original.grantable_title ?? '-'}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            id: 'usage',
            header: 'Penggunaan',
            cell: ({ row }) => (
                <div className="text-[12.5px]">
                    <span className="font-semibold text-slate-900 tabular-nums">
                        {row.original.uses_count}/{row.original.max_uses}
                    </span>
                    {row.original.single_use_per_user && (
                        <div className="text-[10.5px] text-slate-500">
                            1x/user
                        </div>
                    )}
                </div>
            ),
        },
        {
            id: 'window',
            header: 'Window',
            cell: ({ row }) =>
                row.original.valid_from || row.original.valid_until ? (
                    <span className="text-[11.5px] text-slate-600">
                        {formatDate(row.original.valid_from)} →{' '}
                        {formatDate(row.original.valid_until)}
                    </span>
                ) : (
                    <span className="text-[11.5px] text-slate-400">
                        Selalu aktif
                    </span>
                ),
        },
        {
            id: 'binding',
            header: 'Binding',
            cell: ({ row }) =>
                row.original.bound_user ? (
                    <div className="text-[11.5px]">
                        <div className="font-semibold text-slate-700">
                            {row.original.bound_user.name}
                        </div>
                        <div className="text-slate-500">
                            {row.original.bound_user.email}
                        </div>
                    </div>
                ) : row.original.bound_email ? (
                    <span className="text-[11.5px] text-slate-700">
                        {row.original.bound_email}
                    </span>
                ) : (
                    <span className="text-[11.5px] text-slate-400">
                        Bebas
                    </span>
                ),
        },
        {
            id: 'status',
            header: 'Status',
            cell: ({ row }) =>
                row.original.uses_count >= row.original.max_uses ? (
                    <Badge className="border-slate-200 bg-slate-50 text-slate-700">
                        Habis
                    </Badge>
                ) : row.original.is_active ? (
                    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                        Aktif
                    </Badge>
                ) : (
                    <Badge className="border-slate-200 bg-slate-50 text-slate-500">
                        Nonaktif
                    </Badge>
                ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex justify-end gap-1.5">
                    <Button size="sm" variant="outline" className="h-8 rounded-xl" asChild>
                        <Link href={`/admin/vouchers/${row.original.id}`}>
                            <Eye className="size-3.5" />
                        </Link>
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-xl"
                        onClick={() => toggleActive(row.original)}
                    >
                        {row.original.is_active ? 'Off' : 'On'}
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        onClick={() => setDeleteVoucher(row.original)}
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>
            ),
            meta: { className: 'w-[150px] text-right' },
            enableSorting: false,
        },
    ];

    return (
        <>
            <Head title="Voucher Akses" />
            <div className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                            <Link href="/admin/dashboard" className="hover:text-slate-700">
                                Dashboard
                            </Link>
                            <IconChevR size={12} className="text-slate-300" />
                            <span className="font-semibold text-slate-900">
                                Voucher Akses
                            </span>
                        </nav>
                        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                            Voucher Akses
                        </h1>
                        <p className="mt-1 text-[13.5px] text-slate-500">
                            Kode untuk memberi akses gratis ke course/bundle/path atau
                            top-up poin user.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline" className="rounded-xl">
                            <Link href="/admin/voucher-batches">
                                <Package className="mr-1.5 size-4" />
                                Batch
                            </Link>
                        </Button>
                        <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                            <Link href="/admin/vouchers/create">
                                <Plus className="mr-1.5 size-4" />
                                Buat Voucher
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Total" value={formatNumber(stats.total)} tone="brand" />
                    <StatCard
                        label="Aktif & Tersedia"
                        value={formatNumber(stats.remaining)}
                        tone="emerald"
                    />
                    <StatCard
                        label="Sudah Dipakai"
                        value={formatNumber(stats.redeemed)}
                        tone="amber"
                    />
                    <StatCard
                        label="Aktif Total"
                        value={formatNumber(stats.active)}
                        tone="violet"
                    />
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <DataTable
                        columns={columns}
                        data={vouchers.data}
                        searchValue={filters.search ?? ''}
                        searchPlaceholder="Cari kode / email / catatan..."
                        onSearchChange={(v) => handleFilter({ search: v || undefined })}
                        toolbarSlot={
                            <>
                                <Select
                                    value={filters.kind ?? 'all'}
                                    onValueChange={(v) =>
                                        handleFilter({ kind: v === 'all' ? undefined : v })
                                    }
                                >
                                    <SelectTrigger className="h-9 w-[150px]">
                                        <SelectValue placeholder="Tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Tipe</SelectItem>
                                        <SelectItem value="course">Course</SelectItem>
                                        <SelectItem value="bundle">Bundle</SelectItem>
                                        <SelectItem value="learning_path">
                                            Learning Path
                                        </SelectItem>
                                        <SelectItem value="points">Top-up Poin</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filters.status ?? 'all'}
                                    onValueChange={(v) =>
                                        handleFilter({ status: v === 'all' ? undefined : v })
                                    }
                                >
                                    <SelectTrigger className="h-9 w-[150px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="available">Tersedia</SelectItem>
                                        <SelectItem value="used">Habis</SelectItem>
                                        <SelectItem value="active">Aktif</SelectItem>
                                        <SelectItem value="inactive">Nonaktif</SelectItem>
                                    </SelectContent>
                                </Select>
                            </>
                        }
                        emptyState={
                            <div className="py-10 text-center">
                                <Tag className="mx-auto mb-2 size-6 text-slate-300" />
                                <p className="text-sm font-semibold text-slate-900">
                                    Belum ada voucher
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Buat voucher tunggal atau batch untuk event/marketing.
                                </p>
                            </div>
                        }
                    />
                    <div className="mt-4">
                        <DataTablePagination paginator={vouchers} />
                    </div>
                </div>
            </div>

            <Dialog
                open={deleteVoucher !== null}
                onOpenChange={(o) => !o && setDeleteVoucher(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus voucher?</DialogTitle>
                        <DialogDescription>
                            Voucher{' '}
                            <span className="font-mono font-bold">
                                {deleteVoucher?.code}
                            </span>{' '}
                            akan dihapus permanen. Tidak bisa dihapus jika sudah pernah
                            dipakai.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteVoucher(null)}
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

type StatTone = 'brand' | 'emerald' | 'amber' | 'violet';

function StatCard({
    label,
    value,
    tone,
}: {
    label: string;
    value: string;
    tone: StatTone;
}) {
    const toneClass: Record<StatTone, string> = {
        brand: 'from-brand-500/10 to-brand-600/15 text-brand-700 ring-brand-200',
        emerald:
            'from-emerald-500/10 to-emerald-600/15 text-emerald-700 ring-emerald-200',
        violet: 'from-brand-500/10 to-brand-600/15 text-brand-700 ring-brand-200',
        amber: 'from-amber-500/10 to-amber-600/15 text-amber-700 ring-amber-200',
    };

    return (
        <div
            className={cn(
                'rounded-2xl bg-gradient-to-br p-4 ring-1',
                toneClass[tone],
            )}
        >
            <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                {label}
            </div>
            <div className="mt-1 text-2xl font-extrabold tabular-nums text-slate-900">
                {value}
            </div>
        </div>
    );
}
