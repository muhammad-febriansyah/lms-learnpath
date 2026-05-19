import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    Check,
    Clapperboard,
    Eye,
    Film,
    GripVertical,
    Layers,
    Link2,
    PlayCircle,
    Plus,
    Save,
    Trash2,
    Upload,
    X,
    Youtube,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import { RupiahInput } from '@/components/form/rupiah-input';
import { IconChevR } from '@/components/learnpath-icons';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
type ScormOption = { id: number; title: string };

type LessonRead = {
    id: number;
    title: string;
    description: string | null;
    duration_minutes: number;
    is_preview: boolean;
    is_required: boolean;
    video_path: string | null;
    embed_url: string | null;
    youtube_url: string | null;
};

type SectionRead = {
    id: number;
    title: string;
    description: string | null;
    lessons: LessonRead[];
};

type LessonInput = {
    _key: string;
    id: number | null;
    title: string;
    description: string;
    duration_minutes: number;
    is_preview: boolean;
    is_required: boolean;
    video_file: File | null;
    video_path_existing: string;
    video_remove: boolean;
    embed_url: string;
    youtube_url: string;
};

type SectionInput = {
    _key: string;
    id: number | null;
    title: string;
    description: string;
    lessons: LessonInput[];
};

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
    lms_format: string;
    scorm_package_id: number | null;
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
    sections?: SectionRead[];
};

type Props = {
    course: Course | null;
    categoryOptions: CategoryOption[];
    tagOptions: TagOption[];
    scormPackageOptions: ScormOption[];
    lmsFormatOptions: Option[];
    levelOptions: Option[];
    languageOptions: Option[];
    formatOptions: Option[];
};

const ALL_STEPS: { id: number; title: string; description: string }[] = [
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
        title: 'Kurikulum',
        description: 'Susun section dan lesson video / link.',
    },
    {
        id: 6,
        title: 'Tinjau & Kirim',
        description: 'Periksa kembali sebelum simpan atau ajukan review.',
    },
];

const REVIEW_STEP_ID = 6;
const CURRICULUM_STEP_ID = 5;

function genKey(): string {
    return Math.random().toString(36).slice(2, 10);
}

function makeLesson(): LessonInput {
    return {
        _key: genKey(),
        id: null,
        title: '',
        description: '',
        duration_minutes: 0,
        is_preview: false,
        is_required: true,
        video_file: null,
        video_path_existing: '',
        video_remove: false,
        embed_url: '',
        youtube_url: '',
    };
}

function makeSection(): SectionInput {
    return {
        _key: genKey(),
        id: null,
        title: '',
        description: '',
        lessons: [makeLesson()],
    };
}

