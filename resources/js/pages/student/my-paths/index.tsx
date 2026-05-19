import { Head, Link } from '@inertiajs/react';
import {
    Award,
    BookOpen,
    Calendar,
    CheckCircle2,
    Compass,
    PlayCircle,
    Sparkles,
    Target,
} from 'lucide-react';

import {
    DataTablePagination,
    type Paginator,
} from '@/components/data-table/data-table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { storageUrl } from '@/lib/storage-url';
import { cn } from '@/lib/utils';

type Enrollment = {
    id: number;
    status: string;
    progress_percent: number;
    courses_completed: number;
    enrolled_at: string | null;
    started_at: string | null;
    completed_at: string | null;
    learning_path: {
        id: number;
        title: string;
        slug: string;
        subtitle: string | null;
        thumbnail: string | null;
        level: string | null;
        duration_weeks: number | null;
        total_courses: number;
        position: { id: number; name: string } | null;
    };
};

type Stats = {
    total: number;
    in_progress: number;
    completed: number;
    not_started: number;
};

type Props = {
    enrollments: Paginator<Enrollment>;
    stats: Stats;
};

export default function MyPathsIndex({ enrollments, stats }: Props) {
    return (
        <>
            <Head title="Path Saya" />
            <div className="space-y-5">
                <div>
                    <h1 className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
                        <Compass className="size-6 text-brand-600" />
                        Learning Path Saya
                    </h1>
                    <p className="mt-1 text-[13px] text-slate-600">
                        Pantau roadmap karir Anda dan lanjutkan progress dari path yang sudah
                        di-enroll.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <StatCard label="Total Path" value={stats.total} icon={Compass} tone="indigo" />
                    <StatCard
                        label="Sedang Berjalan"
                        value={stats.in_progress}
                        icon={PlayCircle}
                        tone="brand"
                    />
                    <StatCard
                        label="Selesai"
                        value={stats.completed}
                        icon={Award}
                        tone="emerald"
                    />
                    <StatCard
                        label="Belum Dimulai"
                        value={stats.not_started}
                        icon={BookOpen}
                        tone="slate"
                    />
                </div>

                {enrollments.data.length === 0 ? (
                    <div className="rounded-2xl bg-card p-12 text-center ring-1 ring-slate-200/70">
                        <Compass className="mx-auto mb-3 size-8 text-slate-400" />
                        <p className="text-sm font-semibold text-slate-900">
                            Belum ada path yang Anda ikuti
                        </p>
                        <p className="mt-1 text-[12.5px] text-slate-500">
                            Pilih roadmap karir di katalog untuk mulai belajar.
                        </p>
                        <Button
                            asChild
                            className="mt-4 rounded-xl bg-brand-600 hover:bg-brand-700"
                        >
                            <Link href="/paths">Lihat Katalog Path</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {enrollments.data.map((e) => (
                            <PathEnrollmentCard key={e.id} enrollment={e} />
                        ))}
                    </div>
                )}

                <DataTablePagination paginator={enrollments} />
            </div>
        </>
    );
}

function PathEnrollmentCard({ enrollment }: { enrollment: Enrollment }) {
    const path = enrollment.learning_path;
    const isCompleted = enrollment.status === 'completed';
    const isNotStarted = enrollment.progress_percent === 0;
    const thumbUrl = storageUrl(path.thumbnail);

    return (
        <Link
            href={`/paths/${path.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-12px_rgba(15,23,42,0.18)] hover:ring-brand-200"
        >
            <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700">
                {thumbUrl ? (
                    <img
                        src={thumbUrl}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="grid size-full place-items-center text-white/40">
                        <Compass className="size-14" />
                    </div>
                )}
                {/* Subtle bottom gradient so badges remain readable on any photo */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />

                {path.position && (
                    <Badge className="absolute top-3 left-3 border-transparent bg-white/95 text-brand-700 shadow-sm backdrop-blur">
                        <Sparkles className="mr-1 size-3" />
                        {path.position.name}
                    </Badge>
                )}
                {isCompleted && (
                    <Badge className="absolute top-3 right-3 border-transparent bg-emerald-500 text-white shadow-sm">
                        <CheckCircle2 className="mr-1 size-3" />
                        Selesai
                    </Badge>
                )}
                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black/30">
                    <div
                        className={cn(
                            'h-full transition-all',
                            isCompleted
                                ? 'bg-gradient-to-r from-emerald-400 to-emerald-300'
                                : 'bg-gradient-to-r from-brand-400 to-brand-300',
                        )}
                        style={{ width: `${enrollment.progress_percent}%` }}
                    />
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-3 p-4">
                <h3 className="line-clamp-2 text-[15px] leading-snug font-bold text-slate-900 transition group-hover:text-brand-700">
                    {path.title}
                </h3>

                <div className="flex items-center gap-3 text-[11.5px] text-slate-500">
                    <span className="inline-flex items-center gap-1">
                        <BookOpen className="size-3.5 text-slate-400" />
                        <span className="tabular-nums font-semibold text-slate-900">
                            {enrollment.courses_completed}
                        </span>
                        /{path.total_courses} course
                    </span>
                    {path.duration_weeks && (
                        <span className="inline-flex items-center gap-1">
                            <Calendar className="size-3.5 text-slate-400" />
                            <span className="tabular-nums">{path.duration_weeks}</span> minggu
                        </span>
                    )}
                </div>

                <div className="mt-auto space-y-2.5 border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between text-[11.5px]">
                        <span className="font-semibold text-slate-700">Progress</span>
                        <span className="tabular-nums font-semibold text-brand-700">
                            {enrollment.progress_percent}%
                        </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className={cn(
                                'h-full transition-all',
                                isCompleted
                                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                                    : 'bg-gradient-to-r from-brand-600 to-brand-400',
                            )}
                            style={{ width: `${enrollment.progress_percent}%` }}
                        />
                    </div>

                    <div
                        className={cn(
                            'mt-1 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-bold transition',
                            isCompleted
                                ? 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100'
                                : 'bg-brand-50 text-brand-700 group-hover:bg-brand-100',
                        )}
                    >
                        {isCompleted ? (
                            <>
                                <Award className="size-4" /> Tinjau Path
                            </>
                        ) : isNotStarted ? (
                            <>
                                <PlayCircle className="size-4" /> Mulai Belajar
                            </>
                        ) : (
                            <>
                                <PlayCircle className="size-4" /> Lanjut Belajar
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}

function StatCard({
    label,
    value,
    icon: Icon,
    tone,
}: {
    label: string;
    value: number;
    icon: typeof Compass;
    tone: 'indigo' | 'brand' | 'emerald' | 'slate';
}) {
    const toneClass = {
        indigo: 'bg-brand-50 text-brand-600',
        brand: 'bg-brand-50 text-brand-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        slate: 'bg-slate-100 text-slate-600',
    }[tone];

    return (
        <div className="rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="flex items-center gap-3">
                <div
                    className={cn(
                        'grid size-10 place-items-center rounded-xl',
                        toneClass,
                    )}
                >
                    <Icon className="size-5" />
                </div>
                <div>
                    <div className="text-[10.5px] tracking-wider text-slate-500 uppercase">
                        {label}
                    </div>
                    <div className="text-[18px] font-extrabold text-slate-900 tabular-nums">
                        {value.toLocaleString('id-ID')}
                    </div>
                </div>
            </div>
        </div>
    );
}
