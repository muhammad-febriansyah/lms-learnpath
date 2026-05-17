import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Save, X } from 'lucide-react';
import { useEffect } from 'react';

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

type PathInput = {
    id?: number;
    title: string;
    slug: string;
    subtitle: string | null;
    description: string | null;
    thumbnail: string | null;
    level: string | null;
    duration_weeks: number | null;
    position_id: number | null;
    target_audience: string[] | null;
    outcomes: string[] | null;
    is_published: boolean;
};

type Props = {
    path: PathInput | null;
    positions: { id: number; name: string }[];
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

export default function LearningPathForm({ path, positions }: Props) {
    const isEdit = !!path;

    const form = useForm<{
        title: string;
        slug: string;
        subtitle: string;
        description: string;
        thumbnail: string;
        level: string;
        duration_weeks: number | '';
        position_id: number | '';
        target_audience: string[];
        outcomes: string[];
        is_published: boolean;
    }>({
        title: path?.title ?? '',
        slug: path?.slug ?? '',
        subtitle: path?.subtitle ?? '',
        description: path?.description ?? '',
        thumbnail: path?.thumbnail ?? '',
        level: path?.level ?? '',
        duration_weeks: path?.duration_weeks ?? '',
        position_id: path?.position_id ?? '',
        target_audience: path?.target_audience ?? [''],
        outcomes: path?.outcomes ?? [''],
        is_published: path?.is_published ?? false,
    });

    useEffect(() => {
        if (!isEdit && form.data.title && !form.data.slug) {
            form.setData('slug', slugify(form.data.title));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.data.title]);

    const addItem = (key: 'target_audience' | 'outcomes') => {
        form.setData(key, [...form.data[key], '']);
    };

    const setItem = (key: 'target_audience' | 'outcomes', idx: number, value: string) => {
        form.setData(
            key,
            form.data[key].map((v, i) => (i === idx ? value : v)),
        );
    };

    const removeItem = (key: 'target_audience' | 'outcomes', idx: number) => {
        form.setData(
            key,
            form.data[key].filter((_, i) => i !== idx),
        );
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...form.data,
            target_audience: form.data.target_audience.filter(Boolean),
            outcomes: form.data.outcomes.filter(Boolean),
        };
        if (isEdit) {
            form.transform(() => payload).put(`/admin/learning-paths/${path!.id}`);
        } else {
            form.transform(() => payload).post('/admin/learning-paths');
        }
    };

    return (
        <>
            <Head title={isEdit ? 'Edit Path' : 'Buat Path'} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <Link href="/admin/learning-paths" className="hover:text-slate-700">
                            Learning Path
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            {isEdit ? 'Edit' : 'Buat Baru'}
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        {isEdit ? 'Edit Learning Path' : 'Buat Learning Path'}
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Set metadata. Pengelolaan urutan course dilakukan di halaman detail.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-5 rounded-2xl bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <RequiredLabel htmlFor="title">Judul</RequiredLabel>
                            <Input
                                id="title"
                                value={form.data.title}
                                onChange={(e) => form.setData('title', e.target.value)}
                                placeholder="Contoh: Roadmap Account Officer"
                                className="mt-1"
                            />
                            <FieldError message={form.errors.title} />
                        </div>

                        <div className="sm:col-span-2">
                            <RequiredLabel htmlFor="slug">Slug</RequiredLabel>
                            <Input
                                id="slug"
                                value={form.data.slug}
                                onChange={(e) => form.setData('slug', e.target.value)}
                                placeholder="roadmap-account-officer"
                                className="mt-1 font-mono"
                            />
                            <FieldError message={form.errors.slug} />
                        </div>

                        <div className="sm:col-span-2">
                            <label
                                htmlFor="subtitle"
                                className="text-[12.5px] font-semibold text-slate-700"
                            >
                                Subjudul (opsional)
                            </label>
                            <Input
                                id="subtitle"
                                value={form.data.subtitle}
                                onChange={(e) => form.setData('subtitle', e.target.value)}
                                placeholder="Pelatihan komprehensif untuk Account Officer baru"
                                className="mt-1"
                            />
                            <FieldError message={form.errors.subtitle} />
                        </div>

                        <div>
                            <label
                                htmlFor="level"
                                className="text-[12.5px] font-semibold text-slate-700"
                            >
                                Level
                            </label>
                            <Select
                                value={form.data.level || 'unset'}
                                onValueChange={(v) =>
                                    form.setData('level', v === 'unset' ? '' : v)
                                }
                            >
                                <SelectTrigger id="level" className="mt-1">
                                    <SelectValue placeholder="Pilih level..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unset">— Tidak Diset —</SelectItem>
                                    <SelectItem value="beginner">Pemula</SelectItem>
                                    <SelectItem value="intermediate">Menengah</SelectItem>
                                    <SelectItem value="advanced">Lanjutan</SelectItem>
                                </SelectContent>
                            </Select>
                            <FieldError message={form.errors.level} />
                        </div>

                        <div>
                            <label
                                htmlFor="duration_weeks"
                                className="text-[12.5px] font-semibold text-slate-700"
                            >
                                Durasi (minggu)
                            </label>
                            <Input
                                id="duration_weeks"
                                type="number"
                                min={1}
                                max={104}
                                value={form.data.duration_weeks}
                                onChange={(e) =>
                                    form.setData(
                                        'duration_weeks',
                                        e.target.value === '' ? '' : Number(e.target.value),
                                    )
                                }
                                placeholder="8"
                                className="mt-1"
                            />
                            <FieldError message={form.errors.duration_weeks} />
                        </div>

                        <div className="sm:col-span-2">
                            <label
                                htmlFor="position_id"
                                className="text-[12.5px] font-semibold text-slate-700"
                            >
                                Jabatan terkait (opsional)
                            </label>
                            <Select
                                value={
                                    form.data.position_id ? String(form.data.position_id) : 'none'
                                }
                                onValueChange={(v) =>
                                    form.setData('position_id', v === 'none' ? '' : Number(v))
                                }
                            >
                                <SelectTrigger id="position_id" className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">— Tidak terikat jabatan —</SelectItem>
                                    {positions.map((p) => (
                                        <SelectItem key={p.id} value={String(p.id)}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="mt-1 text-[11px] text-slate-500">
                                Karyawan dengan jabatan ini otomatis di-enroll ke path saat HR
                                undang mereka.
                            </p>
                            <FieldError message={form.errors.position_id} />
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
                                rows={4}
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                                placeholder="Penjelasan singkat tentang path ini..."
                                className="mt-1"
                            />
                            <FieldError message={form.errors.description} />
                        </div>

                        <ArrayEditor
                            label="Cocok untuk"
                            description="Daftar target peserta (mis. karyawan baru AO, MDP)"
                            placeholder="Karyawan baru di posisi ..."
                            values={form.data.target_audience}
                            onAdd={() => addItem('target_audience')}
                            onSet={(i, v) => setItem('target_audience', i, v)}
                            onRemove={(i) => removeItem('target_audience', i)}
                        />

                        <ArrayEditor
                            label="Yang Anda Capai"
                            description="Outcome / learning goals yang dicapai setelah selesai"
                            placeholder="Memahami fundamental ..."
                            values={form.data.outcomes}
                            onAdd={() => addItem('outcomes')}
                            onSet={(i, v) => setItem('outcomes', i, v)}
                            onRemove={(i) => removeItem('outcomes', i)}
                        />

                        <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-slate-200 p-4">
                            <div>
                                <div className="text-[13.5px] font-semibold text-slate-900">
                                    Publikasikan
                                </div>
                                <div className="text-[11.5px] text-slate-500">
                                    Path yang published muncul di katalog publik /paths.
                                </div>
                            </div>
                            <Switch
                                checked={form.data.is_published}
                                onCheckedChange={(v) => form.setData('is_published', v)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                        <Button asChild variant="outline">
                            <Link href="/admin/learning-paths">
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
                                  : 'Buat & Lanjut ke Course'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

function ArrayEditor({
    label,
    description,
    placeholder,
    values,
    onAdd,
    onSet,
    onRemove,
}: {
    label: string;
    description: string;
    placeholder: string;
    values: string[];
    onAdd: () => void;
    onSet: (idx: number, value: string) => void;
    onRemove: (idx: number) => void;
}) {
    return (
        <div className="sm:col-span-2">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-[12.5px] font-semibold text-slate-700">{label}</div>
                    <div className="text-[11px] text-slate-500">{description}</div>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={onAdd}>
                    <Plus className="mr-1 size-3.5" />
                    Tambah
                </Button>
            </div>
            <ul className="mt-2 space-y-2">
                {values.map((value, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                        <Input
                            value={value}
                            onChange={(e) => onSet(idx, e.target.value)}
                            placeholder={placeholder}
                        />
                        <Button
                            type="button"
                            size="sm"
                            className="h-9 shrink-0 rounded-xl bg-rose-600 text-white shadow-sm hover:bg-rose-700"
                            onClick={() => onRemove(idx)}
                            disabled={values.length <= 1}
                        >
                            <X className="mr-1 size-3.5" />
                            Hapus
                        </Button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
