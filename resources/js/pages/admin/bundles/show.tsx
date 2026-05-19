import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    Clock,
    Eye,
    Layers,
    Package,
    Pencil,
    Tag,
    TrendingDown,
    Trash2,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';

import { IconChevR } from '@/components/learnpath-icons';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { storageUrl } from '@/lib/storage-url';

type BundleCourse = {
    id: number;
    title: string;
    subtitle: string | null;
    slug: string;
    thumbnail: string | null;
    price: number;
    level: string | null;
    duration_minutes: number;
    lessons_count: number;
    enrollments_count: number;
};

type Bundle = {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    thumbnail: string | null;
    price: number;
    compare_at_price: number | null;
    is_published: boolean;
    published_at: string | null;
    created_at: string | null;
    courses_total: number;
    savings: number;
    savings_percent: number;
    courses: BundleCourse[];
};

type Props = { bundle: Bundle };

const LEVEL_LABEL: Record<string, string> = {
    beginner: 'Pemula',
    intermediate: 'Menengah',
    advanced: 'Lanjutan',
};

function formatRupiah(value: number): string {
    if (value === 0) return 'Gratis';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

function formatDuration(minutes: number): string {
    if (!minutes) return '-';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m} mnt`;
    if (m === 0) return `${h} jam`;
    return `${h}j ${m}m`;
}

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export default function BundleShow({ bundle }: Props) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const thumb = storageUrl(bundle.thumbnail);
    const totalDuration = bundle.courses.reduce(
        (s, c) => s + c.duration_minutes,
        0,
    );
    const totalLessons = bundle.courses.reduce(
        (s, c) => s + c.lessons_count,
        0,
    );

    const performDelete = () => {
        setDeleting(true);
        router.delete(`/admin/bundles/${bundle.id}`, {
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <>
            <Head title={bundle.title} />
            <div className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                            <Link href="/admin/dashboard" className="hover:text-slate-700">
                                Dashboard
                            </Link>
                            <IconChevR size={12} className="text-slate-300" />
                            <Link href="/admin/bundles" className="hover:text-slate-700">
                                Paket Kursus
                            </Link>
                            <IconChevR size={12} className="text-slate-300" />
                            <span className="truncate font-semibold text-slate-900">
                                {bundle.title}
                            </span>
                        </nav>
                        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                            {bundle.title}
                        </h1>
                        <p className="mt-1 text-[13.5px] text-slate-500">
                            /{bundle.slug}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button asChild variant="outline" className="rounded-xl">
                            <Link href="/admin/bundles">
                                <ArrowLeft className="mr-1.5 size-4" />
                                Kembali
                            </Link>
                        </Button>
                        <Button
                            asChild
                            className="rounded-xl bg-amber-500 text-white hover:bg-amber-600"
                        >
                            <Link href={`/admin/bundles/${bundle.id}/edit`}>
                                <Pencil className="mr-1.5 size-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button
                            variant="destructive"
                            className="rounded-xl"
                            onClick={() => setDeleteOpen(true)}
                        >
                            <Trash2 className="mr-1.5 size-4" />
                            Hapus
                        </Button>
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-5">
                        <div className="overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                            <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200">
                                {thumb ? (
                                    <img
                                        src={thumb}
                                        alt={bundle.title}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <div className="flex size-full items-center justify-center bg-gradient-to-br from-brand-500 to-brand-700">
                                        <Package className="size-16 text-white/40" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4">
                                    {bundle.is_published ? (
                                        <span className="inline-flex items-center rounded-full bg-emerald-500/95 px-3 py-1 text-[11.5px] font-semibold text-white shadow ring-1 ring-emerald-300/50 backdrop-blur">
                                            Published
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-full bg-slate-700/85 px-3 py-1 text-[11.5px] font-semibold text-white shadow backdrop-blur">
                                            Draft
                                        </span>
                                    )}
                                </div>
                                {bundle.savings_percent > 0 && (
                                    <span className="absolute bottom-4 left-4 inline-flex items-center gap-1 rounded-full bg-rose-500 px-3 py-1 text-[11.5px] font-extrabold text-white shadow">
                                        <TrendingDown className="size-3.5" />
                                        Hemat {bundle.savings_percent}%
                                    </span>
                                )}
                            </div>

                            <div className="space-y-3 p-6">
                                <div className="flex items-center gap-1.5 text-[11.5px] font-semibold tracking-wider text-brand-700 uppercase">
                                    <Package className="size-3.5" />
                                    Deskripsi Paket
                                </div>
                                {bundle.description ? (
                                    <p className="whitespace-pre-line text-[14px] leading-relaxed text-slate-700">
                                        {bundle.description}
                                    </p>
                                ) : (
                                    <p className="text-[13px] text-slate-400 italic">
                                        Belum ada deskripsi untuk paket ini.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-[15px] font-bold text-slate-900">
                                        Kursus dalam Paket
                                    </h2>
                                    <p className="mt-0.5 text-[12.5px] text-slate-500">
                                        {bundle.courses.length} kursus · {totalLessons} lesson
                                        {totalDuration > 0
                                            ? ` · ${formatDuration(totalDuration)}`
                                            : ''}
                                    </p>
                                </div>
                            </div>

                            {bundle.courses.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                                    <div className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                                        <BookOpen className="size-5" />
                                    </div>
                                    <p className="text-[13.5px] text-slate-500">
                                        Belum ada kursus di paket ini.
                                    </p>
                                </div>
                            ) : (
                                <ul className="space-y-3">
                                    {bundle.courses.map((course, idx) => (
                                        <CourseRow
                                            key={course.id}
                                            course={course}
                                            position={idx + 1}
                                        />
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <aside className="space-y-5">
                        <div className="rounded-2xl bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                            <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                                Harga Paket
                            </div>
                            <div className="mt-2 text-3xl font-extrabold text-slate-900 tabular-nums">
                                {formatRupiah(bundle.price)}
                            </div>
                            {bundle.compare_at_price &&
                                bundle.compare_at_price > bundle.price && (
                                    <div className="mt-1 flex items-center gap-2 text-[12.5px]">
                                        <span className="text-slate-400 line-through tabular-nums">
                                            {formatRupiah(bundle.compare_at_price)}
                                        </span>
                                        <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-100 px-2 py-0.5 text-[10.5px] font-bold text-rose-700">
                                            <TrendingDown className="size-3" />
                                            Hemat {formatRupiah(bundle.savings)}
                                        </span>
                                    </div>
                                )}

                            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-[12.5px]">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">
                                        Total harga kursus terpisah
                                    </span>
                                    <span className="font-semibold text-slate-900 tabular-nums">
                                        {formatRupiah(bundle.courses_total)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Harga paket</span>
                                    <span className="font-semibold text-slate-900 tabular-nums">
                                        {formatRupiah(bundle.price)}
                                    </span>
                                </div>
                                {bundle.savings > 0 && (
                                    <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-2">
                                        <span className="font-semibold text-emerald-700">
                                            Penghematan
                                        </span>
                                        <span className="font-extrabold text-emerald-700 tabular-nums">
                                            {formatRupiah(bundle.savings)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                            <h3 className="text-[14px] font-bold text-slate-900">
                                Informasi
                            </h3>
                            <dl className="mt-4 space-y-3 text-[12.5px]">
                                <Meta
                                    icon={<Tag className="size-3.5 text-slate-400" />}
                                    label="Slug"
                                    value={<code className="text-slate-700">/{bundle.slug}</code>}
                                />
                                <Meta
                                    icon={<BookOpen className="size-3.5 text-slate-400" />}
                                    label="Total kursus"
                                    value={
                                        <span className="font-semibold text-slate-900 tabular-nums">
                                            {bundle.courses.length} kursus
                                        </span>
                                    }
                                />
                                <Meta
                                    icon={<Layers className="size-3.5 text-slate-400" />}
                                    label="Total lesson"
                                    value={
                                        <span className="font-semibold text-slate-900 tabular-nums">
                                            {totalLessons}
                                        </span>
                                    }
                                />
                                {totalDuration > 0 && (
                                    <Meta
                                        icon={<Clock className="size-3.5 text-slate-400" />}
                                        label="Durasi total"
                                        value={
                                            <span className="font-semibold text-slate-900">
                                                {formatDuration(totalDuration)}
                                            </span>
                                        }
                                    />
                                )}
                                <Meta
                                    icon={<Calendar className="size-3.5 text-slate-400" />}
                                    label="Dipublikasikan"
                                    value={
                                        <span className="text-slate-700">
                                            {formatDate(bundle.published_at)}
                                        </span>
                                    }
                                />
                                <Meta
                                    icon={<Calendar className="size-3.5 text-slate-400" />}
                                    label="Dibuat"
                                    value={
                                        <span className="text-slate-700">
                                            {formatDate(bundle.created_at)}
                                        </span>
                                    }
                                />
                            </dl>
                        </div>
                    </aside>
                </div>
            </div>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus paket?</DialogTitle>
                        <DialogDescription>
                            Paket <span className="font-semibold">"{bundle.title}"</span>{' '}
                            akan dihapus. Order yang sudah memakai paket ini tidak
                            terpengaruh.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteOpen(false)}
                            disabled={deleting}
                        >
                            <X className="mr-1.5 size-4" />
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={performDelete}
                            disabled={deleting}
                        >
                            <Trash2 className="mr-1.5 size-4" />
                            {deleting ? 'Menghapus...' : 'Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function Meta({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between gap-3">
            <dt className="inline-flex items-center gap-1.5 text-slate-500">
                {icon}
                {label}
            </dt>
            <dd>{value}</dd>
        </div>
    );
}

function CourseRow({
    course,
    position,
}: {
    course: BundleCourse;
    position: number;
}) {
    const thumb = storageUrl(course.thumbnail);

    return (
        <li className="group flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-200 transition hover:ring-brand-200">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand-50 text-[11px] font-bold text-brand-700 tabular-nums">
                {position}
            </span>
            <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-brand-200 to-brand-300">
                {thumb ? (
                    <img
                        src={thumb}
                        alt={course.title}
                        className="size-full object-cover"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center">
                        <BookOpen className="size-5 text-white/70" />
                    </div>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-bold text-slate-900">
                    {course.title}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-slate-500">
                    {course.level && (
                        <span>{LEVEL_LABEL[course.level] ?? course.level}</span>
                    )}
                    <span className="inline-flex items-center gap-1">
                        <BookOpen className="size-3 text-slate-400" />
                        {course.lessons_count} lesson
                    </span>
                    {course.duration_minutes > 0 && (
                        <span className="inline-flex items-center gap-1">
                            <Clock className="size-3 text-slate-400" />
                            {formatDuration(course.duration_minutes)}
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                        <Users className="size-3 text-slate-400" />
                        {course.enrollments_count} peserta
                    </span>
                </div>
            </div>
            <div className="hidden text-right sm:block">
                <div className="text-[11.5px] font-bold text-slate-900 tabular-nums">
                    {formatRupiah(course.price)}
                </div>
            </div>
            <Button
                asChild
                size="sm"
                variant="outline"
                className="h-8 rounded-lg px-2.5 text-[11px]"
            >
                <Link href={`/admin/courses/${course.id}`}>
                    <Eye className="mr-1 size-3" />
                    Detail
                </Link>
            </Button>
        </li>
    );
}
