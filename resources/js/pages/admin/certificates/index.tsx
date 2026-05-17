import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Award, Ban, Copy, ExternalLink, LayoutTemplate, Plus, Sparkles } from 'lucide-react';
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
    builderTemplates: Array<{
        id: number;
        name: string;
        scope: string;
        orientation: string;
        status: string;
        title: string;
        subtitle: string | null;
        body_text: string | null;
        show_qr: boolean;
        show_signature: boolean;
        sort_order: number;
        background_url: string | null;
    }>;
    filters: {
        search?: string;
        status?: string;
    };
};

const builderStatusStyles: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    draft: 'bg-amber-50 text-amber-700 ring-amber-200',
    archived: 'bg-slate-100 text-slate-700 ring-slate-200',
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
    builderTemplates,
    filters,
}: Props) {
    const [revokeId, setRevokeId] = useState<number | null>(null);
    const [revokeNumber, setRevokeNumber] = useState<string>('');
    const [processing, setProcessing] = useState(false);

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

    const columns: ColumnDef<Certificate>[] = [
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

                <section className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
                    <div className="border-b border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_58%,#fdf2f8_100%)] p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-2xl">
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 ring-1 ring-slate-200">
                                    <LayoutTemplate className="size-3.5 text-indigo-500" />
                                    Certificate Builder
                                </div>
                                <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
                                    Builder tetap berada di menu Sertifikat
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Satu menu ini dipakai untuk dua kebutuhan sekaligus:
                                    melihat sertifikat yang sudah terbit dan mengelola
                                    banyak template sertifikat untuk course, learning
                                    path, atau kebutuhan corporate.
                                </p>
                            </div>

                            <div className="flex flex-col items-stretch gap-3 sm:items-end">
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <BuilderMetric
                                        label="Total template"
                                        value={String(builderTemplates.length)}
                                    />
                                    <BuilderMetric
                                        label="Template aktif"
                                        value={String(
                                            builderTemplates.filter(
                                                (template) => template.status === 'active',
                                            ).length,
                                        )}
                                    />
                                    <BuilderMetric
                                        label="Mode"
                                        value="Multiple"
                                    />
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
                        </div>
                    </div>

                    <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {builderTemplates.map((template) => (
                                <article
                                    key={template.id}
                                    className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                                                {template.scope}
                                            </p>
                                            <h3 className="mt-2 text-[15px] font-bold text-slate-900">
                                                {template.name}
                                            </h3>
                                        </div>
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
                                                builderStatusStyles[template.status] ??
                                                builderStatusStyles.archived
                                            }`}
                                        >
                                            {template.status}
                                        </span>
                                    </div>

                                    <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-4">
                                        <div
                                            className={`rounded-xl bg-[radial-gradient(circle_at_top_left,#eef2ff_0,#ffffff_48%),linear-gradient(135deg,#ffffff_0%,#f8fafc_100%)] p-4 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.7)] ${
                                                template.orientation === 'portrait'
                                                    ? 'mx-auto aspect-[1/1.414] max-w-[180px]'
                                                    : 'aspect-[1.414/1]'
                                            }`}
                                            style={
                                                template.background_url
                                                    ? {
                                                          backgroundImage: `linear-gradient(135deg,rgba(255,255,255,0.88),rgba(248,250,252,0.93)), url(${template.background_url})`,
                                                          backgroundSize: 'cover',
                                                          backgroundPosition: 'center',
                                                      }
                                                    : undefined
                                            }
                                        >
                                            <div className="flex h-full flex-col rounded-lg border border-indigo-100 px-4 py-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-indigo-500">
                                                        Preview
                                                    </span>
                                                    <Award className="size-4 text-indigo-500" />
                                                </div>
                                                <div className="flex flex-1 flex-col items-center justify-center text-center">
                                                    <p className="text-[9px] text-slate-400">
                                                        {template.subtitle || 'Nama Peserta'}
                                                    </p>
                                                    <p className="mt-1 text-sm font-black text-slate-900">
                                                        {template.title}
                                                    </p>
                                                    <p className="mt-1 text-[10px] text-slate-500">
                                                        {template.scope}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="mt-4 text-sm leading-6 text-slate-600">
                                        {template.body_text || 'Belum ada deskripsi template.'}
                                    </p>
                                </article>
                            ))}
                        </div>

                        <aside className="space-y-4">
                            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
                                <div className="flex items-center gap-3">
                                    <div className="grid size-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                                        <Sparkles className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Builder Page</h3>
                                        <p className="text-sm text-slate-500">
                                            Form builder sekarang dibuka di page khusus supaya
                                            proses setup template lebih fokus.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                        1. Klik tombol <strong>Buat Template</strong>.
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                        2. Isi metadata sertifikat, upload background, dan atur QR atau signature.
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                        3. Simpan lalu template akan muncul di daftar ini.
                                    </div>
                                </div>

                                <Button asChild className="mt-5 w-full rounded-xl">
                                    <Link href={admin.certificates.templates.create().url}>
                                        <Plus className="mr-1.5 size-4" />
                                        Buka Form Builder
                                    </Link>
                                </Button>
                            </div>
                        </aside>
                    </div>
                </section>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4">
                        <h2 className="text-[15px] font-bold text-slate-900">
                            Daftar Sertifikat
                        </h2>
                        <p className="mt-0.5 text-[12.5px] text-slate-500">
                            Total {certificates.total} sertifikat terbit
                        </p>
                    </div>

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
        </>
    );
}

function BuilderMetric({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-[120px] rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-right shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {label}
            </div>
            <div className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                {value}
            </div>
        </div>
    );
}
