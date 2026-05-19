import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Award,
    BookOpen,
    Check,
    CheckCircle2,
    Clock,
    GraduationCap,
    PlayCircle,
    ShoppingCart,
    Star,
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
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { storageUrl } from '@/lib/storage-url';
import type { Auth } from '@/types/auth';

type Lesson = {
    id: number;
    title: string;
    type: string;
    duration_minutes: number;
    is_preview: boolean;
    description?: string | null;
    content?: string | null;
    video_path?: string | null;
    embed_url?: string | null;
    youtube_url?: string | null;
    youtube_video_id?: string | null;
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
    pointOffer: PointOffer | null;
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

export default function CourseShow({ course, isEnrolled, related, reviews, ratingBreakdown, pointOffer }: Props) {
    const { props } = usePage<{ auth: Auth }>();
    const isAuth = !!props.auth.user;
    const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);

    const handleBuy = () => {
        if (!isAuth) {
            router.visit('/login?redirect=/courses/' + course.slug);

            return;
        }

        router.visit(`/checkout/${course.slug}`);
    };

    const rating = Number(course.average_rating ?? 0);

    const breadcrumbs = [
        { label: 'Beranda', href: '/' },
        { label: 'Kursus', href: '/courses' },
        ...(course.category
            ? [
                  {
                      label: course.category.name,
                      href: `/courses?category=${course.category.slug}`,
                  },
              ]
            : []),
        { label: course.title },
    ];

    return (
        <>
            <Head title={`${course.title} · Learnpath`} />

            <PageHeader
                eyebrow={course.category?.name ?? 'Kursus'}
                title={course.title}
                description={course.subtitle ?? undefined}
                breadcrumbs={breadcrumbs}
            >
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-white/85">
                    <span className="inline-flex items-center gap-1.5">
                        <Star className="size-4 fill-amber-300 text-amber-300" />
                        <span className="font-bold text-white">{rating.toFixed(1)}</span>
                        <span className="text-white/70">
                            ({course.reviews_count} ulasan)
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <Users className="size-4 text-brand-300" />
                        {course.enrollments_count.toLocaleString('id-ID')} peserta
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-4 text-brand-300" />
                        {formatDuration(course.duration_minutes)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <BookOpen className="size-4 text-brand-300" />
                        {course.lessons_count} lesson
                    </span>
                </div>

                <div className="mt-5 inline-flex items-center gap-2.5 rounded-2xl bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur">
                    <span className="grid size-10 place-items-center rounded-full bg-white/15 ring-1 ring-white/20">
                        <GraduationCap className="size-5 text-white" />
                    </span>
                    <span>
                        <span className="block text-[10.5px] tracking-widest text-white/60 uppercase">
                            Instruktur
                        </span>
                        <span className="block text-[14px] font-semibold text-white">
                            {course.instructor?.name ?? '-'}
                        </span>
                    </span>
                </div>
            </PageHeader>

            <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
                <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
                    <div>
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-full bg-white p-1 ring-1 ring-slate-200">
                                <TabsTrigger
                                    value="overview"
                                    className="rounded-full px-4 py-2 text-[13px] font-semibold data-[state=active]:bg-brand-600 data-[state=active]:text-white data-[state=active]:shadow-none"
                                >
                                    Ikhtisar
                                </TabsTrigger>
                                <TabsTrigger
                                    value="curriculum"
                                    className="rounded-full px-4 py-2 text-[13px] font-semibold data-[state=active]:bg-brand-600 data-[state=active]:text-white data-[state=active]:shadow-none"
                                >
                                    Kurikulum
                                </TabsTrigger>
                                <TabsTrigger
                                    value="instructor"
                                    className="rounded-full px-4 py-2 text-[13px] font-semibold data-[state=active]:bg-brand-600 data-[state=active]:text-white data-[state=active]:shadow-none"
                                >
                                    Instruktur
                                </TabsTrigger>
                                <TabsTrigger
                                    value="reviews"
                                    className="rounded-full px-4 py-2 text-[13px] font-semibold data-[state=active]:bg-brand-600 data-[state=active]:text-white data-[state=active]:shadow-none"
                                >
                                    Ulasan ({course.reviews_count})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent
                                value="overview"
                                className="mt-5 space-y-5"
                            >
                                {course.learning_objectives &&
                                    course.learning_objectives.length > 0 && (
                                        <Card
                                            title="Yang akan dipelajari"
                                            icon={<Target className="size-4" />}
                                        >
                                            <ul className="grid gap-2 sm:grid-cols-2">
                                                {course.learning_objectives.map((obj, i) => (
                                                    <li
                                                        key={i}
                                                        className="flex gap-2 text-[13.5px] text-slate-700"
                                                    >
                                                        <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                                                        {obj}
                                                    </li>
                                                ))}
                                            </ul>
                                        </Card>
                                    )}

                                {course.description && (
                                    <Card
                                        title="Deskripsi Kursus"
                                        icon={<BookOpen className="size-4" />}
                                    >
                                        <div
                                            className="prose prose-slate prose-p:leading-relaxed prose-p:text-[13.5px] prose-p:text-slate-700 prose-strong:text-slate-900 max-w-none"
                                            dangerouslySetInnerHTML={{
                                                __html: course.description,
                                            }}
                                        />
                                    </Card>
                                )}

                                <div className="grid gap-5 md:grid-cols-2">
                                    {course.requirements &&
                                        course.requirements.length > 0 && (
                                            <Card title="Prasyarat">
                                                <ul className="space-y-1.5 text-[13.5px] text-slate-700">
                                                    {course.requirements.map((req, i) => (
                                                        <li
                                                            key={i}
                                                            className="flex gap-2"
                                                        >
                                                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-600" />
                                                            {req}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </Card>
                                        )}

                                    {course.target_audience &&
                                        course.target_audience.length > 0 && (
                                            <Card title="Untuk Siapa Kursus Ini">
                                                <ul className="space-y-1.5 text-[13.5px] text-slate-700">
                                                    {course.target_audience.map((aud, i) => (
                                                        <li
                                                            key={i}
                                                            className="flex gap-2"
                                                        >
                                                            <Users className="mt-0.5 size-4 shrink-0 text-brand-600" />
                                                            {aud}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </Card>
                                        )}
                                </div>
                            </TabsContent>

                            <TabsContent value="curriculum" className="mt-5">
                                {course.sections.length > 0 ? (
                                    <Card
                                        title="Materi Kursus"
                                        icon={<PlayCircle className="size-4" />}
                                        action={
                                            <span className="text-[12px] text-slate-500">
                                                {course.sections.length} bagian ·{' '}
                                                {course.lessons_count} lesson ·{' '}
                                                {formatDuration(course.duration_minutes)}
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
                                                        {section.lessons.map((lesson) =>
                                                            lesson.is_preview ? (
                                                                <li key={lesson.id}>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setPreviewLesson(
                                                                                lesson,
                                                                            )
                                                                        }
                                                                        className="group/preview -mx-2 flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-[13px] text-slate-700 transition hover:bg-emerald-50"
                                                                    >
                                                                        <PlayCircle className="size-4 text-emerald-600" />
                                                                        <span className="flex-1 truncate group-hover/preview:text-emerald-700">
                                                                            {lesson.title}
                                                                        </span>
                                                                        <Badge className="border-transparent bg-emerald-50 text-emerald-700 group-hover/preview:bg-emerald-100">
                                                                            ▶ Preview gratis
                                                                        </Badge>
                                                                        <span className="text-[11px] text-slate-400">
                                                                            {lesson.duration_minutes
                                                                                ? `${lesson.duration_minutes} mnt`
                                                                                : '-'}
                                                                        </span>
                                                                    </button>
                                                                </li>
                                                            ) : (
                                                                <li
                                                                    key={lesson.id}
                                                                    className="flex items-center gap-3 py-2 text-[13px] text-slate-600"
                                                                >
                                                                    <PlayCircle className="size-4 text-slate-300" />
                                                                    <span className="flex-1 truncate">
                                                                        {lesson.title}
                                                                    </span>
                                                                    <span className="text-[11px] text-slate-400">
                                                                        {lesson.duration_minutes
                                                                            ? `${lesson.duration_minutes} mnt`
                                                                            : '-'}
                                                                    </span>
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                </details>
                                            ))}
                                        </div>
                                    </Card>
                                ) : (
                                    <Card title="Materi Kursus">
                                        <p className="text-[13px] text-slate-500">
                                            Kurikulum belum tersedia.
                                        </p>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="instructor" className="mt-5">
                                {course.instructor ? (
                                    <Card title="Tentang Instruktur">
                                        <div className="flex items-start gap-4">
                                            <div className="grid size-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-xl font-bold text-white">
                                                {course.instructor.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-[15px] font-bold text-slate-900">
                                                    {course.instructor.name}
                                                </div>
                                                {course.instructor.instructor_profile
                                                    ?.headline && (
                                                    <div className="text-[12.5px] text-brand-700">
                                                        {
                                                            course.instructor
                                                                .instructor_profile
                                                                .headline
                                                        }
                                                    </div>
                                                )}
                                                {course.instructor.instructor_profile
                                                    ?.bio && (
                                                    <p className="mt-3 text-[13.5px] leading-relaxed text-slate-700">
                                                        {
                                                            course.instructor
                                                                .instructor_profile.bio
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ) : (
                                    <Card title="Tentang Instruktur">
                                        <p className="text-[13px] text-slate-500">
                                            Informasi instruktur belum tersedia.
                                        </p>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="reviews" className="mt-5">
                                <ReviewsSection
                                    rating={rating}
                                    reviewsCount={course.reviews_count}
                                    breakdown={ratingBreakdown}
                                    reviews={reviews}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>

                    <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                        {/* Pricing card */}
                        <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
                            <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                                {course.thumbnail ? (
                                    <img
                                        src={storageUrl(course.thumbnail) ?? ''}
                                        alt={course.title}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <div className="grid size-full place-items-center text-slate-400">
                                        <PlayCircle className="size-12" />
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <div
                                    className={
                                        course.price === 0
                                            ? 'text-[28px] font-extrabold tracking-tight text-emerald-600'
                                            : 'text-[28px] font-extrabold tracking-tight text-slate-900'
                                    }
                                >
                                    {formatRupiah(course.price)}
                                </div>

                                {isEnrolled ? (
                                    <Link
                                        href="/my-courses"
                                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-[14px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-700"
                                    >
                                        <CheckCircle2 className="size-4" />
                                        Mulai Belajar
                                    </Link>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleBuy}
                                            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-[14px] font-semibold text-white shadow-[0_10px_30px_-12px_rgba(18,35,125,0.6)] transition hover:-translate-y-0.5 hover:bg-brand-700"
                                        >
                                            <ShoppingCart className="size-4" />
                                            {course.price === 0
                                                ? 'Daftar Sekarang'
                                                : 'Beli Kursus'}
                                        </button>
                                        {pointOffer && (
                                            <div className="mt-2">
                                                <RedeemPointButton
                                                    offer={pointOffer}
                                                    label="Tukar"
                                                    fullWidth
                                                />
                                            </div>
                                        )}
                                    </>
                                )}

                                <ul className="mt-5 space-y-2.5 border-t border-slate-100 pt-5 text-[13px] text-slate-600">
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
                            </div>
                        </div>

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

            <LessonPreviewDialog
                lesson={previewLesson}
                courseTitle={course.title}
                onOpenChange={(open) => !open && setPreviewLesson(null)}
            />
        </>
    );
}

function LessonPreviewDialog({
    lesson,
    courseTitle,
    onOpenChange,
}: {
    lesson: Lesson | null;
    courseTitle: string;
    onOpenChange: (open: boolean) => void;
}) {
    const open = !!lesson;
    const videoId = lesson?.youtube_video_id;
    const embedUrl = lesson?.embed_url;
    const videoPath = lesson?.video_path;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0 sm:max-w-3xl">
                <div className="aspect-video w-full bg-slate-950">
                    {videoId ? (
                        <iframe
                            key={videoId}
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                            title={lesson?.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="size-full"
                        />
                    ) : embedUrl ? (
                        <iframe
                            key={embedUrl}
                            src={embedUrl}
                            title={lesson?.title}
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                            className="size-full"
                        />
                    ) : videoPath ? (
                        <video
                            key={videoPath}
                            controls
                            autoPlay
                            src={videoPath}
                            className="size-full bg-black"
                        />
                    ) : (
                        <div className="grid size-full place-items-center text-white/60">
                            <div className="text-center">
                                <PlayCircle className="mx-auto size-12" />
                                <p className="mt-3 text-[13.5px]">
                                    Konten preview belum tersedia.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogHeader className="p-6">
                    <DialogTitle className="text-[18px] font-extrabold tracking-tight">
                        {lesson?.title}
                    </DialogTitle>
                    <DialogDescription className="text-[12.5px]">
                        Preview gratis dari kursus <strong>{courseTitle}</strong>
                        {lesson?.duration_minutes
                            ? ` · ${lesson.duration_minutes} menit`
                            : ''}
                    </DialogDescription>
                </DialogHeader>

                {lesson?.description && (
                    <div className="border-t border-slate-100 px-6 py-4 text-[13.5px] leading-relaxed text-slate-600">
                        {lesson.description}
                    </div>
                )}
            </DialogContent>
        </Dialog>
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
