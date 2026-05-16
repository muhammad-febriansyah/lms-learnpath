import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Award,
    BookOpen,
    Check,
    CheckCircle2,
    ChevronRight,
    Clock,
    GraduationCap,
    PlayCircle,
    ShoppingCart,
    Star,
    Target,
    Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Auth } from '@/types/auth';

type Lesson = {
    id: number;
    title: string;
    type: string;
    duration_minutes: number;
    is_preview: boolean;
};

type Section = {
    id: number;
    title: string;
    description: string | null;
    lessons: Lesson[];
};

type Course = {
    id: number;
    title: string;
    subtitle: string | null;
    slug: string;
    description: string | null;
    price: number;
    level: string | null;
    language: string | null;
    duration_minutes: number;
    average_rating: string | number;
    reviews_count: number;
    total_students: number;
    enrollments_count: number;
    lessons_count: number;
    thumbnail: string | null;
    preview_video_url: string | null;
    learning_objectives: string[] | null;
    requirements: string[] | null;
    target_audience: string[] | null;
    category: { id: number; name: string; slug: string } | null;
    instructor: {
        id: number;
        name: string;
        email: string;
        instructor_profile?: {
            headline: string | null;
            bio: string | null;
            photo_path: string | null;
            expertise: string[] | null;
        } | null;
    } | null;
    sections: Section[];
    tags: Array<{ id: number; name: string; slug: string }>;
};

type Related = {
    id: number;
    title: string;
    slug: string;
    price: number;
    category: { name: string } | null;
    instructor: { name: string } | null;
};

type ReviewItem = {
    id: number;
    rating: number;
    content: string | null;
    created_at: string | null;
    user: { id: number; name: string };
};

type Props = {
    course: Course;
    isEnrolled: boolean;
    related: Related[];
    reviews: ReviewItem[];
    ratingBreakdown: Record<string, number>;
};

