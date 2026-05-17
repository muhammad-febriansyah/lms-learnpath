import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, FileText, Save, Scale } from 'lucide-react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import { RichTextEditor } from '@/components/rich-text-editor';
import { IconChevR } from '@/components/learnpath-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import admin from '@/routes/admin';

type Props = {
    document: {
        type: 'terms' | 'privacy';
        label: string;
        title: string;
        content: string;
    };
};

export default function LegalDocumentForm({ document }: Props) {
    const form = useForm({
        title: document.title,
        content: document.content,
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post(
            document.type === 'terms'
                ? admin.settings.legal.terms.update()
                : admin.settings.legal.privacy.update(),
            {
                preserveScroll: true,
            },
        );
    }

    return (
        <>
            <Head title={document.label} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href={admin.dashboard().url} className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <Link href={admin.settings.index().url} className="hover:text-slate-700">
                            Pengaturan
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">{document.label}</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        {document.label}
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Kelola judul dan konten legal resmi yang akan ditampilkan ke pengguna.
                    </p>
                </div>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
                    <form
                        onSubmit={submit}
                        className="space-y-5 rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:p-6"
                    >
                        <div className="space-y-2">
                            <RequiredLabel htmlFor="title" required>
                                Title
                            </RequiredLabel>
                            <Input
                                id="title"
                                value={form.data.title}
                                onChange={(event) => form.setData('title', event.target.value)}
                                placeholder={`Masukkan judul ${document.label.toLowerCase()}`}
                            />
                            <FieldError message={form.errors.title} />
                        </div>

                        <div className="space-y-2">
                            <RequiredLabel required>Isi Dokumen</RequiredLabel>
                            <RichTextEditor
                                value={form.data.content}
                                onChange={(value) => form.setData('content', value)}
                                placeholder="Tulis isi dokumen legal dengan heading, paragraf, list, kutipan, dan tautan..."
                            />
                            <FieldError message={form.errors.content} />
                        </div>

                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <Button asChild type="button" variant="outline" className="rounded-xl">
                                <Link href={admin.settings.index().url}>
                                    <ArrowLeft className="mr-1.5 size-4" />
                                    Kembali
                                </Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-xl bg-brand-600 hover:bg-brand-700"
                            >
                                <Save className="mr-1.5 size-4" />
                                {form.processing ? 'Menyimpan...' : 'Simpan Dokumen'}
                            </Button>
                        </div>
                    </form>

                    <aside className="space-y-4">
                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
                            <div className="flex items-center gap-3">
                                <div className="grid size-11 place-items-center rounded-2xl bg-slate-100 text-slate-700">
                                    <Scale className="size-5" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-900">Legal Editor</h2>
                                    <p className="text-sm text-slate-500">
                                        Gunakan heading, list, link, dan kutipan agar dokumen legal lebih rapi dibaca.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
                            <div className="flex items-center gap-3">
                                <div className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                                    <FileText className="size-5" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-900">Konten HTML</h2>
                                    <p className="text-sm text-slate-500">
                                        Editor ini menyimpan konten rich text dalam format HTML agar siap dipakai untuk halaman publik.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
}
