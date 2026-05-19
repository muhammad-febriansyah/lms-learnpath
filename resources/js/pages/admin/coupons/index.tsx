import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Tag, Trash2, X } from 'lucide-react';
import { useState } from 'react';

import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
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

type Coupon = {
    id: number;
    code: string;
    name: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    max_discount: number | null;
    applicable_to: 'all' | 'specific';
    max_uses: number | null;
    uses_count: number;
    is_active: boolean;
    courses_count: number;
    created_at: string | null;
};

type Props = {
    coupons: Paginator<Coupon>;
    filters: { search?: string };
};

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

function formatDiscount(c: Coupon): string {
    if (c.discount_type === 'percentage') {
        return c.max_discount
            ? `${c.discount_value}% (maks ${formatRupiah(c.max_discount)})`
            : `${c.discount_value}%`;
    }

    return formatRupiah(c.discount_value);
}

export default function CouponsIndex({ coupons, filters }: Props) {
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteCode, setDeleteCode] = useState<string>('');
    const [deleting, setDeleting] = useState(false);

    const handleSearch = (value: string) => {
        router.get(
            '/admin/coupons',
            value ? { search: value } : {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const confirmDelete = (c: Coupon) => {
        setDeleteId(c.id);
        setDeleteCode(c.code);
    };

    const performDelete = () => {
        if (!deleteId) return;
        setDeleting(true);
        router.delete(`/admin/coupons/${deleteId}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeleteId(null);
            },
        });
    };

    const columns: ColumnDef<Coupon>[] = [
        {
            id: 'code',
            accessorKey: 'code',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Kode" />
            ),
            cell: ({ row }) => (
                <div>
                    <div className="font-mono text-[13px] font-bold tracking-wider text-slate-900">
                        {row.original.code}
                    </div>
                    {row.original.name && (
                        <div className="text-[11.5px] text-slate-500">{row.original.name}</div>
                    )}
                </div>
            ),
            meta: { label: 'Kode' },
        },
        {
            id: 'discount',
            header: 'Diskon',
            cell: ({ row }) => (
                <span className="font-semibold text-slate-700">
                    {formatDiscount(row.original)}
                </span>
            ),
            meta: { label: 'Diskon' },
        },
        {
            id: 'scope',
            header: 'Scope',
            cell: ({ row }) =>
                row.original.applicable_to === 'all' ? (
                    <Badge className="border-transparent bg-brand-50 text-brand-700 hover:bg-brand-50">
                        Semua kursus
                    </Badge>
                ) : (
                    <Badge className="border-transparent bg-amber-50 text-amber-700 hover:bg-amber-50">
                        {row.original.courses_count} kursus
                    </Badge>
                ),
            meta: { label: 'Scope' },
        },
        {
            id: 'uses',
            header: 'Pemakaian',
            cell: ({ row }) => (
                <span className="tabular-nums text-slate-700">
                    {row.original.uses_count}
                    {row.original.max_uses !== null && (
                        <span className="text-slate-400"> / {row.original.max_uses}</span>
                    )}
                </span>
            ),
            meta: { label: 'Pemakaian' },
        },
        {
            id: 'is_active',
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) =>
                row.original.is_active ? (
                    <Badge className="border-transparent bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                        Aktif
                    </Badge>
                ) : (
                    <Badge className="border-transparent bg-slate-100 text-slate-600 hover:bg-slate-100">
                        Nonaktif
                    </Badge>
                ),
            meta: { label: 'Status' },
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-1.5">
                    <Button asChild size="sm" className="h-8 rounded-xl bg-emerald-600 text-white shadow-sm hover:bg-emerald-700">
                        <Link href={`/admin/coupons/${row.original.id}/edit`}>
                            <Pencil className="mr-1 size-3.5" />
                            Edit
                        </Link>
                    </Button>
                    <Button
                        size="sm"
                        className="h-8 rounded-xl bg-rose-600 text-white shadow-sm hover:bg-rose-700"
                        onClick={() => confirmDelete(row.original)}
                    >
                        <Trash2 className="mr-1 size-3.5" />
                        Hapus
                    </Button>
                </div>
            ),
            meta: { label: 'Aksi', className: 'w-[100px] text-right' },
            enableSorting: false,
            enableHiding: false,
        },
    ];

    return (
        <>
            <Head title="Voucher" />
            <div className="space-y-5">
                <PageHeader />

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-[15px] font-bold text-slate-900">
                                Daftar Voucher
                            </h2>
                            <p className="mt-0.5 text-[12.5px] text-slate-500">
                                Total {coupons.total} voucher
                            </p>
                        </div>
                        <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                            <Link href="/admin/coupons/create">
                                <Plus className="mr-1.5 size-4" />
                                Tambah Voucher
                            </Link>
                        </Button>
                    </div>

                    <DataTable
                        columns={columns}
                        data={coupons.data}
                        searchValue={filters.search ?? ''}
                        searchPlaceholder="Cari kode atau nama voucher..."
                        onSearchChange={handleSearch}
                        emptyState={
                            <EmptyData
                                title="Belum ada voucher"
                                description="Buat voucher pertama untuk memberi diskon ke pelanggan."
                                actionHref="/admin/coupons/create"
                                actionLabel="Tambah Voucher"
                            />
                        }
                    />

                    <div className="mt-4">
                        <DataTablePagination paginator={coupons} />
                    </div>
                </div>
            </div>

            <Dialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus voucher?</DialogTitle>
                        <DialogDescription>
                            Voucher <span className="font-mono font-semibold">{deleteCode}</span>{' '}
                            akan dihapus. Order yang sudah memakai voucher ini tidak terpengaruh.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>
                            <X className="mr-1.5 size-4" />
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={performDelete}
                            disabled={deleting}
                        >
                            <Trash2 className="mr-1.5 size-4" />
                            {deleting ? 'Menghapus...' : 'Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function PageHeader() {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                    <Link href="/admin/dashboard" className="hover:text-slate-700">
                        Dashboard
                    </Link>
                    <IconChevR size={12} className="text-slate-300" />
                    <span className="font-semibold text-slate-900">Voucher</span>
                </nav>
                <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                    Kode Voucher
                </h1>
                <p className="mt-1 text-[13.5px] text-slate-500">
                    Kelola promo & diskon yang bisa dipakai saat checkout.
                </p>
            </div>
        </div>
    );
}

function EmptyData({
    title,
    description,
    actionHref,
    actionLabel,
}: {
    title: string;
    description: string;
    actionHref?: string;
    actionLabel?: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <Tag className="size-5" />
            </div>
            <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                <p className="text-sm text-slate-500">{description}</p>
            </div>
            {actionHref && actionLabel && (
                <Button asChild className="mt-2 rounded-xl bg-brand-600 hover:bg-brand-700">
                    <Link href={actionHref}>
                        <Plus className="mr-1.5 size-4" />
                        {actionLabel}
                    </Link>
                </Button>
            )}
        </div>
    );
}
