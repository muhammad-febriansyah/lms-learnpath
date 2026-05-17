import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, GraduationCap, Search, Users } from 'lucide-react';

import { IconChevR } from '@/components/learnpath-icons';
import { StatusBadge } from '@/components/status/status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Enrollment = {
    id: number;
    status: string;
    progress_percent: number;
    enrolled_at: string | null;
    completed_at: string | null;
    user: {
        id: number;
        name: string;
        email: string;
        avatar: string | null;
    } | null;
    course: { id: number; title: string; slug: string } | null;
};

type CourseOption = { id: number; title: string };
type Paginator<T> = {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    enrollments: Paginator<Enrollment>;
    courseOptions: CourseOption[];
    filters: { search?: string; course_id?: string };
    stats: {
        total_enrollments: number;
        total_courses: number;
        active_this_week: number;
    };
};

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function initials(name: string): string {
    return name
        .split(' ')
        .map((s) => s[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

export default function MyStudentsIndex({
    enrollments,
    courseOptions,
    filters,
    stats,
}: Props) {
    const handleFilter = (next: Record<string, string | undefined>) => {
        router.get('/admin/my-students', { ...filters, ...next }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title="Peserta Saya" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Peserta Saya</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Peserta Saya
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Daftar peserta yang terdaftar di course Anda.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <StatBox
                        icon={<Users className="size-5" />}
                        label="Total Peserta"
                        value={stats.total_enrollments}
                    />
                    <StatBox
                        icon={<BookOpen className="size-5" />}
                        label="Course Aktif"
                        value={stats.total_courses}
                    />
                    <StatBox
                        icon={<GraduationCap className="size-5" />}
                        label="Aktif Minggu Ini"
                        value={stats.active_this_week}
                    />
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-[15px] font-bold text-slate-900">
                            Daftar Peserta
                        </h2>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <div className="relative">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    placeholder="Cari nama atau email..."
                                    value={filters.search ?? ''}
                                    onChange={(e) =>
                                        handleFilter({ search: e.target.value || undefined })
                                    }
                                    className="pl-9 sm:w-[260px]"
                                />
                            </div>
                            <Select
                                value={filters.course_id ?? 'all'}
                                onValueChange={(v) =>
                                    handleFilter({ course_id: v === 'all' ? undefined : v })
                                }
                            >
                                <SelectTrigger className="h-9 sm:w-[200px]">
                                    <SelectValue placeholder="Course" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Course</SelectItem>
                                    {courseOptions.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {enrollments.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                            <div className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                                <Users className="size-5" />
                            </div>
                            <div>
                                <p className="text-[14px] font-semibold text-slate-900">
                                    Belum ada peserta
                                </p>
                                <p className="mt-1 text-[12.5px] text-slate-500">
                                    Peserta akan muncul di sini setelah mendaftar di course Anda.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-[13px]">
                                <thead className="border-b border-slate-200 text-[11.5px] font-semibold tracking-wide text-slate-500 uppercase">
                                    <tr>
                                        <th className="py-2.5 pr-3">Peserta</th>
                                        <th className="py-2.5 pr-3">Course</th>
                                        <th className="py-2.5 pr-3">Progress</th>
                                        <th className="py-2.5 pr-3">Status</th>
                                        <th className="py-2.5 pr-3">Daftar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {enrollments.data.map((e) => (
                                        <tr key={e.id} className="hover:bg-slate-50/60">
                                            <td className="py-3 pr-3">
                                                <div className="flex items-center gap-2.5">
                                                    <Avatar className="size-8">
                                                        {e.user?.avatar && (
                                                            <AvatarImage
                                                                src={e.user.avatar}
                                                                alt={e.user.name}
                                                            />
                                                        )}
                                                        <AvatarFallback className="bg-brand-100 text-[11px] font-semibold text-brand-700">
                                                            {e.user ? initials(e.user.name) : '?'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <div className="truncate font-semibold text-slate-900">
                                                            {e.user?.name ?? '—'}
                                                        </div>
                                                        <div className="truncate text-[11.5px] text-slate-500">
                                                            {e.user?.email ?? ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 pr-3 text-slate-700">
                                                {e.course?.title ?? '—'}
                                            </td>
                                            <td className="py-3 pr-3 w-[180px]">
                                                <ProgressBar percent={e.progress_percent} />
                                            </td>
                                            <td className="py-3 pr-3">
                                                <StatusBadge status={e.status} />
                                            </td>
                                            <td className="py-3 pr-3 text-slate-600 tabular-nums">
                                                {formatDate(e.enrolled_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {enrollments.data.length > 0 && (
                        <div className="mt-4 flex items-center justify-between text-[12px] text-slate-500">
                            <span>
                                Menampilkan {enrollments.data.length} dari {enrollments.total} peserta
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function StatBox({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
}) {
    return (
        <div className="flex items-center gap-3 rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="grid size-10 place-items-center rounded-xl bg-brand-100 text-brand-700">
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

function ProgressBar({ percent }: { percent: number }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-700 tabular-nums">{percent}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                    className={
                        'h-full rounded-full transition-all ' +
                        (percent >= 100
                            ? 'bg-emerald-500'
                            : percent >= 50
                                ? 'bg-brand-500'
                                : 'bg-amber-400')
                    }
                    style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                />
            </div>
        </div>
    );
}
