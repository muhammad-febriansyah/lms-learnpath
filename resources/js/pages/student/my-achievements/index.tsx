import { Head, Link } from '@inertiajs/react';
import {
    Award,
    BookOpen,
    Calendar,
    Compass,
    Flame,
    GraduationCap,
    Lock,
    Sparkles,
    Target,
    Trophy,
    type LucideIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type BadgeItem = {
    id: number;
    slug: string;
    name: string;
    description: string;
    icon: string | null;
    category: string;
    criteria: { type: string; threshold?: number };
    earned: boolean;
    earned_at: string | null;
};

type Group = {
    category: string;
    badges: BadgeItem[];
};

type Streak = {
    current: number;
    longest: number;
    last_active_date: string | null;
};

type Stats = { earned: number; total: number };

type Props = {
    groups: Group[];
    streak: Streak;
    stats: Stats;
};

const ICON_MAP: Record<string, LucideIcon> = {
    Award,
    BookOpen,
    Compass,
    Flame,
    GraduationCap,
    Sparkles,
    Target,
    Trophy,
};

const CATEGORY_LABEL: Record<string, string> = {
    milestone: 'Milestone Course',
    streak: 'Konsistensi',
    mastery: 'Mastery',
    path: 'Learning Path',
};

const CATEGORY_GRADIENT: Record<string, string> = {
    milestone: 'from-amber-400 via-orange-500 to-rose-500',
    streak: 'from-rose-500 via-red-500 to-orange-500',
    mastery: 'from-emerald-500 via-teal-500 to-cyan-500',
    path: 'from-brand-500 via-brand-500 to-blue-500',
};

function formatDate(iso: string | null): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function badgeRequirement(criteria: BadgeItem['criteria']): string {
    switch (criteria.type) {
        case 'course_count':
            return `Selesaikan ${criteria.threshold} course`;
        case 'streak_days':
            return `${criteria.threshold} hari beruntun`;
        case 'perfect_score':
            return 'Skor 100% di assessment';
        case 'path_completed':
            return `Selesaikan ${criteria.threshold ?? 1} learning path`;
        default:
            return '';
    }
}

export default function AchievementsIndex({ groups, streak, stats }: Props) {
    const progress = stats.total === 0 ? 0 : Math.round((stats.earned / stats.total) * 100);

    return (
        <>
            <Head title="Pencapaian Saya" />
            <div className="space-y-6">
                <div>
                    <h1 className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
                        <Trophy className="size-6 text-amber-500" />
                        Pencapaian Saya
                    </h1>
                    <p className="mt-1 text-[13px] text-slate-600">
                        Lihat streak harian dan badge yang sudah Anda raih dari aktivitas belajar.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 p-5 text-white shadow-[0_4px_16px_rgba(234,88,12,0.25)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-[11px] font-bold tracking-widest uppercase text-white/85">
                                    Streak Sekarang
                                </div>
                                <div className="mt-2 inline-flex items-baseline gap-2">
                                    <span className="text-[48px] leading-none font-extrabold tabular-nums">
                                        {streak.current}
                                    </span>
                                    <span className="text-[16px] font-bold opacity-90">hari</span>
                                </div>
                            </div>
                            <Flame className="size-12 text-white/90" />
                        </div>
                        <div className="mt-3 text-[11.5px] text-white/85">
                            Terpanjang: {streak.longest} hari
                            {streak.last_active_date && (
                                <span className="ml-2 inline-flex items-center gap-1">
                                    <Calendar className="size-3" />
                                    {formatDate(streak.last_active_date)}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl bg-card p-5 ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-[11px] font-bold tracking-widest uppercase text-slate-500">
                                    Badge Diraih
                                </div>
                                <div className="mt-2 text-[40px] leading-none font-extrabold text-slate-900 tabular-nums">
                                    {stats.earned}
                                    <span className="text-[18px] font-bold text-slate-400">
                                        / {stats.total}
                                    </span>
                                </div>
                            </div>
                            <Award className="size-12 text-amber-500" />
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="mt-2 text-[11.5px] text-slate-500">
                            {progress}% koleksi badge
                        </div>
                    </div>

                    <div className="rounded-2xl bg-card p-5 ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                        <div className="text-[11px] font-bold tracking-widest uppercase text-slate-500">
                            Cara Dapat Badge
                        </div>
                        <ul className="mt-2 space-y-1.5 text-[12.5px] text-slate-700">
                            <li className="flex items-center gap-2">
                                <BookOpen className="size-3.5 text-slate-400" />
                                Selesaikan course
                            </li>
                            <li className="flex items-center gap-2">
                                <Flame className="size-3.5 text-orange-400" />
                                Belajar tiap hari (streak)
                            </li>
                            <li className="flex items-center gap-2">
                                <Target className="size-3.5 text-emerald-500" />
                                Lulus assessment dengan 100%
                            </li>
                            <li className="flex items-center gap-2">
                                <Compass className="size-3.5 text-brand-500" />
                                Tuntaskan learning path
                            </li>
                        </ul>
                    </div>
                </div>

                {groups.map((group) => (
                    <section key={group.category}>
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-[16px] font-extrabold tracking-tight text-slate-900">
                                {CATEGORY_LABEL[group.category] ?? group.category}
                            </h2>
                            <span className="text-[11.5px] text-slate-500">
                                {group.badges.filter((b) => b.earned).length} / {group.badges.length}{' '}
                                terkumpul
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {group.badges.map((b) => (
                                <BadgeCard key={b.id} badge={b} />
                            ))}
                        </div>
                    </section>
                ))}

                <div className="rounded-2xl bg-card p-5 ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                    <h2 className="text-[14px] font-bold text-slate-900">
                        Lanjutkan belajar untuk dapat badge lagi
                    </h2>
                    <p className="mt-1 text-[12.5px] text-slate-500">
                        Streak Anda dihitung dari setiap kali menandai lesson selesai. Lewati
                        satu hari, streak reset.
                    </p>
                    <div className="mt-3 flex gap-2">
                        <Link
                            href="/my-courses"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-[12.5px] font-bold text-white hover:bg-brand-700"
                        >
                            <BookOpen className="size-3.5" />
                            Course Saya
                        </Link>
                        <Link
                            href="/my-paths"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-[12.5px] font-bold text-white hover:bg-brand-700"
                        >
                            <Compass className="size-3.5" />
                            Path Saya
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

function BadgeCard({ badge }: { badge: BadgeItem }) {
    const Icon = (badge.icon && ICON_MAP[badge.icon]) ?? Award;
    const gradient = CATEGORY_GRADIENT[badge.category] ?? CATEGORY_GRADIENT.milestone;
    const requirement = badgeRequirement(badge.criteria);

    return (
        <div
            className={cn(
                'overflow-hidden rounded-2xl ring-1 transition shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
                badge.earned
                    ? 'bg-card ring-slate-200/70 hover:-translate-y-0.5 hover:ring-slate-300'
                    : 'bg-slate-50/60 ring-slate-200/70',
            )}
        >
            <div
                className={cn(
                    'relative aspect-[16/10] flex items-center justify-center bg-gradient-to-br p-5 text-white',
                    badge.earned ? gradient : 'from-slate-200 via-slate-300 to-slate-400 grayscale',
                )}
            >
                <Icon
                    strokeWidth={1.5}
                    className={cn('size-16', badge.earned ? 'text-white' : 'text-slate-500')}
                />
                {!badge.earned && (
                    <div className="absolute top-3 right-3 grid size-7 place-items-center rounded-full bg-white/80 text-slate-500 ring-1 ring-slate-300">
                        <Lock className="size-3.5" />
                    </div>
                )}
                {badge.earned && (
                    <Badge className="absolute top-3 right-3 border-transparent bg-white/90 text-emerald-700 backdrop-blur">
                        Diraih
                    </Badge>
                )}
            </div>

            <div className="p-4">
                <div className={cn('text-[14px] leading-snug font-bold', badge.earned ? 'text-slate-900' : 'text-slate-700')}>
                    {badge.name}
                </div>
                <p className="mt-1 line-clamp-2 text-[12px] text-slate-500">
                    {badge.description}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
                    <span className="text-slate-500">{requirement}</span>
                    {badge.earned && badge.earned_at && (
                        <span className="font-semibold text-emerald-700">
                            {formatDate(badge.earned_at)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
