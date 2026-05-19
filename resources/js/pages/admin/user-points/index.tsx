import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Activity,
    Award,
    Coins,
    Flame,
    Medal,
    Search,
    TrendingUp,
    Trophy,
    User as UserIcon,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { DataTable } from '@/components/data-table/data-table';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import type { Paginator } from '@/components/data-table/data-table-pagination';
import { IconChevR } from '@/components/learnpath-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type Row = {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    total_points: number;
    lifetime_points: number;
    level: string;
    current_streak: number;
    longest_streak: number;
    joined_at: string | null;
};

type Stats = {
    total_users: number;
    total_points: number;
    lifetime_points: number;
    active_streaks: number;
};

type LevelDist = { level: string; count: number };

type RecentTx = {
    id: number;
    reason: string;
    amount: number;
    created_at: string | null;
    user: { id: number; name: string; avatar: string | null } | null;
};

type Props = {
    users: Paginator<Row>;
    filters: { search: string | null; level: string | null; sort: string };
    stats: Stats;
    levelDistribution: LevelDist[];
    recentTransactions: RecentTx[];
    levels: string[];
};

const LEVEL_LABEL: Record<string, string> = {
    bronze: 'Bronze',
    silver: 'Silver',
    gold: 'Gold',
    platinum: 'Platinum',
    diamond: 'Diamond',
};

const LEVEL_TONE: Record<string, string> = {
    bronze: 'border-transparent bg-amber-100 text-amber-800',
    silver: 'border-transparent bg-slate-200 text-slate-700',
    gold: 'border-transparent bg-yellow-100 text-yellow-800',
    platinum: 'border-transparent bg-sky-100 text-sky-700',
    diamond: 'border-transparent bg-violet-100 text-violet-700',
};

const REASON_LABEL: Record<string, string> = {
    daily_login: 'Login Harian',
    course_complete: 'Selesaikan Course',
    lesson_complete: 'Selesaikan Pelajaran',
    quiz_pass: 'Lulus Kuis',
    streak_bonus: 'Bonus Streak',
    review_post: 'Tulis Ulasan',
    redemption: 'Tukar Poin',
    refund: 'Refund Poin',
};

function initials(name: string): string {
    return name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function formatNumber(n: number): string {
    return new Intl.NumberFormat('id-ID').format(n);
}

function formatRelative(value: string | null): string {
    if (!value) return '-';
    const d = new Date(value);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} mnt`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} hari`;
    return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
    });
}

