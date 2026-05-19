import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Ban,
    BookOpen,
    Coins,
    Compass,
    Edit3,
    Package,
    Plus,
    RotateCcw,
    Tag,
    Trash2,
    Trophy,
} from 'lucide-react';
import { useState } from 'react';

import { DataTable } from '@/components/data-table/data-table';
import {
    DataTablePagination,
} from '@/components/data-table/data-table-pagination';
import type { Paginator } from '@/components/data-table/data-table-pagination';
import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type Offer = {
    id: number;
    redeemable_type: 'course' | 'bundle' | 'learning_path' | string;
    redeemable_id: number;
    redeemable_title: string;
    point_price: number;
    is_active: boolean;
    redeemable_from: string | null;
    redeemable_until: string | null;
    max_per_user: number | null;
    max_total: number | null;
    redemptions_count: number;
    note: string | null;
    creator: { id: number; name: string } | null;
    created_at: string | null;
};

type Redemption = {
    id: number;
    user: { id: number; name: string; email: string } | null;
    redeemable_type: string;
    redeemable_title: string;
    points_spent: number;
    status: string;
    refunded_at: string | null;
    refund_reason: string | null;
    created_at: string | null;
};

type Stats = {
    total_offers: number;
    active_offers: number;
    total_redemptions: number;
    total_points_redeemed: number;
};

type Props = {
    offers: Paginator<Offer>;
    recent_redemptions: Redemption[];
    filters: { search?: string; status?: string; type?: string };
    stats: Stats;
};

const TYPE_LABEL: Record<string, string> = {
    course: 'Course',
    bundle: 'Bundle',
    learning_path: 'Learning Path',
};

const TYPE_ICON = {
    course: BookOpen,
    bundle: Package,
    learning_path: Compass,
} as const;

