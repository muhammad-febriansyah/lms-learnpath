import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, GripVertical, Plus, Save, X } from 'lucide-react';
import { useEffect } from 'react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import { RupiahInput } from '@/components/form/rupiah-input';
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
import { cn } from '@/lib/utils';

type Option = { value: string; label: string };
type CategoryOption = { id: number; name: string };
type InstructorOption = { id: number; name: string; email: string };
type TagOption = { id: number; name: string };

type Course = {
    id: number;
    category_id: number | null;
    instructor_id: number | null;
    title: string;
    subtitle: string | null;
    slug: string;
    description: string | null;
    thumbnail: string | null;
    preview_video_url: string | null;
    price: number;
    compare_at_price: number | null;
    level: string | null;
    delivery_format: string;
    is_certified: boolean;
    language: string | null;
    duration_minutes: number;
    schedule_start: string | null;
    schedule_end: string | null;
    schedule_location: string | null;
    pre_test_required: boolean;
    post_test_required: boolean;
    passing_score: number;
    max_attempts: number;
    learning_objectives: string[] | null;
    requirements: string[] | null;
    target_audience: string[] | null;
    is_published: boolean;
    tag_ids: number[];
};

type Props = {
    course: Course | null;
    categoryOptions: CategoryOption[];
    instructorOptions: InstructorOption[];
    tagOptions: TagOption[];
    levelOptions: Option[];
    languageOptions: Option[];
    formatOptions: Option[];
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

export default function CourseForm({
    course,
    categoryOptions,
    instructorOptions,
    tagOptions,
    levelOptions,
    languageOptions,
    formatOptions,
}: Props) {
    const isEdit = !!course;

    const toLocal = (iso: string | null): string =>
        iso ? iso.slice(0, 16) : '';

    const form = useForm({
        category_id: course?.category_id ? String(course.category_id) : '',
        instructor_id: course?.instructor_id ? String(course.instructor_id) : '',
        title: course?.title ?? '',
        subtitle: course?.subtitle ?? '',
        slug: course?.slug ?? '',
        description: course?.description ?? '',
        thumbnail: course?.thumbnail ?? '',
        preview_video_url: course?.preview_video_url ?? '',
        price: course?.price ?? 0,
        compare_at_price: course?.compare_at_price ?? '',
        level: course?.level ?? 'beginner',
        delivery_format: course?.delivery_format ?? 'on_demand',
        is_certified: course?.is_certified ?? false,
        language: course?.language ?? 'id',
        duration_minutes: course?.duration_minutes ?? 0,
        schedule_start: toLocal(course?.schedule_start ?? null),
        schedule_end: toLocal(course?.schedule_end ?? null),
        schedule_location: course?.schedule_location ?? '',
        pre_test_required: course?.pre_test_required ?? false,
        post_test_required: course?.post_test_required ?? true,
        passing_score: course?.passing_score ?? 70,
        max_attempts: course?.max_attempts ?? 3,
        learning_objectives: (course?.learning_objectives ?? []) as string[],
        requirements: (course?.requirements ?? []) as string[],
        target_audience: (course?.target_audience ?? []) as string[],
        tag_ids: (course?.tag_ids ?? []) as number[],
        is_published: course?.is_published ?? false,
    });

    useEffect(() => {
        if (!isEdit && form.data.title && !form.data.slug) {
            form.setData('slug', slugify(form.data.title));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.data.title]);

    const toggleTag = (id: number) => {
        const next = form.data.tag_ids.includes(id)
            ? form.data.tag_ids.filter((t) => t !== id)
            : [...form.data.tag_ids, id];
        form.setData('tag_ids', next);
    };

    function submit(event: React.FormEvent) {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            category_id: data.category_id || null,
            instructor_id: data.instructor_id || null,
            compare_at_price:
                data.compare_at_price === '' || data.compare_at_price === null
                    ? null
                    : Number(data.compare_at_price),
            schedule_start: data.schedule_start || null,
            schedule_end: data.schedule_end || null,
            schedule_location: data.schedule_location || null,
        }));

        if (isEdit) {
            form.put(`/admin/courses/${course!.id}`);
        } else {
            form.post('/admin/courses');
        }
    }

    return (
        <>
            <Head title={isEdit ? 'Edit Course' : 'Tambah Course'} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <Link href="/admin/courses" className="hover:text-slate-700">
                            Course
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            {isEdit ? 'Edit' : 'Tambah'}
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        {isEdit ? 'Edit Course' : 'Tambah Course'}
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Lengkapi informasi course agar mudah ditemukan calon peserta.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    {/* Section 1: Info Dasar */}
                    <FormCard
                        title="Informasi Dasar"
                        description="Judul, ringkasan, dan deskripsi course."
                    >
                        <Field
                            label="Judul Course"
                            required
                            error={form.errors.title}
                        >
                            <Input
                                placeholder="Contoh: Belajar Digital Marketing Dasar"
                                value={form.data.title}
                                onChange={(e) => form.setData('title', e.target.value)}
                            />
                        </Field>

                        <Field
                            label="Subtitle"
                            error={form.errors.subtitle}
                            hint="Ringkasan singkat yang ditampilkan di bawah judul."
                        >
                            <Input
                                placeholder="Contoh: Dari nol hingga jago campaign organik"
                                value={form.data.subtitle ?? ''}
                                onChange={(e) => form.setData('subtitle', e.target.value)}
                            />
                        </Field>

                        <Field
                            label="Slug"
                            required
                            error={form.errors.slug}
                            hint="URL ramah pencarian. Hanya huruf kecil, angka, dan tanda hubung."
                        >
                            <Input
                                placeholder="belajar-digital-marketing-dasar"
                                value={form.data.slug}
                                onChange={(e) => form.setData('slug', slugify(e.target.value))}
                            />
                        </Field>

                        <Field label="Deskripsi" error={form.errors.description}>
                            <Textarea
                                rows={5}
                                placeholder="Jelaskan tujuan, materi, dan hasil yang diharapkan dari course ini..."
                                value={form.data.description ?? ''}
                                onChange={(e) => form.setData('description', e.target.value)}
                            />
                        </Field>
                    </FormCard>

                    {/* Section 2: Kategorisasi */}
                    <FormCard
                        title="Kategori & Klasifikasi"
                        description="Bantu calon peserta menemukan course Anda."
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Kategori" error={form.errors.category_id}>
                                <Select
                                    value={form.data.category_id}
                                    onValueChange={(v) => form.setData('category_id', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoryOptions.map((cat) => (
                                            <SelectItem key={cat.id} value={String(cat.id)}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field label="Instruktur" error={form.errors.instructor_id}>
                                <Select
                                    value={form.data.instructor_id}
                                    onValueChange={(v) => form.setData('instructor_id', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih instruktur" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {instructorOptions.map((inst) => (
                                            <SelectItem key={inst.id} value={String(inst.id)}>
                                                {inst.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field label="Level" error={form.errors.level}>
                                <Select
                                    value={form.data.level ?? ''}
                                    onValueChange={(v) => form.setData('level', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {levelOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field
                                label="Format Kelas"
                                required
                                error={form.errors.delivery_format}
                            >
                                <Select
                                    value={form.data.delivery_format}
                                    onValueChange={(v) => form.setData('delivery_format', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih format" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {formatOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field label="Bahasa" error={form.errors.language}>
                                <Select
                                    value={form.data.language ?? 'id'}
                                    onValueChange={(v) => form.setData('language', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih bahasa" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {languageOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>

                        <Field label="Tag" hint="Pilih satu atau lebih tag terkait.">
                            <div className="flex flex-wrap gap-1.5">
                                {tagOptions.length === 0 ? (
                                    <span className="text-sm text-slate-400 italic">
                                        Belum ada tag. Tambahkan dulu di menu Tag.
                                    </span>
                                ) : (
                                    tagOptions.map((tag) => {
                                        const active = form.data.tag_ids.includes(tag.id);

                                        return (
                                            <button
                                                type="button"
                                                key={tag.id}
                                                onClick={() => toggleTag(tag.id)}
                                                className={cn(
                                                    'rounded-full border px-3 py-1 text-[12px] font-medium transition',
                                                    active
                                                        ? 'border-brand-600 bg-brand-600 text-white'
                                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
                                                )}
                                            >
                                                {tag.name}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </Field>
                    </FormCard>

                    {/* Section 3: Harga & Durasi */}
                    <FormCard
                        title="Harga & Durasi"
                        description="Penetapan harga, harga normal (untuk badge diskon), dan durasi belajar."
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Harga" required error={form.errors.price}>
                                <RupiahInput
                                    value={form.data.price}
                                    onChange={(value) => form.setData('price', value)}
                                />
                            </Field>

                            <Field
                                label="Harga Normal (Rp)"
                                error={form.errors.compare_at_price}
                                hint="Opsional. Kosongkan jika tidak ada diskon."
                            >
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="Untuk tampilan harga coret"
                                    value={form.data.compare_at_price}
                                    onChange={(e) =>
                                        form.setData(
                                            'compare_at_price',
                                            e.target.value === ''
                                                ? ''
                                                : Number(e.target.value),
                                        )
                                    }
                                />
                            </Field>

                            <Field
                                label="Durasi Total (menit)"
                                error={form.errors.duration_minutes}
                            >
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="Contoh: 120"
                                    value={form.data.duration_minutes}
                                    onChange={(e) =>
                                        form.setData(
                                            'duration_minutes',
                                            Number(e.target.value) || 0,
                                        )
                                    }
                                />
                            </Field>

                            <Field
                                label="Sertifikat"
                                error={form.errors.is_certified}
                                hint="Course menerbitkan sertifikat resmi setelah selesai."
                            >
                                <label className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_certified}
                                        onChange={(e) =>
                                            form.setData('is_certified', e.target.checked)
                                        }
                                        className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                    />
                                    <span className="text-[13px] text-slate-700">
                                        Bersertifikat
                                    </span>
                                </label>
                            </Field>
                        </div>

                        <Field
                            label="URL Video Preview"
                            error={form.errors.preview_video_url}
                            hint="Link YouTube atau Vimeo untuk preview gratis."
                        >
                            <Input
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={form.data.preview_video_url ?? ''}
                                onChange={(e) =>
                                    form.setData('preview_video_url', e.target.value)
                                }
                            />
                        </Field>
                    </FormCard>

                    {/* Section 3b: Jadwal (untuk live/offline/hybrid/bootcamp) */}
                    {form.data.delivery_format !== 'on_demand' && (
                        <FormCard
                            title="Jadwal Kelas"
                            description="Tanggal dan lokasi kelas untuk format selain on-demand."
                        >
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field
                                    label="Mulai Kelas"
                                    error={form.errors.schedule_start}
                                >
                                    <Input
                                        type="datetime-local"
                                        value={form.data.schedule_start}
                                        onChange={(e) =>
                                            form.setData('schedule_start', e.target.value)
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Selesai Kelas"
                                    error={form.errors.schedule_end}
                                >
                                    <Input
                                        type="datetime-local"
                                        value={form.data.schedule_end}
                                        onChange={(e) =>
                                            form.setData('schedule_end', e.target.value)
                                        }
                                    />
                                </Field>
                            </div>

                            <Field
                                label="Lokasi"
                                error={form.errors.schedule_location}
                                hint="Untuk offline/hybrid: alamat. Untuk online live: link Zoom/GMeet."
                            >
                                <Input
                                    placeholder="Jl. ... atau https://zoom.us/..."
                                    value={form.data.schedule_location ?? ''}
                                    onChange={(e) =>
                                        form.setData('schedule_location', e.target.value)
                                    }
                                />
                            </Field>
                        </FormCard>
                    )}

                    {/* Section 4: Assessment */}
                    <FormCard
                        title="Pengaturan Assessment"
                        description="Konfigurasi pre test, post test, dan kriteria kelulusan."
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field
                                label="Nilai Kelulusan (%)"
                                required
                                error={form.errors.passing_score}
                            >
                                <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={form.data.passing_score}
                                    onChange={(e) =>
                                        form.setData(
                                            'passing_score',
                                            Number(e.target.value) || 0,
                                        )
                                    }
                                />
                            </Field>

                            <Field
                                label="Maksimal Percobaan"
                                required
                                error={form.errors.max_attempts}
                            >
                                <Input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={form.data.max_attempts}
                                    onChange={(e) =>
                                        form.setData(
                                            'max_attempts',
                                            Number(e.target.value) || 1,
                                        )
                                    }
                                />
                            </Field>
                        </div>

                        <ToggleField
                            label="Wajib mengerjakan Pre Test"
                            description="Pre test harus dikerjakan sebelum mengakses materi."
                            checked={form.data.pre_test_required}
                            onCheckedChange={(checked) =>
                                form.setData('pre_test_required', checked)
                            }
                        />

                        <ToggleField
                            label="Wajib mengerjakan Post Test"
                            description="Post test wajib lulus untuk mendapatkan sertifikat."
                            checked={form.data.post_test_required}
                            onCheckedChange={(checked) =>
                                form.setData('post_test_required', checked)
                            }
                        />
                    </FormCard>

                    {/* Section 5: Detail */}
                    <FormCard
                        title="Detail Course"
                        description="Apa yang akan dipelajari, prasyarat, dan untuk siapa course ini."
                    >
                        <ListEditor
                            label="Apa yang akan dipelajari"
                            placeholder="Contoh: Memahami fundamental SEO"
                            values={form.data.learning_objectives}
                            onChange={(items) =>
                                form.setData('learning_objectives', items)
                            }
                        />

                        <ListEditor
                            label="Prasyarat"
                            placeholder="Contoh: Familiar dengan Google Search"
                            values={form.data.requirements}
                            onChange={(items) => form.setData('requirements', items)}
                        />

                        <ListEditor
                            label="Untuk Siapa"
                            placeholder="Contoh: Marketer pemula, business owner"
                            values={form.data.target_audience}
                            onChange={(items) => form.setData('target_audience', items)}
                        />
                    </FormCard>

                    {/* Section 6: Status */}
                    <FormCard
                        title="Publikasi"
                        description="Atur visibilitas course di catalog publik."
                    >
                        <ToggleField
                            label="Publikasikan Course"
                            description="Course akan tampil di catalog dan bisa dibeli oleh peserta."
                            checked={form.data.is_published}
                            onCheckedChange={(checked) =>
                                form.setData('is_published', checked)
                            }
                        />
                    </FormCard>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button
                            asChild
                            type="button"
                            variant="outline"
                            className="rounded-xl"
                        >
                            <Link href="/admin/courses">
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
                                  : 'Simpan Course'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

function FormCard({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:p-6">
            <div className="mb-5">
                <h2 className="text-[15px] font-bold text-slate-900">{title}</h2>
                {description && (
                    <p className="mt-0.5 text-[12.5px] text-slate-500">{description}</p>
                )}
            </div>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

function Field({
    label,
    required,
    error,
    hint,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <RequiredLabel required={required}>{label}</RequiredLabel>
            {children}
            {hint && !error && <p className="text-[11.5px] text-slate-500">{hint}</p>}
            <FieldError message={error} />
        </div>
    );
}

function ToggleField({
    label,
    description,
    checked,
    onCheckedChange,
}: {
    label: string;
    description?: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
            <div className="pr-4">
                <div className="text-[13.5px] font-semibold text-slate-900">{label}</div>
                {description && (
                    <div className="text-[12px] text-slate-500">{description}</div>
                )}
            </div>
            <Switch checked={checked} onCheckedChange={onCheckedChange} />
        </div>
    );
}

function ListEditor({
    label,
    placeholder,
    values,
    onChange,
}: {
    label: string;
    placeholder: string;
    values: string[];
    onChange: (items: string[]) => void;
}) {
    const updateItem = (index: number, value: string) => {
        const next = [...values];
        next[index] = value;
        onChange(next);
    };

    const addItem = () => onChange([...values, '']);

    const removeItem = (index: number) => {
        onChange(values.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-2">
            <RequiredLabel>{label}</RequiredLabel>
            <div className="space-y-2">
                {values.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <GripVertical className="size-4 shrink-0 text-slate-300" />
                        <Input
                            placeholder={placeholder}
                            value={item}
                            onChange={(e) => updateItem(index, e.target.value)}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-9 shrink-0 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                            onClick={() => removeItem(index)}
                        >
                            <X className="size-4" />
                        </Button>
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItem}
                    className="w-full rounded-xl border-dashed text-slate-600 hover:bg-slate-50"
                >
                    <Plus className="mr-1.5 size-4" />
                    Tambah item
                </Button>
            </div>
        </div>
    );
}
