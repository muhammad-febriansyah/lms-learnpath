import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    BookOpen,
    Calendar,
    CheckCircle2,
    Circle,
    Clock,
    GraduationCap,
    Layers,
    PlayCircle,
    Sparkles,
    Target,
    Users,
} from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/front/page-header';
import {
    RedeemPointButton,
    type PointOffer,
} from '@/components/redeem-point-button';
import { Badge } from '@/components/ui/badge';
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
    price: number;
    compare_at_price: number | null;
    savings: number;
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
    pointOffer: PointOffer | null;
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

function resolveThumbnail(path: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `/storage/${path}`;
}

const COURSE_GRADIENTS = [
    'from-blue-500 via-brand-600 to-brand-800',
    'from-brand-500 via-brand-600 to-brand-800',
    'from-emerald-500 via-teal-600 to-cyan-800',
    'from-rose-500 via-pink-600 to-rose-800',
    'from-amber-500 via-orange-600 to-red-700',
    'from-sky-500 via-blue-600 to-brand-800',
];

function gradientFor(seed: string): string {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
        h = (h * 31 + seed.charCodeAt(i)) | 0;
    }
    return COURSE_GRADIENTS[Math.abs(h) % COURSE_GRADIENTS.length];
}

export default function PathShow({ path, userEnrollment, courseProgress, pointOffer }: Props) {
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
    const isPaid = path.price > 0;
    const priceLabel = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(path.price);

    const handleBuyPath = () => {
        if (!isAuthed) {
            router.visit(`/login?redirect=/checkout/path/${path.slug}`);
            return;
        }
        router.visit(`/checkout/path/${path.slug}`);
    };

    const enrollButton = !userEnrollment ? (
        <div className="flex flex-wrap items-center gap-2">
            {isPaid ? (
                <button
                    type="button"
                    onClick={handleBuyPath}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[14px] font-bold text-brand-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-50"
                >
                    Beli {path.total_courses} Kelas · {priceLabel}
                </button>
            ) : (
                <button
                    type="button"
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-brand-700 transition hover:-translate-y-0.5 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {enrolling ? 'Memproses...' : 'Mulai Path Ini'}
                </button>
            )}
            {pointOffer && (
                <RedeemPointButton offer={pointOffer} label="Tukar Path" />
            )}
        </div>
    ) : !isCompleted ? (
        <Link
            href="/my-paths"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-brand-700 transition hover:-translate-y-0.5 hover:bg-brand-50"
        >
            Lanjut Belajar
        </Link>
    ) : (
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/25 px-4 py-2 text-[13px] font-bold text-white ring-1 ring-emerald-300/40 backdrop-blur">
            <Award className="size-4 text-emerald-200" />
            Path Selesai
        </span>
    );

    return (
        <>
            <Head title={`${path.title} · Learnpath`} />

            <PageHeader
                eyebrow="Learning Path"
                title={path.title}
                description={path.subtitle ?? undefined}
                breadcrumbs={[
                    { label: 'Beranda', href: '/' },
                    { label: 'Learning Path', href: '/paths' },
                    { label: path.title },
                ]}
                actions={enrollButton}
            >
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-white/85">
                    <span className="inline-flex items-center gap-1.5">
                        <BookOpen className="size-4 text-brand-300" />
                        {path.total_courses} course
                    </span>
                    {path.duration_weeks && (
                        <span className="inline-flex items-center gap-1.5">
                            <Calendar className="size-4 text-brand-300" />
                            {path.duration_weeks} minggu
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                        <Sparkles className="size-4 text-brand-300" />
                        {levelLabel(path.level)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <Users className="size-4 text-brand-300" />
                        {path.enrollments_count.toLocaleString('id-ID')} peserta
                    </span>
                    {path.position && (
                        <span className="inline-flex items-center gap-1.5">
                            <Target className="size-4 text-brand-300" />
                            Untuk {path.position.name}
                        </span>
                    )}
                </div>

                {userEnrollment && (
                    <div className="mt-6 max-w-md rounded-2xl bg-white/10 p-4 ring-1 ring-white/20 backdrop-blur">
                        <div className="flex items-center justify-between text-[12px] text-white/80">
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
                        <p className="mt-2 text-[11.5px] text-white/75">
                            {userEnrollment.courses_completed} dari {path.total_courses}{' '}
                            course selesai
                        </p>
                    </div>
                )}
            </PageHeader>

            <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
                {/* Description & outcomes */}
                <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <div className="space-y-5">
                        {path.description && (
                            <div className="rounded-2xl bg-card p-6 ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                                <h2 className="text-[18px] font-extrabold text-slate-900">
                                    Tentang Path
                                </h2>
                                <div
                                    className="prose prose-sm mt-2 max-w-none text-[13.5px] leading-relaxed text-slate-700 [&_a]:text-brand-600 [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5"
                                    dangerouslySetInnerHTML={{ __html: path.description }}
                                />
                            </div>
                        )}

                        {/* Course sequence */}
                        <div className="rounded-2xl bg-card p-6 ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h2 className="flex items-center gap-2 text-[18px] font-extrabold text-slate-900">
                                        <Layers className="size-5 text-brand-600" />
                                        Kurikulum
                                    </h2>
                                    <p className="mt-1 text-[12px] text-slate-500">
                                        {path.courses.length} course tersusun
                                        berurutan — selesaikan dari atas ke bawah
                                    </p>
                                </div>
                                {userEnrollment && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                                        <CheckCircle2 className="size-3" />
                                        {userEnrollment.courses_completed}/
                                        {path.total_courses} selesai
                                    </span>
                                )}
                            </div>

                            <ol className="relative mt-6 space-y-4">
                                {/* Vertical connection line */}
                                <div
                                    aria-hidden
                                    className="absolute top-3 bottom-3 left-[18px] w-px bg-gradient-to-b from-brand-200 via-slate-200 to-slate-100"
                                />

                                {path.courses.map((course, idx) => {
                                    const progress = courseProgress[course.id];
                                    const completed = progress?.status === 'completed';
                                    const inProgress =
                                        !!progress &&
                                        !completed &&
                                        progress.progress_percent > 0;
                                    const thumb = resolveThumbnail(course.thumbnail);
                                    const gradient = gradientFor(course.title);

                                    return (
                                        <li
                                            key={course.id}
                                            className="relative flex items-stretch gap-3"
                                        >
                                            {/* Step number (on top of line) */}
                                            <div
                                                className={cn(
                                                    'relative z-10 mt-3 grid size-9 shrink-0 place-items-center rounded-full text-[12.5px] font-extrabold ring-4 ring-white',
                                                    completed
                                                        ? 'bg-emerald-500 text-white'
                                                        : inProgress
                                                          ? 'bg-brand-600 text-white'
                                                          : 'bg-white text-slate-700 shadow-[inset_0_0_0_2px] shadow-slate-200',
                                                )}
                                            >
                                                {completed ? (
                                                    <CheckCircle2 className="size-5" />
                                                ) : (
                                                    idx + 1
                                                )}
                                            </div>

                                            {/* Card */}
                                            <Link
                                                href={`/courses/${course.slug}`}
                                                className={cn(
                                                    'group flex flex-1 gap-3 overflow-hidden rounded-xl border bg-white p-3 transition hover:-translate-y-0.5',
                                                    completed
                                                        ? 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-300'
                                                        : 'border-slate-200 hover:border-brand-300 hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.15)]',
                                                )}
                                            >
                                                {/* Thumbnail */}
                                                <div className="relative aspect-[16/10] w-32 shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:w-40">
                                                    {thumb ? (
                                                        <img
                                                            src={thumb}
                                                            alt={course.title}
                                                            loading="lazy"
                                                            className="size-full object-cover transition duration-500 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div
                                                            className={cn(
                                                                'relative grid size-full place-items-center bg-gradient-to-br text-white',
                                                                gradient,
                                                            )}
                                                        >
                                                            <div
                                                                aria-hidden
                                                                className="absolute inset-0 opacity-30"
                                                                style={{
                                                                    backgroundImage:
                                                                        'radial-gradient(circle, rgba(255,255,255,0.25) 1px, transparent 1px)',
                                                                    backgroundSize:
                                                                        '14px 14px',
                                                                }}
                                                            />
                                                            <BookOpen className="relative size-7 drop-shadow" />
                                                        </div>
                                                    )}

                                                    {completed && (
                                                        <div className="absolute inset-0 grid place-items-center bg-emerald-500/85">
                                                            <CheckCircle2 className="size-7 text-white drop-shadow" />
                                                        </div>
                                                    )}

                                                    {inProgress && (
                                                        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/30">
                                                            <div
                                                                className="h-full bg-brand-400"
                                                                style={{
                                                                    width: `${progress.progress_percent}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Body */}
                                                <div className="flex min-w-0 flex-1 flex-col">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        {course.category && (
                                                            <Badge className="border-transparent bg-slate-100 text-[10px] font-bold text-slate-700 hover:bg-slate-100">
                                                                {course.category.name}
                                                            </Badge>
                                                        )}
                                                        {!course.is_required && (
                                                            <Badge className="border-transparent bg-amber-100 text-[10px] font-bold text-amber-800 hover:bg-amber-100">
                                                                Opsional
                                                            </Badge>
                                                        )}
                                                        {inProgress && (
                                                            <Badge className="border-transparent bg-brand-100 text-[10px] font-bold text-brand-700 hover:bg-brand-100">
                                                                {progress.progress_percent}%
                                                                lanjut
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <h3 className="mt-1.5 line-clamp-2 text-[14.5px] font-bold leading-snug text-slate-900 transition group-hover:text-brand-700">
                                                        {course.title}
                                                    </h3>
                                                    {course.subtitle && (
                                                        <p className="mt-0.5 line-clamp-1 text-[12px] text-slate-500">
                                                            {course.subtitle}
                                                        </p>
                                                    )}

                                                    <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-[11px] text-slate-500">
                                                        {course.instructor && (
                                                            <span className="truncate font-medium">
                                                                {course.instructor.name}
                                                            </span>
                                                        )}
                                                        <span className="inline-flex items-center gap-1">
                                                            <Clock className="size-3" />
                                                            {formatDuration(
                                                                course.duration_minutes,
                                                            )}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1">
                                                            <GraduationCap className="size-3" />
                                                            {levelLabel(course.level)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* CTA chevron */}
                                                <div className="hidden shrink-0 items-center pr-2 sm:flex">
                                                    <span
                                                        className={cn(
                                                            'inline-flex size-9 items-center justify-center rounded-full transition group-hover:translate-x-0.5',
                                                            completed
                                                                ? 'bg-emerald-100 text-emerald-700'
                                                                : 'bg-brand-50 text-brand-700 group-hover:bg-brand-100',
                                                        )}
                                                    >
                                                        {completed ? (
                                                            <ArrowRight className="size-4" />
                                                        ) : (
                                                            <PlayCircle className="size-4" />
                                                        )}
                                                    </span>
                                                </div>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ol>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                        {path.outcomes && path.outcomes.length > 0 && (
                            <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
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
                            <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
                                <h3 className="text-[14px] font-extrabold text-slate-900">
                                    Cocok untuk
                                </h3>
                                <ul className="mt-3 space-y-2">
                                    {path.target_audience.map((t, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-2 text-[12.5px] text-slate-700"
                                        >
                                            <Circle className="mt-1 size-2 shrink-0 fill-brand-500 text-brand-500" />
                                            <span>{t}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {path.position && (
                            <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-white p-6 ring-1 ring-brand-100">
                                <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-brand-700 uppercase">
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