function mapCourseSections(sections: SectionRead[] | undefined): SectionInput[] {
    return (sections ?? []).map((s) => ({
        _key: `s-${s.id}`,
        id: s.id,
        title: s.title,
        description: s.description ?? '',
        lessons: (s.lessons ?? []).map((l) => ({
            _key: `l-${l.id}`,
            id: l.id,
            title: l.title,
            description: l.description ?? '',
            duration_minutes: l.duration_minutes ?? 0,
            is_preview: !!l.is_preview,
            is_required: l.is_required !== false,
            video_file: null,
            video_path_existing: l.video_path ?? '',
            video_remove: false,
            embed_url: l.embed_url ?? '',
            youtube_url: l.youtube_url ?? '',
        })),
    }));
}

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
    scormPackageOptions,
    lmsFormatOptions,
    levelOptions,
    languageOptions,
    formatOptions,
}: Props) {
    const isEdit = !!course;
    const [currentStep, setCurrentStep] = useState(1);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const toLocal = (iso: string | null): string =>
        iso ? iso.slice(0, 16) : '';

    const form = useForm({
        category_id: course?.category_id ? String(course.category_id) : '',
        title: course?.title ?? '',
        subtitle: course?.subtitle ?? '',
        slug: course?.slug ?? '',
        description: course?.description ?? '',
        thumbnail: null as File | null,
        thumbnail_existing: course?.thumbnail ?? '',
        thumbnail_remove: false,
        price: course?.price ?? 0,
        compare_at_price: course?.compare_at_price ?? '',
        level: course?.level ?? 'beginner',
        delivery_format: course?.delivery_format ?? 'on_demand',
        lms_format: course?.lms_format ?? 'embed_youtube',
        scorm_package_id: course?.scorm_package_id
            ? String(course.scorm_package_id)
            : '',
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
        sections: mapCourseSections(course?.sections),
    });

    const sections = form.data.sections as SectionInput[];
    const setSections = (next: SectionInput[]) => form.setData('sections', next);

    const needsCurriculum = form.data.lms_format !== 'scorm';
    const activeStepIds = needsCurriculum
        ? ALL_STEPS.map((s) => s.id)
        : ALL_STEPS.filter((s) => s.id !== CURRICULUM_STEP_ID).map((s) => s.id);
    const activeSteps = ALL_STEPS.filter((s) => activeStepIds.includes(s.id));
    const lastStepId = activeStepIds[activeStepIds.length - 1];

    useEffect(() => {
        if (!activeStepIds.includes(currentStep)) {
            setCurrentStep(lastStepId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.data.lms_format]);

    useEffect(() => {
        if (needsCurriculum && sections.length === 0) {
            setSections([makeSection()]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [needsCurriculum]);

    useEffect(() => {
        if (!isEdit && form.data.title && !form.data.slug) {
            form.setData('slug', slugify(form.data.title));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.data.title]);

    // Auto-select newly uploaded SCORM package (flashed by ScormPackageController::store).
    const newScormId = (
        usePage().props.flash as
            | { new_scorm_package_id?: number | null }
            | undefined
    )?.new_scorm_package_id;
    useEffect(() => {
        if (newScormId) {
            form.setData('scorm_package_id', String(newScormId));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newScormId]);

    const toggleTag = (id: number) => {
        const next = form.data.tag_ids.includes(id)
            ? form.data.tag_ids.filter((t) => t !== id)
            : [...form.data.tag_ids, id];
        form.setData('tag_ids', next);
    };

    const needsSchedule = form.data.delivery_format !== 'on_demand';
    const needsScormPackage = form.data.lms_format === 'scorm';

    const stepErrors = useMemo<Record<number, string[]>>(() => {
        const errs: Record<number, string[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

        if (!form.data.title.trim()) errs[1].push('Judul wajib diisi.');
        if (!form.data.slug.trim()) errs[1].push('Slug wajib diisi.');
        if (!form.data.category_id) errs[1].push('Kategori wajib dipilih.');

        if (form.data.learning_objectives.length === 0)
            errs[2].push('Minimal 1 tujuan pembelajaran.');

        if (!form.data.delivery_format) errs[3].push('Format kelas wajib dipilih.');
        if (!form.data.lms_format) errs[3].push('Format LMS wajib dipilih.');
        if (needsScormPackage && !form.data.scorm_package_id)
            errs[3].push('Paket SCORM wajib dipilih.');
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

        if (needsCurriculum) {
            const secs = sections;
            if (secs.length === 0) {
                errs[5].push('Minimal 1 section diperlukan.');
            }
            secs.forEach((sec, sIdx) => {
                if (!sec.title.trim()) errs[5].push(`Section ${sIdx + 1}: judul wajib diisi.`);
                if (sec.lessons.length === 0)
                    errs[5].push(`Section ${sIdx + 1}: minimal 1 lesson.`);
                sec.lessons.forEach((les, lIdx) => {
                    if (!les.title.trim())
                        errs[5].push(`Section ${sIdx + 1} · Lesson ${lIdx + 1}: judul wajib.`);
                    if (form.data.lms_format === 'video') {
                        const hasVideo = les.video_file || (les.video_path_existing && !les.video_remove);
                        if (!hasVideo)
                            errs[5].push(`Section ${sIdx + 1} · Lesson ${lIdx + 1}: video wajib diunggah.`);
                    } else if (form.data.lms_format === 'embed_link') {
                        if (!les.embed_url.trim())
                            errs[5].push(`Section ${sIdx + 1} · Lesson ${lIdx + 1}: URL embed wajib.`);
                    } else if (form.data.lms_format === 'embed_youtube') {
                        if (!les.youtube_url.trim())
                            errs[5].push(`Section ${sIdx + 1} · Lesson ${lIdx + 1}: URL YouTube wajib.`);
                    }
                });
            });
        }

        return errs;
    }, [form.data, needsSchedule, needsCurriculum, sections]);

    const canGoToStep = (target: number): boolean => {
        if (!activeStepIds.includes(target)) return false;
        const currentIdx = activeStepIds.indexOf(currentStep);
        const targetIdx = activeStepIds.indexOf(target);
        if (targetIdx <= currentIdx) return true;
        for (let i = currentIdx; i < targetIdx; i++) {
            if ((stepErrors[activeStepIds[i]] ?? []).length > 0) return false;
        }
        return true;
    };

    const next = () => {
        if ((stepErrors[currentStep] ?? []).length > 0) return;
        const idx = activeStepIds.indexOf(currentStep);
        if (idx < activeStepIds.length - 1) {
            setCurrentStep(activeStepIds[idx + 1]);
        }
    };

    const prev = () => {
        const idx = activeStepIds.indexOf(currentStep);
        if (idx > 0) {
            setCurrentStep(activeStepIds[idx - 1]);
        }
    };

    const openConfirm = (event: React.FormEvent) => {
        event.preventDefault();
        if (totalErrorsRef.current > 0) return;
        setConfirmOpen(true);
    };

    const totalErrorsRef = useMemo(() => ({ current: 0 }), []);

    const performSubmit = () => {
        form.transform((data) => {
            const rawSections = (data.sections as SectionInput[]) ?? [];
            const cleanSections =
                data.lms_format === 'scorm'
                    ? []
                    : rawSections.map((s) => ({
                          id: s.id,
                          title: s.title,
                          description: s.description,
                          lessons: s.lessons.map((l) => ({
                              id: l.id,
                              title: l.title,
                              description: l.description,
                              duration_minutes: l.duration_minutes,
                              is_preview: l.is_preview,
                              is_required: l.is_required,
                              video_file: l.video_file,
                              video_path_existing: l.video_path_existing,
                              video_remove: l.video_remove,
                              embed_url: l.embed_url,
                              youtube_url: l.youtube_url,
                          })),
                      }));

            return {
                ...data,
                category_id: data.category_id || null,
                scorm_package_id:
                    data.lms_format === 'scorm' && data.scorm_package_id
                        ? Number(data.scorm_package_id)
                        : null,
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
                sections: cleanSections,
            };
        });

        const onFinish = () => setConfirmOpen(false);

        if (isEdit) {
            // Use POST + method spoofing because PUT does not parse multipart in PHP.
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(`/admin/courses/${course!.id}`, {
                forceFormData: true,
                onFinish,
            });
        } else {
            form.post('/admin/courses', { forceFormData: true, onFinish });
        }
    };

    const totalErrors = Object.values(stepErrors).flat().length;
    totalErrorsRef.current = totalErrors;
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
    const lmsFormatLabel = useMemo(
        () => lmsFormatOptions.find((f) => f.value === form.data.lms_format)?.label ?? '—',
        [lmsFormatOptions, form.data.lms_format],
    );
    const scormPackageLabel = useMemo(() => {
        if (form.data.lms_format !== 'scorm' || !form.data.scorm_package_id) return null;
        return (
            scormPackageOptions.find(
                (p) => String(p.id) === form.data.scorm_package_id,
            )?.title ?? null
        );
    }, [scormPackageOptions, form.data.lms_format, form.data.scorm_package_id]);

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
                        Ikuti langkah berikut untuk menyusun course Anda. Course tersimpan
                        sebagai draft hingga Anda mengajukan review.
                    </p>
                </div>

                <Stepper
                    steps={activeSteps}
                    current={currentStep}
                    onJump={(id) => canGoToStep(id) && setCurrentStep(id)}
                    errorsByStep={stepErrors}
                />

                <form
                    onSubmit={openConfirm}
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

                            <Field
                                label="Thumbnail Course"
                                error={form.errors.thumbnail}
                                hint="PNG / JPG / WEBP. Rasio 16:9, maks 2 MB."
                            >
                                <ThumbnailUpload
                                    file={form.data.thumbnail as File | null}
                                    existingUrl={form.data.thumbnail_existing as string}
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
                            </Field>
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
                                    hint="Cara penyampaian: rekaman, live, tatap muka."
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
                                    label="Format LMS"
                                    required
                                    error={form.errors.lms_format}
                                    hint="Embed YouTube paling direkomendasikan: gratis, unlimited, dan auto-streaming. Upload MP4/SCORM dibatasi 50 MB per file."
                                >
                                    <Select
                                        value={form.data.lms_format}
                                        onValueChange={(v) => {
                                            form.setData('lms_format', v);
                                            if (v !== 'scorm') {
                                                form.setData('scorm_package_id', '');
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih format LMS" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {lmsFormatOptions.map((opt) => (
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

                            {needsScormPackage && (
                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-[13px] font-semibold text-slate-800">
                                                Paket SCORM
                                            </h3>
                                            <p className="text-[12px] text-slate-500">
                                                Pilih paket yang sudah diunggah, atau upload file ZIP baru.
                                            </p>
                                        </div>
                                        <ScormUploadDialog
                                            onUploaded={(id) =>
                                                form.setData('scorm_package_id', String(id))
                                            }
                                        />
                                    </div>
                                    <Field
                                        label="SCORM Package"
                                        required
                                        error={form.errors.scorm_package_id}
                                    >
                                        {scormPackageOptions.length === 0 ? (
                                            <p className="rounded-lg bg-amber-50 px-3 py-2 text-[12.5px] text-amber-700 ring-1 ring-amber-200">
                                                Belum ada paket SCORM. Klik tombol{' '}
                                                <b>+ Upload paket baru</b> di atas untuk mulai.
                                            </p>
                                        ) : (
                                            <Select
                                                value={form.data.scorm_package_id}
                                                onValueChange={(v) =>
                                                    form.setData('scorm_package_id', v)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih paket SCORM" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {scormPackageOptions.map((pkg) => (
                                                        <SelectItem
                                                            key={pkg.id}
                                                            value={String(pkg.id)}
                                                        >
                                                            {pkg.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </Field>
                                </div>
                            )}

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
                            description="Atur harga, gratis/berbayar, dan kebijakan sertifikat."
                        >
                            <Field
                                label="Tipe Harga"
                                required
                            >
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            form.setData('price', 0);
                                            form.setData('compare_at_price', '');
                                        }}
                                        className={
                                            'flex items-start gap-3 rounded-xl border p-4 text-left transition ' +
                                            (Number(form.data.price) === 0
                                                ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500'
                                                : 'border-slate-200 bg-white hover:border-slate-300')
                                        }
                                    >
                                        <div
                                            className={
                                                'mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg ' +
                                                (Number(form.data.price) === 0
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-slate-100 text-slate-500')
                                            }
                                        >
                                            <span className="text-[12px] font-extrabold">Rp 0</span>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[13.5px] font-semibold text-slate-900">
                                                Gratis
                                            </div>
                                            <div className="mt-0.5 text-[12px] leading-snug text-slate-500">
                                                Peserta bisa enroll tanpa bayar. Tidak ada checkout.
                                            </div>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (Number(form.data.price) === 0) {
                                                form.setData('price', 100000);
                                            }
                                        }}
                                        className={
                                            'flex items-start gap-3 rounded-xl border p-4 text-left transition ' +
                                            (Number(form.data.price) > 0
                                                ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600'
                                                : 'border-slate-200 bg-white hover:border-slate-300')
                                        }
                                    >
                                        <div
                                            className={
                                                'mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg ' +
                                                (Number(form.data.price) > 0
                                                    ? 'bg-brand-600 text-white'
                                                    : 'bg-slate-100 text-slate-500')
                                            }
                                        >
                                            <span className="text-[14px] font-extrabold">Rp</span>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[13.5px] font-semibold text-slate-900">
                                                Berbayar
                                            </div>
                                            <div className="mt-0.5 text-[12px] leading-snug text-slate-500">
                                                Peserta harus checkout dulu sebelum bisa akses materi.
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </Field>

                            {Number(form.data.price) > 0 && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field
                                        label="Harga Jual (Rp)"
                                        required
                                        error={form.errors.price}
                                        hint="Harga yang dibayar peserta."
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
                                        <RupiahInput
                                            placeholder="Kosongkan jika tidak diskon"
                                            value={form.data.compare_at_price}
                                            onChange={(value) => form.setData('compare_at_price', value)}
                                            onClear={() => form.setData('compare_at_price', '')}
                                        />
                                    </Field>
                                </div>
                            )}

                            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                                <h3 className="text-[13px] font-semibold text-slate-800">
                                    Kriteria Kelulusan
                                </h3>
                                <p className="mb-3 text-[12px] text-slate-500">
                                    Nilai minimum untuk dianggap lulus assessment course ini.
                                </p>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field
                                        label="Nilai Kelulusan / Grade (%)"
                                        required
                                        error={form.errors.passing_score}
                                        hint="Skor minimum 0–100 untuk lulus assessment."
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
                                        hint="Berapa kali peserta boleh retake assessment."
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
                                <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                                    <h3 className="text-[13px] font-semibold text-slate-800">
                                        Konfigurasi Assessment
                                    </h3>
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
                            )}
                        </Step>
                    )}

                    {currentStep === 5 && needsCurriculum && (
                        <Step
                            title="Kurikulum"
                            description="Susun section dan lesson. Tipe konten otomatis mengikuti Format LMS yang dipilih."
                        >
                            <CurriculumEditor
                                lmsFormat={form.data.lms_format as string}
                                sections={sections}
                                onChange={setSections}
                            />
                        </Step>
                    )}

                    {currentStep === 6 && (
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
                                lmsFormat={lmsFormatLabel}
                                scormPackage={scormPackageLabel}
                                price={formatRupiah(form.data.price)}
                                isCertified={form.data.is_certified}
                                objectivesCount={form.data.learning_objectives.length}
                                requirementsCount={form.data.requirements.length}
                                audienceCount={form.data.target_audience.length}
                                tagsCount={form.data.tag_ids.length}
                                sectionsCount={needsCurriculum ? sections.length : 0}
                                lessonsCount={
                                    needsCurriculum
                                        ? sections.reduce((sum, s) => sum + s.lessons.length, 0)
                                        : 0
                                }
                                needsCurriculum={needsCurriculum}
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
                                    <span className="font-semibold">Draft</span> beserta
                                    section &amp; lesson yang sudah Anda susun. Anda bisa
                                    melengkapi materi tambahan lalu ajukan untuk review oleh
                                    Super Admin.
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
                            {currentStep !== lastStepId && (
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
                            {currentStep === lastStepId && (
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

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="items-center text-center">
                        <div className="mb-2 grid size-14 place-items-center rounded-full bg-amber-100 ring-8 ring-amber-50">
                            <AlertTriangle className="size-7 text-amber-600" />
                        </div>
                        <DialogTitle className="text-lg">
                            {isEdit ? 'Simpan perubahan course?' : 'Simpan course sebagai draft?'}
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            {isEdit
                                ? 'Perubahan akan langsung tersimpan. Pastikan data yang Anda isi sudah benar sebelum melanjutkan.'
                                : 'Course akan tersimpan sebagai draft. Anda masih bisa mengedit dan menambah kurikulum sebelum diajukan untuk review.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-xl bg-slate-50 px-4 py-3 text-[12.5px] text-slate-600">
                        <p className="font-semibold text-slate-900">Ringkasan</p>
                        <ul className="mt-1.5 space-y-0.5">
                            <li>
                                Judul:{' '}
                                <span className="font-medium text-slate-800">
                                    {form.data.title || '—'}
                                </span>
                            </li>
                            <li>
                                Kategori:{' '}
                                <span className="font-medium text-slate-800">
                                    {categoryName}
                                </span>
                            </li>
                            <li>
                                Format LMS:{' '}
                                <span className="font-medium text-slate-800">
                                    {lmsFormatLabel}
                                    {scormPackageLabel ? ` · ${scormPackageLabel}` : ''}
                                </span>
                            </li>
                            <li>
                                Harga:{' '}
                                <span className="font-medium text-slate-800">
                                    {formatRupiah(form.data.price)}
                                </span>
                            </li>
                        </ul>
                    </div>

                    <DialogFooter className="sm:justify-center sm:gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setConfirmOpen(false)}
                            disabled={form.processing}
                            className="rounded-xl sm:flex-1"
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            onClick={performSubmit}
                            disabled={form.processing}
                            className="rounded-xl bg-brand-600 hover:bg-brand-700 sm:flex-1"
                        >
                            <Save className="mr-1.5 size-4" />
                            {form.processing ? 'Menyimpan...' : 'Ya, Simpan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
        <ol
            className="grid gap-2 rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70"
            style={{
                gridTemplateColumns: `repeat(${Math.min(steps.length, 6)}, minmax(0, 1fr))`,
            }}
        >
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
        <div className="rounded-2xl bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:p-7">
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
        <div className="space-y-2.5">
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
        <div className="space-y-2.5">
            <RequiredLabel required={required}>{label}</RequiredLabel>
            <div className="space-y-2.5">
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
                            size="sm"
                            className="h-9 shrink-0 rounded-xl bg-rose-600 text-white shadow-sm hover:bg-rose-700"
                            onClick={() => removeItem(index)}
                        >
                            <X className="mr-1 size-3.5" />
                            Hapus
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

function CurriculumEditor({
    lmsFormat,
    sections,
    onChange,
}: {
    lmsFormat: string;
    sections: SectionInput[];
    onChange: (next: SectionInput[]) => void;
}) {
    const updateSection = (sIdx: number, patch: Partial<SectionInput>) => {
        const next = sections.map((s, i) => (i === sIdx ? { ...s, ...patch } : s));
        onChange(next);
    };

    const updateLesson = (
        sIdx: number,
        lIdx: number,
        patch: Partial<LessonInput>,
    ) => {
        const next = sections.map((s, i) =>
            i === sIdx
                ? {
                      ...s,
                      lessons: s.lessons.map((l, j) =>
                          j === lIdx ? { ...l, ...patch } : l,
                      ),
                  }
                : s,
        );
        onChange(next);
    };

    const addSection = () => onChange([...sections, makeSection()]);
    const removeSection = (sIdx: number) =>
        onChange(sections.filter((_, i) => i !== sIdx));
    const addLesson = (sIdx: number) =>
        updateSection(sIdx, { lessons: [...sections[sIdx].lessons, makeLesson()] });
    const removeLesson = (sIdx: number, lIdx: number) =>
        updateSection(sIdx, {
            lessons: sections[sIdx].lessons.filter((_, j) => j !== lIdx),
        });

    const totalLessons = sections.reduce((sum, s) => sum + s.lessons.length, 0);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                <div className="flex items-center gap-3 text-[13px] text-slate-600">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 font-semibold text-slate-900 ring-1 ring-slate-200">
                        <Layers className="size-3.5 text-brand-600" />
                        {sections.length} section
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 font-semibold text-slate-900 ring-1 ring-slate-200">
                        <PlayCircle className="size-3.5 text-brand-600" />
                        {totalLessons} lesson
                    </span>
                </div>
                <LessonSourceBadge lmsFormat={lmsFormat} />
            </div>

            {sections.map((section, sIdx) => (
                <div
                    key={section._key}
                    className="rounded-2xl border border-slate-200 bg-white"
                >
                    <div className="flex items-start gap-3 border-b border-slate-100 px-4 py-3">
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-50 text-[12px] font-bold text-brand-700">
                            {sIdx + 1}
                        </span>
                        <div className="flex-1 space-y-2">
                            <Input
                                placeholder={`Judul section ${sIdx + 1} (mis. Pengantar)`}
                                value={section.title}
                                onChange={(e) =>
                                    updateSection(sIdx, { title: e.target.value })
                                }
                                className="font-semibold"
                            />
                            <Textarea
                                rows={2}
                                placeholder="Deskripsi singkat section (opsional)"
                                value={section.description}
                                onChange={(e) =>
                                    updateSection(sIdx, { description: e.target.value })
                                }
                            />
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSection(sIdx)}
                            disabled={sections.length === 1}
                            className="h-9 shrink-0 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40"
                            title={
                                sections.length === 1
                                    ? 'Minimal 1 section'
                                    : 'Hapus section'
                            }
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>

                    <div className="space-y-3 px-4 py-3">
                        {section.lessons.map((lesson, lIdx) => (
                            <LessonRow
                                key={lesson._key}
                                lesson={lesson}
                                lIdx={lIdx}
                                lmsFormat={lmsFormat}
                                canRemove={section.lessons.length > 1}
                                onUpdate={(patch) => updateLesson(sIdx, lIdx, patch)}
                                onRemove={() => removeLesson(sIdx, lIdx)}
                            />
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addLesson(sIdx)}
                            className="w-full rounded-xl border-dashed text-slate-600 hover:bg-slate-50"
                        >
                            <Plus className="mr-1.5 size-4" />
                            Tambah lesson di section ini
                        </Button>
                    </div>
                </div>
            ))}

            <Button
                type="button"
                variant="outline"
                onClick={addSection}
                className="w-full rounded-xl border-dashed bg-brand-50/30 py-6 text-brand-700 hover:bg-brand-50 hover:text-brand-800"
            >
                <Plus className="mr-1.5 size-4" />
                Tambah Section Baru
            </Button>
        </div>
    );
}

function LessonSourceBadge({ lmsFormat }: { lmsFormat: string }) {
    if (lmsFormat === 'video') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-2.5 py-1 text-[12px] font-semibold text-sky-700 ring-1 ring-sky-200">
                <Film className="size-3.5" />
                Tipe lesson: Upload Video
            </span>
        );
    }
    if (lmsFormat === 'embed_link') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1 text-[12px] font-semibold text-violet-700 ring-1 ring-violet-200">
                <Link2 className="size-3.5" />
                Tipe lesson: Embed URL
            </span>
        );
    }
    if (lmsFormat === 'embed_youtube') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1 text-[12px] font-semibold text-rose-700 ring-1 ring-rose-200">
                <Youtube className="size-3.5" />
                Tipe lesson: YouTube URL
            </span>
        );
    }
    return null;
}

function LessonRow({
    lesson,
    lIdx,
    lmsFormat,
    canRemove,
    onUpdate,
    onRemove,
}: {
    lesson: LessonInput;
    lIdx: number;
    lmsFormat: string;
    canRemove: boolean;
    onUpdate: (patch: Partial<LessonInput>) => void;
    onRemove: () => void;
}) {
    return (
        <div className="rounded-xl bg-slate-50/60 p-3 ring-1 ring-slate-200/70">
            <div className="flex items-start gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-[11px] font-bold text-slate-600 ring-1 ring-slate-200">
                    {lIdx + 1}
                </span>
                <div className="flex-1 space-y-2.5">
                    <Input
                        placeholder={`Judul lesson ${lIdx + 1}`}
                        value={lesson.title}
                        onChange={(e) => onUpdate({ title: e.target.value })}
                    />

                    <div className="grid gap-2.5 sm:grid-cols-[1fr_140px]">
                        <Textarea
                            rows={2}
                            placeholder="Deskripsi singkat lesson (opsional)"
                            value={lesson.description}
                            onChange={(e) => onUpdate({ description: e.target.value })}
                        />
                        <div>
                            <Label className="text-[11.5px] text-slate-500">
                                Durasi (menit)
                            </Label>
                            <Input
                                type="number"
                                min={0}
                                value={lesson.duration_minutes}
                                onChange={(e) =>
                                    onUpdate({
                                        duration_minutes: Number(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>
                    </div>

                    {lmsFormat === 'video' && (
                        <LessonVideoUpload lesson={lesson} onUpdate={onUpdate} />
                    )}

                    {lmsFormat === 'embed_link' && (
                        <div>
                            <Label className="text-[11.5px] text-slate-500">
                                URL Embed
                            </Label>
                            <Input
                                placeholder="https://player.vimeo.com/video/..."
                                value={lesson.embed_url}
                                onChange={(e) =>
                                    onUpdate({ embed_url: e.target.value })
                                }
                            />
                        </div>
                    )}

                    {lmsFormat === 'embed_youtube' && (
                        <div>
                            <Label className="text-[11.5px] text-slate-500">
                                URL YouTube
                            </Label>
                            <Input
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={lesson.youtube_url}
                                onChange={(e) =>
                                    onUpdate({ youtube_url: e.target.value })
                                }
                            />
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                        <label className="inline-flex cursor-pointer items-center gap-2 text-[12.5px] text-slate-600">
                            <Switch
                                checked={lesson.is_preview}
                                onCheckedChange={(checked) =>
                                    onUpdate({ is_preview: checked })
                                }
                            />
                            <span className="inline-flex items-center gap-1">
                                <Eye className="size-3.5 text-slate-400" />
                                Preview gratis
                            </span>
                        </label>
                        <label className="inline-flex cursor-pointer items-center gap-2 text-[12.5px] text-slate-600">
                            <Switch
                                checked={lesson.is_required}
                                onCheckedChange={(checked) =>
                                    onUpdate({ is_required: checked })
                                }
                            />
                            <span>Wajib diselesaikan</span>
                        </label>
                    </div>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onRemove}
                    disabled={!canRemove}
                    className="h-9 shrink-0 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40"
                    title={canRemove ? 'Hapus lesson' : 'Minimal 1 lesson per section'}
                >
                    <X className="size-4" />
                </Button>
            </div>
        </div>
    );
}

function LessonVideoUpload({
    lesson,
    onUpdate,
}: {
    lesson: LessonInput;
    onUpdate: (patch: Partial<LessonInput>) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const hasNewFile = !!lesson.video_file;
    const hasExisting =
        !!lesson.video_path_existing && !lesson.video_remove;

    return (
        <div>
            <Label className="text-[11.5px] text-slate-500">Video lesson</Label>
            <input
                ref={inputRef}
                type="file"
                accept="video/mp4"
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    if (f) onUpdate({ video_file: f, video_remove: false });
                }}
            />
            {hasNewFile ? (
                <div className="flex items-center justify-between gap-2 rounded-lg bg-emerald-50 px-3 py-2 ring-1 ring-emerald-200">
                    <div className="flex min-w-0 items-center gap-2 text-[12.5px] text-emerald-800">
                        <Clapperboard className="size-3.5 shrink-0" />
                        <span className="truncate font-semibold">
                            {lesson.video_file!.name}
                        </span>
                        <span className="shrink-0 text-emerald-700/70">
                            ({(lesson.video_file!.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            onUpdate({ video_file: null });
                            if (inputRef.current) inputRef.current.value = '';
                        }}
                        className="h-7 rounded-lg text-rose-600 hover:bg-rose-50"
                    >
                        <X className="size-3.5" />
                    </Button>
                </div>
            ) : hasExisting ? (
                <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-100 px-3 py-2 ring-1 ring-slate-200">
                    <div className="flex min-w-0 items-center gap-2 text-[12.5px] text-slate-700">
                        <Clapperboard className="size-3.5 shrink-0" />
                        <span className="truncate font-semibold">
                            Video tersimpan
                        </span>
                        <span className="shrink-0 text-slate-500">
                            ({lesson.video_path_existing.split('/').pop()})
                        </span>
                    </div>
                    <div className="flex shrink-0 gap-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => inputRef.current?.click()}
                            className="h-7 rounded-lg"
                        >
                            <Upload className="mr-1 size-3.5" />
                            Ganti
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onUpdate({ video_remove: true })}
                            className="h-7 rounded-lg text-rose-600 hover:bg-rose-50"
                        >
                            <X className="size-3.5" />
                        </Button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-white px-3 py-3 text-[12.5px] font-semibold text-slate-600 transition hover:border-brand-300 hover:bg-brand-50/30"
                >
                    <Upload className="size-4 text-slate-400" />
                    Klik untuk upload video (MP4, maks 50 MB)
                </button>
            )}
            <p className="mt-1 text-[11px] text-slate-500">
                Untuk video lebih panjang, gunakan format <strong>Embed YouTube</strong> di setelan course
                — gratis & tanpa batas durasi.
            </p>
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
    lmsFormat,
    scormPackage,
    price,
    isCertified,
    objectivesCount,
    requirementsCount,
    audienceCount,
    tagsCount,
    sectionsCount,
    lessonsCount,
    needsCurriculum,
}: {
    title: string;
    subtitle: string;
    slug: string;
    category: string;
    level: string;
    format: string;
    lmsFormat: string;
    scormPackage: string | null;
    price: string;
    isCertified: boolean;
    objectivesCount: number;
    requirementsCount: number;
    audienceCount: number;
    tagsCount: number;
    sectionsCount: number;
    lessonsCount: number;
    needsCurriculum: boolean;
}) {
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <SummaryItem label="Judul" value={title} />
            <SummaryItem label="Subtitle" value={subtitle || '—'} />
            <SummaryItem label="Slug" value={slug || '—'} />
            <SummaryItem label="Kategori" value={category} />
            <SummaryItem label="Level" value={level} />
            <SummaryItem label="Format Kelas" value={format} />
            <SummaryItem label="Format LMS" value={lmsFormat} />
            {scormPackage && (
                <SummaryItem label="Paket SCORM" value={scormPackage} />
            )}
            <SummaryItem label="Harga" value={price} />
            <SummaryItem
                label="Sertifikat"
                value={isCertified ? 'Ya' : 'Tidak'}
            />
            <SummaryItem label="Tujuan Pembelajaran" value={`${objectivesCount} item`} />
            <SummaryItem label="Prasyarat" value={`${requirementsCount} item`} />
            <SummaryItem label="Target Audiens" value={`${audienceCount} item`} />
            <SummaryItem label="Tag" value={`${tagsCount} dipilih`} />
            {needsCurriculum && (
                <>
                    <SummaryItem label="Section" value={`${sectionsCount} section`} />
                    <SummaryItem label="Lesson" value={`${lessonsCount} lesson`} />
                </>
            )}
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

function ScormUploadDialog({ onUploaded }: { onUploaded: (id: number) => void }) {
    const [open, setOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const upload = useForm<{ title: string; version: '1.2' | '2004'; zip: File | null }>({
        title: '',
        version: '1.2',
        zip: null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        upload.post('/admin/scorm-packages', {
            forceFormData: true,
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page) => {
                const newId = (page.props.flash as { new_scorm_package_id?: number } | undefined)
                    ?.new_scorm_package_id;
                if (newId) onUploaded(newId);
                setOpen(false);
                upload.reset();
                router.reload({ only: ['scormPackageOptions'] });
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    size="sm"
                    className="rounded-xl bg-brand-600 hover:bg-brand-700"
                >
                    <Plus className="mr-1.5 size-4" />
                    Upload paket baru
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Upload Paket SCORM</DialogTitle>
                    <DialogDescription>
                        Upload file ZIP SCORM (1.2 / 2004). Paket akan tersedia untuk
                        dipakai di course ini dan course lain.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label htmlFor="scorm_title">Judul paket</Label>
                        <Input
                            id="scorm_title"
                            placeholder="mis. K3 Konstruksi Modul 1"
                            value={upload.data.title}
                            onChange={(e) => upload.setData('title', e.target.value)}
                        />
                        <FieldError message={upload.errors.title} />
                    </div>
                    <div>
                        <Label htmlFor="scorm_version">Versi SCORM</Label>
                        <Select
                            value={upload.data.version}
                            onValueChange={(v) =>
                                upload.setData('version', v as '1.2' | '2004')
                            }
                        >
                            <SelectTrigger id="scorm_version">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1.2">SCORM 1.2</SelectItem>
                                <SelectItem value="2004">SCORM 2004</SelectItem>
                            </SelectContent>
                        </Select>
                        <FieldError message={upload.errors.version} />
                    </div>
                    <div>
                        <Label>File ZIP</Label>
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".zip"
                            className="hidden"
                            onChange={(e) => upload.setData('zip', e.target.files?.[0] ?? null)}
                        />
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="mt-1 w-full rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center transition hover:border-brand-300 hover:bg-brand-50/40"
                        >
                            <Upload className="mx-auto mb-1.5 size-5 text-slate-400" />
                            {upload.data.zip ? (
                                <span className="text-[12.5px] font-semibold text-slate-700">
                                    {upload.data.zip.name}
                                </span>
                            ) : (
                                <>
                                    <div className="text-[12.5px] font-semibold text-slate-700">
                                        Klik untuk pilih ZIP
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                        Maks 200 MB
                                    </div>
                                </>
                            )}
                        </button>
                        <FieldError message={upload.errors.zip} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={upload.processing || !upload.data.zip || !upload.data.title}
                            className="bg-brand-600 hover:bg-brand-700"
                        >
                            {upload.processing ? 'Mengupload...' : 'Upload'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
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

    const handleFile = (f: File | null) => {
        onFileChange(f);
    };

    return (
        <div>
            <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
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
