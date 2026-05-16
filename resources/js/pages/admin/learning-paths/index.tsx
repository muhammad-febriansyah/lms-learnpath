import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Compass, Plus } from 'lucide-react';

import { DataTable } from '@/components/data-table/data-table';
import {
    DataTablePagination,
    type Paginator,
} from '@/components/data-table/data-table-pagination';
import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    const handleFilter = (next: Record<string, string | undefined>) => {
        router.get(
            '/admin/learning-paths',
            { ...filters, ...next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const columns: ColumnDef<Path>[] = [
        {
            id: 'title',
            accessorKey: 'title',
            header: 'Path',
            cell: ({ row }) => (
                <Link
                    href={`/admin/learning-paths/${row.original.id}`}
                    className="flex items-center gap-3 hover:text-brand-700"
                >
                    <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                        <Compass className="size-4" />
                    </div>
                    <div className="min-w-0">
                        <div className="font-semibold text-slate-900">
                            {row.original.title}
                        </div>
                        <div className="max-w-[260px] truncate text-[11.5px] text-slate-500">
                            {row.original.position?.name ?? 'Tidak terikat jabatan'}
                        </div>
                    </div>
                </Link>
            ),
            meta: { label: 'Path' },
        },
        {
            id: 'level',
            accessorKey: 'level',
            header: 'Level',
            cell: ({ row }) => (
                <span className="text-[12.5px] text-slate-600">
                    {LEVEL_LABEL[row.original.level ?? ''] ?? '-'}
                </span>
            ),
            meta: { label: 'Level' },
        },
        {
            id: 'duration_weeks',
            accessorKey: 'duration_weeks',
            header: 'Durasi',
            cell: ({ row }) => (
                <span className="text-[12.5px] text-slate-700 tabular-nums">
                    {row.original.duration_weeks
                        ? `${row.original.duration_weeks} mgg`
                        : '-'}
                </span>
            ),
            meta: { label: 'Durasi (mgg)' },
        },
        {
            id: 'courses_count',
            accessorKey: 'courses_count',
            header: 'Course',
            cell: ({ row }) => (
                <span className="font-semibold text-slate-700 tabular-nums">
                    {row.original.courses_count}
                </span>
            ),
            meta: { label: 'Jumlah Course' },
        },
        {
            id: 'enrollments_count',
            accessorKey: 'enrollments_count',
            header: 'Peserta',
            cell: ({ row }) => (
                <span className="text-slate-600 tabular-nums">
                    {row.original.enrollments_count}
                </span>
            ),
            meta: { label: 'Peserta' },
        },
        {
            id: 'status',
            accessorKey: 'is_published',
            header: 'Status',
            cell: ({ row }) => (
                <Badge
                    className={
                        row.original.is_published
                            ? 'border-transparent bg-emerald-50 text-emerald-700'
                            : 'border-transparent bg-slate-100 text-slate-700'
                    }
                >
                    {row.original.is_published ? 'Published' : 'Draft'}
                </Badge>
            ),
            meta: { label: 'Status' },
        },
    ];

    return (
        <>
            <Head title="Learning Path" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Learning Path</span>
                    </nav>
                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                            Learning Path
                        </h1>
                        <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                            <Link href="/admin/learning-paths/create">
                                <Plus className="mr-1.5 size-4" />
                                Buat Path
                            </Link>
                        </Button>
                    </div>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Roadmap karir berupa kurikulum berurutan untuk jabatan tertentu.
                    </p>
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4">
                        <h2 className="text-[15px] font-bold text-slate-900">Daftar Path</h2>
                        <p className="mt-0.5 text-[12.5px] text-slate-500">
                            {paths.total} learning path terdaftar.
                        </p>
                    </div>

                    <DataTable
                        columns={columns}
                        data={paths.data}
                        searchValue={filters.search ?? ''}
                        searchPlaceholder="Cari judul path..."
                        onSearchChange={(value) =>
                            handleFilter({ search: value || undefined })
                        }
                        toolbarSlot={
                            <Select
                                value={filters.status ?? 'all'}
                                onValueChange={(value) =>
                                    handleFilter({
                                        status: value === 'all' ? undefined : value,
                                    })
                                }
                            >
                                <SelectTrigger className="h-9 w-[160px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                </SelectContent>
                            </Select>
                        }
                        emptyState={
                            <div className="py-12 text-center">
                                <p className="text-sm font-semibold text-slate-900">
                                    Belum ada learning path
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Buat path pertama untuk membuat roadmap karir karyawan.
                                </p>
                            </div>
                        }
                    />

                    <div className="mt-4">
                        <DataTablePagination paginator={paths} />
                    </div>
                </div>
            </div>
        </>
    );
}
