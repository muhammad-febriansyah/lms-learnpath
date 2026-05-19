import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BookOpen, Clock, Package, Sparkles, Star } from 'lucide-react';

import { PageHeader } from '@/components/front/page-header';
import {
    RedeemPointButton,
    type PointOffer,
} from '@/components/redeem-point-button';
import { Badge } from '@/components/ui/badge';
import { stripHtml } from '@/lib/strip-html';

type Course = {
    id: number;
    title: string;
    subtitle: string | null;
    slug: string;
    thumbnail: string | null;
    price: number;
    level: string | null;
    duration_minutes: number;
    average_rating: number;
};

type Bundle = {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    thumbnail: string | null;
    price: number;
    compare_at_price: number;
    savings: number;
    courses: Course[];
};

type Props = {
    bundle: Bundle;
    pointOffer: PointOffer | null;
};

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

function formatDuration(minutes: number): string {
    if (!minutes) return '-';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}j`;
    return `${h}j ${m}m`;
}

export default function BundleShow({ bundle, pointOffer }: Props) {
    const hasDiscount = bundle.savings > 0;
    const discountPct = hasDiscount
        ? Math.round((bundle.savings / bundle.compare_at_price) * 100)
        : 0;

    return (
        <>
            <Head title={`${bundle.title} · Learnpath`} />

            <PageHeader
                eyebrow="Paket Kursus"
                title={bundle.title}
                description={bundle.description ? stripHtml(bundle.description, 240) : undefined}
                breadcrumbs={[
                    { label: 'Beranda', href: '/' },
                    { label: 'Paket Kursus', href: '/bundles' },
                    { label: bundle.title },
                ]}
            >
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-white/85">
                    <span className="inline-flex items-center gap-1.5">
                        <BookOpen className="size-4 text-brand-300" />
                        {bundle.courses.length} kursus
                    </span>
                    {hasDiscount && (
                        <span className="inline-flex items-center gap-1.5">
                            <Sparkles className="size-4 text-emerald-300" />
                            Hemat {discountPct}% — {formatRupiah(bundle.savings)}
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-4 text-brand-300" />
                        Akses seumur hidup
                    </span>
                </div>
            </PageHeader>

            <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
                <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-8">
                        {/* Cover */}
                        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-900 ring-1 ring-slate-200">
                            <div className="aspect-[16/8] w-full overflow-hidden">
                                {bundle.thumbnail ? (
                                    <img
                                        src={bundle.thumbnail}
                                        alt={bundle.title}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <div className="flex size-full items-center justify-center text-white">
                                        <Package className="size-20 opacity-40" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Courses in bundle */}
                        <div>
                            <h2 className="text-[22px] font-extrabold tracking-tight text-slate-900 sm:text-[26px]">
                                Kursus dalam paket ini
                            </h2>
                            <p className="mt-2 text-[14px] text-slate-600">
                                {bundle.courses.length} kursus dengan akses penuh seumur hidup.
                            </p>
                            <ul className="mt-6 space-y-3">
                                {bundle.courses.map((course, idx) => (
                                    <li
                                        key={course.id}
                                        className="flex gap-4 rounded-2xl bg-white p-5 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:ring-brand-200"
                                    >
                                        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-[14px] font-extrabold text-brand-700">
                                            {String(idx + 1).padStart(2, '0')}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <Link
                                                href={`/courses/${course.slug}`}
                                                className="text-[15px] font-bold text-slate-900 transition hover:text-brand-700"
                                            >
                                                {course.title}
                                            </Link>
                                            {course.subtitle && (
                                                <p className="mt-0.5 line-clamp-1 text-[12.5px] text-slate-500">
                                                    {course.subtitle}
                                                </p>
                                            )}
                                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-slate-500">
                                                {course.level && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <BookOpen className="size-3" />
                                                        {course.level}
                                                    </span>
                                                )}
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock className="size-3" />
                                                    {formatDuration(course.duration_minutes)}
                                                </span>
                                                {course.average_rating > 0 && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Star className="size-3 fill-amber-400 text-amber-400" />
                                                        {course.average_rating.toFixed(1)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="hidden text-right sm:block">
                                            <div className="text-[12px] text-slate-400 line-through">
                                                {formatRupiah(course.price)}
                                            </div>
                                            <Badge className="mt-1 border-transparent bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                                                Termasuk
                                            </Badge>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Sticky pricing card */}
                    <aside className="lg:sticky lg:top-24 lg:self-start">
                        <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
                            <div className="flex items-baseline gap-2">
                                <span className="text-[30px] font-extrabold tracking-tight text-slate-900">
                                    {formatRupiah(bundle.price)}
                                </span>
                                {bundle.compare_at_price > bundle.price && (
                                    <span className="text-[13px] text-slate-400 line-through">
                                        {formatRupiah(bundle.compare_at_price)}
                                    </span>
                                )}
                            </div>
                            {hasDiscount && (
                                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11.5px] font-bold text-rose-700">
                                    <Sparkles className="size-3" />
                                    Hemat {discountPct}% ({formatRupiah(bundle.savings)})
                                </div>
                            )}

                            <Link
                                href={`/checkout/bundle/${bundle.slug}`}
                                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-[14px] font-semibold text-white shadow-[0_10px_30px_-12px_rgba(18,35,125,0.6)] transition hover:-translate-y-0.5 hover:bg-brand-700"
                            >
                                Beli Paket Sekarang
                                <ArrowRight className="size-4" />
                            </Link>
                            {pointOffer && (
                                <div className="mt-2">
                                    <RedeemPointButton
                                        offer={pointOffer}
                                        label="Tukar Bundle"
                                        fullWidth
                                    />
                                </div>
                            )}

                            <ul className="mt-6 space-y-2.5 border-t border-slate-100 pt-5 text-[13px] text-slate-600">
                                <li className="flex items-start gap-2">
                                    <BookOpen className="mt-0.5 size-4 shrink-0 text-brand-600" />
                                    {bundle.courses.length} kursus akses penuh
                                </li>
                                <li className="flex items-start gap-2">
                                    <Sparkles className="mt-0.5 size-4 shrink-0 text-brand-600" />
                                    Sertifikat untuk tiap kursus
                                </li>
                                <li className="flex items-start gap-2">
                                    <Clock className="mt-0.5 size-4 shrink-0 text-brand-600" />
                                    Akses seumur hidup
                                </li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
}
