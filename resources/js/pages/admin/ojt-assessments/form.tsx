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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Option = { id: number; name: string; email?: string; category?: string | null; title?: string };

type Props = {
    assessment: null;
    userOptions: Option[];
    competencyOptions: Option[];
    courseOptions: Option[];
};

const LEVEL_LABELS = ['—', 'Awareness', 'Basic', 'Intermediate', 'Advanced', 'Expert'];

export default function OjtAssessmentForm({ userOptions, competencyOptions, courseOptions }: Props) {
    const form = useForm({
        user_id: '',
        competency_id: '',
        course_id: '',
        rubric_score: 70,
        actual_level: 3,
        notes: '',
        status: 'pending_review',
    });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post('/admin/ojt-assessments');
    }

    return (
        <>
            <Head title="Input OJT Assessment" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <Link href="/admin/ojt-assessments" className="hover:text-slate-700">
                            OJT
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Input Baru</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Input OJT Assessment
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Catat hasil observasi praktik kerja terhadap kompetensi tertentu.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-5 rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:p-6"
                >
                    <div className="space-y-2">
                        <RequiredLabel htmlFor="user_id" required>
                            Karyawan (bawahan langsung)
                        </RequiredLabel>
                        <Select
                            value={form.data.user_id}
                            onValueChange={(v) => form.setData('user_id', v)}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Pilih karyawan..." />
                            </SelectTrigger>
                            <SelectContent>
                                {userOptions.length === 0 ? (
                                    <div className="px-3 py-2 text-[12.5px] text-slate-500">
                                        Tidak ada bawahan langsung yang terdaftar.
                                    </div>
                                ) : (
                                    userOptions.map((u) => (
                                        <SelectItem key={u.id} value={u.id.toString()}>
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{u.name}</span>
                                                <span className="text-[11px] text-slate-500">{u.email}</span>
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        <FieldError message={form.errors.user_id} />
                    </div>

                    <div className="space-y-2">
                        <RequiredLabel htmlFor="competency_id" required>
                            Kompetensi
                        </RequiredLabel>
                        <Select
                            value={form.data.competency_id}
                            onValueChange={(v) => form.setData('competency_id', v)}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Pilih kompetensi..." />
                            </SelectTrigger>
                            <SelectContent>
                                {competencyOptions.map((c) => (
                                    <SelectItem key={c.id} value={c.id.toString()}>
                                        {c.name}
                                        {c.category && (
                                            <span className="ml-1.5 text-[11px] text-slate-500">
                                                ({c.category})
                                            </span>
                                        )}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldError message={form.errors.competency_id} />
                    </div>

                    <div className="space-y-2">
                        <RequiredLabel htmlFor="course_id">Course Terkait (opsional)</RequiredLabel>
                        <Select
                            value={form.data.course_id || 'none'}
                            onValueChange={(v) => form.setData('course_id', v === 'none' ? '' : v)}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Tidak terkait course" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Tidak terkait course</SelectItem>
                                {courseOptions.map((c) => (
                                    <SelectItem key={c.id} value={c.id.toString()}>
                                        {c.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldError message={form.errors.course_id} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <RequiredLabel htmlFor="rubric_score" required>
                                Skor Rubrik (0–100)
                            </RequiredLabel>
                            <Input
                                id="rubric_score"
                                type="number"
                                min={0}
                                max={100}
                                value={form.data.rubric_score}
                                onChange={(e) =>
                                    form.setData(
                                        'rubric_score',
                                        Math.max(0, Math.min(100, parseInt(e.target.value) || 0)),
                                    )
                                }
                            />
                            <FieldError message={form.errors.rubric_score} />
                        </div>
                        <div className="space-y-2">
                            <RequiredLabel required>Level Aktual</RequiredLabel>
                            <div className="flex items-center gap-1">
                                {[0, 1, 2, 3, 4, 5].map((lv) => (
                                    <button
                                        key={lv}
                                        type="button"
                                        onClick={() => form.setData('actual_level', lv)}
                                        className={cn(
                                            'size-10 rounded-lg text-[13px] font-bold tabular-nums transition-colors',
                                            form.data.actual_level === lv
                                                ? 'bg-brand-600 text-white shadow-sm'
                                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100',
                                        )}
                                    >
                                        {lv}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[11px] text-slate-500">
                                {LEVEL_LABELS[form.data.actual_level]}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <RequiredLabel htmlFor="notes">Catatan / Bukti</RequiredLabel>
                        <Textarea
                            id="notes"
                            rows={4}
                            placeholder="Contoh: berhasil menyelesaikan 3 proyek dengan tipe pelanggan B2B besar..."
                            value={form.data.notes}
                            onChange={(e) => form.setData('notes', e.target.value)}
                        />
                        <FieldError message={form.errors.notes} />
                    </div>

                    <div className="space-y-2">
                        <RequiredLabel required>Status</RequiredLabel>
                        <Select
                            value={form.data.status}
                            onValueChange={(v) => form.setData('status', v)}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending_review">Menunggu Approval</SelectItem>
                                <SelectItem value="approved">Langsung Setujui</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-[11.5px] text-slate-500">
                            "Approved" akan memperbarui level kompetensi karyawan.
                        </p>
                    </div>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button asChild type="button" variant="outline" className="rounded-xl">
                            <Link href="/admin/ojt-assessments">
                                <ArrowLeft className="mr-1.5 size-4" />
                                Batal
                            </Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-xl bg-brand-600 hover:bg-brand-700"
                        >
                            <Save className="mr-1.5 size-4" />
                            {form.processing ? 'Menyimpan...' : 'Simpan OJT'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
