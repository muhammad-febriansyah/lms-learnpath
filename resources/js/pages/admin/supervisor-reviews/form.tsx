import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Star } from 'lucide-react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import { IconChevR } from '@/components/learnpath-icons';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Option = { id: number; name: string; email?: string; category?: string | null };

type Props = {
    review: null;
    userOptions: Option[];
    competencyOptions: Option[];
};

const LEVEL_LABELS = ['—', 'Awareness', 'Basic', 'Intermediate', 'Advanced', 'Expert'];

export default function SupervisorReviewForm({ userOptions, competencyOptions }: Props) {
    const form = useForm({
        user_id: '',
        competency_id: '',
        rating: 4,
        actual_level: 3,
        notes: '',
        approval_status: 'pending_review',
    });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post('/admin/supervisor-reviews');
    }

    return (
        <>
            <Head title="Input Supervisor Review" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <Link href="/admin/supervisor-reviews" className="hover:text-slate-700">
                            Supervisor Review
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Baru</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Input Review Kompetensi
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Berikan penilaian holistik atas kompetensi seorang bawahan.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-7 rounded-2xl bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:p-7"
                >
                    <div className="space-y-2.5">
                        <RequiredLabel required>Karyawan</RequiredLabel>
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

                    <div className="space-y-2.5">
                        <RequiredLabel required>Kompetensi</RequiredLabel>
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

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2.5">
                            <RequiredLabel required>Rating</RequiredLabel>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => form.setData('rating', n)}
                                        className="rounded-md p-1 transition-colors hover:bg-amber-50"
                                    >
                                        <Star
                                            className={cn(
                                                'size-7',
                                                n <= form.data.rating
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'text-slate-200',
                                            )}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="text-[11px] text-slate-500">
                                Rating: {form.data.rating} bintang
                            </p>
                        </div>
                        <div className="space-y-2.5">
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

                    <div className="space-y-2.5">
                        <RequiredLabel htmlFor="notes">Catatan / Feedback</RequiredLabel>
                        <Textarea
                            id="notes"
                            rows={5}
                            placeholder="Tuliskan observasi spesifik, contoh perilaku, area untuk dikembangkan..."
                            value={form.data.notes}
                            onChange={(e) => form.setData('notes', e.target.value)}
                        />
                        <FieldError message={form.errors.notes} />
                    </div>

                    <div className="space-y-2.5">
                        <RequiredLabel required>Status</RequiredLabel>
                        <Select
                            value={form.data.approval_status}
                            onValueChange={(v) => form.setData('approval_status', v)}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending_review">Menunggu Approval HR</SelectItem>
                                <SelectItem value="approved">Langsung Setujui</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button asChild type="button" variant="outline" className="rounded-xl">
                            <Link href="/admin/supervisor-reviews">
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
                            {form.processing ? 'Menyimpan...' : 'Simpan Review'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
