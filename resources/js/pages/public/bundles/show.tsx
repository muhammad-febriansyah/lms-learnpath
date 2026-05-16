import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BookOpen, Clock, Package, Sparkles, Star } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

export default function BundleShow({ bundle }: Props) {
    const hasDiscount = bundle.savings > 0;
    const discountPct = hasDiscount
        ? Math.round((bundle.savings / bundle.compare_at_price) * 100)
        : 0;

    return (
        <>
            <Head title={bundle.title} />
            <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                    <Link href="/bundles" className="hover:text-slate-700">
                        Paket Kursus
                    </Link>
                    <span className="text-slate-300">/</span>
                    <span className="font-semibold text-slate-900">{bundle.title}</span>
                </nav>

                <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-6">
                        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-violet-700">
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

                        <div>
                            <Badge className="border-transparent bg-brand-50 text-brand-700 hover:bg-brand-50">
                                {bundle.courses.length} kursus dalam paket
                            </Badge>
                            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
                                {bundle.title}
                            </h1>
                            {bundle.description && (
                                <p className="mt-3 text-[14px] leading-relaxed text-slate-600">
                                    {bundle.description}
                                </p>
                            )}
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Kursus dalam paket ini
                            </h2>
                            <ul className="mt-4 space-y-3">
                                {bundle.courses.map((course, idx) => (
                                    <li
                                        key={course.id}
                                        className="flex gap-4 rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70"
                                    >
                                        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-50 font-bold text-brand-700">
                                            {idx + 1}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <Link
                                                href={`/courses/${course.slug}`}
                                                className="font-semibold text-slate-900 hover:text-brand-700"
                                            >
                                                {course.title}
                                            </Link>
                                            {course.subtitle && (
                                                <p className="mt-0.5 line-clamp-1 text-[12.5px] text-slate-500">
                                                    {course.subtitle}
                                                </p>
                                            )}
                                            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11.5px] text-slate-500">
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
                                            <div className="text-[11.5px] text-slate-400 line-through">
                                                {formatRupiah(course.price)}
                                            </div>
                                            <Badge className="mt-1 border-transparent bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                                                Termasuk paket
                                            </Badge>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <aside className="lg:sticky lg:top-24 lg:self-start">
                        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-extrabold text-slate-900">
                                    {formatRupiah(bundle.price)}
                                </span>
                                {bundle.compare_at_price > bundle.price && (
                                    <span className="text-[13px] text-slate-400 line-through">
                                        {formatRupiah(bundle.compare_at_price)}
                                    </span>
                                )}
                            </div>
                            {hasDiscount && (
                                <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                                    <Sparkles className="size-3" />
                                    Hemat {discountPct}% ({formatRupiah(bundle.savings)})
                                </div>
                            )}

                            <Button
                                asChild
                                className="mt-5 w-full rounded-xl bg-brand-600 hover:bg-brand-700"
                            >
                                <Link href={`/checkout/bundle/${bundle.slug}`}>
                                    Beli Paket Sekarang
                                    <ArrowRight className="ml-1.5 size-4" />
                                </Link>
                            </Button>

                            <ul className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-[12.5px] text-slate-600">
                                <li className="flex items-start gap-2">
                                    <BookOpen className="mt-0.5 size-3.5 shrink-0 text-brand-600" />
                                    {bundle.courses.length} kursus akses penuh
                                </li>
                                <li className="flex items-start gap-2">
                                    <Sparkles className="mt-0.5 size-3.5 shrink-0 text-brand-600" />
                                    Sertifikat untuk tiap kursus
                                </li>
                                <li className="flex items-start gap-2">
                                    <Clock className="mt-0.5 size-3.5 shrink-0 text-brand-600" />
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
