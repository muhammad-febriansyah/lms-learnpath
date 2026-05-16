import { Head, Link } from '@inertiajs/react';
import { Banknote, CreditCard, Receipt, TrendingUp, Wallet } from 'lucide-react';

import { IconChevR } from '@/components/learnpath-icons';
import { DateRangeFilter } from '@/components/reports/date-range-filter';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Range = { from: string; to: string; from_iso: string; to_iso: string };

type Totals = {
    gross_revenue: number;
    orders: number;
    aov: number;
    completed_payments: number;
    total_fee: number;
};

type MonthRow = { month: string; revenue: number; orders: number };

type GatewayRow = { gateway: string; c: number; revenue: number };

type CourseRow = {
    course_id: number;
    title: string;
    thumbnail: string | null;
    revenue: number;
    qty: number;
};

type Props = {
    range: Range;
    totals: Totals;
    byMonth: MonthRow[];
    byGateway: GatewayRow[];
    topCourses: CourseRow[];
};

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

function formatMonth(month: string): string {
    const [y, m] = month.split('-');
    const date = new Date(Number(y), Number(m) - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
}

function thumbUrl(path: string | null): string | undefined {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    return `/storage/${path}`;
}

export default function SalesReport({ range, totals, byMonth, byGateway, topCourses }: Props) {
    const maxMonthRevenue = Math.max(1, ...byMonth.map((m) => m.revenue));
    const totalGatewayRevenue = byGateway.reduce((sum, g) => sum + g.revenue, 0) || 1;
    const maxCourseRevenue = Math.max(1, ...topCourses.map((c) => c.revenue));
    const netRevenue = totals.gross_revenue - totals.total_fee;

    return (
        <>
            <Head title="Sales & Revenue Report" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="text-slate-500">Reports</span>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Sales & Revenue</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Sales & Revenue Report
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Pendapatan dari transaksi marketplace.
                    </p>
                </div>

                <DateRangeFilter from={range.from} to={range.to} basePath="/admin/reports/sales" />

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard
                        label="Gross Revenue"
                        value={formatRupiah(totals.gross_revenue)}
                        icon={Banknote}
                        tint="bg-emerald-50"
                        text="text-emerald-600"
                    />
                    <StatCard
                        label="Net Revenue"
                        value={formatRupiah(netRevenue)}
                        icon={TrendingUp}
                        tint="bg-brand-50"
                        text="text-brand-600"
                        hint={`Setelah fee ${formatRupiah(totals.total_fee)}`}
                    />
                    <StatCard
                        label="Order Berhasil"
                        value={totals.orders.toLocaleString('id-ID')}
                        icon={Receipt}
                        tint="bg-violet-50"
                        text="text-violet-600"
                    />
                    <StatCard
                        label="Avg Order Value"
                        value={formatRupiah(totals.aov)}
                        icon={Wallet}
                        tint="bg-amber-50"
                        text="text-amber-600"
                    />
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <h2 className="mb-4 text-[14px] font-bold text-slate-900">Revenue per Bulan</h2>
                    {byMonth.length === 0 ? (
                        <p className="py-8 text-center text-[12.5px] text-slate-500">
                            Belum ada transaksi berhasil pada periode ini.
                        </p>
                    ) : (
                        <div className="space-y-2.5">
                            {byMonth.map((row) => (
                                <div key={row.month} className="flex items-center gap-3">
                                    <div className="w-20 shrink-0 text-[11.5px] font-semibold text-slate-600">
                                        {formatMonth(row.month)}
                                    </div>
                                    <div className="relative h-8 flex-1 overflow-hidden rounded-lg bg-slate-50">
                                        <div
                                            className="h-full rounded-lg bg-gradient-to-r from-emerald-500 to-brand-500"
                                            style={{ width: `${(row.revenue / maxMonthRevenue) * 100}%` }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-end px-3 text-[11.5px]">
                                            <span className="font-bold tabular-nums text-slate-900">
                                                {formatRupiah(row.revenue)}
                                            </span>
                                            <span className="ml-2 text-slate-500">
                                                · {row.orders} order
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <h2 className="mb-4 inline-flex items-center gap-2 text-[14px] font-bold text-slate-900">
                            <CreditCard className="size-4 text-slate-500" />
                            Per Gateway
                        </h2>
                        {byGateway.length === 0 ? (
                            <p className="py-6 text-center text-[12.5px] text-slate-500">
                                Belum ada data.
                            </p>
                        ) : (
                            <ul className="space-y-3">
                                {byGateway.map((row) => {
                                    const pct = Math.round((row.revenue / totalGatewayRevenue) * 100);

                                    return (
                                        <li key={row.gateway}>
                                            <div className="mb-1 flex items-center justify-between">
                                                <Badge className="border-transparent bg-violet-50 font-semibold text-violet-700">
                                                    {row.gateway.toUpperCase()}
                                                </Badge>
                                                <div className="text-[12px] font-bold tabular-nums text-slate-900">
                                                    {formatRupiah(row.revenue)}
                                                </div>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full rounded-full bg-violet-500"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <div className="mt-1 flex justify-between text-[10.5px] text-slate-500">
                                                <span>{row.c} transaksi</span>
                                                <span>{pct}% of total</span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <h2 className="mb-4 text-[14px] font-bold text-slate-900">Top 10 Course Terjual</h2>
                        {topCourses.length === 0 ? (
                            <div className="py-8 text-center">
                                <Receipt className="mx-auto mb-3 size-6 text-slate-400" />
                                <p className="text-sm font-semibold text-slate-900">Belum ada penjualan</p>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {topCourses.map((row, idx) => (
                                    <li key={row.course_id} className="flex items-center gap-3">
                                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-amber-50 text-[11px] font-bold text-amber-700">
                                            {idx + 1}
                                        </span>
                                        <div
                                            className={cn(
                                                'h-10 w-14 shrink-0 overflow-hidden rounded-lg',
                                                !row.thumbnail && 'bg-gradient-to-br from-brand-400 to-violet-500',
                                            )}
                                            style={
                                                row.thumbnail
                                                    ? {
                                                          backgroundImage: `url(${thumbUrl(row.thumbnail)})`,
                                                          backgroundSize: 'cover',
                                                          backgroundPosition: 'center',
                                                      }
                                                    : undefined
                                            }
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-[12.5px] font-semibold text-slate-900">
                                                {row.title}
                                            </div>
                                            <div className="mt-0.5 text-[10.5px] text-slate-500">
                                                {row.qty} terjual
                                            </div>
                                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full rounded-full bg-amber-500"
                                                    style={{ width: `${(row.revenue / maxCourseRevenue) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <div className="text-[12.5px] font-extrabold text-emerald-600 tabular-nums leading-none">
                                                {formatRupiah(row.revenue)}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
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
    icon: typeof Banknote;
    tint: string;
    text: string;
    hint?: string;
}) {
    return (
        <div className="rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="flex items-center gap-3">
                <div className={`grid size-10 place-items-center rounded-xl ${tint} ${text}`}>
                    <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                    <div className="text-[11px] tracking-wider text-slate-500 uppercase">{label}</div>
                    <div className="truncate text-[16px] font-extrabold text-slate-900 tabular-nums">
                        {value}
                    </div>
                    {hint && <div className="truncate text-[10px] text-slate-400">{hint}</div>}
                </div>
            </div>
        </div>
    );
}
