import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useEffect } from 'react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import { IconChevR } from '@/components/learnpath-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

type Category = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
};

type Props = {
    category: Category | null;
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

export default function CategoryForm({ category }: Props) {
    const isEdit = !!category;

    const form = useForm({
        name: category?.name ?? '',
        slug: category?.slug ?? '',
        description: category?.description ?? '',
        is_active: category?.is_active ?? true,
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
            form.put(`/admin/categories/${category!.id}`);
        } else {
            form.post('/admin/categories');
        }
    }

    return (
        <>
            <Head title={isEdit ? 'Edit Kategori' : 'Tambah Kategori'} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <Link
                            href="/admin/categories"
                            className="hover:text-slate-700"
                        >
                            Kategori
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            {isEdit ? 'Edit' : 'Tambah'}
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        {isEdit ? 'Edit Kategori' : 'Tambah Kategori'}
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        {isEdit
                            ? 'Perbarui informasi kategori.'
                            : 'Lengkapi data kategori baru untuk pengelompokan course.'}
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-5 rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:p-6"
                >
                    <div className="space-y-2">
                        <RequiredLabel htmlFor="name" required>
                            Nama Kategori
                        </RequiredLabel>
                        <Input
                            id="name"
                            placeholder="Contoh: Digital Marketing"
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
                            placeholder="contoh: digital-marketing"
                            value={form.data.slug}
                            onChange={(e) => form.setData('slug', slugify(e.target.value))}
                        />
                        <p className="text-[11.5px] text-slate-500">
                            URL ramah pencarian. Hanya huruf kecil, angka, dan tanda hubung.
                        </p>
                        <FieldError message={form.errors.slug} />
                    </div>

                    <div className="space-y-2">
                        <RequiredLabel htmlFor="description">Deskripsi</RequiredLabel>
                        <Textarea
                            id="description"
                            rows={4}
                            placeholder="Jelaskan ringkas tentang kategori ini..."
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                        />
                        <FieldError message={form.errors.description} />
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                        <div>
                            <div className="text-[13.5px] font-semibold text-slate-900">
                                Status Aktif
                            </div>
                            <div className="text-[12px] text-slate-500">
                                Kategori nonaktif tidak ditampilkan di catalog publik.
                            </div>
                        </div>
                        <Switch
                            checked={form.data.is_active}
                            onCheckedChange={(checked) => form.setData('is_active', checked)}
                        />
                    </div>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button
                            asChild
                            type="button"
                            variant="outline"
                            className="rounded-xl"
                        >
                            <Link href="/admin/categories">
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
                                  : 'Simpan Kategori'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
