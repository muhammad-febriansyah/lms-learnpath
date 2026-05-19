import { Head, Link, router } from '@inertiajs/react';
import {
    Bell,
    BookOpen,
    CheckCheck,
    Mail,
    ShoppingCart,
    Sparkles,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

import {
    DataTablePagination,
    type Paginator,
} from '@/components/data-table/data-table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Notification = {
    id: string;
    type: string;
    title: string;
    description: string;
    href: string | null;
    read: boolean;
    created_at: string | null;
};

type Bucket = 'training' | 'message' | 'order' | 'system';

type Props = {
    notifications: Paginator<Notification>;
    filters: { bucket: Bucket | null; unread_only: boolean };
    counts: { all: number; unread: number };
};

const BUCKETS: Array<{
    key: Bucket | null;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}> = [
    { key: null, label: 'Semua', icon: Bell },
    { key: 'training', label: 'Training', icon: BookOpen },
    { key: 'message', label: 'Pesan', icon: Mail },
    { key: 'order', label: 'Order', icon: ShoppingCart },
    { key: 'system', label: 'Sistem', icon: Sparkles },
];

function formatTimeAgo(iso: string | null): string {
    if (!iso) return '-';
    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Baru saja';
    if (diffMin < 60) return `${diffMin} menit lalu`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} jam lalu`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay} hari lalu`;
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function iconFor(type: string): React.ComponentType<{ className?: string }> {
    if (type === 'training_assigned' || type === 'training_due_reminder')
        return BookOpen;
    if (type === 'message') return Mail;
    if (type === 'order_paid') return ShoppingCart;
    return Bell;
}

export default function NotificationsIndex({ notifications, filters, counts }: Props) {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const applyFilter = (bucket: Bucket | null, unreadOnly?: boolean) => {
        const params: Record<string, string | number> = {};
        if (bucket) params.bucket = bucket;
        if (unreadOnly ?? filters.unread_only) params.unread_only = 1;
        router.get('/notifications', params, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const handleItemClick = (n: Notification) => {
        if (!n.read) {
            router.post(
                `/notifications/${n.id}/read`,
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        if (n.href) router.visit(n.href);
                    },
                },
            );
        } else if (n.href) {
            router.visit(n.href);
        }
    };

    const handleMarkAllRead = () => {
        router.post('/notifications/read-all', {}, { preserveScroll: true });
    };

    const handleClearRead = () => {
        if (
            !confirm(
                'Hapus semua notifikasi yang sudah dibaca? Tindakan ini tidak bisa dibatalkan.',
            )
        )
            return;
        router.delete('/notifications/read', { preserveScroll: true });
    };

    const handleDelete = (id: string) => {
        setDeletingId(id);
        router.delete(`/notifications/${id}`, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setDeletingId(null),
        });
    };

    return (
        <>
            <Head title="Notifikasi" />
            <div className="space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
                            <Bell className="size-6 text-brand-600" />
                            Notifikasi
                        </h1>
                        <p className="mt-1 text-[13.5px] text-slate-500">
                            {counts.unread > 0
                                ? `${counts.unread} dari ${counts.all} belum dibaca`
                                : `${counts.all} notifikasi · semua sudah dibaca`}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {counts.unread > 0 && (
                            <Button
                                variant="outline"
                                className="rounded-xl"
                                onClick={handleMarkAllRead}
                            >
                                <CheckCheck className="mr-1.5 size-4" />
                                Tandai semua dibaca
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            className="rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            onClick={handleClearRead}
                            disabled={counts.all === counts.unread}
                        >
                            <Trash2 className="mr-1.5 size-4" />
                            Hapus yang sudah dibaca
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-card p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    {BUCKETS.map((b) => {
                        const active = filters.bucket === b.key;
                        const Icon = b.icon;
                        return (
                            <button
                                key={b.key ?? 'all'}
                                type="button"
                                onClick={() => applyFilter(b.key)}
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold transition',
                                    active
                                        ? 'bg-brand-600 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                                )}
                            >
                                <Icon className="size-3.5" />
                                {b.label}
                            </button>
                        );
                    })}
                    <div className="ml-auto inline-flex items-center gap-2 text-[11.5px] text-slate-600">
                        <label className="inline-flex items-center gap-1.5">
                            <input
                                type="checkbox"
                                className="size-3.5 rounded border-slate-300"
                                checked={filters.unread_only}
                                onChange={(e) =>
                                    applyFilter(filters.bucket, e.target.checked)
                                }
                            />
                            Hanya belum dibaca
                        </label>
                    </div>
                </div>

                <div className="rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    {notifications.data.length === 0 ? (
                        <div className="px-4 py-16 text-center">
                            <Bell className="mx-auto mb-3 size-6 text-slate-400" />
                            <p className="text-sm font-semibold text-slate-900">
                                Tidak ada notifikasi
                            </p>
                            <p className="mt-1 text-[12.5px] text-slate-500">
                                Aktivitas penting akan muncul di sini.
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {notifications.data.map((n) => (
                                <NotificationRow
                                    key={n.id}
                                    notification={n}
                                    onClick={() => handleItemClick(n)}
                                    onDelete={() => handleDelete(n.id)}
                                    deleting={deletingId === n.id}
                                />
                            ))}
                        </ul>
                    )}

                    {notifications.data.length > 0 && (
                        <div className="border-t border-slate-100 p-3">
                            <DataTablePagination paginator={notifications} />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function NotificationRow({
    notification: n,
    onClick,
    onDelete,
    deleting,
}: {
    notification: Notification;
    onClick: () => void;
    onDelete: () => void;
    deleting: boolean;
}) {
    const Icon = iconFor(n.type);

    return (
        <li
            className={cn(
                'flex items-start gap-3 px-4 py-3 transition-colors',
                !n.read && 'bg-brand-50/40',
            )}
        >
            <span
                className={cn(
                    'mt-0.5 grid size-9 shrink-0 place-items-center rounded-full',
                    n.read
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-brand-100 text-brand-700',
                )}
            >
                <Icon className="size-4" />
            </span>
            <button
                type="button"
                onClick={onClick}
                className="min-w-0 flex-1 cursor-pointer text-left"
            >
                <div className="flex flex-wrap items-center gap-2">
                    <span
                        className={cn(
                            'truncate text-[13px]',
                            n.read
                                ? 'font-semibold text-slate-700'
                                : 'font-bold text-slate-900',
                        )}
                    >
                        {n.title}
                    </span>
                    {!n.read && (
                        <Badge className="border-transparent bg-brand-600 text-white text-[10px] hover:bg-brand-600">
                            Baru
                        </Badge>
                    )}
                </div>
                <p className="mt-0.5 line-clamp-2 text-[12.5px] text-slate-600">
                    {n.description}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                    {formatTimeAgo(n.created_at)}
                </p>
            </button>
            <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                aria-label="Hapus notifikasi"
            >
                <Trash2 className="size-4" />
            </button>
        </li>
    );
}
