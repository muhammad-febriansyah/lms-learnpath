import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    Award,
    CheckCircle2,
    ChevronRight,
    Clock,
    FileQuestion,
    History,
    PlayCircle,
    Target,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Attempt = {
    id: number;
    started_at: string | null;
    submitted_at: string | null;
    score: number;
    status: 'in_progress' | 'submitted';
    passed: boolean;
};

type Props = {
    course: { id: number; title: string; slug: string };
    assessment: {
        id: number;
        title: string;
        type: string;
        description: string | null;
        passing_score: number;
        max_attempts: number;
        duration_minutes: number | null;
        question_count: number;
    };
    attempts: Attempt[];
    state: {
        submitted_count: number;
        attempts_left: number;
        has_in_progress: boolean;
        has_passed: boolean;
        can_start: boolean;
    };
};

function typeLabel(type: string): string {
    return (
        { pre_test: 'Pre-Test', post_test: 'Post-Test', quiz: 'Quiz' }[type] ??
        type
    );
}

function formatDate(value: string | null): string {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function AssessmentShow({ course, assessment, attempts, state }: Props) {
    const [starting, setStarting] = useState(false);

    const handleStart = () => {
        setStarting(true);
        router.post(
            `/learn/${course.slug}/assessments/${assessment.id}/start`,
            {},
            {
                onFinish: () => setStarting(false),
            },
        );
    };

    return (
        <>
            <Head title={assessment.title} />
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

                <div className="overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div
                        className={cn(
                            'p-6 text-white',
                            assessment.type === 'post_test'
                                ? 'bg-gradient-to-br from-indigo-700 via-brand-700 to-purple-700'
                                : 'bg-gradient-to-br from-sky-600 via-cyan-600 to-blue-700',
                        )}
                    >
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold tracking-[0.16em] uppercase backdrop-blur">
                            <FileQuestion className="size-3" />
                            {typeLabel(assessment.type)}
                        </div>
                        <h1 className="mt-3 text-[22px] leading-tight font-extrabold sm:text-[26px]">
                            {assessment.title}
                        </h1>
                        {assessment.description && (
                            <p className="mt-2 text-[13.5px] leading-relaxed text-white/85">
                                {assessment.description}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-b border-slate-100 p-5 sm:grid-cols-4">
                        <Stat label="Soal" value={`${assessment.question_count}`} icon={FileQuestion} />
                        <Stat label="Lulus" value={`≥ ${assessment.passing_score}%`} icon={Target} />
                        <Stat
                            label="Durasi"
                            value={assessment.duration_minutes ? `${assessment.duration_minutes} mnt` : 'Bebas'}
                            icon={Clock}
                        />
                        <Stat
                            label="Sisa Percobaan"
                            value={`${state.attempts_left} / ${assessment.max_attempts}`}
                            icon={History}
                        />
                    </div>

                    <div className="p-6">
                        {state.has_passed && (
                            <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                <Award className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                                <div className="text-[13px] text-emerald-900">
                                    <strong className="block">Anda sudah lulus!</strong>
                                    Tidak perlu mengulang. Lihat hasil di histori percobaan di bawah.
                                </div>
                            </div>
                        )}

                        {!state.has_passed && state.attempts_left === 0 && (
                            <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
                                <AlertCircle className="mt-0.5 size-5 shrink-0 text-rose-600" />
                                <div className="text-[13px] text-rose-900">
                                    <strong className="block">Batas percobaan habis.</strong>
                                    Anda sudah {state.submitted_count}× mencoba assessment ini.
                                    Hubungi instruktur untuk reset.
                                </div>
                            </div>
                        )}

                        {state.can_start && (
                            <Button
                                size="lg"
                                onClick={handleStart}
                                disabled={starting}
                                className="h-12 w-full rounded-xl bg-brand-600 text-white hover:bg-brand-700"
                            >
                                <PlayCircle className="mr-2 size-5" />
                                {state.has_in_progress
                                    ? 'Lanjutkan Percobaan'
                                    : starting
                                      ? 'Memulai...'
                                      : 'Mulai Assessment'}
                            </Button>
                        )}

                        <ul className="mt-5 space-y-2 text-[12.5px] text-slate-600">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                                <span>
                                    Anda perlu skor minimal{' '}
                                    <strong>{assessment.passing_score}%</strong> untuk lulus
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                                <span>
                                    Setiap soal pilihan ganda, satu jawaban benar
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                                <span>
                                    Maksimum <strong>{assessment.max_attempts}×</strong> percobaan
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {attempts.length > 0 && (
                    <div className="rounded-2xl bg-card p-5 ring-1 ring-slate-200/70">
                        <h2 className="text-[15px] font-extrabold text-slate-900">
                            Histori Percobaan
                        </h2>
                        <ul className="mt-3 divide-y divide-slate-100">
                            {attempts.map((a) => (
                                <li
                                    key={a.id}
                                    className="flex flex-wrap items-center gap-3 py-3"
                                >
                                    {a.status === 'submitted' ? (
                                        a.passed ? (
                                            <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
                                        ) : (
                                            <XCircle className="size-5 shrink-0 text-rose-500" />
                                        )
                                    ) : (
                                        <Clock className="size-5 shrink-0 text-amber-500" />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <div className="text-[13px] font-semibold text-slate-900">
                                            {a.status === 'submitted'
                                                ? `Skor ${a.score}% — ${a.passed ? 'Lulus' : 'Tidak Lulus'}`
                                                : 'Sedang dikerjakan'}
                                        </div>
                                        <div className="text-[11.5px] text-slate-500">
                                            {a.submitted_at
                                                ? `Selesai ${formatDate(a.submitted_at)}`
                                                : `Dimulai ${formatDate(a.started_at)}`}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {a.status === 'submitted' && (
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="outline"
                                                className="h-8 rounded-lg"
                                            >
                                                <Link
                                                    href={`/learn/${course.slug}/assessments/${assessment.id}/attempts/${a.id}/result`}
                                                >
                                                    Lihat Hasil
                                                </Link>
                                            </Button>
                                        )}
                                        {a.status === 'in_progress' && (
                                            <Button
                                                asChild
                                                size="sm"
                                                className="h-8 rounded-lg bg-amber-500 hover:bg-amber-600"
                                            >
                                                <Link
                                                    href={`/learn/${course.slug}/assessments/${assessment.id}/attempts/${a.id}`}
                                                >
                                                    Lanjutkan
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {a_badge(assessment.type)}
            </div>
        </>
    );
}

function Stat({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string;
    icon: typeof FileQuestion;
}) {
    return (
        <div>
            <div className="flex items-center gap-1.5 text-[10.5px] tracking-wider text-slate-500 uppercase">
                <Icon className="size-3.5" />
                {label}
            </div>
            <div className="mt-1 text-[15px] font-extrabold text-slate-900 tabular-nums">
                {value}
            </div>
        </div>
    );
}

function a_badge(type: string) {
    if (type === 'post_test') {
        return (
            <div className="rounded-2xl bg-amber-50 p-4 text-[12.5px] text-amber-900 ring-1 ring-amber-200">
                <Badge className="border-transparent bg-amber-500 text-white">
                    Catatan
                </Badge>{' '}
                Post-test ini wajib lulus untuk menyelesaikan kursus dan mendapatkan sertifikat.
            </div>
        );
    }
    return null;
}
