import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Award,
    BookOpen,
    Bot,
    CheckCircle2,
    ChevronDown,
    Circle,
    Clock,
    ExternalLink,
    FileQuestion,
    FileText,
    Loader2,
    Lock,
    PlayCircle,
    Send,
    NotebookPen,
    Pencil,
    Sparkles,
    Star,
    Target,
    Trash2,
    User as UserIcon,
    Video,
    XCircle,
    Youtube,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Lesson = {
    id: number;
    title: string;
    type: string;
    content: string | null;
    video_path: string | null;
    embed_url: string | null;
    youtube_url: string | null;
    youtube_video_id: string | null;
    duration_minutes: number;
    is_preview: boolean;
    is_required: boolean;
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
    slug: string;
    duration_minutes: number;
    sections: Section[];
    category: { id: number; name: string } | null;
    instructor: { id: number; name: string } | null;
};

type Enrollment = {
    id: number;
    status: string;
    progress_percent: number;
    pre_test_status: string | null;
    post_test_status: string | null;
};

type LessonProgress = {
    status: string;
    progress_percent: number;
    completed_at: string | null;
};

type AssessmentSummary = {
    id: number;
    title: string;
    passing_score: number;
    status: string | null;
    is_required?: boolean;
};

type TutorMessage = {
    id: number;
    role: 'user' | 'assistant' | 'system';
    content: string;
    created_at: string | null;
};

type TutorThread = {
    id: number;
    title: string;
    last_message_at: string | null;
    messages: TutorMessage[];
};

type Props = {
    course: Course;
    enrollment: Enrollment;
    currentLesson: Lesson;
    progress: Record<number, LessonProgress>;
    prevLesson: { id: number; title: string } | null;
    nextLesson: { id: number; title: string } | null;
    assessments: {
        pre_test: AssessmentSummary | null;
        post_test: AssessmentSummary | null;
    };
    tutorThread: TutorThread | null;
    tutorAvailable: boolean;
    tutorQuota: TutorQuota;
    myReview: { id: number; rating: number; content: string | null } | null;
    lessonNotes: LessonNote[];
};

type LessonNote = {
    id: number;
    content: string;
    timestamp_seconds: number | null;
    created_at: string | null;
    updated_at: string | null;
};

