import { Head, Link, router } from '@inertiajs/react';
import { Package, Search, Sparkles } from 'lucide-react';

import {
    DataTablePagination,
} from '@/components/data-table/data-table-pagination';
import type { Paginator } from '@/components/data-table/data-table-pagination';
import { PageHeader } from '@/components/front/page-header';
import { Badge } from '@/components/ui/badge';
import { stripHtml } from '@/lib/strip-html';

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
            <Head title="Paket Kursus · Learnpath" />

            <PageHeader
                eyebrow="Paket Hemat"
                title="Belajar lebih banyak, bayar lebih sedikit"
                description="Beli beberapa kursus sekaligus dalam satu paket dengan harga jauh lebih hemat. Akses seumur hidup ke semua kursus di paket pilihan Anda."
                breadcrumbs={[
                    { label: 'Beranda', href: '/' },
                    { label: 'Paket Kursus' },
                ]}
            >
                <div className="relative max-w-xl">
                    <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/60" />
                    <input
                        type="search"
                        defaultValue={filters.search ?? ''}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Cari paket..."
                        className="block w-full rounded-full border border-white/15 bg-white/10 px-12 py-3.5 text-[14px] text-white placeholder:text-white/60 backdrop-blur focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                </div>
            </PageHeader>

            <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
                <p className="text-[12.5px] text-slate-500">
                    <strong className="text-slate-900">{bundles.total}</strong> paket tersedia
                </p>

                {bundles.data.length === 0 ? (
                    <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                        <Package className="mx-auto size-10 text-slate-400" />
                        <p className="mt-3 text-sm font-semibold text-slate-900">
                            Belum ada paket tersedia
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Paket kursus akan segera hadir di sini.
                        </p>
                    </div>
                ) : (
                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {bundles.data.map((b) => (
                            <BundleCard key={b.id} bundle={b} />
                        ))}
                    </div>
                )}

                <div className="mt-8">
                    <DataTablePagination paginator={bundles} />
                </div>
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
                        {stripHtml(bundle.description)}
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
