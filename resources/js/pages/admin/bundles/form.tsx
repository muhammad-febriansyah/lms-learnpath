import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ChevronDown, ChevronUp, Save, Upload, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { FieldError } from '@/components/form/field-error';
import { RupiahInput } from '@/components/form/rupiah-input';
import { RequiredLabel } from '@/components/form/required-label';
import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

type Bundle = {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    thumbnail: string | null;
    price: number;
    compare_at_price: number | null;
    is_published: boolean;
    course_ids: number[];
};

type CourseOption = { id: number; title: string; price: number };

type Props = {
    bundle: Bundle | null;
    courses: CourseOption[];
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

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

export default function BundleForm({ bundle, courses }: Props) {
    const isEdit = !!bundle;

    const form = useForm<{
        _method?: 'put';
        title: string;
        slug: string;
        description: string;
        thumbnail: File | null;
        thumbnail_existing: string;
        thumbnail_remove: boolean;
        price: number | '';
        compare_at_price: number | '';
        course_ids: number[];
        is_published: boolean;
    }>({
        ...(bundle ? { _method: 'put' as const } : {}),
        title: bundle?.title ?? '',
        slug: bundle?.slug ?? '',
        description: bundle?.description ?? '',
        thumbnail: null,
        thumbnail_existing: bundle?.thumbnail ?? '',
        thumbnail_remove: false,
        price: bundle?.price ?? '',
        compare_at_price: bundle?.compare_at_price ?? '',
        course_ids: bundle?.course_ids ?? [],
        is_published: bundle?.is_published ?? false,
    });

    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!isEdit && form.data.title && !form.data.slug) {
            form.setData('slug', slugify(form.data.title));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.data.title]);

    const selectedCourses = useMemo(
        () =>
            form.data.course_ids
                .map((id) => courses.find((c) => c.id === id))
                .filter((c): c is CourseOption => c !== undefined),
        [form.data.course_ids, courses],
    );

    const totalCourseValue = selectedCourses.reduce((sum, c) => sum + c.price, 0);

    const availableCourses = useMemo(() => {
        const term = search.toLowerCase().trim();
        return courses.filter(
            (c) =>
                !form.data.course_ids.includes(c.id) &&
                (term === '' || c.title.toLowerCase().includes(term)),
        );
    }, [courses, form.data.course_ids, search]);

    function submit(event: React.FormEvent) {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            price: data.price === '' ? 0 : Number(data.price),
            compare_at_price:
                data.compare_at_price === '' ? null : Number(data.compare_at_price),
        }));

        const url = isEdit ? `/admin/bundles/${bundle!.id}` : '/admin/bundles';
        form.post(url, { forceFormData: true });
    }

    function addCourse(id: number) {
        if (form.data.course_ids.includes(id)) return;
        form.setData('course_ids', [...form.data.course_ids, id]);
    }

    function removeCourse(id: number) {
        form.setData(
            'course_ids',
            form.data.course_ids.filter((c) => c !== id),
        );
    }

    function moveCourse(id: number, dir: -1 | 1) {
        const idx = form.data.course_ids.indexOf(id);
        const target = idx + dir;
        if (idx < 0 || target < 0 || target >= form.data.course_ids.length) return;
        const next = [...form.data.course_ids];
        [next[idx], next[target]] = [next[target], next[idx]];
        form.setData('course_ids', next);
    }

    return (
        <>
            <Head title={isEdit ? 'Edit Paket' : 'Tambah Paket'} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <Link href="/admin/bundles" className="hover:text-slate-700">
                            Paket
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            {isEdit ? 'Edit' : 'Tambah'}
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        {isEdit ? 'Edit Paket' : 'Tambah Paket'}
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        {isEdit
                            ? 'Perbarui detail paket dan daftar kursus.'
                            : 'Gabungkan beberapa kursus jadi satu paket dengan harga lebih hemat.'}
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-7 rounded-2xl bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:p-7"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                            <RequiredLabel htmlFor="title" required>
                                Judul Paket
                            </RequiredLabel>
                            <Input
                                id="title"
                                placeholder="Contoh: Paket Belajar Digital Marketing"
                                value={form.data.title}
                                onChange={(e) => form.setData('title', e.target.value)}
                            />
                            <FieldError message={form.errors.title} />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <RequiredLabel htmlFor="slug" required>
                                Slug
                            </RequiredLabel>
                            <Input
                                id="slug"
                                placeholder="paket-belajar-digital-marketing"
                                value={form.data.slug}
                                onChange={(e) => form.setData('slug', slugify(e.target.value))}
                            />
                            <p className="text-[11.5px] text-slate-500">
                                URL paket. Hanya huruf kecil, angka, dan tanda hubung.
                            </p>
                            <FieldError message={form.errors.slug} />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <RequiredLabel htmlFor="description">Deskripsi</RequiredLabel>
                            <Textarea
                                id="description"
                                rows={4}
                                placeholder="Ringkasan paket dan manfaatnya..."
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                            />
                            <FieldError message={form.errors.description} />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <RequiredLabel>Thumbnail Paket</RequiredLabel>
                            <ThumbnailUpload
                                file={form.data.thumbnail}
                                existingUrl={form.data.thumbnail_existing}
                                onFileChange={(f) => {
                                    form.setData('thumbnail', f);
                                    if (f) form.setData('thumbnail_remove', false);
                                }}
                                onRemove={() => {
                                    form.setData('thumbnail', null);
                                    form.setData('thumbnail_existing', '');
                                    form.setData('thumbnail_remove', true);
                                }}
                            />
                            <p className="text-[11.5px] text-slate-500">
                                PNG / JPG / WEBP. Rasio 16:9, maks 2 MB.
                            </p>
                            <FieldError message={form.errors.thumbnail} />
                        </div>

                        <div className="space-y-2.5">
                            <RequiredLabel htmlFor="price" required>
                                Harga Paket (Rp)
                            </RequiredLabel>
                            <RupiahInput
                                id="price"
                                value={form.data.price}
                                onChange={(value) => form.setData('price', value)}
                                onClear={() => form.setData('price', '')}
                            />
                            <FieldError message={form.errors.price} />
                        </div>

                        <div className="space-y-2.5">
                            <RequiredLabel htmlFor="compare_at_price">
                                Harga Normal (Rp)
                            </RequiredLabel>
                            <RupiahInput
                                id="compare_at_price"
                                placeholder="Opsional, untuk tampilan 'coret'"
                                value={form.data.compare_at_price}
                                onChange={(value) => form.setData('compare_at_price', value)}
                                onClear={() => form.setData('compare_at_price', '')}
                            />
                            <p className="text-[11.5px] text-slate-500">
                                Total kursus jika dibeli terpisah: {formatRupiah(totalCourseValue)}
                            </p>
                            <FieldError message={form.errors.compare_at_price} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <RequiredLabel required>Kursus dalam Paket</RequiredLabel>

                        <div className="rounded-xl border border-slate-200">
                            <div className="border-b border-slate-100 p-3">
                                <Input
                                    placeholder="Cari kursus untuk ditambahkan..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="max-h-48 overflow-auto">
                                {availableCourses.length === 0 ? (
                                    <p className="p-4 text-center text-[12.5px] text-slate-500">
                                        {search === ''
                                            ? 'Semua kursus sudah ditambahkan.'
                                            : 'Kursus tidak ditemukan.'}
                                    </p>
                                ) : (
                                    <ul className="divide-y divide-slate-100">
                                        {availableCourses.map((c) => (
                                            <li key={c.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => addCourse(c.id)}
                                                    className="flex w-full items-center justify-between gap-3 p-3 text-left transition hover:bg-slate-50"
                                                >
                                                    <span className="flex-1 text-[13px] text-slate-900">
                                                        {c.title}
                                                    </span>
                                                    <span className="text-[11.5px] text-slate-500 tabular-nums">
                                                        {formatRupiah(c.price)}
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {selectedCourses.length === 0 ? (
                            <p className="rounded-xl bg-rose-50 px-3 py-2 text-[12.5px] text-rose-700">
                                Belum ada kursus dipilih. Tambah minimal satu kursus.
                            </p>
                        ) : (
                            <div className="rounded-xl border border-slate-200">
                                <div className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-[11.5px] font-semibold text-slate-700">
                                    Urutan kursus ({selectedCourses.length} item)
                                </div>
                                <ul className="divide-y divide-slate-100">
                                    {selectedCourses.map((c, idx) => (
                                        <li
                                            key={c.id}
                                            className="flex items-center gap-2 p-3"
                                        >
                                            <Badge className="border-transparent bg-brand-50 text-brand-700 hover:bg-brand-50 tabular-nums">
                                                {idx + 1}
                                            </Badge>
                                            <span className="flex-1 text-[13px] text-slate-900">
                                                {c.title}
                                            </span>
                                            <span className="text-[11.5px] text-slate-500 tabular-nums">
                                                {formatRupiah(c.price)}
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="h-7 rounded-xl bg-slate-700 px-2 text-[11.5px] text-white shadow-sm hover:bg-slate-800"
                                                    disabled={idx === 0}
                                                    onClick={() => moveCourse(c.id, -1)}
                                                >
                                                    <ChevronUp className="mr-0.5 size-3.5" />
                                                    Naik
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="h-7 rounded-xl bg-slate-700 px-2 text-[11.5px] text-white shadow-sm hover:bg-slate-800"
                                                    disabled={idx === selectedCourses.length - 1}
                                                    onClick={() => moveCourse(c.id, 1)}
                                                >
                                                    <ChevronDown className="mr-0.5 size-3.5" />
                                                    Turun
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="h-7 rounded-xl bg-rose-600 px-2 text-[11.5px] text-white shadow-sm hover:bg-rose-700"
                                                    onClick={() => removeCourse(c.id)}
                                                >
                                                    <X className="mr-0.5 size-3.5" />
                                                    Hapus
                                                </Button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <FieldError message={form.errors.course_ids as unknown as string} />
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                        <div>
                            <div className="text-[13.5px] font-semibold text-slate-900">
                                Publish
                            </div>
                            <div className="text-[12px] text-slate-500">
                                Paket tampil di catalog publik dan bisa dibeli.
                            </div>
                        </div>
                        <Switch
                            checked={form.data.is_published}
                            onCheckedChange={(checked) => form.setData('is_published', checked)}
                        />
                    </div>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button asChild type="button" variant="outline" className="rounded-xl">
                            <Link href="/admin/bundles">
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
                                  : 'Buat Paket'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

function ThumbnailUpload({
    file,
    existingUrl,
    onFileChange,
    onRemove,
}: {
    file: File | null;
    existingUrl: string;
    onFileChange: (f: File | null) => void;
    onRemove: () => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const displayUrl =
        preview ??
        (existingUrl
            ? existingUrl.startsWith('http')
                ? existingUrl
                : `/storage/${existingUrl}`
            : null);

    return (
        <div>
            <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            />
            {displayUrl ? (
                <div className="space-y-2">
                    <div className="overflow-hidden rounded-xl ring-1 ring-slate-200">
                        <img
                            src={displayUrl}
                            alt="Thumbnail"
                            className="aspect-video w-full object-cover"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => inputRef.current?.click()}
                        >
                            <Upload className="mr-1.5 size-3.5" />
                            Ganti file
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                onRemove();
                                if (inputRef.current) inputRef.current.value = '';
                            }}
                            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        >
                            <X className="mr-1.5 size-3.5" />
                            Hapus
                        </Button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-center transition hover:border-brand-300 hover:bg-brand-50/40"
                >
                    <Upload className="mb-2 size-6 text-slate-400" />
                    <span className="text-[13px] font-semibold text-slate-700">
                        Klik untuk upload gambar
                    </span>
                    <span className="text-[11.5px] text-slate-500">
                        PNG / JPG / WEBP, rasio 16:9, maks 2 MB
                    </span>
                </button>
            )}
        </div>
    );
}
