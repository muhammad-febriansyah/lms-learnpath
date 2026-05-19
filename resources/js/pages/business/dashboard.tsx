import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    BookOpen,
    Building2,
    CheckCircle2,
    Clock,
    Flame,
    GraduationCap,
    Mail,
    Medal,
    Plus,
    Trophy,
    Users,
} from 'lucide-react';

import { IconChevR } from '@/components/learnpath-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Organization = {
    id: number;
    name: string;
    slug: string;
    industry: string | null;
    seat_quota: number;
    seats_used: number;
    seats_available: number;
    status: string;
};

type Stats = {
    members: number;
    pending_invites: number;
    total_enrollments: number;
    completed_enrollments: number;
    completion_rate: number;
};

type Member = {
    id: number;
    role: string;
    joined_at: string | null;
    user: { id: number; name: string; email: string; avatar_url: string | null } | null;
};

type Invitation = {
    id: number;
    email: string;
    name: string | null;
    role: string;
    accepted_at: string | null;
    expires_at: string | null;
    is_pending: boolean;
    is_expired: boolean;
    accepted_user: { id: number; name: string } | null;
};

type LeaderboardEntry = {
    rank: number;
    user_id: number;
    user: { id: number; name: string; email: string; avatar_url: string | null };
    employee: { division: string | null; position: string | null } | null;
    courses_completed: number;
    badges_count: number;
    longest_streak: number;
    score: number;
};

type Props = {
    organization: Organization;
    stats: Stats;
    recentMembers: Member[];
    recentInvitations: Invitation[];
    topMembers: LeaderboardEntry[];
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

function timeAgo(iso: string | null): string {
    if (!iso) return '-';
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}j`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}h`;
    return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}

