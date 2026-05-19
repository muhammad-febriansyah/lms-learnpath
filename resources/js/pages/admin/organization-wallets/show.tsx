import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Building2,
    Mail,
    Receipt,
    Settings2,
    Wallet,
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
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
    wallet: {
        id: number;
        balance: number;
        currency: string;
        low_balance_threshold: number;
        is_low: boolean;
        updated_at: string | null;
    };
    organization: {
        id: number | null;
        name: string | null;
        slug: string | null;
        contact_email: string | null;
    };
    transactions: Paginator<Transaction>;
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

export default function OrganizationWalletShow({
    wallet,
    organization,
    transactions,
}: Props) {
    const [adjustOpen, setAdjustOpen] = useState(false);
    const [direction, setDirection] = useState<'credit' | 'debit'>('credit');
    const [amount, setAmount] = useState<number | ''>(0);
    const [reason, setReason] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const normalizedAmount = Number(amount || 0);

    const submit = () => {
        setSaving(true);
        setError(null);
        router.post(
            `/admin/organization-wallets/${wallet.id}/adjust`,
            { direction, amount: normalizedAmount, reason },
            {
                preserveScroll: true,
                onError: (errors) => {
                    setError(
                        errors.amount ??
                            errors.reason ??
                            errors.direction ??
                            'Gagal menyimpan',
                    );
                },
                onSuccess: () => {
                    setAdjustOpen(false);
                    setAmount(0);
                    setReason('');
                },
                onFinish: () => setSaving(false),
            },
        );
    };

    return (
        <>
            <Head title={`Wallet — ${organization.name}`} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <Link
                            href="/admin/organization-wallets"
                            className="hover:text-slate-700"
                        >
                            E-Wallet
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            {organization.name}
                        </span>
                    </nav>
                    <h1 className="mt-1.5 inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
                        <Wallet className="size-6 text-brand-600" />
                        {organization.name}
                    </h1>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                    <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 p-1 shadow-md">
                        <div className="rounded-[14px] bg-white p-6">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        Saldo Saat Ini
                                    </div>
                                    <div className="mt-1 text-4xl font-extrabold tracking-tight tabular-nums text-slate-900">
                                        {formatRupiah(wallet.balance)}
                                    </div>
                                    <div className="mt-1 text-[12px] text-slate-500">
                                        Update terakhir{' '}
                                        {formatDateTime(wallet.updated_at)}
                                    </div>
                                </div>
                                <Button
                                    onClick={() => setAdjustOpen(true)}
                                    variant="outline"
                                    className="rounded-xl"
                                >
                                    <Settings2 className="mr-1.5 size-4" />
                                    Penyesuaian Manual
                                </Button>
                            </div>

                            {wallet.is_low && (
                                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12.5px] text-amber-800">
                                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                                    Saldo di bawah threshold{' '}
                                    {formatRupiah(wallet.low_balance_threshold)}
                                </div>
                            )}
                        </div>
                    </div>

                    <aside className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <h3 className="text-[13px] font-bold text-slate-900">
                            Organisasi
                        </h3>
                        <div className="mt-3 space-y-2 text-[12.5px]">
                            <div className="flex items-center gap-2">
                                <Building2 className="size-3.5 text-slate-400" />
                                <span className="font-semibold text-slate-900">
                                    {organization.name}
                                </span>
                            </div>
                            {organization.contact_email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="size-3.5 text-slate-400" />
                                    <a
                                        href={`mailto:${organization.contact_email}`}
                                        className="text-brand-700 hover:underline"
                                    >
                                        {organization.contact_email}
                                    </a>
                                </div>
                            )}
                        </div>
                        <Link
                            href={`/admin/organization-wallets`}
                            className="mt-4 inline-flex items-center gap-1 text-[12px] text-slate-500 hover:text-slate-700"
                        >
                            <ArrowRight className="size-3.5 rotate-180" />
                            Kembali ke daftar
                        </Link>
                    </aside>
                </div>

                <div className="rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
                        <Receipt className="size-4 text-slate-500" />
                        <h3 className="text-[14px] font-bold text-slate-900">
                            Ledger Transaksi
                        </h3>
                    </div>

                    {transactions.data.length === 0 ? (
                        <div className="px-5 py-12 text-center text-[13px] text-slate-500">
                            Belum ada transaksi.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-[13px]">
                                <thead>
                                    <tr className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        <th className="px-5 py-2.5">Waktu</th>
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
                                            <tr key={tx.id} className="hover:bg-slate-50/60">
                                                <td className="px-5 py-3 text-slate-600">
                                                    {formatDateTime(tx.created_at)}
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

            <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Penyesuaian Saldo Manual</DialogTitle>
                        <DialogDescription>
                            Gunakan untuk koreksi atau pemberian kredit dari refund di
                            luar sistem. Tercatat di ledger.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div>
                            <Label htmlFor="direction">Tipe</Label>
                            <Select
                                value={direction}
                                onValueChange={(v) =>
                                    setDirection(v as 'credit' | 'debit')
                                }
                            >
                                <SelectTrigger id="direction">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="credit">
                                        Credit (tambah saldo)
                                    </SelectItem>
                                    <SelectItem value="debit">
                                        Debit (kurangi saldo)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="amount">Jumlah (Rupiah)</Label>
                            <RupiahInput
                                id="amount"
                                value={amount}
                                onChange={(value) => setAmount(value)}
                                onClear={() => setAmount('')}
                                placeholder="Rp 500.000"
                            />
                        </div>
                        <div>
                            <Label htmlFor="reason">Alasan</Label>
                            <Textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={3}
                                placeholder="Refund untuk order #ORD-..., dll"
                                maxLength={255}
                            />
                        </div>
                        {error && (
                            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-[12px] text-rose-700">
                                {error}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setAdjustOpen(false)}
                            disabled={saving}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={submit}
                            disabled={
                                saving || normalizedAmount <= 0 || reason.trim() === ''
                            }
                            className={cn(
                                'rounded-xl font-bold',
                                direction === 'credit'
                                    ? 'bg-emerald-600 hover:bg-emerald-700'
                                    : 'bg-rose-600 hover:bg-rose-700',
                            )}
                        >
                            {saving ? 'Memproses...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
