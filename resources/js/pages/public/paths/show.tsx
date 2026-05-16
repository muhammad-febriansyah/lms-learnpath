import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Award,
    BookOpen,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Circle,
    Clock,
    Compass,
    GraduationCap,
    PlayCircle,
    Sparkles,
    Target,
    Users,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Course = {
    id: number;
    title: string;
    slug: string;
    subtitle: string | null;
    thumbnail: string | null;
    duration_minutes: number;
    level: string | null;
    category: { id: number; name: string } | null;
    instructor: { id: number; name: string } | null;
    sort_order: number;
    is_required: boolean;
};

type Path = {
    id: number;
    title: string;
    slug: string;
    subtitle: string | null;
    description: string | null;
    thumbnail: string | null;
    level: string | null;
    duration_weeks: number | null;
    target_audience: string[] | null;
    outcomes: string[] | null;
    total_courses: number;
    total_students: number;
    enrollments_count: number;
    position: { id: number; name: string; division: string | null } | null;
    courses: Course[];
};

type UserEnrollment = {
    status: string;
    progress_percent: number;
    courses_completed: number;
    enrolled_at: string | null;
    completed_at: string | null;
};

type CourseProgress = { status: string; progress_percent: number };

type Props = {
    path: Path;
    userEnrollment: UserEnrollment | null;
    courseProgress: Record<number, CourseProgress>;
};

