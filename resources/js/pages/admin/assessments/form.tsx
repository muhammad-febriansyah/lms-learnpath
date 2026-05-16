import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import { IconChevR } from '@/components/learnpath-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

type AssessmentInput = {
    id?: number;
    course_id: number;
    title: string;
    type: 'pre_test' | 'post_test' | 'quiz';
    description: string | null;
    passing_score: number;
    max_attempts: number;
    duration_minutes: number | null;
    is_required: boolean;
    sort_order: number;
};

type Props = {
    assessment: AssessmentInput | null;
    courses: { id: number; title: string }[];
    preselectedCourseId?: number | null;
};

export default function AssessmentForm({ assessment, courses, preselectedCourseId }: Props) {
    const isEdit = !!assessment;

    const form = useForm<{
        course_id: number | '';
        title: string;
        type: 'pre_test' | 'post_test' | 'quiz';
        description: string;
        passing_score: number | '';
        max_attempts: number | '';
        duration_minutes: number | '';
        is_required: boolean;
        sort_order: number | '';
    }>({
        course_id: assessment?.course_id ?? preselectedCourseId ?? '',
        title: assessment?.title ?? '',
        type: assessment?.type ?? 'post_test',
        description: assessment?.description ?? '',
        passing_score: assessment?.passing_score ?? 70,
        max_attempts: assessment?.max_attempts ?? 3,
        duration_minutes: assessment?.duration_minutes ?? 30,
        is_required: assessment?.is_required ?? true,
        sort_order: assessment?.sort_order ?? 0,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            form.put(`/admin/assessments/${assessment!.id}`);
        } else {
            form.post('/admin/assessments');
        }
    };

    return (
        <>
            <Head title={isEdit ? `Edit Assessment` : 'Buat Assessment'} />
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
                        <span className="font-semibold text-slate-900">
                            {isEdit ? 'Edit' : 'Buat Baru'}
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        {isEdit ? 'Edit Assessment' : 'Buat Assessment'}
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        {isEdit
                            ? 'Ubah metadata assessment. Soal dikelola di halaman detail.'
                            : 'Setelah dibuat, Anda akan langsung diarahkan ke halaman pengelolaan soal.'}
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-5 rounded-2xl bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <RequiredLabel htmlFor="course_id">Course</RequiredLabel>
                            <Select
                                value={form.data.course_id ? String(form.data.course_id) : ''}
                                onValueChange={(v) => form.setData('course_id', v ? Number(v) : '')}
                                disabled={isEdit}
                            >
                                <SelectTrigger id="course_id" className="mt-1">
                                    <SelectValue placeholder="Pilih course..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError message={form.errors.course_id} />
                            {isEdit && (
                                <p className="mt-1 text-[11px] text-slate-500">
                                    Course tidak dapat dipindah setelah assessment dibuat.
                                </p>
                            )}
                        </div>

                        <div className="sm:col-span-2">
                            <RequiredLabel htmlFor="title">Judul</RequiredLabel>
                            <Input
                                id="title"
                                value={form.data.title}
                                onChange={(e) => form.setData('title', e.target.value)}
                                placeholder="Contoh: Post-Test Analisa Kredit"
                                className="mt-1"
                            />
                            <FieldError message={form.errors.title} />
                        </div>

                        <div>
                            <RequiredLabel htmlFor="type">Tipe</RequiredLabel>
                            <Select
                                value={form.data.type}
                                onValueChange={(v) =>
                                    form.setData('type', v as 'pre_test' | 'post_test' | 'quiz')
                                }
                            >
                                <SelectTrigger id="type" className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pre_test">Pre-Test</SelectItem>
                                    <SelectItem value="post_test">Post-Test</SelectItem>
                                    <SelectItem value="quiz">Quiz</SelectItem>
                                </SelectContent>
                            </Select>
                            <FieldError message={form.errors.type} />
                        </div>

                        <div>
                            <RequiredLabel htmlFor="passing_score">Nilai Lulus (%)</RequiredLabel>
                            <Input
                                id="passing_score"
                                type="number"
                                min={0}
                                max={100}
                                value={form.data.passing_score}
                                onChange={(e) =>
                                    form.setData(
                                        'passing_score',
                                        e.target.value === '' ? '' : Number(e.target.value),
                                    )
                                }
                                className="mt-1"
                            />
                            <FieldError message={form.errors.passing_score} />
                        </div>

                        <div>
                            <RequiredLabel htmlFor="max_attempts">Max Percobaan</RequiredLabel>
                            <Input
                                id="max_attempts"
                                type="number"
                                min={1}
                                max={99}
                                value={form.data.max_attempts}
                                onChange={(e) =>
                                    form.setData(
                                        'max_attempts',
                                        e.target.value === '' ? '' : Number(e.target.value),
                                    )
                                }
                                className="mt-1"
                            />
                            <FieldError message={form.errors.max_attempts} />
                        </div>

                        <div>
                            <label
                                htmlFor="duration_minutes"
                                className="text-[12.5px] font-semibold text-slate-700"
                            >
                                Durasi (menit, opsional)
                            </label>
                            <Input
                                id="duration_minutes"
                                type="number"
                                min={1}
                                max={600}
                                value={form.data.duration_minutes ?? ''}
                                onChange={(e) =>
                                    form.setData(
                                        'duration_minutes',
                                        e.target.value === '' ? '' : Number(e.target.value),
                                    )
                                }
                                className="mt-1"
                                placeholder="Kosongkan untuk tanpa batas"
                            />
                            <FieldError message={form.errors.duration_minutes} />
                        </div>

                        <div className="sm:col-span-2">
                            <label
                                htmlFor="description"
                                className="text-[12.5px] font-semibold text-slate-700"
                            >
                                Deskripsi (opsional)
                            </label>
                            <Textarea
                                id="description"
                                rows={3}
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                                placeholder="Instruksi singkat ke peserta..."
                                className="mt-1"
                            />
                            <FieldError message={form.errors.description} />
                        </div>

                        <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-slate-200 p-4">
                            <div>
                                <div className="text-[13.5px] font-semibold text-slate-900">
                                    Wajib untuk lulus course
                                </div>
                                <div className="text-[11.5px] text-slate-500">
                                    Khusus post-test: jika dicentang, peserta harus lulus assessment
                                    ini agar enrollment dianggap completed.
                                </div>
                            </div>
                            <Switch
                                checked={form.data.is_required}
                                onCheckedChange={(v) => form.setData('is_required', v)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                        <Button asChild variant="outline">
                            <Link href="/admin/assessments">
                                <ArrowLeft className="mr-1.5 size-4" />
                                Batal
                            </Link>
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
                                  ? 'Simpan Perubahan'
                                  : 'Buat & Lanjut ke Soal'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
