import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import {
    DataTablePagination
    
} from '@/components/data-table/data-table-pagination';
import type {Paginator} from '@/components/data-table/data-table-pagination';
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

type Category = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    courses_count?: number;
    created_at: string;
};

type Props = {
    categories: Paginator<Category>;
    filters: {
        search?: string;
    };
};

export default function CategoriesIndex({ categories, filters }: Props) {
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteName, setDeleteName] = useState<string>('');
    const [deleting, setDeleting] = useState(false);

    const handleSearch = (value: string) => {
        router.get(
            '/admin/categories',
            value ? { search: value } : {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const confirmDelete = (cat: Category) => {
        setDeleteId(cat.id);
        setDeleteName(cat.name);
    };

    const performDelete = () => {
        if (!deleteId) {
return;
}

        setDeleting(true);
        router.delete(`/admin/categories/${deleteId}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeleteId(null);
            },
        });
    };

    const columns: ColumnDef<Category>[] = [
        {
            id: 'name',
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Nama Kategori" />
            ),
            cell: ({ row }) => (
                <div>
                    <div className="font-semibold text-slate-900">{row.original.name}</div>
                    <div className="text-[11.5px] text-slate-500">/{row.original.slug}</div>
                </div>
            ),
            meta: { label: 'Nama' },
        },
        {
            id: 'description',
            accessorKey: 'description',
            header: 'Deskripsi',
            cell: ({ row }) => (
                <div className="max-w-md truncate text-slate-600">
                    {row.original.description || (
                        <span className="text-slate-400 italic">Tanpa deskripsi</span>
                    )}
                </div>
            ),
            meta: { label: 'Deskripsi' },
        },
        {
            id: 'courses_count',
            accessorKey: 'courses_count',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Kursus" />
            ),
            cell: ({ row }) => (
                <span className="font-semibold text-slate-700 tabular-nums">
                    {row.original.courses_count ?? 0}
                </span>
            ),
            meta: { label: 'Jumlah Kursus' },
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
                        <Link href={`/admin/categories/${row.original.id}/edit`}>
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
            <Head title="Kategori" />
            <div className="space-y-5">
                <PageHeader />

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-[15px] font-bold text-slate-900">
                                Daftar Kategori
                            </h2>
                            <p className="mt-0.5 text-[12.5px] text-slate-500">
                                Total {categories.total} kategori terdaftar
                            </p>
                        </div>
                        <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                            <Link href="/admin/categories/create">
                                <Plus className="mr-1.5 size-4" />
                                Tambah Kategori
                            </Link>
                        </Button>
                    </div>

                    <DataTable
                        columns={columns}
                        data={categories.data}
                        searchValue={filters.search ?? ''}
                        searchPlaceholder="Cari nama atau slug kategori..."
                        onSearchChange={handleSearch}
                        emptyState={
                            <EmptyData
                                title="Belum ada kategori"
                                description="Mulai dengan menambahkan kategori pertama Anda."
                                actionHref="/admin/categories/create"
                                actionLabel="Tambah Kategori"
                            />
                        }
                    />

                    <div className="mt-4">
                        <DataTablePagination paginator={categories} />
                    </div>
                </div>
            </div>

            <Dialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus kategori?</DialogTitle>
                        <DialogDescription>
                            Kategori <span className="font-semibold">"{deleteName}"</span> akan
                            dihapus permanen. Aksi ini tidak dapat dibatalkan.
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
                    <span className="font-semibold text-slate-900">Kategori</span>
                </nav>
                <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                    Master Kategori
                </h1>
                <p className="mt-1 text-[13.5px] text-slate-500">
                    Kelola pengelompokan course berdasarkan tema atau topik.
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
                <Plus className="size-5" />
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
