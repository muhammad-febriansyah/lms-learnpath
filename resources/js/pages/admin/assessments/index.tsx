import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { ClipboardCheck, Plus } from 'lucide-react';

import { DataTable } from '@/components/data-table/data-table';
import {
    DataTablePagination

} from '@/components/data-table/data-table-pagination';
import type {Paginator} from '@/components/data-table/data-table-pagination';
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

type Assessment = {
    id: number;
    title: string;
    type: string;
    passing_score: number;
    max_attempts: number;
    duration_minutes: number | null;
    questions_count: number;
    attempts_count: number;
    course: { id: number; title: string; slug: string } | null;
};

type Props = {
    assessments: Paginator<Assessment>;
    filters: {
        search?: string;
        type?: string;
    };
};

const TYPE_LABELS: Record<string, string> = {
    pre_test: 'Pre Test',
    post_test: 'Post Test',
    quiz: 'Quiz',
};

const TYPE_COLORS: Record<string, string> = {
    pre_test: 'border-transparent bg-amber-50 text-amber-700',
    post_test: 'border-transparent bg-emerald-50 text-emerald-700',
    quiz: 'border-transparent bg-violet-50 text-violet-700',
};

export default function AssessmentsIndex({ assessments, filters }: Props) {
    const handleFilter = (next: Record<string, string | undefined>) => {
        router.get(
            '/admin/assessments',
            { ...filters, ...next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const columns: ColumnDef<Assessment>[] = [
        {
            id: 'title',
            accessorKey: 'title',
            header: 'Assessment',
            cell: ({ row }) => (
                <Link
                    href={`/admin/assessments/${row.original.id}`}
                    className="flex items-center gap-3 hover:text-brand-700"
                >
                    <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                        <ClipboardCheck className="size-4" />
                    </div>
                    <div className="min-w-0">
                        <div className="font-semibold text-slate-900">
                            {row.original.title}
                        </div>
                        <div className="max-w-[260px] truncate text-[11.5px] text-slate-500">
                            {row.original.course?.title ?? '-'}
                        </div>
                    </div>
                </Link>
            ),
            meta: { label: 'Assessment' },
        },
        {
            id: 'type',
            accessorKey: 'type',
            header: 'Tipe',
            cell: ({ row }) => (
                <Badge className={TYPE_COLORS[row.original.type] ?? ''}>
                    {TYPE_LABELS[row.original.type] ?? row.original.type}
                </Badge>
            ),
            meta: { label: 'Tipe' },
        },
        {
            id: 'questions_count',
            accessorKey: 'questions_count',
            header: 'Soal',
            cell: ({ row }) => (
                <span className="font-semibold text-slate-700 tabular-nums">
                    {row.original.questions_count}
                </span>
            ),
            meta: { label: 'Jumlah Soal' },
        },
        {
            id: 'passing_score',
            accessorKey: 'passing_score',
            header: 'Nilai Lulus',
            cell: ({ row }) => (
                <span className="font-semibold text-slate-700 tabular-nums">
                    {row.original.passing_score}%
                </span>
            ),
            meta: { label: 'Nilai Lulus' },
        },
        {
            id: 'max_attempts',
            accessorKey: 'max_attempts',
            header: 'Max Attempt',
            cell: ({ row }) => (
                <span className="text-slate-600 tabular-nums">
                    {row.original.max_attempts}×
                </span>
            ),
            meta: { label: 'Max Attempt' },
        },
        {
            id: 'attempts_count',
            accessorKey: 'attempts_count',
            header: 'Total Percobaan',
            cell: ({ row }) => (
                <span className="font-semibold text-slate-900 tabular-nums">
                    {row.original.attempts_count}
                </span>
            ),
            meta: { label: 'Total Percobaan' },
        },
    ];

    return (
        <>
            <Head title="Assessment" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Assessment</span>
                    </nav>
                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                            Assessment
                        </h1>
                        <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                            <Link href="/admin/assessments/create">
                                <Plus className="mr-1.5 size-4" />
                                Buat Assessment
                            </Link>
                        </Button>
                    </div>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Pre test, post test, dan quiz dari seluruh course.
                    </p>
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4">
                        <h2 className="text-[15px] font-bold text-slate-900">
                            Daftar Assessment
                        </h2>
                        <p className="mt-0.5 text-[12.5px] text-slate-500">
                            {assessments.total} assessment terdaftar. Klik baris untuk
                            kelola soal.
                        </p>
                    </div>

                    <DataTable
                        columns={columns}
                        data={assessments.data}
                        searchValue={filters.search ?? ''}
                        searchPlaceholder="Cari judul assessment..."
                        onSearchChange={(value) =>
                            handleFilter({ search: value || undefined })
                        }
                        toolbarSlot={
                            <Select
                                value={filters.type ?? 'all'}
                                onValueChange={(value) =>
                                    handleFilter({
                                        type: value === 'all' ? undefined : value,
                                    })
                                }
                            >
                                <SelectTrigger className="h-9 w-[160px]">
                                    <SelectValue placeholder="Tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Tipe</SelectItem>
                                    <SelectItem value="pre_test">Pre Test</SelectItem>
                                    <SelectItem value="post_test">Post Test</SelectItem>
                                    <SelectItem value="quiz">Quiz</SelectItem>
                                </SelectContent>
                            </Select>
                        }
                        emptyState={
                            <div className="py-12 text-center">
                                <p className="text-sm font-semibold text-slate-900">
                                    Belum ada assessment
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Buat assessment lewat Course Builder setelah course tersedia.
                                </p>
                            </div>
                        }
                    />

                    <div className="mt-4">
                        <DataTablePagination paginator={assessments} />
                    </div>
                </div>
            </div>
        </>
    );
}
