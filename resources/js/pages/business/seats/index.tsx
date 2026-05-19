import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    Building2,
    CircleSlash,
    Users,
    UserX,
} from 'lucide-react';

import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Org = {
    id: number;
    name: string;
    seat_quota: number;
    seats_used: number;
    seats_available: number;
};

type Member = {
    id: number;
    role: string;
    joined_at: string | null;
    user: {
        id: number;
        name: string;
        email: string;
        last_login_at: string | null;
    } | null;
    utilization_status: 'active' | 'inactive' | 'never_logged_in';
};

type Breakdown = {
    active: number;
    inactive: number;
    never_logged_in: number;
};

type Props = {
    organization: Org;
    members: Member[];
    breakdown: Breakdown;
};

const STATUS_LABEL: Record<Member['utilization_status'], string> = {
    active: 'Aktif (≤30 hari)',
    inactive: 'Tidak Aktif (>30 hari)',
    never_logged_in: 'Belum Pernah Login',
};

const STATUS_STYLE: Record<Member['utilization_status'], string> = {
    active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    inactive: 'border-amber-200 bg-amber-50 text-amber-700',
    never_logged_in: 'border-slate-200 bg-slate-50 text-slate-500',
};

function formatDateTime(iso: string | null): string {
    if (!iso) {
        return 'Belum pernah';
    }
    return new Date(iso).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function SeatsIndex({
    organization,
    members,
    breakdown,
}: Props) {
    const usagePct =
        organization.seat_quota > 0
            ? Math.round((organization.seats_used / organization.seat_quota) * 100)
            : 0;
    const realActivePct =
        organization.seats_used > 0
            ? Math.round((breakdown.active / organization.seats_used) * 100)
            : 0;

    return (
        <>
            <Head title="Utilisasi Seat" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/business/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            Utilisasi Seat
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Utilisasi Seat
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Pantau pemakaian seat untuk optimasi biaya & retensi karyawan.
                    </p>
                </div>

                {/* Hero quota card */}
                <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 via-indigo-50 to-violet-50 p-6 ring-1 ring-brand-200">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-700 backdrop-blur">
                                <Building2 className="size-3" />
                                {organization.name}
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="text-4xl font-extrabold tabular-nums text-slate-900">
                                    {organization.seats_used}
                                </span>
                                <span className="text-lg font-bold text-slate-500">
                                    /
                                </span>
                                <span className="text-2xl font-bold tabular-nums text-slate-700">
                                    {organization.seat_quota}
                                </span>
                                <span className="ml-1 text-sm font-medium text-slate-500">
                                    seat terpakai
                                </span>
                            </div>
                            <p className="mt-1 text-[12.5px] text-slate-600">
                                Sisa kuota: <strong>{organization.seats_available}</strong> seat
                            </p>
                        </div>
                        <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/70 text-brand-700 backdrop-blur">
                            <Users className="size-6" />
                        </div>
                    </div>

                    <div className="mt-5">
                        <div className="flex items-center justify-between text-[11.5px] text-slate-600">
                            <span>Kuota terpakai</span>
                            <span className="font-bold">{usagePct}%</span>
                        </div>
                        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/60">
                            <div
                                className={cn(
                                    'h-full bg-gradient-to-r',
                                    usagePct >= 90
                                        ? 'from-rose-400 to-rose-600'
                                        : usagePct >= 70
                                          ? 'from-amber-400 to-orange-500'
                                          : 'from-emerald-400 to-emerald-600',
                                )}
                                style={{ width: `${usagePct}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Breakdown */}
                <div className="grid gap-3 sm:grid-cols-3">
                    <BreakdownCard
                        icon={Activity}
                        label="Karyawan Aktif"
                        value={breakdown.active}
                        sublabel={`${realActivePct}% dari yang terdaftar`}
                        tone="emerald"
                    />
                    <BreakdownCard
                        icon={UserX}
                        label="Tidak Aktif (>30 hari)"
                        value={breakdown.inactive}
                        sublabel="Tidak login >30 hari terakhir"
                        tone="amber"
                    />
                    <BreakdownCard
                        icon={CircleSlash}
                        label="Belum Pernah Login"
                        value={breakdown.never_logged_in}
                        sublabel="Undangan diterima tapi belum aktif"
                        tone="slate"
                    />
                </div>

                {/* Member table */}
                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <h2 className="text-[15px] font-bold text-slate-900">
                        Daftar Karyawan
                    </h2>
                    <p className="mt-0.5 text-[12.5px] text-slate-500">
                        {members.length} karyawan terdaftar
                    </p>

                    {members.length === 0 ? (
                        <div className="mt-6 py-10 text-center">
                            <Users className="mx-auto mb-2 size-6 text-slate-300" />
                            <p className="text-sm text-slate-500">Belum ada karyawan terdaftar.</p>
                        </div>
                    ) : (
                        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                            <table className="w-full text-[13px]">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        <th className="px-4 py-2.5">Karyawan</th>
                                        <th className="px-4 py-2.5">Role</th>
                                        <th className="px-4 py-2.5">Login Terakhir</th>
                                        <th className="px-4 py-2.5">Bergabung</th>
                                        <th className="px-4 py-2.5">Status Utilisasi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((m) => (
                                        <tr
                                            key={m.id}
                                            className="border-b border-slate-100 transition hover:bg-slate-50"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-slate-900">
                                                    {m.user?.name ?? '-'}
                                                </div>
                                                <div className="text-[11.5px] text-slate-500">
                                                    {m.user?.email ?? '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline" className="font-mono text-[10.5px]">
                                                    {m.role}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-[11.5px] text-slate-600">
                                                {formatDateTime(m.user?.last_login_at ?? null)}
                                            </td>
                                            <td className="px-4 py-3 text-[11.5px] text-slate-600">
                                                {m.joined_at
                                                    ? new Date(m.joined_at).toLocaleDateString('id-ID', {
                                                          day: '2-digit',
                                                          month: 'short',
                                                          year: 'numeric',
                                                      })
                                                    : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    className={cn(
                                                        'text-[10.5px]',
                                                        STATUS_STYLE[m.utilization_status],
                                                    )}
                                                >
                                                    {STATUS_LABEL[m.utilization_status]}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

type BreakdownTone = 'emerald' | 'amber' | 'slate';

function BreakdownCard({
    icon: Icon,
    label,
    value,
    sublabel,
    tone,
}: {
    icon: typeof Activity;
    label: string;
    value: number;
    sublabel: string;
    tone: BreakdownTone;
}) {
    const toneClass: Record<BreakdownTone, string> = {
        emerald: 'from-emerald-500/10 to-emerald-600/15 text-emerald-700 ring-emerald-200',
        amber: 'from-amber-500/10 to-amber-600/15 text-amber-700 ring-amber-200',
        slate: 'from-slate-500/10 to-slate-600/15 text-slate-700 ring-slate-200',
    };

    return (
        <div
            className={cn(
                'rounded-2xl bg-gradient-to-br p-4 ring-1',
                toneClass[tone],
            )}
        >
            <div className="flex items-center gap-2">
                <Icon className="size-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                    {label}
                </span>
            </div>
            <div className="mt-2 text-3xl font-extrabold tabular-nums text-slate-900">
                {value}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">{sublabel}</div>
        </div>
    );
}
