import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Copy, Power, Tag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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

type Voucher = {
    id: number;
    code: string;
    grant_kind: 'course' | 'bundle' | 'learning_path' | 'points';
    grantable_title: string | null;
    points_amount: number | null;
    valid_from: string | null;
    valid_until: string | null;
    max_uses: number;
    uses_count: number;
    single_use_per_user: boolean;
    is_active: boolean;
    bound_email: string | null;
    bound_user: { id: number; name: string; email: string } | null;
    batch: { id: number; name: string } | null;
    note: string | null;
    creator: { id: number; name: string } | null;
    created_at: string | null;
    redemptions_count: number;
};

type Redemption = {
    id: number;
    user: { id: number; name: string; email: string } | null;
    redeemed_at: string | null;
    points_credited: number | null;
};

type Props = {
    voucher: Voucher;
    redemptions: Redemption[];
};

const KIND_LABEL: Record<string, string> = {
    course: 'Akses Course',
    bundle: 'Akses Bundle',
    learning_path: 'Akses Learning Path',
    points: 'Top-up Poin',
};

function formatNumber(n: number): string {
    return new Intl.NumberFormat('id-ID').format(n);
}

function formatDateTime(iso: string | null): string {
    if (!iso) {
        return '-';
    }
    return new Date(iso).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function VoucherShow({ voucher, redemptions }: Props) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(voucher.code);
            toast.success('Kode disalin');
        } catch {
            toast.error('Gagal menyalin');
        }
    };

    const toggle = () => {
        router.post(`/admin/vouchers/${voucher.id}/toggle`, {}, { preserveScroll: true });
    };

    const performDelete = () => {
        setProcessing(true);
        router.delete(`/admin/vouchers/${voucher.id}`, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <>
            <Head title={`Voucher ${voucher.code}`} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/vouchers" className="hover:text-slate-700">
                            Voucher Akses
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-mono font-semibold text-slate-900">
                            {voucher.code}
                        </span>
                    </nav>
                </div>

                <div className="grid gap-5 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-6 ring-1 ring-amber-200">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700 backdrop-blur">
                                        <Tag className="size-3" />
                                        {KIND_LABEL[voucher.grant_kind]}
                                    </div>
                                    <div className="mt-3 font-mono text-3xl font-extrabold tracking-wider text-slate-900">
                                        {voucher.code}
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="mt-1 h-7 px-2 text-[11px] text-amber-700"
                                        onClick={copyCode}
                                    >
                                        <Copy className="mr-1 size-3" />
                                        Salin kode
                                    </Button>
                                </div>
                                <div className="text-right">
                                    {voucher.is_active ? (
                                        <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                                            Aktif
                                        </Badge>
                                    ) : (
                                        <Badge className="border-slate-200 bg-slate-100 text-slate-500">
                                            Nonaktif
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3 text-[13px]">
                                <Stat
                                    label="Hadiah"
                                    value={
                                        voucher.grant_kind === 'points'
                                            ? `${formatNumber(voucher.points_amount ?? 0)} poin`
                                            : voucher.grantable_title ?? '-'
                                    }
                                />
                                <Stat
                                    label="Pemakaian"
                                    value={`${voucher.uses_count} / ${voucher.max_uses}`}
                                />
                                <Stat
                                    label="Berlaku"
                                    value={
                                        voucher.valid_from || voucher.valid_until
                                            ? `${voucher.valid_from ? formatDateTime(voucher.valid_from) : '∞'} → ${voucher.valid_until ? formatDateTime(voucher.valid_until) : '∞'}`
                                            : 'Selalu aktif'
                                    }
                                />
                                <Stat
                                    label="Binding"
                                    value={
                                        voucher.bound_user
                                            ? `${voucher.bound_user.name} (${voucher.bound_user.email})`
                                            : voucher.bound_email ?? 'Bebas'
                                    }
                                />
                            </div>
                        </div>

                        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                            <h2 className="text-[15px] font-bold text-slate-900">
                                Riwayat Pemakaian
                            </h2>
                            <p className="mt-0.5 text-[12.5px] text-slate-500">
                                {redemptions.length} pemakaian
                            </p>
                            {redemptions.length === 0 ? (
                                <div className="mt-4 py-8 text-center text-[13px] text-slate-500">
                                    Belum pernah dipakai.
                                </div>
                            ) : (
                                <ul className="mt-4 divide-y divide-slate-100">
                                    {redemptions.map((r) => (
                                        <li
                                            key={r.id}
                                            className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="min-w-0">
                                                <div className="text-[13px] font-semibold text-slate-900">
                                                    {r.user?.name ?? '-'}
                                                </div>
                                                <div className="text-[11.5px] text-slate-500">
                                                    {r.user?.email ?? '-'} ·{' '}
                                                    {formatDateTime(r.redeemed_at)}
                                                </div>
                                            </div>
                                            {r.points_credited && (
                                                <div className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                                                    +{formatNumber(r.points_credited)} poin
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                            <h3 className="text-[14px] font-bold text-slate-900">Detail</h3>
                            <dl className="mt-3 space-y-2 text-[12.5px]">
                                <DetailRow label="Single use per user" value={voucher.single_use_per_user ? 'Ya' : 'Tidak'} />
                                {voucher.batch && (
                                    <DetailRow
                                        label="Batch"
                                        value={
                                            <Link
                                                href={`/admin/voucher-batches/${voucher.batch.id}`}
                                                className="text-brand-600 hover:underline"
                                            >
                                                {voucher.batch.name}
                                            </Link>
                                        }
                                    />
                                )}
                                {voucher.note && (
                                    <DetailRow label="Catatan" value={voucher.note} />
                                )}
                                {voucher.creator && (
                                    <DetailRow label="Dibuat oleh" value={voucher.creator.name} />
                                )}
                                <DetailRow label="Dibuat" value={formatDateTime(voucher.created_at)} />
                            </dl>
                        </div>

                        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                            <h3 className="text-[14px] font-bold text-slate-900">Aksi</h3>
                            <div className="mt-3 space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={toggle}
                                >
                                    <Power className="mr-2 size-4" />
                                    {voucher.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                    onClick={() => setDeleteOpen(true)}
                                    disabled={voucher.redemptions_count > 0}
                                >
                                    <Trash2 className="mr-2 size-4" />
                                    Hapus
                                </Button>
                                <Button asChild variant="ghost" className="w-full justify-start">
                                    <Link href="/admin/vouchers">
                                        <ArrowLeft className="mr-2 size-4" />
                                        Kembali ke daftar
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus voucher?</DialogTitle>
                        <DialogDescription>
                            Voucher <span className="font-mono font-bold">{voucher.code}</span>{' '}
                            akan dihapus permanen.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={performDelete}
                            disabled={processing}
                        >
                            {processing ? 'Menghapus...' : 'Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                {label}
            </div>
            <div className="mt-0.5 font-semibold text-slate-900">{value}</div>
        </div>
    );
}

function DetailRow({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-baseline justify-between gap-2">
            <dt className="text-slate-500">{label}</dt>
            <dd className="text-right font-semibold text-slate-900">{value}</dd>
        </div>
    );
}
