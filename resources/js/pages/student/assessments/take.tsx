import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    LogOut,
    Send,
    ShieldCheck,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type Question = {
    id: number;
    question_text: string;
    points: number;
    options: { id: number; option_text: string }[];
};

type Props = {
    course: { id: number; title: string; slug: string };
    assessment: {
        id: number;
        title: string;
        type: string;
        description: string | null;
        passing_score: number;
        duration_minutes: number | null;
    };
    attempt: { id: number; started_at: string | null };
    questions: Question[];
};

function typeLabel(type: string): string {
    return (
        { pre_test: 'Pre-Test', post_test: 'Post-Test', quiz: 'Quiz' }[type] ??
        type
    );
}

function formatClock(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function AssessmentTake({
    course,
    assessment,
    attempt,
    questions,
}: Props) {
    const { data, setData, post, processing } = useForm<{
        answers: Record<number, number | null>;
    }>({
        answers: questions.reduce<Record<number, number | null>>((acc, q) => {
            acc[q.id] = null;
            return acc;
        }, {}),
    });

    const answeredCount = useMemo(
        () => Object.values(data.answers).filter((v) => v !== null).length,
        [data.answers],
    );
    const totalQuestions = questions.length;
    const progressPct = totalQuestions
        ? Math.round((answeredCount / totalQuestions) * 100)
        : 0;

    // Timer
    const [elapsedSec, setElapsedSec] = useState(0);
    useEffect(() => {
        if (!attempt.started_at) return;
        const startedAt = new Date(attempt.started_at).getTime();
        const tick = () =>
            setElapsedSec(Math.floor((Date.now() - startedAt) / 1000));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [attempt.started_at]);

    const totalMinutes = assessment.duration_minutes;
    const remainingSec = totalMinutes
        ? Math.max(0, totalMinutes * 60 - elapsedSec)
        : null;
    const timeUp = remainingSec !== null && remainingSec === 0;

    const handleSubmit = useCallback(() => {
        post(
            `/learn/${course.slug}/assessments/${assessment.id}/attempts/${attempt.id}/submit`,
            { preserveScroll: false },
        );
    }, [assessment.id, attempt.id, course.slug, post]);

    useEffect(() => {
        if (timeUp && !processing) {
            handleSubmit();
        }
    }, [timeUp, processing, handleSubmit]);

    // Navigator + scroll
    const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort(
                        (a, b) =>
                            (b.intersectionRatio ?? 0) -
                            (a.intersectionRatio ?? 0),
                    );
                if (visible.length === 0) return;
                const idx = Number(
                    (visible[0].target as HTMLElement).dataset.qIdx,
                );
                if (!Number.isNaN(idx)) setActiveIndex(idx);
            },
            { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] },
        );
        Object.values(questionRefs.current).forEach((el) => {
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [questions.length]);

    const scrollToQuestion = (idx: number) => {
        const q = questions[idx];
        if (!q) return;
        const el = questionRefs.current[q.id];
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Confirm submit
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [exitOpen, setExitOpen] = useState(false);
    const unanswered = totalQuestions - answeredCount;

    const onClickSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (unanswered > 0) {
            setConfirmOpen(true);
            return;
        }
        handleSubmit();
    };

    // Warn on page leave
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (processing || answeredCount === 0) return;
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [answeredCount, processing]);

    // Timer tone
    const timerTone =
        remainingSec !== null
            ? remainingSec < 60
                ? 'bg-rose-500 text-white ring-rose-300/40'
                : remainingSec < 300
                  ? 'bg-amber-500 text-white ring-amber-300/40'
                  : 'bg-white/10 text-white ring-white/15'
            : 'bg-white/10 text-white ring-white/15';

    return (
        <>
            <Head title={`Kerjakan: ${assessment.title}`} />

            <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-neutral-950">
                {/* Top exam bar */}
                <header className="sticky top-0 z-30 bg-gradient-to-r from-slate-900 via-slate-900 to-brand-950 text-white shadow-[0_4px_24px_-12px_rgba(15,23,42,0.5)] dark:from-neutral-950 dark:via-neutral-950 dark:to-brand-950">
                    <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-4 py-3 lg:gap-5 lg:px-6">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-white ring-1 ring-white/15">
                                <AppLogoIcon className="size-4" />
                            </span>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 text-[10.5px] font-bold tracking-[0.18em] text-white/60 uppercase">
                                    <ShieldCheck className="size-3" />
                                    Mode Ujian · {typeLabel(assessment.type)}
                                </div>
                                <div className="truncate text-[14px] font-extrabold sm:text-[15px]">
                                    {assessment.title}
                                </div>
                                <div className="hidden truncate text-[11px] text-white/50 sm:block">
                                    {course.title}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* Answered chip */}
                            <div className="rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/15 backdrop-blur">
                                <div className="text-[9.5px] font-semibold tracking-wider text-white/60 uppercase">
                                    Terjawab
                                </div>
                                <div className="text-[14px] font-extrabold tabular-nums">
                                    {answeredCount}/{totalQuestions}
                                </div>
                            </div>
                            {/* Timer chip */}
                            <div
                                className={cn(
                                    'rounded-xl px-3 py-2 ring-1 ring-inset backdrop-blur transition-colors',
                                    timerTone,
                                )}
                            >
                                <div className="text-[9.5px] font-semibold tracking-wider uppercase opacity-80">
                                    {remainingSec !== null
                                        ? 'Sisa Waktu'
                                        : 'Berjalan'}
                                </div>
                                <div className="inline-flex items-center gap-1 text-[14px] font-extrabold tabular-nums">
                                    <Clock className="size-3.5" />
                                    {formatClock(
                                        remainingSec !== null
                                            ? remainingSec
                                            : elapsedSec,
                                    )}
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setExitOpen(true)}
                                className="h-10 rounded-xl border-white/15 bg-white/10 text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white/20 hover:text-white"
                            >
                                <LogOut className="size-3.5" />
                                <span className="hidden sm:inline">Keluar</span>
                            </Button>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1 bg-white/10">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 transition-[width] duration-500"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                </header>

                {/* Body grid */}
                <div className="mx-auto flex w-full max-w-[1600px] flex-1 gap-6 px-4 py-6 lg:px-6">
                    {/* Main column */}
                    <form
                        onSubmit={onClickSubmit}
                        className="min-w-0 flex-1 space-y-4"
                    >
                        {questions.map((q, idx) => {
                            const selectedId = data.answers[q.id];
                            const isActive = idx === activeIndex;
                            return (
                                <div
                                    key={q.id}
                                    ref={(el) => {
                                        questionRefs.current[q.id] = el;
                                    }}
                                    data-q-idx={idx}
                                    className={cn(
                                        'scroll-mt-32 rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 transition sm:p-6 dark:bg-neutral-900',
                                        isActive
                                            ? 'ring-2 ring-brand-300 dark:ring-brand-500/40'
                                            : 'ring-slate-200/70 dark:ring-neutral-800',
                                    )}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-50 text-[13px] font-extrabold text-brand-700 ring-1 ring-brand-100 dark:from-brand-500/15 dark:to-brand-500/15 dark:text-brand-200 dark:ring-brand-500/20">
                                            {idx + 1}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-semibold tracking-wide text-slate-600 uppercase dark:bg-neutral-800 dark:text-neutral-300">
                                                    Soal {idx + 1} dari{' '}
                                                    {totalQuestions}
                                                </span>
                                                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                                                    {q.points} poin
                                                </span>
                                                {selectedId !== null && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                                                        <CheckCircle2 className="size-3" />
                                                        Sudah dijawab
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-3 text-[15px] leading-relaxed font-bold text-slate-900 dark:text-neutral-100">
                                                {q.question_text}
                                            </p>

                                            <div className="mt-5 space-y-2.5">
                                                {q.options.map((opt, oi) => {
                                                    const selected =
                                                        selectedId === opt.id;
                                                    return (
                                                        <label
                                                            key={opt.id}
                                                            className={cn(
                                                                'flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition',
                                                                selected
                                                                    ? 'border-brand-500 bg-brand-50/70 ring-1 ring-brand-300 dark:bg-brand-500/15'
                                                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/60',
                                                            )}
                                                        >
                                                            <span
                                                                className={cn(
                                                                    'mt-0.5 grid size-6 shrink-0 place-items-center rounded-md text-[11px] font-extrabold transition',
                                                                    selected
                                                                        ? 'bg-brand-600 text-white'
                                                                        : 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300',
                                                                )}
                                                            >
                                                                {selected ? (
                                                                    <Check className="size-3.5" />
                                                                ) : (
                                                                    String.fromCharCode(
                                                                        65 + oi,
                                                                    )
                                                                )}
                                                            </span>
                                                            <input
                                                                type="radio"
                                                                className="sr-only"
                                                                name={`q-${q.id}`}
                                                                checked={
                                                                    selected
                                                                }
                                                                onChange={() =>
                                                                    setData(
                                                                        'answers',
                                                                        {
                                                                            ...data.answers,
                                                                            [q.id]: opt.id,
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                            <span
                                                                className={cn(
                                                                    'flex-1 text-[13.5px] leading-relaxed',
                                                                    selected
                                                                        ? 'font-semibold text-brand-900 dark:text-brand-100'
                                                                        : 'text-slate-800 dark:text-neutral-200',
                                                                )}
                                                            >
                                                                {opt.option_text}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>

                                            {/* Per-question quick nav */}
                                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11.5px] text-slate-500 dark:border-neutral-800 dark:text-neutral-400">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        scrollToQuestion(
                                                            idx - 1,
                                                        )
                                                    }
                                                    disabled={idx === 0}
                                                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-neutral-800"
                                                >
                                                    <ChevronLeft className="size-3.5" />
                                                    Sebelumnya
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        scrollToQuestion(
                                                            idx + 1,
                                                        )
                                                    }
                                                    disabled={
                                                        idx ===
                                                        totalQuestions - 1
                                                    }
                                                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-neutral-800"
                                                >
                                                    Berikutnya
                                                    <ChevronRight className="size-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {unanswered > 0 && (
                            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[12.5px] text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                                <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-300" />
                                <span>
                                    Anda belum menjawab{' '}
                                    <strong>{unanswered}</strong> soal. Soal
                                    yang tidak terjawab akan dihitung salah.
                                </span>
                            </div>
                        )}

                        <button type="submit" className="sr-only">
                            Kirim
                        </button>
                    </form>

                    {/* Right rail — question navigator */}
                    <aside className="hidden w-[280px] shrink-0 lg:block">
                        <div className="sticky top-[88px] space-y-4">
                            <div className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 dark:bg-neutral-900 dark:ring-neutral-800">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[12px] font-bold tracking-wider text-slate-700 uppercase dark:text-neutral-200">
                                        Navigasi Soal
                                    </h3>
                                    <span className="text-[11px] text-slate-500 tabular-nums dark:text-neutral-400">
                                        {answeredCount}/{totalQuestions}
                                    </span>
                                </div>
                                <div className="mt-3 grid grid-cols-5 gap-1.5">
                                    {questions.map((q, idx) => {
                                        const answered =
                                            data.answers[q.id] !== null;
                                        const isActive = idx === activeIndex;
                                        return (
                                            <button
                                                key={q.id}
                                                type="button"
                                                onClick={() =>
                                                    scrollToQuestion(idx)
                                                }
                                                className={cn(
                                                    'grid size-9 place-items-center rounded-lg text-[11.5px] font-bold tabular-nums transition',
                                                    isActive
                                                        ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-200 dark:ring-brand-500/40'
                                                        : answered
                                                          ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-500/30'
                                                          : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700',
                                                )}
                                                title={`Soal ${idx + 1}${answered ? ' (terjawab)' : ''}`}
                                            >
                                                {idx + 1}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-4 space-y-1.5 text-[11px] text-slate-500 dark:text-neutral-400">
                                    <div className="flex items-center gap-2">
                                        <span className="size-3 rounded-md bg-emerald-200 ring-1 ring-emerald-300 dark:bg-emerald-500/30 dark:ring-emerald-500/50" />
                                        Terjawab
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="size-3 rounded-md bg-slate-200 ring-1 ring-slate-300 dark:bg-neutral-700 dark:ring-neutral-600" />
                                        Belum dijawab
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="size-3 rounded-md bg-brand-600" />
                                        Soal aktif
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 dark:bg-neutral-900 dark:ring-neutral-800">
                                <Button
                                    type="button"
                                    onClick={() => onClickSubmit()}
                                    disabled={processing}
                                    size="lg"
                                    className="h-11 w-full rounded-xl bg-brand-600 text-[13px] font-bold hover:bg-brand-700"
                                >
                                    <Send className="mr-1.5 size-4" />
                                    {processing
                                        ? 'Mengirim...'
                                        : 'Kirim Jawaban'}
                                </Button>
                                <p className="mt-2 text-center text-[10.5px] text-slate-500 dark:text-neutral-400">
                                    Setelah dikirim, jawaban tidak bisa diubah.
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Mobile sticky action bar */}
                <div className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden dark:border-neutral-800 dark:bg-neutral-900/95">
                    <div className="mx-auto flex max-w-[1600px] items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11 flex-1 rounded-xl"
                            onClick={() => setExitOpen(true)}
                        >
                            <ArrowLeft className="mr-1.5 size-4" />
                            Keluar
                        </Button>
                        <Button
                            type="button"
                            onClick={() => onClickSubmit()}
                            disabled={processing}
                            className="h-11 flex-[2] rounded-xl bg-brand-600 hover:bg-brand-700"
                        >
                            <Send className="mr-1.5 size-4" />
                            {processing ? 'Mengirim...' : 'Kirim Jawaban'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Submit confirm */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="inline-flex items-center gap-2">
                            <AlertTriangle className="size-5 text-amber-500" />
                            Kirim jawaban sekarang?
                        </DialogTitle>
                        <DialogDescription>
                            Masih ada <strong>{unanswered}</strong> soal yang
                            belum dijawab. Soal yang tidak terjawab akan
                            dihitung salah. Lanjutkan?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            className="bg-brand-600 hover:bg-brand-700"
                            disabled={processing}
                            onClick={() => {
                                setConfirmOpen(false);
                                handleSubmit();
                            }}
                        >
                            <Send className="mr-1.5 size-4" />
                            Tetap Kirim
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Exit confirm */}
            <Dialog open={exitOpen} onOpenChange={setExitOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Keluar dari ujian?</DialogTitle>
                        <DialogDescription>
                            Progress jawaban Anda tidak akan disimpan dan attempt
                            ini tetap dihitung. Yakin ingin keluar?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setExitOpen(false)}
                        >
                            Lanjut Mengerjakan
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                router.visit(
                                    `/learn/${course.slug}/assessments/${assessment.id}`,
                                )
                            }
                        >
                            <LogOut className="mr-1.5 size-4" />
                            Keluar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

AssessmentTake.layout = null;
