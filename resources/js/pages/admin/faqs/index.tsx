import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { HelpCircle, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import {
    DataTablePagination,
    type Paginator,
} from '@/components/data-table/data-table-pagination';
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

type Faq = {
    id: number;
    category: string | null;
    question: string;
    answer: string;
    sort_order: number;
    is_active: boolean;
};

type Props = {
    faqs: Paginator<Faq>;
    filters: {
        search?: string;
        category?: string;
    };
    categoryOptions: string[];
};

export default function FaqsIndex({ faqs, filters, categoryOptions }: Props) {
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteName, setDeleteName] = useState<string>('');
    const [deleting, setDeleting] = useState(false);

    const handleSearch = (value: string) => {
        router.get(
            '/admin/faqs',
            {
                ...(value ? { search: value } : {}),
                ...(filters.category ? { category: filters.category } : {}),
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleCategoryFilter = (category: string) => {
        router.get(
            '/admin/faqs',
            {
                ...(filters.search ? { search: filters.search } : {}),
                ...(category ? { category } : {}),
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const confirmDelete = (faq: Faq) => {
        setDeleteId(faq.id);
        setDeleteName(faq.question);
    };

    const performDelete = () => {
        if (!deleteId) return;

        setDeleting(true);
        router.delete(`/admin/faqs/${deleteId}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeleteId(null);
            },
        });
    };

    const columns: ColumnDef<Faq>[] = [
        {
            id: 'sort_order',
            accessorKey: 'sort_order',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="#" />
            ),
            cell: ({ row }) => (
                <span className="font-semibold text-slate-500 tabular-nums">
                    {row.original.sort_order}
                </span>
            ),
            meta: { label: 'Urutan', className: 'w-[60px]' },
        },
        {
            id: 'question',
            accessorKey: 'question',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Pertanyaan" />
            ),
            cell: ({ row }) => (
                <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                        <HelpCircle className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                        <div className="line-clamp-1 font-semibold text-slate-900">
                            {row.original.question}
                        </div>
                        <div className="mt-0.5 line-clamp-1 text-[11.5px] text-slate-500">
                            {row.original.answer}
                        </div>
                    </div>
                </div>
            ),
            meta: { label: 'Pertanyaan' },
        },
        {
            id: 'category',
            accessorKey: 'category',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Kategori" />
            ),
            cell: ({ row }) =>
                row.original.category ? (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {row.original.category}
                    </span>
                ) : (
                    <span className="text-[12px] text-slate-400">—</span>
                ),
            meta: { label: 'Kategori', className: 'w-[140px]' },
        },
        {
            id: 'is_active',
            accessorKey: 'is_active',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Status" />
            ),
            cell: ({ row }) =>
                row.original.is_active ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        Aktif
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                        <span className="size-1.5 rounded-full bg-slate-400" />
                        Nonaktif
                    </span>
                ),
            meta: { label: 'Status', className: 'w-[110px]' },
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-1.5">
                    <Button
                        asChild
                        size="sm"
                        className="h-8 rounded-xl bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                    >
                        <Link href={`/admin/faqs/${row.original.id}/edit`}>
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
            meta: { label: 'Aksi', className: 'w-[170px] text-right' },
            enableSorting: false,
            enableHiding: false,
        },
    ];

    return (
        <>
            <Head title="FAQ" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link
                            href="/admin/dashboard"
                            className="hover:text-slate-700"
                        >
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">FAQ</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Master FAQ
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Kelola pertanyaan yang sering ditanyakan oleh pengguna.
                    </p>
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-[15px] font-bold text-slate-900">
                                Daftar FAQ
                            </h2>
                            <p className="mt-0.5 text-[12.5px] text-slate-500">
                                Total {faqs.total} FAQ terdaftar
                            </p>
                        </div>
                        <Button
                            asChild
                            className="rounded-xl bg-brand-600 hover:bg-brand-700"
                        >
                            <Link href="/admin/faqs/create">
                                <Plus className="mr-1.5 size-4" />
                                Tambah FAQ
                            </Link>
                        </Button>
                    </div>

                    {categoryOptions.length > 0 && (
                        <div className="mb-4 flex flex-wrap items-center gap-1.5">
                            <span className="mr-1 text-[11.5px] font-semibold text-slate-500">
                                Kategori:
                            </span>
                            <button
                                type="button"
                                onClick={() => handleCategoryFilter('')}
                                className={
                                    'rounded-full px-3 py-1 text-[11.5px] font-semibold transition ' +
                                    (!filters.category
                                        ? 'bg-brand-600 text-white'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
                                }
                            >
                                Semua
                            </button>
                            {categoryOptions.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => handleCategoryFilter(cat)}
                                    className={
                                        'rounded-full px-3 py-1 text-[11.5px] font-semibold transition ' +
                                        (filters.category === cat
                                            ? 'bg-brand-600 text-white'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
                                    }
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    <DataTable
                        columns={columns}
                        data={faqs.data}
                        searchValue={filters.search ?? ''}
                        searchPlaceholder="Cari pertanyaan atau jawaban..."
                        onSearchChange={handleSearch}
                        emptyState={
                            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                                <div className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                                    <HelpCircle className="size-5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-slate-900">
                                        Belum ada FAQ
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        Tambahkan FAQ pertama untuk membantu pengguna menjawab pertanyaan umum.
                                    </p>
                                </div>
                                <Button
                                    asChild
                                    className="mt-2 rounded-xl bg-brand-600 hover:bg-brand-700"
                                >
                                    <Link href="/admin/faqs/create">
                                        <Plus className="mr-1.5 size-4" />
                                        Tambah FAQ
                                    </Link>
                                </Button>
                            </div>
                        }
                    />

                    <div className="mt-4">
                        <DataTablePagination paginator={faqs} />
                    </div>
                </div>
            </div>

            <Dialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus FAQ?</DialogTitle>
                        <DialogDescription>
                            FAQ{' '}
                            <span className="font-semibold">
                                "{deleteName}"
                            </span>{' '}
                            akan dihapus permanen. Aksi ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteId(null)}
                        >
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
