import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Reply, Trash2 } from 'lucide-react';
import { useState } from 'react';

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
import { cn } from '@/lib/utils';

type ThreadMessage = {
    id: number;
    subject: string;
    body: string;
    created_at: string | null;
    is_self: boolean;
    sender: { id: number; name: string; email: string; avatar_url: string | null } | null;
};

type Props = {
    thread: ThreadMessage[];
    message: { id: number; subject: string };
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

export default function MessagesShow({ thread, message }: Props) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const last = thread[thread.length - 1];

    const performDelete = () => {
        setDeleting(true);
        router.delete(`/messages/${message.id}`, {
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <>
            <Head title={message.subject} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <Link href="/messages" className="hover:text-slate-700">
                            Pesan
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="truncate font-semibold text-slate-900">
                            {message.subject}
                        </span>
                    </nav>
                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                            {thread[0]?.subject ?? message.subject}
                        </h1>
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline" className="rounded-xl">
                                <Link href="/messages">
                                    <ArrowLeft className="mr-1.5 size-4" />
                                    Kembali
                                </Link>
                            </Button>
                            {last && !last.is_self && (
                                <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                                    <Link href={`/messages/compose?reply_to=${last.id}`}>
                                        <Reply className="mr-1.5 size-4" />
                                        Balas
                                    </Link>
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                onClick={() => setDeleteOpen(true)}
                                className="rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    </div>
                    <p className="mt-1 text-[12.5px] text-slate-500">
                        {thread.length} {thread.length === 1 ? 'pesan' : 'pesan dalam thread'}
                    </p>
                </div>

                <ul className="space-y-3">
                    {thread.map((m) => (
                        <li
                            key={m.id}
                            className={cn(
                                'rounded-2xl p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1',
                                m.is_self ? 'bg-brand-50/40 ring-brand-100' : 'bg-card ring-slate-200/70',
                            )}
                        >
                            <div className="mb-3 flex items-center gap-3">
                                <Avatar className="size-10 ring-1 ring-slate-200">
                                    {m.sender?.avatar_url && (
                                        <AvatarImage src={m.sender.avatar_url} alt={m.sender.name} />
                                    )}
                                    <AvatarFallback className="bg-gradient-to-br from-brand-300 to-brand-600 text-[11px] font-bold text-white">
                                        {m.sender ? initials(m.sender.name) : '?'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <div className="truncate text-[13px] font-bold text-slate-900">
                                            {m.sender?.name ?? 'Unknown'}
                                            {m.is_self && (
                                                <span className="ml-1.5 text-[10.5px] font-normal text-slate-500">
                                                    (Anda)
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="truncate text-[11px] text-slate-500">
                                        {m.sender?.email}
                                    </div>
                                </div>
                                <div className="shrink-0 text-right text-[10.5px] text-slate-500">
                                    {formatDateTime(m.created_at)}
                                </div>
                            </div>
                            <div className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-slate-800">
                                {m.body}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus pesan?</DialogTitle>
                        <DialogDescription>
                            Pesan akan dihapus dari folder Anda. Pihak lain tetap punya salinannya.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>
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
