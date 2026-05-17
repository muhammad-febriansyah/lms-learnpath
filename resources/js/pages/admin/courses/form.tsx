import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    GripVertical,
    Plus,
    Save,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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
    max_participants: number | null;
    pre_test_required: boolean;
    post_test_required: boolean;
    passing_score: number;
    max_attempts: number;
    learning_objectives: string[] | null;
    requirements: string[] | null;
    target_audience: string[] | null;
    review_status: string;
    tag_ids: number[];
};

type Props = {
    course: Course | null;
    categoryOptions: CategoryOption[];
    tagOptions: TagOption[];
    levelOptions: Option[];
    languageOptions: Option[];
    formatOptions: Option[];
};

const STEPS: { id: number; title: string; description: string }[] = [
    {
        id: 1,
        title: 'Informasi Dasar',
        description: 'Judul, kategori, level, dan bahasa pengantar.',
    },
    {
        id: 2,
        title: 'Konten & Deskripsi',
        description: 'Deskripsi, tujuan, prasyarat, dan media pendukung.',
    },
    {
        id: 3,
        title: 'Format & Jadwal',
        description: 'Cara penyampaian dan jadwal pelaksanaan.',
    },
    {
        id: 4,
        title: 'Harga & Sertifikasi',
        description: 'Penetapan harga dan aturan sertifikat.',
    },
    {
        id: 5,
        title: 'Tinjau & Kirim',
        description: 'Periksa kembali sebelum simpan atau ajukan review.',
    },
];

