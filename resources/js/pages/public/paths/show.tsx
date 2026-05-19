import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Award,
    BookOpen,
    Calendar,
    CheckCircle2,
    Circle,
    Clock,
    GraduationCap,
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
                                                          ? 'bg-brand-500 text-white ring-brand-200'
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
                                                    className="mt-1 line-clamp-1 block text-[14.5px] font-bold text-slate-900 transition hover:text-brand-700"
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
                                                        <span className="font-bold text-brand-600">
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
                                                            : 'bg-brand-600 text-white hover:bg-brand-700',
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
