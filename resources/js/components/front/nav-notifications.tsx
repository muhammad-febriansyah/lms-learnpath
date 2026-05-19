import { Link, usePage } from '@inertiajs/react';
import { Bell, BellOff } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type NotificationItem = {
    id: string;
    type: string;
    title: string;
    description: string;
    href: string | null;
    read: boolean;
    created_at: string | null;
};

type SharedNotifications = {
    unread_count: number;
    items: NotificationItem[];
} | null;

function formatRelative(iso: string | null) {
    if (!iso) {
        return '';
    }

    const now = Date.now();
    const ts = new Date(iso).getTime();

    if (Number.isNaN(ts)) {
        return '';
    }

    const diff = Math.max(0, now - ts);
    const minutes = Math.floor(diff / 60_000);

    if (minutes < 1) {
        return 'baru saja';
    }

    if (minutes < 60) {
        return `${minutes} mnt lalu`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours} jam lalu`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
        return `${days} hari lalu`;
    }

    return new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
    });
}

export function NavNotifications() {
    const { notifications } = usePage<{ notifications: SharedNotifications }>()
        .props;

    const unread = notifications?.unread_count ?? 0;
    const items = notifications?.items ?? [];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label={`Notifikasi${unread > 0 ? ` (${unread} belum dibaca)` : ''}`}
                    className="relative grid size-9 place-items-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-brand-600 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-brand-300"
                >
                    <Bell className="size-[18px]" />
                    {unread > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 grid min-w-[18px] place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white tabular-nums ring-2 ring-white dark:ring-neutral-950">
                            {unread > 9 ? '9+' : unread}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[360px] p-0">
                <DropdownMenuLabel className="flex items-center justify-between px-4 py-3">
                    <span className="text-[14px] font-bold text-slate-900 dark:text-neutral-100">
                        Notifikasi
                    </span>
                    {unread > 0 && (
                        <span className="dark:bg-brand-950/40 rounded-full bg-brand-50 px-2 py-0.5 text-[10.5px] font-bold text-brand-700 dark:text-brand-300">
                            {unread} baru
                        </span>
                    )}
                </DropdownMenuLabel>

                <div className="max-h-[60vh] overflow-y-auto border-t border-slate-100 dark:border-neutral-800">
                    {items.length === 0 ? (
                        <div className="px-4 py-12 text-center">
                            <BellOff className="mx-auto size-7 text-slate-300" />
                            <div className="mt-3 text-[13.5px] font-semibold text-slate-700 dark:text-neutral-200">
                                Belum ada notifikasi
                            </div>
                            <div className="mt-1 text-[12px] text-slate-500">
                                Kami akan kabari saat ada pembaruan penting
                            </div>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100 dark:divide-neutral-800">
                            {items.map((n) => {
                                const inner = (
                                    <div className="flex gap-3 px-4 py-3 transition hover:bg-slate-50/60 dark:hover:bg-neutral-900/40">
                                        <span
                                            className={
                                                'mt-1 size-2 shrink-0 rounded-full ' +
                                                (n.read
                                                    ? 'bg-transparent'
                                                    : 'bg-brand-500')
                                            }
                                            aria-hidden="true"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="text-[13px] font-semibold text-slate-900 dark:text-neutral-100">
                                                {n.title}
                                            </div>
                                            {n.description && (
                                                <div className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-slate-600 dark:text-neutral-400">
                                                    {n.description}
                                                </div>
                                            )}
                                            <div className="mt-1 text-[10.5px] text-slate-400">
                                                {formatRelative(n.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                );

                                return (
                                    <li key={n.id}>
                                        {n.href ? (
                                            <Link
                                                href={n.href}
                                                className="block"
                                            >
                                                {inner}
                                            </Link>
                                        ) : (
                                            inner
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                <div className="border-t border-slate-100 px-4 py-2.5 dark:border-neutral-800">
                    <Link
                        href="/notifications"
                        className="dark:hover:bg-brand-950/30 block w-full rounded-lg py-2 text-center text-[12.5px] font-semibold text-brand-600 transition hover:bg-brand-50"
                    >
                        Lihat semua notifikasi
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
