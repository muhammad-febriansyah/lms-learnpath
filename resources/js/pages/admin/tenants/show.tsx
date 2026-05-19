import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Briefcase,
    Building2,
    CalendarClock,
    CheckCircle2,
    CreditCard,
    Crown,
    Mail,
    MapPin,
    PauseCircle,
    Phone,
    PlayCircle,
    User as UserIcon,
    Users,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

import { IconChevR } from '@/components/learnpath-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { cn } from '@/lib/utils';

type Plan = { id: number; name: string; code: string };
type Wallet = { balance: number };

type Tenant = {
    id: number;
    name: string;
    display_name: string | null;
    slug: string;
    tagline: string | null;
    logo_url: string | null;
    industry: string | null;
    size_range: string | null;
    status: 'active' | 'suspended' | string;
    contact_name: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    address: string | null;
    seat_quota: number;
    seats_used: number;
    seats_available: number;
    contract_ends_at: string | null;
    contract_days_remaining: number | null;
    contract_expiring_soon: boolean;
    contract_expired: boolean;
    created_at: string | null;
    plan: Plan | null;
    wallet: Wallet | null;
    members_count: number;
    invitations_count: number;
};

type Admin = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    joined_at: string | null;
};

type Member = {
    id: number;
    name: string;
    email: string;
    role: string;
    joined_at: string | null;
};

type Props = {
    tenant: Tenant;
    admins: Admin[];
    recent_members: Member[];
};

