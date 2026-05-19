import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, GraduationCap, Lock, PlayCircle, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Lesson = {
    id: number;
    title: string;
    description: string | null;
    type: string;
    content: string | null;
    video_path: string | null;
    embed_url: string | null;
    youtube_video_id: string | null;
    duration_minutes: number | null;
};

type CourseCtx = {
    id: number;
    slug: string;
    title: string;
    short_description: string | null;
    thumbnail: string | null;
    price: number | null;
    instructor: {
        id: number;
        name: string;
        headline: string | null;
    } | null;
};

type OtherPreview = {
    id: number;
    title: string;
    duration_minutes: number | null;
};

type Props = {
    course: CourseCtx;
    lesson: Lesson;
    otherPreviews: OtherPreview[];
};

function rupiah(n: number | null): string {
    if (n === null || n === 0) return 'Gratis';
    return 'Rp ' + n.toLocaleString('id-ID');
}

export default function CoursePreview({ course, lesson, otherPreviews }: Props) {
    return (
        <>
            <Head title={`Preview · ${lesson.title}`} />
            <div className="min-h-screen bg-slate-950 pb-20">
                {/* Top bar */}
                <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/85 backdrop-blur">
                    <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
                        <Link
                            href={`/courses/${course.slug}`}
                            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-300 transition hover:text-white"
                        >
                            <ArrowLeft className="size-3.5" />
                            Kembali ke course
                        </Link>
                        <Badge className="ml-auto border-transparent bg-emerald-500/20 text-emerald-300">
                            ▶ Preview Gratis
                        </Badge>
                    </div>
                </header>

                <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
                    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                        {/* Player */}
                        <div className="space-y-5">
                            <div className="overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-slate-800">
                                <LessonPlayer lesson={lesson} />
                            </div>

                            <div>
                                <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                                    {lesson.title}
                                </h1>
                                <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px] text-slate-400">
                                    <span className="inline-flex items-center gap-1.5">
                                        <BookOpen className="size-3.5" />
                                        {course.title}
                                    </span>
                                    {course.instructor && (
                                        <span className="inline-flex items-center gap-1.5">
                                            <GraduationCap className="size-3.5" />
                                            oleh {course.instructor.name}
                                        </span>
                                    )}
                                    {lesson.duration_minutes && (
                                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                                            {lesson.duration_minutes} menit
                                        </span>
                                    )}
                                </div>
                                {lesson.description && (
                                    <p className="mt-4 text-[14px] leading-relaxed text-slate-300">
                                        {lesson.description}
                                    </p>
                                )}
                            </div>

                            {/* CTA Big card */}
                            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-6 ring-1 ring-brand-500/30 sm:p-8">
                                <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
                                    <div>
                                        <Badge className="border-transparent bg-white/15 text-white">
                                            <Sparkles className="mr-1 size-3" />
                                            Akses materi lengkap
                                        </Badge>
                                        <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                                            Mau lanjut belajar semua?
                                        </h2>
                                        <p className="mt-2 text-[14px] text-white/85">
                                            Enroll sekarang dan dapat akses penuh ke semua section,
                                            quiz, sertifikat lulus, dan dukungan instruktur.
                                        </p>
                                        <div className="mt-5 flex flex-wrap gap-2">
                                            <Button
                                                asChild
                                                className="rounded-xl bg-white text-brand-700 hover:bg-brand-50"
                                            >
                                                <Link href={`/courses/${course.slug}`}>
                                                    Enroll {rupiah(course.price)}
                                                </Link>
                                            </Button>
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20"
                                            >
                                                <Link href={`/courses/${course.slug}`}>
                                                    Lihat detail course
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                    {course.thumbnail && (
                                        <div className="hidden sm:block">
                                            <img
                                                src={course.thumbnail}
                                                alt={course.title}
                                                className="size-32 rounded-xl object-cover shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] ring-1 ring-white/20"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <aside className="space-y-4">
                            <div className="rounded-2xl bg-slate-900 p-4 ring-1 ring-slate-800">
                                <div className="text-[10.5px] font-bold tracking-wider text-slate-400 uppercase">
                                    Preview lain di course ini
                                </div>
                                {otherPreviews.length > 0 ? (
                                    <ul className="mt-3 space-y-1">
                                        {otherPreviews.map((p) => (
                                            <li key={p.id}>
                                                <Link
                                                    href={`/courses/${course.slug}/preview/${p.id}`}
                                                    className="group/p flex items-center gap-2.5 rounded-lg px-2 py-2 text-[13px] text-slate-300 transition hover:bg-slate-800"
                                                >
                                                    <PlayCircle className="size-4 shrink-0 text-emerald-500" />
                                                    <span className="flex-1 truncate group-hover/p:text-white">
                                                        {p.title}
                                                    </span>
                                                    {p.duration_minutes && (
                                                        <span className="text-[10.5px] text-slate-500">
                                                            {p.duration_minutes}m
                                                        </span>
                                                    )}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="mt-3 text-[12px] text-slate-500">
                                        Belum ada preview lain. Enroll untuk akses penuh.
                                    </p>
                                )}
                            </div>

                            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-4 text-[12px] text-slate-400">
                                <div className="flex items-start gap-2.5">
                                    <Lock className="mt-0.5 size-4 shrink-0 text-slate-500" />
                                    <p>
                                        Materi lain dikunci sampai Anda enroll course ini. Setelah
                                        enroll, semua lesson dapat diakses dari Dashboard.
                                    </p>
                                </div>
                            </div>
                        </aside>
                    </div>
                </main>
            </div>
        </>
    );
}

function LessonPlayer({ lesson }: { lesson: Lesson }) {
    if (lesson.youtube_video_id) {
        return (
            <div className="aspect-video">
                <iframe
                    src={`https://www.youtube.com/embed/${lesson.youtube_video_id}?rel=0`}
                    className="size-full"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        );
    }

    if (lesson.embed_url) {
        return (
            <div className="aspect-video">
                <iframe
                    src={lesson.embed_url}
                    className="size-full"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        );
    }

    if (lesson.video_path) {
        return (
            <video
                controls
                className="aspect-video w-full bg-black"
                src={lesson.video_path}
            />
        );
    }

    if (lesson.content) {
        return (
            <div className="prose prose-invert max-w-none p-6 text-slate-200 prose-headings:text-white">
                <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
            </div>
        );
    }

    return (
        <div className="grid aspect-video place-items-center bg-slate-900 text-center text-slate-500">
            <div>
                <PlayCircle className="mx-auto mb-3 size-12 text-slate-600" />
                <p className="text-[13.5px]">Konten preview belum tersedia.</p>
            </div>
        </div>
    );
}

CoursePreview.layout = null;
