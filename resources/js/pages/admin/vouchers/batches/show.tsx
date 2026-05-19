import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Copy, Download, Package } from 'lucide-react';
import { toast } from 'sonner';

import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Batch = {
    id: number;
    name: string;
    prefix: string | null;
    grant_kind: string;
    grantable_title: string | null;
    points_amount: number | null;
    valid_from: string | null;
    valid_until: string | null;
    total_codes: number;
    redeemed_count: number;
    single_use_per_user: boolean;
    is_active: boolean;
    note: string | null;
    creator: { id: number; name: string } | null;
    created_at: string | null;
};

type Voucher = {
    id: number;
    code: string;
    used: boolean;
    is_active: boolean;
};

type Props = {
    batch: Batch;
    vouchers: Voucher[];
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

function formatDate(iso: string | null): string {
    if (!iso) {
        return '∞';
    }
    return new Date(iso).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function BatchShow({ batch, vouchers }: Props) {
    const remaining = batch.total_codes - batch.redeemed_count;
    const usagePct =
        batch.total_codes > 0
            ? Math.round((batch.redeemed_count / batch.total_codes) * 100)
            : 0;

    const copyCode = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            toast.success(`${code} disalin`);
        } catch {
            toast.error('Gagal menyalin');
        }
    };

    return (
        <>
            <Head title={`Batch ${batch.name}`} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/vouchers" className="hover:text-slate-700">
                            Voucher Akses
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <Link
                            href="/admin/voucher-batches"
                            className="hover:text-slate-700"
                        >
                            Batch
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">{batch.name}</span>
                    </nav>
                </div>

                {/* Hero */}
                <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-6 ring-1 ring-amber-200">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700 backdrop-blur">
                                <Package className="size-3" />
                                Batch Voucher
                            </div>
                            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
                                {batch.name}
                            </h1>
                            <p className="mt-1 text-[13px] text-slate-600">
                                {KIND_LABEL[batch.grant_kind]} ·{' '}
                                {batch.grant_kind === 'points'
                                    ? `${formatNumber(batch.points_amount ?? 0)} poin/kode`
                                    : batch.grantable_title ?? '-'}
                            </p>
                            {batch.prefix && (
                                <Badge variant="outline" className="mt-2 font-mono">
                                    Prefix: {batch.prefix}-
                                </Badge>
                            )}
                        </div>
                        <div className="flex shrink-0 gap-2">
                            {batch.is_active ? (
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

                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <Metric label="Total Kode" value={formatNumber(batch.total_codes)} />
                        <Metric
                            label="Sudah Dipakai"
                            value={formatNumber(batch.redeemed_count)}
                            tone="amber"
                        />
                        <Metric
                            label="Tersisa"
                            value={formatNumber(remaining)}
                            tone="emerald"
                        />
                        <Metric label="Berlaku" value={`${formatDate(batch.valid_from)} → ${formatDate(batch.valid_until)}`} />
                    </div>

                    <div className="mt-4">
                        <div className="flex items-center justify-between text-[11.5px] text-slate-600">
                            <span>Progress pemakaian</span>
                            <span className="font-bold">{usagePct}%</span>
                        </div>
                        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/60">
                            <div
                                className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                                style={{ width: `${usagePct}%` }}
                            />
                        </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                        <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                            <a href={`/admin/voucher-batches/${batch.id}/export`}>
                                <Download className="mr-1.5 size-4" />
                                Download CSV
                            </a>
                        </Button>
                        <Button asChild variant="outline" className="rounded-xl">
                            <Link href="/admin/voucher-batches">
                                <ArrowLeft className="mr-1.5 size-4" />
                                Batch lain
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Code grid */}
                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <h2 className="text-[15px] font-bold text-slate-900">
                        Daftar Kode (200 pertama)
                    </h2>
                    <p className="mt-0.5 text-[12.5px] text-slate-500">
                        Download CSV untuk daftar lengkap.
                    </p>

                    {vouchers.length === 0 ? (
                        <div className="mt-6 py-8 text-center text-[13px] text-slate-500">
                            Belum ada kode di batch ini.
                        </div>
                    ) : (
                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                            {vouchers.map((v) => (
                                <button
                                    key={v.id}
                                    type="button"
                                    onClick={() => copyCode(v.code)}
                                    className={cn(
                                        'group flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition hover:border-brand-300 hover:bg-brand-50',
                                        v.used
                                            ? 'border-slate-200 bg-slate-50 opacity-60'
                                            : v.is_active
                                              ? 'border-slate-200 bg-white'
                                              : 'border-slate-200 bg-slate-50',
                                    )}
                                    title={v.used ? 'Sudah dipakai' : 'Klik untuk salin'}
                                >
                                    <span className="font-mono text-[12px] font-bold tracking-wide text-slate-900">
                                        {v.code}
                                    </span>
                                    {v.used ? (
                                        <Badge className="border-slate-300 bg-slate-100 text-[9.5px] text-slate-500">
                                            used
                                        </Badge>
                                    ) : (
                                        <Copy className="size-3 text-slate-300 group-hover:text-brand-500" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function Metric({
    label,
    value,
    tone,
}: {
    label: string;
    value: string;
    tone?: 'amber' | 'emerald';
}) {
    return (
        <div className="rounded-xl bg-white/70 p-3 backdrop-blur">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                {label}
            </div>
            <div
                className={cn(
                    'mt-0.5 text-[15px] font-extrabold tabular-nums',
                    tone === 'amber' && 'text-amber-700',
                    tone === 'emerald' && 'text-emerald-700',
                    !tone && 'text-slate-900',
                )}
            >
                {value}
            </div>
        </div>
    );
}
