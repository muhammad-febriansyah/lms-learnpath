import { Head, Link, useForm } from '@inertiajs/react';
import {
    Banknote,
    CheckCircle2,
    Clock,
    Hourglass,
    Send,
    TrendingUp,
    Wallet,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { FieldError } from '@/components/form/field-error';
import { RupiahInput } from '@/components/form/rupiah-input';
import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Summary = {
    gross: number;
    share: number;
    paid: number;
    locked: number;
    available: number;
};

type Config = {
    min_amount: number;
    fee_percent: number;
    share_percent: number;
};

type HistoryItem = {
    id: number;
    gross_amount: number;
    fee_amount: number;
    net_amount: number;
    bank_name: string;
    account_number: string;
    account_holder: string;
    status: 'pending' | 'approved' | 'rejected' | 'paid';
    admin_note: string | null;
    reject_reason: string | null;
    proof_url: string | null;
    created_at: string | null;
    paid_at: string | null;
};

type Bank = { bank_name: string; account_number: string; account_holder: string };

type Props = {
    summary: Summary;
    config: Config;
    history: HistoryItem[];
    lastBank: Bank | null;
};

function rupiah(n: number): string {
    return 'Rp ' + n.toLocaleString('id-ID');
}

function formatDateTime(iso: string | null): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

const STATUS_META: Record<HistoryItem['status'], { label: string; tint: string; icon: typeof Clock }> = {
    pending: { label: 'Menunggu', tint: 'bg-amber-50 text-amber-700', icon: Hourglass },
    approved: { label: 'Disetujui', tint: 'bg-sky-50 text-sky-700', icon: CheckCircle2 },
    rejected: { label: 'Ditolak', tint: 'bg-rose-50 text-rose-700', icon: XCircle },
    paid: { label: 'Lunas', tint: 'bg-emerald-50 text-emerald-700', icon: Banknote },
};

export default function MyEarningsIndex({ summary, config, history, lastBank }: Props) {
    return (
        <>
            <Head title="Pendapatan & Penarikan" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Pendapatan</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Pendapatan & Penarikan
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Pantau penghasilan dari penjualan course Anda dan ajukan penarikan dana.
                    </p>
                </div>

                {/* Hero card: available balance */}
                <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 p-6 text-white shadow-[0_18px_40px_-20px_rgba(18,35,125,0.6)]">
                    <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                        <div>
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10.5px] font-bold tracking-wider uppercase">
                                Saldo Tersedia
                            </div>
                            <div className="mt-3 text-4xl font-extrabold tracking-tight">
                                {rupiah(summary.available)}
                            </div>
                            <p className="mt-1 text-[12.5px] text-white/80">
                                Bagi hasil {config.share_percent}% dari penjualan, dikurangi yang
                                sudah ditarik dan tarikan tertunda.
                            </p>
                            <WithdrawDialog
                                available={summary.available}
                                config={config}
                                lastBank={lastBank}
                            />
                        </div>
                        <div className="hidden md:block">
                            <div className="grid size-32 place-items-center rounded-full bg-white/10 backdrop-blur">
                                <Wallet className="size-14 text-white/90" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Breakdown */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Penjualan Kotor"
                        value={rupiah(summary.gross)}
                        icon={TrendingUp}
                        tint="bg-emerald-50"
                        text="text-emerald-600"
                        hint="Total semua waktu"
                    />
                    <StatCard
                        label={`Bagi Hasil (${config.share_percent}%)`}
                        value={rupiah(summary.share)}
                        icon={Banknote}
                        tint="bg-brand-50"
                        text="text-brand-600"
                        hint="Pendapatan Anda"
                    />
                    <StatCard
                        label="Sudah Ditarik"
                        value={rupiah(summary.paid)}
                        icon={CheckCircle2}
                        tint="bg-sky-50"
                        text="text-sky-600"
                        hint="Net diterima"
                    />
                    <StatCard
                        label="Sedang Diproses"
                        value={rupiah(summary.locked)}
                        icon={Hourglass}
                        tint="bg-amber-50"
                        text="text-amber-600"
                        hint="Menunggu / disetujui"
                    />
                </div>

                {/* History */}
                <div className="rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <div>
                            <h2 className="text-[14px] font-bold text-slate-900">
                                Riwayat Penarikan
                            </h2>
                            <p className="text-[12px] text-slate-500">
                                20 transaksi terakhir.
                            </p>
                        </div>
                    </div>

                    {history.length === 0 ? (
                        <div className="px-5 py-16 text-center">
                            <Banknote className="mx-auto mb-3 size-7 text-slate-400" />
                            <p className="text-sm font-semibold text-slate-900">
                                Belum ada penarikan
                            </p>
                            <p className="mt-1 text-[12.5px] text-slate-500">
                                Tarik dana saat saldo Anda mencapai minimum {rupiah(config.min_amount)}.
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {history.map((h) => (
                                <HistoryRow key={h.id} item={h} />
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
}

function StatCard({
    label,
    value,
    icon: Icon,
    tint,
    text,
    hint,
}: {
    label: string;
    value: string;
    icon: typeof Wallet;
    tint: string;
    text: string;
    hint?: string;
}) {
    return (
        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="flex items-start justify-between">
                <div className="text-[11.5px] font-semibold tracking-wider text-slate-500 uppercase">
                    {label}
                </div>
                <div className={`grid size-8 place-items-center rounded-lg ${tint} ${text}`}>
                    <Icon className="size-4" />
                </div>
            </div>
            <div className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">
                {value}
            </div>
            {hint && <div className="mt-0.5 text-[11px] text-slate-500">{hint}</div>}
        </div>
    );
}

function HistoryRow({ item }: { item: HistoryItem }) {
    const meta = STATUS_META[item.status];
    const Icon = meta.icon;

    return (
        <li className="px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <Badge className={cn('border-transparent text-[10.5px]', meta.tint)}>
                            <Icon className="mr-1 size-3" />
                            {meta.label}
                        </Badge>
                        <span className="text-[12px] text-slate-500">
                            {formatDateTime(item.created_at)}
                        </span>
                    </div>
                    <div className="mt-1 text-[15px] font-bold text-slate-900">
                        {rupiah(item.gross_amount)}
                        {item.fee_amount > 0 && (
                            <span className="ml-2 text-[12.5px] font-normal text-slate-500">
                                − fee {rupiah(item.fee_amount)} = {rupiah(item.net_amount)}
                            </span>
                        )}
                    </div>
                    <div className="mt-1 text-[12.5px] text-slate-600">
                        {item.bank_name} · {item.account_number}{' '}
                        <span className="text-slate-500">a/n {item.account_holder}</span>
                    </div>
                    {item.reject_reason && (
                        <div className="mt-2 rounded-lg bg-rose-50 p-2 text-[12px] text-rose-700 ring-1 ring-rose-200">
                            <b>Alasan ditolak:</b> {item.reject_reason}
                        </div>
                    )}
                    {item.admin_note && !item.reject_reason && (
                        <div className="mt-2 rounded-lg bg-slate-50 p-2 text-[12px] text-slate-600 ring-1 ring-slate-200">
                            <b>Catatan admin:</b> {item.admin_note}
                        </div>
                    )}
                </div>
                {item.proof_url && (
                    <a
                        href={item.proof_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-[11.5px] font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                        Lihat Bukti Transfer
                    </a>
                )}
            </div>
        </li>
    );
}

function WithdrawDialog({
    available,
    config,
    lastBank,
}: {
    available: number;
    config: Config;
    lastBank: Bank | null;
}) {
    const [open, setOpen] = useState(false);

    const form = useForm({
        gross_amount: '' as number | '',
        bank_name: lastBank?.bank_name ?? '',
        account_number: lastBank?.account_number ?? '',
        account_holder: lastBank?.account_holder ?? '',
    });

    const amount = typeof form.data.gross_amount === 'number' ? form.data.gross_amount : 0;

    const quote = useMemo(() => {
        const fee = Math.round((amount * config.fee_percent) / 100);
        const cappedFee = Math.min(fee, amount);

        return { fee: cappedFee, net: amount - cappedFee };
    }, [amount, config]);

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post('/admin/my-earnings/withdraw', {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
        });
    }

    const isDisabled = available < config.min_amount;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    disabled={isDisabled}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13.5px] font-bold text-brand-700 shadow-sm transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Send className="size-4" />
                    {isDisabled
                        ? `Min. ${rupiah(config.min_amount)} untuk tarik`
                        : 'Tarik Dana'}
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Tarik Dana</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label htmlFor="gross_amount">Jumlah penarikan</Label>
                        <RupiahInput
                            id="gross_amount"
                            placeholder={`Min ${rupiah(config.min_amount)}`}
                            value={form.data.gross_amount}
                            onChange={(value) => form.setData('gross_amount', value)}
                            onClear={() => form.setData('gross_amount', '')}
                        />
                        <p className="mt-1 text-[11.5px] text-slate-500">
                            Saldo tersedia: <b>{rupiah(available)}</b>
                        </p>
                        <FieldError message={form.errors.gross_amount} />
                    </div>

                    {amount >= config.min_amount && config.fee_percent > 0 && (
                        <div className="rounded-xl bg-slate-50 p-3 text-[12.5px] ring-1 ring-slate-200">
                            <div className="flex justify-between text-slate-600">
                                <span>Jumlah</span>
                                <span>{rupiah(amount)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Fee ({config.fee_percent}%)</span>
                                <span className="text-rose-600">− {rupiah(quote.fee)}</span>
                            </div>
                            <div className="mt-1 flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-900">
                                <span>Anda terima</span>
                                <span>{rupiah(quote.net)}</span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="bank_name">Bank</Label>
                        <Input
                            id="bank_name"
                            placeholder="BCA, Mandiri, BNI, dll."
                            value={form.data.bank_name}
                            onChange={(e) => form.setData('bank_name', e.target.value)}
                        />
                        <FieldError message={form.errors.bank_name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="account_number">Nomor rekening</Label>
                        <Input
                            id="account_number"
                            placeholder="1234567890"
                            value={form.data.account_number}
                            onChange={(e) => form.setData('account_number', e.target.value)}
                        />
                        <FieldError message={form.errors.account_number} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="account_holder">Atas nama</Label>
                        <Input
                            id="account_holder"
                            placeholder="Nama pemegang rekening"
                            value={form.data.account_holder}
                            onChange={(e) => form.setData('account_holder', e.target.value)}
                        />
                        <FieldError message={form.errors.account_holder} />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="bg-brand-600 hover:bg-brand-700"
                        >
                            <Send className="mr-1.5 size-4" />
                            {form.processing ? 'Mengirim...' : 'Ajukan Penarikan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
