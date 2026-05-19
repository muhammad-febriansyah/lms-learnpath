import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    Bot,
    CheckCircle2,
    GitBranch,
    Megaphone,
    Route as RouteIcon,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
    Target,
    Users,
    Workflow,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ICONS: Record<string, typeof ShieldCheck> = {
    'shield-check': ShieldCheck,
    route: RouteIcon,
    target: Target,
    workflow: Workflow,
    users: Users,
    sparkles: Sparkles,
    'git-branch': GitBranch,
    bot: Bot,
    'shopping-bag': ShoppingBag,
    megaphone: Megaphone,
};

type Industry = {
    slug: string;
    name: string;
    tagline: string;
    description: string;
    gradient: string;
    pain_points: { title: string; desc: string }[];
    features: { icon: string; title: string; desc: string }[];
    case_studies: string[];
    modules_count: number;
};

type Other = { slug: string; name: string; tagline: string };

type Props = {
    industry: Industry;
    others: Other[];
};

export default function CorporateSolution({ industry, others }: Props) {
    return (
        <>
            <Head title={`Solusi ${industry.name} — LearnPath`} />

            <div className="space-y-12 pb-16">
                {/* Hero */}
                <section
                    className={cn(
                        'relative overflow-hidden bg-gradient-to-br text-white',
                        industry.gradient,
                    )}
                >
                    <div className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-white/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-32 -left-32 size-96 rounded-full bg-black/10 blur-3xl" />

                    <div className="relative mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
                        <Link
                            href="/corporate"
                            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white/70 transition hover:text-white"
                        >
                            ← Untuk Bisnis
                        </Link>
                        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase ring-1 ring-white/15 backdrop-blur">
                            Solusi Industri
                        </span>
                        <h1 className="mt-3 max-w-3xl text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                            {industry.name}
                        </h1>
                        <p className="mt-3 max-w-3xl text-[15px] font-semibold text-white/90 sm:text-[17px]">
                            {industry.tagline}
                        </p>
                        <p className="mt-4 max-w-2xl text-[13.5px] leading-relaxed text-white/80">
                            {industry.description}
                        </p>

                        <div className="mt-7 flex flex-wrap items-center gap-3">
                            <Button
                                asChild
                                size="lg"
                                className="h-12 rounded-xl bg-white px-6 text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-brand-50 hover:text-brand-700"
                            >
                                <Link href="/corporate/demo">
                                    Request Demo
                                    <ArrowRight className="ml-1.5 size-4" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="h-12 rounded-xl border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 hover:text-white"
                            >
                                <Link href="/corporate/pricing">
                                    Lihat Paket Harga
                                </Link>
                            </Button>
                        </div>

                        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                            <HeroStat
                                label="Modul Siap Pakai"
                                value={`${industry.modules_count}+`}
                            />
                            <HeroStat
                                label="Klien Aktif"
                                value={`${industry.case_studies.length}+`}
                            />
                            <HeroStat label="Implementasi" value="≤4 minggu" />
                        </div>
                    </div>
                </section>

                {/* Pain points */}
                <section className="mx-auto max-w-6xl px-5 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <span className="text-[10.5px] font-bold tracking-[0.18em] text-brand-700 uppercase">
                            Tantangan yang Kami Selesaikan
                        </span>
                        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                            Yang biasanya bikin L&D di{' '}
                            {industry.name.toLowerCase()} pusing
                        </h2>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        {industry.pain_points.map((p) => (
                            <div
                                key={p.title}
                                className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70"
                            >
                                <div className="text-[14.5px] font-bold text-slate-900">
                                    {p.title}
                                </div>
                                <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-600">
                                    {p.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Features */}
                <section className="mx-auto max-w-6xl px-5 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <span className="text-[10.5px] font-bold tracking-[0.18em] text-brand-700 uppercase">
                            Fitur Khusus Industri Anda
                        </span>
                        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                            Yang sudah dipakai tim {industry.name.toLowerCase()}{' '}
                            di lapangan
                        </h2>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        {industry.features.map((f) => {
                            const Icn = ICONS[f.icon] ?? Sparkles;
                            return (
                                <div
                                    key={f.title}
                                    className={cn(
                                        'rounded-2xl bg-gradient-to-br p-6 text-white shadow-lg',
                                        industry.gradient,
                                    )}
                                >
                                    <span className="grid size-10 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
                                        <Icn className="size-5" />
                                    </span>
                                    <div className="mt-4 text-[15px] font-bold">
                                        {f.title}
                                    </div>
                                    <p className="mt-1 text-[12.5px] leading-relaxed text-white/85">
                                        {f.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Case studies */}
                {industry.case_studies.length > 0 && (
                    <section className="mx-auto max-w-6xl px-5 lg:px-8">
                        <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200/70 sm:p-10">
                            <div className="flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <span className="text-[10.5px] font-bold tracking-[0.18em] text-brand-700 uppercase">
                                        Sudah Dipakai Oleh
                                    </span>
                                    <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                                        Tim {industry.name} terbaik
                                    </h2>
                                </div>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="rounded-xl"
                                >
                                    <Link href="/corporate/case-studies">
                                        Lihat semua studi kasus
                                        <ArrowRight className="ml-1 size-3.5" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="mt-6 flex flex-wrap gap-2">
                                {industry.case_studies.map((c) => (
                                    <Badge
                                        key={c}
                                        className="border-transparent bg-white px-3 py-1.5 text-[12.5px] font-semibold text-slate-900 ring-1 ring-slate-200"
                                    >
                                        <Award className="mr-1 size-3 text-amber-500" />
                                        {c}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* CTA */}
                <section className="mx-auto max-w-6xl px-5 lg:px-8">
                    <div
                        className={cn(
                            'relative overflow-hidden rounded-3xl bg-gradient-to-br p-8 text-white shadow-xl sm:p-12',
                            industry.gradient,
                        )}
                    >
                        <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-white/10 blur-3xl" />
                        <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto]">
                            <div className="min-w-0">
                                <h3 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                                    Siap mulai dengan {industry.name}?
                                </h3>
                                <p className="mt-2 max-w-xl text-[13.5px] text-white/85">
                                    Jadwalkan demo 30 menit. Kami akan tunjukkan
                                    bagaimana platform & modul kami bisa
                                    di-customize untuk tim Anda.
                                </p>
                                <ul className="mt-4 space-y-1.5 text-[12.5px] text-white/80">
                                    <li className="flex items-center gap-1.5">
                                        <CheckCircle2 className="size-3.5 text-emerald-300" />
                                        Tanpa kontrak panjang
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <CheckCircle2 className="size-3.5 text-emerald-300" />
                                        Free pilot untuk 50 user
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <CheckCircle2 className="size-3.5 text-emerald-300" />
                                        Support implementasi onboarding
                                    </li>
                                </ul>
                            </div>
                            <Button
                                asChild
                                size="lg"
                                className="h-12 rounded-xl bg-white px-6 text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-brand-50 hover:text-brand-700"
                            >
                                <Link href="/corporate/demo">
                                    Request Demo
                                    <ArrowRight className="ml-1.5 size-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Other industries */}
                {others.length > 0 && (
                    <section className="mx-auto max-w-6xl px-5 lg:px-8">
                        <h2 className="text-[15px] font-bold text-slate-900">
                            Industri lain yang kami layani
                        </h2>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {others.map((o) => (
                                <Link
                                    key={o.slug}
                                    href={`/corporate/solutions/${o.slug}`}
                                    className="group block rounded-2xl bg-white p-4 ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:ring-brand-300"
                                >
                                    <div className="text-[13.5px] font-bold text-slate-900 transition group-hover:text-brand-700">
                                        {o.name}
                                    </div>
                                    <p className="mt-1 line-clamp-2 text-[11.5px] text-slate-500">
                                        {o.tagline}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}

function HeroStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
            <div className="text-[10.5px] font-semibold tracking-wider text-white/60 uppercase">
                {label}
            </div>
            <div className="mt-1 text-[20px] font-extrabold tabular-nums">
                {value}
            </div>
        </div>
    );
}
