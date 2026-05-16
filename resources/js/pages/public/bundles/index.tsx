import { Head, Link, router } from '@inertiajs/react';
import { Package, Search, Sparkles } from 'lucide-react';

import {
    DataTablePagination,
} from '@/components/data-table/data-table-pagination';
import type { Paginator } from '@/components/data-table/data-table-pagination';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

type Bundle = {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    thumbnail: string | null;
    price: number;
    compare_at_price: number | null;
    savings: number;
    courses_count: number;
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
    const handleSearch = (value: string) => {
        router.get(
            '/bundles',
            value ? { search: value } : {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Paket Kursus" />
            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                <div>
                    <h1 className="inline-flex items-center gap-2 text-3xl font-extrabold tracking-tight text-slate-900">
                        <Package className="size-7 text-brand-600" />
                        Paket Kursus
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Beli beberapa kursus sekaligus dengan harga lebih hemat.
                    </p>
                </div>

                <div className="relative max-w-md">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        defaultValue={filters.search ?? ''}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Cari paket..."
                        className="pl-9"
                    />
                </div>

                {bundles.data.length === 0 ? (
                    <div className="rounded-2xl bg-card p-12 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <Package className="mx-auto size-10 text-slate-400" />
                        <p className="mt-3 text-sm font-semibold text-slate-900">
                            Belum ada paket tersedia
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Paket kursus akan segera hadir di sini.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {bundles.data.map((b) => (
                            <BundleCard key={b.id} bundle={b} />
                        ))}
                    </div>
                )}

                <DataTablePagination paginator={bundles} />
            </div>
        </>
    );
}

function BundleCard({ bundle }: { bundle: Bundle }) {
    const hasDiscount = bundle.savings > 0;
    const discountPct =
        hasDiscount && bundle.compare_at_price
            ? Math.round((bundle.savings / bundle.compare_at_price) * 100)
            : 0;

    return (
        <Link
            href={`/bundles/${bundle.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 transition-shadow hover:shadow-md"
        >
            <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-brand-500 to-violet-700">
                {bundle.thumbnail ? (
                    <img
                        src={bundle.thumbnail}
                        alt={bundle.title}
                        className="size-full object-cover"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center text-white">
                        <Package className="size-12 opacity-50" />
                    </div>
                )}
                {hasDiscount && (
                    <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white shadow">
                        <Sparkles className="size-3" />
                        Hemat {discountPct}%
                    </div>
                )}
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                    <Badge className="border-transparent bg-brand-50 text-brand-700 hover:bg-brand-50">
                        {bundle.courses_count} kursus
                    </Badge>
                </div>
                <h3 className="line-clamp-2 text-[15px] font-bold text-slate-900 group-hover:text-brand-700">
                    {bundle.title}
                </h3>
                {bundle.description && (
                    <p className="line-clamp-2 text-[12.5px] text-slate-500">
                        {bundle.description}
                    </p>
                )}
                <div className="mt-auto">
                    <div className="flex items-baseline gap-2">
                        <span className="text-[18px] font-extrabold text-slate-900">
                            {formatRupiah(bundle.price)}
                        </span>
                        {bundle.compare_at_price && bundle.compare_at_price > bundle.price && (
                            <span className="text-[12.5px] text-slate-400 line-through">
                                {formatRupiah(bundle.compare_at_price)}
                            </span>
                        )}
                    </div>
                    {hasDiscount && (
                        <p className="mt-0.5 text-[11.5px] font-semibold text-emerald-600">
                            Hemat {formatRupiah(bundle.savings)}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
}
