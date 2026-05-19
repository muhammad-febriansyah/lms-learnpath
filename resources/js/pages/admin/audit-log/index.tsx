import { Head, router } from '@inertiajs/react';
import {
    Activity,
    ChevronDown,
    ChevronUp,
    Globe,
    Search,
    Shield,
    User as UserIcon,
} from 'lucide-react';
import { useState } from 'react';

import {
    DataTablePagination,
    type Paginator,
} from '@/components/data-table/data-table-pagination';
import { ExportCsvButton } from '@/components/reports/export-csv-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Log = {
    id: number;
    action: string;
    subject_type: string | null;
    subject_id: number | null;
    changes: Record<string, unknown> | null;
    ip: string | null;
    user: { id: number; name: string; email: string } | null;
    created_at: string | null;
};

type Props = {
    logs: Paginator<Log>;
    filters: {
        action: string | null;
        search: string | null;
        from: string | null;
        to: string | null;
    };
    topActions: Array<{ action: string; count: number }>;
};

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

const ACTION_TONE: Record<string, string> = {
    'auth.login': 'bg-emerald-50 text-emerald-700',
    'auth.logout': 'bg-slate-100 text-slate-700',
    'auth.failed': 'bg-rose-50 text-rose-700',
    'course.published': 'bg-emerald-50 text-emerald-700',
    'course.rejected': 'bg-amber-50 text-amber-700',
    'course.deleted': 'bg-rose-50 text-rose-700',
    'branding.updated': 'bg-brand-50 text-brand-700',
};