type TutorQuota = {
    ok: boolean;
    reason: string | null;
    usage: { messages: number; tokens: number };
    limits: { daily_message_limit: number; daily_token_limit: number };
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

function lessonIcon(type: string) {
    return (
        {
            video: Video,
            youtube: Youtube,
            embed_link: PlayCircle,
            text: FileText,
            scorm: BookOpen,
            pdf: FileText,
        }[type] ?? PlayCircle
    );
}

export default function LearnShow({
    course,
    enrollment,
    currentLesson,
    progress,
    prevLesson,
    nextLesson,
    assessments,
    tutorThread,
    tutorAvailable,
    tutorQuota,
    myReview,
    lessonNotes,
}: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [tutorOpen, setTutorOpen] = useState(false);
    const [notesOpen, setNotesOpen] = useState(false);

    const isCompleted = progress[currentLesson.id]?.status === 'completed';
    const lessonsDone = enrollment.progress_percent >= 100;
    const postTestPending =
        assessments.post_test &&
        assessments.post_test.is_required &&
        enrollment.post_test_status !== 'passed';
    const showPostTestBanner = lessonsDone && postTestPending;
    const isCourseCompleted = enrollment.status === 'completed';

    const handleComplete = () => {
        router.post(
            `/lessons/${currentLesson.id}/complete`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    if (nextLesson) {
                        router.visit(`/learn/${course.slug}/lessons/${nextLesson.id}`);
                    }
                },
            },
        );
    };

    return (
        <>
            <Head title={`${currentLesson.title} — ${course.title}`} />

            <div className="-mx-5 lg:-mx-8">
                <div className="flex flex-col lg:flex-row">
                    {/* Sidebar - desktop persistent, mobile drawer */}
                    <PlayerSidebar
                        course={course}
                        enrollment={enrollment}
                        currentLesson={currentLesson}
                        progress={progress}
                        assessments={assessments}
                        open={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                    />

                    {/* Main content */}
                    <main className="min-w-0 flex-1">
                        <div className="border-b border-slate-200/70 bg-card">
                            <div className="flex items-center gap-3 px-5 py-3 lg:px-8">
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="grid size-9 place-items-center rounded-lg ring-1 ring-slate-200 hover:bg-slate-50 lg:hidden"
                                    aria-label="Toggle daftar lesson"
                                >
                                    <ChevronDown
                                        className={cn(
                                            'size-4 transition',
                                            sidebarOpen && 'rotate-180',
                                        )}
                                    />
                                </button>
                                <nav className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-[12.5px] text-slate-500">
                                    <Link
                                        href={`/courses/${course.slug}`}
                                        className="truncate hover:text-slate-700"
                                    >
                                        {course.title}
                                    </Link>
                                    <IconChevR size={12} className="shrink-0 text-slate-300" />
                                    <span className="truncate font-semibold text-slate-900">
                                        {currentLesson.title}
                                    </span>
                                </nav>
                            </div>
                        </div>

                        <div className="px-5 py-6 lg:px-8 lg:py-8">
                            <div className="mx-auto max-w-4xl space-y-6">
                                {showPostTestBanner && (
                                    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 text-white shadow-[0_4px_16px_rgba(234,88,12,0.25)]">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex items-start gap-3">
                                                <Target className="mt-0.5 size-5 shrink-0" />
                                                <div>
                                                    <div className="text-[15px] font-extrabold">
                                                        Tinggal selangkah lagi!
                                                    </div>
                                                    <div className="text-[12.5px] text-white/90">
                                                        Semua materi sudah selesai. Lulus post-test
                                                        (≥{assessments.post_test!.passing_score}%)
                                                        untuk menyelesaikan course dan dapat sertifikat.
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                asChild
                                                className="h-10 rounded-xl bg-white px-5 text-orange-700 hover:bg-slate-50"
                                            >
                                                <Link
                                                    href={`/learn/${course.slug}/assessments/${assessments.post_test!.id}`}
                                                >
                                                    <FileQuestion className="mr-1.5 size-4" />
                                                    Mulai Post-Test
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {isCourseCompleted && (
                                    <CourseReviewCard
                                        course={course}
                                        review={myReview}
                                    />
                                )}

                                {isCourseCompleted && (
                                    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white shadow-[0_4px_16px_rgba(16,185,129,0.25)]">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex items-start gap-3">
                                                <Award className="mt-0.5 size-5 shrink-0" />
                                                <div>
                                                    <div className="text-[15px] font-extrabold">
                                                        Course selesai
                                                    </div>
                                                    <div className="text-[12.5px] text-white/90">
                                                        Selamat! Sertifikat Anda sudah tersedia.
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                asChild
                                                className="h-10 rounded-xl bg-white px-5 text-emerald-700 hover:bg-slate-50"
                                            >
                                                <Link href="/my-certificates">
                                                    <Sparkles className="mr-1.5 size-4" />
                                                    Lihat Sertifikat
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <Badge className="border-transparent bg-brand-50 text-brand-700">
                                        Lesson · {formatDuration(currentLesson.duration_minutes)}
                                    </Badge>
                                    <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                                        {currentLesson.title}
                                    </h1>
                                </div>

                                <LessonContent lesson={currentLesson} />

                                <div className="flex flex-col-reverse items-stretch gap-3 border-t border-slate-200/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex gap-2">
                                        {prevLesson && (
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="rounded-xl"
                                            >
                                                <Link
                                                    href={`/learn/${course.slug}/lessons/${prevLesson.id}`}
                                                >
                                                    <ArrowLeft className="mr-1.5 size-4" />
                                                    <span className="hidden sm:inline">
                                                        Sebelumnya
                                                    </span>
                                                    <span className="sm:hidden">Prev</span>
                                                </Link>
                                            </Button>
                                        )}
                                        {nextLesson && (
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="rounded-xl"
                                            >
                                                <Link
                                                    href={`/learn/${course.slug}/lessons/${nextLesson.id}`}
                                                >
                                                    <span className="hidden sm:inline">
                                                        Selanjutnya
                                                    </span>
                                                    <span className="sm:hidden">Next</span>
                                                    <ArrowRight className="ml-1.5 size-4" />
                                                </Link>
                                            </Button>
                                        )}
                                    </div>

                                    {isCompleted ? (
                                        <Badge className="self-center border-transparent bg-emerald-100 px-3 py-1.5 text-emerald-700">
                                            <CheckCircle2 className="mr-1.5 size-3.5" />
                                            Lesson selesai
                                        </Badge>
                                    ) : (
                                        <Button
                                            onClick={handleComplete}
                                            className="rounded-xl bg-brand-600 hover:bg-brand-700"
                                        >
                                            <CheckCircle2 className="mr-1.5 size-4" />
                                            Tandai Selesai
                                            {nextLesson && ' & Lanjut'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* Floating action buttons */}
            <div className="fixed right-5 bottom-5 z-30 flex flex-col items-end gap-2.5">
                <button
                    type="button"
                    onClick={() => setNotesOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[13px] font-bold text-slate-800 shadow-[0_6px_18px_rgba(15,23,42,0.18)] ring-1 ring-slate-200 transition hover:scale-105 hover:bg-slate-50"
                    title="Catatan saya"
                >
                    <NotebookPen className="size-4 text-brand-600" />
                    <span className="hidden sm:inline">Catatan</span>
                    {lessonNotes.length > 0 && (
                        <span className="inline-grid size-5 place-items-center rounded-full bg-brand-600 text-[10.5px] text-white">
                            {lessonNotes.length}
                        </span>
                    )}
                </button>
                <button
                    type="button"
                    onClick={() => setTutorOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-brand-600 to-indigo-700 px-4 py-3 text-[13px] font-bold text-white shadow-[0_8px_24px_rgba(67,56,202,0.35)] ring-2 ring-white/40 transition hover:scale-105 hover:shadow-[0_12px_32px_rgba(67,56,202,0.45)]"
                    title="AI Tutor"
                >
                    <Bot className="size-5" />
                    <span className="hidden sm:inline">AI Tutor</span>
                    <Sparkles className="size-3.5 text-yellow-300" />
                </button>
            </div>

            <LessonTutorDrawer
                open={tutorOpen}
                onOpenChange={setTutorOpen}
                course={course}
                lesson={currentLesson}
                thread={tutorThread}
                available={tutorAvailable}
                quota={tutorQuota}
            />

            <LessonNotesDrawer
                open={notesOpen}
                onOpenChange={setNotesOpen}
                lesson={currentLesson}
                notes={lessonNotes}
            />
        </>
    );
}

function PlayerSidebar({
    course,
    enrollment,
    currentLesson,
    progress,
    assessments,
    open,
    onClose,
}: {
    course: Course;
    enrollment: Enrollment;
    currentLesson: Lesson;
    progress: Record<number, LessonProgress>;
    assessments: { pre_test: AssessmentSummary | null; post_test: AssessmentSummary | null };
    open: boolean;
    onClose: () => void;
}) {
    return (
        <>
            {open && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
                />
            )}

            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-40 w-[320px] flex-col bg-card transition-transform lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:w-[340px] lg:translate-x-0 lg:border-r lg:border-slate-200/70',
                    open ? 'flex translate-x-0' : '-translate-x-full',
                )}
            >
                <div className="border-b border-slate-100 p-5">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <div className="text-[10.5px] font-semibold tracking-widest text-slate-400 uppercase">
                                Daftar Materi
                            </div>
                            <h2 className="mt-1 line-clamp-2 text-[15px] font-bold text-slate-900">
                                {course.title}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700 lg:hidden"
                        >
                            <ChevronDown className="size-5" />
                        </button>
                    </div>

                    <div className="mt-4">
                        <div className="flex items-center justify-between text-[11.5px]">
                            <span className="font-semibold text-slate-700">
                                Progress {enrollment.progress_percent}%
                            </span>
                            <span className="text-slate-500">
                                <Clock className="mr-1 inline size-3" />
                                {formatDuration(course.duration_minutes)}
                            </span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all"
                                style={{ width: `${enrollment.progress_percent}%` }}
                            />
                        </div>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto p-3">
                    {(assessments.pre_test || assessments.post_test) && (
                        <div className="mb-3 rounded-xl bg-slate-50/80 p-3 ring-1 ring-slate-200/70">
                            <div className="mb-2 px-1 text-[10.5px] font-bold tracking-widest text-slate-500 uppercase">
                                Assessment
                            </div>
                            <ul className="space-y-1">
                                {assessments.pre_test && (
                                    <AssessmentSidebarItem
                                        kind="pre_test"
                                        courseSlug={course.slug}
                                        assessment={assessments.pre_test}
                                        onClose={onClose}
                                    />
                                )}
                                {assessments.post_test && (
                                    <AssessmentSidebarItem
                                        kind="post_test"
                                        courseSlug={course.slug}
                                        assessment={assessments.post_test}
                                        onClose={onClose}
                                        locked={
                                            enrollment.progress_percent < 100 &&
                                            assessments.post_test.is_required
                                        }
                                    />
                                )}
                            </ul>
                        </div>
                    )}

                    {course.sections.map((section, sIdx) => {
                        const lessons = section.lessons;
                        const completedInSection = lessons.filter(
                            (l) => progress[l.id]?.status === 'completed',
                        ).length;

                        return (
                            <details
                                key={section.id}
                                open
                                className="group/section mb-2 rounded-xl"
                            >
                                <summary className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 hover:bg-slate-50">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span className="grid size-6 shrink-0 place-items-center rounded-md bg-brand-50 text-[11px] font-bold text-brand-700">
                                            {sIdx + 1}
                                        </span>
                                        <div className="min-w-0">
                                            <div className="line-clamp-1 text-[13px] font-semibold text-slate-900">
                                                {section.title}
                                            </div>
                                            <div className="text-[10.5px] text-slate-500">
                                                {completedInSection}/{lessons.length} selesai
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronDown className="size-4 shrink-0 text-slate-400 transition group-open/section:rotate-180" />
                                </summary>
                                <ul className="mt-1 space-y-0.5 pl-3">
                                    {lessons.map((lesson) => {
                                        const Icon = lessonIcon(lesson.type);
                                        const isActive = lesson.id === currentLesson.id;
                                        const isCompleted =
                                            progress[lesson.id]?.status === 'completed';

                                        return (
                                            <li key={lesson.id}>
                                                <Link
                                                    href={`/learn/${course.slug}/lessons/${lesson.id}`}
                                                    onClick={onClose}
                                                    className={cn(
                                                        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] transition',
                                                        isActive
                                                            ? 'bg-brand-600 text-white shadow-sm'
                                                            : 'text-slate-700 hover:bg-slate-50',
                                                    )}
                                                >
                                                    <div className="shrink-0">
                                                        {isCompleted ? (
                                                            <CheckCircle2
                                                                className={cn(
                                                                    'size-4',
                                                                    isActive
                                                                        ? 'text-white'
                                                                        : 'text-emerald-500',
                                                                )}
                                                            />
                                                        ) : (
                                                            <Circle
                                                                className={cn(
                                                                    'size-4',
                                                                    isActive
                                                                        ? 'text-white/60'
                                                                        : 'text-slate-300',
                                                                )}
                                                            />
                                                        )}
                                                    </div>
                                                    <Icon
                                                        className={cn(
                                                            'size-3.5 shrink-0',
                                                            isActive ? 'text-white/80' : 'text-slate-400',
                                                        )}
                                                    />
                                                    <span className="flex-1 truncate font-medium">
                                                        {lesson.title}
                                                    </span>
                                                    {lesson.duration_minutes > 0 && (
                                                        <span
                                                            className={cn(
                                                                'shrink-0 text-[10px]',
                                                                isActive
                                                                    ? 'text-white/70'
                                                                    : 'text-slate-400',
                                                            )}
                                                        >
                                                            {lesson.duration_minutes}m
                                                        </span>
                                                    )}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </details>
                        );
                    })}
                </nav>

                <div className="border-t border-slate-100 p-3">
                    <Button asChild variant="outline" size="sm" className="w-full rounded-xl">
                        <Link href="/my-courses">
                            <ArrowLeft className="mr-1.5 size-4" />
                            Kembali ke Kelas Saya
                        </Link>
                    </Button>
                </div>
            </aside>
        </>
    );
}

function AssessmentSidebarItem({
    kind,
    courseSlug,
    assessment,
    onClose,
    locked = false,
}: {
    kind: 'pre_test' | 'post_test';
    courseSlug: string;
    assessment: AssessmentSummary;
    onClose: () => void;
    locked?: boolean;
}) {
    const label = kind === 'pre_test' ? 'Pre-Test' : 'Post-Test';
    const status = assessment.status;
    const passed = status === 'passed';
    const failed = status === 'failed';
    const tone = passed
        ? 'border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50'
        : failed
          ? 'border-rose-200 bg-rose-50/60 hover:bg-rose-50'
          : 'border-slate-200 bg-white hover:bg-slate-50';

    const StatusIcon = passed
        ? CheckCircle2
        : failed
          ? XCircle
          : locked
            ? Lock
            : FileQuestion;

    const iconTone = passed
        ? 'text-emerald-500'
        : failed
          ? 'text-rose-500'
          : locked
            ? 'text-slate-300'
            : 'text-brand-600';

    const content = (
        <>
            <div className="shrink-0">
                <StatusIcon className={cn('size-4', iconTone)} />
            </div>
            <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-bold text-slate-900">
                    {label}
                    {kind === 'post_test' && assessment.is_required && (
                        <span className="ml-1 text-[10px] font-bold text-rose-500">
                            · Wajib
                        </span>
                    )}
                </div>
                <div className="text-[10.5px] text-slate-500">
                    {passed
                        ? 'Lulus'
                        : failed
                          ? 'Belum lulus — coba lagi'
                          : locked
                            ? 'Selesaikan semua lesson dulu'
                            : `Lulus ≥ ${assessment.passing_score}%`}
                </div>
            </div>
        </>
    );

    if (locked) {
        return (
            <li>
                <div
                    className={cn(
                        'flex items-center gap-2.5 rounded-lg border px-2.5 py-2 opacity-70',
                        tone,
                    )}
                >
                    {content}
                </div>
            </li>
        );
    }

    return (
        <li>
            <Link
                href={`/learn/${courseSlug}/assessments/${assessment.id}`}
                onClick={onClose}
                className={cn(
                    'flex items-center gap-2.5 rounded-lg border px-2.5 py-2 transition',
                    tone,
                )}
            >
                {content}
            </Link>
        </li>
    );
}

function LessonContent({ lesson }: { lesson: Lesson }) {
    if (lesson.type === 'youtube' && lesson.youtube_video_id) {
        return (
            <div className="aspect-video overflow-hidden rounded-2xl bg-black ring-1 ring-slate-200">
                <iframe
                    src={`https://www.youtube.com/embed/${lesson.youtube_video_id}`}
                    title={lesson.title}
                    className="size-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        );
    }

    if (lesson.type === 'youtube' && lesson.youtube_url) {
        const id = extractYouTubeId(lesson.youtube_url);

        if (id) {
            return (
                <div className="aspect-video overflow-hidden rounded-2xl bg-black ring-1 ring-slate-200">
                    <iframe
                        src={`https://www.youtube.com/embed/${id}`}
                        title={lesson.title}
                        className="size-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            );
        }
    }

    if (lesson.type === 'embed_link' && lesson.embed_url) {
        return (
            <div className="aspect-video overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                <iframe
                    src={lesson.embed_url}
                    title={lesson.title}
                    className="size-full"
                    allowFullScreen
                />
            </div>
        );
    }

    if (lesson.type === 'video' && lesson.video_path) {
        const src = lesson.video_path.startsWith('http')
            ? lesson.video_path
            : `/storage/${lesson.video_path}`;

        return (
            <div className="overflow-hidden rounded-2xl bg-black ring-1 ring-slate-200">
                <video src={src} controls className="aspect-video w-full">
                    Browser Anda tidak mendukung pemutar video.
                </video>
            </div>
        );
    }

    if (lesson.type === 'text' && lesson.content) {
        return (
            <article className="prose prose-slate max-w-none rounded-2xl bg-card p-6 ring-1 ring-slate-200/70 sm:p-8">
                <div
                    className="whitespace-pre-wrap text-[14px] leading-relaxed text-slate-700"
                    dangerouslySetInnerHTML={{ __html: lesson.content }}
                />
            </article>
        );
    }

    if (lesson.type === 'scorm') {
        return (
            <div className="rounded-2xl bg-amber-50 p-6 ring-1 ring-amber-200">
                <div className="flex items-start gap-3">
                    <Lock className="size-5 shrink-0 text-amber-600" />
                    <div>
                        <h3 className="font-semibold text-amber-900">
                            SCORM Player belum tersedia
                        </h3>
                        <p className="mt-1 text-[13px] text-amber-700">
                            Runtime SCORM untuk memutar paket interaktif akan tersedia di fase
                            berikutnya. Untuk saat ini, lesson tipe SCORM bisa dibuka secara
                            terbatas.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl bg-slate-50 p-6 text-center ring-1 ring-slate-200">
            <PlayCircle className="mx-auto mb-3 size-8 text-slate-400" />
            <p className="text-sm font-semibold text-slate-900">
                Konten belum tersedia
            </p>
            <p className="mt-1 text-[12.5px] text-slate-500">
                Instruktur belum mengunggah materi untuk lesson ini.
            </p>
        </div>
    );
}

function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    ];

    for (const p of patterns) {
        const m = url.match(p);

        if (m) {
return m[1];
}
    }

    return null;
}

function LessonTutorDrawer({
    open,
    onOpenChange,
    course,
    lesson,
    thread,
    available,
    quota,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    course: Course;
    lesson: Lesson;
    thread: TutorThread | null;
    available: boolean;
    quota: TutorQuota;
}) {
    const composerDisabled = !quota.ok;
    const form = useForm<{
        content: string;
        thread_id: number | null;
        course_id: number;
        lesson_id: number;
    }>({
        content: '',
        thread_id: thread?.id ?? null,
        course_id: course.id,
        lesson_id: lesson.id,
    });

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        form.setData('thread_id', thread?.id ?? null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [thread?.id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [thread?.messages.length, form.processing, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.data.content.trim() || form.processing) return;
        form.post('/my-tutor/messages', {
            preserveScroll: true,
            preserveState: true,
            only: ['tutorThread'],
            onSuccess: () => form.reset('content'),
        });
    };

    const suggestions = [
        'Ringkas materi lesson ini dalam 3 poin',
        'Jelaskan istilah penting di lesson ini',
        'Buatkan contoh aplikasi praktisnya',
        'Buatkan 3 soal latihan',
    ];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex w-full max-w-md flex-col gap-0 p-0 sm:max-w-md"
            >
                <SheetHeader className="border-b border-slate-200/70 px-5 py-4">
                    <SheetTitle className="inline-flex items-center gap-2 text-[15px] font-extrabold">
                        <div className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-700 text-white">
                            <Bot className="size-4" />
                        </div>
                        AI Tutor
                        <Sparkles className="size-3.5 text-amber-400" />
                    </SheetTitle>
                    <SheetDescription className="text-left text-[11.5px]">
                        Konteks:{' '}
                        <span className="font-semibold text-slate-700">{course.title}</span> ·{' '}
                        <span className="font-semibold text-slate-700">{lesson.title}</span>
                    </SheetDescription>
                </SheetHeader>

                {!available ? (
                    <div className="flex-1 p-5">
                        <div className="rounded-xl bg-amber-50 p-4 text-[12.5px] text-amber-900 ring-1 ring-amber-200">
                            AI Tutor belum aktif. Admin perlu set{' '}
                            <code className="font-mono">OPENAI_API_KEY</code> di .env.
                        </div>
                    </div>
                ) : (
                    <>
                        {!quota.ok && quota.reason && (
                            <div className="m-3 rounded-xl bg-rose-50 p-3 text-[11.5px] text-rose-900 ring-1 ring-rose-200">
                                <strong className="font-bold">Kuota habis.</strong> {quota.reason} Coba lagi besok.
                            </div>
                        )}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto bg-slate-50/40 px-4 py-4"
                        >
                            {!thread || thread.messages.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center text-center">
                                    <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-lg">
                                        <Sparkles className="size-5" />
                                    </div>
                                    <h3 className="mt-4 text-[14px] font-extrabold text-slate-900">
                                        Tanya apa saja
                                    </h3>
                                    <p className="mt-1 text-[12px] text-slate-600">
                                        Saya tahu konteks lesson yang sedang Anda buka.
                                    </p>
                                    <div className="mt-4 grid w-full grid-cols-1 gap-1.5">
                                        {suggestions.map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-[11.5px] text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                                                onClick={() => form.setData('content', s)}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {thread.messages.map((m) => (
                                        <DrawerMessage key={m.id} message={m} />
                                    ))}
                                    {form.processing && (
                                        <DrawerMessage
                                            message={{
                                                id: -1,
                                                role: 'assistant',
                                                content: '',
                                                created_at: null,
                                            }}
                                            isLoading
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="border-t border-slate-200/70 bg-white p-3"
                        >
                            <div className="flex items-end gap-2">
                                <Textarea
                                    value={form.data.content}
                                    onChange={(e) => form.setData('content', e.target.value)}
                                    placeholder={
                                        composerDisabled
                                            ? 'Kuota harian habis. Coba lagi besok.'
                                            : 'Tanyakan sesuatu...'
                                    }
                                    rows={2}
                                    disabled={composerDisabled || form.processing}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                    }}
                                    className="resize-none"
                                />
                                <Button
                                    type="submit"
                                    disabled={composerDisabled || form.processing || !form.data.content.trim()}
                                    className="h-11 rounded-xl bg-brand-600 hover:bg-brand-700"
                                >
                                    {form.processing ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <Send className="size-4" />
                                    )}
                                </Button>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[10.5px] text-slate-500">
                                <span>
                                    {quota.usage.messages}/{quota.limits.daily_message_limit} pesan hari ini
                                </span>
                                <Link
                                    href="/my-tutor"
                                    className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700"
                                >
                                    Semua percakapan
                                    <ExternalLink className="size-3" />
                                </Link>
                            </div>
                        </form>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}

function DrawerMessage({
    message,
    isLoading = false,
}: {
    message: TutorMessage;
    isLoading?: boolean;
}) {
    const isUser = message.role === 'user';
    return (
        <div className={cn('flex gap-2', isUser && 'flex-row-reverse')}>
            <div
                className={cn(
                    'grid size-7 shrink-0 place-items-center rounded-full',
                    isUser
                        ? 'bg-brand-600 text-white'
                        : 'bg-gradient-to-br from-indigo-500 to-brand-700 text-white',
                )}
            >
                {isUser ? <UserIcon className="size-3.5" /> : <Bot className="size-3.5" />}
            </div>
            <div
                className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2 text-[12.5px] leading-relaxed shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1',
                    isUser
                        ? 'bg-brand-600 text-white ring-brand-700/30'
                        : 'bg-white text-slate-800 ring-slate-200/70',
                )}
            >
                {isLoading ? (
                    <div className="flex items-center gap-1 py-0.5">
                        <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-slate-400" />
                    </div>
                ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                )}
            </div>
        </div>
    );
}

function CourseReviewCard({
    course,
    review,
}: {
    course: Course;
    review: { id: number; rating: number; content: string | null } | null;
}) {
    const form = useForm<{ rating: number; content: string }>({
        rating: review?.rating ?? 0,
        content: review?.content ?? '',
    });
    const [editing, setEditing] = useState(!review);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (form.data.rating < 1 || form.processing) return;
        form.post(`/courses/${course.slug}/reviews`, {
            preserveScroll: true,
            onSuccess: () => setEditing(false),
        });
    };

    const handleDelete = () => {
        if (!review || !confirm('Hapus ulasan Anda?')) return;
        router.delete(`/reviews/${review.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                form.setData({ rating: 0, content: '' });
                setEditing(true);
            },
        });
    };

    if (review && !editing) {
        return (
            <div className="overflow-hidden rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/70">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="inline-flex items-center gap-2">
                            <span className="text-[13px] font-extrabold text-slate-900">
                                Ulasan Anda
                            </span>
                            <StarDisplay rating={review.rating} />
                        </div>
                        {review.content && (
                            <p className="mt-2 text-[12.5px] whitespace-pre-wrap text-slate-700">
                                {review.content}
                            </p>
                        )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                        <Button
                            size="sm"
                            className="h-8 rounded-xl bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                            onClick={() => setEditing(true)}
                        >
                            <Pencil className="mr-1 size-3.5" />
                            Edit
                        </Button>
                        <Button
                            size="sm"
                            className="h-8 rounded-xl bg-rose-600 text-white shadow-sm hover:bg-rose-700"
                            onClick={handleDelete}
                            title="Hapus ulasan"
                        >
                            <Trash2 className="mr-1 size-3.5" />
                            Hapus
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/70"
        >
            <div className="flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600">
                    <Star className="size-5 fill-current" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-extrabold text-slate-900">
                        Bagaimana pengalaman Anda?
                    </div>
                    <p className="mt-1 text-[12px] text-slate-500">
                        Bagikan ulasan untuk membantu peserta lain.
                    </p>
                </div>
            </div>

            <div className="mt-4">
                <StarPicker
                    value={form.data.rating}
                    onChange={(v) => form.setData('rating', v)}
                />
                {form.errors.rating && (
                    <p className="mt-1 text-[11.5px] text-rose-600">{form.errors.rating}</p>
                )}
            </div>

            <Textarea
                value={form.data.content}
                onChange={(e) => form.setData('content', e.target.value)}
                placeholder="Tulis ulasan singkat (opsional)..."
                rows={3}
                className="mt-3 resize-none"
                maxLength={2000}
            />

            <div className="mt-3 flex items-center justify-end gap-2">
                {review && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            form.setData({
                                rating: review.rating,
                                content: review.content ?? '',
                            });
                            setEditing(false);
                        }}
                    >
                        Batal
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={form.data.rating < 1 || form.processing}
                    className="h-9 rounded-xl bg-brand-600 hover:bg-brand-700"
                >
                    {form.processing && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
                    {review ? 'Perbarui Ulasan' : 'Kirim Ulasan'}
                </Button>
            </div>
        </form>
    );
}

function StarPicker({
    value,
    onChange,
}: {
    value: number;
    onChange: (v: number) => void;
}) {
    const [hover, setHover] = useState(0);
    const active = hover || value;
    return (
        <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => onChange(n)}
                    className="rounded p-0.5 transition hover:scale-110"
                    aria-label={`${n} bintang`}
                >
                    <Star
                        className={cn(
                            'size-7 transition',
                            n <= active
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-transparent text-slate-300',
                        )}
                    />
                </button>
            ))}
            <span className="ml-2 text-[12px] font-semibold text-slate-600">
                {active > 0 ? `${active}/5` : 'Pilih rating'}
            </span>
        </div>
    );
}

function StarDisplay({ rating }: { rating: number }) {
    return (
        <div className="inline-flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
                <Star
                    key={n}
                    className={cn(
                        'size-3.5',
                        n <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-transparent text-slate-300',
                    )}
                />
            ))}
        </div>
    );
}

function formatTimestamp(seconds: number | null): string | null {
    if (seconds === null || seconds < 0) return null;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

function LessonNotesDrawer({
    open,
    onOpenChange,
    lesson,
    notes,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    lesson: Lesson;
    notes: LessonNote[];
}) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const form = useForm<{ content: string; timestamp_seconds: number | null }>({
        content: '',
        timestamp_seconds: null,
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.data.content.trim() || form.processing) return;
        form.post(`/lessons/${lesson.id}/notes`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => form.reset('content', 'timestamp_seconds'),
        });
    };

    const handleDelete = (id: number) => {
        if (!confirm('Hapus catatan ini?')) return;
        router.delete(`/notes/${id}`, { preserveScroll: true, preserveState: true });
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex w-full max-w-md flex-col gap-0 p-0 sm:max-w-md"
            >
                <SheetHeader className="border-b border-slate-200/70 px-5 py-4">
                    <SheetTitle className="inline-flex items-center gap-2 text-[15px] font-extrabold">
                        <div className="grid size-8 place-items-center rounded-xl bg-brand-100 text-brand-700">
                            <NotebookPen className="size-4" />
                        </div>
                        Catatan Saya
                    </SheetTitle>
                    <SheetDescription className="text-left text-[11.5px]">
                        Pelajaran:{' '}
                        <span className="font-semibold text-slate-700">{lesson.title}</span>
                    </SheetDescription>
                </SheetHeader>

                <form
                    onSubmit={handleCreate}
                    className="border-b border-slate-200/70 bg-slate-50/40 p-4"
                >
                    <Textarea
                        value={form.data.content}
                        onChange={(e) => form.setData('content', e.target.value)}
                        placeholder="Tulis catatan Anda..."
                        rows={3}
                        maxLength={5000}
                        className="resize-none bg-white"
                    />
                    {form.errors.content && (
                        <p className="mt-1 text-[11.5px] text-rose-600">{form.errors.content}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10.5px] text-slate-500">
                            {form.data.content.length}/5000
                        </span>
                        <Button
                            type="submit"
                            disabled={!form.data.content.trim() || form.processing}
                            size="sm"
                            className="h-8 rounded-lg bg-brand-600 hover:bg-brand-700"
                        >
                            {form.processing ? (
                                <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                                'Simpan Catatan'
                            )}
                        </Button>
                    </div>
                </form>

                <div className="flex-1 overflow-y-auto p-4">
                    {notes.length === 0 ? (
                        <div className="grid h-full place-items-center text-center">
                            <div>
                                <NotebookPen className="mx-auto size-8 text-slate-300" />
                                <p className="mt-3 text-[12.5px] font-semibold text-slate-700">
                                    Belum ada catatan
                                </p>
                                <p className="mt-1 text-[11.5px] text-slate-500">
                                    Tulis catatan pertama Anda di atas.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {notes.map((n) => (
                                <NoteItem
                                    key={n.id}
                                    note={n}
                                    editing={editingId === n.id}
                                    onEdit={() => setEditingId(n.id)}
                                    onCancelEdit={() => setEditingId(null)}
                                    onDelete={() => handleDelete(n.id)}
                                />
                            ))}
                        </ul>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

function NoteItem({
    note,
    editing,
    onEdit,
    onCancelEdit,
    onDelete,
}: {
    note: LessonNote;
    editing: boolean;
    onEdit: () => void;
    onCancelEdit: () => void;
    onDelete: () => void;
}) {
    const form = useForm<{ content: string }>({ content: note.content });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.data.content.trim() || form.processing) return;
        form.patch(`/notes/${note.id}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => onCancelEdit(),
        });
    };

    const ts = formatTimestamp(note.timestamp_seconds);

    return (
        <li className="rounded-xl bg-white p-3 ring-1 ring-slate-200/70">
            {editing ? (
                <form onSubmit={handleSubmit}>
                    <Textarea
                        value={form.data.content}
                        onChange={(e) => form.setData('content', e.target.value)}
                        rows={3}
                        className="resize-none"
                        maxLength={5000}
                    />
                    <div className="mt-2 flex items-center justify-end gap-1.5">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onCancelEdit}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={!form.data.content.trim() || form.processing}
                            className="h-8 rounded-lg bg-brand-600 hover:bg-brand-700"
                        >
                            {form.processing ? (
                                <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                                'Simpan'
                            )}
                        </Button>
                    </div>
                </form>
            ) : (
                <>
                    {ts && (
                        <div className="mb-1 inline-flex items-center gap-1 rounded-md bg-brand-50 px-1.5 py-0.5 font-mono text-[10.5px] font-bold text-brand-700">
                            <Clock className="size-3" />
                            {ts}
                        </div>
                    )}
                    <p className="text-[12.5px] leading-relaxed whitespace-pre-wrap text-slate-800">
                        {note.content}
                    </p>
                    <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                        <span className="text-[10.5px] text-slate-400">
                            {note.created_at
                                ? new Date(note.created_at).toLocaleString('id-ID', {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                  })
                                : ''}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <Button
                                size="sm"
                                className="h-7 rounded-xl bg-emerald-600 px-2 text-[11.5px] text-white shadow-sm hover:bg-emerald-700"
                                onClick={onEdit}
                                title="Edit"
                            >
                                <Pencil className="mr-1 size-3.5" />
                                Edit
                            </Button>
                            <Button
                                size="sm"
                                className="h-7 rounded-xl bg-rose-600 px-2 text-[11.5px] text-white shadow-sm hover:bg-rose-700"
                                onClick={onDelete}
                                title="Hapus"
                            >
                                <Trash2 className="mr-1 size-3.5" />
                                Hapus
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </li>
    );
}
