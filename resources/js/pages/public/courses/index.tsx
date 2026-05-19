import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, Clock, Search, Sparkles, Users } from 'lucide-react';

import {
    DataTablePagination,
} from '@/components/data-table/data-table-pagination';
import type { Paginator } from '@/components/data-table/data-table-pagination';
import { PageHeader } from '@/components/front/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { storageUrl } from '@/lib/storage-url';

type Category = { id: number; name: string; slug: string };

type Course = {
    id: number;
    title: string;
    subtitle: string | null;
    slug: string;
    price: number;
    compare_at_price: number | null;
    level: string | null;
    delivery_format: 'on_demand' | 'online_live' | 'offline' | 'hybrid' | 'bootcamp';
    is_certified: boolean;
    duration_minutes: number;
    schedule_start: string | null;
    schedule_end: string | null;
    schedule_location: string | null;
    average_rating: string | number;
    reviews_count: number;
    total_students: number;
    thumbnail: string | null;
    category: Category | null;
    instructor: {
        id: number;
        name: string;
        instructor_profile?: { headline: string | null; photo_path: string | null } | null;
    } | null;
    lessons_count: number;
    enrollments_count: number;
};

type FormatOption = { value: string; label: string };

type Props = {
    courses: Paginator<Course>;
    filters: {
        search?: string;
        category?: string;
        level?: string;
        price?: string;
        format?: string;
        certified?: string | boolean;
    };
    categories: Category[];
    formatOptions: FormatOption[];
};

