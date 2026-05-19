import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDownLeft,
    ArrowUpRight,
    BellRing,
    Bolt,
    Plus,
    Receipt,
    Settings,
    UserPlus,
    Users,
    Wallet as WalletIcon,
} from 'lucide-react';
import { useState } from 'react';

import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import type { Paginator } from '@/components/data-table/data-table-pagination';
import { RupiahInput } from '@/components/form/rupiah-input';
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
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Transaction = {
    id: number;
    type:
        | 'top_up'
        | 'debit'
        | 'refund'
        | 'adjustment_credit'
        | 'adjustment_debit';
    amount: number;
    balance_after: number;
    description: string | null;
    performed_by: string | null;
    created_at: string | null;
};

type Props = {
    organization: {
        id: number;
        name: string;
        seat_quota: number;
        seats_used: number;
    };
    wallet: {
        balance: number;
        currency: string;
        low_balance_threshold: number;
        is_low: boolean;
    };
    transactions: Paginator<Transaction>;
    stats: {
        topup_total: number;
        debit_total: number;
        last_topup_at: string | null;
    };
    pricing: { price_per_seat: number };
};

const TYPE_LABEL: Record<Transaction['type'], string> = {
    top_up: 'Top Up',
    debit: 'Pembayaran',
    refund: 'Refund',
    adjustment_credit: 'Penyesuaian (+)',
    adjustment_debit: 'Penyesuaian (-)',
};

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

