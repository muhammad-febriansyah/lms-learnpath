import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock,
    Eye,
    Filter,
    Play,
    Sparkles,
    Tag,
    UserCircle2,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type UpcomingWebinar = {
    slug: string;
    title: string;
    speaker: string;
    speaker_role: string;
    date: string;
    duration_minutes: number;
    format: string;
    audience: string;
    gradient: string;
    tags: string[];
    seats: number;
    is_free: boolean;
};

type PastWebinar = {
    slug: string;
    title: string;
    speaker: string;
    date: string;
    views: number;
    tags: string[];
};

type Props = {
    upcoming: UpcomingWebinar[];
    past: PastWebinar[];
};

type FilterKey = 'all' | 'free' | 'paid';

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('id-ID', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
    });
}

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function daysFromNow(iso: string): string {
    const target = new Date(iso).getTime();
    const diffDays = Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Besok';
    if (diffDays > 0) return `${diffDays} hari lagi`;
    return `${Math.abs(diffDays)} hari lalu`;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? '')
        .join('');
}

export default function Webinars({ upcoming, past }: Props) {
    const [filter, setFilter] = useState<FilterKey>('all');

    const filteredUpcoming = useMemo(() => {
        if (filter === 'free') return upcoming.filter((w) => w.is_free);
        if (filter === 'paid') return upcoming.filter((w) => !w.is_free);
        return upcoming;
    }, [filter, upcoming]);

    const [featured, ...others] = filteredUpcoming;

    return (
        <>
            <Head title="Webinar & Event — LearnPath" />

            <div className="space-y-12 pb-16">
                {/* Hero - compact */}
                <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950 text-white">
                    <div className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-brand-500/20 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-32 -left-32 size-96 rounded-full bg-brand-500/10 blur-3xl" />

                    <div className="relative mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-14">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div className="min-w-0">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase ring-1 ring-white/15 backdrop-blur">
                                    <CalendarDays className="size-3" />
                                    Webinar & Event
                                </span>
                                <h1 className="mt-3 max-w-2xl text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">
                                    Belajar dari L&D leader, gratis.
                                </h1>
                                <p className="mt-2 max-w-xl text-[13.5px] text-white/75">
                                    Sesi 30–90 menit dengan tanya jawab
                                    langsung — ideal buat HR, L&D head, dan
                                    kepala departemen.
                                </p>
                            </div>
                            <div className="flex shrink-0 gap-3 text-[12px]">
                                <HeroStat
                                    icon={<Sparkles className="size-3.5" />}
                                    label="Upcoming"
                                    value={`${upcoming.length}`}
                                />
                                <HeroStat
                                    icon={<Eye className="size-3.5" />}
                                    label="Recap"
                                    value={`${past.length}`}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Filter tabs */}
                <section className="mx-auto max-w-6xl px-5 lg:px-8">
                    <div className="flex flex-wrap items-center gap-2">
                        <Filter className="size-3.5 text-slate-400" />
                        <FilterTab
                            label="Semua"
                            active={filter === 'all'}
                            onClick={() => setFilter('all')}
                            count={upcoming.length}
                        />
                        <FilterTab
                            label="Gratis"
                            active={filter === 'free'}
                            onClick={() => setFilter('free')}
                            count={upcoming.filter((w) => w.is_free).length}
                            tone="emerald"
                        />
                        <FilterTab
                            label="Berbayar"
                            active={filter === 'paid'}
                            onClick={() => setFilter('paid')}
                            count={upcoming.filter((w) => !w.is_free).length}
                        />
                    </div>
                </section>

                {/* Featured upcoming */}
                {featured && (
                    <section className="mx-auto max-w-6xl px-5 lg:px-8">
                        <FeaturedWebinarCard webinar={featured} />
                    </section>
                )}

                {/* Other upcoming */}
                {others.length > 0 && (
                    <section className="mx-auto max-w-6xl px-5 lg:px-8">
                        <h2 className="text-[15px] font-bold tracking-tight text-slate-900">
                            Sesi lain yang akan datang
                        </h2>
                        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {others.map((w) => (
                                <UpcomingCard key={w.slug} webinar={w} />
                            ))}
                        </div>
                    </section>
                )}

                {filteredUpcoming.length === 0 && (
                    <section className="mx-auto max-w-6xl px-5 lg:px-8">
                        <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                            <Sparkles className="mx-auto size-6 text-slate-300" />
                            <p className="mt-3 text-[13px] font-semibold text-slate-700">
                                Belum ada sesi pada filter ini
                            </p>
                            <p className="mt-1 text-[12px] text-slate-500">
                                Coba ubah filter atau subscribe newsletter
                                untuk update.
                            </p>
                        </div>
                    </section>
                )}

                {/* Past */}
                {past.length > 0 && (
                    <section className="mx-auto max-w-6xl px-5 lg:px-8">
                        <div className="flex items-end justify-between gap-3">
                            <div>
                                <span className="text-[10.5px] font-bold tracking-[0.18em] text-brand-700 uppercase">
                                    Recap Sebelumnya
                                </span>
                                <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                                    Tonton ulang
                                </h2>
                            </div>
                        </div>

                        <ul className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                            {past.map((w) => (
                                <li
                                    key={w.slug}
                                    className="group flex items-center gap-4 p-4 transition hover:bg-slate-50 sm:p-5"
                                >
                                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-sm transition group-hover:scale-105">
                                        <Play className="size-4 fill-current" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="line-clamp-1 text-[13.5px] font-bold text-slate-900 transition group-hover:text-brand-700">
                                            {w.title}
                                        </div>
                                        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] text-slate-500">
                                            <span className="inline-flex items-center gap-1">
                                                <UserCircle2 className="size-3" />
                                                {w.speaker}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <CalendarDays className="size-3" />
                                                {new Date(
                                                    w.date,
                                                ).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Eye className="size-3" />
                                                {w.views.toLocaleString(
                                                    'id-ID',
                                                )}{' '}
                                                views
                                            </span>
                                        </div>
                                    </div>
                                    <div className="hidden shrink-0 flex-wrap gap-1 sm:flex">
                                        {w.tags.map((t) => (
                                            <Badge
                                                key={t}
                                                className="border-transparent bg-slate-100 px-1.5 py-0 text-[10.5px] font-semibold text-slate-600"
                                            >
                                                {t}
                                            </Badge>
                                        ))}
                                    </div>
                                    <ArrowRight className="size-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* CTA */}
                <section className="mx-auto max-w-6xl px-5 lg:px-8">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 p-8 text-white shadow-xl sm:p-12">
                        <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-white/10 blur-3xl" />
                        <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto]">
                            <div className="min-w-0">
                                <h3 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                                    Mau host webinar internal?
                                </h3>
                                <p className="mt-2 max-w-xl text-[13.5px] text-white/85">
                                    Platform Learnpath bisa di-customize untuk
                                    webinar internal Anda dengan tracking
                                    kehadiran, sertifikat, dan integrasi LMS.
                                </p>
                            </div>
                            <Button
                                asChild
                                size="lg"
                                className="h-12 rounded-xl bg-white px-6 text-brand-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-50"
                            >
                                <Link href="/corporate/demo">
                                    Request Demo
                                    <ArrowRight className="ml-1.5 size-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

function HeroStat({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="min-w-[88px] rounded-xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur">
            <div className="flex items-center gap-1.5 text-[10.5px] font-semibold tracking-wider text-white/70 uppercase">
                {icon}
                {label}
            </div>
            <div className="mt-0.5 text-[18px] font-extrabold tabular-nums">
                {value}
            </div>
        </div>
    );
}

function FilterTab({
    label,
    active,
    onClick,
    count,
    tone,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
    count: number;
    tone?: 'emerald';
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition',
                active
                    ? tone === 'emerald'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900',
            )}
        >
            {label}
            <span
                className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
                    active
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500',
                )}
            >
                {count}
            </span>
        </button>
    );
}

function FeaturedWebinarCard({ webinar }: { webinar: UpcomingWebinar }) {
    return (
        <article
            className={cn(
                'relative overflow-hidden rounded-3xl bg-gradient-to-br text-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.4)]',
                webinar.gradient,
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
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[10.5px] font-bold tracking-wider text-white uppercase ring-1 ring-white/20 backdrop-blur">
                            {daysFromNow(webinar.date)}
                        </span>
                        {webinar.is_free && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/25 px-2.5 py-0.5 text-[10.5px] font-bold tracking-wider text-emerald-50 uppercase ring-1 ring-emerald-300/40 backdrop-blur">
                                Gratis
                            </span>
                        )}
                        {webinar.tags.map((t) => (
                            <span
                                key={t}
                                className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10.5px] font-semibold text-white/85 ring-1 ring-white/15 backdrop-blur"
                            >
                                {t}
                            </span>
                        ))}
                    </div>

                    <h2 className="mt-4 text-[22px] leading-tight font-extrabold tracking-tight sm:text-[26px] lg:text-[28px]">
                        {webinar.title}
                    </h2>

                    <div className="mt-5 flex items-center gap-3">
                        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/15 text-[13px] font-bold ring-1 ring-white/25 backdrop-blur">
                            {getInitials(webinar.speaker)}
                        </span>
                        <div className="min-w-0">
                            <div className="text-[13px] font-bold">
                                {webinar.speaker}
                            </div>
                            <div className="truncate text-[11.5px] text-white/70">
                                {webinar.speaker_role}
                            </div>
                        </div>
                    </div>

                    <Button
                        asChild
                        size="lg"
                        className="mt-6 h-12 rounded-xl bg-white px-6 text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-50"
                    >
                        <Link href="/corporate/demo">
                            Daftar Sekarang
                            <ArrowRight className="ml-1.5 size-4" />
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur lg:grid-cols-1">
                    <FeaturedStat
                        icon={<CalendarDays className="size-3.5" />}
                        label="Tanggal"
                        value={formatDate(webinar.date)}
                    />
                    <FeaturedStat
                        icon={<Clock className="size-3.5" />}
                        label="Jam"
                        value={`${formatTime(webinar.date)} WIB`}
                    />
                    <FeaturedStat
                        icon={<Users className="size-3.5" />}
                        label="Seat"
                        value={`${webinar.seats}`}
                    />
                </div>
            </div>
        </article>
    );
}

function FeaturedStat({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="bg-white/5 p-4 text-center sm:p-5">
            <div className="flex items-center justify-center gap-1.5 text-[10.5px] font-semibold tracking-wider text-white/60 uppercase">
                {icon}
                {label}
            </div>
            <div className="mt-1 text-[15px] font-extrabold tabular-nums sm:text-[16px]">
                {value}
            </div>
        </div>
    );
}

function UpcomingCard({ webinar }: { webinar: UpcomingWebinar }) {
    return (
        <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70 transition hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(15,23,42,0.2)]">
            {/* Compact gradient strip */}
            <div
                className={cn(
                    'relative flex h-2 bg-gradient-to-r',
                    webinar.gradient,
                )}
            />

            <div className="p-5">
                {/* Date pill row */}
                <div className="flex flex-wrap items-center gap-1.5">
                    <span
                        className={cn(
                            'inline-flex items-center gap-1 rounded-full bg-gradient-to-r px-2.5 py-0.5 text-[10.5px] font-bold tracking-wider text-white uppercase shadow-sm',
                            webinar.gradient,
                        )}
                    >
                        <CalendarDays className="size-2.5" />
                        {daysFromNow(webinar.date)}
                    </span>
                    {webinar.is_free && (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold tracking-wider text-emerald-700 uppercase">
                            Gratis
                        </span>
                    )}
                </div>

                <h3 className="mt-3 line-clamp-2 text-[14.5px] leading-snug font-bold text-slate-900 transition group-hover:text-brand-700">
                    {webinar.title}
                </h3>

                {/* Speaker */}
                <div className="mt-3 flex items-center gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-[10.5px] font-bold text-white shadow-sm">
                        {getInitials(webinar.speaker)}
                    </span>
                    <div className="min-w-0">
                        <div className="truncate text-[12px] font-bold text-slate-900">
                            {webinar.speaker}
                        </div>
                        <div className="truncate text-[10.5px] text-slate-500">
                            {webinar.speaker_role}
                        </div>
                    </div>
                </div>

                {/* Meta */}
                <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-slate-50 p-2 ring-1 ring-slate-100">
                    <MetaItem
                        icon={<CalendarDays className="size-3" />}
                        value={formatDate(webinar.date)}
                    />
                    <MetaItem
                        icon={<Clock className="size-3" />}
                        value={`${formatTime(webinar.date)} WIB`}
                    />
                    <MetaItem
                        icon={<Users className="size-3" />}
                        value={`${webinar.seats} seat`}
                    />
                </div>

                {webinar.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                        {webinar.tags.map((t) => (
                            <Badge
                                key={t}
                                className="border-transparent bg-brand-50 px-1.5 py-0 text-[10px] font-semibold text-brand-700"
                            >
                                <Tag className="mr-0.5 size-2" />
                                {t}
                            </Badge>
                        ))}
                    </div>
                )}

                <Button
                    asChild
                    className={cn(
                        'mt-4 h-10 w-full rounded-xl bg-gradient-to-r text-[12.5px] font-bold shadow-sm transition hover:-translate-y-0.5',
                        webinar.gradient,
                    )}
                >
                    <Link href="/corporate/demo">
                        Daftar Sekarang
                        <ArrowRight className="ml-1 size-3.5" />
                    </Link>
                </Button>
            </div>
        </article>
    );
}

function MetaItem({
    icon,
    value,
}: {
    icon: React.ReactNode;
    value: string;
}) {
    return (
        <div className="text-center">
            <div className="flex items-center justify-center text-slate-400">
                {icon}
            </div>
            <div className="mt-0.5 truncate text-[10px] font-semibold text-slate-700">
                {value}
            </div>
        </div>
    );
}
