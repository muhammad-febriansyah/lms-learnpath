import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    BookCopy,
    CheckCircle2,
    Clock,
    PenSquare,
    Plus,
    Star,
    Users,
    XCircle,
} from 'lucide-react';

import { StatusBadge } from '@/components/status/status-badge';
import { Button } from '@/components/ui/button';

type Stats = {
    total_courses: number;
    draft: number;
    pending: number;
    published: number;
    rejected: number;
    total_students: number;
    new_students_week: number;
    total_reviews: number;
    avg_rating: number;
};

type CourseSummary = {
    id: number;
    title: string;
    slug?: string;
    review_status?: string;
    updated_at?: string;
    submitted_at?: string;
    enrollments_count?: number;
};

type Props = {
    mentor: { name: string; email: string; avatar: string | null };
    stats: Stats;
    recentCourses: CourseSummary[];
    pendingReviewCourses: CourseSummary[];
};

function formatDateRel(iso?: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DashboardMentor({
    mentor,
    stats,
    recentCourses,
    pendingReviewCourses,
}: Props) {
    return (
        <>
            <Head title="Dashboard Mentor" />
            <div className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                            Halo, {mentor.name.split(' ')[0]} 👋
                        </h1>
                        <p className="mt-1 text-[13.5px] text-slate-500">
                            Ringkasan course, peserta, dan aktivitas mentor Anda.
                        </p>
                    </div>
                    <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                        <Link href="/admin/courses/create">
                            <Plus className="mr-1.5 size-4" />
                            Buat Course Baru
                        </Link>
                    </Button>
                </div>

                {/* KPI grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={<BookCopy className="size-5" />}
                        label="Total Course"
                        value={stats.total_courses}
                        sub={`${stats.published} terbit · ${stats.draft} draft`}
                        tone="brand"
                    />
                    <StatCard
                        icon={<Users className="size-5" />}
                        label="Peserta Saya"
                        value={stats.total_students}
                        sub={`+${stats.new_students_week} minggu ini`}
                        tone="emerald"
                    />
                    <StatCard
                        icon={<Star className="size-5" />}
                        label="Rating Rata-rata"
                        value={stats.avg_rating || '0.0'}
                        sub={`${stats.total_reviews} ulasan`}
                        tone="amber"
                    />
                    <StatCard
                        icon={<Clock className="size-5" />}
                        label="Menunggu Review"
                        value={stats.pending}
                        sub={stats.rejected > 0 ? `${stats.rejected} perlu revisi` : 'Semua aman'}
                        tone={stats.pending > 0 ? 'sky' : 'slate'}
                    />
                </div>

                {/* Status breakdown */}
                <div className="grid gap-4 lg:grid-cols-4">
                    <StatusTile
                        icon={<PenSquare className="size-4" />}
                        label="Draft"
                        value={stats.draft}
                        bg="bg-slate-100"
                        text="text-slate-700"
                    />
                    <StatusTile
                        icon={<Clock className="size-4" />}
                        label="Menunggu Review"
                        value={stats.pending}
                        bg="bg-amber-100"
                        text="text-amber-700"
                    />
                    <StatusTile
                        icon={<CheckCircle2 className="size-4" />}
                        label="Terbit"
                        value={stats.published}
                        bg="bg-emerald-100"
                        text="text-emerald-700"
                    />
                    <StatusTile
                        icon={<XCircle className="size-4" />}
                        label="Ditolak"
                        value={stats.rejected}
                        bg="bg-rose-100"
                        text="text-rose-700"
                    />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                    {/* Pending review section */}
                    <Section
                        title="Menunggu Review"
                        subtitle="Course yang sedang ditinjau Super Admin."
                        empty="Tidak ada course yang menunggu review."
                        emptyIcon={<CheckCircle2 className="size-5 text-emerald-500" />}
                        items={pendingReviewCourses}
                        renderItem={(c) => (
                            <Link
                                key={c.id}
                                href={`/admin/courses/${c.id}`}
                                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
                            >
                                <div className="min-w-0 flex-1 pr-3">
                                    <div className="truncate text-[13.5px] font-semibold text-slate-900">
                                        {c.title}
                                    </div>
                                    <div className="text-[11.5px] text-slate-500">
                                        Diajukan {formatDateRel(c.submitted_at)}
                                    </div>
                                </div>
                                <StatusBadge status="pending_review" />
                            </Link>
                        )}
                    />

                    {/* Recent courses */}
                    <Section
                        title="Course Terakhir Diubah"
                        subtitle="Course yang baru saja Anda perbarui."
                        empty="Belum ada course. Mulai buat satu sekarang."
                        emptyIcon={<BookCopy className="size-5 text-slate-400" />}
                        items={recentCourses}
                        action={
                            <Link
                                href="/admin/courses"
                                className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-600 hover:text-brand-700"
                            >
                                Lihat semua <ArrowRight className="size-3" />
                            </Link>
                        }
                        renderItem={(c) => (
                            <Link
                                key={c.id}
                                href={`/admin/courses/${c.id}`}
                                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
                            >
                                <div className="min-w-0 flex-1 pr-3">
                                    <div className="truncate text-[13.5px] font-semibold text-slate-900">
                                        {c.title}
                                    </div>
                                    <div className="text-[11.5px] text-slate-500">
                                        Diubah {formatDateRel(c.updated_at)}
                                    </div>
                                </div>
                                <StatusBadge status={c.review_status ?? 'draft'} />
                            </Link>
                        )}
                    />
                </div>

                {stats.rejected > 0 && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="mt-0.5 size-5 shrink-0 text-rose-500" />
                            <div>
                                <p className="text-[13.5px] font-semibold text-rose-800">
                                    Ada {stats.rejected} course yang perlu revisi
                                </p>
                                <p className="mt-0.5 text-[12.5px] text-rose-700">
                                    Buka course tersebut, baca catatan dari Super Admin, lalu
                                    edit dan ajukan ulang.
                                </p>
                                <Link
                                    href="/admin/courses?review_status=rejected"
                                    className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-rose-700 underline hover:text-rose-900"
                                >
                                    Lihat course yang ditolak{' '}
                                    <ArrowRight className="size-3" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
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
    tone: 'brand' | 'emerald' | 'amber' | 'sky' | 'slate';
}) {
    const toneClasses = {
        brand: 'bg-brand-100 text-brand-700',
        emerald: 'bg-emerald-100 text-emerald-700',
        amber: 'bg-amber-100 text-amber-700',
        sky: 'bg-sky-100 text-sky-700',
        slate: 'bg-slate-100 text-slate-700',
    }[tone];

    return (
        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className={`inline-flex size-10 items-center justify-center rounded-xl ${toneClasses}`}>
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

function StatusTile({
    icon,
    label,
    value,
    bg,
    text,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    bg: string;
    text: string;
}) {
    return (
        <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className={`grid size-9 place-items-center rounded-xl ${bg} ${text}`}>
                {icon}
            </div>
            <div>
                <div className="text-[11.5px] font-medium text-slate-500">{label}</div>
                <div className="text-xl font-extrabold text-slate-900 tabular-nums">
                    {value}
                </div>
            </div>
        </div>
    );
}

function Section({
    title,
    subtitle,
    items,
    renderItem,
    empty,
    emptyIcon,
    action,
}: {
    title: string;
    subtitle: string;
    items: CourseSummary[];
    renderItem: (c: CourseSummary) => React.ReactNode;
    empty: string;
    emptyIcon: React.ReactNode;
    action?: React.ReactNode;
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
            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-slate-50 py-8 text-center">
                    <div className="grid size-10 place-items-center rounded-full bg-white shadow-sm">
                        {emptyIcon}
                    </div>
                    <p className="text-[12.5px] text-slate-500">{empty}</p>
                </div>
            ) : (
                <div className="space-y-2">{items.map(renderItem)}</div>
            )}
        </div>
    );
}
