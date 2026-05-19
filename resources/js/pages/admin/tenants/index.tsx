import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Building2,
    CalendarClock,
    CheckCircle2,
    Eye,
    PauseCircle,
    PlayCircle,
    Search,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import {
    DataTablePagination,
    type Paginator,
} from '@/components/data-table/data-table-pagination';
import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type Tenant = {
    id: number;
    name: string;
    display_name: string | null;
    slug: string;
    tagline: string | null;
    logo_url: string | null;
    industry: string | null;
    status: 'active' | 'suspended' | string;
    seat_quota: number;
    seats_used: number;
    members_count: number;
    contract_ends_at: string | null;
    contract_days_remaining: number | null;
    contract_expiring_soon: boolean;
    contract_expired: boolean;
    created_at: string | null;
    plan: { id: number; name: string; code: string } | null;
};

type Stats = {
    total: number;
    active: number;
    suspended: number;
    expiring_soon: number;
    total_seats: number;
    used_seats: number;
};

type Props = {
    tenants: Paginator<Tenant>;
    filters: { search?: string; status?: string };
    stats: Stats;
};

const STATUS_META: Record<
    string,
    { label: string; tone: string; icon: typeof CheckCircle2 }
> = {
    active: {
        label: 'Aktif',
        tone: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        icon: CheckCircle2,
    },
    suspended: {
        label: 'Disuspend',
        tone: 'bg-rose-50 text-rose-700 ring-rose-200',
        icon: PauseCircle,
    },
};

function initials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? '')
        .join('');
}

