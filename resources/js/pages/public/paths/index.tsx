import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, BookOpen, Calendar, Compass, Search, Sparkles, Users } from 'lucide-react';

import {
    DataTablePagination,
    type Paginator,
} from '@/components/data-table/data-table-pagination';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
    const handleFilter = (next: Record<string, string | undefined>) => {
        router.get(
            '/paths',
            { ...filters, ...next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Learning Path — Roadmap Karir" />
            <div className="space-y-6">
                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-indigo-700 to-brand-700 p-6 text-white sm:p-10">
                    <div
                        className="absolute -top-20 -right-16 size-72 rounded-full bg-white/10 blur-3xl"
                        aria-hidden="true"
                    />
                    <div
                        className="absolute -right-32 -bottom-24 size-80 rounded-full bg-violet-300/30 blur-3xl"
                        aria-hidden="true"
                    />
                    <div className="relative">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold tracking-[0.16em] ring-1 ring-white/20 uppercase backdrop-blur">
                            <Compass className="size-3" />
                            Learning Path
                        </div>
                        <h1 className="mt-3 text-[28px] leading-tight font-extrabold tracking-tight sm:text-[36px]">
                            Roadmap karir, bukan cuma katalog
                        </h1>
                        <p className="mt-2 max-w-2xl text-[14.5px] text-white/85 sm:text-[15px]">
                            Kurikulum berurutan yang menuntun Anda dari nol sampai siap kerja di
                            jabatan target. Setiap path dirancang oleh praktisi industri.
                        </p>

                        <div className="mt-6 max-w-2xl">
                            <div className="flex items-center gap-2 rounded-2xl bg-white p-2 ring-1 ring-white/30">
                                <Search className="ml-2 size-5 text-slate-400" />
                                <Input
                                    type="search"
                                    placeholder="Cari path, posisi, atau topik..."
                                    defaultValue={filters.search ?? ''}
                                    onChange={(e) =>
                                        handleFilter({ search: e.target.value || undefined })
                                    }
                                    className="flex-1 border-0 bg-transparent text-slate-900 shadow-none focus-visible:ring-0"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex flex-wrap items-center gap-3">
                    <Select
                        value={filters.level ?? 'all'}
                        onValueChange={(v) =>
                            handleFilter({ level: v === 'all' ? undefined : v })
                        }
                    >
                        <SelectTrigger className="h-9 w-[160px]">
                            <SelectValue placeholder="Level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Level</SelectItem>
                            <SelectItem value="beginner">Pemula</SelectItem>
                            <SelectItem value="intermediate">Menengah</SelectItem>
                            <SelectItem value="advanced">Lanjutan</SelectItem>
                        </SelectContent>
                    </Select>

                    <p className="ml-auto text-[12.5px] text-slate-500">{paths.total} path</p>
                </div>

                {paths.data.length === 0 ? (
                    <div className="rounded-2xl bg-card p-12 text-center ring-1 ring-slate-200/70">
                        <Compass className="mx-auto mb-3 size-8 text-slate-400" />
                        <p className="text-sm font-semibold text-slate-900">
                            Belum ada path tersedia
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Coba ubah filter atau cek lagi nanti.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {paths.data.map((path) => (
                            <PathCard key={path.id} path={path} />
                        ))}
                    </div>
                )}

                <DataTablePagination paginator={paths} />
            </div>
        </>
    );
}

function PathCard({ path }: { path: Path }) {
    return (
        <Link
            href={`/paths/${path.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 transition-all duration-200 hover:-translate-y-0.5 hover:ring-slate-300"
        >
            <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-violet-500 via-indigo-600 to-brand-700">
                {path.thumbnail ? (
                    <img
                        src={path.thumbnail}
                        alt={path.title}
                        className="size-full object-cover"
                    />
                ) : (
                    <div className="grid size-full place-items-center text-white/40">
                        <Compass className="size-14" />
                    </div>
                )}
                {path.position && (
                    <Badge className="absolute top-3 left-3 border-transparent bg-white/90 text-indigo-700 backdrop-blur">
                        <Sparkles className="mr-1 size-3" />
                        {path.position.name}
                    </Badge>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex flex-wrap gap-1.5">
                    <Badge
                        className={
                            'border-transparent text-[10.5px] font-bold hover:opacity-90 ' +
                            levelBadgeClass(path.level)
                        }
                    >
                        {levelLabel(path.level)}
                    </Badge>
                    {path.duration_weeks && (
                        <Badge className="border-transparent bg-slate-100 text-slate-700 text-[10.5px] font-bold hover:bg-slate-100">
                            <Calendar className="mr-1 size-3" />
                            {path.duration_weeks} minggu
                        </Badge>
                    )}
                </div>

                <div>
                    <h3 className="line-clamp-2 text-[16px] leading-snug font-bold text-slate-900 transition group-hover:text-indigo-700">
                        {path.title}
                    </h3>
                    {path.subtitle && (
                        <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-slate-600">
                            {path.subtitle}
                        </p>
                    )}
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-3 text-[11.5px] text-slate-500">
                        <span className="inline-flex items-center gap-1">
                            <BookOpen className="size-3.5" />
                            {path.courses_count} course
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Users className="size-3.5" />
                            {path.enrollments_count.toLocaleString('id-ID')}
                        </span>
                    </div>
                    <ArrowRight className="size-4 text-indigo-500 opacity-0 transition group-hover:opacity-100" />
                </div>
            </div>
        </Link>
    );
}
