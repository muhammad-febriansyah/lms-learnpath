import { Head, Link, router, useForm } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Package, Plus, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';

import { DataTable } from '@/components/data-table/data-table';
import {
    DataTablePagination
    
} from '@/components/data-table/data-table-pagination';
import type {Paginator} from '@/components/data-table/data-table-pagination';
import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
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
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type ScormPackage = {
    id: number;
    title: string;
    version: string | null;
    status: string;
    zip_path: string;
    lessons_count: number;
    created_at: string;
};

type Props = {
    packages: Paginator<ScormPackage>;
    filters: {
        search?: string;
    };
};

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function ScormPackagesIndex({ packages, filters }: Props) {
    const [uploadOpen, setUploadOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteName, setDeleteName] = useState<string>('');
    const [deleting, setDeleting] = useState(false);

    const handleSearch = (value: string) => {
        router.get(
            '/admin/scorm-packages',
            value ? { search: value } : {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const form = useForm<{
        title: string;
        version: string;
        zip: File | null;
    }>({
        title: '',
        version: '1.2',
        zip: null,
    });

    const submitUpload = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/scorm-packages', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setUploadOpen(false);
            },
        });
    };

    const performDelete = () => {
        if (!deleteId) {
return;
}

        setDeleting(true);
        router.delete(`/admin/scorm-packages/${deleteId}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeleteId(null);
            },
        });
    };

    const columns: ColumnDef<ScormPackage>[] = [
        {
            id: 'title',
            accessorKey: 'title',
            header: 'Package',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
                        <Package className="size-4" />
                    </div>
                    <div className="min-w-0">
                        <div className="font-semibold text-slate-900">
                            {row.original.title}
                        </div>
                        <div className="text-[11.5px] text-slate-500">
                            v{row.original.version ?? '1.2'} ·{' '}
                            {formatDate(row.original.created_at)}
                        </div>
                    </div>
                </div>
            ),
            meta: { label: 'Package' },
        },
        {
            id: 'status',
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const tone =
                    row.original.status === 'extracted'
                        ? 'border-transparent bg-emerald-50 text-emerald-700'
                        : 'border-transparent bg-amber-50 text-amber-700';

                return (
                    <Badge className={tone}>
                        {row.original.status === 'extracted' ? 'Siap Pakai' : 'Diunggah'}
                    </Badge>
                );
            },
            meta: { label: 'Status' },
        },
        {
            id: 'lessons_count',
            accessorKey: 'lessons_count',
            header: 'Dipakai',
            cell: ({ row }) => (
                <span className="font-semibold text-slate-700 tabular-nums">
                    {row.original.lessons_count} lesson
                </span>
            ),
            meta: { label: 'Dipakai di' },
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
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
                </Button>
            ),
            meta: { label: 'Aksi', className: 'w-[80px] text-right' },
            enableSorting: false,
            enableHiding: false,
        },
    ];

    return (
        <>
            <Head title="SCORM Package" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">SCORM Package</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        SCORM Package
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Unggah dan kelola paket SCORM untuk lesson interaktif.
                    </p>
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-[15px] font-bold text-slate-900">
                                Daftar Package
                            </h2>
                            <p className="mt-0.5 text-[12.5px] text-slate-500">
                                {packages.total} package tersedia
                            </p>
                        </div>
                        <Button
                            onClick={() => setUploadOpen(true)}
                            className="rounded-xl bg-brand-600 hover:bg-brand-700"
                        >
                            <Upload className="mr-1.5 size-4" />
                            Unggah Package
                        </Button>
                    </div>

                    <DataTable
                        columns={columns}
                        data={packages.data}
                        searchValue={filters.search ?? ''}
                        searchPlaceholder="Cari judul package..."
                        onSearchChange={handleSearch}
                        emptyState={
                            <div className="py-12 text-center">
                                <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-violet-50 text-violet-600">
                                    <Package className="size-5" />
                                </div>
                                <p className="text-sm font-semibold text-slate-900">
                                    Belum ada SCORM package
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Unggah file ZIP SCORM untuk dipakai di lesson tipe SCORM.
                                </p>
                                <Button
                                    onClick={() => setUploadOpen(true)}
                                    className="mt-3 rounded-xl bg-brand-600 hover:bg-brand-700"
                                >
                                    <Plus className="mr-1.5 size-4" />
                                    Unggah Package
                                </Button>
                            </div>
                        }
                    />

                    <div className="mt-4">
                        <DataTablePagination paginator={packages} />
                    </div>
                </div>
            </div>

            {/* Upload dialog */}
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <DialogContent>
                    <form onSubmit={submitUpload}>
                        <DialogHeader>
                            <DialogTitle>Unggah SCORM Package</DialogTitle>
                            <DialogDescription>
                                Pilih file ZIP berisi konten SCORM (max 200 MB).
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <RequiredLabel htmlFor="title" required>
                                    Judul Package
                                </RequiredLabel>
                                <Input
                                    id="title"
                                    placeholder="Contoh: Compliance 101 SCORM"
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                />
                                <FieldError message={form.errors.title} />
                            </div>

                            <div className="space-y-2">
                                <RequiredLabel htmlFor="version">Versi SCORM</RequiredLabel>
                                <Select
                                    value={form.data.version}
                                    onValueChange={(v) => form.setData('version', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1.2">SCORM 1.2</SelectItem>
                                        <SelectItem value="2004">SCORM 2004</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FieldError message={form.errors.version} />
                            </div>

                            <div className="space-y-2">
                                <RequiredLabel htmlFor="zip" required>
                                    File ZIP
                                </RequiredLabel>
                                <Input
                                    id="zip"
                                    type="file"
                                    accept=".zip"
                                    onChange={(e) =>
                                        form.setData('zip', e.target.files?.[0] ?? null)
                                    }
                                />
                                {form.progress && (
                                    <div className="h-1 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full bg-brand-600 transition-all"
                                            style={{ width: `${form.progress.percentage ?? 0}%` }}
                                        />
                                    </div>
                                )}
                                <FieldError message={form.errors.zip} />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setUploadOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="bg-brand-600 hover:bg-brand-700"
                            >
                                <Upload className="mr-1.5 size-4" />
                                {form.processing ? 'Mengunggah...' : 'Unggah'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete dialog */}
            <Dialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus SCORM package?</DialogTitle>
                        <DialogDescription>
                            Package <span className="font-semibold">"{deleteName}"</span> akan
                            dihapus permanen termasuk file ZIP-nya.
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