function formatRupiah(value: number): string {
    if (value === 0) {
return 'Gratis';
}

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

function formatDuration(minutes: number): string {
    if (!minutes) {
return '-';
}

    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    if (h === 0) {
return `${m} menit`;
}

    return `${h} jam ${m} menit`;
}

export default function CourseShow({ course, isEnrolled, related, reviews, ratingBreakdown }: Props) {
    const { props } = usePage<{ auth: Auth }>();
    const isAuth = !!props.auth.user;

    const handleBuy = () => {
        if (!isAuth) {
            router.visit('/login?redirect=/courses/' + course.slug);

            return;
        }

        router.visit(`/checkout/${course.slug}`);
    };

    const rating = Number(course.average_rating ?? 0);

    return (
        <>
            <Head title={course.title} />
            <div className="space-y-6">
                {/* Hero */}
                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white">
                    <div className="absolute -top-20 -right-16 size-72 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative p-6 sm:p-10">
                        <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-[12px] text-white/70">
                            <Link href="/courses" className="hover:text-white">
                                Katalog
                            </Link>
                            <ChevronRight className="size-3" />
                            {course.category && (
                                <>
                                    <Link
                                        href={`/courses?category=${course.category.slug}`}
                                        className="hover:text-white"
                                    >
                                        {course.category.name}
                                    </Link>
                                    <ChevronRight className="size-3" />
                                </>
                            )}
                            <span className="font-semibold text-white">{course.title}</span>
                        </nav>

                        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                            <div>
                                <h1 className="text-[28px] leading-tight font-extrabold tracking-tight sm:text-[34px]">
                                    {course.title}
                                </h1>
                                {course.subtitle && (
                                    <p className="mt-2 text-[15px] text-white/85 sm:text-[16px]">
                                        {course.subtitle}
                                    </p>
                                )}

                                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] text-white/85">
                                    <span className="inline-flex items-center gap-1.5">
                                        <svg
                                            viewBox="0 0 24 24"
                                            width="14"
                                            height="14"
                                            fill="currentColor"
                                            className="text-amber-300"
                                        >
                                            <path d="M12 2 15 9l7 .8-5.2 4.9L18.2 22 12 18 5.8 22l1.4-7.3L2 9.8 9 9z" />
                                        </svg>
                                        <span className="font-bold text-white">{rating.toFixed(1)}</span>
                                        <span>({course.reviews_count} ulasan)</span>
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <Users className="size-3.5" />
                                        {course.enrollments_count.toLocaleString('id-ID')} peserta
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <Clock className="size-3.5" />
                                        {formatDuration(course.duration_minutes)}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <BookOpen className="size-3.5" />
                                        {course.lessons_count} lesson
                                    </span>
                                </div>

                                <div className="mt-5 flex items-center gap-2.5">
                                    <div className="grid size-10 place-items-center rounded-full bg-white/15 ring-1 ring-white/20">
                                        <GraduationCap className="size-5" />
                                    </div>
                                    <div>
                                        <div className="text-[10.5px] tracking-widest text-white/60 uppercase">
                                            Instruktur
                                        </div>
                                        <div className="text-[14px] font-semibold">
                                            {course.instructor?.name ?? '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <aside className="rounded-2xl bg-white p-5 text-slate-800 shadow-2xl">
                                <div className="aspect-[16/10] overflow-hidden rounded-xl bg-slate-100">
                                    {course.thumbnail ? (
                                        <img
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <div className="grid size-full place-items-center text-slate-400">
                                            <PlayCircle className="size-12" />
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4">
                                    <div
                                        className={
                                            course.price === 0
                                                ? 'text-[28px] font-extrabold text-emerald-600'
                                                : 'text-[28px] font-extrabold text-slate-900'
                                        }
                                    >
                                        {formatRupiah(course.price)}
                                    </div>
                                </div>

                                {isEnrolled ? (
                                    <Button
                                        asChild
                                        className="mt-4 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        <Link href="/my-courses">
                                            <CheckCircle2 className="mr-1.5 size-4" />
                                            Anda sudah terdaftar — Mulai Belajar
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleBuy}
                                        className="mt-4 w-full rounded-xl bg-brand-600 hover:bg-brand-700"
                                    >
                                        <ShoppingCart className="mr-1.5 size-4" />
                                        {course.price === 0 ? 'Daftar Sekarang' : 'Beli Kursus'}
                                    </Button>
                                )}

                                <ul className="mt-5 space-y-2 text-[12.5px] text-slate-600">
                                    <li className="flex items-center gap-2">
                                        <Award className="size-4 text-brand-600" />
                                        Sertifikat resmi setelah lulus
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Clock className="size-4 text-brand-600" />
                                        Akses seumur hidup
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <PlayCircle className="size-4 text-brand-600" />
                                        Belajar di mana saja, kapan saja
                                    </li>
                                </ul>
                            </aside>
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    <div className="space-y-5">
                        {course.learning_objectives && course.learning_objectives.length > 0 && (
                            <Card
                                title="Yang akan dipelajari"
                                icon={<Target className="size-4" />}
                            >
                                <ul className="grid gap-2 sm:grid-cols-2">
                                    {course.learning_objectives.map((obj, i) => (
                                        <li key={i} className="flex gap-2 text-[13.5px] text-slate-700">
                                            <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                                            {obj}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}

                        {course.description && (
                            <Card title="Deskripsi Kursus" icon={<BookOpen className="size-4" />}>
                                <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-slate-700">
                                    {course.description}
                                </p>
                            </Card>
                        )}

                        {course.requirements && course.requirements.length > 0 && (
                            <Card title="Prasyarat">
                                <ul className="space-y-1.5 text-[13.5px] text-slate-700">
                                    {course.requirements.map((req, i) => (
                                        <li key={i} className="flex gap-2">
                                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-600" />
                                            {req}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}

                        {course.target_audience && course.target_audience.length > 0 && (
                            <Card title="Untuk Siapa Kursus Ini">
                                <ul className="space-y-1.5 text-[13.5px] text-slate-700">
                                    {course.target_audience.map((aud, i) => (
                                        <li key={i} className="flex gap-2">
                                            <Users className="mt-0.5 size-4 shrink-0 text-brand-600" />
                                            {aud}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}

                        {course.sections.length > 0 && (
                            <Card
                                title="Materi Kursus"
                                icon={<PlayCircle className="size-4" />}
                                action={
                                    <span className="text-[12px] text-slate-500">
                                        {course.sections.length} bagian · {course.lessons_count}{' '}
                                        lesson · {formatDuration(course.duration_minutes)}
                                    </span>
                                }
                            >
                                <div className="space-y-2">
                                    {course.sections.map((section, idx) => (
                                        <details
                                            key={section.id}
                                            className="group rounded-xl border border-slate-200/80"
                                            open={idx === 0}
                                        >
                                            <summary className="flex cursor-pointer items-center justify-between gap-2 px-4 py-3 hover:bg-slate-50/60">
                                                <div className="flex items-center gap-3">
                                                    <span className="grid size-7 place-items-center rounded-lg bg-brand-50 text-[12px] font-bold text-brand-700">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="text-[13.5px] font-semibold text-slate-900">
                                                        {section.title}
                                                    </span>
                                                </div>
                                                <span className="text-[11px] text-slate-400">
                                                    {section.lessons.length} lesson
                                                </span>
                                            </summary>
                                            <ul className="border-t border-slate-100 px-4 py-2">
                                                {section.lessons.map((lesson) => (
                                                    <li
                                                        key={lesson.id}
                                                        className="flex items-center gap-3 py-2 text-[13px] text-slate-600"
                                                    >
                                                        <PlayCircle className="size-4 text-slate-400" />
                                                        <span className="flex-1 truncate">{lesson.title}</span>
                                                        {lesson.is_preview && (
                                                            <Badge className="border-transparent bg-amber-50 text-amber-700">
                                                                Preview
                                                            </Badge>
                                                        )}
                                                        <span className="text-[11px] text-slate-400">
                                                            {lesson.duration_minutes
                                                                ? `${lesson.duration_minutes} mnt`
                                                                : '-'}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </details>
                                    ))}
                                </div>
                            </Card>
                        )}

                        <ReviewsSection
                            rating={rating}
                            reviewsCount={course.reviews_count}
                            breakdown={ratingBreakdown}
                            reviews={reviews}
                        />

                        {course.instructor && (
                            <Card title="Tentang Instruktur">
                                <div className="flex items-start gap-3">
                                    <div className="grid size-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-lg font-bold text-white">
                                        {course.instructor.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-[14px] font-bold text-slate-900">
                                            {course.instructor.name}
                                        </div>
                                        {course.instructor.instructor_profile?.headline && (
                                            <div className="text-[12px] text-slate-500">
                                                {course.instructor.instructor_profile.headline}
                                            </div>
                                        )}
                                        {course.instructor.instructor_profile?.bio && (
                                            <p className="mt-2 text-[13px] leading-relaxed text-slate-700">
                                                {course.instructor.instructor_profile.bio}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>

                    <aside className="space-y-4">
                        {related.length > 0 && (
                            <Card title="Kursus Terkait">
                                <ul className="space-y-1">
                                    {related.map((r) => (
                                        <li key={r.id}>
                                            <Link
                                                href={`/courses/${r.slug}`}
                                                className="flex flex-col gap-1 rounded-xl p-3 transition hover:bg-slate-50"
                                            >
                                                <span className="line-clamp-2 text-[13px] font-semibold text-slate-900">
                                                    {r.title}
                                                </span>
                                                <span className="text-[11px] text-slate-500">
                                                    {r.category?.name ?? ''} · {r.instructor?.name ?? ''}
                                                </span>
                                                <span className="text-[12px] font-bold text-brand-700">
                                                    {formatRupiah(r.price)}
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}
                    </aside>
                </div>
            </div>
        </>
    );
}

function ReviewsSection({
    rating,
    reviewsCount,
    breakdown,
    reviews,
}: {
    rating: number;
    reviewsCount: number;
    breakdown: Record<string, number>;
    reviews: ReviewItem[];
}) {
    return (
        <Card
            title={`Ulasan Peserta (${reviewsCount})`}
            icon={<Star className="size-4 fill-amber-400 text-amber-400" />}
        >
            {reviewsCount === 0 ? (
                <p className="text-[12.5px] text-slate-500">
                    Belum ada ulasan untuk kursus ini.
                </p>
            ) : (
                <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
                    <div className="text-center sm:border-r sm:border-slate-200 sm:pr-5">
                        <div className="text-[36px] leading-none font-extrabold text-slate-900">
                            {rating.toFixed(1)}
                        </div>
                        <div className="mt-1 flex justify-center">
                            <StarRow rating={rating} size="md" />
                        </div>
                        <div className="mt-1 text-[11.5px] text-slate-500">
                            {reviewsCount} ulasan
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = breakdown[String(star)] ?? 0;
                            const pct = reviewsCount > 0 ? (count / reviewsCount) * 100 : 0;
                            return (
                                <div key={star} className="flex items-center gap-2 text-[11.5px]">
                                    <span className="w-3 font-semibold text-slate-700">{star}</span>
                                    <Star className="size-3 fill-amber-400 text-amber-400" />
                                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full bg-amber-400"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <span className="w-8 text-right text-slate-500">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {reviews.length > 0 && (
                <ul className="mt-5 space-y-4 border-t border-slate-100 pt-5">
                    {reviews.map((r) => (
                        <li key={r.id} className="flex gap-3">
                            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-[13px] font-bold text-white">
                                {r.user.name.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[13px] font-bold text-slate-900">
                                        {r.user.name}
                                    </span>
                                    <StarRow rating={r.rating} />
                                    <span className="text-[11px] text-slate-400">
                                        {r.created_at
                                            ? new Date(r.created_at).toLocaleDateString('id-ID', {
                                                  day: 'numeric',
                                                  month: 'short',
                                                  year: 'numeric',
                                              })
                                            : ''}
                                    </span>
                                </div>
                                {r.content && (
                                    <p className="mt-1 text-[12.5px] leading-relaxed whitespace-pre-wrap text-slate-700">
                                        {r.content}
                                    </p>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </Card>
    );
}

function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
    const px = size === 'md' ? 'size-4' : 'size-3.5';
    return (
        <span className="inline-flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
                <Star
                    key={n}
                    className={
                        n <= Math.round(rating)
                            ? `${px} fill-amber-400 text-amber-400`
                            : `${px} fill-transparent text-slate-300`
                    }
                />
            ))}
        </span>
    );
}

function Card({
    title,
    icon,
    action,
    children,
}: {
    title: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="mb-4 flex items-start justify-between gap-3">
                <h2 className="inline-flex items-center gap-2 text-[15px] font-bold text-slate-900">
                    {icon}
                    {title}
                </h2>
                {action}
            </div>
            <div>{children}</div>
        </div>
    );
}
