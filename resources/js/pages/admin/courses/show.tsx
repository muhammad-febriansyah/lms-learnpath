import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    Calendar,
    CheckCircle2,
    ClipboardCheck,
    Clock,
    FileQuestion,
    GraduationCap,
    Layers,
    MapPin,
    Pencil,
    Plus,
    Send,
    Sparkles,
    Trash2,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

import { IconChevR } from '@/components/learnpath-icons';
import { StatusBadge } from '@/components/status/status-badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { storageUrl } from '@/lib/storage-url';

type Course = {
    id: number;
    title: string;
    subtitle: string | null;
    slug: string;
    description: string | null;
    thumbnail: string | null;
    preview_video_url: string | null;
    price: number;
    compare_at_price: number | null;
    level: string | null;
    language: string | null;
    delivery_format: string;
    lms_format: string;
    scorm_package_id: number | null;
    duration_minutes: number;
    is_certified: boolean;
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
    review_status: 'draft' | 'pending_review' | 'published' | 'rejected';
    review_notes: string | null;
    submitted_at: string | null;
    reviewed_at: string | null;
    sections_count: number;
    lessons_count: number;
    enrollments_count: number;
    sections: {
        id: number;
        title: string;
        sort_order: number;
        lessons: {
            id: number;
            title: string;
            sort_order: number;
            is_preview: boolean;
            duration_minutes: number | null;
        }[];
    }[];
    pre_test: { id: number; title: string; questions_count: number } | null;
    post_test: { id: number; title: string; questions_count: number } | null;
    category: { id: number; name: string } | null;
    instructor: { id: number; name: string; email: string } | null;
    reviewer: { id: number; name: string } | null;
    scorm_package: { id: number; title: string } | null;
    tags: { id: number; name: string }[];
};

type Props = {
    course: Course;
    permissions: {
        canEdit: boolean;
        canDelete: boolean;
        canSubmitReview: boolean;
        canReview: boolean;
    };
};

