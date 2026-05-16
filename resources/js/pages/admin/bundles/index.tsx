import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Package, Pencil, Plus, Trash2 } from 'lucide-react';
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

type Bundle = {
    id: number;
    title: string;
    slug: string;
    price: number;
    compare_at_price: number | null;
    is_published: boolean;
    courses_count: number;
    created_at: string | null;
};

type Props = {
    bundles: Paginator<Bundle>;
    filters: { search?: string };
};

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

export default function BundlesIndex({ bundles, filters }: Props) {
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteTitle, setDeleteTitle] = useState<string>('');
    const [deleting, setDeleting] = useState(false);

    const handleSearch = (value: string) => {
        router.get(
            '/admin/bundles',
            value ? { search: value } : {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const confirmDelete = (b: Bundle) => {
        setDeleteId(b.id);
        setDeleteTitle(b.title);
    };

    const performDelete = () => {
        if (!deleteId) return;
        setDeleting(true);
        router.delete(`/admin/bundles/${deleteId}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeleteId(null);
            },
        });
    };

    const columns: ColumnDef<Bundle>[] = [
        {
            id: 'title',
            accessorKey: 'title',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Judul Paket" />
            ),
            cell: ({ row }) => (
                <div>
                    <div className="font-semibold text-slate-900">{row.original.title}</div>
                    <div className="text-[11.5px] text-slate-500">/{row.original.slug}</div>
                </div>
            ),
            meta: { label: 'Judul' },
        },
        {
            id: 'courses_count',
            header: 'Kursus',
            cell: ({ row }) => (
                <Badge className="border-transparent bg-brand-50 text-brand-700 hover:bg-brand-50">
                    {row.original.courses_count} kursus
                </Badge>
            ),
            meta: { label: 'Kursus' },
        },
        {
            id: 'price',
            header: 'Harga',
            cell: ({ row }) => (
                <div>
                    <div className="font-semibold text-slate-900 tabular-nums">
                        {formatRupiah(row.original.price)}
                    </div>
                    {row.original.compare_at_price && (
                        <div className="text-[11.5px] text-slate-400 line-through tabular-nums">
                            {formatRupiah(row.original.compare_at_price)}
                        </div>
                    )}
                </div>
            ),
            meta: { label: 'Harga' },
        },
        {
            id: 'is_published',
            accessorKey: 'is_published',
            header: 'Status',
            cell: ({ row }) =>
                row.original.is_published ? (
                    <Badge className="border-transparent bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                        Published
                    </Badge>
                ) : (
                    <Badge className="border-transparent bg-slate-100 text-slate-600 hover:bg-slate-100">
                        Draft
                    </Badge>
                ),
            meta: { label: 'Status' },
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-1">
                    <Button asChild variant="ghost" size="icon" className="size-8">
                        <Link href={`/admin/bundles/${row.original.id}/edit`}>
                            <Pencil className="size-4" />
                            <span className="sr-only">Edit</span>
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                        onClick={() => confirmDelete(row.original)}
                    >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Hapus</span>
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
            <Head title="Paket Kursus" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Paket Kursus</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Paket Kursus
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Bundle beberapa kursus dalam satu paket dengan harga lebih hemat.
                    </p>
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-[15px] font-bold text-slate-900">
                                Daftar Paket
                            </h2>
                            <p className="mt-0.5 text-[12.5px] text-slate-500">
                                Total {bundles.total} paket
                            </p>
                        </div>
                        <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                            <Link href="/admin/bundles/create">
                                <Plus className="mr-1.5 size-4" />
                                Tambah Paket
                            </Link>
                        </Button>
                    </div>

                    <DataTable
                        columns={columns}
                        data={bundles.data}
                        searchValue={filters.search ?? ''}
                        searchPlaceholder="Cari judul atau slug paket..."
                        onSearchChange={handleSearch}
                        emptyState={
                            <EmptyData
                                title="Belum ada paket"
                                description="Buat paket pertama dengan menggabungkan beberapa kursus."
                                actionHref="/admin/bundles/create"
                                actionLabel="Tambah Paket"
                            />
                        }
                    />

                    <div className="mt-4">
                        <DataTablePagination paginator={bundles} />
                    </div>
                </div>
            </div>

            <Dialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus paket?</DialogTitle>
                        <DialogDescription>
                            Paket <span className="font-semibold">"{deleteTitle}"</span> akan
                            dihapus. Order yang sudah memakai paket ini tidak terpengaruh.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={performDelete}
                            disabled={deleting}
                        >
                            {deleting ? 'Menghapus...' : 'Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
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
                <Package className="size-5" />
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
