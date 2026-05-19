import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpRight,
    Building2,
    Quote,
    Sparkles,
    TrendingUp,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { PageHeader } from '@/components/front/page-header';
import { cn } from '@/lib/utils';

type Metric = { label: string; value: string };
type CaseStudy = {
    company: string;
    industry: string;
    logo_initial: string;
    tagline: string;
    summary: string;
    metrics: Metric[];
    tags: string[];
    color: string;
};

export default function CaseStudiesPage({ studies }: { studies: CaseStudy[] }) {
    const industries = useMemo(
        () => ['Semua', ...Array.from(new Set(studies.map((s) => s.industry)))],
        [studies],
    );
    const [active, setActive] = useState('Semua');

    const filtered =
        active === 'Semua' ? studies : studies.filter((s) => s.industry === active);
    const [hero, ...rest] = filtered;

    return (
        <>
            <Head title="Studi Kasus · Learnpath" />

            <PageHeader
                eyebrow="Case Studies"
                title="Bagaimana tim L&D di berbagai industri tumbuh bersama Learnpath"
                description="Cerita nyata dari perusahaan yang menggunakan Learnpath untuk akselerasi onboarding, sertifikasi compliance, dan upskilling karyawan."
                breadcrumbs={[
                    { label: 'Beranda', href: '/' },
                    { label: 'Untuk Bisnis', href: '/corporate' },
                    { label: 'Studi Kasus' },
                ]}
                actions={
                    <Link
                        href="/corporate/demo"
                        className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-brand-700 transition hover:-translate-y-0.5 hover:bg-brand-50"
                    >
                        Jadwalkan Demo <ArrowRight className="size-4" />
                    </Link>
                }
            />

            <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
                {/* Filter chips */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10.5px] font-bold tracking-[0.18em] text-slate-500 uppercase">
                        Filter Industri
                    </span>
                    {industries.map((industry) => (
                        <button
                            key={industry}
                            type="button"
                            onClick={() => setActive(industry)}
                            className={cn(
                                'rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition',
                                active === industry
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900',
                            )}
                        >
                            {industry}
                        </button>
                    ))}
                </div>

                {/* Hero case */}
                {hero && (
                    <article
                        className={cn(
                            'relative mt-8 overflow-hidden rounded-3xl bg-gradient-to-br text-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.4)]',
                            hero.color,
                        )}
                    >
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_60%)]"
                        />
                        <span className="absolute top-5 right-5 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10.5px] font-bold tracking-wider text-white uppercase ring-1 ring-white/20 backdrop-blur">
                            <Sparkles className="size-3 text-amber-300" />
                            Featured
                        </span>

                        <div className="relative grid gap-8 p-8 sm:p-10 lg:grid-cols-[1.4fr_1fr] lg:gap-10 lg:p-12">
                            <div>
                                <div className="flex items-center gap-3">
                                    <LogoBadge
                                        initial={hero.logo_initial}
                                        variant="hero"
                                    />
                                    <div className="min-w-0">
                                        <div className="text-[15px] font-bold">
                                            {hero.company}
                                        </div>
                                        <div className="inline-flex items-center gap-1 text-[11px] text-white/70">
                                            <Building2 className="size-3" />
                                            {hero.industry}
                                        </div>
                                    </div>
                                </div>
                                <h2 className="mt-6 max-w-xl text-[24px] leading-tight font-extrabold tracking-tight sm:text-[30px] lg:text-[32px]">
                                    {hero.tagline}
                                </h2>
                                <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-white/85">
                                    {hero.summary}
                                </p>
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {hero.tags.map((t) => (
                                        <span
                                            key={t}
                                            className="rounded-full bg-white/10 px-3 py-1 text-[11.5px] font-semibold text-white ring-1 ring-white/15 backdrop-blur"
                                        >
                                            {t}
                                        </span>
                                    ))}
                                </div>
                                <Link
                                    href="/corporate/demo"
                                    className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12.5px] font-bold text-slate-900 shadow-sm transition hover:-translate-y-0.5"
                                >
                                    Mau cerita serupa?
                                    <ArrowUpRight className="size-3.5" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur lg:grid-cols-1">
                                {hero.metrics.map((m) => (
                                    <div
                                        key={m.label}
                                        className="bg-white/5 p-4 text-center sm:p-5"
                                    >
                                        <div className="text-[20px] font-extrabold tracking-tight tabular-nums sm:text-[24px]">
                                            {m.value}
                                        </div>
                                        <div className="mt-1 text-[10.5px] leading-tight text-white/80 sm:text-[11.5px]">
                                            {m.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </article>
                )}

                {/* Grid */}
                {rest.length > 0 && (
                    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                        {rest.map((study) => (
                            <article
                                key={study.company}
                                className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70 transition hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(15,23,42,0.2)] hover:ring-slate-300"
                            >
                                {/* Compact gradient strip + monogram */}
                                <div
                                    className={cn(
                                        'relative h-2 bg-gradient-to-r',
                                        study.color,
                                    )}
                                />
                                <div className="flex flex-1 flex-col p-5">
                                    <div className="flex items-center gap-3">
                                        <LogoBadge
                                            initial={study.logo_initial}
                                            color={study.color}
                                            variant="card"
                                        />
                                        <div className="min-w-0">
                                            <div className="truncate text-[12.5px] font-bold text-slate-900">
                                                {study.company}
                                            </div>
                                            <div className="inline-flex items-center gap-1 truncate text-[10.5px] text-slate-500">
                                                <Building2 className="size-2.5" />
                                                {study.industry}
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="mt-4 line-clamp-2 text-[15px] leading-snug font-bold tracking-tight text-slate-900 transition group-hover:text-brand-700">
                                        {study.tagline}
                                    </h3>
                                    <p className="mt-2 line-clamp-3 text-[12.5px] leading-relaxed text-slate-600">
                                        {study.summary}
                                    </p>

                                    {/* Metrics — compact horizontal */}
                                    <div className="mt-4 grid grid-cols-3 gap-1.5 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                                        {study.metrics.map((m) => (
                                            <div
                                                key={m.label}
                                                className="text-center"
                                            >
                                                <div className="text-[14px] font-extrabold tracking-tight text-slate-900 tabular-nums">
                                                    {m.value}
                                                </div>
                                                <div className="mt-0.5 text-[9.5px] leading-tight text-slate-500">
                                                    {m.label}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-1.5">
                                        {study.tags.slice(0, 3).map((t) => (
                                            <span
                                                key={t}
                                                className="rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-semibold text-slate-600"
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11.5px] font-semibold text-slate-500 transition group-hover:text-brand-700">
                                        <span>Baca studi kasus</span>
                                        <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* Testimonial / Trust */}
                <div className="mt-16 grid gap-5 lg:grid-cols-[1.2fr_1fr] lg:gap-6">
                    <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-8 text-white ring-1 ring-slate-800 sm:p-10">
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-brand-500/20 blur-3xl"
                        />
                        <Quote className="relative size-8 text-brand-400" />
                        <p className="relative mt-4 text-[17px] leading-relaxed font-medium text-white/90 sm:text-[19px]">
                            "Learnpath membantu kami menstandarkan onboarding di
                            38 cabang dengan kualitas yang konsisten.
                            Time-to-productive Account Officer kami turun dari
                            6 bulan jadi 2 bulan."
                        </p>
                        <div className="relative mt-6 flex items-center gap-3">
                            <span className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-[13px] font-bold text-white shadow-md">
                                AK
                            </span>
                            <div>
                                <div className="text-[13.5px] font-bold">
                                    Anita Kusuma
                                </div>
                                <div className="text-[11.5px] text-white/70">
                                    Head of Learning, Bank Mandiri
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-8 text-white shadow-xl sm:p-10">
                        <TrendingUp className="size-8 text-white/90" />
                        <h3 className="mt-4 text-[20px] leading-tight font-extrabold tracking-tight sm:text-[24px]">
                            Siap menulis cerita berikutnya bersama tim Anda?
                        </h3>
                        <p className="mt-2 text-[13px] text-white/85">
                            Jadwalkan demo 30 menit dengan tim B2B kami untuk
                            lihat impact yang bisa diraih perusahaan Anda.
                        </p>
                        <Link
                            href="/corporate/demo"
                            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13.5px] font-semibold text-brand-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-50"
                        >
                            Jadwalkan Demo <ArrowRight className="size-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

function LogoBadge({
    initial,
    color,
    variant = 'card',
}: {
    initial: string;
    color?: string;
    variant?: 'hero' | 'card';
}) {
    if (variant === 'hero') {
        return (
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/15 text-[14px] font-extrabold tracking-tight text-white ring-1 ring-white/20 backdrop-blur">
                {initial}
            </span>
        );
    }
    return (
        <span
            className={cn(
                'grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-[12px] font-extrabold tracking-tight text-white shadow-sm',
                color,
            )}
        >
            {initial}
        </span>
    );
}
