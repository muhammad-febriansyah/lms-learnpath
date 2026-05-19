import { Head, Link, router } from '@inertiajs/react';
import {
    Award,
    BookOpen,
    Coins,
    Flame,
    Gem,
    LogIn,
    MessagesSquare,
    Star,
    Target,
    Trophy,
    UserCheck,
    type LucideIcon,
} from 'lucide-react';

import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import type { Paginator } from '@/components/data-table/data-table-pagination';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type Summary = {
    total_points: number;
    lifetime_points: number;
    level: string;
    next_level: string | null;
    next_threshold: number | null;
    current_streak: number;
    longest_streak: number;
};

type Transaction = {
    id: number;
    reason: string;
    amount: number;
    meta: Record<string, unknown> | null;
    created_at: string | null;
};

type Aggregate = { reason: string; total: number; count: number };

type Props = {
    summary: Summary;
    transactions: Paginator<Transaction>;
    by_reason: Aggregate[];
    filters: { reason?: string };
    config: {
        rewards: Record<string, number>;
        streak_bonus: Record<string, number>;
        levels: Record<string, string>;
    };
};

const REASON_LABEL: Record<string, string> = {
    daily_login: 'Login Harian',
    first_login: 'Login Pertama',
    lesson_complete: 'Lesson Selesai',
    course_complete: 'Course Selesai',
    assessment_pass: 'Lulus Assessment',
    assessment_perfect_bonus: 'Bonus Nilai Sempurna',
    profile_complete: 'Profil Lengkap',
    review_course: 'Beri Ulasan',
    discussion_thread: 'Posting Diskusi',
    discussion_reply: 'Balas Diskusi',
    referral: 'Referral Teman',
};

const REASON_ICON: Record<string, LucideIcon> = {
    daily_login: LogIn,
    first_login: LogIn,
    lesson_complete: BookOpen,
    course_complete: Trophy,
    assessment_pass: Target,
    assessment_perfect_bonus: Star,
    profile_complete: UserCheck,
    review_course: Star,
    discussion_thread: MessagesSquare,
    discussion_reply: MessagesSquare,
    referral: Award,
};

const LEVEL_GRADIENT: Record<string, string> = {
    bronze: 'from-amber-700 via-amber-600 to-orange-600',
    silver: 'from-slate-400 via-slate-300 to-slate-500',
    gold: 'from-yellow-400 via-amber-500 to-orange-500',
    platinum: 'from-cyan-300 via-sky-400 to-brand-500',
    diamond: 'from-brand-400 via-brand-500 to-brand-600',
};

function formatNumber(n: number): string {
    return new Intl.NumberFormat('id-ID').format(n);
}

