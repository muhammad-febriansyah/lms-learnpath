import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    BarChart3,
    BookOpen,
    Building2,
    CheckCircle2,
    Clock,
    GraduationCap,
    Sparkles,
    Target,
    Users,
} from 'lucide-react';

import { PageHeader } from '@/components/front/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { storageUrl } from '@/lib/storage-url';
import { cn } from '@/lib/utils';

type Category = {
    id: number;
    name: string;
    slug: string;
    courses_count: number;
};

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
    average_rating: string | number;
    total_students: number;
    thumbnail: string | null;
    category: { id: number; name: string; slug: string } | null;
    instructor: {
        id: number;
        name: string;
        instructor_profile?: { headline: string | null; photo_path: string | null } | null;
    } | null;
    lessons_count: number;
    enrollments_count: number;
};

type Props = {
    categories: Category[];
    activeSlug: string;
    courses: Course[];
    stats: {
        total_courses: number;
        total_categories: number;
    };
};

const BENEFITS = [
    {
        icon: Target,
        title: 'Auto-enroll berdasarkan jabatan',
        description:
            'Set kompetensi per posisi sekali, sistem otomatis mendaftarkan karyawan ke course yang relevan saat HR mengundang.',
    },
    {
        icon: BarChart3,
        title: 'Skill Matrix & Skill Gap',
        description:
            'Pantau gap kompetensi tim dibanding target jabatan. Dapatkan rekomendasi training otomatis untuk tiap karyawan.',
    },
    {
        icon: GraduationCap,
        title: 'Sertifikat terverifikasi',
        description:
            'Setiap karyawan dapat sertifikat dengan kode verifikasi unik setelah menyelesaikan course dan post-test.',
    },
    {
        icon: Users,
        title: 'Manajemen terpusat',
        description:
            'Undang karyawan via email atau upload CSV, kelola akses & seat dari satu dashboard HR.',
    },
];

const TRUST_POINTS = [
    'Auto-enroll course sesuai jabatan',
    'Dashboard khusus HR/Admin',
    'Bulk invite via CSV',
    'Skill matrix + gap analysis',
    'Laporan progress real-time',
    'Support prioritas tim Learnpath',
];

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
    return `${h}j ${m}m`;
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