function slugify(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

function formatRupiah(value: number | string | null): string {
    if (value === null || value === '' || value === 0) {
        return 'Rp 0';
    }
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(Number(value));
}

export default function CourseForm({
    course,
    categoryOptions,
    tagOptions,
    levelOptions,
    languageOptions,
    formatOptions,
}: Props) {
    const isEdit = !!course;
    const [currentStep, setCurrentStep] = useState(1);

    const toLocal = (iso: string | null): string =>
        iso ? iso.slice(0, 16) : '';

    const form = useForm({
        category_id: course?.category_id ? String(course.category_id) : '',
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
        max_participants: course?.max_participants ?? '',
        pre_test_required: course?.pre_test_required ?? false,
        post_test_required: course?.post_test_required ?? true,
        passing_score: course?.passing_score ?? 70,
        max_attempts: course?.max_attempts ?? 3,
        learning_objectives: (course?.learning_objectives ?? []) as string[],
        requirements: (course?.requirements ?? []) as string[],
        target_audience: (course?.target_audience ?? []) as string[],
        tag_ids: (course?.tag_ids ?? []) as number[],
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

    const needsSchedule = form.data.delivery_format !== 'on_demand';

    const stepErrors = useMemo<Record<number, string[]>>(() => {
        const errs: Record<number, string[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };

        if (!form.data.title.trim()) errs[1].push('Judul wajib diisi.');
        if (!form.data.slug.trim()) errs[1].push('Slug wajib diisi.');
        if (!form.data.category_id) errs[1].push('Kategori wajib dipilih.');

        if (form.data.learning_objectives.length === 0)
            errs[2].push('Minimal 1 tujuan pembelajaran.');

        if (!form.data.delivery_format) errs[3].push('Format kelas wajib dipilih.');
        if (needsSchedule && !form.data.schedule_start)
            errs[3].push('Tanggal mulai wajib diisi untuk format ini.');

        if (form.data.price < 0) errs[4].push('Harga tidak valid.');
        if (
            form.data.compare_at_price !== '' &&
            form.data.compare_at_price !== null &&
            Number(form.data.compare_at_price) < Number(form.data.price)
        )
            errs[4].push('Harga normal harus ≥ harga jual.');
        if (form.data.is_certified) {
            if (form.data.passing_score < 0 || form.data.passing_score > 100)
                errs[4].push('Nilai kelulusan 0–100.');
            if (form.data.max_attempts < 1) errs[4].push('Maksimal percobaan minimal 1.');
        }

        return errs;
    }, [form.data, needsSchedule]);

    const canGoToStep = (target: number): boolean => {
        if (target <= currentStep) return true;
        for (let s = currentStep; s < target; s++) {
            if ((stepErrors[s] ?? []).length > 0) return false;
        }
        return true;
    };

    const next = () => {
        if ((stepErrors[currentStep] ?? []).length > 0) return;
        setCurrentStep((s) => Math.min(STEPS.length, s + 1));
    };

    const prev = () => setCurrentStep((s) => Math.max(1, s - 1));

    const submit = (event: React.FormEvent, andSubmitReview = false) => {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            category_id: data.category_id || null,
            compare_at_price:
                data.compare_at_price === '' || data.compare_at_price === null
                    ? null
                    : Number(data.compare_at_price),
            schedule_start: data.schedule_start || null,
            schedule_end: data.schedule_end || null,
            schedule_location: data.schedule_location || null,
            max_participants:
                data.max_participants === '' || data.max_participants === null
                    ? null
                    : Number(data.max_participants),
        }));

        const onSuccess = () => {
            if (andSubmitReview && isEdit) {
                // setelah update sukses, panggil submit-review terpisah
                window.location.href = `/admin/courses/${course!.id}`;
            }
        };

        if (isEdit) {
            form.put(`/admin/courses/${course!.id}`, { onSuccess });
        } else {
            form.post('/admin/courses', { onSuccess });
        }
    };

    const totalErrors = Object.values(stepErrors).flat().length;
    const categoryName = useMemo(
        () =>
            categoryOptions.find((c) => String(c.id) === form.data.category_id)?.name ??
            '—',
        [categoryOptions, form.data.category_id],
    );
    const formatLabel = useMemo(
        () => formatOptions.find((f) => f.value === form.data.delivery_format)?.label ?? '—',
        [formatOptions, form.data.delivery_format],
    );

    return (
        <>
            <Head title={isEdit ? 'Edit Course' : 'Buat Course'} />
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
                            {isEdit ? 'Edit' : 'Buat'}
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        {isEdit ? 'Edit Course' : 'Buat Course Baru'}
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Ikuti 5 langkah berikut untuk menyusun course Anda. Course tersimpan
                        sebagai draft hingga Anda mengajukan review.
                    </p>
                </div>

                <Stepper
                    steps={STEPS}
                    current={currentStep}
                    onJump={(id) => canGoToStep(id) && setCurrentStep(id)}
                    errorsByStep={stepErrors}
                />

                <form
                    onSubmit={(e) => submit(e, false)}
                    className="space-y-5"
                    noValidate
                >
                    {currentStep === 1 && (
                        <Step
                            title="Informasi Dasar"
                            description="Mulai dengan identitas utama course."
                        >
                            <Field label="Judul Course" required error={form.errors.title}>
                                <Input
                                    placeholder="Contoh: Belajar Digital Marketing Dasar"
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                />
                            </Field>

                            <Field
                                label="Subtitle"
                                error={form.errors.subtitle}
                                hint="Tagline singkat 1 kalimat yang muncul di bawah judul."
                            >
                                <Input
                                    placeholder="Dari nol hingga jago campaign organik"
                                    value={form.data.subtitle ?? ''}
                                    onChange={(e) => form.setData('subtitle', e.target.value)}
                                />
                            </Field>

                            <Field
                                label="Slug URL"
                                required
                                error={form.errors.slug}
                                hint="Otomatis dari judul; bisa diedit. Hanya huruf kecil, angka, tanda hubung."
                            >
                                <Input
                                    placeholder="belajar-digital-marketing-dasar"
                                    value={form.data.slug}
                                    onChange={(e) =>
                                        form.setData('slug', slugify(e.target.value))
                                    }
                                />
                            </Field>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field
                                    label="Kategori"
                                    required
                                    error={form.errors.category_id}
                                >
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

                                <Field label="Level" error={form.errors.level}>
                                    <Select
                                        value={form.data.level ?? 'beginner'}
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

                            <Field label="Tag" hint="Pilih beberapa tag yang relevan.">
                                <div className="flex flex-wrap gap-1.5">
                                    {tagOptions.length === 0 ? (
                                        <span className="text-sm text-slate-400 italic">
                                            Belum ada tag. Hubungi admin untuk menambahkan.
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
                        </Step>
                    )}

                    {currentStep === 2 && (
                        <Step
                            title="Konten & Deskripsi"
                            description="Berikan gambaran tentang apa yang akan dipelajari peserta."
                        >
                            <Field
                                label="Deskripsi Course"
                                error={form.errors.description}
                                hint="Jelaskan tujuan, materi, dan hasil yang diharapkan."
                            >
                                <Textarea
                                    rows={6}
                                    placeholder="Course ini membantu peserta menguasai..."
                                    value={form.data.description ?? ''}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                />
                            </Field>

                            <ListEditor
                                label="Apa yang akan dipelajari"
                                required
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
                                label="Untuk Siapa Course Ini"
                                placeholder="Contoh: Marketer pemula, business owner"
                                values={form.data.target_audience}
                                onChange={(items) => form.setData('target_audience', items)}
                            />

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field
                                    label="URL Thumbnail"
                                    error={form.errors.thumbnail}
                                    hint="Gambar 1280×720 atau rasio 16:9."
                                >
                                    <Input
                                        placeholder="https://.../thumbnail.jpg"
                                        value={form.data.thumbnail ?? ''}
                                        onChange={(e) =>
                                            form.setData('thumbnail', e.target.value)
                                        }
                                    />
                                </Field>

                                <Field
                                    label="URL Video Preview"
                                    error={form.errors.preview_video_url}
                                    hint="YouTube atau Vimeo, untuk preview gratis."
                                >
                                    <Input
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        value={form.data.preview_video_url ?? ''}
                                        onChange={(e) =>
                                            form.setData('preview_video_url', e.target.value)
                                        }
                                    />
                                </Field>
                            </div>
                        </Step>
                    )}

                    {currentStep === 3 && (
                        <Step
                            title="Format & Jadwal"
                            description="Bagaimana course ini disampaikan?"
                        >
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field
                                    label="Format Kelas"
                                    required
                                    error={form.errors.delivery_format}
                                >
                                    <Select
                                        value={form.data.delivery_format}
                                        onValueChange={(v) =>
                                            form.setData('delivery_format', v)
                                        }
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

                                <Field
                                    label="Estimasi Durasi (menit)"
                                    error={form.errors.duration_minutes}
                                    hint="Total estimasi jam belajar."
                                >
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="120"
                                        value={form.data.duration_minutes}
                                        onChange={(e) =>
                                            form.setData(
                                                'duration_minutes',
                                                Number(e.target.value) || 0,
                                            )
                                        }
                                    />
                                </Field>
                            </div>

                            {needsSchedule && (
                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                                    <h3 className="text-[13px] font-semibold text-slate-800">
                                        Jadwal Pelaksanaan
                                    </h3>
                                    <p className="mb-3 text-[12px] text-slate-500">
                                        Wajib diisi untuk format selain on-demand.
                                    </p>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Field
                                            label="Mulai Kelas"
                                            required
                                            error={form.errors.schedule_start}
                                        >
                                            <Input
                                                type="datetime-local"
                                                value={form.data.schedule_start}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'schedule_start',
                                                        e.target.value,
                                                    )
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
                                                    form.setData(
                                                        'schedule_end',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </Field>

                                        <Field
                                            label="Lokasi / Link"
                                            error={form.errors.schedule_location}
                                            hint="Alamat fisik atau link Zoom/GMeet."
                                        >
                                            <Input
                                                placeholder="Jl. ... atau https://zoom.us/..."
                                                value={form.data.schedule_location ?? ''}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'schedule_location',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </Field>

                                        <Field
                                            label="Kapasitas Maksimal"
                                            error={form.errors.max_participants}
                                            hint="Opsional. Kosongkan jika tidak dibatasi."
                                        >
                                            <Input
                                                type="number"
                                                min={1}
                                                placeholder="Contoh: 30"
                                                value={form.data.max_participants}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'max_participants',
                                                        e.target.value === ''
                                                            ? ''
                                                            : Number(e.target.value),
                                                    )
                                                }
                                            />
                                        </Field>
                                    </div>
                                </div>
                            )}
                        </Step>
                    )}

                    {currentStep === 4 && (
                        <Step
                            title="Harga & Sertifikasi"
                            description="Atur harga dan kebijakan sertifikat."
                        >
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field
                                    label="Harga Jual (Rp)"
                                    required
                                    error={form.errors.price}
                                    hint="Isi 0 untuk course gratis."
                                >
                                    <RupiahInput
                                        value={form.data.price}
                                        onChange={(value) => form.setData('price', value)}
                                    />
                                </Field>

                                <Field
                                    label="Harga Normal (Rp)"
                                    error={form.errors.compare_at_price}
                                    hint="Opsional. Untuk badge diskon."
                                >
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="Kosongkan jika tidak diskon"
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
                            </div>

                            <ToggleField
                                label="Course Bersertifikat"
                                description="Course menerbitkan sertifikat resmi setelah selesai dan lulus assessment."
                                checked={form.data.is_certified}
                                onCheckedChange={(checked) =>
                                    form.setData('is_certified', checked)
                                }
                            />

                            {form.data.is_certified && (
                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                                    <h3 className="text-[13px] font-semibold text-slate-800">
                                        Aturan Assessment
                                    </h3>
                                    <p className="mb-3 text-[12px] text-slate-500">
                                        Konfigurasi pre/post test dan kriteria kelulusan.
                                    </p>

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

                                    <div className="mt-3 space-y-3">
                                        <ToggleField
                                            label="Wajib Pre Test"
                                            description="Peserta harus mengerjakan pre test sebelum mulai belajar."
                                            checked={form.data.pre_test_required}
                                            onCheckedChange={(checked) =>
                                                form.setData('pre_test_required', checked)
                                            }
                                        />
                                        <ToggleField
                                            label="Wajib Post Test"
                                            description="Post test wajib lulus untuk mendapat sertifikat."
                                            checked={form.data.post_test_required}
                                            onCheckedChange={(checked) =>
                                                form.setData('post_test_required', checked)
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </Step>
                    )}

                    {currentStep === 5 && (
                        <Step
                            title="Tinjau & Kirim"
                            description="Periksa kembali ringkasan course Anda."
                        >
                            <ReviewSummary
                                title={form.data.title || '—'}
                                subtitle={form.data.subtitle ?? ''}
                                slug={form.data.slug}
                                category={categoryName}
                                level={
                                    levelOptions.find(
                                        (l) => l.value === form.data.level,
                                    )?.label ?? '—'
                                }
                                format={formatLabel}
                                price={formatRupiah(form.data.price)}
                                isCertified={form.data.is_certified}
                                objectivesCount={form.data.learning_objectives.length}
                                requirementsCount={form.data.requirements.length}
                                audienceCount={form.data.target_audience.length}
                                tagsCount={form.data.tag_ids.length}
                            />

                            {totalErrors > 0 && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-[13px] text-amber-800">
                                    <p className="font-semibold">
                                        Masih ada {totalErrors} hal yang perlu dilengkapi:
                                    </p>
                                    <ul className="mt-2 list-inside list-disc space-y-0.5">
                                        {Object.entries(stepErrors).map(([step, list]) =>
                                            list.map((msg, i) => (
                                                <li key={`${step}-${i}`}>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setCurrentStep(Number(step))
                                                        }
                                                        className="underline hover:text-amber-900"
                                                    >
                                                        Langkah {step}: {msg}
                                                    </button>
                                                </li>
                                            )),
                                        )}
                                    </ul>
                                </div>
                            )}

                            <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4 text-[13px] text-slate-700">
                                <p className="font-semibold text-brand-700">
                                    Catatan workflow
                                </p>
                                <p className="mt-1">
                                    Setelah disimpan, course akan berstatus{' '}
                                    <span className="font-semibold">Draft</span>. Lengkapi
                                    kurikulum (section &amp; lesson) di halaman detail, lalu
                                    ajukan untuk review oleh Super Admin.
                                </p>
                            </div>
                        </Step>
                    )}

                    {/* Footer navigasi */}
                    <div className="sticky bottom-0 -mx-1 flex flex-col-reverse gap-2 rounded-2xl bg-white/95 p-4 shadow-[0_-4px_12px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                asChild
                                type="button"
                                variant="ghost"
                                className="rounded-xl"
                            >
                                <Link href="/admin/courses">
                                    <ArrowLeft className="mr-1.5 size-4" />
                                    Batal
                                </Link>
                            </Button>
                            {currentStep > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={prev}
                                    className="rounded-xl"
                                >
                                    <ArrowLeft className="mr-1.5 size-4" />
                                    Sebelumnya
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {currentStep < STEPS.length && (
                                <Button
                                    type="button"
                                    onClick={next}
                                    disabled={(stepErrors[currentStep] ?? []).length > 0}
                                    className="rounded-xl bg-brand-600 hover:bg-brand-700"
                                >
                                    Lanjut
                                    <ArrowRight className="ml-1.5 size-4" />
                                </Button>
                            )}
                            {currentStep === STEPS.length && (
                                <Button
                                    type="submit"
                                    disabled={form.processing || totalErrors > 0}
                                    className="rounded-xl bg-brand-600 hover:bg-brand-700"
                                >
                                    <Save className="mr-1.5 size-4" />
                                    {form.processing
                                        ? 'Menyimpan...'
                                        : isEdit
                                            ? 'Simpan Perubahan'
                                            : 'Simpan sebagai Draft'}
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

function Stepper({
    steps,
    current,
    onJump,
    errorsByStep,
}: {
    steps: { id: number; title: string; description: string }[];
    current: number;
    onJump: (id: number) => void;
    errorsByStep: Record<number, string[]>;
}) {
    return (
        <ol className="grid gap-2 rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:grid-cols-5">
            {steps.map((s) => {
                const isActive = s.id === current;
                const isDone = s.id < current && (errorsByStep[s.id] ?? []).length === 0;
                const hasError = (errorsByStep[s.id] ?? []).length > 0 && s.id < current;

                return (
                    <li key={s.id}>
                        <button
                            type="button"
                            onClick={() => onJump(s.id)}
                            className={cn(
                                'flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition',
                                isActive
                                    ? 'bg-brand-50 ring-1 ring-brand-200'
                                    : 'hover:bg-slate-50',
                            )}
                        >
                            <span
                                className={cn(
                                    'grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-bold',
                                    isActive
                                        ? 'bg-brand-600 text-white'
                                        : isDone
                                            ? 'bg-emerald-500 text-white'
                                            : hasError
                                                ? 'bg-amber-500 text-white'
                                                : 'bg-slate-100 text-slate-500',
                                )}
                            >
                                {isDone ? <Check className="size-3.5" /> : s.id}
                            </span>
                            <span className="min-w-0">
                                <span
                                    className={cn(
                                        'block truncate text-[12.5px] font-semibold',
                                        isActive ? 'text-brand-700' : 'text-slate-900',
                                    )}
                                >
                                    {s.title}
                                </span>
                                <span className="block truncate text-[11px] text-slate-500">
                                    {s.description}
                                </span>
                            </span>
                        </button>
                    </li>
                );
            })}
        </ol>
    );
}

function Step({
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
    required,
}: {
    label: string;
    placeholder: string;
    values: string[];
    onChange: (items: string[]) => void;
    required?: boolean;
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
            <RequiredLabel required={required}>{label}</RequiredLabel>
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

function ReviewSummary({
    title,
    subtitle,
    slug,
    category,
    level,
    format,
    price,
    isCertified,
    objectivesCount,
    requirementsCount,
    audienceCount,
    tagsCount,
}: {
    title: string;
    subtitle: string;
    slug: string;
    category: string;
    level: string;
    format: string;
    price: string;
    isCertified: boolean;
    objectivesCount: number;
    requirementsCount: number;
    audienceCount: number;
    tagsCount: number;
}) {
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <SummaryItem label="Judul" value={title} />
            <SummaryItem label="Subtitle" value={subtitle || '—'} />
            <SummaryItem label="Slug" value={slug || '—'} />
            <SummaryItem label="Kategori" value={category} />
            <SummaryItem label="Level" value={level} />
            <SummaryItem label="Format" value={format} />
            <SummaryItem label="Harga" value={price} />
            <SummaryItem
                label="Sertifikat"
                value={isCertified ? 'Ya' : 'Tidak'}
            />
            <SummaryItem label="Tujuan Pembelajaran" value={`${objectivesCount} item`} />
            <SummaryItem label="Prasyarat" value={`${requirementsCount} item`} />
            <SummaryItem label="Target Audiens" value={`${audienceCount} item`} />
            <SummaryItem label="Tag" value={`${tagsCount} dipilih`} />
        </div>
    );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
            <div className="text-[11.5px] font-medium text-slate-500">{label}</div>
            <div className="mt-0.5 truncate text-[13px] font-semibold text-slate-900">
                {value}
            </div>
        </div>
    );
}
