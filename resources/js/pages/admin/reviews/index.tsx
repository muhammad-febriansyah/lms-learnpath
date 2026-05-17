import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, EyeOff, MessageSquare, Star, Trash2, X } from 'lucide-react';
import { useState } from 'react';

import { DataTable } from '@/components/data-table/data-table';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import type { Paginator } from '@/components/data-table/data-table-pagination';
import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';

type Review = {
    id: number;
    rating: number;
    content: string | null;
    is_public: boolean;
    created_at: string;
    user: { id: number; name: string; email: string } | null;
    course: { id: number; title: string; slug: string } | null;
};

type Props = {
    reviews: Paginator<Review>;
    filters: { search?: string; rating?: string; visibility?: string };
    stats: {
        total: number;
        public: number;
        hidden: number;
        avg_rating: number;
    };
};

export default function ReviewsIndex({ reviews, filters, stats }: Props) {
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleFilter = (next: Record<string, string | undefined>) => {
        router.get(
            '/admin/reviews',
            { ...filters, ...next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const toggleVisibility = (id: number) => {
        router.post(
            `/admin/reviews/${id}/toggle`,
            {},
            { preserveScroll: true },
        );
    };

    const performDelete = () => {
        if (!deleteId) {
            return;
        }

        setDeleting(true);
        router.delete(`/admin/reviews/${deleteId}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeleteId(null);
            },
        });
    };

    const columns: ColumnDef<Review>[] = [
        {
            id: 'rating',
            header: 'Rating',
            cell: ({ row }) => (
                <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                            key={n}
                            className={cn(
                                'size-3.5',
                                n <= row.original.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-200',
                            )}
                        />
                    ))}
                    <span className="ml-1.5 text-[12px] font-semibold text-slate-700 tabular-nums">
                        {row.original.rating}
                    </span>
                </div>
            ),
            meta: { label: 'Rating' },
        },
        {
            id: 'user',
            header: 'Peserta',
            cell: ({ row }) => (
                <div>
                    <div className="font-semibold text-slate-900">
                        {row.original.user?.name ?? '-'}
                    </div>
                    <div className="text-[11.5px] text-slate-500">
                        {row.original.user?.email ?? '-'}
                    </div>
                </div>
            ),
            meta: { label: 'Peserta' },
        },
        {
            id: 'course',
            header: 'Course',
            cell: ({ row }) => (
                <div className="max-w-[240px] truncate text-[13px] text-slate-700">
                    {row.original.course?.title ?? '-'}
                </div>
            ),
            meta: { label: 'Course' },
        },
        {
            id: 'content',
            header: 'Komentar',
            cell: ({ row }) =>
                row.original.content ? (
                    <p className="line-clamp-2 max-w-[300px] text-[12.5px] text-slate-600">
                        {row.original.content}
                    </p>
                ) : (
                    <span className="text-[12.5px] text-slate-400 italic">
                        Tanpa komentar
                    </span>
                ),
            meta: { label: 'Komentar' },
        },
        {
            id: 'is_public',
            header: 'Status',
            cell: ({ row }) =>
                row.original.is_public ? (
                    <Badge className="border-transparent bg-emerald-50 text-emerald-700">
                        <Eye className="mr-1 size-3" />
                        Public
                    </Badge>
                ) : (
                    <Badge className="border-transparent bg-slate-100 text-slate-600">
                        <EyeOff className="mr-1 size-3" />
                        Hidden
                    </Badge>
                ),
            meta: { label: 'Status' },
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-1.5">
                    <Button
                        size="sm"
                        className={
                            row.original.is_public
                                ? 'h-8 rounded-xl bg-amber-500 text-white shadow-sm hover:bg-amber-600'
                                : 'h-8 rounded-xl bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                        }
                        onClick={() => toggleVisibility(row.original.id)}
                        title={
                            row.original.is_public ? 'Sembunyikan' : 'Tampilkan'
                        }
                    >
                        {row.original.is_public ? (
                            <><EyeOff className="mr-1 size-3.5" />Sembunyikan</>
                        ) : (
                            <><Eye className="mr-1 size-3.5" />Tampilkan</>
                        )}
                    </Button>
                    <Button
                        size="sm"
                        className="h-8 rounded-xl bg-rose-600 text-white shadow-sm hover:bg-rose-700"
                        onClick={() => setDeleteId(row.original.id)}
                    >
                        <Trash2 className="mr-1 size-3.5" />
                        Hapus
                    </Button>
                </div>
            ),
            meta: { label: 'Aksi', className: 'w-[200px] text-right' },
            enableSorting: false,
        },
    ];

    return (
        <>
            <Head title="Review" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link
                            href="/admin/dashboard"
                            className="hover:text-slate-700"
                        >
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            Review
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Moderasi Review
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Atur visibilitas review peserta yang tampil di halaman
                        publik.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard
                        label="Total Review"
                        value={stats.total.toLocaleString('id-ID')}
                        icon={MessageSquare}
                        tint="bg-brand-50"
                        text="text-brand-600"
                    />
                    <StatCard
                        label="Public"
                        value={stats.public.toLocaleString('id-ID')}
                        icon={Eye}
                        tint="bg-emerald-50"
                        text="text-emerald-600"
                    />
                    <StatCard
                        label="Hidden"
                        value={stats.hidden.toLocaleString('id-ID')}
                        icon={EyeOff}
                        tint="bg-slate-100"
                        text="text-slate-600"
                    />
                    <StatCard
                        label="Avg Rating"
                        value={`${stats.avg_rating.toFixed(1)} ★`}
                        icon={Star}
                        tint="bg-amber-50"
                        text="text-amber-600"
                    />
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4">
                        <h2 className="text-[15px] font-bold text-slate-900">
                            Daftar Review
                        </h2>
                        <p className="mt-0.5 text-[12.5px] text-slate-500">
                            {reviews.total} review
                        </p>
                    </div>

                    <DataTable
                        columns={columns}
                        data={reviews.data}
                        searchValue={filters.search ?? ''}
                        searchPlaceholder="Cari peserta, course, atau isi review..."
                        onSearchChange={(v) =>
                            handleFilter({ search: v || undefined })
                        }
                        toolbarSlot={
                            <>
                                <Select
                                    value={filters.rating ?? 'all'}
                                    onValueChange={(v) =>
                                        handleFilter({
                                            rating: v === 'all' ? undefined : v,
                                        })
                                    }
                                >
                                    <SelectTrigger className="h-9 w-[120px]">
                                        <SelectValue placeholder="Rating" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua
                                        </SelectItem>
                                        <SelectItem value="5">5 ★</SelectItem>
                                        <SelectItem value="4">4 ★</SelectItem>
                                        <SelectItem value="3">3 ★</SelectItem>
                                        <SelectItem value="2">2 ★</SelectItem>
                                        <SelectItem value="1">1 ★</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filters.visibility ?? 'all'}
                                    onValueChange={(v) =>
                                        handleFilter({
                                            visibility:
                                                v === 'all' ? undefined : v,
                                        })
                                    }
                                >
                                    <SelectTrigger className="h-9 w-[140px]">
                                        <SelectValue placeholder="Visibilitas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua
                                        </SelectItem>
                                        <SelectItem value="public">
                                            Public
                                        </SelectItem>
                                        <SelectItem value="hidden">
                                            Hidden
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </>
                        }
                        emptyState={
                            <div className="py-12 text-center">
                                <MessageSquare className="mx-auto mb-3 size-6 text-slate-400" />
                                <p className="text-sm font-semibold text-slate-900">
                                    Belum ada review
                                </p>
                            </div>
                        }
                    />

                    <div className="mt-4">
                        <DataTablePagination paginator={reviews} />
                    </div>
                </div>
            </div>

            <Dialog
                open={deleteId !== null}
                onOpenChange={(o) => !o && setDeleteId(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus review?</DialogTitle>
                        <DialogDescription>
                            Review akan dihapus permanen dan rating course akan
                            diperbarui.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteId(null)}
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

function StatCard({
    label,
    value,
    icon: Icon,
    tint,
    text,
}: {
    label: string;
    value: string;
    icon: typeof MessageSquare;
    tint: string;
    text: string;
}) {
    return (
        <div className="rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="flex items-center gap-3">
                <div
                    className={`grid size-10 place-items-center rounded-xl ${tint} ${text}`}
                >
                    <Icon className="size-5" />
                </div>
                <div>
                    <div className="text-[11px] tracking-wider text-slate-500 uppercase">
                        {label}
                    </div>
                    <div className="text-[18px] font-extrabold text-slate-900 tabular-nums">
                        {value}
                    </div>
                </div>
            </div>
        </div>
    );
}
