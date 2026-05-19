import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, Eye, Package, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';

import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import type { Paginator } from '@/components/data-table/data-table-pagination';
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
import { Input } from '@/components/ui/input';
import { storageUrl } from '@/lib/storage-url';

type Bundle = {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    thumbnail: string | null;
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
    const [searchInput, setSearchInput] = useState(filters.search ?? '');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteTitle, setDeleteTitle] = useState<string>('');
    const [deleting, setDeleting] = useState(false);

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(
            '/admin/bundles',
            searchInput.trim() ? { search: searchInput.trim() } : {},
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

    return (
        <>
            <Head title="Paket Kursus" />
            <div className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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
                    <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                        <Link href="/admin/bundles/create">
                            <Plus className="mr-1.5 size-4" />
                            Tambah Paket
                        </Link>
                    </Button>
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
                        <form
                            onSubmit={handleSearchSubmit}
                            className="relative w-full sm:w-[280px]"
                        >
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Cari judul atau slug paket..."
                                className="h-9 rounded-xl pl-9"
                            />
                        </form>
                    </div>

                    {bundles.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                            <div className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                                <Package className="size-5" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-slate-900">
                                    Belum ada paket
                                </p>
                                <p className="text-sm text-slate-500">
                                    Buat paket pertama dengan menggabungkan beberapa kursus.
                                </p>
                            </div>
                            <Button
                                asChild
                                className="mt-2 rounded-xl bg-brand-600 hover:bg-brand-700"
                            >
                                <Link href="/admin/bundles/create">
                                    <Plus className="mr-1.5 size-4" />
                                    Tambah Paket
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {bundles.data.map((bundle) => (
                                <BundleCard
                                    key={bundle.id}
                                    bundle={bundle}
                                    onDelete={() => confirmDelete(bundle)}
                                />
                            ))}
                        </div>
                    )}

                    <div className="mt-5">
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

function BundleCard({
    bundle,
    onDelete,
}: {
    bundle: Bundle;
    onDelete: () => void;
}) {
    const thumb = storageUrl(bundle.thumbnail);
    const savings =
        bundle.compare_at_price && bundle.compare_at_price > bundle.price
            ? bundle.compare_at_price - bundle.price
            : 0;
    const savingsPercent =
        bundle.compare_at_price && bundle.compare_at_price > 0
            ? Math.round((savings / bundle.compare_at_price) * 100)
            : 0;

    return (
        <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 transition hover:shadow-[0_12px_28px_-12px_rgba(15,23,42,0.18)] hover:ring-brand-200">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200">
                {thumb ? (
                    <img
                        src={thumb}
                        alt={bundle.title}
                        loading="lazy"
                        className="size-full object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center bg-gradient-to-br from-brand-500 to-brand-700">
                        <Package className="size-10 text-white/50" />
                    </div>
                )}

                <div className="absolute top-3 right-3">
                    {bundle.is_published ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-500/95 px-2.5 py-0.5 text-[10.5px] font-semibold tracking-wide text-white shadow ring-1 ring-emerald-300/50 backdrop-blur">
                            Published
                        </span>
                    ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-700/85 px-2.5 py-0.5 text-[10.5px] font-semibold tracking-wide text-white shadow backdrop-blur">
                            Draft
                        </span>
                    )}
                </div>

                {savingsPercent > 0 && (
                    <span className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-rose-500 px-2.5 py-0.5 text-[10.5px] font-extrabold text-white shadow">
                        Hemat {savingsPercent}%
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-brand-700 uppercase">
                        <Package className="size-3" />
                        <span>Paket Kursus</span>
                    </div>
                    <h3 className="mt-1 line-clamp-2 text-[14.5px] font-bold leading-snug text-slate-900">
                        {bundle.title}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-[11.5px] text-slate-500">
                        /{bundle.slug}
                    </p>
                </div>

                <div className="flex items-center gap-2 text-[11.5px] text-slate-600">
                    <BookOpen className="size-3.5 shrink-0 text-slate-400" />
                    <span>
                        <span className="font-bold text-slate-900 tabular-nums">
                            {bundle.courses_count}
                        </span>{' '}
                        kursus dalam paket
                    </span>
                </div>

                <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
                    <div>
                        <div className="text-[10.5px] font-semibold tracking-wide text-slate-400 uppercase">
                            Harga Paket
                        </div>
                        <div className="text-[14.5px] font-extrabold text-slate-900 tabular-nums">
                            {formatRupiah(bundle.price)}
                        </div>
                        {bundle.compare_at_price &&
                            bundle.compare_at_price > bundle.price && (
                                <div className="text-[11px] text-slate-400 line-through tabular-nums">
                                    {formatRupiah(bundle.compare_at_price)}
                                </div>
                            )}
                    </div>
                </div>

                <div className="flex items-center gap-1.5 border-t border-slate-100 pt-3">
                    <Button
                        asChild
                        size="sm"
                        className="h-8 flex-1 rounded-xl bg-brand-600 text-white shadow-sm hover:bg-brand-700"
                    >
                        <Link href={`/admin/bundles/${bundle.id}`}>
                            <Eye className="mr-1 size-3.5" />
                            Lihat Detail
                        </Link>
                    </Button>
                    <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-xl px-2.5"
                        aria-label="Edit"
                    >
                        <Link href={`/admin/bundles/${bundle.id}/edit`}>
                            <Pencil className="size-3.5" />
                        </Link>
                    </Button>
                    <Button
                        size="sm"
                        onClick={onDelete}
                        variant="outline"
                        className="h-8 rounded-xl border-rose-200 px-2.5 text-rose-600 hover:bg-rose-50"
                        aria-label={`Hapus ${bundle.title}`}
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>
            </div>
        </article>
    );
}
