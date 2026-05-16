import { Head, Link, router } from '@inertiajs/react';
import {
    BookOpen,
    CheckCircle2,
    Clock,
    GraduationCap,
    Play,
    Trophy,
} from 'lucide-react';

import {
    DataTablePagination
    
} from '@/components/data-table/data-table-pagination';
import type {Paginator} from '@/components/data-table/data-table-pagination';
import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type Enrollment = {
    id: number;
    status: string;
    progress_percent: number;
    pre_test_status: string;
    post_test_status: string;
    certificate_status: string;
    enrolled_at: string | null;
    completed_at: string | null;
    course: {
        id: number;
        title: string;
        subtitle: string | null;
        slug: string;
        thumbnail: string | null;
        duration_minutes: number;
        total_students: number;
        category: { id: number; name: string } | null;
        instructor: { id: number; name: string } | null;
    } | null;
};

type Props = {
    enrollments: Paginator<Enrollment>;
    filters: {
        status?: string;
    };
    stats: {
        total: number;
        in_progress: number;
        completed: number;
        not_started: number;
    };
};

function formatDuration(minutes: number): string {
    if (!minutes) {
return '-';
}

    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    if (h === 0) {
return `${m} mnt`;
}

    return `${h}j ${m}m`;
}

export default function MyCoursesIndex({ enrollments, filters, stats }: Props) {
    const handleFilter = (status?: string) => {
        router.get(
            '/my-courses',
            { status: status === 'all' ? undefined : status },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Kelas Saya" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Kelas Saya</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Kelas Saya
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Lanjutkan belajar dari course yang sudah Anda enroll.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard
                        label="Total"
                        value={stats.total}
                        icon={BookOpen}
                        tint="bg-brand-50"
                        text="text-brand-600"
                    />
                    <StatCard
                        label="Sedang Berjalan"
                        value={stats.in_progress}
                        icon={Play}
                        tint="bg-amber-50"
                        text="text-amber-600"
                    />
                    <StatCard
                        label="Selesai"
                        value={stats.completed}
                        icon={Trophy}
                        tint="bg-emerald-50"
                        text="text-emerald-600"
                    />
                    <StatCard
                        label="Belum Mulai"
                        value={stats.not_started}
                        icon={Clock}
                        tint="bg-slate-100"
                        text="text-slate-600"
                    />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Select
                        value={filters.status ?? 'all'}
                        onValueChange={handleFilter}
                    >
                        <SelectTrigger className="h-9 w-[180px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="active">Aktif</SelectItem>
                            <SelectItem value="completed">Selesai</SelectItem>
                            <SelectItem value="expired">Kedaluwarsa</SelectItem>
                        </SelectContent>
                    </Select>

                    <p className="text-[12.5px] text-slate-500">
                        {enrollments.total} kelas
                    </p>
                </div>

                {enrollments.data.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {enrollments.data.map((e) => (
                            <CourseCard key={e.id} enrollment={e} />
                        ))}
                    </div>
                )}

                <DataTablePagination paginator={enrollments} />
            </div>
        </>
    );
}

function CourseCard({ enrollment }: { enrollment: Enrollment }) {
    if (!enrollment.course) {
return null;
}

    const c = enrollment.course;
    const progress = enrollment.progress_percent;
    const isCompleted = enrollment.status === 'completed' || progress >= 100;
    const hasCertificate = enrollment.certificate_status === 'issued';

    return (
        <div className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:ring-slate-300">
            <Link
                href={`/learn/${c.slug}`}
                className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-brand-500 to-brand-700"
            >
                {c.thumbnail ? (
                    <img
                        src={c.thumbnail}
                        alt={c.title}
                        className="size-full object-cover"
                    />
                ) : (
                    <div className="grid size-full place-items-center text-white/40">
                        <BookOpen className="size-12" />
                    </div>
                )}
                {isCompleted && (
                    <Badge className="absolute top-3 right-3 border-transparent bg-emerald-500 text-white">
                        <CheckCircle2 className="mr-1 size-3" />
                        Selesai
                    </Badge>
                )}
                <div className="absolute inset-x-0 bottom-0 flex h-1.5 bg-black/20">
                    <div
                        className="h-full bg-gradient-to-r from-brand-400 to-brand-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </Link>

            <div className="flex flex-1 flex-col gap-2 p-4">
                {c.category && (
                    <span className="text-[11px] font-semibold text-brand-600">
                        {c.category.name}
                    </span>
                )}
                <Link href={`/learn/${c.slug}`}>
                    <h3 className="line-clamp-2 text-[14.5px] leading-snug font-bold text-slate-900 transition group-hover:text-brand-700">
                        {c.title}
                    </h3>
                </Link>
                {c.instructor && (
                    <div className="flex items-center gap-1.5 text-[11.5px] text-slate-500">
                        <GraduationCap className="size-3.5 text-slate-400" />
                        <span className="truncate">{c.instructor.name}</span>
                    </div>
                )}

                <div className="mt-auto space-y-3 pt-2">
                    <div className="flex items-center justify-between text-[12px]">
                        <span className="font-semibold text-slate-700">
                            Progress {progress}%
                        </span>
                        <span className="inline-flex items-center gap-1 text-slate-500">
                            <Clock className="size-3.5" />
                            {formatDuration(c.duration_minutes)}
                        </span>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            asChild
                            size="sm"
                            className={cn(
                                'flex-1 rounded-xl',
                                isCompleted
                                    ? 'bg-emerald-600 hover:bg-emerald-700'
                                    : 'bg-brand-600 hover:bg-brand-700',
                            )}
                        >
                            <Link href={`/learn/${c.slug}`}>
                                <Play className="mr-1.5 size-4" />
                                {progress === 0
                                    ? 'Mulai Belajar'
                                    : isCompleted
                                      ? 'Ulang'
                                      : 'Lanjutkan'}
                            </Link>
                        </Button>
                        {hasCertificate && (
                            <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="rounded-xl"
                            >
                                <Link href="/my-certificates">
                                    <Trophy className="size-4" />
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    icon: Icon,
    tint,
    text,
}: {
    label: string;
    value: number;
    icon: typeof BookOpen;
    tint: string;
    text: string;
}) {
    return (
        <div className="rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="flex items-center gap-3">
                <div className={`grid size-10 place-items-center rounded-xl ${tint} ${text}`}>
                    <Icon className="size-5" />
                </div>
                <div>
                    <div className="text-[11px] tracking-wider text-slate-500 uppercase">
                        {label}
                    </div>
                    <div className="text-[20px] font-extrabold text-slate-900 tabular-nums">
                        {value.toLocaleString('id-ID')}
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="rounded-2xl bg-card p-12 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <BookOpen className="size-5" />
            </div>
            <p className="text-sm font-semibold text-slate-900">
                Belum ada kelas
            </p>
            <p className="mt-1 text-sm text-slate-500">
                Jelajahi katalog kursus untuk mulai belajar.
            </p>
            <Button asChild className="mt-4 rounded-xl bg-brand-600 hover:bg-brand-700">
                <Link href="/courses">Jelajahi Katalog</Link>
            </Button>
        </div>
    );
}