const TYPE_COLOR: Record<string, string> = {
    course: 'bg-brand-50 text-brand-700 ring-brand-200',
    bundle: 'bg-violet-50 text-violet-700 ring-violet-200',
    learning_path: 'bg-amber-50 text-amber-700 ring-amber-200',
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

export default function PointRedemptionsIndex({
    offers,
    recent_redemptions,
    filters,
    stats,
}: Props) {
    const [deleteOffer, setDeleteOffer] = useState<Offer | null>(null);
    const [refundTarget, setRefundTarget] = useState<Redemption | null>(null);
    const [refundReason, setRefundReason] = useState('');
    const [cancelEnrollment, setCancelEnrollment] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleFilter = (next: Record<string, string | undefined>) => {
        router.get(
            '/admin/point-redemptions',
            { ...filters, ...next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const performDelete = () => {
        if (!deleteOffer) {
            return;
        }
        setProcessing(true);
        router.delete(`/admin/point-redemptions/${deleteOffer.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setDeleteOffer(null);
            },
        });
    };

    const performRefund = () => {
        if (!refundTarget) {
            return;
        }
        setProcessing(true);
        router.post(
            `/admin/point-redemptions/redemptions/${refundTarget.id}/refund`,
            {
                reason: refundReason,
                cancel_enrollment: cancelEnrollment,
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setRefundTarget(null);
                    setRefundReason('');
                    setCancelEnrollment(false);
                },
            },
        );
    };

    const offerColumns: ColumnDef<Offer>[] = [
        {
            id: 'redeemable',
            header: 'Item',
            cell: ({ row }) => {
                const type = row.original.redeemable_type;
                const Icon =
                    TYPE_ICON[type as keyof typeof TYPE_ICON] ?? BookOpen;
                return (
                    <div className="flex items-center gap-2.5">
                        <div
                            className={cn(
                                'grid size-9 shrink-0 place-items-center rounded-xl ring-1',
                                TYPE_COLOR[type] ?? TYPE_COLOR.course,
                            )}
                        >
                            <Icon className="size-4" />
                        </div>
                        <div className="min-w-0">
                            <div className="max-w-[280px] truncate text-[13.5px] font-semibold text-slate-900">
                                {row.original.redeemable_title}
                            </div>
                            <div className="text-[11px] text-slate-500">
                                {TYPE_LABEL[type] ?? type}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            id: 'price',
            header: 'Harga',
            cell: ({ row }) => (
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2 py-1 text-[13px] font-bold text-amber-700 ring-1 ring-amber-200">
                    <Coins className="size-3.5" />
                    {formatNumber(row.original.point_price)} poin
                </div>
            ),
        },
        {
            id: 'window',
            header: 'Window',
            cell: ({ row }) => {
                const from = row.original.redeemable_from;
                const until = row.original.redeemable_until;
                if (!from && !until) {
                    return <span className="text-[12px] text-slate-400">Selalu aktif</span>;
                }
                return (
                    <span className="text-[12px] text-slate-600">
                        {formatDate(from)} → {formatDate(until)}
                    </span>
                );
            },
        },
        {
            id: 'caps',
            header: 'Kuota',
            cell: ({ row }) => {
                const total = row.original.max_total;
                const used = row.original.redemptions_count;
                const perUser = row.original.max_per_user;
                return (
                    <div className="text-[12px]">
                        <div className="font-semibold text-slate-900 tabular-nums">
                            {used}
                            {total ? ` / ${total}` : ' / ∞'}
                        </div>
                        {perUser ? (
                            <div className="text-[11px] text-slate-500">
                                max {perUser}/user
                            </div>
                        ) : null}
                    </div>
                );
            },
        },
        {
            id: 'status',
            header: 'Status',
            cell: ({ row }) =>
                row.original.is_active ? (
                    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                        Aktif
                    </Badge>
                ) : (
                    <Badge className="border-slate-200 bg-slate-50 text-slate-700">
                        Nonaktif
                    </Badge>
                ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex justify-end gap-1.5">
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-xl"
                        asChild
                    >
                        <Link href={`/admin/point-redemptions/${row.original.id}/edit`}>
                            <Edit3 className="size-3.5" />
                        </Link>
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        onClick={() => setDeleteOffer(row.original)}
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>
            ),
            enableSorting: false,
            meta: { className: 'w-[120px] text-right' },
        },
    ];

    return (
        <>
            <Head title="Tukar Poin" />
            <div className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                            <Link href="/admin/dashboard" className="hover:text-slate-700">
                                Dashboard
                            </Link>
                            <IconChevR size={12} className="text-slate-300" />
                            <span className="font-semibold text-slate-900">
                                Tukar Poin
                            </span>
                        </nav>
                        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                            Marketplace Tukar Poin
                        </h1>
                        <p className="mt-1 text-[13.5px] text-slate-500">
                            Atur course, bundle, atau learning path yang dapat ditukar
                            dengan poin oleh peserta.
                        </p>
                    </div>
                    <Button
                        asChild
                        className="rounded-xl bg-brand-600 hover:bg-brand-700"
                    >
                        <Link href="/admin/point-redemptions/create">
                            <Plus className="mr-1.5 size-4" />
                            Tambah Penawaran
                        </Link>
                    </Button>
                </div>

                {/* Stat cards */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={Tag}
                        label="Total Penawaran"
                        value={formatNumber(stats.total_offers)}
                        tone="brand"
                    />
                    <StatCard
                        icon={Tag}
                        label="Aktif"
                        value={formatNumber(stats.active_offers)}
                        tone="emerald"
                    />
                    <StatCard
                        icon={Trophy}
                        label="Total Redemption"
                        value={formatNumber(stats.total_redemptions)}
                        tone="violet"
                    />
                    <StatCard
                        icon={Coins}
                        label="Poin Ditukar"
                        value={formatNumber(stats.total_points_redeemed)}
                        tone="amber"
                    />
                </div>

                {/* Offers */}
                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4">
                        <h2 className="text-[15px] font-bold text-slate-900">
                            Daftar Penawaran
                        </h2>
                        <p className="mt-0.5 text-[12.5px] text-slate-500">
                            Penawaran ini muncul di halaman detail course/bundle/path.
                        </p>
                    </div>

                    <DataTable
                        columns={offerColumns}
                        data={offers.data}
                        searchValue={filters.search ?? ''}
                        searchPlaceholder="Cari catatan / item..."
                        onSearchChange={(value) =>
                            handleFilter({ search: value || undefined })
                        }
                        toolbarSlot={
                            <>
                                <Select
                                    value={filters.type ?? 'all'}
                                    onValueChange={(value) =>
                                        handleFilter({
                                            type: value === 'all' ? undefined : value,
                                        })
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
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filters.status ?? 'all'}
                                    onValueChange={(value) =>
                                        handleFilter({
                                            status: value === 'all' ? undefined : value,
                                        })
                                    }
                                >
                                    <SelectTrigger className="h-9 w-[140px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
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
                                    Belum ada penawaran
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Tambah penawaran agar peserta bisa menukar poin.
                                </p>
                            </div>
                        }
                    />

                    <div className="mt-4">
                        <DataTablePagination paginator={offers} />
                    </div>
                </div>

                {/* Recent redemptions */}
                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4">
                        <h2 className="text-[15px] font-bold text-slate-900">
                            Redemption Terbaru
                        </h2>
                        <p className="mt-0.5 text-[12.5px] text-slate-500">
                            50 redemption terakhir.
                        </p>
                    </div>

                    {recent_redemptions.length === 0 ? (
                        <div className="py-8 text-center text-[13px] text-slate-500">
                            Belum ada redemption.
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {recent_redemptions.map((r) => (
                                <li
                                    key={r.id}
                                    className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="text-[13.5px] font-semibold text-slate-900">
                                            {r.user?.name ?? '-'}
                                        </div>
                                        <div className="text-[11.5px] text-slate-500">
                                            {r.user?.email ?? '-'} ·{' '}
                                            <span className="font-mono">
                                                {TYPE_LABEL[r.redeemable_type] ??
                                                    r.redeemable_type}
                                            </span>{' '}
                                            · {r.redeemable_title}
                                        </div>
                                    </div>
                                    <div className="inline-flex items-center gap-1 text-[12.5px] font-bold tabular-nums text-amber-700">
                                        <Coins className="size-3" />
                                        {formatNumber(r.points_spent)}
                                    </div>
                                    {r.status === 'completed' ? (
                                        <>
                                            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                                                completed
                                            </Badge>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 rounded-xl text-rose-600 hover:bg-rose-50"
                                                onClick={() => setRefundTarget(r)}
                                            >
                                                <RotateCcw className="mr-1 size-3.5" />
                                                Refund
                                            </Button>
                                        </>
                                    ) : (
                                        <Badge className="border-slate-200 bg-slate-50 text-slate-700">
                                            <Ban className="mr-1 size-3" />
                                            refunded
                                        </Badge>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <Dialog
                open={deleteOffer !== null}
                onOpenChange={(open) => !open && setDeleteOffer(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus penawaran ini?</DialogTitle>
                        <DialogDescription>
                            Penawaran untuk{' '}
                            <span className="font-semibold">
                                {deleteOffer?.redeemable_title}
                            </span>{' '}
                            akan dihapus. Tidak bisa dihapus jika sudah ada peserta yang
                            menukar.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteOffer(null)}
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

            <Dialog
                open={refundTarget !== null}
                onOpenChange={(open) => !open && setRefundTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Refund redemption?</DialogTitle>
                        <DialogDescription>
                            Poin <span className="font-bold">
                                {formatNumber(refundTarget?.points_spent ?? 0)}
                            </span>{' '}
                            akan dikembalikan ke {refundTarget?.user?.name ?? 'user'}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <Label htmlFor="reason">Alasan (opsional)</Label>
                            <Input
                                id="reason"
                                value={refundReason}
                                onChange={(e) => setRefundReason(e.target.value)}
                                placeholder="Contoh: course di-takedown"
                                maxLength={500}
                            />
                        </div>
                        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-slate-700">
                            <Checkbox
                                checked={cancelEnrollment}
                                onCheckedChange={(c) => setCancelEnrollment(!!c)}
                            />
                            Batalkan enrollment juga (hanya yang belum selesai)
                        </label>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setRefundTarget(null)}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button onClick={performRefund} disabled={processing}>
                            {processing ? 'Memproses...' : 'Refund'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

type StatTone = 'brand' | 'emerald' | 'violet' | 'amber';

function StatCard({
    icon: Icon,
    label,
    value,
    tone,
}: {
    icon: typeof Coins;
    label: string;
    value: string;
    tone: StatTone;
}) {
    const toneClass: Record<StatTone, string> = {
        brand: 'from-brand-500/10 to-brand-600/15 text-brand-700 ring-brand-200',
        emerald: 'from-emerald-500/10 to-emerald-600/15 text-emerald-700 ring-emerald-200',
        violet: 'from-violet-500/10 to-violet-600/15 text-violet-700 ring-violet-200',
        amber: 'from-amber-500/10 to-amber-600/15 text-amber-700 ring-amber-200',
    };

    return (
        <div
            className={cn(
                'flex items-center gap-3 rounded-2xl bg-gradient-to-br p-4 ring-1',
                toneClass[tone],
            )}
        >
            <div className="grid size-10 place-items-center rounded-xl bg-white/70">
                <Icon className="size-4" />
            </div>
            <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                    {label}
                </div>
                <div className="text-xl font-extrabold tabular-nums text-slate-900">
                    {value}
                </div>
            </div>
        </div>
    );
}
