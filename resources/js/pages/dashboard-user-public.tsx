import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    BookOpen,
    CheckCircle2,
    Clock,
    PlayCircle,
    Receipt,
    Search,
    ShoppingBag,
    Wallet,
} from 'lucide-react';

import { StatusBadge } from '@/components/status/status-badge';
import { Button } from '@/components/ui/button';

type Stats = {
    total_courses: number;
    in_progress: number;
    completed: number;
    total_certificates: number;
    total_orders: number;
    total_spent: number;
};

type Enrollment = {
    id: number;
    status: string;
    progress_percent: number;
    enrolled_at: string | null;
    course: { id: number; title: string; slug: string; thumbnail: string | null } | null;
};

type OrderItem = {
    id: number;
    order_number: string;
    total: number;
    status: string;
    created_at: string | null;
};

type Props = {
    user: { name: string; email: string };
    stats: Stats;
    recentEnrollments: Enrollment[];
    recentOrders: OrderItem[];
};

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
    });
}

function formatRupiah(value: number): string {
    if (!value) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

export default function DashboardUserPublic({
    user,
    stats,
    recentEnrollments,
    recentOrders,
}: Props) {
    return (
        <>
            <Head title="Dashboard Saya" />
            <div className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                            Halo, {user.name.split(' ')[0]} 👋
                        </h1>
                        <p className="mt-1 text-[13.5px] text-slate-500">
                            Lanjutkan belajar atau temukan course baru di marketplace.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline" className="rounded-xl">
                            <Link href="/courses">
                                <Search className="mr-1.5 size-4" />
                                Cari Course
                            </Link>
                        </Button>
                        <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                            <Link href="/my-courses">
                                <PlayCircle className="mr-1.5 size-4" />
                                Lanjut Belajar
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* KPI grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={<BookOpen className="size-5" />}
                        label="Total Course"
                        value={stats.total_courses}
                        sub={`${stats.in_progress} sedang berjalan`}
                        tone="brand"
                    />
                    <StatCard
                        icon={<CheckCircle2 className="size-5" />}
                        label="Selesai"
                        value={stats.completed}
                        sub="Course lulus"
                        tone="emerald"
                    />
                    <StatCard
                        icon={<Award className="size-5" />}
                        label="Sertifikat"
                        value={stats.total_certificates}
                        sub="Terbit untuk Anda"
                        tone="amber"
                    />
                    <StatCard
                        icon={<Wallet className="size-5" />}
                        label="Total Belanja"
                        value={formatRupiah(stats.total_spent)}
                        sub={`${stats.total_orders} transaksi`}
                        tone="violet"
                    />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                    <Section
                        title="Lanjut Belajar"
                        subtitle="Course yang sedang Anda ikuti."
                        action={
                            <Link
                                href="/my-courses"
                                className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-600 hover:text-brand-700"
                            >
                                Lihat semua <ArrowRight className="size-3" />
                            </Link>
                        }
                        empty="Anda belum punya course. Jelajahi katalog!"
                        emptyIcon={<ShoppingBag className="size-5 text-brand-500" />}
                    >
                        {recentEnrollments.length > 0 && (
                            <div className="space-y-2.5">
                                {recentEnrollments.map((e) => (
                                    <Link
                                        key={e.id}
                                        href={`/learn/${e.course?.slug ?? ''}`}
                                        className="block rounded-xl bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-[13px] font-semibold text-slate-900">
                                                    {e.course?.title ?? '—'}
                                                </div>
                                                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                                                    <Clock className="size-3" />
                                                    {formatDate(e.enrolled_at)}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[12px] font-bold text-slate-700 tabular-nums">
                                                    {e.progress_percent}%
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                                            <div
                                                className={
                                                    'h-full ' +
                                                    (e.progress_percent >= 100
                                                        ? 'bg-emerald-500'
                                                        : e.progress_percent >= 50
                                                            ? 'bg-brand-500'
                                                            : 'bg-amber-400')
                                                }
                                                style={{
                                                    width: `${Math.min(100, e.progress_percent)}%`,
                                                }}
                                            />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </Section>

                    <Section
                        title="Riwayat Pesanan"
                        subtitle="Transaksi pembelian course terbaru."
                        action={
                            <Link
                                href="/orders"
                                className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-600 hover:text-brand-700"
                            >
                                Lihat semua <ArrowRight className="size-3" />
                            </Link>
                        }
                        empty="Belum ada pesanan. Mulai belanja di katalog!"
                        emptyIcon={<Receipt className="size-5 text-slate-400" />}
                    >
                        {recentOrders.length > 0 && (
                            <div className="space-y-2.5">
                                {recentOrders.map((o) => (
                                    <Link
                                        key={o.id}
                                        href={`/orders/${o.id}`}
                                        className="block rounded-xl bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-[13px] font-semibold text-slate-900">
                                                    {o.order_number}
                                                </div>
                                                <div className="text-[11px] text-slate-500">
                                                    {formatDate(o.created_at)}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-[13px] font-bold text-slate-900 tabular-nums">
                                                    {formatRupiah(o.total)}
                                                </span>
                                                <StatusBadge status={o.status} />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </Section>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white">
                    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-[16px] font-extrabold">
                                Temukan Course Baru
                            </h3>
                            <p className="mt-1 text-[13px] text-white/85">
                                Ribuan course berkualitas dari instruktur terverifikasi.
                            </p>
                        </div>
                        <Button
                            asChild
                            className="rounded-xl bg-white text-brand-700 hover:bg-brand-50"
                        >
                            <Link href="/courses">
                                <Search className="mr-1.5 size-4" />
                                Jelajahi Katalog
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

function StatCard({
    icon,
    label,
    value,
    sub,
    tone,
}: {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    sub: string;
    tone: 'brand' | 'emerald' | 'amber' | 'violet';
}) {
    const toneClass = {
        brand: 'bg-brand-100 text-brand-700',
        emerald: 'bg-emerald-100 text-emerald-700',
        amber: 'bg-amber-100 text-amber-700',
        violet: 'bg-brand-100 text-brand-700',
    }[tone];

    return (
        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className={`inline-flex size-10 items-center justify-center rounded-xl ${toneClass}`}>
                {icon}
            </div>
            <div className="mt-3 text-[12px] font-medium text-slate-500">{label}</div>
            <div className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                {value}
            </div>
            <div className="mt-1 text-[11.5px] text-slate-500">{sub}</div>
        </div>
    );
}

function Section({
    title,
    subtitle,
    action,
    children,
    empty,
    emptyIcon,
}: {
    title: string;
    subtitle: string;
    action?: React.ReactNode;
    children?: React.ReactNode;
    empty: string;
    emptyIcon: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="mb-3 flex items-start justify-between">
                <div>
                    <h2 className="text-[14px] font-bold text-slate-900">{title}</h2>
                    <p className="mt-0.5 text-[12px] text-slate-500">{subtitle}</p>
                </div>
                {action}
            </div>
            {children ? (
                children
            ) : (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-slate-50 py-8 text-center">
                    <div className="grid size-10 place-items-center rounded-full bg-white shadow-sm">
                        {emptyIcon}
                    </div>
                    <p className="text-[12.5px] text-slate-500">{empty}</p>
                </div>
            )}
        </div>
    );
}