function formatDate(iso: string | null): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function TenantsIndex({ tenants, filters, stats }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    useEffect(() => {
        const id = setTimeout(() => {
            if ((filters.search ?? '') === search) return;
            router.get(
                '/admin/tenants',
                { ...filters, search: search || undefined },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 300);
        return () => clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const handleStatus = (status: string | undefined) => {
        router.get(
            '/admin/tenants',
            { ...filters, status: status || undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const seatPct =
        stats.total_seats > 0
            ? Math.round((stats.used_seats / stats.total_seats) * 100)
            : 0;

    return (
        <>
            <Head title="Tenant Management" />

            <div className="space-y-5">
                <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500 dark:text-neutral-400">
                    <Link
                        href="/admin/dashboard"
                        className="transition hover:text-slate-700 dark:hover:text-neutral-200"
                    >
                        Dashboard
                    </Link>
                    <IconChevR size={12} className="text-slate-300" />
                    <span className="font-semibold text-slate-900 dark:text-neutral-100">
                        Tenant
                    </span>
                </nav>

                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-neutral-100">
                        Tenant Management
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500 dark:text-neutral-400">
                        Kelola seluruh perusahaan klien yang berlangganan
                        platform.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                    <StatCard
                        icon={<Building2 className="size-4" />}
                        label="Total Tenant"
                        value={stats.total}
                        tone="indigo"
                    />
                    <StatCard
                        icon={<CheckCircle2 className="size-4" />}
                        label="Aktif"
                        value={stats.active}
                        tone="emerald"
                    />
                    <StatCard
                        icon={<PauseCircle className="size-4" />}
                        label="Disuspend"
                        value={stats.suspended}
                        tone="rose"
                    />
                    <StatCard
                        icon={<AlertTriangle className="size-4" />}
                        label="Kontrak ≤30 hari"
                        value={stats.expiring_soon}
                        tone="amber"
                    />
                    <div className="col-span-2 rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:col-span-4 lg:col-span-1 dark:ring-neutral-800">
                        <div className="flex items-center justify-between text-[10.5px] font-semibold tracking-wider text-slate-500 uppercase dark:text-neutral-400">
                            <span>Seat Usage</span>
                            <span className="tabular-nums">
                                {stats.used_seats.toLocaleString('id-ID')}/
                                {stats.total_seats.toLocaleString('id-ID')}
                            </span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-neutral-800">
                            <div
                                className={cn(
                                    'h-full rounded-full transition-all',
                                    seatPct >= 90
                                        ? 'bg-rose-500'
                                        : seatPct >= 70
                                          ? 'bg-amber-500'
                                          : 'bg-emerald-500',
                                )}
                                style={{ width: `${seatPct}%` }}
                            />
                        </div>
                        <div className="mt-1.5 text-[11px] text-slate-500 dark:text-neutral-400">
                            {seatPct}% terpakai
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="rounded-2xl bg-card p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 dark:ring-neutral-800">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama tenant, slug, atau email kontak..."
                                className="h-10 rounded-xl border-slate-200 bg-slate-50/60 pl-9 dark:border-neutral-800 dark:bg-neutral-900/60"
                            />
                        </div>
                        <Select
                            value={filters.status ?? 'all'}
                            onValueChange={(v) =>
                                handleStatus(v === 'all' ? undefined : v)
                            }
                        >
                            <SelectTrigger className="h-10 w-full rounded-xl sm:w-[180px]">
                                <SelectValue placeholder="Semua status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua status</SelectItem>
                                <SelectItem value="active">Aktif</SelectItem>
                                <SelectItem value="suspended">
                                    Disuspend
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* List */}
                {tenants.data.length === 0 ? (
                    <div className="rounded-2xl bg-card px-6 py-16 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 dark:ring-neutral-800">
                        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg">
                            <Building2 className="size-6" />
                        </div>
                        <h3 className="mt-4 text-[15px] font-extrabold text-slate-900 dark:text-neutral-100">
                            Belum ada tenant
                        </h3>
                        <p className="mt-1 text-[12.5px] text-slate-500 dark:text-neutral-400">
                            Tidak ada tenant yang cocok dengan filter ini.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tenants.data.map((t) => (
                            <TenantRow key={t.id} tenant={t} />
                        ))}
                    </div>
                )}

                {tenants.data.length > 0 && (
                    <div className="rounded-2xl bg-card p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 dark:ring-neutral-800">
                        <DataTablePagination paginator={tenants} />
                    </div>
                )}
            </div>
        </>
    );
}

function StatCard({
    icon,
    label,
    value,
    tone,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    tone: 'indigo' | 'emerald' | 'rose' | 'amber';
}) {
    const tones: Record<typeof tone, string> = {
        indigo: 'bg-brand-50 text-brand-700 ring-brand-100 dark:bg-brand-500/15 dark:text-brand-300',
        emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300',
        rose: 'bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-500/15 dark:text-rose-300',
        amber: 'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-500/15 dark:text-amber-300',
    };
    return (
        <div className="rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 dark:ring-neutral-800">
            <div className="flex items-center justify-between gap-2">
                <span className="text-[10.5px] font-semibold tracking-wider text-slate-500 uppercase dark:text-neutral-400">
                    {label}
                </span>
                <span
                    className={cn(
                        'grid size-7 place-items-center rounded-lg ring-1',
                        tones[tone],
                    )}
                >
                    {icon}
                </span>
            </div>
            <div className="mt-2 text-[22px] font-extrabold text-slate-900 tabular-nums dark:text-neutral-100">
                {value.toLocaleString('id-ID')}
            </div>
        </div>
    );
}

function TenantRow({ tenant }: { tenant: Tenant }) {
    const status = STATUS_META[tenant.status] ?? {
        label: tenant.status,
        tone: 'bg-slate-100 text-slate-700 ring-slate-200',
        icon: CheckCircle2,
    };
    const StatusIcon = status.icon;
    const seatPct =
        tenant.seat_quota > 0
            ? Math.round((tenant.seats_used / tenant.seat_quota) * 100)
            : 0;
    const seatTone =
        seatPct >= 90
            ? 'bg-rose-500'
            : seatPct >= 70
              ? 'bg-amber-500'
              : 'bg-emerald-500';

    const toggle = () => {
        const path =
            tenant.status === 'active' ? 'suspend' : 'activate';
        if (
            !window.confirm(
                `${tenant.status === 'active' ? 'Suspend' : 'Aktifkan'} tenant ${tenant.name}?`,
            )
        )
            return;
        router.post(
            `/admin/tenants/${tenant.id}/${path}`,
            {},
            { preserveScroll: true },
        );
    };

    return (
        <div className="group rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 transition hover:ring-brand-200 dark:ring-neutral-800 dark:hover:ring-brand-500/40">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                {/* Identity */}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    {tenant.logo_url ? (
                        <img
                            src={tenant.logo_url}
                            alt={tenant.name}
                            className="size-12 shrink-0 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-neutral-800"
                        />
                    ) : (
                        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-[14px] font-bold text-white">
                            {initials(tenant.display_name ?? tenant.name)}
                        </span>
                    )}
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <Link
                                href={`/admin/tenants/${tenant.id}`}
                                className="text-[14px] font-bold text-slate-900 transition hover:text-brand-700 dark:text-neutral-100 dark:hover:text-brand-300"
                            >
                                {tenant.display_name ?? tenant.name}
                            </Link>
                            <span
                                className={cn(
                                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ring-1 ring-inset',
                                    status.tone,
                                )}
                            >
                                <StatusIcon className="size-3" />
                                {status.label}
                            </span>
                        </div>
                        <div className="mt-0.5 truncate text-[11.5px] text-slate-500 dark:text-neutral-400">
                            {tenant.slug} · {tenant.industry ?? 'Umum'}
                        </div>
                    </div>
                </div>

                {/* Plan */}
                <div className="lg:w-[140px]">
                    <div className="text-[10.5px] font-semibold tracking-wider text-slate-500 uppercase dark:text-neutral-400">
                        Plan
                    </div>
                    <div className="mt-0.5 text-[12.5px] font-bold text-slate-900 dark:text-neutral-100">
                        {tenant.plan ? (
                            <Badge className="border-transparent bg-brand-50 px-2 py-0.5 text-[11px] text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                                {tenant.plan.name}
                            </Badge>
                        ) : (
                            <span className="text-slate-400 italic">
                                Belum ada
                            </span>
                        )}
                    </div>
                </div>

                {/* Seats */}
                <div className="lg:w-[180px]">
                    <div className="flex items-center justify-between gap-2 text-[10.5px] font-semibold tracking-wider text-slate-500 uppercase dark:text-neutral-400">
                        <span>Seat</span>
                        <span className="tabular-nums">
                            {tenant.seats_used}/{tenant.seat_quota}
                        </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-neutral-800">
                        <div
                            className={cn(
                                'h-full rounded-full transition-all',
                                seatTone,
                            )}
                            style={{ width: `${Math.min(100, seatPct)}%` }}
                        />
                    </div>
                </div>

                {/* Contract */}
                <div className="lg:w-[150px]">
                    <div className="text-[10.5px] font-semibold tracking-wider text-slate-500 uppercase dark:text-neutral-400">
                        Kontrak
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-[12px] text-slate-700 dark:text-neutral-300">
                        <CalendarClock className="size-3 text-slate-400" />
                        {formatDate(tenant.contract_ends_at)}
                    </div>
                    {tenant.contract_expired ? (
                        <span className="mt-0.5 inline-block text-[10.5px] font-semibold text-rose-600 dark:text-rose-400">
                            Sudah berakhir
                        </span>
                    ) : tenant.contract_expiring_soon ? (
                        <span className="mt-0.5 inline-block text-[10.5px] font-semibold text-amber-600 dark:text-amber-400">
                            {tenant.contract_days_remaining} hari lagi
                        </span>
                    ) : tenant.contract_days_remaining !== null ? (
                        <span className="mt-0.5 inline-block text-[10.5px] text-slate-500 dark:text-neutral-400">
                            {tenant.contract_days_remaining} hari lagi
                        </span>
                    ) : null}
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1.5">
                    <Button
                        asChild
                        size="sm"
                        className="h-8 rounded-xl bg-sky-600 text-white shadow-sm hover:bg-sky-700"
                    >
                        <Link href={`/admin/tenants/${tenant.id}`}>
                            <Eye className="mr-1 size-3.5" />
                            Lihat
                        </Link>
                    </Button>
                    <Button
                        size="sm"
                        onClick={toggle}
                        className={cn(
                            'h-8 rounded-xl text-white shadow-sm',
                            tenant.status === 'active'
                                ? 'bg-rose-600 hover:bg-rose-700'
                                : 'bg-emerald-600 hover:bg-emerald-700',
                        )}
                    >
                        {tenant.status === 'active' ? (
                            <>
                                <PauseCircle className="mr-1 size-3.5" />
                                Suspend
                            </>
                        ) : (
                            <>
                                <PlayCircle className="mr-1 size-3.5" />
                                Aktifkan
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
