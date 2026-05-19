import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ImageIcon, Save, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
    thumbnail_url?: string | null;
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

    const form = useForm<{
        _method?: string;
        name: string;
        slug: string;
        description: string;
        is_active: boolean;
        thumbnail: File | null;
        remove_thumbnail: boolean;
    }>({
        ...(category ? { _method: 'PUT' } : {}),
        name: category?.name ?? '',
        slug: category?.slug ?? '',
        description: category?.description ?? '',
        is_active: category?.is_active ?? true,
        thumbnail: null,
        remove_thumbnail: false,
    });

    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
        category?.thumbnail_url ?? null,
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;

        if (file) {
            form.setData('thumbnail', file);
            form.setData('remove_thumbnail', false);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    }

    function onRemoveThumbnail() {
        form.setData('thumbnail', null);
        form.setData('remove_thumbnail', true);
        setThumbnailPreview(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    useEffect(() => {
        if (!isEdit && form.data.name && !form.data.slug) {
            form.setData('slug', slugify(form.data.name));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.data.name]);

    function submit(event: React.FormEvent) {
        event.preventDefault();

        if (isEdit) {
            form.post(`/admin/categories/${category!.id}`, {
                forceFormData: true,
            });
        } else {
            form.post('/admin/categories', { forceFormData: true });
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
                    className="space-y-7 rounded-2xl bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:p-7"
                >
                    <div className="space-y-2.5">
                        <RequiredLabel htmlFor="name" required>
                            Nama Kategori
                        </RequiredLabel>
                        <Input
                            id="name"
                            placeholder="Contoh: Digital Marketing"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            className="h-11"
                        />
                        <FieldError message={form.errors.name} />
                    </div>

                    <div className="space-y-2.5">
                        <RequiredLabel htmlFor="slug" required>
                            Slug
                        </RequiredLabel>
                        <Input
                            id="slug"
                            placeholder="contoh: digital-marketing"
                            value={form.data.slug}
                            onChange={(e) => form.setData('slug', slugify(e.target.value))}
                            className="h-11"
                        />
                        <p className="text-[11.5px] text-slate-500">
                            URL ramah pencarian. Hanya huruf kecil, angka, dan tanda hubung.
                        </p>
                        <FieldError message={form.errors.slug} />
                    </div>

                    <div className="space-y-2.5">
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

                    <div className="space-y-2.5">
                        <RequiredLabel htmlFor="thumbnail">
                            Thumbnail
                        </RequiredLabel>
                        <input
                            ref={fileInputRef}
                            id="thumbnail"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={onPickFile}
                            className="hidden"
                        />
                        {thumbnailPreview ? (
                            <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
                                <img
                                    src={thumbnailPreview}
                                    alt="Thumbnail kategori"
                                    className="aspect-[3/2] w-full object-cover"
                                />
                                <div className="absolute right-3 top-3 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:bg-white"
                                    >
                                        <Upload className="size-3.5" />
                                        Ganti
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onRemoveThumbnail}
                                        className="inline-flex items-center gap-1 rounded-full bg-rose-500/90 px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm backdrop-blur transition hover:bg-rose-600"
                                    >
                                        <X className="size-3.5" />
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex w-full max-w-md flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-brand-400 hover:bg-brand-50"
                            >
                                <span className="grid size-10 place-items-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200">
                                    <ImageIcon className="size-5" />
                                </span>
                                <span className="text-[13.5px] font-semibold text-slate-700">
                                    Pilih gambar
                                </span>
                                <span className="text-[11.5px] text-slate-500">
                                    JPG, PNG, atau WebP · Maks 2 MB
                                </span>
                            </button>
                        )}
                        <p className="text-[11.5px] text-slate-500">
                            Gambar tampil sebagai background card kategori di
                            landing page.
                        </p>
                        <FieldError message={form.errors.thumbnail} />
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-5">
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
