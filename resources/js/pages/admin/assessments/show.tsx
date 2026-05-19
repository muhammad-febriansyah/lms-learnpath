import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    ClipboardCheck,
    Loader2,
    Pencil,
    Plus,
    Save,
    Settings,
    Sparkles,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Option = {
    id: number;
    option_text: string;
    is_correct: boolean;
    sort_order: number;
};

type Question = {
    id: number;
    question_text: string;
    points: number;
    sort_order: number;
    options: Option[];
};

type Assessment = {
    id: number;
    title: string;
    type: 'pre_test' | 'post_test' | 'quiz';
    description: string | null;
    passing_score: number;
    max_attempts: number;
    duration_minutes: number | null;
    is_required: boolean;
    sort_order: number;
    attempts_count: number;
    course: { id: number; title: string; slug: string } | null;
    questions: Question[];
};

type LessonOption = { id: number; title: string };

type Props = { assessment: Assessment; lessons: LessonOption[] };

const TYPE_LABEL: Record<string, string> = {
    pre_test: 'Pre-Test',
    post_test: 'Post-Test',
    quiz: 'Quiz',
};

const TYPE_COLOR: Record<string, string> = {
    pre_test: 'bg-sky-100 text-sky-700',
    post_test: 'bg-indigo-100 text-indigo-700',
    quiz: 'bg-violet-100 text-violet-700',
};

type EditorOption = { option_text: string; is_correct: boolean };

type EditorState = {
    question_text: string;
    points: number;
    options: EditorOption[];
};

function emptyEditor(): EditorState {
    return {
        question_text: '',
        points: 1,
        options: [
            { option_text: '', is_correct: true },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
        ],
    };
}

