import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Award,
    Ban,
    Copy,
    Download,
    ExternalLink,
    Plus,
    RotateCcw,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { DataTable } from '@/components/data-table/data-table';
import {
    DataTablePagination

} from '@/components/data-table/data-table-pagination';
import type {Paginator} from '@/components/data-table/data-table-pagination';
import { IconChevR } from '@/components/learnpath-icons';
import { StatusBadge } from '@/components/status/status-badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import admin from '@/routes/admin';

type Certificate = {
    id: number;
    certificate_number: string;
    verification_code: string;
    status: string;
    issued_at: string | null;
    expired_at: string | null;
    user: { id: number; name: string; email: string } | null;
    course: { id: number; title: string } | null;
};

type Props = {
    certificates: Paginator<Certificate>;
    filters: {
        search?: string;
        status?: string;
    };
};

function formatDate(value: string | null): string {
    if (!value) {
return '-';
}

    return new Date(value).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function CertificatesIndex({
    certificates,
    filters,
}: Props) {
    const [revokeId, setRevokeId] = useState<number | null>(null);
    const [revokeNumber, setRevokeNumber] = useState<string>('');
    const [processing, setProcessing] = useState(false);

    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkRevokeOpen, setBulkRevokeOpen] = useState(false);
    const [bulkReissueOpen, setBulkReissueOpen] = useState(false);
    const [bulkProcessing, setBulkProcessing] = useState(false);

    const selectedCertificates = certificates.data.filter((c) =>
        selectedIds.has(c.id),
    );
    const selectedRevocable = selectedCertificates.filter(
        (c) => c.status === 'issued',
    );
    const selectedReissuable = selectedCertificates.filter(
        (c) => c.status === 'revoked' || c.status === 'expired',
    );

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const allSelected =
        certificates.data.length > 0 &&
        certificates.data.every((c) => selectedIds.has(c.id));

    const toggleSelectAll = () => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allSelected) {
                certificates.data.forEach((c) => next.delete(c.id));
            } else {
                certificates.data.forEach((c) => next.add(c.id));
            }
            return next;
        });
    };

    const clearSelection = () => setSelectedIds(new Set());

    const handleFilter = (next: Record<string, string | undefined>) => {
        router.get(
            admin.certificates.index(),
            { ...filters, ...next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const copyCode = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            toast.success('Kode verifikasi disalin');
        } catch {
            toast.error('Gagal menyalin kode');
        }
    };

    const performRevoke = () => {
        if (!revokeId) {
            return;
        }

        setProcessing(true);
        router.post(
            admin.certificates.revoke(revokeId),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setRevokeId(null);
                },
            },
        );
    };

    const performBulkRevoke = () => {
        const ids = selectedRevocable.map((c) => c.id);
        if (ids.length === 0) {
            return;
        }

        setBulkProcessing(true);
        router.post(
            '/admin/certificates/bulk/revoke',
            { ids },
            {
                preserveScroll: true,
                onFinish: () => {
                    setBulkProcessing(false);
                    setBulkRevokeOpen(false);
                    clearSelection();
                },
            },
        );
    };

    const performBulkReissue = () => {
        const ids = selectedReissuable.map((c) => c.id);
        if (ids.length === 0) {
            return;
        }

        setBulkProcessing(true);
        router.post(
            '/admin/certificates/bulk/reissue',
            { ids },
            {
                preserveScroll: true,
                onFinish: () => {
                    setBulkProcessing(false);
                    setBulkReissueOpen(false);
                    clearSelection();
                },
            },
        );
    };

    const performBulkExport = () => {
        const ids = selectedCertificates.map((c) => c.id);
        if (ids.length === 0) {
            return;
        }

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/admin/certificates/bulk/export';
        form.style.display = 'none';

        const csrf = document
            .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
            ?.getAttribute('content');
        if (csrf) {
            const token = document.createElement('input');
            token.type = 'hidden';
            token.name = '_token';
            token.value = csrf;
            form.appendChild(token);
        }

        ids.forEach((id) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'ids[]';
            input.value = String(id);
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        toast.success(`Mengunduh ${ids.length} sertifikat...`);
    };

    const columns: ColumnDef<Certificate>[] = [
        {
            id: 'select',
            header: () => (
                <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Pilih semua sertifikat di halaman ini"
                    disabled={certificates.data.length === 0}
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={selectedIds.has(row.original.id)}
                    onCheckedChange={() => toggleSelect(row.original.id)}
                    aria-label={`Pilih sertifikat ${row.original.certificate_number}`}
                />
            ),
            meta: { label: 'Pilih', className: 'w-[40px]' },
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: 'certificate_number',
            accessorKey: 'certificate_number',
            header: 'Nomor',
            cell: ({ row }) => (
                <div className="flex items-center gap-2.5">
                    <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white">
                        <Award className="size-4" />
                    </div>
                    <div>
                        <div className="font-mono text-[12.5px] font-semibold text-slate-900">
                            {row.original.certificate_number}
                        </div>
                        <button
                            onClick={() => copyCode(row.original.verification_code)}
                            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-brand-600"
                        >
                            <Copy className="size-3" />
                            {row.original.verification_code}
                        </button>
                    </div>
                </div>
            ),
            meta: { label: 'Nomor' },
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
                <div className="max-w-[240px] truncate text-slate-700">
                    {row.original.course?.title ?? '-'}
                </div>
            ),
            meta: { label: 'Course' },
        },
        {
            id: 'issued_at',
            accessorKey: 'issued_at',
            header: 'Terbit',
            cell: ({ row }) => (
                <span className="text-[12.5px] text-slate-600">
                    {formatDate(row.original.issued_at)}
                </span>
            ),
            meta: { label: 'Tanggal Terbit' },
        },
        {
            id: 'status',
            header: 'Status',
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
            meta: { label: 'Status' },
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) =>
                row.original.status === 'issued' ? (
                    <Button
                        size="sm"
                        className="h-8 rounded-xl bg-rose-600 text-white shadow-sm hover:bg-rose-700"
                        onClick={() => {
                            setRevokeId(row.original.id);
                            setRevokeNumber(row.original.certificate_number);
                        }}
                    >
                        <Ban className="mr-1 size-3.5" />
                        Cabut
                    </Button>
                ) : null,
            meta: { label: 'Aksi', className: 'w-[120px] text-right' },
            enableSorting: false,
            enableHiding: false,
        },
    ];

    return (
        <>
            <Head title="Sertifikat" />
            <div className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                            <Link href="/admin/dashboard" className="hover:text-slate-700">
                                Dashboard
                            </Link>
                            <IconChevR size={12} className="text-slate-300" />
                            <span className="font-semibold text-slate-900">Sertifikat</span>
                        </nav>
                        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                            Sertifikat
                        </h1>
                        <p className="mt-1 text-[13.5px] text-slate-500">
                            Sertifikat yang sudah diterbitkan untuk peserta yang lulus.
                        </p>
                    </div>
                    <Button
                        asChild
                        className="rounded-xl bg-brand-600 hover:bg-brand-700"
                    >
                        <Link href={admin.certificates.templates.create().url}>
                            <Plus className="mr-1.5 size-4" />
                            Buat Template
                        </Link>
                    </Button>
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4">
                        <h2 className="text-[15px] font-bold text-slate-900">
                            Daftar Sertifikat
                        </h2>
                        <p className="mt-0.5 text-[12.5px] text-slate-500">
                            Total {certificates.total} sertifikat terbit
                        </p>
                    </div>

                    {selectedIds.size > 0 && (
                        <div className="mb-3 flex flex-col gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-[13px] sm:flex-row sm:items-center sm:justify-between">
                            <div className="font-semibold text-brand-800">
                                {selectedIds.size} sertifikat dipilih
                                {selectedRevocable.length > 0 && (
                                    <span className="ml-2 text-[12px] font-normal text-brand-700">
                                        · {selectedRevocable.length} aktif
                                    </span>
                                )}
                                {selectedReissuable.length > 0 && (
                                    <span className="ml-2 text-[12px] font-normal text-brand-700">
                                        · {selectedReissuable.length} dapat diaktifkan
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                                {selectedRevocable.length > 0 && (
                                    <Button
                                        size="sm"
                                        className="h-8 rounded-xl bg-rose-600 text-white hover:bg-rose-700"
                                        onClick={() => setBulkRevokeOpen(true)}
                                    >
                                        <Ban className="mr-1 size-3.5" />
                                        Cabut ({selectedRevocable.length})
                                    </Button>
                                )}
                                {selectedReissuable.length > 0 && (
                                    <Button
                                        size="sm"
                                        className="h-8 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                                        onClick={() => setBulkReissueOpen(true)}
                                    >
                                        <RotateCcw className="mr-1 size-3.5" />
                                        Aktifkan ({selectedReissuable.length})
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 rounded-xl"
                                    onClick={performBulkExport}
                                >
                                    <Download className="mr-1 size-3.5" />
                                    Export CSV
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 rounded-xl"
                                    onClick={clearSelection}
                                >
                                    <X className="mr-1 size-3.5" />
                                    Batal
                                </Button>
                            </div>
                        </div>
                    )}

                    <DataTable
                        columns={columns}
                        data={certificates.data}
                        searchValue={filters.search ?? ''}
                        searchPlaceholder="Cari nomor, kode verifikasi, atau peserta..."
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
                                <SelectTrigger className="h-9 w-[140px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="issued">Terbit</SelectItem>
                                    <SelectItem value="revoked">Dicabut</SelectItem>
                                    <SelectItem value="expired">Kedaluwarsa</SelectItem>
                                </SelectContent>
                            </Select>
                        }
                        emptyState={
                            <div className="py-12 text-center">
                                <ExternalLink className="mx-auto mb-3 size-6 text-slate-400" />
                                <p className="text-sm font-semibold text-slate-900">
                                    Belum ada sertifikat
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Sertifikat akan terbit otomatis ketika peserta lulus course.
                                </p>
                            </div>
                        }
                    />

                    <div className="mt-4">
                        <DataTablePagination paginator={certificates} />
                    </div>
                </div>
            </div>

            <Dialog
                open={revokeId !== null}
                onOpenChange={(open) => !open && setRevokeId(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cabut sertifikat?</DialogTitle>
                        <DialogDescription>
                            Sertifikat{' '}
                            <span className="font-mono font-semibold">{revokeNumber}</span>{' '}
                            akan ditandai sebagai dicabut dan tidak valid lagi untuk verifikasi.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRevokeId(null)}>
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={performRevoke}
                            disabled={processing}
                        >
                            {processing ? 'Memproses...' : 'Cabut Sertifikat'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={bulkRevokeOpen}
                onOpenChange={(open) => !open && setBulkRevokeOpen(false)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Cabut {selectedRevocable.length} sertifikat sekaligus?
                        </DialogTitle>
                        <DialogDescription>
                            Sertifikat yang statusnya bukan "Terbit" akan otomatis
                            dilewati. Sertifikat dicabut tidak valid lagi untuk verifikasi
                            publik, namun bisa diaktifkan kembali oleh super admin.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setBulkRevokeOpen(false)}
                            disabled={bulkProcessing}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={performBulkRevoke}
                            disabled={bulkProcessing || selectedRevocable.length === 0}
                        >
                            {bulkProcessing
                                ? 'Memproses...'
                                : `Cabut (${selectedRevocable.length})`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={bulkReissueOpen}
                onOpenChange={(open) => !open && setBulkReissueOpen(false)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Aktifkan kembali {selectedReissuable.length} sertifikat?
                        </DialogTitle>
                        <DialogDescription>
                            Sertifikat berstatus dicabut atau kedaluwarsa akan dikembalikan
                            ke status "Terbit" dengan tanggal terbit baru. Hanya berlaku
                            untuk sertifikat yang dipilih.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setBulkReissueOpen(false)}
                            disabled={bulkProcessing}
                        >
                            Batal
                        </Button>
                        <Button
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                            onClick={performBulkReissue}
                            disabled={bulkProcessing || selectedReissuable.length === 0}
                        >
                            {bulkProcessing
                                ? 'Memproses...'
                                : `Aktifkan (${selectedReissuable.length})`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

