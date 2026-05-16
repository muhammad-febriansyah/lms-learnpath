import { Head, Link } from '@inertiajs/react';
import {
    Award,
    CheckCircle2,
    ChevronRight,
    RotateCcw,
    Target,
    XCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type QuestionResult = {
    id: number;
    question_text: string;
    points: number;
    options: { id: number; option_text: string; is_correct: boolean }[];
    selected_option_id: number | null;
    is_correct: boolean;
    point_earned: number;
};

type Props = {
    course: { id: number; title: string; slug: string };
    assessment: {
        id: number;
        title: string;
        type: string;
        passing_score: number;
    };
    attempt: {
        id: number;
        submitted_at: string | null;
        score: number;
        passed: boolean;
    };
    questions: QuestionResult[];
};

function typeLabel(type: string): string {
    return (
        { pre_test: 'Pre-Test', post_test: 'Post-Test', quiz: 'Quiz' }[type] ?? type
    );
}

function formatDate(value: string | null): string {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function AssessmentResult({
    course,
    assessment,
    attempt,
    questions,
}: Props) {
    const correctCount = questions.filter((q) => q.is_correct).length;

    return (
        <>
            <Head title={`Hasil: ${assessment.title}`} />
            <div className="mx-auto max-w-3xl space-y-5">
                <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                    <Link href={`/learn/${course.slug}`} className="hover:text-slate-700">
                        {course.title}
                    </Link>
                    <ChevronRight className="size-3 text-slate-300" />
                    <Link
                        href={`/learn/${course.slug}/assessments/${assessment.id}`}
                        className="hover:text-slate-700"
                    >
                        {typeLabel(assessment.type)}
                    </Link>
                    <ChevronRight className="size-3 text-slate-300" />
                    <span className="font-semibold text-slate-900">Hasil</span>
                </nav>

                <div
                    className={cn(
                        'overflow-hidden rounded-3xl text-white shadow-[0_4px_20px_rgba(15,23,42,0.1)]',
                        attempt.passed
                            ? 'bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800'
                            : 'bg-gradient-to-br from-rose-600 via-rose-700 to-red-800',
                    )}
                >
                    <div className="p-7 sm:p-9">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold tracking-[0.16em] uppercase backdrop-blur">
                            {attempt.passed ? (
                                <CheckCircle2 className="size-3" />
                            ) : (
                                <XCircle className="size-3" />
                            )}
                            {attempt.passed ? 'Lulus' : 'Belum Lulus'}
                        </div>
                        <h1 className="mt-3 text-[28px] leading-tight font-extrabold sm:text-[34px]">
                            {assessment.title}
                        </h1>

                        <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-4">
                            <div>
                                <div className="text-[11px] tracking-wider text-white/75 uppercase">
                                    Skor Anda
                                </div>
                                <div className="text-[60px] leading-none font-extrabold tabular-nums">
                                    {attempt.score}
                                    <span className="text-[24px] font-bold opacity-75">%</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-[11px] tracking-wider text-white/75 uppercase">
                                    <Target className="mr-1 inline size-3" />
                                    Batas Lulus
                                </div>
                                <div className="text-[20px] font-extrabold tabular-nums">
                                    {assessment.passing_score}%
                                </div>
                            </div>
                            <div>
                                <div className="text-[11px] tracking-wider text-white/75 uppercase">
                                    Jawaban Benar
                                </div>
                                <div className="text-[20px] font-extrabold tabular-nums">
                                    {correctCount} / {questions.length}
                                </div>
                            </div>
                        </div>

                        <p className="mt-4 text-[12.5px] text-white/80">
                            Dikirim {formatDate(attempt.submitted_at)}
                        </p>
                    </div>

                    {attempt.passed && assessment.type === 'post_test' && (
                        <div className="border-t border-white/10 bg-black/10 p-4 text-center text-[13px]">
                            <Award className="mr-1 inline size-4" />
                            Selamat! Anda telah menyelesaikan kursus ini. Cek sertifikat di{' '}
                            <Link
                                href="/my-certificates"
                                className="font-bold underline underline-offset-2"
                            >
                                Sertifikat Saya
                            </Link>
                            .
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                        <Link href={`/learn/${course.slug}`}>Kembali ke Course</Link>
                    </Button>
                    {!attempt.passed && (
                        <Button asChild variant="outline" className="rounded-xl">
                            <Link
                                href={`/learn/${course.slug}/assessments/${assessment.id}`}
                            >
                                <RotateCcw className="mr-1.5 size-4" />
                                Coba Lagi
                            </Link>
                        </Button>
                    )}
                </div>

                <div>
                    <h2 className="text-[16px] font-extrabold text-slate-900">
                        Pembahasan Jawaban
                    </h2>
                    <ul className="mt-3 space-y-3">
                        {questions.map((q, idx) => (
                            <li
                                key={q.id}
                                className={cn(
                                    'rounded-2xl p-5 ring-1 shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
                                    q.is_correct
                                        ? 'bg-emerald-50/60 ring-emerald-200'
                                        : 'bg-rose-50/60 ring-rose-200',
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className={cn(
                                            'grid size-8 shrink-0 place-items-center rounded-full text-[12.5px] font-extrabold',
                                            q.is_correct
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-rose-600 text-white',
                                        )}
                                    >
                                        {q.is_correct ? (
                                            <CheckCircle2 className="size-4" />
                                        ) : (
                                            idx + 1
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge
                                                className={cn(
                                                    'border-transparent text-[10px] font-bold',
                                                    q.is_correct
                                                        ? 'bg-emerald-600 text-white hover:bg-emerald-600'
                                                        : 'bg-rose-600 text-white hover:bg-rose-600',
                                                )}
                                            >
                                                {q.is_correct ? 'Benar' : 'Salah'}
                                            </Badge>
                                            <span className="text-[11px] text-slate-500">
                                                {q.point_earned} / {q.points} poin
                                            </span>
                                        </div>
                                        <p className="mt-1 text-[14px] font-semibold text-slate-900">
                                            {q.question_text}
                                        </p>

                                        <ul className="mt-3 space-y-1.5">
                                            {q.options.map((opt) => {
                                                const isSelected =
                                                    opt.id === q.selected_option_id;
                                                const isCorrectAnswer = opt.is_correct;
                                                return (
                                                    <li
                                                        key={opt.id}
                                                        className={cn(
                                                            'flex items-start gap-2 rounded-lg border p-2.5 text-[13px]',
                                                            isCorrectAnswer
                                                                ? 'border-emerald-300 bg-emerald-100/60'
                                                                : isSelected
                                                                  ? 'border-rose-300 bg-rose-100/60'
                                                                  : 'border-slate-200 bg-white',
                                                        )}
                                                    >
                                                        {isCorrectAnswer ? (
                                                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                                                        ) : isSelected ? (
                                                            <XCircle className="mt-0.5 size-4 shrink-0 text-rose-600" />
                                                        ) : (
                                                            <span className="mt-0.5 size-4 shrink-0 rounded-full border border-slate-300" />
                                                        )}
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-slate-800">
                                                                {opt.option_text}
                                                            </div>
                                                            {isSelected && (
                                                                <div className="text-[11px] font-bold text-slate-600">
                                                                    Jawaban Anda
                                                                </div>
                                                            )}
                                                            {isCorrectAnswer && !isSelected && (
                                                                <div className="text-[11px] font-bold text-emerald-700">
                                                                    Jawaban yang benar
                                                                </div>
                                                            )}
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
}