function formatRupiah(value: number): string {
    if (value === 0) {
return 'Gratis';
}

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

function formatDuration(minutes: number): string {
    if (!minutes) {
return '-';
}

    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    if (h === 0) {
return `${m} mnt`;
}

    return `${h}j ${m}m`;
}

function levelLabel(level: string | null): string {
    if (!level) {
return 'Semua Level';
}

    return (
        {
            beginner: 'Pemula',
            intermediate: 'Menengah',
            advanced: 'Lanjutan',
            all: 'Semua Level',
        }[level] ?? level
    );
}

function formatLabel(format: Course['delivery_format']): string {
    return (
        {
            on_demand: 'On-demand',
            online_live: 'Online Live',
            offline: 'Offline',
            hybrid: 'Hybrid',
            bootcamp: 'Bootcamp',
        }[format] ?? format
    );
}

function formatBadgeClass(format: Course['delivery_format']): string {
    return (
        {
            on_demand: 'bg-slate-100 text-slate-700',
            online_live: 'bg-sky-100 text-sky-700',
            offline: 'bg-amber-100 text-amber-800',
            hybrid: 'bg-brand-100 text-brand-700',
            bootcamp: 'bg-rose-100 text-rose-700',
        }[format] ?? 'bg-slate-100 text-slate-700'
    );
}

function formatSchedule(start: string | null, end: string | null): string | null {
    if (!start) return null;
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;
    const sameDay =
        endDate &&
        startDate.toDateString() === endDate.toDateString();

    const dateOnly = (d: Date) =>
        d.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    const timeOnly = (d: Date) =>
        d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    if (sameDay && endDate) {
        return `${dateOnly(startDate)} · ${timeOnly(startDate)}-${timeOnly(endDate)}`;
    }
    if (endDate) {
        return `${dateOnly(startDate)} - ${dateOnly(endDate)}`;
    }
    return dateOnly(startDate);
}

export default function CatalogIndex({
    courses,
    filters,
    categories,
    formatOptions,
}: Props) {
    const certifiedActive = filters.certified === '1' || filters.certified === true;

    const handleFilter = (next: Record<string, string | undefined>) => {
        router.get(
            '/courses',
            { ...filters, ...next, certified: certifiedActive ? '1' : undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const toggleCertified = () => {
        router.get(
            '/courses',
            { ...filters, certified: certifiedActive ? undefined : '1' },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Katalog Kursus · Learnpath" />

            <PageHeader
                eyebrow="Katalog Kursus"
                title="Pilih kursus, tingkatkan skill"
                description="Belajar dari instruktur profesional. Sertifikat resmi, akses seumur hidup setelah membeli."
                breadcrumbs={[
                    { label: 'Beranda', href: '/' },
                    { label: 'Kursus' },
                ]}
            >
                <div className="relative max-w-2xl">
                    <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/60" />
                    <input
                        type="search"
                        placeholder="Cari kursus, topik, atau instruktur..."
                        defaultValue={filters.search ?? ''}
                        onChange={(e) =>
                            handleFilter({ search: e.target.value || undefined })
                        }
                        className="block w-full rounded-full border border-white/15 bg-white/10 px-12 py-3.5 text-[14px] text-white placeholder:text-white/60 backdrop-blur focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                </div>
            </PageHeader>

            <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
                <div className="flex flex-wrap items-center gap-3">
                    <Select
                        value={filters.category ?? 'all'}
                        onValueChange={(v) =>
                            handleFilter({ category: v === 'all' ? undefined : v })
                        }
                    >
                        <SelectTrigger className="h-10 rounded-full bg-white w-[180px]">
                            <SelectValue placeholder="Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Kategori</SelectItem>
                            {categories.map((c) => (
                                <SelectItem key={c.id} value={c.slug}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.level ?? 'all'}
                        onValueChange={(v) =>
                            handleFilter({ level: v === 'all' ? undefined : v })
                        }
                    >
                        <SelectTrigger className="h-10 rounded-full bg-white w-[160px]">
                            <SelectValue placeholder="Level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Level</SelectItem>
                            <SelectItem value="beginner">Pemula</SelectItem>
                            <SelectItem value="intermediate">Menengah</SelectItem>
                            <SelectItem value="advanced">Lanjutan</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.price ?? 'all'}
                        onValueChange={(v) =>
                            handleFilter({ price: v === 'all' ? undefined : v })
                        }
                    >
                        <SelectTrigger className="h-10 rounded-full bg-white w-[140px]">
                            <SelectValue placeholder="Harga" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Harga</SelectItem>
                            <SelectItem value="free">Gratis</SelectItem>
                            <SelectItem value="paid">Berbayar</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.format ?? 'all'}
                        onValueChange={(v) =>
                            handleFilter({ format: v === 'all' ? undefined : v })
                        }
                    >
                        <SelectTrigger className="h-10 rounded-full bg-white w-[150px]">
                            <SelectValue placeholder="Format" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Format</SelectItem>
                            {formatOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <button
                        type="button"
                        onClick={toggleCertified}
                        className={
                            'inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-[12.5px] font-semibold transition ' +
                            (certifiedActive
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300')
                        }
                    >
                        <svg
                            viewBox="0 0 24 24"
                            width="14"
                            height="14"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M12 2l2.4 4.8L20 8l-4 3.9.9 5.6L12 14.8 7.1 17.5 8 11.9 4 8l5.6-1.2z" />
                        </svg>
                        Bersertifikat
                    </button>

                    <p className="ml-auto text-[12.5px] text-slate-500">
                        {courses.total} kursus
                    </p>
                </div>

                {courses.data.length === 0 ? (
                    <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                        <BookOpen className="mx-auto mb-3 size-8 text-slate-400" />
                        <p className="text-sm font-semibold text-slate-900">
                            Tidak ada kursus
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Coba ubah kata kunci atau filter pencarian.
                        </p>
                    </div>
                ) : (
                    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {courses.data.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                )}

                <div className="mt-8">
                    <DataTablePagination paginator={courses} />
                </div>
            </div>
        </>
    );
}

function CourseCard({ course }: { course: Course }) {
    const rating = Number(course.average_rating ?? 0);
    const schedule = formatSchedule(course.schedule_start, course.schedule_end);
    const hasDiscount =
        course.compare_at_price !== null &&
        course.compare_at_price > course.price &&
        course.price > 0;
    const instructorHeadline =
        course.instructor?.instructor_profile?.headline ?? null;

    return (
        <Link
            href={`/courses/${course.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 transition-all duration-200 hover:-translate-y-0.5 hover:ring-slate-300"
        >
            <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-brand-400 via-brand-600 to-brand-800">
                {course.thumbnail ? (
                    <img
                        src={storageUrl(course.thumbnail) ?? ''}
                        alt={course.title}
                        className="size-full object-cover"
                    />
                ) : (
                    <div className="grid size-full place-items-center text-white/40">
                        <BookOpen className="size-12" />
                    </div>
                )}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {course.category && (
                        <Badge className="border-transparent bg-white/90 text-brand-700 backdrop-blur">
                            {course.category.name}
                        </Badge>
                    )}
                </div>
                {course.price === 0 && (
                    <Badge className="absolute top-3 right-3 border-transparent bg-emerald-500 text-white">
                        Gratis
                    </Badge>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex flex-wrap gap-1.5">
                    <Badge
                        className={
                            'border-transparent text-[10.5px] font-bold hover:opacity-90 ' +
                            formatBadgeClass(course.delivery_format)
                        }
                    >
                        {formatLabel(course.delivery_format)}
                    </Badge>
                    {course.is_certified && (
                        <Badge className="border-transparent bg-emerald-100 text-emerald-700 text-[10.5px] font-bold hover:bg-emerald-100">
                            Bersertifikat
                        </Badge>
                    )}
                </div>

                <div>
                    <h3 className="line-clamp-2 text-[15px] leading-snug font-bold text-slate-900 transition group-hover:text-brand-700">
                        {course.title}
                    </h3>
                    {schedule && (
                        <p className="mt-1 text-[11.5px] font-semibold text-slate-600">
                            {schedule}
                        </p>
                    )}
                    {!schedule && course.subtitle && (
                        <p className="mt-1 line-clamp-2 text-[12.5px] text-slate-500">
                            {course.subtitle}
                        </p>
                    )}
                </div>

                {course.instructor && (
                    <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
                        <div className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-brand-300 to-brand-600 text-[11px] font-bold text-white">
                            {course.instructor.instructor_profile?.photo_path ? (
                                <img
                                    src={course.instructor.instructor_profile.photo_path}
                                    alt={course.instructor.name}
                                    className="size-full object-cover"
                                />
                            ) : (
                                course.instructor.name
                                    .split(' ')
                                    .map((p) => p[0])
                                    .slice(0, 2)
                                    .join('')
                                    .toUpperCase()
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-[12.5px] font-semibold text-slate-900">
                                {course.instructor.name}
                            </div>
                            {instructorHeadline && (
                                <div className="truncate text-[10.5px] text-slate-500">
                                    {instructorHeadline}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1">
                        <Users className="size-3.5" />
                        {course.enrollments_count.toLocaleString('id-ID')}
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {formatDuration(course.duration_minutes)}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                            <path d="M12 2 15 9l7 .8-5.2 4.9L18.2 22 12 18 5.8 22l1.4-7.3L2 9.8 9 9z" />
                        </svg>
                        {course.reviews_count > 0 ? rating.toFixed(1) : '—'}
                        {course.reviews_count > 0 && (
                            <span className="font-normal text-slate-400">
                                ({course.reviews_count})
                            </span>
                        )}
                    </span>
                </div>

                <div className="mt-auto flex items-baseline justify-between border-t border-slate-100 pt-3">
                    <div className="text-[10.5px] text-slate-400">
                        {levelLabel(course.level)}
                    </div>
                    <div className="text-right">
                        <div
                            className={
                                course.price === 0
                                    ? 'text-[16px] font-extrabold text-emerald-600'
                                    : 'text-[16px] font-extrabold text-slate-900'
                            }
                        >
                            {formatRupiah(course.price)}
                        </div>
                        {hasDiscount && (
                            <div className="text-[11px] text-slate-400 line-through tabular-nums">
                                {formatRupiah(course.compare_at_price!)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