export default function AssessmentShow({ assessment, lessons }: Props) {
    const [aiOpen, setAiOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | 'new' | null>(null);
    const [removeId, setRemoveId] = useState<number | null>(null);
    const [removeAssessment, setRemoveAssessment] = useState(false);

    const handleEditQuestion = (q: Question) => setEditingId(q.id);
    const handleNewQuestion = () => setEditingId('new');
    const handleClose = () => setEditingId(null);

    const performRemoveQuestion = () => {
        if (!removeId) return;
        router.delete(`/admin/assessments/${assessment.id}/questions/${removeId}`, {
            preserveScroll: true,
            onFinish: () => setRemoveId(null),
        });
    };

    const performRemoveAssessment = () => {
        router.delete(`/admin/assessments/${assessment.id}`, {
            onFinish: () => setRemoveAssessment(false),
        });
    };

    return (
        <>
            <Head title={`Kelola Soal — ${assessment.title}`} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <Link href="/admin/assessments" className="hover:text-slate-700">
                            Assessment
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">{assessment.title}</span>
                    </nav>
                    <div className="mt-1.5 flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                                {assessment.title}
                            </h1>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[12.5px]">
                                <Badge
                                    className={cn(
                                        'border-transparent',
                                        TYPE_COLOR[assessment.type] ?? 'bg-slate-100 text-slate-700',
                                    )}
                                >
                                    {TYPE_LABEL[assessment.type] ?? assessment.type}
                                </Badge>
                                {assessment.course && (
                                    <Link
                                        href={`/courses/${assessment.course.slug}`}
                                        className="text-slate-500 hover:text-slate-700"
                                    >
                                        {assessment.course.title}
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button asChild variant="outline" size="sm" className="rounded-xl">
                                <Link href={`/admin/assessments/${assessment.id}/edit`}>
                                    <Settings className="mr-1.5 size-4" />
                                    Edit Metadata
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                onClick={() => setRemoveAssessment(true)}
                            >
                                <Trash2 className="mr-1.5 size-4" />
                                Hapus
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Stat label="Soal" value={String(assessment.questions.length)} />
                    <Stat label="Nilai Lulus" value={`${assessment.passing_score}%`} />
                    <Stat label="Max Percobaan" value={`${assessment.max_attempts}×`} />
                    <Stat
                        label="Total Attempt"
                        value={assessment.attempts_count.toString()}
                    />
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-[15px] font-bold text-slate-900">Daftar Soal</h2>
                            <p className="mt-0.5 text-[12.5px] text-slate-500">
                                Soal pilihan ganda. Setidaknya satu opsi harus benar.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="rounded-xl border-brand-200 text-brand-700 hover:bg-brand-50"
                                onClick={() => setAiOpen(true)}
                            >
                                <Sparkles className="mr-1.5 size-4" />
                                Generate dengan AI
                            </Button>
                            <Button
                                size="sm"
                                className="rounded-xl bg-brand-600 hover:bg-brand-700"
                                onClick={handleNewQuestion}
                            >
                                <Plus className="mr-1.5 size-4" />
                                Tambah Soal
                            </Button>
                        </div>
                    </div>

                    {assessment.questions.length === 0 ? (
                        <div className="py-10 text-center">
                            <ClipboardCheck className="mx-auto mb-2 size-8 text-slate-400" />
                            <p className="text-sm font-semibold text-slate-900">
                                Belum ada soal
                            </p>
                            <p className="mt-1 text-[12.5px] text-slate-500">
                                Tambahkan minimal 1 soal sebelum mempublish.
                            </p>
                        </div>
                    ) : (
                        <ol className="space-y-3">
                            {assessment.questions.map((q, idx) => (
                                <li
                                    key={q.id}
                                    className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 text-[12.5px] font-extrabold text-brand-700">
                                            {idx + 1}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[13.5px] font-semibold text-slate-900">
                                                {q.question_text}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-slate-500">
                                                {q.points} poin · {q.options.length} opsi
                                            </p>
                                            <ul className="mt-2 space-y-1 text-[12.5px]">
                                                {q.options.map((opt) => (
                                                    <li
                                                        key={opt.id}
                                                        className={cn(
                                                            'flex items-start gap-2 rounded-lg px-2 py-1',
                                                            opt.is_correct &&
                                                                'bg-emerald-50/60 text-emerald-800',
                                                        )}
                                                    >
                                                        {opt.is_correct ? (
                                                            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                                                        ) : (
                                                            <span className="mt-1 size-3 shrink-0 rounded-full border border-slate-300" />
                                                        )}
                                                        <span
                                                            className={cn(
                                                                opt.is_correct
                                                                    ? 'font-semibold'
                                                                    : 'text-slate-700',
                                                            )}
                                                        >
                                                            {opt.option_text}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="flex shrink-0 gap-1.5">
                                            <Button
                                                size="sm"
                                                className="h-8 rounded-xl bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                                                onClick={() => handleEditQuestion(q)}
                                            >
                                                <Pencil className="mr-1 size-3.5" />
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-8 rounded-xl bg-rose-600 text-white shadow-sm hover:bg-rose-700"
                                                onClick={() => setRemoveId(q.id)}
                                            >
                                                <Trash2 className="mr-1 size-3.5" />
                                                Hapus
                                            </Button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </div>

            {editingId !== null && (
                <QuestionEditorDialog
                    assessmentId={assessment.id}
                    question={
                        editingId === 'new'
                            ? null
                            : assessment.questions.find((q) => q.id === editingId) ?? null
                    }
                    onClose={handleClose}
                />
            )}

            {aiOpen && (
                <AiGenerateDialog
                    assessmentId={assessment.id}
                    lessons={lessons}
                    onClose={() => setAiOpen(false)}
                />
            )}

            <Dialog open={removeId !== null} onOpenChange={(o) => !o && setRemoveId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus soal ini?</DialogTitle>
                        <DialogDescription>
                            Soal dan semua opsinya akan dihapus permanen. Riwayat jawaban
                            peserta yang sudah ada tetap tersimpan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRemoveId(null)}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={performRemoveQuestion}>
                            Hapus Soal
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={removeAssessment} onOpenChange={setRemoveAssessment}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus assessment?</DialogTitle>
                        <DialogDescription>
                            Assessment <strong>{assessment.title}</strong>, semua soal, dan
                            riwayat percobaan akan terhapus. Tindakan ini tidak bisa dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRemoveAssessment(false)}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={performRemoveAssessment}>
                            Hapus Assessment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function QuestionEditorDialog({
    assessmentId,
    question,
    onClose,
}: {
    assessmentId: number;
    question: Question | null;
    onClose: () => void;
}) {
    const isEdit = !!question;
    const initial: EditorState = question
        ? {
              question_text: question.question_text,
              points: question.points,
              options: question.options.map((o) => ({
                  option_text: o.option_text,
                  is_correct: o.is_correct,
              })),
          }
        : emptyEditor();

    const form = useForm<EditorState & { sort_order?: number | null }>({
        ...initial,
        sort_order: question?.sort_order ?? null,
    });

    const setOption = (idx: number, patch: Partial<EditorOption>) => {
        const next = form.data.options.map((o, i) =>
            i === idx ? { ...o, ...patch } : o,
        );
        form.setData('options', next);
    };

    const addOption = () => {
        if (form.data.options.length >= 6) return;
        form.setData('options', [
            ...form.data.options,
            { option_text: '', is_correct: false },
        ]);
    };

    const removeOption = (idx: number) => {
        if (form.data.options.length <= 2) return;
        form.setData(
            'options',
            form.data.options.filter((_, i) => i !== idx),
        );
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            form.patch(`/admin/assessments/${assessmentId}/questions/${question!.id}`, {
                onSuccess: () => onClose(),
                preserveScroll: true,
            });
        } else {
            form.post(`/admin/assessments/${assessmentId}/questions`, {
                onSuccess: () => onClose(),
                preserveScroll: true,
            });
        }
    };

    return (
        <Dialog open onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? 'Edit Soal' : 'Tambah Soal Baru'}
                    </DialogTitle>
                    <DialogDescription>
                        Tulis pertanyaan, pilih nilai poin, dan tandai opsi mana yang benar.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <RequiredLabel htmlFor="question_text">Pertanyaan</RequiredLabel>
                        <Textarea
                            id="question_text"
                            rows={3}
                            value={form.data.question_text}
                            onChange={(e) => form.setData('question_text', e.target.value)}
                            className="mt-1"
                            placeholder="Tulis pertanyaan di sini..."
                        />
                        <FieldError message={form.errors.question_text} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <RequiredLabel htmlFor="points">Poin</RequiredLabel>
                            <Input
                                id="points"
                                type="number"
                                min={1}
                                max={100}
                                value={form.data.points}
                                onChange={(e) =>
                                    form.setData('points', Number(e.target.value) || 1)
                                }
                                className="mt-1"
                            />
                            <FieldError message={form.errors.points} />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <RequiredLabel htmlFor="opt-0">Opsi Jawaban</RequiredLabel>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={addOption}
                                disabled={form.data.options.length >= 6}
                            >
                                <Plus className="mr-1 size-3.5" />
                                Tambah Opsi
                            </Button>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">
                            Centang opsi yang merupakan jawaban benar (minimal satu).
                        </p>
                        <ul className="mt-3 space-y-2">
                            {form.data.options.map((opt, idx) => (
                                <li
                                    key={idx}
                                    className={cn(
                                        'flex items-start gap-2 rounded-xl border p-3 transition',
                                        opt.is_correct
                                            ? 'border-emerald-300 bg-emerald-50/40'
                                            : 'border-slate-200',
                                    )}
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setOption(idx, { is_correct: !opt.is_correct })
                                        }
                                        className={cn(
                                            'mt-1 grid size-5 shrink-0 place-items-center rounded-full border-2 transition',
                                            opt.is_correct
                                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                                : 'border-slate-300 hover:border-slate-400',
                                        )}
                                        aria-label="Tandai sebagai jawaban benar"
                                    >
                                        {opt.is_correct && <CheckCircle2 className="size-3" />}
                                    </button>
                                    <Input
                                        id={`opt-${idx}`}
                                        value={opt.option_text}
                                        onChange={(e) =>
                                            setOption(idx, { option_text: e.target.value })
                                        }
                                        placeholder={`Opsi ${idx + 1}`}
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="h-9 shrink-0 rounded-xl bg-rose-600 text-white shadow-sm hover:bg-rose-700"
                                        onClick={() => removeOption(idx)}
                                        disabled={form.data.options.length <= 2}
                                    >
                                        <X className="mr-1 size-3.5" />
                                        Hapus
                                    </Button>
                                </li>
                            ))}
                        </ul>
                        <FieldError message={form.errors.options} />
                        <FieldError message={(form.errors as Record<string, string>)['options.0.option_text']} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="bg-brand-600 hover:bg-brand-700"
                        >
                            <Save className="mr-1.5 size-4" />
                            {form.processing
                                ? 'Menyimpan...'
                                : isEdit
                                  ? 'Simpan Soal'
                                  : 'Tambah Soal'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="text-[10.5px] tracking-wider text-slate-500 uppercase">
                {label}
            </div>
            <div className="mt-1 text-[18px] font-extrabold text-slate-900 tabular-nums">
                {value}
            </div>
        </div>
    );
}

type DraftQuestion = {
    question_text: string;
    points: number;
    options: { option_text: string; is_correct: boolean }[];
};

function AiGenerateDialog({
    assessmentId,
    lessons,
    onClose,
}: {
    assessmentId: number;
    lessons: LessonOption[];
    onClose: () => void;
}) {
    const [lessonId, setLessonId] = useState<string>('__none__');
    const [count, setCount] = useState(5);
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
    const [extraContext, setExtraContext] = useState('');
    const [drafts, setDrafts] = useState<DraftQuestion[] | null>(null);
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function generate() {
        setError(null);
        setGenerating(true);
        try {
            const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
            const xsrf = match ? decodeURIComponent(match[1]) : '';
            const res = await fetch(
                `/admin/assessments/${assessmentId}/generate-questions`,
                {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-XSRF-TOKEN': xsrf,
                    },
                    body: JSON.stringify({
                        lesson_id: lessonId === '__none__' ? null : Number(lessonId),
                        extra_context: extraContext,
                        count,
                        difficulty,
                    }),
                },
            );
            const json = await res.json();
            if (!res.ok) {
                setError(json.message ?? 'Generate gagal.');
                return;
            }
            const items: DraftQuestion[] = (json.questions ?? []).map(
                (q: {
                    question: string;
                    options: string[];
                    correct_index: number;
                }) => ({
                    question_text: q.question,
                    points: 1,
                    options: q.options.map((text: string, i: number) => ({
                        option_text: text,
                        is_correct: i === q.correct_index,
                    })),
                }),
            );
            setDrafts(items);
        } catch (e: unknown) {
            setError((e as Error).message ?? 'Network error.');
        } finally {
            setGenerating(false);
        }
    }

    function saveAll() {
        if (!drafts) return;
        setSaving(true);
        router.post(
            `/admin/assessments/${assessmentId}/questions/bulk`,
            { questions: drafts },
            {
                onSuccess: () => onClose(),
                onFinish: () => setSaving(false),
            },
        );
    }

    function updateDraft(idx: number, partial: Partial<DraftQuestion>) {
        setDrafts((d) => {
            if (!d) return d;
            const copy = [...d];
            copy[idx] = { ...copy[idx], ...partial };
            return copy;
        });
    }

    function updateOption(
        qi: number,
        oi: number,
        partial: Partial<{ option_text: string; is_correct: boolean }>,
    ) {
        setDrafts((d) => {
            if (!d) return d;
            const copy = [...d];
            const opts = copy[qi].options.map((o, i) => {
                if (i === oi) {
                    return { ...o, ...partial };
                }
                if (partial.is_correct === true) {
                    return { ...o, is_correct: false };
                }
                return o;
            });
            copy[qi] = { ...copy[qi], options: opts };
            return copy;
        });
    }

    function removeDraft(idx: number) {
        setDrafts((d) => (d ? d.filter((_, i) => i !== idx) : d));
    }

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="inline-flex items-center gap-2">
                        <Sparkles className="size-5 text-brand-600" />
                        Generate Soal dengan AI
                    </DialogTitle>
                    <DialogDescription>
                        Pilih lesson sumber atau paste materi tambahan. AI akan
                        membuatkan soal pilihan ganda yang bisa Anda edit sebelum
                        disimpan.
                    </DialogDescription>
                </DialogHeader>

                {!drafts ? (
                    <div className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="sm:col-span-1">
                                <RequiredLabel>Lesson sumber</RequiredLabel>
                                <Select
                                    value={lessonId}
                                    onValueChange={setLessonId}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__none__">
                                            (tanpa lesson)
                                        </SelectItem>
                                        {lessons.map((l) => (
                                            <SelectItem
                                                key={l.id}
                                                value={String(l.id)}
                                            >
                                                {l.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <RequiredLabel>Jumlah soal</RequiredLabel>
                                <Select
                                    value={String(count)}
                                    onValueChange={(v) => setCount(Number(v))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[3, 5, 7, 10].map((n) => (
                                            <SelectItem key={n} value={String(n)}>
                                                {n} soal
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <RequiredLabel>Tingkat kesulitan</RequiredLabel>
                                <Select
                                    value={difficulty}
                                    onValueChange={(v) =>
                                        setDifficulty(v as 'easy' | 'medium' | 'hard')
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="easy">Mudah</SelectItem>
                                        <SelectItem value="medium">Sedang</SelectItem>
                                        <SelectItem value="hard">Sulit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <RequiredLabel>Konteks tambahan (opsional)</RequiredLabel>
                            <Textarea
                                rows={4}
                                placeholder="Paste materi tambahan, ringkasan, atau panduan khusus untuk AI…"
                                value={extraContext}
                                onChange={(e) => setExtraContext(e.target.value)}
                            />
                        </div>

                        {error && (
                            <p className="rounded-xl bg-rose-50 p-3 text-[12.5px] text-rose-700 ring-1 ring-rose-200/60">
                                {error}
                            </p>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={onClose}>
                                Batal
                            </Button>
                            <Button
                                onClick={generate}
                                disabled={generating}
                                className="bg-brand-600 hover:bg-brand-700"
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="mr-1.5 size-4 animate-spin" />
                                        Generating…
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-1.5 size-4" />
                                        Generate Soal
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-[12.5px] text-slate-500">
                                {drafts.length} soal di-generate. Edit kalau perlu lalu
                                klik "Simpan ke Assessment".
                            </p>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDrafts(null)}
                            >
                                Generate ulang
                            </Button>
                        </div>

                        <div className="max-h-[420px] space-y-3 overflow-y-auto">
                            {drafts.map((d, qi) => (
                                <div
                                    key={qi}
                                    className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200"
                                >
                                    <div className="mb-2 flex items-start gap-2">
                                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                                            {qi + 1}
                                        </span>
                                        <Textarea
                                            rows={2}
                                            value={d.question_text}
                                            onChange={(e) =>
                                                updateDraft(qi, {
                                                    question_text: e.target.value,
                                                })
                                            }
                                            className="flex-1"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeDraft(qi)}
                                            className="p-1.5 text-slate-400 hover:text-rose-600"
                                            aria-label="Hapus"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                    <ul className="space-y-1.5 pl-8">
                                        {d.options.map((o, oi) => (
                                            <li
                                                key={oi}
                                                className="flex items-center gap-2"
                                            >
                                                <input
                                                    type="radio"
                                                    name={`correct-${qi}`}
                                                    checked={o.is_correct}
                                                    onChange={() =>
                                                        updateOption(qi, oi, {
                                                            is_correct: true,
                                                        })
                                                    }
                                                    className="size-3.5"
                                                />
                                                <input
                                                    value={o.option_text}
                                                    onChange={(e) =>
                                                        updateOption(qi, oi, {
                                                            option_text:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className="flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[12.5px]"
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={onClose}>
                                Batal
                            </Button>
                            <Button
                                onClick={saveAll}
                                disabled={saving || drafts.length === 0}
                                className="bg-brand-600 hover:bg-brand-700"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-1.5 size-4 animate-spin" />
                                        Menyimpan…
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-1.5 size-4" />
                                        Simpan ke Assessment ({drafts.length})
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
