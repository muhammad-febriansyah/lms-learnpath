import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Tag as TagIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import {
    DataTablePagination
    
} from '@/components/data-table/data-table-pagination';
import type {Paginator} from '@/components/data-table/data-table-pagination';
import { IconChevR } from '@/components/learnpath-icons';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Tag = {
    id: number;
    name: string;
    slug: string;
    courses_count?: number;
};

type Props = {
    tags: Paginator<Tag>;
    filters: {
        search?: string;
    };
};

export default function TagsIndex({ tags, filters }: Props) {
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteName, setDeleteName] = useState<string>('');
    const [deleting, setDeleting] = useState(false);

    const handleSearch = (value: string) => {
        router.get(
            '/admin/tags',
            value ? { search: value } : {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const confirmDelete = (tag: Tag) => {
        setDeleteId(tag.id);
        setDeleteName(tag.name);
    };

    const performDelete = () => {
        if (!deleteId) {
return;
}

        setDeleting(true);
        router.delete(`/admin/tags/${deleteId}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeleteId(null);
            },
        });
    };

    const columns: ColumnDef<Tag>[] = [
        {
            id: 'name',
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Nama Tag" />
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand-600">
                        <TagIcon className="size-3.5" />
                    </div>
                    <div>
                        <div className="font-semibold text-slate-900">{row.original.name}</div>
                        <div className="text-[11.5px] text-slate-500">#{row.original.slug}</div>
                    </div>
                </div>
            ),
            meta: { label: 'Nama' },
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
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-1">
                    <Button asChild variant="ghost" size="icon" className="size-8">
                        <Link href={`/admin/tags/${row.original.id}/edit`}>
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
            <Head title="Tag" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Tag</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Master Tag
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Label fleksibel untuk filter dan pencarian course.
                    </p>
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-[15px] font-bold text-slate-900">
                                Daftar Tag
                            </h2>
                            <p className="mt-0.5 text-[12.5px] text-slate-500">
                                Total {tags.total} tag terdaftar
                            </p>
                        </div>
                        <Button
                            asChild
                            className="rounded-xl bg-brand-600 hover:bg-brand-700"
                        >
                            <Link href="/admin/tags/create">
                                <Plus className="mr-1.5 size-4" />
                                Tambah Tag
                            </Link>
                        </Button>
                    </div>

                    <DataTable
                        columns={columns}
                        data={tags.data}
                        searchValue={filters.search ?? ''}
                        searchPlaceholder="Cari nama atau slug tag..."
                        onSearchChange={handleSearch}
                        emptyState={
                            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                                <div className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                                    <TagIcon className="size-5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-slate-900">
                                        Belum ada tag
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        Buat tag untuk membantu pengelompokan course lebih fleksibel.
                                    </p>
                                </div>
                                <Button
                                    asChild
                                    className="mt-2 rounded-xl bg-brand-600 hover:bg-brand-700"
                                >
                                    <Link href="/admin/tags/create">
                                        <Plus className="mr-1.5 size-4" />
                                        Tambah Tag
                                    </Link>
                                </Button>
                            </div>
                        }
                    />

                    <div className="mt-4">
                        <DataTablePagination paginator={tags} />
                    </div>
                </div>
            </div>

            <Dialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus tag?</DialogTitle>
                        <DialogDescription>
                            Tag <span className="font-semibold">"{deleteName}"</span> akan dihapus
                            permanen. Aksi ini tidak dapat dibatalkan.
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
