import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useEffect } from 'react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import { IconChevR } from '@/components/learnpath-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Tag = {
    id: number;
    name: string;
    slug: string;
};

type Props = {
    tag: Tag | null;
};

function slugify(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

export default function TagForm({ tag }: Props) {
    const isEdit = !!tag;

    const form = useForm({
        name: tag?.name ?? '',
        slug: tag?.slug ?? '',
    });

    useEffect(() => {
        if (!isEdit && form.data.name && !form.data.slug) {
            form.setData('slug', slugify(form.data.name));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.data.name]);

    function submit(event: React.FormEvent) {
        event.preventDefault();

        if (isEdit) {
            form.put(`/admin/tags/${tag!.id}`);
        } else {
            form.post('/admin/tags');
        }
    }

    return (
        <>
            <Head title={isEdit ? 'Edit Tag' : 'Tambah Tag'} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <Link href="/admin/tags" className="hover:text-slate-700">
                            Tag
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            {isEdit ? 'Edit' : 'Tambah'}
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        {isEdit ? 'Edit Tag' : 'Tambah Tag'}
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        {isEdit
                            ? 'Perbarui informasi tag.'
                            : 'Buat tag baru untuk pencarian dan filter course.'}
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-5 rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:p-6"
                >
                    <div className="space-y-2">
                        <RequiredLabel htmlFor="name" required>
                            Nama Tag
                        </RequiredLabel>
                        <Input
                            id="name"
                            placeholder="Contoh: React, Pemula, Karier"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                        />
                        <FieldError message={form.errors.name} />
                    </div>

                    <div className="space-y-2">
                        <RequiredLabel htmlFor="slug" required>
                            Slug
                        </RequiredLabel>
                        <Input
                            id="slug"
                            placeholder="contoh: react"
                            value={form.data.slug}
                            onChange={(e) => form.setData('slug', slugify(e.target.value))}
                        />
                        <p className="text-[11.5px] text-slate-500">
                            Otomatis dari nama. Hanya huruf kecil, angka, dan tanda hubung.
                        </p>
                        <FieldError message={form.errors.slug} />
                    </div>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button asChild type="button" variant="outline" className="rounded-xl">
                            <Link href="/admin/tags">
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
                                  : 'Simpan Tag'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
