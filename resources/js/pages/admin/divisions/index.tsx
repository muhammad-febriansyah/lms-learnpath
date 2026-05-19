import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Building2, CheckCircle2, Pencil, Plus, Trash2, X, XCircle } from 'lucide-react';
import { useState } from 'react';

import { DataTable } from '@/components/data-table/data-table';
import { DataTablePagination, type Paginator } from '@/components/data-table/data-table-pagination';
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

type Division = {
    id: number;
    name: string;
    code: string | null;
    description: string | null;
    is_active: boolean;
};

type Props = {
    divisions: Paginator<Division>;
    filters: { search?: string; status?: string };
    stats: { total: number; active: number; inactive: number };
};

export default function DivisionsIndex({ divisions, filters, stats }: Props) {
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteName, setDeleteName] = useState('');
    const [deleting, setDeleting] = useState(false);

    const handleFilter = (next: Record<string, string | undefined>) => {
        router.get(
            '/admin/divisions',
            { ...filters, ...next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const performDelete = () => {
        if (!deleteId) return;
        setDeleting(true);
        router.delete(`/admin/divisions/${deleteId}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeleteId(null);
            },
        });
    };

    const columns: ColumnDef<Division>[] = [
        {
            id: 'name',
            header: 'Divisi',
            cell: ({ row }) => (
                <div>
                    <div className="font-semibold text-slate-900">{row.original.name}</div>
                    {row.original.code && (
                        <div className="mt-0.5 inline-flex items-center gap-1 text-[11.5px] text-slate-500">
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10.5px] text-slate-600">
                                {row.original.code}
                            </span>
                        </div>
                    )}
                </div>
            ),
            meta: { label: 'Divisi' },
        },
        {
            id: 'description',
            header: 'Deskripsi',
            cell: ({ row }) => (
                <div className="max-w-[360px] truncate text-[12.5px] text-slate-600">
                    {row.original.description ?? (
                        <span className="text-slate-400 italic">Tanpa deskripsi</span>
                    )}
                </div>
            ),
            meta: { label: 'Deskripsi' },
        },
        {
            id: 'is_active',
            header: 'Status',
            cell: ({ row }) =>
                row.original.is_active ? (
                    <Badge className="border-transparent bg-emerald-50 text-emerald-700">Aktif</Badge>
                ) : (
                    <Badge className="border-transparent bg-slate-100 text-slate-600">Nonaktif</Badge>
                ),
            meta: { label: 'Status' },
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-1.5">
                    <Button
                        asChild
                        size="sm"
                        className="h-8 rounded-xl bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                    >
                        <Link href={`/admin/divisions/${row.original.id}/edit`}>
                            <Pencil className="mr-1 size-3.5" />
                            Edit
                        </Link>
                    </Button>
                    <Button
                        size="sm"
                        className="h-8 rounded-xl bg-rose-600 text-white shadow-sm hover:bg-rose-700"
                        onClick={() => {
                            setDeleteId(row.original.id);
                            setDeleteName(row.original.name);
                        }}
                    >
                        <Trash2 className="mr-1 size-3.5" />
                        Hapus
                    </Button>
                </div>
            ),
            meta: { label: 'Aksi', className: 'w-[100px] text-right' },
            enableSorting: false,
        },
    ];

    return (
        <>
            <Head title="Divisi" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Divisi</span>
                    </nav>
                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                            Divisi
                        </h1>
                        <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                            <Link href="/admin/divisions/create">
                                <Plus className="mr-1.5 size-4" />
                                Tambah Divisi
                            </Link>
                        </Button>
                    </div>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Kelola daftar divisi yang dipakai untuk struktur organisasi & jabatan.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <StatCard
                        label="Total Divisi"
                        value={stats.total}
                        icon={Building2}
                        tint="bg-brand-50"
                        text="text-brand-600"
                    />
                    <StatCard
                        label="Aktif"
                        value={stats.active}
                        icon={CheckCircle2}
                        tint="bg-emerald-50"
                        text="text-emerald-600"
                    />
                    <StatCard
                        label="Nonaktif"
                        value={stats.inactive}
                        icon={XCircle}
                        tint="bg-slate-100"
                        text="text-slate-600"
                    />
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4">
                        <h2 className="text-[15px] font-bold text-slate-900">Daftar Divisi</h2>
                        <p className="mt-0.5 text-[12.5px] text-slate-500">
                            {divisions.total} divisi terdaftar
                        </p>
                    </div>

                    <DataTable
                        columns={columns}
                        data={divisions.data}
                        searchValue={filters.search ?? ''}
                        searchPlaceholder="Cari nama divisi atau kode..."
                        onSearchChange={(v) => handleFilter({ search: v || undefined })}
                        toolbarSlot={
                            <Select
                                value={filters.status ?? 'all'}
                                onValueChange={(v) => handleFilter({ status: v === 'all' ? undefined : v })}
                            >
                                <SelectTrigger className="h-9 w-[120px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua</SelectItem>
                                    <SelectItem value="active">Aktif</SelectItem>
                                    <SelectItem value="inactive">Nonaktif</SelectItem>
                                </SelectContent>
                            </Select>
                        }
                        emptyState={
                            <div className="py-12 text-center">
                                <Building2 className="mx-auto mb-3 size-6 text-slate-400" />
                                <p className="text-sm font-semibold text-slate-900">Belum ada divisi</p>
                                <Button asChild className="mt-3 rounded-xl bg-brand-600 hover:bg-brand-700">
                                    <Link href="/admin/divisions/create">
                                        <Plus className="mr-1.5 size-4" />
                                        Tambah Divisi
                                    </Link>
                                </Button>
                            </div>
                        }
                    />

                    <div className="mt-4">
                        <DataTablePagination paginator={divisions} />
                    </div>
                </div>
            </div>

            <Dialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus divisi?</DialogTitle>
                        <DialogDescription>
                            Divisi <span className="font-semibold">"{deleteName}"</span> akan dihapus permanen.
                            Divisi yang masih dipakai pada data jabatan tidak bisa dihapus.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>
                            <X className="mr-1.5 size-4" />
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={performDelete} disabled={deleting}>
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
    value: number;
    icon: typeof Building2;
    tint: string;
    text: string;
}) {
    return (
        <div className="rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="flex items-center gap-3">
                <div className={`grid size-10 place-items-center rounded-xl ${tint} ${text}`}>
                    <Icon className="size-5" />
                </div>
                <div>
                    <div className="text-[11px] tracking-wider text-slate-500 uppercase">{label}</div>
                    <div className="text-[18px] font-extrabold text-slate-900 tabular-nums">
                        {value.toLocaleString('id-ID')}
                    </div>
                </div>
            </div>
        </div>
    );
}