export default function CorporateHub({ categories, activeSlug, courses, stats }: Props) {
    const handleTab = (slug: string) => {
        router.get(
            '/corporate',
            { category: slug },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Learnpath untuk Perusahaan — Course Library" />

            <PageHeader
                eyebrow="Untuk Perusahaan"
                title="Library training untuk karyawan Anda"
                description="Course terkurasi untuk HR, Sales, Leadership, Compliance, dan Operations. Otomatis terdaftar di akun karyawan sesuai jabatan. Lengkap dengan skill matrix dan sertifikat resmi."
                breadcrumbs={[
                    { label: 'Beranda', href: '/' },
                    { label: 'Untuk Bisnis' },
                ]}
                actions={
                    <>
                        <Link
                            href="/business/register"
                            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-brand-700 transition hover:-translate-y-0.5 hover:bg-brand-50"
                        >
                            Mulai untuk Tim
                            <ArrowRight className="size-4" />
                        </Link>
                        <Link
                            href="/corporate/case-studies"
                            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-semibold text-white/85 ring-1 ring-white/20 transition hover:bg-white/10 hover:text-white"
                        >
                            Lihat Studi Kasus
                        </Link>
                    </>
                }
            >
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-white/85">
                    <span className="inline-flex items-center gap-1.5">
                        <BookOpen className="size-4 text-brand-300" />
                        {stats.total_courses} course aktif
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <Sparkles className="size-4 text-brand-300" />
                        {stats.total_categories} kategori bisnis
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <Award className="size-4 text-brand-300" />
                        Sertifikat resmi
                    </span>
                </div>
            </PageHeader>

            <div className="mx-auto max-w-7xl space-y-14 px-5 py-12 lg:px-8 lg:py-16">
                {/* Benefit cards */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {BENEFITS.map((b) => (
                        <div
                            key={b.title}
                            className="rounded-2xl bg-card p-5 ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                        >
                            <div className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                                <b.icon className="size-5" />
                            </div>
                            <div className="mt-3 text-[14px] font-bold text-slate-900">
                                {b.title}
                            </div>
                            <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600">
                                {b.description}
                            </p>
                        </div>
                    ))}
                </section>

                {/* Course Library section */}
                <section>
                    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h2 className="text-[22px] font-extrabold tracking-tight text-slate-900 sm:text-[26px]">
                                Course Library untuk Tim Anda
                            </h2>
                            <p className="mt-1 text-[13.5px] text-slate-600">
                                Pilih kategori sesuai kebutuhan tim. Semua course bisa di-assign
                                otomatis ke karyawan berdasarkan jabatan.
                            </p>
                        </div>
                        <Button asChild variant="outline" className="h-10 rounded-xl">
                            <Link href="/courses">
                                Lihat Semua Course
                                <ArrowRight className="ml-1.5 size-4" />
                            </Link>
                        </Button>
                    </div>

                    {categories.length === 0 ? (
                        <div className="rounded-2xl bg-card p-12 text-center ring-1 ring-slate-200/70">
                            <BookOpen className="mx-auto mb-3 size-8 text-slate-400" />
                            <p className="text-sm font-semibold text-slate-900">
                                Belum ada kategori dengan course aktif
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Tabs */}
                            <div className="flex flex-wrap gap-2">
                                {categories.map((c) => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => handleTab(c.slug)}
                                        className={cn(
                                            'inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[12.5px] font-semibold transition',
                                            activeSlug === c.slug
                                                ? 'border-transparent bg-brand-600 text-white shadow-sm'
                                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
                                        )}
                                    >
                                        {c.name}
                                        <span
                                            className={cn(
                                                'rounded-full px-1.5 text-[10.5px] font-bold tabular-nums',
                                                activeSlug === c.slug
                                                    ? 'bg-white/25 text-white'
                                                    : 'bg-slate-100 text-slate-500',
                                            )}
                                        >
                                            {c.courses_count}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Course grid */}
                            <div className="mt-5">
                                {courses.length === 0 ? (
                                    <div className="rounded-2xl bg-card p-12 text-center ring-1 ring-slate-200/70">
                                        <BookOpen className="mx-auto mb-3 size-8 text-slate-400" />
                                        <p className="text-sm font-semibold text-slate-900">
                                            Belum ada course di kategori ini
                                        </p>
                                        <p className="mt-1 text-[12.5px] text-slate-500">
                                            Pilih kategori lain di atas.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                        {courses.map((course) => (
                                            <CourseCard key={course.id} course={course} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </section>

                {/* Trust / benefits row */}
                <section className="rounded-3xl bg-slate-900 p-8 text-white sm:p-12">
                    <div className="grid gap-8 sm:grid-cols-2 sm:gap-10">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10.5px] font-bold tracking-[0.16em] uppercase">
                                <CheckCircle2 className="size-3" />
                                Semua Termasuk
                            </div>
                            <h3 className="mt-3 text-[24px] leading-tight font-extrabold tracking-tight sm:text-[28px]">
                                Bayar per seat. Akses tak terbatas.
                            </h3>
                            <p className="mt-3 text-[14px] leading-relaxed text-white/75">
                                Tidak ada biaya tersembunyi. Setiap seat dapat akses penuh ke
                                semua course di library, dengan progress tracking,
                                sertifikat, dan auto-enroll berdasarkan jabatan.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Button
                                    asChild
                                    size="lg"
                                    className="h-12 rounded-xl bg-brand-500 px-7 text-white hover:bg-brand-600"
                                >
                                    <Link href="/business/register">
                                        Mulai Trial
                                        <ArrowRight className="ml-1.5 size-4" />
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    size="lg"
                                    className="h-12 rounded-xl border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                                >
                                    <Link href="/business">Pricing & Detail</Link>
                                </Button>
                            </div>
                        </div>
                        <ul className="space-y-2.5">
                            {TRUST_POINTS.map((p) => (
                                <li
                                    key={p}
                                    className="flex items-start gap-2.5 text-[13.5px] text-white/90"
                                >
                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                                    <span>{p}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            </div>
        </>
    );
}

function CourseCard({ course }: { course: Course }) {
    const rating = Number(course.average_rating ?? 0);
    const hasDiscount =
        course.compare_at_price !== null &&
        course.compare_at_price > course.price &&
        course.price > 0;

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

                <h3 className="line-clamp-2 text-[15px] leading-snug font-bold text-slate-900 transition group-hover:text-brand-700">
                    {course.title}
                </h3>

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
                        {rating.toFixed(1)}
                    </span>
                </div>

                <div className="mt-auto flex items-baseline justify-between border-t border-slate-100 pt-3">
                    <div className="text-[10.5px] text-slate-400">
                        {course.lessons_count} lesson
                    </div>
                    <div className="text-right">
                        <div
                            className={
                                course.price === 0
                                    ? 'text-[15px] font-extrabold text-emerald-600'
                                    : 'text-[15px] font-extrabold text-slate-900'
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
