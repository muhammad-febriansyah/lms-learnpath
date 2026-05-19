import { Head, Link } from '@inertiajs/react';
import {
    Award,
    Coins,
    Flame,
    Medal,
    TrendingUp,
} from 'lucide-react';

import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import type { Paginator } from '@/components/data-table/data-table-pagination';
import { IconChevR } from '@/components/learnpath-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Student = {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    joined_at: string | null;
};

type Summary = {
    total_points: number;
    lifetime_points: number;
    level: string;
    current_streak: number;
    longest_streak: number;
    last_active_date: string | null;
};

type Transaction = {
    id: number;
    reason: string;
    amount: number;
    meta: Record<string, unknown> | null;
    created_at: string | null;
};

type ByReason = { reason: string; total: number; count: number };

type Props = {
    student: Student;
    summary: Summary;
    transactions: Paginator<Transaction>;
    byReason: ByReason[];
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

function formatDateTime(value: string | null): string {
    if (!value) return '-';
    return new Date(value).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function UserPointShow({
    student,
    summary,
    transactions,
    byReason,
}: Props) {
    const totalByReason = byReason.reduce((acc, r) => acc + r.total, 0) || 1;

    return (
        <>
            <Head title={`Poin · ${student.name}`} />
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
                        <Link
                            href="/admin/user-points"
                            className="hover:text-slate-700"
                        >
                            Poin Pengguna
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            {student.name}
                        </span>
                    </nav>
                </div>

                {/* Hero */}
                <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 p-6 text-white">
                    <div className="flex flex-wrap items-center gap-4">
                        <Avatar className="size-16 ring-4 ring-white/20">
                            {student.avatar ? (
                                <AvatarImage
                                    src={student.avatar}
                                    alt={student.name}
                                />
                            ) : null}
                            <AvatarFallback className="bg-brand-500 text-white text-lg font-bold">
                                {initials(student.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl font-extrabold tracking-tight">
                                {student.name}
                            </h1>
                            <div className="mt-0.5 text-[12.5px] text-white/70">
                                {student.email}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <Badge
                                    className={cn(
                                        'text-[10.5px] font-bold',
                                        LEVEL_TONE[summary.level] ??
                                            LEVEL_TONE.bronze,
                                    )}
                                >
                                    <Medal className="mr-1 size-3" />
                                    Level{' '}
                                    {LEVEL_LABEL[summary.level] ?? summary.level}
                                </Badge>
                                {summary.current_streak > 0 && (
                                    <Badge className="border-transparent bg-rose-500/30 text-rose-100 text-[10.5px] font-bold backdrop-blur">
                                        <Flame className="mr-1 size-3" />
                                        {summary.current_streak} hari streak
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <HeroStat
                            label="Poin Aktif"
                            value={formatNumber(summary.total_points)}
                            icon={<Coins className="size-4 text-amber-300" />}
                        />
                        <HeroStat
                            label="Lifetime Poin"
                            value={formatNumber(summary.lifetime_points)}
                            icon={<Award className="size-4 text-violet-300" />}
                        />
                        <HeroStat
                            label="Streak Sekarang"
                            value={`${summary.current_streak} hari`}
                            icon={<Flame className="size-4 text-rose-300" />}
                        />
                        <HeroStat
                            label="Streak Terpanjang"
                            value={`${summary.longest_streak} hari`}
                            icon={
                                <TrendingUp className="size-4 text-emerald-300" />
                            }
                        />
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
                    {/* Transactions */}
                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <div className="mb-3 flex items-center justify-between">
                            <div>
                                <h2 className="text-[15px] font-bold text-slate-900">
                                    Riwayat Transaksi Poin
                                </h2>
                                <p className="mt-0.5 text-[12.5px] text-slate-500">
                                    Setiap aksi belajar dicatat di sini.
                                </p>
                            </div>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                                {formatNumber(transactions.total)} total
                            </span>
                        </div>

                        {transactions.data.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
                                <Coins className="mx-auto mb-2 size-7 text-slate-400" />
                                <p className="text-[13px] font-semibold text-slate-700">
                                    Belum ada transaksi poin
                                </p>
                                <p className="mt-0.5 text-[12px] text-slate-500">
                                    Pengguna belum melakukan aktivitas berpoin.
                                </p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {transactions.data.map((t) => (
                                    <li
                                        key={t.id}
                                        className="flex items-center gap-3 py-3"
                                    >
                                        <div
                                            className={cn(
                                                'grid size-9 shrink-0 place-items-center rounded-xl text-[10px] font-bold',
                                                t.amount >= 0
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-rose-50 text-rose-700',
                                            )}
                                        >
                                            {t.amount >= 0 ? '+' : ''}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-[13.5px] font-semibold text-slate-900">
                                                {REASON_LABEL[t.reason] ?? t.reason}
                                            </div>
                                            <div className="text-[11.5px] text-slate-500">
                                                {formatDateTime(t.created_at)}
                                            </div>
                                        </div>
                                        <div
                                            className={cn(
                                                'text-[14px] font-extrabold tabular-nums',
                                                t.amount >= 0
                                                    ? 'text-emerald-600'
                                                    : 'text-rose-600',
                                            )}
                                        >
                                            {t.amount >= 0 ? '+' : ''}
                                            {formatNumber(t.amount)}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="mt-4">
                            <DataTablePagination paginator={transactions} />
                        </div>
                    </div>

                    {/* Breakdown by reason */}
                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <h2 className="text-[15px] font-bold text-slate-900">
                            Breakdown per Aktivitas
                        </h2>
                        <p className="mt-0.5 text-[12.5px] text-slate-500">
                            Sumber utama perolehan poin pengguna.
                        </p>

                        {byReason.length === 0 ? (
                            <div className="mt-4 rounded-xl border border-dashed border-slate-200 py-8 text-center text-[12.5px] text-slate-500">
                                Belum ada data.
                            </div>
                        ) : (
                            <ul className="mt-4 space-y-3">
                                {byReason.map((r) => {
                                    const pct = (r.total / totalByReason) * 100;
                                    return (
                                        <li key={r.reason}>
                                            <div className="flex items-center justify-between text-[12.5px]">
                                                <span className="font-semibold text-slate-900">
                                                    {REASON_LABEL[r.reason] ??
                                                        r.reason}
                                                </span>
                                                <span className="tabular-nums font-bold text-slate-900">
                                                    {formatNumber(r.total)}
                                                </span>
                                            </div>
                                            <div className="mt-1 flex items-center gap-2">
                                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                                                        style={{
                                                            width: `${pct}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="w-12 text-right text-[10.5px] text-slate-500">
                                                    {r.count}x
                                                </span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function HeroStat({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10 backdrop-blur">
            <div className="flex items-center gap-1.5 text-[10.5px] font-bold tracking-wider uppercase opacity-80">
                {icon}
                {label}
            </div>
            <div className="mt-1 text-xl font-extrabold tabular-nums">
                {value}
            </div>
        </div>
    );
}