function formatDate(iso: string | null): string {
    if (!iso) {
return '-';
}

    return new Date(iso).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
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

export default function WalletIndex({
    organization,
    wallet,
    transactions,
    stats,
    pricing,
}: Props) {
    const [editThreshold, setEditThreshold] = useState(false);
    const [thresholdInput, setThresholdInput] = useState<number | ''>(
        wallet.low_balance_threshold,
    );
    const [saving, setSaving] = useState(false);
    const [seatDialog, setSeatDialog] = useState(false);
    const [seatCount, setSeatCount] = useState(1);
    const [purchasingSeats, setPurchasingSeats] = useState(false);

    const seatCost = seatCount * pricing.price_per_seat;
    const canAffordSeats = wallet.balance >= seatCost;

    const purchaseSeats = () => {
        setPurchasingSeats(true);
        router.post(
            '/business/wallet/purchase-seats',
            { seats: seatCount },
            {
                preserveScroll: true,
                onFinish: () => {
                    setPurchasingSeats(false);
                    setSeatDialog(false);
                },
            },
        );
    };

    const saveThreshold = () => {
        setSaving(true);
        router.patch(
            '/business/wallet/threshold',
            { low_balance_threshold: Number(thresholdInput || 0) },
            {
                preserveScroll: true,
                onFinish: () => {
                    setSaving(false);
                    setEditThreshold(false);
                },
            },
        );
    };

    return (
        <>
            <Head title="E-Wallet Korporat" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">E-Wallet</span>
                    </nav>
                    <h1 className="mt-1.5 inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
                        <WalletIcon className="size-6 text-brand-600" />
                        E-Wallet Korporat
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Saldo terpusat untuk {organization.name}. Top-up sekali, gunakan
                        untuk pembelian seat, langganan, dan layanan tambahan.
                    </p>
                </div>

                {/* Balance hero card */}
                <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-600 to-brand-600 p-1 shadow-[0_20px_50px_-20px_rgba(67,56,202,0.5)]">
                    <div className="rounded-[1rem] bg-white p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-brand-700">
                                    <Bolt className="size-3" />
                                    Saldo Wallet
                                </div>
                                <div className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                                    {formatRupiah(wallet.balance)}
                                </div>
                                <p className="mt-1 text-[12.5px] text-slate-500">
                                    Update terakhir{' '}
                                    {formatDateTime(stats.last_topup_at) ?? '-'}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    asChild
                                    className="rounded-xl bg-brand-600 hover:bg-brand-700"
                                >
                                    <Link href="/business/wallet/top-up">
                                        <Plus className="mr-1.5 size-4" />
                                        Top Up
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setEditThreshold(true)}
                                    className="rounded-xl"
                                >
                                    <Settings className="mr-1.5 size-4" />
                                    Threshold
                                </Button>
                            </div>
                        </div>

                        {wallet.is_low && (
                            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12.5px] text-amber-800">
                                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                                <div>
                                    <strong>Saldo rendah.</strong> Saldo Anda sudah di
                                    bawah threshold {formatRupiah(wallet.low_balance_threshold)}.
                                    Top up untuk menghindari kegagalan transaksi.
                                </div>
                            </div>
                        )}

                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                            <StatTile
                                label="Total Top Up"
                                value={formatRupiah(stats.topup_total)}
                                icon={<ArrowUpRight className="size-4" />}
                                tone="emerald"
                            />
                            <StatTile
                                label="Total Terpakai"
                                value={formatRupiah(stats.debit_total)}
                                icon={<ArrowDownLeft className="size-4" />}
                                tone="rose"
                            />
                            <StatTile
                                label="Threshold Alert"
                                value={
                                    wallet.low_balance_threshold === 0
                                        ? 'Belum di-set'
                                        : formatRupiah(wallet.low_balance_threshold)
                                }
                                icon={<BellRing className="size-4" />}
                                tone="slate"
                            />
                        </div>
                    </div>
                </div>

                {/* Use balance: buy seats */}
                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                                <UserPlus className="size-5" />
                            </div>
                            <div>
                                <h3 className="text-[14px] font-bold text-slate-900">
                                    Beli Seat dari Saldo
                                </h3>
                                <p className="text-[12.5px] text-slate-500">
                                    {organization.seats_used}/{organization.seat_quota}{' '}
                                    seat terpakai. Tambah seat tanpa transfer lagi —
                                    langsung dari saldo wallet.
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setSeatDialog(true)}
                            className="rounded-xl"
                            variant="outline"
                        >
                            <Users className="mr-1.5 size-4" />
                            Beli Seat ({formatRupiah(pricing.price_per_seat)}/seat)
                        </Button>
                    </div>
                </div>

                {/* Ledger */}
                <div className="rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
                        <Receipt className="size-4 text-slate-500" />
                        <h3 className="text-[14px] font-bold text-slate-900">
                            Riwayat Transaksi
                        </h3>
                    </div>

                    {transactions.data.length === 0 ? (
                        <div className="px-5 py-12 text-center text-[13px] text-slate-500">
                            Belum ada transaksi. Lakukan top-up untuk memulai.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-[13px]">
                                <thead>
                                    <tr className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        <th className="px-5 py-2.5">Tanggal</th>
                                        <th className="px-5 py-2.5">Tipe</th>
                                        <th className="px-5 py-2.5">Deskripsi</th>
                                        <th className="px-5 py-2.5 text-right">Jumlah</th>
                                        <th className="px-5 py-2.5 text-right">Saldo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {transactions.data.map((tx) => {
                                        const isCredit = tx.amount > 0;

                                        return (
                                            <tr
                                                key={tx.id}
                                                className="hover:bg-slate-50/60"
                                            >
                                                <td className="px-5 py-3 text-slate-600">
                                                    {formatDate(tx.created_at)}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <Badge
                                                        className={cn(
                                                            isCredit
                                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                                : 'border-rose-200 bg-rose-50 text-rose-700',
                                                        )}
                                                    >
                                                        {TYPE_LABEL[tx.type]}
                                                    </Badge>
                                                </td>
                                                <td className="px-5 py-3 text-slate-700">
                                                    {tx.description ?? '-'}
                                                    {tx.performed_by && (
                                                        <div className="text-[11px] text-slate-400">
                                                            oleh {tx.performed_by}
                                                        </div>
                                                    )}
                                                </td>
                                                <td
                                                    className={cn(
                                                        'px-5 py-3 text-right font-bold tabular-nums',
                                                        isCredit
                                                            ? 'text-emerald-700'
                                                            : 'text-rose-700',
                                                    )}
                                                >
                                                    {isCredit ? '+' : ''}
                                                    {formatRupiah(tx.amount)}
                                                </td>
                                                <td className="px-5 py-3 text-right font-semibold tabular-nums text-slate-900">
                                                    {formatRupiah(tx.balance_after)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="border-t border-slate-100 px-5 py-3">
                        <DataTablePagination paginator={transactions} />
                    </div>
                </div>
            </div>

            <Dialog open={seatDialog} onOpenChange={setSeatDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="inline-flex items-center gap-2">
                            <Users className="size-5 text-brand-600" />
                            Beli Seat dari Saldo
                        </DialogTitle>
                        <DialogDescription>
                            Saldo akan dipotong otomatis. Seat aktif segera setelah
                            konfirmasi.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <Label htmlFor="seat_count">Jumlah Seat</Label>
                            <Input
                                id="seat_count"
                                type="number"
                                min={1}
                                value={seatCount}
                                onChange={(e) =>
                                    setSeatCount(Math.max(1, Number(e.target.value) || 1))
                                }
                            />
                            <p className="mt-1 text-[11.5px] text-slate-500">
                                Harga per seat:{' '}
                                {formatRupiah(pricing.price_per_seat)}
                            </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3 text-[13px] ring-1 ring-slate-200">
                            <div className="flex items-baseline justify-between">
                                <span className="text-slate-500">Saldo saat ini</span>
                                <span className="font-semibold tabular-nums">
                                    {formatRupiah(wallet.balance)}
                                </span>
                            </div>
                            <div className="mt-1.5 flex items-baseline justify-between text-rose-700">
                                <span>Total potongan</span>
                                <span className="font-bold tabular-nums">
                                    -{formatRupiah(seatCost)}
                                </span>
                            </div>
                            <div className="mt-1.5 flex items-baseline justify-between border-t border-slate-200 pt-1.5">
                                <span className="font-bold">Saldo setelah</span>
                                <span className="font-extrabold tabular-nums">
                                    {formatRupiah(wallet.balance - seatCost)}
                                </span>
                            </div>
                        </div>
                        {!canAffordSeats && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-800">
                                Saldo tidak cukup. Top up dulu untuk membeli seat ini.
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setSeatDialog(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={purchaseSeats}
                            disabled={purchasingSeats || !canAffordSeats}
                            className="rounded-xl bg-brand-600 hover:bg-brand-700"
                        >
                            {purchasingSeats
                                ? 'Memproses...'
                                : `Beli ${seatCount} Seat`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={editThreshold} onOpenChange={setEditThreshold}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Atur Threshold Saldo Rendah</DialogTitle>
                        <DialogDescription>
                            Anda akan diingatkan saat saldo wallet berada di bawah angka
                            ini. Isi 0 untuk menonaktifkan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <Label htmlFor="threshold">Threshold (Rupiah)</Label>
                        <RupiahInput
                            id="threshold"
                            value={thresholdInput}
                            onChange={(value) => setThresholdInput(value)}
                            onClear={() => setThresholdInput('')}
                            placeholder="Rp 500.000"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditThreshold(false)}
                        >
                            Batal
                        </Button>
                        <Button onClick={saveThreshold} disabled={saving}>
                            {saving ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function StatTile({
    label,
    value,
    icon,
    tone,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
    tone: 'emerald' | 'rose' | 'slate';
}) {
    return (
        <div className="rounded-xl bg-slate-50 p-3.5 ring-1 ring-slate-200">
            <div
                className={cn(
                    'inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider',
                    tone === 'emerald'
                        ? 'text-emerald-600'
                        : tone === 'rose'
                          ? 'text-rose-600'
                          : 'text-slate-500',
                )}
            >
                {icon}
                {label}
            </div>
            <div className="mt-1 text-[15px] font-bold tabular-nums text-slate-900">
                {value}
            </div>
        </div>
    );
}
