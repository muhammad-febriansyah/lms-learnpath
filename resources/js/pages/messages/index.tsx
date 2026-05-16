import { Head, Link, router } from '@inertiajs/react';
import { Inbox, Mail, Plus, Search, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { DataTablePagination, type Paginator } from '@/components/data-table/data-table-pagination';
import { IconChevR } from '@/components/learnpath-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type MessageRow = {
    id: number;
    subject: string;
    preview: string;
    is_unread: boolean;
    created_at: string | null;
    counterpart: { id: number; name: string; email: string; avatar_url: string | null } | null;
};

type Props = {
    messages: Paginator<MessageRow>;
    folder: 'inbox' | 'sent';
    filters: { search?: string };
    stats: { inbox: number; unread: number; sent: number };
};

function initials(name: string): string {
    return name
        .split(' ')
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function timeAgo(iso: string | null): string {
    if (!iso) return '-';
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}j`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}h`;
    return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}

export default function MessagesIndex({ messages, folder, filters, stats }: Props) {
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [searchInput, setSearchInput] = useState(filters.search ?? '');

    const handleFolder = (next: 'inbox' | 'sent') => {
        router.get('/messages', { folder: next }, { preserveState: true, replace: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/messages',
            { folder, search: searchInput || undefined },
            { preserveState: true, replace: true },
        );
    };

    const performDelete = () => {
        if (!deleteId) return;
        setDeleting(true);
        router.delete(`/messages/${deleteId}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeleteId(null);
            },
        });
    };

    return (
        <>
            <Head title="Pesan" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Pesan</span>
                    </nav>
                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Pesan</h1>
                        <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                            <Link href="/messages/compose">
                                <Plus className="mr-1.5 size-4" />
                                Tulis Pesan
                            </Link>
                        </Button>
                    </div>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Komunikasi internal antar pengguna platform.
                    </p>
                </div>

                <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
                    <aside className="space-y-2">
                        <FolderItem
                            label="Kotak Masuk"
                            count={stats.inbox}
                            unread={stats.unread}
                            icon={Inbox}
                            active={folder === 'inbox'}
                            onClick={() => handleFolder('inbox')}
                        />
                        <FolderItem
                            label="Terkirim"
                            count={stats.sent}
                            icon={Send}
                            active={folder === 'sent'}
                            onClick={() => handleFolder('sent')}
                        />
                    </aside>

                    <div className="rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <div className="border-b border-slate-100 p-4">
                            <form onSubmit={handleSearch} className="relative">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Cari subjek atau isi pesan..."
                                    className="h-10 pl-9"
                                />
                            </form>
                        </div>

                        {messages.data.length === 0 ? (
                            <div className="px-4 py-16 text-center">
                                <Mail className="mx-auto mb-3 size-7 text-slate-400" />
                                <p className="text-sm font-semibold text-slate-900">
                                    {folder === 'sent' ? 'Belum ada pesan terkirim' : 'Kotak masuk kosong'}
                                </p>
                                <p className="mt-1 text-[12.5px] text-slate-500">
                                    {folder === 'sent'
                                        ? 'Mulai dengan menulis pesan baru.'
                                        : 'Belum ada pesan masuk yang perlu dibaca.'}
                                </p>
                                <Button asChild className="mt-4 rounded-xl bg-brand-600 hover:bg-brand-700">
                                    <Link href="/messages/compose">
                                        <Plus className="mr-1.5 size-4" />
                                        Tulis Pesan
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {messages.data.map((m) => (
                                    <li key={m.id} className="group relative">
                                        <Link
                                            href={`/messages/${m.id}`}
                                            className={cn(
                                                'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50',
                                                m.is_unread && 'bg-brand-50/40',
                                            )}
                                        >
                                            <Avatar className="size-10 shrink-0 ring-1 ring-slate-200">
                                                {m.counterpart?.avatar_url && (
                                                    <AvatarImage
                                                        src={m.counterpart.avatar_url}
                                                        alt={m.counterpart.name}
                                                    />
                                                )}
                                                <AvatarFallback className="bg-gradient-to-br from-brand-300 to-brand-600 text-[11px] font-bold text-white">
                                                    {m.counterpart ? initials(m.counterpart.name) : '?'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span
                                                        className={cn(
                                                            'truncate text-[13px]',
                                                            m.is_unread
                                                                ? 'font-bold text-slate-900'
                                                                : 'font-semibold text-slate-700',
                                                        )}
                                                    >
                                                        {m.counterpart?.name ?? 'Unknown'}
                                                    </span>
                                                    <span className="shrink-0 text-[10.5px] text-slate-500">
                                                        {timeAgo(m.created_at)}
                                                    </span>
                                                </div>
                                                <div
                                                    className={cn(
                                                        'mt-0.5 truncate text-[12.5px]',
                                                        m.is_unread
                                                            ? 'font-semibold text-slate-900'
                                                            : 'text-slate-700',
                                                    )}
                                                >
                                                    {m.subject}
                                                </div>
                                                <div className="mt-0.5 line-clamp-1 text-[11.5px] text-slate-500">
                                                    {m.preview}
                                                </div>
                                            </div>
                                            {m.is_unread && (
                                                <span className="mt-2 size-2 shrink-0 rounded-full bg-brand-500" />
                                            )}
                                        </Link>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setDeleteId(m.id);
                                            }}
                                            className="absolute top-3 right-3 hidden size-7 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 group-hover:grid"
                                            title="Hapus"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {messages.data.length > 0 && (
                            <div className="border-t border-slate-100 p-3">
                                <DataTablePagination paginator={messages} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus pesan?</DialogTitle>
                        <DialogDescription>
                            Pesan akan dihapus dari folder Anda. Penerima/pengirim lain tetap punya
                            salinannya.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={performDelete} disabled={deleting}>
                            {deleting ? 'Menghapus...' : 'Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function FolderItem({
    label,
    count,
    unread,
    icon: Icon,
    active,
    onClick,
}: {
    label: string;
    count: number;
    unread?: number;
    icon: typeof Inbox;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors',
                active
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 ring-1 ring-slate-200/70 hover:bg-slate-50',
            )}
        >
            <Icon className="size-4" />
            <span className="flex-1 text-[13px] font-semibold">{label}</span>
            {unread !== undefined && unread > 0 ? (
                <span
                    className={cn(
                        'rounded-full px-1.5 py-0.5 text-[10.5px] font-bold tabular-nums',
                        active ? 'bg-white text-brand-700' : 'bg-brand-100 text-brand-700',
                    )}
                >
                    {unread}
                </span>
            ) : (
                <span
                    className={cn(
                        'text-[11px] tabular-nums',
                        active ? 'text-white/70' : 'text-slate-400',
                    )}
                >
                    {count}
                </span>
            )}
        </button>
    );
}

