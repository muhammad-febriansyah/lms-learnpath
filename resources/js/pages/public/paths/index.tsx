import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, BookOpen, Calendar, Compass, Search, Sparkles, Users, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import {
    DataTablePagination,
    type Paginator,
} from '@/components/data-table/data-table-pagination';
import { PageHeader } from '@/components/front/page-header';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Path = {
    id: number;
    title: string;
    slug: string;
    subtitle: string | null;
    thumbnail: string | null;
    level: string | null;
    duration_weeks: number | null;
    total_courses: number;
    total_students: number;
    courses_count: number;
    enrollments_count: number;
    position: { id: number; name: string; division: string | null } | null;
};

type Props = {
    paths: Paginator<Path>;
    filters: { search?: string; level?: string };
};

function levelLabel(level: string | null): string {
    if (!level) return 'Semua Level';
    return (
        {
            beginner: 'Pemula',
            intermediate: 'Menengah',
            advanced: 'Lanjutan',
        }[level] ?? level
    );
}

function levelBadgeClass(level: string | null): string {
    return (
        {
            beginner: 'bg-emerald-100 text-emerald-700',
            intermediate: 'bg-amber-100 text-amber-800',
            advanced: 'bg-rose-100 text-rose-700',
        }[level ?? ''] ?? 'bg-slate-100 text-slate-700'
    );
}

export default function PathsIndex({ paths, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const initial = useRef(true);

    const handleFilter = (next: Record<string, string | undefined>) => {
        router.get(
            '/paths',
            { ...filters, ...next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    // Debounce search: kirim request 350ms setelah user berhenti mengetik.
    useEffect(() => {
        if (initial.current) {
            initial.current = false;

            return;
        }
        const timer = setTimeout(() => {
            handleFilter({ search: search || undefined });
        }, 350);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    return (
        <>
            <Head title="Learning Path — Roadmap Karir" />

            <PageHeader
                eyebrow="Learning Path"
                title="Roadmap karir, bukan cuma katalog"
                description="Kurikulum berurutan yang menuntun Anda dari nol sampai siap kerja di jabatan target. Setiap path dirancang oleh praktisi industri."
                breadcrumbs={[
                    { label: 'Beranda', href: '/' },
                    { label: 'Learning Path' },
                ]}
            >
                <div className="relative max-w-2xl">
                    <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/60" />
                    <input
                        type="search"
                        placeholder="Cari path, posisi, atau topik..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="block w-full rounded-full border border-white/15 bg-white/10 px-12 py-3.5 text-[14px] text-white placeholder:text-white/60 backdrop-blur focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch('')}
                            aria-label="Hapus pencarian"
                            className="absolute top-1/2 right-3 grid size-7 -translate-y-1/2 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>
            </PageHeader>

            <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
                <div className="flex flex-wrap items-center gap-3">
                    <Select
                        value={filters.level ?? 'all'}
                        onValueChange={(v) =>
                            handleFilter({ level: v === 'all' ? undefined : v })
                        }
                    >
                        <SelectTrigger className="h-10 w-[180px] rounded-full bg-white">
                            <SelectValue placeholder="Level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Level</SelectItem>
                            <SelectItem value="beginner">Pemula</SelectItem>
                            <SelectItem value="intermediate">Menengah</SelectItem>
                            <SelectItem value="advanced">Lanjutan</SelectItem>
                        </SelectContent>
                    </Select>

                    <p className="ml-auto text-[12.5px] text-slate-500">
                        <strong className="text-slate-900">{paths.total}</strong> path
                    </p>
                </div>

                {paths.data.length === 0 ? (
                    <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                        <Compass className="mx-auto mb-3 size-8 text-slate-400" />
                        <p className="text-sm font-semibold text-slate-900">
                            Belum ada path tersedia
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Coba ubah filter atau cek lagi nanti.
                        </p>
                    </div>
                ) : (
                    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {paths.data.map((path) => (
                            <PathCard key={path.id} path={path} />
                        ))}
                    </div>
                )}

                <div className="mt-8">
                    <DataTablePagination paginator={paths} />
                </div>
            </div>
        </>
    );
}

function PathCard({ path }: { path: Path }) {
    return (
        <Link
            href={`/paths/${path.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(18,35,125,0.35)] hover:ring-brand-300"
        >
            {/* Cover */}
            <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900">
                {/* Decorative dot pattern */}
                <div
                    aria-hidden
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle, rgba(255,255,255,0.25) 1px, transparent 1px)',
                        backgroundSize: '18px 18px',
                        maskImage:
                            'radial-gradient(ellipse at center, black 30%, transparent 75%)',
                    }}
                />
                {/* Glow */}
                <div
                    aria-hidden
                    className="absolute -top-12 -right-6 size-44 rounded-full bg-brand-300/30 blur-3xl"
                />
                <div
                    aria-hidden
                    className="absolute -bottom-10 -left-6 size-36 rounded-full bg-brand-500/30 blur-3xl"
                />

                {path.thumbnail ? (
                    <img
                        src={path.thumbnail}
                        alt={path.title}
                        className="relative size-full object-cover transition duration-700 group-hover:scale-[1.05]"
                    />
                ) : (
                    <div className="relative grid size-full place-items-center">
                        <span className="grid size-20 place-items-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur">
                            <Compass className="size-9" />
                        </span>
                    </div>
                )}

                {/* Top badges */}
                <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
                    {path.position ? (
                        <Badge className="border-transparent bg-white/95 text-brand-700 backdrop-blur">
                            <Sparkles className="mr-1 size-3" />
                            {path.position.name}
                        </Badge>
                    ) : (
                        <span />
                    )}
                    {path.duration_weeks && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/30 px-2.5 py-1 text-[10.5px] font-bold text-white ring-1 ring-white/15 backdrop-blur">
                            <Calendar className="size-3" />
                            {path.duration_weeks}w
                        </span>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                        className={
                            'border-transparent text-[10.5px] font-bold hover:opacity-90 ' +
                            levelBadgeClass(path.level)
                        }
                    >
                        {levelLabel(path.level)}
                    </Badge>
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10.5px] font-bold text-brand-700">
                        <BookOpen className="size-3" />
                        {path.courses_count} course
                    </span>
                </div>

                <div>
                    <h3 className="line-clamp-2 text-[16px] leading-snug font-bold text-slate-900 transition group-hover:text-brand-700">
                        {path.title}
                    </h3>
                    {path.subtitle && (
                        <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-slate-600">
                            {path.subtitle}
                        </p>
                    )}
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="inline-flex items-center gap-1.5 text-[11.5px] text-slate-500">
                        <Users className="size-3.5" />
                        <strong className="text-slate-700">
                            {path.enrollments_count.toLocaleString('id-ID')}
                        </strong>{' '}
                        peserta
                    </span>
                    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-700 opacity-0 transition group-hover:opacity-100">
                        Lihat path
                        <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
                    </span>
                </div>
            </div>
        </Link>
    );
}
