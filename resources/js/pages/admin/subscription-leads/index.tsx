import { Head, Link, router } from '@inertiajs/react';
import { Building2, Inbox, Mail, Phone, Users } from 'lucide-react';

import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import type { Paginator } from '@/components/data-table/data-table-pagination';
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

type Lead = {
    id: number;
    company_name: string;
    contact_name: string;
    email: string;
    phone: string | null;
    employee_count: number | null;
    status: string;
    source: string;
    plan: { id: number; name: string; code: string } | null;
    assignee: { id: number; name: string } | null;
    contacted_at: string | null;
    created_at: string | null;
};

type Stats = {
    new: number;
    contacted: number;
    qualified: number;
    converted: number;
    lost: number;
};

type Props = {
    leads: Paginator<Lead>;
    filters: { search?: string; status?: string };
    stats: Stats;
    statuses: string[];
};

const STATUS_LABEL: Record<string, string> = {
    new: 'Baru',
    contacted: 'Dihubungi',
    qualified: 'Qualified',
    converted: 'Closed Won',
    lost: 'Closed Lost',
};

const STATUS_STYLE: Record<string, string> = {
    new: 'border-blue-200 bg-blue-50 text-blue-700',
    contacted: 'border-amber-200 bg-amber-50 text-amber-700',
    qualified: 'border-brand-200 bg-brand-50 text-brand-700',
    converted: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    lost: 'border-slate-200 bg-slate-50 text-slate-500',
};

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

export default function LeadsIndex({ leads, filters, stats }: Props) {
    const handleFilter = (next: Record<string, string | undefined>) => {
        router.get(
            '/admin/subscription-leads',
            { ...filters, ...next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Lead Subscription B2B" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            Lead Subscription
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Lead Subscription B2B
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Calon klien yang submit "Hubungi Kami" dari halaman pricing. Follow
                        up dalam 1×24 jam.
                    </p>
                </div>

                {/* Stat cards */}
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
                    {(['new', 'contacted', 'qualified', 'converted', 'lost'] as const).map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() =>
                                handleFilter({
                                    status: filters.status === s ? undefined : s,
                                })
                            }
                            className={cn(
                                'rounded-2xl border p-3 text-left transition',
                                filters.status === s
                                    ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
                                    : 'border-slate-200 bg-card hover:bg-slate-50',
                            )}
                        >
                            <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                                {STATUS_LABEL[s]}
                            </div>
                            <div className="mt-1 text-2xl font-extrabold tabular-nums text-slate-900">
                                {stats[s]}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Input
                            value={filters.search ?? ''}
                            onChange={(e) =>
                                handleFilter({ search: e.target.value || undefined })
                            }
                            placeholder="Cari nama perusahaan, kontak, atau email..."
                            className="h-9 max-w-md"
                        />
                        <Select
                            value={filters.status ?? 'all'}
                            onValueChange={(v) =>
                                handleFilter({ status: v === 'all' ? undefined : v })
                            }
                        >
                            <SelectTrigger className="h-9 w-full sm:w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                {Object.entries(STATUS_LABEL).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {leads.data.length === 0 ? (
                        <div className="py-12 text-center">
                            <Inbox className="mx-auto mb-2 size-7 text-slate-300" />
                            <p className="text-sm font-semibold text-slate-900">
                                Inbox kosong
                            </p>
                            <p className="mt-1 text-[12.5px] text-slate-500">
                                Lead dari halaman pricing akan muncul di sini.
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {leads.data.map((lead) => (
                                <li
                                    key={lead.id}
                                    className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center"
                                >
                                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                                        <Building2 className="size-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Link
                                                href={`/admin/subscription-leads/${lead.id}`}
                                                className="text-[14px] font-bold text-slate-900 hover:text-brand-600"
                                            >
                                                {lead.company_name}
                                            </Link>
                                            <Badge
                                                className={cn(
                                                    'text-[10.5px]',
                                                    STATUS_STYLE[lead.status] ??
                                                        'border-slate-200 bg-slate-50 text-slate-500',
                                                )}
                                            >
                                                {STATUS_LABEL[lead.status] ?? lead.status}
                                            </Badge>
                                            {lead.plan && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10.5px] font-mono"
                                                >
                                                    {lead.plan.name}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="mt-1 flex flex-wrap items-center gap-3 text-[11.5px] text-slate-600">
                                            <span className="inline-flex items-center gap-1">
                                                {lead.contact_name}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Mail className="size-3" />
                                                {lead.email}
                                            </span>
                                            {lead.phone && (
                                                <span className="inline-flex items-center gap-1">
                                                    <Phone className="size-3" />
                                                    {lead.phone}
                                                </span>
                                            )}
                                            {lead.employee_count && (
                                                <span className="inline-flex items-center gap-1">
                                                    <Users className="size-3" />
                                                    {lead.employee_count} karyawan
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-right text-[11px] text-slate-500">
                                        {formatDate(lead.created_at)}
                                    </div>
                                    <Button
                                        asChild
                                        size="sm"
                                        variant="outline"
                                        className="h-8 shrink-0 rounded-xl"
                                    >
                                        <Link href={`/admin/subscription-leads/${lead.id}`}>
                                            Detail
                                        </Link>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="mt-4">
                        <DataTablePagination paginator={leads} />
                    </div>
                </div>
            </div>
        </>
    );
}
