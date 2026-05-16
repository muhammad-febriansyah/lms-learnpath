import { Head, Link } from '@inertiajs/react';
import {
    Award,
    BookOpen,
    Compass,
    Flame,
    Info,
    Medal,
    Sparkles,
    Trophy,
} from 'lucide-react';

import { IconChevR } from '@/components/learnpath-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Entry = {
    rank: number;
    user_id: number;
    user: {
        id: number;
        name: string;
        email: string;
        avatar_url: string | null;
    };
    employee: { division: string | null; branch: string | null; position: string | null } | null;
    courses_completed: number;
    badges_count: number;
    current_streak: number;
    longest_streak: number;
    paths_completed: number;
    score: number;
};

type Props = {
    organization: { id: number; name: string; seat_quota: number; seats_used: number };
    entries: Entry[];
    scoring: {
        per_course: number;
        per_badge: number;
        per_streak_day: number;
        per_path: number;
    };
};

function initials(name: string): string {
    return name
        .split(' ')
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

const PODIUM_STYLES: Record<number, { gradient: string; ring: string; medal: string }> = {
    1: {
        gradient: 'from-amber-400 via-yellow-500 to-orange-500',
        ring: 'ring-amber-300',
        medal: 'text-yellow-200',
    },
    2: {
        gradient: 'from-slate-400 via-slate-500 to-slate-600',
        ring: 'ring-slate-300',
        medal: 'text-slate-200',
    },
    3: {
        gradient: 'from-orange-600 via-amber-700 to-yellow-800',
        ring: 'ring-orange-300',
        medal: 'text-orange-200',
    },
};

export default function BusinessLeaderboard({ organization, entries, scoring }: Props) {
    const podium = entries.slice(0, 3);
    const rest = entries.slice(3);

    return (
        <>
            <Head title={`Leaderboard ${organization.name}`} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/business/dashboard" className="hover:text-slate-700">
                            Dashboard Korporat
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Leaderboard</span>
                    </nav>
                    <h1 className="mt-1.5 inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
                        <Trophy className="size-6 text-amber-500" />
                        Leaderboard {organization.name}
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Peringkat karyawan berdasarkan aktivitas belajar dan pencapaian.
                    </p>
                </div>

                {entries.length === 0 ? (
                    <div className="rounded-2xl bg-card p-12 text-center ring-1 ring-slate-200/70">
                        <Trophy className="mx-auto mb-3 size-8 text-slate-400" />
                        <p className="text-sm font-semibold text-slate-900">
                            Belum ada data leaderboard
                        </p>
                        <p className="mt-1 text-[12.5px] text-slate-500">
                            Karyawan akan muncul di sini begitu mulai menyelesaikan course atau
                            mengumpulkan badge.
                        </p>
                    </div>
                ) : (
                    <>
                        {podium.length > 0 && (
                            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                {podium.map((entry) => {
                                    const style = PODIUM_STYLES[entry.rank];
                                    return (
                                        <div
                                            key={entry.user_id}
                                            className={cn(
                                                'overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-[0_4px_20px_rgba(15,23,42,0.12)]',
                                                style.gradient,
                                            )}
                                        >
                                            <div className="flex items-start justify-between">
                                                <Medal className={cn('size-8', style.medal)} strokeWidth={1.5} />
                                                <span className="text-[36px] leading-none font-extrabold opacity-80">
                                                    #{entry.rank}
                                                </span>
                                            </div>
                                            <div className="mt-4 flex items-center gap-3">
                                                <Avatar className={cn('size-12 ring-2', style.ring)}>
                                                    {entry.user.avatar_url && (
                                                        <AvatarImage
                                                            src={entry.user.avatar_url}
                                                            alt={entry.user.name}
                                                        />
                                                    )}
                                                    <AvatarFallback className="bg-white/20 text-[12px] font-bold text-white">
                                                        {initials(entry.user.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <div className="truncate text-[14.5px] font-extrabold">
                                                        {entry.user.name}
                                                    </div>
                                                    <div className="truncate text-[11px] opacity-85">
                                                        {entry.employee?.position ??
                                                            entry.employee?.division ??
                                                            'Karyawan'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-baseline gap-1">
                                                <span className="text-[32px] leading-none font-extrabold tabular-nums">
                                                    {entry.score.toLocaleString('id-ID')}
                                                </span>
                                                <span className="text-[12px] font-bold opacity-85">
                                                    pts
                                                </span>
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] opacity-90">
                                                <span className="inline-flex items-center gap-1">
                                                    <BookOpen className="size-3.5" />
                                                    {entry.courses_completed}
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Award className="size-3.5" />
                                                    {entry.badges_count}
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Flame className="size-3.5" />
                                                    {entry.longest_streak}d
                                                </span>
                                                {entry.paths_completed > 0 && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Compass className="size-3.5" />
                                                        {entry.paths_completed}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </section>
                        )}

                        {rest.length > 0 && (
                            <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                                <div className="grid grid-cols-12 gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-[10.5px] font-bold tracking-wider text-slate-500 uppercase">
                                    <div className="col-span-1">Rank</div>
                                    <div className="col-span-5">Karyawan</div>
                                    <div className="col-span-1 text-center" title="Course">
                                        <BookOpen className="mx-auto size-3.5" />
                                    </div>
                                    <div className="col-span-1 text-center" title="Badge">
                                        <Award className="mx-auto size-3.5" />
                                    </div>
                                    <div className="col-span-1 text-center" title="Streak terpanjang">
                                        <Flame className="mx-auto size-3.5" />
                                    </div>
                                    <div className="col-span-1 text-center" title="Path">
                                        <Compass className="mx-auto size-3.5" />
                                    </div>
                                    <div className="col-span-2 text-right">Score</div>
                                </div>
                                <ul className="divide-y divide-slate-100">
                                    {rest.map((entry) => (
                                        <li
                                            key={entry.user_id}
                                            className="grid grid-cols-12 items-center gap-3 px-4 py-3"
                                        >
                                            <div className="col-span-1 text-[13.5px] font-extrabold text-slate-700 tabular-nums">
                                                #{entry.rank}
                                            </div>
                                            <div className="col-span-5 flex items-center gap-3 min-w-0">
                                                <Avatar className="size-9 ring-1 ring-slate-200">
                                                    {entry.user.avatar_url && (
                                                        <AvatarImage
                                                            src={entry.user.avatar_url}
                                                            alt={entry.user.name}
                                                        />
                                                    )}
                                                    <AvatarFallback className="bg-gradient-to-br from-brand-300 to-brand-600 text-[10.5px] font-bold text-white">
                                                        {initials(entry.user.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <div className="truncate text-[13px] font-semibold text-slate-900">
                                                        {entry.user.name}
                                                    </div>
                                                    <div className="truncate text-[11px] text-slate-500">
                                                        {entry.employee?.position ??
                                                            entry.employee?.division ??
                                                            entry.user.email}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-span-1 text-center text-[12.5px] text-slate-700 tabular-nums">
                                                {entry.courses_completed}
                                            </div>
                                            <div className="col-span-1 text-center text-[12.5px] text-slate-700 tabular-nums">
                                                {entry.badges_count}
                                            </div>
                                            <div className="col-span-1 text-center text-[12.5px] text-slate-700 tabular-nums">
                                                {entry.longest_streak}d
                                            </div>
                                            <div className="col-span-1 text-center text-[12.5px] text-slate-700 tabular-nums">
                                                {entry.paths_completed}
                                            </div>
                                            <div className="col-span-2 text-right">
                                                <Badge className="border-transparent bg-brand-50 text-brand-700 font-extrabold tabular-nums hover:bg-brand-50">
                                                    {entry.score.toLocaleString('id-ID')} pts
                                                </Badge>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}

                <div className="rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-200/70">
                    <div className="inline-flex items-center gap-2 text-[12.5px] font-bold text-slate-700">
                        <Info className="size-4 text-brand-500" />
                        Formula skor
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[11.5px] text-slate-600 sm:grid-cols-4">
                        <ScoreRow icon={BookOpen} label="Course selesai" value={`${scoring.per_course} pts`} />
                        <ScoreRow icon={Award} label="Badge diraih" value={`${scoring.per_badge} pts`} />
                        <ScoreRow icon={Flame} label="Per hari streak" value={`${scoring.per_streak_day} pts`} />
                        <ScoreRow icon={Compass} label="Path selesai" value={`${scoring.per_path} pts`} />
                    </div>
                </div>
            </div>
        </>
    );
}

function ScoreRow({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof BookOpen;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200">
                <Icon className="size-3.5" />
            </div>
            <div className="min-w-0">
                <div className="text-[11px] text-slate-500">{label}</div>
                <div className="text-[12.5px] font-bold text-slate-900">{value}</div>
            </div>
        </div>
    );
}