export default function AuditLogIndex({ logs, filters, topActions }: Props) {
    const [searchValue, setSearchValue] = useState(filters.search ?? '');
    const [actionValue, setActionValue] = useState(filters.action ?? '');
    const [fromValue, setFromValue] = useState(filters.from ?? '');
    const [toValue, setToValue] = useState(filters.to ?? '');
    const [expanded, setExpanded] = useState<Set<number>>(new Set());

    const apply = () => {
        const params: Record<string, string> = {};
        if (actionValue) params.action = actionValue;
        if (searchValue) params.search = searchValue;
        if (fromValue) params.from = fromValue;
        if (toValue) params.to = toValue;
        router.get('/admin/audit-log', params, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const reset = () => {
        setSearchValue('');
        setActionValue('');
        setFromValue('');
        setToValue('');
        router.get('/admin/audit-log', {}, { replace: true });
    };

    const toggle = (id: number) => {
        setExpanded((s) => {
            const next = new Set(s);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    return (
        <>
            <Head title="Audit Log" />
            <div className="space-y-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h1 className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
                            <Shield className="size-6 text-brand-600" />
                            Audit Log
                        </h1>
                        <p className="mt-1 text-[13.5px] text-slate-500">
                            Riwayat aksi sensitif: login, perubahan role, publish/hapus
                            course, branding, dll. Append-only — tidak bisa diubah.
                        </p>
                    </div>
                    <ExportCsvButton
                        href="/admin/audit-log/export.csv"
                        params={{
                            action: actionValue,
                            search: searchValue,
                            from: fromValue,
                            to: toValue,
                        }}
                    />
                </div>

                {topActions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        <Badge
                            className={cn(
                                'cursor-pointer border-transparent text-[10.5px] hover:bg-slate-200',
                                !actionValue
                                    ? 'bg-brand-600 text-white hover:bg-brand-600'
                                    : 'bg-slate-100 text-slate-700',
                            )}
                            onClick={() => {
                                setActionValue('');
                                router.get(
                                    '/admin/audit-log',
                                    {},
                                    { preserveScroll: true, preserveState: true, replace: true },
                                );
                            }}
                        >
                            Semua
                        </Badge>
                        {topActions.map((a) => (
                            <Badge
                                key={a.action}
                                className={cn(
                                    'cursor-pointer border-transparent text-[10.5px] hover:bg-slate-200',
                                    actionValue === a.action
                                        ? 'bg-brand-600 text-white hover:bg-brand-600'
                                        : 'bg-slate-100 text-slate-700',
                                )}
                                onClick={() => {
                                    setActionValue(a.action);
                                    router.get(
                                        '/admin/audit-log',
                                        { action: a.action },
                                        { preserveScroll: true, preserveState: true, replace: true },
                                    );
                                }}
                            >
                                {a.action}{' '}
                                <span className="ml-1 opacity-70 tabular-nums">
                                    {a.count}
                                </span>
                            </Badge>
                        ))}
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-card p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                        <Input
                            className="pl-8"
                            placeholder="Cari user (nama/email)…"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && apply()}
                        />
                    </div>
                    <Input
                        placeholder="Action prefix (mis. course.)"
                        value={actionValue}
                        onChange={(e) => setActionValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && apply()}
                        className="max-w-[200px]"
                    />
                    <Input
                        type="date"
                        value={fromValue}
                        onChange={(e) => setFromValue(e.target.value)}
                        className="max-w-[140px]"
                    />
                    <span className="text-slate-400">→</span>
                    <Input
                        type="date"
                        value={toValue}
                        onChange={(e) => setToValue(e.target.value)}
                        className="max-w-[140px]"
                    />
                    <Button onClick={apply} className="bg-brand-600 hover:bg-brand-700">
                        Filter
                    </Button>
                    <Button variant="outline" onClick={reset}>
                        Reset
                    </Button>
                </div>

                <div className="rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    {logs.data.length === 0 ? (
                        <div className="px-4 py-16 text-center">
                            <Activity className="mx-auto mb-3 size-6 text-slate-400" />
                            <p className="text-sm font-semibold text-slate-900">
                                Tidak ada log
                            </p>
                            <p className="mt-1 text-[12.5px] text-slate-500">
                                Tidak ada entri yang cocok dengan filter.
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {logs.data.map((log) => (
                                <LogRow
                                    key={log.id}
                                    log={log}
                                    expanded={expanded.has(log.id)}
                                    onToggle={() => toggle(log.id)}
                                />
                            ))}
                        </ul>
                    )}

                    {logs.data.length > 0 && (
                        <div className="border-t border-slate-100 p-3">
                            <DataTablePagination paginator={logs} />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function LogRow({
    log,
    expanded,
    onToggle,
}: {
    log: Log;
    expanded: boolean;
    onToggle: () => void;
}) {
    const tone = ACTION_TONE[log.action] ?? 'bg-slate-100 text-slate-700';
    const subject = log.subject_type
        ? `${log.subject_type.split('\\').pop()}#${log.subject_id}`
        : '';

    return (
        <li className="px-4 py-3">
            <div className="flex flex-wrap items-start gap-3">
                <Badge
                    className={cn(
                        'border-transparent font-mono text-[10.5px]',
                        tone,
                    )}
                >
                    {log.action}
                </Badge>
                <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] text-slate-700">
                        {log.user ? (
                            <span className="inline-flex items-center gap-1">
                                <UserIcon className="size-3 text-slate-400" />
                                <b className="text-slate-900">{log.user.name}</b>
                                <span className="text-slate-500">
                                    ({log.user.email})
                                </span>
                            </span>
                        ) : (
                            <span className="italic text-slate-500">guest / system</span>
                        )}
                        {subject && (
                            <>
                                {' '}·{' '}
                                <span className="text-slate-600">{subject}</span>
                            </>
                        )}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                        {formatDateTime(log.created_at)}
                        {log.ip && (
                            <>
                                {' '}·{' '}
                                <span className="inline-flex items-center gap-1">
                                    <Globe className="size-3" />
                                    {log.ip}
                                </span>
                            </>
                        )}
                    </div>
                </div>
                {log.changes && Object.keys(log.changes).length > 0 && (
                    <button
                        type="button"
                        onClick={onToggle}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:underline"
                    >
                        {expanded ? (
                            <>
                                <ChevronUp className="size-3" /> Tutup
                            </>
                        ) : (
                            <>
                                <ChevronDown className="size-3" /> Detail
                            </>
                        )}
                    </button>
                )}
            </div>
            {expanded && log.changes && (
                <pre className="mt-2 max-h-[200px] overflow-auto rounded-lg bg-slate-50 p-3 text-[11px] text-slate-700 ring-1 ring-slate-200">
                    {JSON.stringify(log.changes, null, 2)}
                </pre>
            )}
        </li>
    );
}
