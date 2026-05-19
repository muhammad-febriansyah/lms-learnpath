import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowDownRight,
    ArrowUpRight,
    Award,
    BookOpen,
    ClipboardCheck,
    CreditCard,
    GraduationCap,
    MessageSquare,
    Receipt,
    Star,
    TrendingDown,
    Users,
    Wallet,
} from 'lucide-react';

import { IconChevR } from '@/components/learnpath-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Kpis = {
    students: { total: number; new_this_month: number; delta_pct: number };
    courses: { total: number; published: number };
    revenue: { this_month: number; all_time: number; delta_pct: number };
    enrollments: { this_month: number; completed_all_time: number; delta_pct: number };
    certificates: { this_month: number; delta_pct: number };
};

type TrendDay = { day: string; revenue?: number; orders?: number; c?: number };

type TopCourse = {
    id: number;
    title: string;
    thumbnail: string | null;
    price: number;
    rating: number;
    enroll_count: number;
};

type RecentOrder = {
    id: number;
    order_number: string;
    customer: string;
    email: string | null;
    total: number;
    status: string;
    created_at: string | null;
    paid_at: string | null;
};

type RecentUser = {
    id: number;
    name: string;
    email: string;
    avatar_url: string | null;
    role: string | null;
    created_at: string | null;
};

type Pending = {
    orders: number;
    ojt: number;
    reviews: number;
    public_reviews: number;
    gaps: number;
};

type PaymentStatus = {
    completed: number;
    pending: number;
    expired: number;
    failed: number;
};

type Props = {
    kpis: Kpis;
    revenueTrend: TrendDay[];
    enrollTrend: TrendDay[];
    topCourses: TopCourse[];
    recentOrders: RecentOrder[];
    recentUsers: RecentUser[];
    pending: Pending;
    paymentStatus: PaymentStatus;
};

const ROLE_LABELS: Record<string, string> = {
    superadmin: 'Super Admin',
    admin_tenant: 'Admin Tenant',
    hr: 'HR',
    instructor: 'Instruktur',
    supervisor: 'Supervisor',
    employee: 'Karyawan',
    user_public: 'Pengguna Publik',
};

const ORDER_TONES: Record<string, string> = {
    paid: 'bg-emerald-50 text-emerald-700',
    pending: 'bg-amber-50 text-amber-700',
    expired: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-slate-100 text-slate-600',
};

const ORDER_LABELS: Record<string, string> = {
    paid: 'Berhasil',
    pending: 'Menunggu',
    expired: 'Kedaluwarsa',
    cancelled: 'Dibatalkan',
};

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

function formatCompactRupiah(value: number): string {
    if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)} M`;
    if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)} Jt`;
    if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)} Rb`;
    return formatRupiah(value);
}

function timeAgo(iso: string | null): string {
    if (!iso) return '-';
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} hari lalu`;
    return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}

