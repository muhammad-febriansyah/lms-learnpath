import { Head, Link, router, useForm } from '@inertiajs/react';
import { AlertCircle, ChevronRight, Clock, Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
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
        { pre_test: 'Pre-Test', post_test: 'Post-Test', quiz: 'Quiz' }[type] ?? type
    );
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

    useEffect(() => {
        if (timeUp && !processing) {
            handleSubmit();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeUp]);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        post(
            `/learn/${course.slug}/assessments/${assessment.id}/attempts/${attempt.id}/submit`,
            { preserveScroll: false },
        );
    };

    const formatElapsed = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <>
            <Head title={`Kerjakan: ${assessment.title}`} />
            <div className="mx-auto max-w-3xl space-y-5">
                <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                    <Link href={`/learn/${course.slug}`} className="hover:text-slate-700">
                        {course.title}
                    </Link>
                    <ChevronRight className="size-3 text-slate-300" />
                    <span className="font-semibold text-slate-900">
                        {typeLabel(assessment.type)}
                    </span>
                </nav>

                <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-4 shadow-[0_2px_8px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/70">
                    <div className="min-w-0">
                        <div className="text-[11px] font-bold tracking-wider text-brand-600 uppercase">
                            {typeLabel(assessment.type)}
                        </div>
                        <div className="truncate text-[14.5px] font-extrabold text-slate-900">
                            {assessment.title}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-[10.5px] tracking-wider text-slate-500 uppercase">
                                Terjawab
                            </div>
                            <div className="text-[15px] font-extrabold text-slate-900 tabular-nums">
                                {answeredCount} / {questions.length}
                            </div>
                        </div>
                        {remainingSec !== null ? (
                            <div
                                className={cn(
                                    'rounded-xl px-3 py-2 text-right',
                                    remainingSec < 60
                                        ? 'bg-rose-50 text-rose-700'
                                        : 'bg-slate-50 text-slate-700',
                                )}
                            >
                                <div className="text-[10.5px] tracking-wider uppercase">
                                    Sisa Waktu
                                </div>
                                <div className="inline-flex items-center gap-1 text-[15px] font-extrabold tabular-nums">
                                    <Clock className="size-4" />
                                    {formatElapsed(remainingSec)}
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-xl bg-slate-50 px-3 py-2 text-right text-slate-700">
                                <div className="text-[10.5px] tracking-wider uppercase">
                                    Berjalan
                                </div>
                                <div className="inline-flex items-center gap-1 text-[15px] font-extrabold tabular-nums">
                                    <Clock className="size-4" />
                                    {formatElapsed(elapsedSec)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {questions.map((q, idx) => (
                        <div
                            key={q.id}
                            className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70"
                        >
                            <div className="flex items-start gap-3">
                                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 text-[12.5px] font-extrabold text-brand-700">
                                    {idx + 1}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[14.5px] leading-snug font-semibold text-slate-900">
                                        {q.question_text}
                                    </p>
                                    <p className="mt-1 text-[11px] text-slate-500">
                                        {q.points} poin
                                    </p>

                                    <div className="mt-4 space-y-2">
                                        {q.options.map((opt) => {
                                            const selected = data.answers[q.id] === opt.id;
                                            return (
                                                <label
                                                    key={opt.id}
                                                    className={cn(
                                                        'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition',
                                                        selected
                                                            ? 'border-brand-500 bg-brand-50/60 ring-1 ring-brand-200'
                                                            : 'border-slate-200 hover:border-slate-300',
                                                    )}
                                                >
                                                    <input
                                                        type="radio"
                                                        className="mt-1 size-4 accent-brand-600"
                                                        name={`q-${q.id}`}
                                                        checked={selected}
                                                        onChange={() =>
                                                            setData('answers', {
                                                                ...data.answers,
                                                                [q.id]: opt.id,
                                                            })
                                                        }
                                                    />
                                                    <span className="text-[13.5px] text-slate-800">
                                                        {opt.option_text}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {answeredCount < questions.length && (
                        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[12.5px] text-amber-900">
                            <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />
                            <span>
                                Anda belum menjawab {questions.length - answeredCount} soal.
                                Soal yang tidak terjawab akan dihitung salah.
                            </span>
                        </div>
                    )}

                    <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-4 shadow-[0_-2px_12px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/70">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                router.visit(
                                    `/learn/${course.slug}/assessments/${assessment.id}`,
                                )
                            }
                        >
                            Simpan & Keluar
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            size="lg"
                            className="h-11 rounded-xl bg-brand-600 hover:bg-brand-700"
                        >
                            <Send className="mr-1.5 size-4" />
                            {processing ? 'Mengirim...' : 'Kirim Jawaban'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