export default function BusinessDashboard({
    organization,
    stats,
    recentMembers,
    recentInvitations,
    topMembers,
}: Props) {
    const seatPct = organization.seat_quota > 0
        ? Math.round((organization.seats_used / organization.seat_quota) * 100)
        : 0;

    return (
        <>
            <Head title={`Dashboard ${organization.name}`} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Korporat</span>
                    </nav>
                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
                                <Building2 className="size-6 text-brand-600" />
                                {organization.name}
                            </h1>
                            {organization.industry && (
                                <p className="mt-1 text-[12.5px] text-slate-500">
                                    {organization.industry}
                                </p>
                            )}
                        </div>
                        <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                            <Link href="/business/invitations">
                                <Plus className="mr-1.5 size-4" />
                                Undang Karyawan
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Seat usage hero */}
                <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-6 text-white shadow-xl">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <div className="text-[11px] font-bold tracking-wider uppercase opacity-70">
                                Penggunaan Seat
                            </div>
                            <div className="mt-1 flex items-baseline gap-3">
                                <span className="text-[42px] font-extrabold tabular-nums leading-none">
                                    {organization.seats_used}
                                </span>
                                <span className="text-[16px] opacity-80">
                                    / {organization.seat_quota} seat
                                </span>
                            </div>
                            <div className="mt-1 text-[12.5px] opacity-80">
                                {organization.seats_available} seat tersedia
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <MetricBlock label="Karyawan" value={stats.members} />
                            <MetricBlock label="Undangan Pending" value={stats.pending_invites} />
                            <MetricBlock label="Total Enroll" value={stats.total_enrollments} />
                            <MetricBlock label="% Selesai" value={`${stats.completion_rate}%`} />
                        </div>
                    </div>
                    <div className="mt-5">
                        <div className="h-2 overflow-hidden rounded-full bg-white/15">
                            <div
                                className="h-full rounded-full bg-white"
                                style={{ width: `${seatPct}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Quick actions */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <ActionCard
                        href="/business/members"
                        title="Karyawan Anda"
                        description={`${stats.members} member aktif`}
                        icon={Users}
                        tint="bg-brand-50"
                        text="text-brand-600"
                    />
                    <ActionCard
                        href="/business/invitations"
                        title="Undangan"
                        description={`${stats.pending_invites} pending`}
                        icon={Mail}
                        tint="bg-brand-50"
                        text="text-brand-600"
                    />
                    <ActionCard
                        href="/admin/reports/course-progress"
                        title="Laporan Progress"
                        description="Pantau pelatihan karyawan"
                        icon={GraduationCap}
                        tint="bg-emerald-50"
                        text="text-emerald-600"
                    />
                </div>

                {topMembers.length > 0 && (
                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="inline-flex items-center gap-1.5 text-[15px] font-bold text-slate-900">
                                    <Trophy className="size-4 text-amber-500" />
                                    Top Karyawan
                                </h2>
                                <p className="mt-0.5 text-[11.5px] text-slate-500">
                                    Berdasarkan course, badge, streak, dan path
                                </p>
                            </div>
                            <Button asChild variant="outline" size="sm" className="rounded-xl">
                                <Link href="/business/leaderboard">
                                    Lihat Leaderboard
                                    <IconChevR size={12} className="ml-1" />
                                </Link>
                            </Button>
                        </div>
                        <ul className="space-y-2">
                            {topMembers.map((entry) => (
                                <li
                                    key={entry.user_id}
                                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/40 p-3"
                                >
                                    <div
                                        className={cn(
                                            'grid size-8 shrink-0 place-items-center rounded-full text-[12px] font-extrabold',
                                            entry.rank === 1
                                                ? 'bg-amber-100 text-amber-700'
                                                : entry.rank === 2
                                                  ? 'bg-slate-200 text-slate-700'
                                                  : entry.rank === 3
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : 'bg-slate-100 text-slate-600',
                                        )}
                                    >
                                        {entry.rank <= 3 ? (
                                            <Medal className="size-4" />
                                        ) : (
                                            `#${entry.rank}`
                                        )}
                                    </div>
                                    <Avatar className="size-9 ring-1 ring-slate-200">
                                        {entry.user.avatar_url && (
                                            <AvatarImage
                                                src={entry.user.avatar_url}
                                                alt={entry.user.name}
                                            />
                                        )}
                                        <AvatarFallback className="bg-gradient-to-br from-brand-300 to-brand-600 text-[11px] font-bold text-white">
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
                                    <div className="flex shrink-0 items-center gap-3 text-[11px] text-slate-600">
                                        <span className="inline-flex items-center gap-0.5 tabular-nums">
                                            <BookOpen className="size-3 text-slate-400" />
                                            {entry.courses_completed}
                                        </span>
                                        <span className="inline-flex items-center gap-0.5 tabular-nums">
                                            <Award className="size-3 text-amber-500" />
                                            {entry.badges_count}
                                        </span>
                                        <span className="inline-flex items-center gap-0.5 tabular-nums">
                                            <Flame className="size-3 text-orange-500" />
                                            {entry.longest_streak}d
                                        </span>
                                    </div>
                                    <Badge className="border-transparent bg-brand-50 text-brand-700 tabular-nums hover:bg-brand-50">
                                        {entry.score.toLocaleString('id-ID')} pts
                                    </Badge>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="grid gap-5 lg:grid-cols-2">
                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-[15px] font-bold text-slate-900">Karyawan Terbaru</h2>
                            <Button asChild variant="outline" size="sm" className="rounded-xl">
                                <Link href="/business/members">
                                    Semua
                                    <IconChevR size={12} className="ml-1" />
                                </Link>
                            </Button>
                        </div>
                        {recentMembers.length === 0 ? (
                            <div className="py-10 text-center">
                                <Users className="mx-auto mb-2 size-6 text-slate-400" />
                                <p className="text-sm font-semibold text-slate-900">Belum ada karyawan</p>
                                <Button
                                    asChild
                                    className="mt-3 rounded-xl bg-brand-600 hover:bg-brand-700"
                                >
                                    <Link href="/business/invitations">
                                        Undang sekarang
                                        <ArrowRight className="ml-1 size-3.5" />
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {recentMembers.map((m) => (
                                    <li key={m.id} className="flex items-center gap-3">
                                        <Avatar className="size-9 ring-1 ring-slate-200">
                                            {m.user?.avatar_url && (
                                                <AvatarImage
                                                    src={m.user.avatar_url}
                                                    alt={m.user.name}
                                                />
                                            )}
                                            <AvatarFallback className="bg-gradient-to-br from-brand-300 to-brand-600 text-[11px] font-bold text-white">
                                                {m.user ? initials(m.user.name) : '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-[13px] font-semibold text-slate-900">
                                                {m.user?.name}
                                            </div>
                                            <div className="truncate text-[11px] text-slate-500">
                                                {m.user?.email}
                                            </div>
                                        </div>
                                        <Badge
                                            className={cn(
                                                'border-transparent text-[10px]',
                                                m.role === 'admin'
                                                    ? 'bg-brand-50 text-brand-700'
                                                    : 'bg-slate-100 text-slate-600',
                                            )}
                                        >
                                            {m.role === 'admin' ? 'Admin' : 'Karyawan'}
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-[15px] font-bold text-slate-900">Undangan Terbaru</h2>
                            <Button asChild variant="outline" size="sm" className="rounded-xl">
                                <Link href="/business/invitations">
                                    Semua
                                    <IconChevR size={12} className="ml-1" />
                                </Link>
                            </Button>
                        </div>
                        {recentInvitations.length === 0 ? (
                            <div className="py-10 text-center">
                                <Mail className="mx-auto mb-2 size-6 text-slate-400" />
                                <p className="text-sm font-semibold text-slate-900">
                                    Belum ada undangan
                                </p>
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {recentInvitations.map((i) => (
                                    <li key={i.id} className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                'grid size-9 place-items-center rounded-full',
                                                i.accepted_at
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : i.is_expired
                                                        ? 'bg-slate-100 text-slate-500'
                                                        : 'bg-amber-50 text-amber-600',
                                            )}
                                        >
                                            {i.accepted_at ? (
                                                <CheckCircle2 className="size-4" />
                                            ) : i.is_expired ? (
                                                <Clock className="size-4" />
                                            ) : (
                                                <Mail className="size-4" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-[13px] font-semibold text-slate-900">
                                                {i.email}
                                            </div>
                                            <div className="text-[11px] text-slate-500">
                                                {i.accepted_at
                                                    ? `Bergabung ${timeAgo(i.accepted_at)} lalu`
                                                    : i.is_expired
                                                        ? 'Kedaluwarsa'
                                                        : `Berlaku sampai ${new Date(i.expires_at ?? '').toLocaleDateString('id-ID')}`}
                                            </div>
                                        </div>
                                        <Badge
                                            className={cn(
                                                'border-transparent text-[10px]',
                                                i.accepted_at
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : i.is_expired
                                                        ? 'bg-slate-100 text-slate-600'
                                                        : 'bg-amber-50 text-amber-700',
                                            )}
                                        >
                                            {i.accepted_at ? 'Diterima' : i.is_expired ? 'Expired' : 'Pending'}
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function MetricBlock({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="rounded-xl bg-white/10 px-3 py-2.5">
            <div className="text-[9.5px] font-bold tracking-wider uppercase opacity-70">{label}</div>
            <div className="mt-0.5 text-[15px] font-extrabold tabular-nums">{value}</div>
        </div>
    );
}

function ActionCard({
    href,
    title,
    description,
    icon: Icon,
    tint,
    text,
}: {
    href: string;
    title: string;
    description: string;
    icon: typeof Users;
    tint: string;
    text: string;
}) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-3 rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 transition-shadow hover:shadow-md"
        >
            <div className={cn('grid size-10 place-items-center rounded-xl', tint, text)}>
                <Icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-bold text-slate-900">{title}</div>
                <div className="truncate text-[11.5px] text-slate-500">{description}</div>
            </div>
            <IconChevR
                size={14}
                className="text-slate-400 transition-transform group-hover:translate-x-0.5"
            />
        </Link>
    );
}