function initials(name: string): string {
    return name
        .split(' ')
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function thumbUrl(path: string | null): string | undefined {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    return `/storage/${path}`;
}

export default function AdminDashboard({
    kpis,
    revenueTrend,
    enrollTrend,
    topCourses,
    recentOrders,
    recentUsers,
    pending,
    paymentStatus,
}: Props) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <span className="font-semibold text-slate-900">Dashboard</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Overview
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Ringkasan performa platform secara real-time.
                    </p>
                </div>

                <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
                    <KpiCard
                        label="Pendapatan Bulan Ini"
                        value={formatCompactRupiah(kpis.revenue.this_month)}
                        delta={kpis.revenue.delta_pct}
                        icon={Wallet}
                        tint="bg-emerald-50"
                        text="text-emerald-600"
                    />
                    <KpiCard
                        label="Peserta Baru"
                        value={kpis.students.new_this_month.toLocaleString('id-ID')}
                        delta={kpis.students.delta_pct}
                        icon={Users}
                        tint="bg-brand-50"
                        text="text-brand-600"
                        sub={`Total ${kpis.students.total.toLocaleString('id-ID')}`}
                    />
                    <KpiCard
                        label="Enrollment Baru"
                        value={kpis.enrollments.this_month.toLocaleString('id-ID')}
                        delta={kpis.enrollments.delta_pct}
                        icon={GraduationCap}
                        tint="bg-brand-50"
                        text="text-brand-600"
                        sub={`${kpis.enrollments.completed_all_time.toLocaleString('id-ID')} selesai`}
                    />
                    <KpiCard
                        label="Course Aktif"
                        value={kpis.courses.published.toLocaleString('id-ID')}
                        icon={BookOpen}
                        tint="bg-amber-50"
                        text="text-amber-600"
                        sub={`Total ${kpis.courses.total.toLocaleString('id-ID')}`}
                    />
                    <KpiCard
                        label="Sertifikat Bulan Ini"
                        value={kpis.certificates.this_month.toLocaleString('id-ID')}
                        delta={kpis.certificates.delta_pct}
                        icon={Award}
                        tint="bg-sky-50"
                        text="text-sky-600"
                    />
                </section>

                {(pending.orders > 0 ||
                    pending.ojt > 0 ||
                    pending.reviews > 0 ||
                    pending.public_reviews > 0 ||
                    pending.gaps > 0) && (
                    <section className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <h2 className="mb-3 inline-flex items-center gap-2 text-[14px] font-bold text-slate-900">
                            <AlertCircle className="size-4 text-amber-500" />
                            Butuh Perhatian
                        </h2>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                            {pending.orders > 0 && (
                                <ActionPill
                                    label="Order Pending"
                                    count={pending.orders}
                                    href="/admin/orders?status=pending"
                                    icon={Receipt}
                                    tone="amber"
                                />
                            )}
                            {pending.ojt > 0 && (
                                <ActionPill
                                    label="OJT Pending"
                                    count={pending.ojt}
                                    href="/admin/ojt-assessments?status=pending_review"
                                    icon={ClipboardCheck}
                                    tone="brand"
                                />
                            )}
                            {pending.reviews > 0 && (
                                <ActionPill
                                    label="Review Supervisor"
                                    count={pending.reviews}
                                    href="/admin/supervisor-reviews?status=pending_review"
                                    icon={MessageSquare}
                                    tone="sky"
                                />
                            )}
                            {pending.public_reviews > 0 && (
                                <ActionPill
                                    label="Moderasi Review"
                                    count={pending.public_reviews}
                                    href="/admin/reviews?visibility=hidden"
                                    icon={Star}
                                    tone="violet"
                                />
                            )}
                            {pending.gaps > 0 && (
                                <ActionPill
                                    label="Skill Gap"
                                    count={pending.gaps}
                                    href="/admin/skill-gaps?status=gap"
                                    icon={TrendingDown}
                                    tone="rose"
                                />
                            )}
                        </div>
                    </section>
                )}

                <section className="grid gap-5 lg:grid-cols-3">
                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 lg:col-span-2">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-[15px] font-bold text-slate-900">
                                    Tren Pendapatan
                                </h2>
                                <p className="mt-0.5 text-[12px] text-slate-500">14 hari terakhir</p>
                            </div>
                            <Button asChild variant="outline" size="sm" className="rounded-xl">
                                <Link href="/admin/reports/sales">
                                    Detail
                                    <IconChevR size={12} className="ml-1" />
                                </Link>
                            </Button>
                        </div>
                        <RevenueTrendChart data={revenueTrend} />
                    </div>

                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <div className="mb-4">
                            <h2 className="text-[15px] font-bold text-slate-900">Status Pembayaran</h2>
                            <p className="mt-0.5 text-[12px] text-slate-500">All-time</p>
                        </div>
                        <PaymentStatusBars data={paymentStatus} />
                    </div>
                </section>

                <section className="grid gap-5 lg:grid-cols-3">
                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 lg:col-span-2">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-[15px] font-bold text-slate-900">Order Terbaru</h2>
                                <p className="mt-0.5 text-[12px] text-slate-500">
                                    6 transaksi terakhir
                                </p>
                            </div>
                            <Button asChild variant="outline" size="sm" className="rounded-xl">
                                <Link href="/admin/orders">
                                    Lihat semua
                                    <IconChevR size={12} className="ml-1" />
                                </Link>
                            </Button>
                        </div>
                        {recentOrders.length === 0 ? (
                            <div className="py-12 text-center">
                                <Receipt className="mx-auto mb-3 size-6 text-slate-400" />
                                <p className="text-sm font-semibold text-slate-900">
                                    Belum ada transaksi
                                </p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {recentOrders.map((o) => (
                                    <li
                                        key={o.id}
                                        className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                                    >
                                        <div className="min-w-0">
                                            <Link
                                                href={`/admin/orders/${o.order_number}`}
                                                className="font-mono text-[12px] font-semibold text-brand-700 hover:underline"
                                            >
                                                {o.order_number}
                                            </Link>
                                            <div className="text-[12.5px] font-semibold text-slate-900">
                                                {o.customer}
                                            </div>
                                            <div className="text-[10.5px] text-slate-500">
                                                {timeAgo(o.paid_at ?? o.created_at)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[13px] font-extrabold text-slate-900 tabular-nums">
                                                {formatRupiah(o.total)}
                                            </div>
                                            <Badge
                                                className={cn(
                                                    'mt-1 border-transparent text-[10px] font-bold',
                                                    ORDER_TONES[o.status] ?? '',
                                                )}
                                            >
                                                {ORDER_LABELS[o.status] ?? o.status}
                                            </Badge>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-[15px] font-bold text-slate-900">User Baru</h2>
                                <p className="mt-0.5 text-[12px] text-slate-500">6 terakhir</p>
                            </div>
                            <Button asChild variant="outline" size="sm" className="rounded-xl">
                                <Link href="/admin/users">
                                    Detail
                                    <IconChevR size={12} className="ml-1" />
                                </Link>
                            </Button>
                        </div>
                        {recentUsers.length === 0 ? (
                            <div className="py-10 text-center">
                                <Users className="mx-auto mb-3 size-6 text-slate-400" />
                                <p className="text-sm font-semibold text-slate-900">
                                    Belum ada user
                                </p>
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {recentUsers.map((u) => (
                                    <li key={u.id} className="flex items-center gap-3">
                                        <Avatar className="size-9 ring-1 ring-slate-200">
                                            {u.avatar_url && (
                                                <AvatarImage src={u.avatar_url} alt={u.name} />
                                            )}
                                            <AvatarFallback className="bg-gradient-to-br from-brand-300 to-brand-600 text-[11px] font-bold text-white">
                                                {initials(u.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-[12.5px] font-semibold text-slate-900">
                                                {u.name}
                                            </div>
                                            <div className="truncate text-[10.5px] text-slate-500">
                                                {u.email}
                                            </div>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            {u.role && (
                                                <Badge className="border-transparent bg-slate-100 px-1.5 py-0 text-[10px] text-slate-600">
                                                    {ROLE_LABELS[u.role] ?? u.role}
                                                </Badge>
                                            )}
                                            <div className="mt-0.5 text-[10px] text-slate-400">
                                                {timeAgo(u.created_at)}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>

                <section className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-[15px] font-bold text-slate-900">
                                Course Terpopuler
                            </h2>
                            <p className="mt-0.5 text-[12px] text-slate-500">
                                Berdasarkan total enrollment
                            </p>
                        </div>
                        <Button asChild variant="outline" size="sm" className="rounded-xl">
                            <Link href="/admin/courses">
                                Kelola
                                <IconChevR size={12} className="ml-1" />
                            </Link>
                        </Button>
                    </div>
                    {topCourses.length === 0 ? (
                        <div className="py-12 text-center">
                            <BookOpen className="mx-auto mb-3 size-6 text-slate-400" />
                            <p className="text-sm font-semibold text-slate-900">Belum ada course</p>
                            <Button asChild className="mt-3 rounded-xl bg-brand-600 hover:bg-brand-700">
                                <Link href="/admin/courses/create">Tambah Course</Link>
                            </Button>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {topCourses.map((c, idx) => (
                                <li
                                    key={c.id}
                                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                                >
                                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-700">
                                        {idx + 1}
                                    </span>
                                    <div
                                        className={cn(
                                            'h-12 w-16 shrink-0 overflow-hidden rounded-lg',
                                            !c.thumbnail && 'bg-gradient-to-br from-brand-400 to-brand-500',
                                        )}
                                        style={
                                            c.thumbnail
                                                ? {
                                                      backgroundImage: `url(${thumbUrl(c.thumbnail)})`,
                                                      backgroundSize: 'cover',
                                                      backgroundPosition: 'center',
                                                  }
                                                : undefined
                                        }
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-[13px] font-semibold text-slate-900">
                                            {c.title}
                                        </div>
                                        <div className="mt-0.5 inline-flex items-center gap-2 text-[11px] text-slate-500">
                                            <span className="inline-flex items-center gap-0.5">
                                                <Star className="size-3 fill-amber-400 text-amber-400" />
                                                <b>{c.rating.toFixed(1)}</b>
                                            </span>
                                            <span>·</span>
                                            <span>{c.enroll_count.toLocaleString('id-ID')} peserta</span>
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <div className="text-[13px] font-extrabold text-brand-600 tabular-nums">
                                            {c.price > 0 ? formatRupiah(c.price) : 'Gratis'}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="grid gap-5 lg:grid-cols-2">
                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-[15px] font-bold text-slate-900">
                                    Tren Enrollment
                                </h2>
                                <p className="mt-0.5 text-[12px] text-slate-500">14 hari terakhir</p>
                            </div>
                            <Button asChild variant="outline" size="sm" className="rounded-xl">
                                <Link href="/admin/reports/course-progress">
                                    Detail
                                    <IconChevR size={12} className="ml-1" />
                                </Link>
                            </Button>
                        </div>
                        <EnrollTrendChart data={enrollTrend} />
                    </div>

                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <h2 className="mb-4 text-[15px] font-bold text-slate-900">Akses Cepat</h2>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            <QuickLink href="/admin/courses/create" icon={BookOpen} label="Tambah Course" />
                            <QuickLink href="/admin/users/create" icon={Users} label="Tambah User" />
                            <QuickLink href="/admin/orders" icon={Receipt} label="Order" />
                            <QuickLink href="/admin/payments" icon={CreditCard} label="Payment" />
                            <QuickLink href="/admin/skill-matrix" icon={ClipboardCheck} label="Skill Matrix" />
                            <QuickLink href="/admin/settings" icon={Award} label="Settings" />
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

function KpiCard({
    label,
    value,
    delta,
    icon: Icon,
    tint,
    text,
    sub,
}: {
    label: string;
    value: string;
    delta?: number;
    icon: typeof Wallet;
    tint: string;
    text: string;
    sub?: string;
}) {
    const isPositive = (delta ?? 0) >= 0;

    return (
        <div className="rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="flex items-start justify-between gap-2">
                <div className={cn('grid size-10 place-items-center rounded-xl', tint, text)}>
                    <Icon className="size-5" />
                </div>
                {delta !== undefined && (
                    <span
                        className={cn(
                            'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10.5px] font-bold tabular-nums',
                            isPositive
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700',
                        )}
                    >
                        {isPositive ? (
                            <ArrowUpRight className="size-3" />
                        ) : (
                            <ArrowDownRight className="size-3" />
                        )}
                        {isPositive ? '+' : ''}
                        {delta}%
                    </span>
                )}
            </div>
            <div className="mt-3 text-[11px] tracking-wider text-slate-500 uppercase">{label}</div>
            <div className="mt-0.5 text-[20px] font-extrabold tabular-nums text-slate-900">
                {value}
            </div>
            {sub && <div className="mt-1 text-[11px] text-slate-500">{sub}</div>}
        </div>
    );
}

function ActionPill({
    label,
    count,
    href,
    icon: Icon,
    tone,
}: {
    label: string;
    count: number;
    href: string;
    icon: typeof AlertCircle;
    tone: 'amber' | 'brand' | 'sky' | 'violet' | 'rose';
}) {
    const tones: Record<string, string> = {
        amber: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
        brand: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
        sky: 'bg-sky-50 text-sky-700 hover:bg-sky-100',
        violet: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
        rose: 'bg-rose-50 text-rose-700 hover:bg-rose-100',
    };

    return (
        <Link
            href={href}
            className={cn(
                'inline-flex items-center gap-2 rounded-xl px-3 py-2 transition-colors',
                tones[tone],
            )}
        >
            <Icon className="size-4 shrink-0" />
            <span className="flex-1 text-[12px] font-semibold">{label}</span>
            <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[11px] font-bold tabular-nums">
                {count}
            </span>
        </Link>
    );
}

function RevenueTrendChart({ data }: { data: TrendDay[] }) {
    if (data.length === 0) {
        return (
            <div className="py-12 text-center text-[12.5px] text-slate-500">
                Belum ada transaksi berhasil dalam 14 hari terakhir.
            </div>
        );
    }

    const max = Math.max(...data.map((d) => d.revenue ?? 0));

    return (
        <div className="space-y-2">
            <div className="flex h-[140px] items-end gap-1">
                {data.map((d) => {
                    const pct = max > 0 ? ((d.revenue ?? 0) / max) * 100 : 0;

                    return (
                        <div
                            key={d.day}
                            className="group flex flex-1 flex-col items-center justify-end"
                            title={`${d.day}: ${formatCompactRupiah(d.revenue ?? 0)} · ${d.orders ?? 0} order`}
                        >
                            <div
                                className="w-full rounded-t-md bg-gradient-to-t from-emerald-500 to-brand-500 transition-all group-hover:opacity-80"
                                style={{ height: `${Math.max(pct, 2)}%` }}
                            />
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10.5px] text-slate-500">
                <span>{data[0]?.day}</span>
                <span>{data[data.length - 1]?.day}</span>
            </div>
        </div>
    );
}

function EnrollTrendChart({ data }: { data: TrendDay[] }) {
    if (data.length === 0) {
        return (
            <div className="py-12 text-center text-[12.5px] text-slate-500">
                Belum ada enrollment dalam 14 hari terakhir.
            </div>
        );
    }

    const max = Math.max(...data.map((d) => d.c ?? 0));
    const total = data.reduce((sum, d) => sum + (d.c ?? 0), 0);

    return (
        <div className="space-y-3">
            <div className="text-[20px] font-extrabold tabular-nums text-slate-900">
                {total.toLocaleString('id-ID')}
                <span className="ml-2 text-[11px] font-normal text-slate-500">enrollment</span>
            </div>
            <div className="flex h-[100px] items-end gap-1">
                {data.map((d) => {
                    const pct = max > 0 ? ((d.c ?? 0) / max) * 100 : 0;

                    return (
                        <div
                            key={d.day}
                            className="group flex flex-1 flex-col items-center justify-end"
                            title={`${d.day}: ${d.c ?? 0} enrollment`}
                        >
                            <div
                                className="w-full rounded-t-md bg-brand-400 transition-all group-hover:opacity-80"
                                style={{ height: `${Math.max(pct, 2)}%` }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function PaymentStatusBars({ data }: { data: PaymentStatus }) {
    const total = data.completed + data.pending + data.expired + data.failed;

    if (total === 0) {
        return (
            <p className="py-10 text-center text-[12.5px] text-slate-500">
                Belum ada transaksi.
            </p>
        );
    }

    const rows: Array<{
        label: string;
        value: number;
        color: string;
    }> = [
        { label: 'Berhasil', value: data.completed, color: 'bg-emerald-500' },
        { label: 'Menunggu', value: data.pending, color: 'bg-amber-500' },
        { label: 'Kedaluwarsa', value: data.expired, color: 'bg-slate-400' },
        { label: 'Gagal', value: data.failed, color: 'bg-rose-500' },
    ];

    return (
        <div className="space-y-3">
            {rows.map((r) => {
                const pct = total > 0 ? Math.round((r.value / total) * 100) : 0;

                return (
                    <div key={r.label}>
                        <div className="mb-1 flex items-center justify-between text-[12px]">
                            <span className="font-semibold text-slate-700">{r.label}</span>
                            <span className="font-bold tabular-nums text-slate-900">
                                {r.value.toLocaleString('id-ID')}
                                <span className="ml-1 font-normal text-slate-400">({pct}%)</span>
                            </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div className={cn('h-full rounded-full', r.color)} style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function QuickLink({
    href,
    icon: Icon,
    label,
}: {
    href: string;
    icon: typeof BookOpen;
    label: string;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-2 rounded-xl bg-slate-50/60 p-3 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-100"
        >
            <Icon className="size-4 text-slate-500" />
            {label}
        </Link>
    );
}
