import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Building2, Quote, TrendingUp } from 'lucide-react';
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
                        href="/corporate#demo"
                        className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-brand-700 transition hover:-translate-y-0.5 hover:bg-brand-50"
                    >
                        Jadwalkan Demo <ArrowRight className="size-4" />
                    </Link>
                }
            />

            <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
                {/* Industry filter */}
                <div className="flex flex-wrap gap-2">
                    {industries.map((industry) => (
                        <button
                            key={industry}
                            type="button"
                            onClick={() => setActive(industry)}
                            className={cn(
                                'rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition',
                                active === industry
                                    ? 'bg-brand-600 text-white'
                                    : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
                            )}
                        >
                            {industry}
                        </button>
                    ))}
                </div>

                {/* Hero case */}
                {hero && (
                    <div
                        className={cn(
                            'relative mt-10 overflow-hidden rounded-3xl bg-gradient-to-br text-white ring-1 ring-white/10',
                            hero.color,
                        )}
                    >
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_60%)]"
                        />
                        <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
                            <div>
                                <div className="flex items-center gap-3">
                                    <span className="grid size-14 place-items-center rounded-2xl bg-white/15 text-[16px] font-extrabold tracking-tight text-white ring-1 ring-white/20 backdrop-blur">
                                        {hero.logo_initial}
                                    </span>
                                    <div>
                                        <div className="text-[17px] font-bold">
                                            {hero.company}
                                        </div>
                                        <div className="text-[12px] text-white/70">
                                            {hero.industry}
                                        </div>
                                    </div>
                                </div>
                                <h2 className="mt-6 max-w-xl text-[26px] leading-tight font-extrabold tracking-tight sm:text-[32px]">
                                    {hero.tagline}
                                </h2>
                                <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-white/85">
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
                            </div>
                            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur sm:grid-cols-3 lg:grid-cols-1">
                                {hero.metrics.map((m) => (
                                    <div
                                        key={m.label}
                                        className="bg-white/5 p-5 text-center"
                                    >
                                        <div className="text-[24px] font-extrabold tracking-tight">
                                            {m.value}
                                        </div>
                                        <div className="mt-1 text-[11.5px] text-white/80">
                                            {m.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Grid */}
                {rest.length > 0 && (
                    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {rest.map((study) => (
                            <article
                                key={study.company}
                                className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:ring-brand-200"
                            >
                                <div
                                    className={cn(
                                        'flex h-32 items-center justify-center bg-gradient-to-br',
                                        study.color,
                                    )}
                                >
                                    <span className="text-[26px] font-extrabold tracking-tight text-white">
                                        {study.logo_initial}
                                    </span>
                                </div>
                                <div className="flex flex-1 flex-col p-5">
                                    <div className="flex items-center gap-2 text-[11.5px]">
                                        <Building2 className="size-3.5 text-slate-400" />
                                        <span className="text-slate-600">
                                            {study.company}
                                        </span>
                                        <span className="text-slate-300">·</span>
                                        <span className="text-slate-500">
                                            {study.industry}
                                        </span>
                                    </div>
                                    <h3 className="mt-2 text-[16px] leading-snug font-bold tracking-tight text-slate-900 group-hover:text-brand-700">
                                        {study.tagline}
                                    </h3>
                                    <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-slate-600">
                                        {study.summary}
                                    </p>

                                    <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3">
                                        {study.metrics.map((m) => (
                                            <div
                                                key={m.label}
                                                className="text-center"
                                            >
                                                <div className="text-[14.5px] font-extrabold tracking-tight text-brand-700">
                                                    {m.value}
                                                </div>
                                                <div className="mt-0.5 text-[10px] leading-tight text-slate-500">
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
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* Testimonial / Trust */}
                <div className="mt-20 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                    <div className="rounded-3xl bg-slate-950 p-8 text-white ring-1 ring-slate-800 sm:p-10">
                        <Quote className="size-8 text-brand-400" />
                        <p className="mt-4 text-[18px] leading-relaxed font-medium text-white/90 sm:text-[20px]">
                            "Learnpath membantu kami menstandarkan onboarding di
                            38 cabang dengan kualitas yang konsisten. Time-to-
                            productive Account Officer kami turun dari 6 bulan
                            jadi 2 bulan."
                        </p>
                        <div className="mt-6 flex items-center gap-3">
                            <span className="grid size-11 place-items-center rounded-full bg-brand-600 text-[14px] font-bold text-white">
                                AK
                            </span>
                            <div>
                                <div className="text-[14px] font-bold">
                                    Anita Kusuma
                                </div>
                                <div className="text-[12px] text-white/70">
                                    Head of Learning, Bank Mandiri
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-8 text-white sm:p-10">
                        <TrendingUp className="size-8 text-white/90" />
                        <h3 className="mt-4 text-[22px] font-extrabold tracking-tight sm:text-[26px]">
                            Siap menulis cerita berikutnya bersama tim Anda?
                        </h3>
                        <p className="mt-2 text-[13.5px] text-white/85">
                            Jadwalkan demo 30 menit dengan tim B2B kami untuk
                            lihat impact yang bisa diraih perusahaan Anda.
                        </p>
                        <Link
                            href="/corporate#demo"
                            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-brand-700 transition hover:-translate-y-0.5 hover:bg-brand-50"
                        >
                            Jadwalkan Demo <ArrowRight className="size-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
