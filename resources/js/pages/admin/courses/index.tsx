import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { BookOpen, Eye, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import {
    DataTablePagination,
} from '@/components/data-table/data-table-pagination';
import type { Paginator } from '@/components/data-table/data-table-pagination';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Course = {
    id: number;
    title: string;
    subtitle: string | null;
    slug: string;
    price: number;
    level: string | null;
    review_status: 'draft' | 'pending_review' | 'published' | 'rejected';
    sections_count: number;
    lessons_count: number;
    enrollments_count: number;
    category: { id: number; name: string } | null;
    instructor: { id: number; name: string } | null;
};

type CategoryOption = { id: number; name: string };
type ReviewStatusOption = { value: string; label: string };

type Permissions = {
    canCreate: boolean;
    canReview: boolean;
    isInstructor: boolean;
};

type Props = {
    courses: Paginator<Course>;
    filters: {
        search?: string;
        category_id?: string;
        review_status?: string;
    };
    categoryOptions: CategoryOption[];
    reviewStatusOptions: ReviewStatusOption[];
    permissions: Permissions;
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

export default function CoursesIndex({
    courses,
    filters,
    categoryOptions,
    reviewStatusOptions,
    permissions,
}: Props) {
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteName, setDeleteName] = useState<string>('');
    const [deleting, setDeleting] = useState(false);

    const handleFilter = (next: Record<string, string | undefined>) => {
        router.get(
            '/admin/courses',
            { ...filters, ...next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const performDelete = () => {
        if (!deleteId) {
            return;
        }

        setDeleting(true);
        router.delete(`/admin/courses/${deleteId}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeleteId(null);
            },
        });
    };

    const columns: ColumnDef<Course>[] = [
        {
            id: 'title',
            accessorKey: 'title',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Course" />
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                        <BookOpen className="size-4" />
                    </div>
                    <div className="min-w-0">
                        <div className="max-w-[280px] truncate font-semibold text-slate-900">
                            {row.original.title}
                        </div>
                        <div className="flex items-center gap-2 text-[11.5px] text-slate-500">
                            <span>{row.original.category?.name ?? 'Tanpa kategori'}</span>
                            <span className="size-1 rounded-full bg-slate-300" />
                            <span>{row.original.instructor?.name ?? 'Tanpa mentor'}</span>
                        </div>
                    </div>
                </div>
            ),
            meta: { label: 'Course' },
        },
        {
            id: 'price',
            accessorKey: 'price',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Harga" />
            ),
            cell: ({ row }) => (
                <span
                    className={
                        row.original.price === 0
                            ? 'font-semibold text-emerald-600'
                            : 'font-semibold text-slate-900 tabular-nums'
                    }
                >
                    {formatRupiah(row.original.price)}
                </span>
            ),
            meta: { label: 'Harga' },
        },
        {
            id: 'lessons_count',
            accessorKey: 'lessons_count',
            header: 'Materi',
            cell: ({ row }) => (
                <div className="text-[12.5px] text-slate-600">
                    <span className="font-semibold text-slate-900 tabular-nums">
                        {row.original.lessons_count}
                    </span>{' '}
                    lesson
                    <span className="mx-1.5 text-slate-300">·</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                        {row.original.sections_count}
                    </span>{' '}
                    section
                </div>
            ),
            meta: { label: 'Materi' },
        },
        {
            id: 'enrollments_count',
            accessorKey: 'enrollments_count',
            header: 'Peserta',
            cell: ({ row }) => (
                <div className="inline-flex items-center gap-1.5 text-[12.5px] text-slate-700">
                    <Users className="size-3.5 text-slate-400" />
                    <span className="font-semibold tabular-nums">
                        {row.original.enrollments_count}
                    </span>
                </div>
            ),
            meta: { label: 'Peserta' },
        },
        {
            id: 'review_status',
            accessorKey: 'review_status',
            header: 'Status',
            cell: ({ row }) => <StatusBadge status={row.original.review_status} />,
            meta: { label: 'Status' },
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                const isOwn = permissions.isInstructor;
                const canEditRow =
                    isOwn &&
                    (row.original.review_status === 'draft' ||
                        row.original.review_status === 'rejected');
                const canDeleteRow = isOwn && row.original.review_status === 'draft';

                return (
                    <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" className="size-8">
                            <Link href={`/admin/courses/${row.original.id}`}>
                                <Eye className="size-4" />
                                <span className="sr-only">Lihat</span>
                            </Link>
                        </Button>
                        {canEditRow && (
                            <Button asChild variant="ghost" size="icon" className="size-8">
                                <Link href={`/admin/courses/${row.original.id}/edit`}>
                                    <Pencil className="size-4" />
                                    <span className="sr-only">Edit</span>
                                </Link>
                            </Button>
                        )}
                        {canDeleteRow && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                                onClick={() => {
                                    setDeleteId(row.original.id);
                                    setDeleteName(row.original.title);
                                }}
                            >
                                <Trash2 className="size-4" />
                                <span className="sr-only">Hapus</span>
                            </Button>
                        )}
                    </div>
                );
            },
            meta: { label: 'Aksi', className: 'w-[140px] text-right' },
            enableSorting: false,
            enableHiding: false,
        },
    ];

    const headerHint = permissions.isInstructor
        ? 'Course yang Anda buat sebagai mentor.'
        : permissions.canReview
            ? 'Tinjau dan setujui pengajuan course dari mentor.'
            : 'Daftar seluruh course di platform (read-only).';

    return (
        <>
            <Head title="Course" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Course</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Master Course
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">{headerHint}</p>
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-[15px] font-bold text-slate-900">
                                Daftar Course
                            </h2>
                            <p className="mt-0.5 text-[12.5px] text-slate-500">
                                Total {courses.total} course terdaftar
                            </p>
                        </div>
                        {permissions.canCreate && (
                            <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                                <Link href="/admin/courses/create">
                                    <Plus className="mr-1.5 size-4" />
                                    Tambah Course
                                </Link>
                            </Button>
                        )}
                    </div>

                    <DataTable
                        columns={columns}
                        data={courses.data}
                        searchValue={filters.search ?? ''}
                        searchPlaceholder="Cari judul atau slug course..."
                        onSearchChange={(value) =>
                            handleFilter({ search: value || undefined })
                        }
                        toolbarSlot={
                            <>
                                <Select
                                    value={filters.category_id ?? 'all'}
                                    onValueChange={(value) =>
                                        handleFilter({
                                            category_id: value === 'all' ? undefined : value,
                                        })
                                    }
                                >
                                    <SelectTrigger className="h-9 w-[180px]">
                                        <SelectValue placeholder="Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kategori</SelectItem>
                                        {categoryOptions.map((cat) => (
                                            <SelectItem key={cat.id} value={String(cat.id)}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filters.review_status ?? 'all'}
                                    onValueChange={(value) =>
                                        handleFilter({
                                            review_status:
                                                value === 'all' ? undefined : value,
                                        })
                                    }
                                >
                                    <SelectTrigger className="h-9 w-[160px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        {reviewStatusOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </>
                        }
                        emptyState={
                            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                                <div className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                                    <BookOpen className="size-5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-slate-900">
                                        Belum ada course
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {permissions.canCreate
                                            ? 'Mulai dengan menambahkan course pertama Anda.'
                                            : 'Belum ada course yang terdaftar di platform.'}
                                    </p>
                                </div>
                                {permissions.canCreate && (
                                    <Button
                                        asChild
                                        className="mt-2 rounded-xl bg-brand-600 hover:bg-brand-700"
                                    >
                                        <Link href="/admin/courses/create">
                                            <Plus className="mr-1.5 size-4" />
                                            Tambah Course
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        }
                    />

                    <div className="mt-4">
                        <DataTablePagination paginator={courses} />
                    </div>
                </div>
            </div>

            <Dialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus course?</DialogTitle>
                        <DialogDescription>
                            Course <span className="font-semibold">"{deleteName}"</span> beserta
                            section, lesson, enrollment, dan data terkait akan dihapus permanen.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={performDelete}
                            disabled={deleting}
                        >
                            {deleting ? 'Menghapus...' : 'Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
