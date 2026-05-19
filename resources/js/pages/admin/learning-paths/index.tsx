import { Head, Link, router } from '@inertiajs/react';
import {
    Briefcase,
    Clock,
    Compass,
    Eye,
    GraduationCap,
    Layers,
    Plus,
    Search,
    Users,
} from 'lucide-react';
import { useState } from 'react';

import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import type { Paginator } from '@/components/data-table/data-table-pagination';
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
import { storageUrl } from '@/lib/storage-url';

type Path = {
    id: number;
    title: string;
    slug: string;
    thumbnail: string | null;
    level: string | null;
    duration_weeks: number | null;
    is_published: boolean;
    total_students: number;
    courses_count: number;
    enrollments_count: number;
    position: { id: number; name: string } | null;
};

type Props = {
    paths: Paginator<Path>;
    filters: { search?: string; status?: string };
};

const LEVEL_LABEL: Record<string, string> = {
    beginner: 'Pemula',
    intermediate: 'Menengah',
    advanced: 'Lanjutan',
};

export default function LearningPathsIndex({ paths, filters }: Props) {
    const [searchInput, setSearchInput] = useState(filters.search ?? '');

    const handleFilter = (next: Record<string, string | undefined>) => {
        router.get(
            '/admin/learning-paths',
            { ...filters, ...next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        handleFilter({ search: searchInput.trim() || undefined });
    };

    return (
        <>
            <Head title="Learning Path" />
            <div className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                            <Link href="/admin/dashboard" className="hover:text-slate-700">
                                Dashboard
                            </Link>
                            <IconChevR size={12} className="text-slate-300" />
                            <span className="font-semibold text-slate-900">Learning Path</span>
                        </nav>
                        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                            Learning Path
                        </h1>
                        <p className="mt-1 text-[13.5px] text-slate-500">
                            Roadmap karir berupa kurikulum berurutan untuk jabatan tertentu.
                        </p>
                    </div>
                    <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                        <Link href="/admin/learning-paths/create">
                            <Plus className="mr-1.5 size-4" />
                            Buat Path
                        </Link>
                    </Button>
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-[15px] font-bold text-slate-900">Daftar Path</h2>
                            <p className="mt-0.5 text-[12.5px] text-slate-500">
                                {paths.total} learning path terdaftar.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <form
                                onSubmit={handleSearchSubmit}
                                className="relative w-full sm:w-[280px]"
                            >
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Cari judul path..."
                                    className="h-9 rounded-xl pl-9"
                                />
                            </form>
                            <Select
                                value={filters.status ?? 'all'}
                                onValueChange={(value) =>
                                    handleFilter({
                                        status: value === 'all' ? undefined : value,
                                    })
                                }
                            >
                                <SelectTrigger className="h-9 w-full rounded-xl sm:w-[160px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {paths.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                            <div className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                                <Compass className="size-5" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-slate-900">
                                    Belum ada learning path
                                </p>
                                <p className="text-sm text-slate-500">
                                    Buat path pertama untuk membuat roadmap karir karyawan.
                                </p>
                            </div>
                            <Button
                                asChild
                                className="mt-2 rounded-xl bg-brand-600 hover:bg-brand-700"
                            >
                                <Link href="/admin/learning-paths/create">
                                    <Plus className="mr-1.5 size-4" />
                                    Buat Path
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {paths.data.map((path) => (
                                <PathCard key={path.id} path={path} />
                            ))}
                        </div>
                    )}

                    <div className="mt-5">
                        <DataTablePagination paginator={paths} />
                    </div>
                </div>
            </div>
        </>
    );
}

function PathCard({ path }: { path: Path }) {
    const thumb = storageUrl(path.thumbnail);

    return (
        <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 transition hover:shadow-[0_12px_28px_-12px_rgba(15,23,42,0.18)] hover:ring-brand-200">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200">
                {thumb ? (
                    <img
                        src={thumb}
                        alt={path.title}
                        loading="lazy"
                        className="size-full object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center bg-gradient-to-br from-brand-500 to-brand-700">
                        <Compass className="size-10 text-white/50" />
                    </div>
                )}

                <div className="absolute top-3 right-3">
                    {path.is_published ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-500/95 px-2.5 py-0.5 text-[10.5px] font-semibold tracking-wide text-white shadow ring-1 ring-emerald-300/50 backdrop-blur">
                            Published
                        </span>
                    ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-700/85 px-2.5 py-0.5 text-[10.5px] font-semibold tracking-wide text-white shadow backdrop-blur">
                            Draft
                        </span>
                    )}
                </div>

                {path.level && (
                    <span className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-black/60 px-2.5 py-0.5 text-[10.5px] font-semibold text-white backdrop-blur">
                        {LEVEL_LABEL[path.level] ?? path.level}
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-brand-700 uppercase">
                        <Briefcase className="size-3" />
                        <span className="truncate">
                            {path.position?.name ?? 'Tidak terikat jabatan'}
                        </span>
                    </div>
                    <h3 className="mt-1 line-clamp-2 text-[14.5px] font-bold leading-snug text-slate-900">
                        {path.title}
                    </h3>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-3 text-[11.5px] text-slate-600">
                    <span className="inline-flex items-center gap-1">
                        <Layers className="size-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-900 tabular-nums">
                            {path.courses_count}
                        </span>{' '}
                        course
                    </span>
                    {path.duration_weeks ? (
                        <span className="inline-flex items-center gap-1">
                            <Clock className="size-3.5 text-slate-400" />
                            <span className="font-semibold text-slate-900 tabular-nums">
                                {path.duration_weeks}
                            </span>{' '}
                            mgg
                        </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1">
                        <Users className="size-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-900 tabular-nums">
                            {path.enrollments_count}
                        </span>{' '}
                        peserta
                    </span>
                </div>

                <div className="mt-auto flex items-center gap-1.5 border-t border-slate-100 pt-3">
                    <Button
                        asChild
                        size="sm"
                        className="h-8 flex-1 rounded-xl bg-brand-600 text-white shadow-sm hover:bg-brand-700"
                    >
                        <Link href={`/admin/learning-paths/${path.id}`}>
                            <Eye className="mr-1 size-3.5" />
                            Lihat Detail
                        </Link>
                    </Button>
                    <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-xl px-3"
                    >
                        <Link
                            href={`/admin/learning-paths/${path.id}/edit`}
                            title="Edit path"
                        >
                            <GraduationCap className="size-3.5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </article>
    );
}