function formatDateTime(iso: string | null): string {
    if (!iso) {
        return '-';
    }
    return new Date(iso).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function reasonLabel(reason: string): string {
    return REASON_LABEL[reason] ?? reason.replace(/_/g, ' ');
}

export default function MyPointsIndex({
    summary,
    transactions,
    by_reason,
    filters,
    config,
}: Props) {
    const gradient = LEVEL_GRADIENT[summary.level] ?? LEVEL_GRADIENT.bronze;

    const progressPct =
        summary.next_threshold && summary.next_threshold > 0
            ? Math.min(
                  100,
                  Math.round(
                      (summary.lifetime_points / summary.next_threshold) * 100,
                  ),
              )
            : 100;

    const remaining = summary.next_threshold
        ? Math.max(0, summary.next_threshold - summary.lifetime_points)
        : 0;

    const handleFilter = (reason: string | undefined) => {
        router.get(
            '/my-points',
            { reason },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Poin Saya" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                        Poin & Streak
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Lacak progress level, streak harian, dan riwayat poin dari setiap
                        aktivitas belajar.
                    </p>
                </div>

                {/* Hero summary */}
                <div className="grid gap-4 lg:grid-cols-3">
                    <div
                        className={cn(
                            'col-span-1 overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-md lg:col-span-2',
                            gradient,
                        )}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur">
                                    <Gem className="size-3" /> Level {summary.level}
                                </div>
                                <div className="mt-4 flex items-end gap-2">
                                    <span className="text-4xl font-extrabold tabular-nums">
                                        {formatNumber(summary.total_points)}
                                    </span>
                                    <span className="mb-1 text-sm font-medium opacity-90">
                                        poin
                                    </span>
                                </div>
                                <p className="mt-0.5 text-[12.5px] opacity-90">
                                    Lifetime: {formatNumber(summary.lifetime_points)} poin
                                </p>
                            </div>
                            <div className="grid size-14 place-items-center rounded-2xl bg-white/15 backdrop-blur">
                                <Coins className="size-7" />
                            </div>
                        </div>

                        {summary.next_threshold ? (
                            <div className="mt-5">
                                <div className="mb-1.5 flex items-center justify-between text-[12px] opacity-90">
                                    <span>
                                        Menuju <strong>{summary.next_level}</strong>
                                    </span>
                                    <span className="tabular-nums">
                                        {formatNumber(remaining)} poin lagi
                                    </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-white/25">
                                    <div
                                        className="h-full bg-white"
                                        style={{ width: `${progressPct}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-semibold backdrop-blur">
                                <Trophy className="size-3.5" />
                                Level tertinggi tercapai!
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-orange-50 p-4 shadow-sm">
                            <div className="flex items-center gap-2 text-rose-700">
                                <Flame className="size-4" />
                                <span className="text-[11.5px] font-bold uppercase tracking-wider">
                                    Streak
                                </span>
                            </div>
                            <div className="mt-2 text-3xl font-extrabold tabular-nums text-rose-900">
                                {summary.current_streak}
                                <span className="ml-1 text-sm font-medium text-rose-700">
                                    hari
                                </span>
                            </div>
                            <div className="mt-1 text-[11.5px] text-rose-700">
                                Terlama: {summary.longest_streak} hari
                            </div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-2 text-slate-600">
                                <Award className="size-4" />
                                <span className="text-[11.5px] font-bold uppercase tracking-wider">
                                    Aktivitas
                                </span>
                            </div>
                            <div className="mt-2 text-3xl font-extrabold tabular-nums text-slate-900">
                                {transactions.total}
                            </div>
                            <div className="mt-1 text-[11.5px] text-slate-500">
                                total transaksi poin
                            </div>
                        </div>
                    </div>
                </div>

                {/* By reason summary */}
                {by_reason.length > 0 && (
                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <h2 className="mb-3 text-[15px] font-bold text-slate-900">
                            Ringkasan per Aktivitas
                        </h2>
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
                            {by_reason.map((item) => {
                                const Icon = REASON_ICON[item.reason] ?? Coins;
                                return (
                                    <div
                                        key={item.reason}
                                        className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
                                    >
                                        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-brand-600 ring-1 ring-slate-200">
                                            <Icon className="size-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="truncate text-[12px] font-semibold text-slate-700">
                                                {reasonLabel(item.reason)}
                                            </div>
                                            <div className="text-[14px] font-extrabold tabular-nums text-slate-900">
                                                {formatNumber(item.total)}
                                                <span className="ml-1 text-[10.5px] font-normal text-slate-500">
                                                    ({item.count}x)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Transactions */}
                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-[15px] font-bold text-slate-900">
                                Riwayat Poin
                            </h2>
                            <p className="mt-0.5 text-[12.5px] text-slate-500">
                                Setiap aksi belajar dicatat di sini.
                            </p>
                        </div>
                        <Select
                            value={filters.reason ?? 'all'}
                            onValueChange={(value) =>
                                handleFilter(value === 'all' ? undefined : value)
                            }
                        >
                            <SelectTrigger className="h-9 w-full sm:w-[200px]">
                                <SelectValue placeholder="Filter aktivitas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Aktivitas</SelectItem>
                                {Object.keys(config.rewards).map((reason) => (
                                    <SelectItem key={reason} value={reason}>
                                        {reasonLabel(reason)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {transactions.data.length === 0 ? (
                        <div className="py-10 text-center">
                            <Coins className="mx-auto mb-2 size-7 text-slate-300" />
                            <p className="text-sm font-semibold text-slate-900">
                                Belum ada poin
                            </p>
                            <p className="mt-1 text-[12.5px] text-slate-500">
                                Mulai belajar untuk mengumpulkan poin pertamamu.
                            </p>
                            <Link
                                href="/my-courses"
                                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-[12.5px] font-semibold text-white hover:bg-brand-700"
                            >
                                Lihat Course Saya
                            </Link>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {transactions.data.map((tx) => {
                                const Icon = REASON_ICON[tx.reason] ?? Coins;
                                const streakBonus =
                                    typeof tx.meta?.streak_bonus === 'number'
                                        ? (tx.meta.streak_bonus as number)
                                        : null;
                                return (
                                    <li
                                        key={tx.id}
                                        className="flex items-center gap-3 py-3"
                                    >
                                        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500/10 to-brand-600/20 text-brand-700 ring-1 ring-brand-200">
                                            <Icon className="size-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="truncate text-[13.5px] font-semibold text-slate-900">
                                                    {reasonLabel(tx.reason)}
                                                </span>
                                                {streakBonus && streakBonus > 0 ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-rose-200 bg-rose-50 text-[10.5px] font-bold text-rose-700"
                                                    >
                                                        <Flame className="mr-0.5 size-2.5" />
                                                        +{streakBonus} streak
                                                    </Badge>
                                                ) : null}
                                            </div>
                                            <div className="mt-0.5 text-[11.5px] text-slate-500">
                                                {formatDateTime(tx.created_at)}
                                            </div>
                                        </div>
                                        <div
                                            className={cn(
                                                'shrink-0 text-[15px] font-extrabold tabular-nums',
                                                tx.amount >= 0
                                                    ? 'text-emerald-600'
                                                    : 'text-rose-600',
                                            )}
                                        >
                                            {tx.amount >= 0 ? '+' : ''}
                                            {formatNumber(tx.amount)}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    <div className="mt-4">
                        <DataTablePagination paginator={transactions} />
                    </div>
                </div>
            </div>
        </>
    );
}