function initials(name: string | null | undefined): string {
    if (!name) return '?';
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

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

export default function TenantShow({
    tenant,
    admins,
    recent_members,
}: Props) {
    const [confirmOpen, setConfirmOpen] = useState(false);

    const isActive = tenant.status === 'active';
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

    const toggleStatus = () => {
        const path = isActive ? 'suspend' : 'activate';
        router.post(
            `/admin/tenants/${tenant.id}/${path}`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setConfirmOpen(false),
            },
        );
    };

    return (
        <>
            <Head title={`Tenant · ${tenant.name}`} />

            <div className="space-y-6">
                <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500 dark:text-neutral-400">
                    <Link
                        href="/admin/dashboard"
                        className="transition hover:text-slate-700 dark:hover:text-neutral-200"
                    >
                        Dashboard
                    </Link>
                    <IconChevR size={12} className="text-slate-300" />
                    <Link
                        href="/admin/tenants"
                        className="transition hover:text-slate-700 dark:hover:text-neutral-200"
                    >
                        Tenant
                    </Link>
                    <IconChevR size={12} className="text-slate-300" />
                    <span className="font-semibold text-slate-900 dark:text-neutral-100">
                        {tenant.name}
                    </span>
                </nav>

                {/* Hero */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950 p-6 text-white shadow-[0_10px_40px_-20px_rgba(15,23,42,0.5)] sm:p-8">
                    <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-brand-500/20 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-brand-500/10 blur-3xl" />

                    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex min-w-0 flex-1 items-start gap-4">
                            {tenant.logo_url ? (
                                <img
                                    src={tenant.logo_url}
                                    alt={tenant.name}
                                    className="size-20 shrink-0 rounded-2xl object-cover ring-4 ring-white/10 sm:size-24"
                                />
                            ) : (
                                <span className="grid size-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-[22px] font-bold text-white ring-4 ring-white/10 sm:size-24">
                                    {initials(
                                        tenant.display_name ?? tenant.name,
                                    )}
                                </span>
                            )}

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className={cn(
                                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset backdrop-blur',
                                            isActive
                                                ? 'bg-emerald-50/15 text-emerald-100 ring-emerald-300/30'
                                                : 'bg-rose-50/15 text-rose-100 ring-rose-300/30',
                                        )}
                                    >
                                        {isActive ? (
                                            <CheckCircle2 className="size-3" />
                                        ) : (
                                            <PauseCircle className="size-3" />
                                        )}
                                        {isActive ? 'Aktif' : 'Disuspend'}
                                    </span>
                                    {tenant.plan && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-400/20 px-2.5 py-1 text-[11px] font-semibold text-brand-100 ring-1 ring-inset ring-brand-300/30 backdrop-blur">
                                            <Crown className="size-3.5" />
                                            {tenant.plan.name}
                                        </span>
                                    )}
                                </div>
                                <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                                    {tenant.display_name ?? tenant.name}
                                </h1>
                                {tenant.tagline && (
                                    <p className="mt-1 text-[13.5px] text-white/70">
                                        {tenant.tagline}
                                    </p>
                                )}
                                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-white/60">
                                    <span className="font-mono">
                                        {tenant.slug}
                                    </span>
                                    {tenant.industry && (
                                        <span className="inline-flex items-center gap-1.5">
                                            <Briefcase className="size-3.5" />
                                            {tenant.industry}
                                        </span>
                                    )}
                                    {tenant.size_range && (
                                        <span>{tenant.size_range}</span>
                                    )}
                                    <span className="inline-flex items-center gap-1.5">
                                        <CalendarClock className="size-3.5" />
                                        Bergabung{' '}
                                        {formatDate(tenant.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-start gap-2 lg:shrink-0">
                            <Button
                                asChild
                                variant="outline"
                                className="rounded-xl border-white/15 bg-white/10 text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white/20 hover:text-white"
                            >
                                <Link href="/admin/tenants">
                                    <ArrowLeft className="mr-1.5 size-4" />
                                    Kembali
                                </Link>
                            </Button>
                            <Button
                                onClick={() => setConfirmOpen(true)}
                                className={cn(
                                    'rounded-xl text-white shadow-sm transition',
                                    isActive
                                        ? 'bg-rose-500 hover:bg-rose-600'
                                        : 'bg-emerald-500 hover:bg-emerald-600',
                                )}
                            >
                                {isActive ? (
                                    <>
                                        <PauseCircle className="mr-1.5 size-4" />
                                        Suspend
                                    </>
                                ) : (
                                    <>
                                        <PlayCircle className="mr-1.5 size-4" />
                                        Aktifkan
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <HeroStat
                            icon={<Users className="size-4" />}
                            label="Anggota"
                            value={tenant.members_count.toLocaleString('id-ID')}
                        />
                        <HeroStat
                            icon={<Mail className="size-4" />}
                            label="Undangan"
                            value={tenant.invitations_count.toLocaleString(
                                'id-ID',
                            )}
                        />
                        <HeroStat
                            icon={<CreditCard className="size-4" />}
                            label="Seat"
                            value={`${tenant.seats_used}/${tenant.seat_quota}`}
                        />
                        <HeroStat
                            icon={<Wallet className="size-4" />}
                            label="E-Wallet"
                            value={
                                tenant.wallet
                                    ? formatRupiah(tenant.wallet.balance)
                                    : '-'
                            }
                        />
                    </div>
                </div>

                {/* Contract warning */}
                {tenant.contract_expired && (
                    <div className="flex items-start gap-3 rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-200 dark:bg-rose-500/10 dark:ring-rose-500/30">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-500 text-white shadow-sm">
                            <AlertTriangle className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="text-[10.5px] font-bold tracking-wider text-rose-700 uppercase dark:text-rose-300">
                                Kontrak Berakhir
                            </div>
                            <div className="text-[14.5px] font-extrabold text-slate-900 dark:text-neutral-100">
                                Kontrak tenant sudah berakhir
                            </div>
                            <p className="mt-0.5 text-[12px] text-slate-600 dark:text-neutral-400">
                                Berakhir pada{' '}
                                {formatDate(tenant.contract_ends_at)}. Tenant
                                mungkin perlu di-suspend atau diperpanjang.
                            </p>
                        </div>
                    </div>
                )}
                {tenant.contract_expiring_soon && !tenant.contract_expired && (
                    <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:ring-amber-500/30">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500 text-white shadow-sm">
                            <AlertTriangle className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="text-[10.5px] font-bold tracking-wider text-amber-700 uppercase dark:text-amber-300">
                                Kontrak Hampir Habis
                            </div>
                            <div className="text-[14.5px] font-extrabold text-slate-900 dark:text-neutral-100">
                                {tenant.contract_days_remaining} hari lagi
                                kontrak berakhir
                            </div>
                            <p className="mt-0.5 text-[12px] text-slate-600 dark:text-neutral-400">
                                Berakhir{' '}
                                {formatDate(tenant.contract_ends_at)} —
                                pertimbangkan untuk follow up perpanjangan.
                            </p>
                        </div>
                    </div>
                )}

                {/* Body */}
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                    {/* Main */}
                    <div className="min-w-0 space-y-5">
                        <Card
                            title="Seat Utilization"
                            icon={<CreditCard className="size-4" />}
                        >
                            <div className="space-y-3">
                                <div className="flex items-baseline justify-between">
                                    <span className="text-[13px] text-slate-600 dark:text-neutral-400">
                                        Terpakai
                                    </span>
                                    <span className="text-[20px] font-extrabold text-slate-900 tabular-nums dark:text-neutral-100">
                                        {tenant.seats_used.toLocaleString(
                                            'id-ID',
                                        )}
                                        <span className="text-[13px] font-normal text-slate-400">
                                            {' / '}
                                            {tenant.seat_quota.toLocaleString(
                                                'id-ID',
                                            )}
                                        </span>
                                    </span>
                                </div>
                                <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-neutral-800">
                                    <div
                                        className={cn(
                                            'h-full rounded-full transition-all',
                                            seatTone,
                                        )}
                                        style={{ width: `${seatPct}%` }}
                                    />
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
                                    <span className="text-slate-500 dark:text-neutral-400">
                                        {seatPct}% terpakai · Tersedia{' '}
                                        <strong className="text-slate-900 dark:text-neutral-100">
                                            {tenant.seats_available.toLocaleString(
                                                'id-ID',
                                            )}
                                        </strong>{' '}
                                        seat
                                    </span>
                                    {seatPct >= 90 && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                                            <AlertTriangle className="size-3" />
                                            Hampir penuh
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Card>

                        <Card
                            title="Admin Tenant"
                            icon={<UserIcon className="size-4" />}
                            badge={
                                admins.length > 0
                                    ? `${admins.length} admin`
                                    : undefined
                            }
                        >
                            {admins.length === 0 ? (
                                <EmptyHint text="Tenant ini belum punya admin." />
                            ) : (
                                <ul className="divide-y divide-slate-100 dark:divide-neutral-800">
                                    {admins.map((a) => (
                                        <li
                                            key={a.id}
                                            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                                        >
                                            <Avatar className="size-10 shrink-0 ring-1 ring-slate-200 dark:ring-neutral-800">
                                                {a.avatar && (
                                                    <AvatarImage
                                                        src={a.avatar}
                                                        alt={a.name}
                                                    />
                                                )}
                                                <AvatarFallback className="bg-gradient-to-br from-brand-500 to-brand-600 text-[12px] font-bold text-white">
                                                    {initials(a.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-[13px] font-bold text-slate-900 dark:text-neutral-100">
                                                    {a.name}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 dark:text-neutral-400">
                                                    <span className="inline-flex items-center gap-1">
                                                        <Mail className="size-3" />
                                                        {a.email}
                                                    </span>
                                                    {a.phone && (
                                                        <span className="inline-flex items-center gap-1">
                                                            <Phone className="size-3" />
                                                            {a.phone}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="shrink-0 text-right text-[10.5px] text-slate-400 dark:text-neutral-500">
                                                Sejak {formatDate(a.joined_at)}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>

                        <Card
                            title="Anggota Terbaru"
                            icon={<Users className="size-4" />}
                            badge={
                                recent_members.length > 0
                                    ? 'terbaru'
                                    : undefined
                            }
                        >
                            {recent_members.length === 0 ? (
                                <EmptyHint text="Belum ada anggota." />
                            ) : (
                                <ul className="divide-y divide-slate-100 dark:divide-neutral-800">
                                    {recent_members.map((m) => (
                                        <li
                                            key={m.id}
                                            className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                                        >
                                            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-[10.5px] font-bold text-slate-600 dark:from-neutral-700 dark:to-neutral-800 dark:text-neutral-300">
                                                {initials(m.name)}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-[12.5px] font-semibold text-slate-900 dark:text-neutral-100">
                                                    {m.name}
                                                </div>
                                                <div className="truncate text-[11px] text-slate-500 dark:text-neutral-400">
                                                    {m.email}
                                                </div>
                                            </div>
                                            <Badge className="shrink-0 border-transparent bg-slate-100 px-2 py-0 text-[10.5px] font-semibold text-slate-600 dark:bg-neutral-800 dark:text-neutral-300">
                                                {m.role}
                                            </Badge>
                                            <span className="hidden shrink-0 text-[10.5px] text-slate-400 sm:inline dark:text-neutral-500">
                                                {formatDate(m.joined_at)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-5">
                        <Card
                            title="Kontak Tenant"
                            icon={<Mail className="size-4" />}
                        >
                            <dl className="space-y-3 text-[12.5px]">
                                <ContactRow
                                    icon={<UserIcon className="size-3.5" />}
                                    label="PIC"
                                    value={tenant.contact_name}
                                />
                                <ContactRow
                                    icon={<Mail className="size-3.5" />}
                                    label="Email"
                                    value={tenant.contact_email}
                                />
                                <ContactRow
                                    icon={<Phone className="size-3.5" />}
                                    label="Telepon"
                                    value={tenant.contact_phone}
                                />
                                <ContactRow
                                    icon={<MapPin className="size-3.5" />}
                                    label="Alamat"
                                    value={tenant.address}
                                />
                            </dl>
                        </Card>

                        <Card
                            title="Subscription"
                            icon={<Crown className="size-4" />}
                        >
                            {tenant.plan ? (
                                <div className="rounded-xl bg-gradient-to-br from-brand-50 to-brand-50 p-3 ring-1 ring-brand-100 dark:from-brand-500/10 dark:to-brand-500/10 dark:ring-brand-500/20">
                                    <div className="text-[10.5px] font-bold tracking-wider text-brand-700 uppercase dark:text-brand-300">
                                        Plan Aktif
                                    </div>
                                    <div className="mt-0.5 text-[15px] font-extrabold text-slate-900 dark:text-neutral-100">
                                        {tenant.plan.name}
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-neutral-400">
                                        Code: {tenant.plan.code}
                                    </div>
                                </div>
                            ) : (
                                <EmptyHint text="Belum ada plan." />
                            )}
                        </Card>

                        <Card
                            title="Kontrak"
                            icon={<CalendarClock className="size-4" />}
                        >
                            <div className="space-y-2 text-[12.5px]">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 dark:text-neutral-400">
                                        Berakhir
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-neutral-100">
                                        {formatDate(tenant.contract_ends_at)}
                                    </span>
                                </div>
                                {tenant.contract_days_remaining !== null && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 dark:text-neutral-400">
                                            Sisa
                                        </span>
                                        <span
                                            className={cn(
                                                'font-bold tabular-nums',
                                                tenant.contract_expired
                                                    ? 'text-rose-600 dark:text-rose-400'
                                                    : tenant.contract_expiring_soon
                                                      ? 'text-amber-600 dark:text-amber-400'
                                                      : 'text-emerald-600 dark:text-emerald-400',
                                            )}
                                        >
                                            {tenant.contract_expired
                                                ? `${Math.abs(tenant.contract_days_remaining)} hari lewat`
                                                : `${tenant.contract_days_remaining} hari`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </aside>
                </div>
            </div>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isActive ? 'Suspend tenant?' : 'Aktifkan tenant?'}
                        </DialogTitle>
                        <DialogDescription>
                            {isActive ? (
                                <>
                                    Tenant <strong>{tenant.name}</strong> akan
                                    di-suspend. User di tenant ini akan
                                    kehilangan akses sampai diaktifkan kembali.
                                </>
                            ) : (
                                <>
                                    Tenant <strong>{tenant.name}</strong> akan
                                    diaktifkan kembali. Anggota tenant akan bisa
                                    login lagi.
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={toggleStatus}
                            className={cn(
                                'text-white',
                                isActive
                                    ? 'bg-rose-600 hover:bg-rose-700'
                                    : 'bg-emerald-600 hover:bg-emerald-700',
                            )}
                        >
                            {isActive ? 'Suspend' : 'Aktifkan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function Card({
    title,
    icon,
    badge,
    children,
}: {
    title: string;
    icon?: React.ReactNode;
    badge?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 dark:ring-neutral-800">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="inline-flex items-center gap-2 text-[14.5px] font-bold text-slate-900 dark:text-neutral-100">
                    {icon && (
                        <span className="grid size-7 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                            {icon}
                        </span>
                    )}
                    {title}
                </h2>
                {badge && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10.5px] font-semibold tracking-wider text-slate-600 uppercase dark:bg-neutral-800 dark:text-neutral-300">
                        {badge}
                    </span>
                )}
            </div>
            <div>{children}</div>
        </div>
    );
}

function HeroStat({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="min-w-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur">
            <div className="flex items-center gap-1.5 text-[10.5px] font-semibold tracking-wider text-white/60 uppercase">
                {icon}
                {label}
            </div>
            <div className="mt-1 truncate text-[15px] font-bold text-white tabular-nums">
                {value}
            </div>
        </div>
    );
}

function ContactRow({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | null;
}) {
    return (
        <div className="flex items-start gap-2.5">
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-500 dark:bg-neutral-800 dark:text-neutral-400">
                {icon}
            </span>
            <div className="min-w-0 flex-1">
                <dt className="text-[10.5px] font-semibold tracking-wider text-slate-400 uppercase dark:text-neutral-500">
                    {label}
                </dt>
                <dd className="font-medium break-words text-slate-900 dark:text-neutral-100">
                    {value ?? (
                        <span className="text-slate-400 italic dark:text-neutral-500">
                            -
                        </span>
                    )}
                </dd>
            </div>
        </div>
    );
}

function EmptyHint({ text }: { text: string }) {
    return (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center text-[12.5px] text-slate-500 dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-neutral-400">
            {text}
        </div>
    );
}
