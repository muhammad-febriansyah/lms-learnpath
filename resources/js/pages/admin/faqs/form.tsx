import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import { IconChevR } from '@/components/learnpath-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

type Faq = {
    id: number;
    category: string | null;
    question: string;
    answer: string;
    sort_order: number;
    is_active: boolean;
};

type Props = {
    faq: Faq | null;
};

export default function FaqForm({ faq }: Props) {
    const isEdit = !!faq;

    const form = useForm({
        category: faq?.category ?? '',
        question: faq?.question ?? '',
        answer: faq?.answer ?? '',
        sort_order: faq?.sort_order ?? 0,
        is_active: faq?.is_active ?? true,
    });

    function submit(event: React.FormEvent) {
        event.preventDefault();

        if (isEdit) {
            form.put(`/admin/faqs/${faq!.id}`);
        } else {
            form.post('/admin/faqs');
        }
    }

    return (
        <>
            <Head title={isEdit ? 'Edit FAQ' : 'Tambah FAQ'} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link
                            href="/admin/dashboard"
                            className="hover:text-slate-700"
                        >
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <Link
                            href="/admin/faqs"
                            className="hover:text-slate-700"
                        >
                            FAQ
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            {isEdit ? 'Edit' : 'Tambah'}
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        {isEdit ? 'Edit FAQ' : 'Tambah FAQ'}
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        {isEdit
                            ? 'Perbarui pertanyaan, jawaban, atau status FAQ.'
                            : 'Tambahkan pertanyaan beserta jawabannya untuk membantu pengguna.'}
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-7 rounded-2xl bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:p-7"
                >
                    <div className="grid gap-6 sm:grid-cols-[1fr_140px]">
                        <div className="space-y-2.5">
                            <RequiredLabel htmlFor="category">
                                Kategori
                            </RequiredLabel>
                            <Input
                                id="category"
                                placeholder="Contoh: Akun, Pembayaran, Kursus"
                                value={form.data.category}
                                onChange={(e) =>
                                    form.setData('category', e.target.value)
                                }
                                className="h-11"
                            />
                            <p className="text-[11.5px] text-slate-500">
                                Opsional. Digunakan untuk mengelompokkan FAQ.
                            </p>
                            <FieldError message={form.errors.category} />
                        </div>

                        <div className="space-y-2.5">
                            <RequiredLabel htmlFor="sort_order">
                                Urutan
                            </RequiredLabel>
                            <Input
                                id="sort_order"
                                type="number"
                                min={0}
                                placeholder="0"
                                value={form.data.sort_order}
                                onChange={(e) =>
                                    form.setData(
                                        'sort_order',
                                        Number(e.target.value),
                                    )
                                }
                                className="h-11"
                            />
                            <FieldError message={form.errors.sort_order} />
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <RequiredLabel htmlFor="question" required>
                            Pertanyaan
                        </RequiredLabel>
                        <Input
                            id="question"
                            placeholder="Contoh: Bagaimana cara mendaftar?"
                            value={form.data.question}
                            onChange={(e) =>
                                form.setData('question', e.target.value)
                            }
                            className="h-11"
                        />
                        <FieldError message={form.errors.question} />
                    </div>

                    <div className="space-y-2.5">
                        <RequiredLabel htmlFor="answer" required>
                            Jawaban
                        </RequiredLabel>
                        <Textarea
                            id="answer"
                            rows={6}
                            placeholder="Tulis jawaban yang jelas dan ringkas..."
                            value={form.data.answer}
                            onChange={(e) =>
                                form.setData('answer', e.target.value)
                            }
                        />
                        <FieldError message={form.errors.answer} />
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-5">
                        <div>
                            <div className="text-[13.5px] font-semibold text-slate-900">
                                Status Aktif
                            </div>
                            <div className="text-[12px] text-slate-500">
                                FAQ nonaktif tidak ditampilkan ke pengguna.
                            </div>
                        </div>
                        <Switch
                            checked={form.data.is_active}
                            onCheckedChange={(checked) =>
                                form.setData('is_active', checked)
                            }
                        />
                    </div>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button
                            asChild
                            type="button"
                            variant="outline"
                            className="rounded-xl"
                        >
                            <Link href="/admin/faqs">
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
                            {form.processing
                                ? 'Menyimpan...'
                                : isEdit
                                  ? 'Simpan Perubahan'
                                  : 'Simpan FAQ'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