function formatDuration(minutes: number): string {
    if (!minutes) return '-';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m} mnt`;
    return `${h}j ${m}m`;
}

function levelLabel(level: string | null): string {
    if (!level) return 'Semua Level';
    return (
        {
            beginner: 'Pemula',
            intermediate: 'Menengah',
            advanced: 'Lanjutan',
        }[level] ?? level
    );
}

export default function PathShow({ path, userEnrollment, courseProgress }: Props) {
    const page = usePage<{ auth: { user: { id: number } | null } }>();
    const isAuthed = Boolean(page.props.auth?.user);
    const [enrolling, setEnrolling] = useState(false);

    const handleEnroll = () => {
        if (!isAuthed) {
            router.visit(`/login?redirect=/paths/${path.slug}`);
            return;
        }
        setEnrolling(true);
        router.post(
            `/paths/${path.slug}/enroll`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setEnrolling(false),
            },
        );
    };

    const isCompleted = userEnrollment?.status === 'completed';

    return (
        <>
            <Head title={path.title} />
            <div className="space-y-6">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                    <Link href="/paths" className="hover:text-slate-700">
                        Learning Path
                    </Link>
                    <ChevronRight className="size-3 text-slate-300" />
                    <span className="line-clamp-1 font-semibold text-slate-900">
                        {path.title}
                    </span>
                </nav>

                {/* Hero */}
                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-indigo-700 to-brand-700 p-6 text-white sm:p-10">
                    <div
                        className="absolute -top-24 -right-24 size-96 rounded-full bg-white/10 blur-3xl"
                        aria-hidden="true"
                    />
                    <div
                        className="absolute -bottom-32 -left-24 size-96 rounded-full bg-violet-300/20 blur-3xl"
                        aria-hidden="true"
                    />
                    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold tracking-[0.16em] ring-1 ring-white/20 uppercase backdrop-blur">
                                <Compass className="size-3" />
                                Learning Path
                            </div>
                            <h1 className="mt-3 text-[28px] leading-[1.15] font-extrabold tracking-tight sm:text-[36px]">
                                {path.title}
                            </h1>
                            {path.subtitle && (
                                <p className="mt-3 text-[14.5px] leading-relaxed text-white/85 sm:text-[16px]">
                                    {path.subtitle}
                                </p>
                            )}

                            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-white/85">
                                <span className="inline-flex items-center gap-1.5">
                                    <BookOpen className="size-3.5" />
                                    {path.total_courses} course
                                </span>
                                {path.duration_weeks && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Calendar className="size-3.5" />
                                        {path.duration_weeks} minggu
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1.5">
                                    <Sparkles className="size-3.5" />
                                    {levelLabel(path.level)}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Users className="size-3.5" />
                                    {path.enrollments_count.toLocaleString('id-ID')} peserta
                                </span>
                                {path.position && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Target className="size-3.5" />
                                        Untuk {path.position.name}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:min-w-[220px]">
                            {!userEnrollment && (
                                <Button
                                    size="lg"
                                    onClick={handleEnroll}
                                    disabled={enrolling}
                                    className="h-12 rounded-xl bg-white px-6 text-indigo-700 hover:bg-slate-50"
                                >
                                    {enrolling ? 'Memproses...' : 'Mulai Path Ini'}
                                </Button>
                            )}
                            {userEnrollment && !isCompleted && (
                                <Button
                                    asChild
                                    size="lg"
                                    className="h-12 rounded-xl bg-white px-6 text-indigo-700 hover:bg-slate-50"
                                >
                                    <Link href="/my-paths">Lanjut Belajar</Link>
                                </Button>
                            )}
                            {isCompleted && (
                                <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/20 px-3 py-2 text-[12.5px] font-bold ring-1 ring-emerald-300/40">
                                    <Award className="size-4 text-emerald-200" />
                                    Path Selesai
                                </div>
                            )}
                            {userEnrollment && (
                                <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20">
                                    <div className="flex items-center justify-between text-[11.5px] text-white/80">
                                        <span>Progress Anda</span>
                                        <span className="font-bold text-white tabular-nums">
                                            {userEnrollment.progress_percent}%
                                        </span>
                                    </div>
                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
                                        <div
                                            className="h-full bg-white"
                                            style={{
                                                width: `${userEnrollment.progress_percent}%`,
                                            }}
                                        />
                                    </div>
                                    <p className="mt-2 text-[11px] text-white/75">
                                        {userEnrollment.courses_completed} dari {path.total_courses}{' '}
                                        course selesai
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Description & outcomes */}
                <section className="grid gap-5 lg:grid-cols-[2fr_1fr]">
                    <div className="space-y-5">
                        {path.description && (
                            <div className="rounded-2xl bg-card p-6 ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                                <h2 className="text-[18px] font-extrabold text-slate-900">
                                    Tentang Path
                                </h2>
                                <p className="mt-2 text-[13.5px] leading-relaxed whitespace-pre-line text-slate-700">
                                    {path.description}
                                </p>
                            </div>
                        )}

                        {/* Course sequence */}
                        <div className="rounded-2xl bg-card p-6 ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                            <div className="flex items-center justify-between">
                                <h2 className="text-[18px] font-extrabold text-slate-900">
                                    Kurikulum
                                </h2>
                                <span className="text-[12px] text-slate-500">
                                    {path.courses.length} course berurutan
                                </span>
                            </div>

                            <ol className="mt-5 space-y-3">
                                {path.courses.map((course, idx) => {
                                    const progress = courseProgress[course.id];
                                    const completed = progress?.status === 'completed';
                                    const inProgress = !!progress && !completed && progress.progress_percent > 0;
                                    return (
                                        <li
                                            key={course.id}
                                            className={cn(
                                                'group relative flex gap-4 rounded-xl border p-4 transition',
                                                completed
                                                    ? 'border-emerald-200 bg-emerald-50/50'
                                                    : 'border-slate-200 bg-white hover:border-slate-300',
                                            )}
                                        >
                                            {/* Step number */}
                                            <div
                                                className={cn(
                                                    'grid size-9 shrink-0 place-items-center rounded-full text-[12.5px] font-extrabold ring-2',
                                                    completed
                                                        ? 'bg-emerald-500 text-white ring-emerald-200'
                                                        : inProgress
                                                          ? 'bg-indigo-500 text-white ring-indigo-200'
                                                          : 'bg-slate-100 text-slate-600 ring-slate-200',
                                                )}
                                            >
                                                {completed ? (
                                                    <CheckCircle2 className="size-5" />
                                                ) : (
                                                    idx + 1
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    {course.category && (
                                                        <Badge className="border-transparent bg-slate-100 text-slate-700 text-[10px] font-bold hover:bg-slate-100">
                                                            {course.category.name}
                                                        </Badge>
                                                    )}
                                                    {!course.is_required && (
                                                        <Badge className="border-transparent bg-amber-100 text-amber-800 text-[10px] font-bold hover:bg-amber-100">
                                                            Opsional
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Link
                                                    href={`/courses/${course.slug}`}
                                                    className="mt-1 line-clamp-1 block text-[14.5px] font-bold text-slate-900 transition hover:text-indigo-700"
                                                >
                                                    {course.title}
                                                </Link>
                                                {course.subtitle && (
                                                    <p className="mt-0.5 line-clamp-1 text-[12px] text-slate-500">
                                                        {course.subtitle}
                                                    </p>
                                                )}
                                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                                                    {course.instructor && (
                                                        <span>{course.instructor.name}</span>
                                                    )}
                                                    <span className="inline-flex items-center gap-1">
                                                        <Clock className="size-3" />
                                                        {formatDuration(course.duration_minutes)}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <GraduationCap className="size-3" />
                                                        {levelLabel(course.level)}
                                                    </span>
                                                    {inProgress && (
                                                        <span className="font-bold text-indigo-600">
                                                            {progress.progress_percent}% selesai
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 items-center">
                                                <Link
                                                    href={`/courses/${course.slug}`}
                                                    className={cn(
                                                        'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11.5px] font-bold transition',
                                                        completed
                                                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                                            : 'bg-indigo-600 text-white hover:bg-indigo-700',
                                                    )}
                                                >
                                                    <PlayCircle className="size-3.5" />
                                                    {completed ? 'Tinjau' : 'Buka'}
                                                </Link>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-5">
                        {path.outcomes && path.outcomes.length > 0 && (
                            <div className="rounded-2xl bg-card p-5 ring-1 ring-slate-200/70">
                                <h3 className="text-[14px] font-extrabold text-slate-900">
                                    Yang Anda Capai
                                </h3>
                                <ul className="mt-3 space-y-2">
                                    {path.outcomes.map((o, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-2 text-[12.5px] text-slate-700"
                                        >
                                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                                            <span>{o}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {path.target_audience && path.target_audience.length > 0 && (
                            <div className="rounded-2xl bg-card p-5 ring-1 ring-slate-200/70">
                                <h3 className="text-[14px] font-extrabold text-slate-900">
                                    Cocok untuk
                                </h3>
                                <ul className="mt-3 space-y-2">
                                    {path.target_audience.map((t, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-2 text-[12.5px] text-slate-700"
                                        >
                                            <Circle className="mt-1 size-2 shrink-0 fill-indigo-500 text-indigo-500" />
                                            <span>{t}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {path.position && (
                            <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 p-5 ring-1 ring-indigo-200/70">
                                <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-indigo-700 uppercase">
                                    <Target className="size-3.5" />
                                    Mapped to Jabatan
                                </div>
                                <div className="mt-2 text-[15px] font-extrabold text-slate-900">
                                    {path.position.name}
                                </div>
                                {path.position.division && (
                                    <div className="text-[12px] text-slate-600">
                                        Divisi {path.position.division}
                                    </div>
                                )}
                            </div>
                        )}
                    </aside>
                </section>
            </div>
        </>
    );
}