export default function UserPointsIndex({
    users,
    filters,
    stats,
    levelDistribution,
    recentTransactions,
    levels,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const initial = useRef(true);

    const apply = (next: Record<string, string | undefined>) => {
        router.get(
            '/admin/user-points',
            {
                search: filters.search ?? undefined,
                level: filters.level ?? undefined,
                sort: filters.sort,
                ...next,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    useEffect(() => {
        if (initial.current) {
            initial.current = false;
            return;
        }
        const t = setTimeout(() => {
            apply({ search: search || undefined });
        }, 350);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const topUser = users.data[0];
    const totalLevelDist =
        levelDistribution.reduce((acc, d) => acc + d.count, 0) || 1;

    const columns: ColumnDef<Row>[] = [
        {
            id: 'rank',
            header: '#',
            cell: ({ row }) => {
                const rank =
                    (users.current_page - 1) * users.per_page + row.index + 1;
                return (
                    <span
                        className={cn(
                            'inline-flex size-7 items-center justify-center rounded-full text-[11.5px] font-extrabold tabular-nums',
                            rank === 1
                                ? 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-300'
                                : rank === 2
                                  ? 'bg-slate-200 text-slate-700 ring-1 ring-slate-300'
                                  : rank === 3
                                    ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300'
                                    : 'bg-slate-50 text-slate-500 ring-1 ring-slate-200',
                        )}
                    >
                        {rank}
                    </span>
                );
            },
        },
        {
            id: 'user',
            header: 'Pengguna',
            cell: ({ row }) => {
                const u = row.original;
                return (
                    <Link
                        href={`/admin/user-points/${u.id}`}
                        className="flex items-center gap-3"
                    >
                        <Avatar className="size-9 ring-1 ring-slate-200">
                            {u.avatar ? (
                                <AvatarImage src={u.avatar} alt={u.name} />
                            ) : null}
                            <AvatarFallback className="bg-brand-50 text-brand-700 text-[11px] font-bold">
                                {initials(u.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <div className="max-w-[200px] truncate text-[13.5px] font-semibold text-slate-900 hover:text-brand-700">
                                {u.name}
                            </div>
                            <div className="max-w-[200px] truncate text-[11.5px] text-slate-500">
                                {u.email}
                            </div>
                        </div>
                    </Link>
                );
            },
        },
        {
            id: 'level',
            header: 'Level',
            cell: ({ row }) => (
                <Badge
                    className={cn(
                        'text-[10.5px] font-bold',
                        LEVEL_TONE[row.original.level] ?? LEVEL_TONE.bronze,
                    )}
                >
                    {LEVEL_LABEL[row.original.level] ?? row.original.level}
                </Badge>
            ),
        },
        {
            id: 'points',
            header: 'Poin',
            cell: ({ row }) => (
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2 py-1 text-[12.5px] font-bold text-amber-700 ring-1 ring-amber-200">
                    <Coins className="size-3.5" />
                    <span className="tabular-nums">
                        {formatNumber(row.original.total_points)}
                    </span>
                </div>
            ),
        },
        {
            id: 'lifetime',
            header: 'Lifetime',
            cell: ({ row }) => (
                <span className="text-[12.5px] tabular-nums text-slate-700">
                    {formatNumber(row.original.lifetime_points)}
                </span>
            ),
        },
        {
            id: 'streak',
            header: 'Streak',
            cell: ({ row }) => {
                const s = row.original.current_streak;
                if (s === 0) {
                    return <span className="text-[12px] text-slate-400">-</span>;
                }
                return (
                    <div className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-1.5 py-0.5 text-[11.5px] font-bold text-rose-700">
                        <Flame className="size-3" />
                        <span className="tabular-nums">{s} hari</span>
                    </div>
                );
            },
        },
        {
            id: 'action',
            header: '',
            cell: ({ row }) => (
                <Link
                    href={`/admin/user-points/${row.original.id}`}
                    className="inline-flex items-center gap-1 text-[11.5px] font-bold text-brand-700 hover:underline"
                >
                    Detail
                    <IconChevR size={12} />
                </Link>
            ),
        },
    ];

    return (
        <>
            <Head title="Poin Pengguna" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link
                            href="/admin/dashboard"
                            className="hover:text-slate-700"
                        >
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            Poin Pengguna
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Poin & Streak Pengguna
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Pantau perolehan poin, level, dan streak harian dari
                        seluruh pengguna platform.
                    </p>
                </div>

                {/* Stat cards */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={Users}
                        label="Total Pengguna"
                        value={formatNumber(stats.total_users)}
                        tone="brand"
                    />
                    <StatCard
                        icon={Coins}
                        label="Total Poin Aktif"
                        value={formatNumber(stats.total_points)}
                        tone="amber"
                    />
                    <StatCard
                        icon={Award}
                        label="Lifetime Poin"
                        value={formatNumber(stats.lifetime_points)}
                        tone="violet"
                    />
                    <StatCard
                        icon={Flame}
                        label="Streak Aktif"
                        value={formatNumber(stats.active_streaks)}
                        tone="rose"
                    />
                </div>

                {/* Top user + level distribution + activity */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Top user */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 p-5 text-white shadow-[0_8px_30px_-12px_rgba(251,146,60,0.4)]">
                        <div
                            aria-hidden
                            className="absolute -top-10 -right-10 size-40 rounded-full bg-white/15 blur-3xl"
                        />
                        <div className="relative">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase opacity-90">
                                <Trophy className="size-3.5" />
                                #1 Top Poin
                            </div>
                            {topUser ? (
                                <Link
                                    href={`/admin/user-points/${topUser.id}`}
                                    className="mt-3 block"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="size-12 ring-2 ring-white/40">
                                            {topUser.avatar ? (
                                                <AvatarImage
                                                    src={topUser.avatar}
                                                    alt={topUser.name}
                                                />
                                            ) : null}
                                            <AvatarFallback className="bg-white/20 text-white">
                                                {initials(topUser.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <div className="truncate text-[15px] font-extrabold">
                                                {topUser.name}
                                            </div>
                                            <div className="truncate text-[11.5px] opacity-80">
                                                {topUser.email}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-end gap-2">
                                        <span className="text-3xl font-extrabold tabular-nums">
                                            {formatNumber(topUser.total_points)}
                                        </span>
                                        <span className="mb-1 text-[12px] opacity-80">
                                            poin aktif
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 text-[11.5px] opacity-90">
                                        <Medal className="size-3.5" />
                                        Level{' '}
                                        {LEVEL_LABEL[topUser.level] ?? topUser.level}
                                        <span className="opacity-50">·</span>
                                        Lifetime{' '}
                                        {formatNumber(topUser.lifetime_points)}
                                    </div>
                                </Link>
                            ) : (
                                <div className="mt-4 text-[12.5px] opacity-90">
                                    Belum ada data.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Level distribution */}
                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <div className="flex items-center gap-2">
                            <div className="grid size-8 place-items-center rounded-lg bg-violet-50 text-violet-700">
                                <Medal className="size-4" />
                            </div>
                            <div>
                                <div className="text-[13.5px] font-bold text-slate-900">
                                    Distribusi Level
                                </div>
                                <div className="text-[11.5px] text-slate-500">
                                    Sebaran user per tingkat gamifikasi
                                </div>
                            </div>
                        </div>
                        <ul className="mt-4 space-y-2.5">
                            {levelDistribution.map((d) => {
                                const pct = (d.count / totalLevelDist) * 100;
                                return (
                                    <li key={d.level}>
                                        <div className="flex items-center justify-between text-[11.5px]">
                                            <span
                                                className={cn(
                                                    'inline-flex rounded-full px-2 py-0.5 text-[10.5px] font-bold',
                                                    LEVEL_TONE[d.level] ??
                                                        LEVEL_TONE.bronze,
                                                )}
                                            >
                                                {LEVEL_LABEL[d.level] ?? d.level}
                                            </span>
                                            <span className="font-bold tabular-nums text-slate-900">
                                                {formatNumber(d.count)}
                                            </span>
                                        </div>
                                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Recent transactions */}
                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <div className="flex items-center gap-2">
                            <div className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                                <Activity className="size-4" />
                            </div>
                            <div>
                                <div className="text-[13.5px] font-bold text-slate-900">
                                    Aktivitas Terbaru
                                </div>
                                <div className="text-[11.5px] text-slate-500">
                                    10 transaksi poin terakhir
                                </div>
                            </div>
                        </div>
                        <ul className="mt-3 divide-y divide-slate-100">
                            {recentTransactions.length === 0 ? (
                                <li className="py-6 text-center text-[12px] text-slate-500">
                                    Belum ada transaksi.
                                </li>
                            ) : (
                                recentTransactions.map((t) => (
                                    <li
                                        key={t.id}
                                        className="flex items-center gap-2 py-2"
                                    >
                                        <Avatar className="size-7 shrink-0 ring-1 ring-slate-200">
                                            {t.user?.avatar ? (
                                                <AvatarImage
                                                    src={t.user.avatar}
                                                    alt={t.user.name}
                                                />
                                            ) : null}
                                            <AvatarFallback className="bg-slate-100 text-slate-700 text-[10px] font-bold">
                                                {t.user ? initials(t.user.name) : '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-baseline justify-between gap-2">
                                                <span className="max-w-[110px] truncate text-[12px] font-semibold text-slate-900">
                                                    {t.user?.name ?? 'Pengguna'}
                                                </span>
                                                <span
                                                    className={cn(
                                                        'text-[11.5px] font-extrabold tabular-nums',
                                                        t.amount >= 0
                                                            ? 'text-emerald-600'
                                                            : 'text-rose-600',
                                                    )}
                                                >
                                                    {t.amount >= 0 ? '+' : ''}
                                                    {formatNumber(t.amount)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-2 text-[10.5px] text-slate-500">
                                                <span className="truncate">
                                                    {REASON_LABEL[t.reason] ??
                                                        t.reason}
                                                </span>
                                                <span>
                                                    {formatRelative(t.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>

                {/* Leaderboard table */}
                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-[15px] font-bold text-slate-900">
                                Leaderboard Pengguna
                            </h2>
                            <p className="mt-0.5 text-[12.5px] text-slate-500">
                                Urutkan & filter pengguna berdasarkan poin, level,
                                atau streak.
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11.5px] text-slate-500">
                            <TrendingUp className="size-3.5 text-slate-400" />
                            Menampilkan{' '}
                            <strong className="text-slate-900">
                                {formatNumber(users.total)}
                            </strong>{' '}
                            pengguna
                        </div>
                    </div>

                    <DataTable
                        columns={columns}
                        data={users.data}
                        searchValue={search}
                        searchPlaceholder="Cari nama / email..."
                        onSearchChange={setSearch}
                        toolbarSlot={
                            <>
                                <Select
                                    value={filters.level ?? 'all'}
                                    onValueChange={(v) =>
                                        apply({
                                            level: v === 'all' ? undefined : v,
                                        })
                                    }
                                >
                                    <SelectTrigger className="h-9 w-[140px]">
                                        <SelectValue placeholder="Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua Level
                                        </SelectItem>
                                        {levels.map((lvl) => (
                                            <SelectItem key={lvl} value={lvl}>
                                                {LEVEL_LABEL[lvl] ?? lvl}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filters.sort}
                                    onValueChange={(v) => apply({ sort: v })}
                                >
                                    <SelectTrigger className="h-9 w-[170px]">
                                        <SelectValue placeholder="Urutkan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="points_desc">
                                            Poin Tertinggi
                                        </SelectItem>
                                        <SelectItem value="points_asc">
                                            Poin Terendah
                                        </SelectItem>
                                        <SelectItem value="lifetime_desc">
                                            Lifetime Tertinggi
                                        </SelectItem>
                                        <SelectItem value="streak_desc">
                                            Streak Terpanjang
                                        </SelectItem>
                                        <SelectItem value="newest">
                                            Terbaru Daftar
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </>
                        }
                    />

                    <div className="mt-4">
                        <DataTablePagination paginator={users} />
                    </div>
                </div>
            </div>
        </>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
    tone,
}: {
    icon: typeof UserIcon;
    label: string;
    value: string;
    tone: 'brand' | 'amber' | 'violet' | 'rose' | 'emerald';
}) {
    const tones: Record<typeof tone, string> = {
        brand: 'bg-brand-50 text-brand-700',
        amber: 'bg-amber-50 text-amber-700',
        violet: 'bg-violet-50 text-violet-700',
        rose: 'bg-rose-50 text-rose-700',
        emerald: 'bg-emerald-50 text-emerald-700',
    };

    return (
        <div className="rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="flex items-center gap-2.5">
                <div
                    className={cn(
                        'grid size-9 place-items-center rounded-xl',
                        tones[tone],
                    )}
                >
                    <Icon className="size-4" />
                </div>
                <div className="text-[11.5px] font-medium text-slate-500">
                    {label}
                </div>
            </div>
            <div className="mt-3 text-2xl font-extrabold tabular-nums text-slate-900">
                {value}
            </div>
        </div>
    );
}