function formatRupiah(value: number | null): string {
    if (!value) return 'Gratis';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

function formatDateTime(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

const FORMAT_LABELS: Record<string, string> = {
    on_demand: 'On-demand (Rekaman)',
    online_live: 'Online Live',
    offline: 'Offline (Tatap Muka)',
    hybrid: 'Hybrid',
    bootcamp: 'Bootcamp',
};

const LMS_FORMAT_LABELS: Record<string, string> = {
    video: 'Video',
    embed_link: 'Embed Link',
    embed_youtube: 'Embed YouTube',
    scorm: 'SCORM Package',
};

const LEVEL_LABELS: Record<string, string> = {
    beginner: 'Pemula',
    intermediate: 'Menengah',
    advanced: 'Lanjutan',
    all: 'Semua Level',
};

export default function CourseShow({ course, permissions }: Props) {
    const [confirmSubmit, setConfirmSubmit] = useState(false);
    const [confirmApprove, setConfirmApprove] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [rejectNote, setRejectNote] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleSubmit = () => {
        setProcessing(true);
        router.post(
            `/admin/courses/${course.id}/submit-review`,
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setConfirmSubmit(false);
                },
            },
        );
    };

    const handleApprove = () => {
        setProcessing(true);
        router.post(
            `/admin/courses/${course.id}/approve`,
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setConfirmApprove(false);
                },
            },
        );
    };

    const handleReject = () => {
        setProcessing(true);
        router.post(
            `/admin/courses/${course.id}/reject`,
            { review_notes: rejectNote },
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                },
                onSuccess: () => {
                    setRejectOpen(false);
                    setRejectNote('');
                },
            },
        );
    };

    const handleDelete = () => {
        setProcessing(true);
        router.delete(`/admin/courses/${course.id}`, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <>
            <Head title={course.title} />
            <div className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                            <span className="font-semibold text-slate-900 truncate max-w-[280px]">
                                {course.title}
                            </span>
                        </nav>
                        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                            {course.title}
                        </h1>
                        {course.subtitle && (
                            <p className="mt-1 text-[14px] text-slate-600">
                                {course.subtitle}
                            </p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <StatusBadge status={course.review_status} />
                            {course.is_certified && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                                    <GraduationCap className="size-3" />
                                    Bersertifikat
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                                {FORMAT_LABELS[course.delivery_format] ?? course.delivery_format}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" className="rounded-xl">
                            <Link href="/admin/courses">
                                <ArrowLeft className="mr-1.5 size-4" />
                                Kembali
                            </Link>
                        </Button>
                        {permissions.canEdit && (
                            <Button asChild variant="outline" className="rounded-xl">
                                <Link href={`/admin/courses/${course.id}/edit`}>
                                    <Pencil className="mr-1.5 size-4" />
                                    Edit
                                </Link>
                            </Button>
                        )}
                        {permissions.canEdit && (
                            <Button asChild variant="outline" className="rounded-xl">
                                <Link href={`/admin/courses/${course.id}/documents`}>
                                    <Sparkles className="mr-1.5 size-4 text-brand-600" />
                                    Materi AI Tutor
                                </Link>
                            </Button>
                        )}
                        {permissions.canSubmitReview && (
                            <Button
                                onClick={() => setConfirmSubmit(true)}
                                className="rounded-xl bg-brand-600 hover:bg-brand-700"
                            >
                                <Send className="mr-1.5 size-4" />
                                Ajukan Review
                            </Button>
                        )}
                        {permissions.canReview && (
                            <>
                                <Button
                                    onClick={() => setConfirmApprove(true)}
                                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <CheckCircle2 className="mr-1.5 size-4" />
                                    Setujui
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setRejectOpen(true)}
                                    className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
                                >
                                    <XCircle className="mr-1.5 size-4" />
                                    Tolak
                                </Button>
                            </>
                        )}
                        {permissions.canDelete && (
                            <Button
                                variant="outline"
                                onClick={() => setDeleteOpen(true)}
                                className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
                            >
                                <Trash2 className="mr-1.5 size-4" />
                                Hapus
                            </Button>
                        )}
                    </div>
                </div>

                {course.review_status === 'rejected' && course.review_notes && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                        <p className="text-[13px] font-semibold text-rose-800">
                            Catatan Revisi dari Super Admin
                        </p>
                        <p className="mt-1 whitespace-pre-line text-[13px] text-rose-700">
                            {course.review_notes}
                        </p>
                        {course.reviewer && (
                            <p className="mt-2 text-[11.5px] text-rose-600">
                                Oleh {course.reviewer.name} · {formatDateTime(course.reviewed_at)}
                            </p>
                        )}
                    </div>
                )}

                {course.thumbnail && (
                    <div className="overflow-hidden rounded-2xl bg-slate-100 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <img
                            src={storageUrl(course.thumbnail) ?? ''}
                            alt={course.title}
                            className="aspect-video w-full object-cover"
                        />
                    </div>
                )}

                <div className="grid gap-5 lg:grid-cols-3">
                    <div className="space-y-5 lg:col-span-2">
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 rounded-xl bg-slate-100 p-1">
                                <TabsTrigger
                                    value="overview"
                                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    Ringkasan
                                </TabsTrigger>
                                <TabsTrigger
                                    value="curriculum"
                                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    Kurikulum
                                </TabsTrigger>
                                <TabsTrigger
                                    value="assessment"
                                    disabled={!course.is_certified}
                                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    Assessment
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="mt-4 space-y-4">
                                <Card title="Deskripsi">
                                    {course.description ? (
                                        <div
                                            className="prose prose-sm max-w-none text-[13.5px] leading-relaxed text-slate-700 [&_a]:text-brand-600 [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5"
                                            dangerouslySetInnerHTML={{ __html: course.description }}
                                        />
                                    ) : (
                                        <p className="text-[13.5px] text-slate-400 italic">Belum ada deskripsi.</p>
                                    )}
                                </Card>

                                <Card title="Apa yang akan dipelajari">
                                    <BulletList items={course.learning_objectives ?? []} />
                                </Card>

                                <Card title="Prasyarat">
                                    <BulletList items={course.requirements ?? []} />
                                </Card>

                                <Card title="Untuk Siapa">
                                    <BulletList items={course.target_audience ?? []} />
                                </Card>
                            </TabsContent>

                            <TabsContent value="curriculum" className="mt-4 space-y-4">
                                <Card title="Ringkasan Kurikulum">
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <StatTile
                                            icon={<Layers className="size-4" />}
                                            label="Section"
                                            value={course.sections_count}
                                        />
                                        <StatTile
                                            icon={<BookOpen className="size-4" />}
                                            label="Lesson"
                                            value={course.lessons_count}
                                        />
                                        <StatTile
                                            icon={<Users className="size-4" />}
                                            label="Peserta"
                                            value={course.enrollments_count}
                                        />
                                    </div>
                                </Card>

                                {(course.sections ?? []).length > 0 && (
                                    <Card title="Daftar Lesson · toggle preview gratis di sini">
                                        <div className="space-y-4">
                                            {course.sections.map((section, idx) => (
                                                <div
                                                    key={section.id}
                                                    className="rounded-xl ring-1 ring-slate-200/70"
                                                >
                                                    <div className="border-b border-slate-100 bg-slate-50/60 px-3.5 py-2">
                                                        <div className="text-[10.5px] font-bold tracking-wider text-slate-500 uppercase">
                                                            Section {idx + 1}
                                                        </div>
                                                        <div className="text-[14px] font-bold text-slate-900">
                                                            {section.title}
                                                        </div>
                                                    </div>
                                                    {section.lessons.length === 0 ? (
                                                        <div className="px-3.5 py-3 text-[12.5px] text-slate-500">
                                                            Belum ada lesson di section ini.
                                                        </div>
                                                    ) : (
                                                        <ul className="divide-y divide-slate-100">
                                                            {section.lessons.map((lesson) => (
                                                                <li
                                                                    key={lesson.id}
                                                                    className="flex items-center gap-3 px-3.5 py-2.5"
                                                                >
                                                                    <BookOpen className="size-4 shrink-0 text-slate-400" />
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="truncate text-[13px] font-semibold text-slate-800">
                                                                            {lesson.title}
                                                                        </div>
                                                                        {lesson.duration_minutes && (
                                                                            <div className="text-[11px] text-slate-500">
                                                                                {lesson.duration_minutes} menit
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {lesson.is_preview && (
                                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700">
                                                                            ▶ Preview
                                                                        </span>
                                                                    )}
                                                                    {permissions.canEdit && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                router.post(
                                                                                    `/admin/lessons/${lesson.id}/toggle-preview`,
                                                                                    {},
                                                                                    { preserveScroll: true },
                                                                                )
                                                                            }
                                                                            className={
                                                                                'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ' +
                                                                                (lesson.is_preview
                                                                                    ? 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                                                                    : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100')
                                                                            }
                                                                        >
                                                                            {lesson.is_preview ? 'Lepas preview' : 'Set preview'}
                                                                        </button>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="assessment" className="mt-4 space-y-4">
                                {course.is_certified ? (
                                    <Card title="Assessment & Soal">
                                        <div className="mb-4 grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                                                <div className="text-[11.5px] font-medium text-slate-500">
                                                    Nilai Kelulusan
                                                </div>
                                                <div className="mt-0.5 text-lg font-extrabold text-slate-900 tabular-nums">
                                                    {course.passing_score}%
                                                </div>
                                            </div>
                                            <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                                                <div className="text-[11.5px] font-medium text-slate-500">
                                                    Maks. Percobaan
                                                </div>
                                                <div className="mt-0.5 text-lg font-extrabold text-slate-900 tabular-nums">
                                                    {course.max_attempts}x
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <AssessmentRow
                                                label="Pre-Test"
                                                required={course.pre_test_required}
                                                assessment={course.pre_test}
                                                canManage={permissions.canEdit}
                                                courseId={course.id}
                                                type="pre_test"
                                            />
                                            <AssessmentRow
                                                label="Post-Test"
                                                required={course.post_test_required}
                                                assessment={course.post_test}
                                                canManage={permissions.canEdit}
                                                courseId={course.id}
                                                type="post_test"
                                            />
                                        </div>
                                    </Card>
                                ) : (
                                    <Card title="Assessment & Soal">
                                        <p className="text-[13px] text-slate-500">
                                            Course ini bukan course bersertifikat. Aktifkan
                                            sertifikasi via Edit course untuk mengelola
                                            pre/post test.
                                        </p>
                                    </Card>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="space-y-5">
                        <Card title="Informasi">
                            <dl className="space-y-2.5 text-[13px]">
                                <Row label="Kategori" value={course.category?.name ?? '—'} />
                                <Row
                                    label="Mentor"
                                    value={course.instructor?.name ?? '—'}
                                />
                                <Row
                                    label="Level"
                                    value={LEVEL_LABELS[course.level ?? ''] ?? course.level ?? '—'}
                                />
                                <Row
                                    label="Bahasa"
                                    value={course.language === 'id' ? 'Bahasa Indonesia' : course.language === 'en' ? 'English' : '—'}
                                />
                                <Row
                                    label="Format LMS"
                                    value={
                                        LMS_FORMAT_LABELS[course.lms_format] ?? course.lms_format
                                    }
                                />
                                {course.lms_format === 'scorm' && (
                                    <Row
                                        label="Paket SCORM"
                                        value={course.scorm_package?.title ?? '—'}
                                    />
                                )}
                                <Row label="Slug" value={course.slug} />
                            </dl>
                        </Card>

                        <Card title="Harga">
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-extrabold text-slate-900">
                                    {formatRupiah(course.price)}
                                </span>
                                {course.compare_at_price && course.compare_at_price > course.price && (
                                    <span className="text-[12.5px] text-slate-400 line-through">
                                        {formatRupiah(course.compare_at_price)}
                                    </span>
                                )}
                            </div>
                        </Card>

                        {course.delivery_format !== 'on_demand' && (
                            <Card title="Jadwal & Lokasi">
                                <dl className="space-y-2.5 text-[13px]">
                                    <Row
                                        label={<Calendar className="size-3.5 inline mr-1" />}
                                        labelText="Mulai"
                                        value={formatDateTime(course.schedule_start)}
                                    />
                                    <Row
                                        label={<Calendar className="size-3.5 inline mr-1" />}
                                        labelText="Selesai"
                                        value={formatDateTime(course.schedule_end)}
                                    />
                                    <Row
                                        label={<MapPin className="size-3.5 inline mr-1" />}
                                        labelText="Lokasi"
                                        value={course.schedule_location ?? '—'}
                                    />
                                    {course.max_participants && (
                                        <Row
                                            label={<Users className="size-3.5 inline mr-1" />}
                                            labelText="Kapasitas"
                                            value={`${course.max_participants} peserta`}
                                        />
                                    )}
                                </dl>
                            </Card>
                        )}

                        {course.is_certified && (
                            <Card title="Aturan Assessment">
                                <dl className="space-y-2.5 text-[13px]">
                                    <Row
                                        label="Nilai Kelulusan"
                                        value={`${course.passing_score}%`}
                                    />
                                    <Row
                                        label="Maks. Percobaan"
                                        value={String(course.max_attempts)}
                                    />
                                    <Row
                                        label="Pre Test"
                                        value={course.pre_test_required ? 'Wajib' : 'Opsional'}
                                    />
                                    <Row
                                        label="Post Test"
                                        value={course.post_test_required ? 'Wajib' : 'Opsional'}
                                    />
                                </dl>
                            </Card>
                        )}

                        <Card title="Durasi">
                            <div className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-700">
                                <Clock className="size-4 text-slate-400" />
                                {course.duration_minutes
                                    ? `${course.duration_minutes} menit`
                                    : 'Belum diatur'}
                            </div>
                        </Card>

                        {course.tags.length > 0 && (
                            <Card title="Tag">
                                <div className="flex flex-wrap gap-1.5">
                                    {course.tags.map((tag) => (
                                        <span
                                            key={tag.id}
                                            className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700"
                                        >
                                            {tag.name}
                                        </span>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {(course.submitted_at || course.reviewed_at) && (
                            <Card title="Riwayat Review">
                                <dl className="space-y-2.5 text-[13px]">
                                    {course.submitted_at && (
                                        <Row
                                            label="Diajukan"
                                            value={formatDateTime(course.submitted_at)}
                                        />
                                    )}
                                    {course.reviewed_at && (
                                        <Row
                                            label="Ditinjau"
                                            value={formatDateTime(course.reviewed_at)}
                                        />
                                    )}
                                    {course.reviewer && (
                                        <Row label="Oleh" value={course.reviewer.name} />
                                    )}
                                </dl>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={confirmSubmit} onOpenChange={setConfirmSubmit}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ajukan course untuk review?</DialogTitle>
                        <DialogDescription>
                            Course akan dikunci dari pengeditan sampai Super Admin
                            menyetujui atau mengembalikan dengan catatan revisi.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmSubmit(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={processing}
                            className="bg-brand-600 hover:bg-brand-700"
                        >
                            {processing ? 'Mengirim...' : 'Ya, Ajukan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={confirmApprove} onOpenChange={setConfirmApprove}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Setujui &amp; publikasi course?</DialogTitle>
                        <DialogDescription>
                            Course akan langsung tampil di catalog publik dan dapat dibeli
                            peserta.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmApprove(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleApprove}
                            disabled={processing}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {processing ? 'Memproses...' : 'Ya, Setujui'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Kembalikan ke mentor dengan revisi</DialogTitle>
                        <DialogDescription>
                            Berikan catatan jelas tentang apa yang perlu diperbaiki sebelum
                            course dapat diajukan ulang.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        rows={5}
                        placeholder="Contoh: Deskripsi terlalu pendek dan thumbnail buram. Tolong lengkapi tujuan pembelajaran minimal 5 item."
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                    />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setRejectOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={processing || rejectNote.trim().length < 5}
                        >
                            {processing ? 'Mengirim...' : 'Kirim Catatan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus course?</DialogTitle>
                        <DialogDescription>
                            Course beserta section, lesson, dan data terkait akan dihapus
                            permanen.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={processing}
                        >
                            {processing ? 'Menghapus...' : 'Hapus Permanen'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <h2 className="mb-3 text-[14px] font-bold text-slate-900">{title}</h2>
            {children}
        </div>
    );
}

function Row({
    label,
    labelText,
    value,
}: {
    label: React.ReactNode;
    labelText?: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-start justify-between gap-3">
            <dt className="text-[12.5px] text-slate-500">
                {labelText ? (
                    <>
                        {label}
                        {labelText}
                    </>
                ) : (
                    label
                )}
            </dt>
            <dd className="text-right text-[12.5px] font-semibold text-slate-900">
                {value}
            </dd>
        </div>
    );
}

function BulletList({ items }: { items: string[] }) {
    if (items.length === 0) {
        return <p className="text-[13px] text-slate-400 italic">Belum diisi.</p>;
    }
    return (
        <ul className="space-y-2">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-slate-700">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

function AssessmentRow({
    label,
    required,
    assessment,
    canManage,
    courseId,
    type,
}: {
    label: string;
    required: boolean;
    assessment: { id: number; title: string; questions_count: number } | null;
    canManage: boolean;
    courseId: number;
    type: 'pre_test' | 'post_test';
}) {
    const hasAssessment = !!assessment;

    return (
        <div className="rounded-xl border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <ClipboardCheck className="size-4 text-slate-400" />
                        <span className="text-[13px] font-semibold text-slate-900">
                            {label}
                        </span>
                        {required ? (
                            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                                Wajib
                            </span>
                        ) : (
                            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                                Opsional
                            </span>
                        )}
                    </div>
                    {hasAssessment ? (
                        <p className="mt-1 text-[12px] text-slate-500">
                            <span className="font-semibold text-slate-700 tabular-nums">
                                {assessment.questions_count}
                            </span>{' '}
                            soal · {assessment.title}
                        </p>
                    ) : (
                        <p className="mt-1 text-[12px] text-slate-400 italic">
                            Belum dibuat
                        </p>
                    )}
                </div>
                {canManage && (
                    <Link
                        href={
                            hasAssessment
                                ? `/admin/assessments/${assessment.id}`
                                : `/admin/assessments/create?course_id=${courseId}&type=${type}`
                        }
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1 text-[12px] font-semibold text-brand-700 transition hover:bg-brand-100"
                    >
                        {hasAssessment ? (
                            <>
                                <FileQuestion className="size-3.5" />
                                Kelola Soal
                            </>
                        ) : (
                            <>
                                <Plus className="size-3.5" />
                                Buat Assessment
                            </>
                        )}
                        <ArrowRight className="size-3" />
                    </Link>
                )}
            </div>
        </div>
    );
}

function StatTile({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[11.5px] font-medium text-slate-500">
                {icon}
                {label}
            </div>
            <div className="mt-1 text-lg font-extrabold text-slate-900 tabular-nums">
                {value}
            </div>
        </div>
    );
}
