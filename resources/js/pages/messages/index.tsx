import { Head, Link, router, useForm } from '@inertiajs/react';
import { MessageSquare, Plus, Search, Send } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Partner = {
    id: number;
    name: string;
    email: string;
    avatar_url: string | null;
};

type Conversation = {
    partner: Partner;
    last_message: {
        id: number;
        preview: string;
        is_self: boolean;
        created_at: string | null;
    };
    unread_count: number;
};

type ThreadMessage = {
    id: number;
    body: string;
    subject: string;
    created_at: string | null;
    is_self: boolean;
};

type Props = {
    conversations: Conversation[];
    activePartner: Partner | null;
    thread: ThreadMessage[];
    filters: { search?: string };
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
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return 'Baru';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}j`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}h`;
    return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}

function fullTime(iso: string | null): string {
    if (!iso) return '';
    return new Date(iso).toLocaleString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short',
    });
}

/**
 * Group messages by day for date separators (Hari ini / Kemarin / Tanggal).
 */
function groupByDay(messages: ThreadMessage[]): { label: string; items: ThreadMessage[] }[] {
    const groups = new Map<string, ThreadMessage[]>();
    for (const m of messages) {
        if (!m.created_at) continue;
        const key = new Date(m.created_at).toDateString();
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(m);
    }
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86_400_000).toDateString();
    return [...groups.entries()].map(([key, items]) => ({
        label:
            key === today
                ? 'Hari ini'
                : key === yesterday
                  ? 'Kemarin'
                  : new Date(key).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                    }),
        items,
    }));
}

export default function MessagesIndex({
    conversations,
    activePartner,
    thread,
    filters,
}: Props) {
    const [searchInput, setSearchInput] = useState(filters.search ?? '');
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const filteredConversations = useMemo(() => {
        if (!searchInput.trim()) return conversations;
        const q = searchInput.toLowerCase();
        return conversations.filter(
            (c) =>
                c.partner.name.toLowerCase().includes(q) ||
                c.partner.email.toLowerCase().includes(q) ||
                c.last_message.preview.toLowerCase().includes(q),
        );
    }, [conversations, searchInput]);

    const unreadTotal = useMemo(
        () => conversations.reduce((sum, c) => sum + c.unread_count, 0),
        [conversations],
    );

    const form = useForm<{ recipient_id: number; body: string; chat: boolean }>({
        recipient_id: activePartner?.id ?? 0,
        body: '',
        chat: true,
    });

    useEffect(() => {
        form.setData('recipient_id', activePartner?.id ?? 0);
        form.reset('body');
        scrollToBottom();
    }, [activePartner?.id]);

    useEffect(() => {
        scrollToBottom();
    }, [thread.length]);

    function scrollToBottom() {
        requestAnimationFrame(() => {
            const el = scrollRef.current;
            if (el) el.scrollTop = el.scrollHeight;
        });
    }

    function openConversation(partnerId: number) {
        router.get(
            '/messages',
            { with: partnerId },
            { preserveState: true, preserveScroll: true, replace: true, only: ['activePartner', 'thread'] },
        );
    }

    function submitMessage(event: React.FormEvent) {
        event.preventDefault();
        if (!activePartner || !form.data.body.trim()) return;

        form.post('/messages', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('body');
                scrollToBottom();
            },
        });
    }

    function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
    }

    function onComposerKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            submitMessage(event);
        }
    }

    const grouped = useMemo(() => groupByDay(thread), [thread]);

    return (
        <>
            <Head title="Pesan" />
            <div className="-mx-4 -my-4 flex h-[calc(100svh-9rem)] min-h-[500px] flex-col overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:-mx-6 sm:my-0 sm:h-[calc(100svh-7.5rem)]">
                <div className="flex h-full">
                    {/* === Conversation list === */}
                    <aside
                        className={cn(
                            'flex w-full flex-col border-r border-slate-200/70 sm:w-[300px] lg:w-[340px]',
                            activePartner && 'hidden sm:flex',
                        )}
                    >
                        <header className="flex items-center justify-between gap-2 border-b border-slate-200/70 px-4 py-3">
                            <div>
                                <div className="text-[16px] font-extrabold tracking-tight text-slate-900">
                                    Pesan
                                </div>
                                <div className="text-[11.5px] text-slate-500">
                                    {conversations.length} percakapan
                                    {unreadTotal > 0 && (
                                        <span className="ml-1 inline-flex items-center rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700">
                                            {unreadTotal} belum dibaca
                                        </span>
                                    )}
                                </div>
                            </div>
                            <Button
                                asChild
                                size="sm"
                                className="h-8 rounded-xl bg-brand-600 px-2.5 text-white hover:bg-brand-700"
                                title="Tulis pesan baru"
                            >
                                <Link href="/messages/compose">
                                    <Plus className="size-4" />
                                </Link>
                            </Button>
                        </header>

                        <form onSubmit={handleSearchSubmit} className="px-4 pt-3 pb-2">
                            <div className="relative">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Cari nama atau pesan..."
                                    className="h-9 rounded-xl pl-9 text-[13px]"
                                />
                            </div>
                        </form>

                        <div className="flex-1 overflow-y-auto px-2 py-1">
                            {filteredConversations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center text-slate-500">
                                    <div className="grid size-12 place-items-center rounded-2xl bg-slate-100">
                                        <MessageSquare className="size-5 text-slate-400" />
                                    </div>
                                    <p className="text-[13px] font-semibold text-slate-700">
                                        Belum ada percakapan
                                    </p>
                                    <p className="text-[11.5px] text-slate-500">
                                        Mulai percakapan baru dengan tombol + di atas.
                                    </p>
                                </div>
                            ) : (
                                filteredConversations.map((c) => (
                                    <ConversationRow
                                        key={c.partner.id}
                                        conversation={c}
                                        active={activePartner?.id === c.partner.id}
                                        onClick={() => openConversation(c.partner.id)}
                                    />
                                ))
                            )}
                        </div>
                    </aside>

                    {/* === Active chat panel === */}
                    <section
                        className={cn(
                            'flex flex-1 flex-col bg-slate-50/40',
                            !activePartner && 'hidden sm:flex',
                        )}
                    >
                        {!activePartner ? (
                            <EmptyState />
                        ) : (
                            <>
                                <header className="flex items-center justify-between gap-3 border-b border-slate-200/70 bg-white px-5 py-3">
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                router.get(
                                                    '/messages',
                                                    {},
                                                    { preserveScroll: true, replace: true },
                                                )
                                            }
                                            className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 sm:hidden"
                                            aria-label="Kembali ke daftar"
                                        >
                                            ‹
                                        </button>
                                        <Avatar className="size-10 ring-2 ring-slate-100">
                                            {activePartner.avatar_url && (
                                                <AvatarImage
                                                    src={activePartner.avatar_url}
                                                    alt={activePartner.name}
                                                />
                                            )}
                                            <AvatarFallback className="bg-brand-50 text-[12px] font-bold text-brand-700">
                                                {initials(activePartner.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <div className="truncate text-[14px] font-bold text-slate-900">
                                                {activePartner.name}
                                            </div>
                                            <div className="truncate text-[11.5px] text-slate-500">
                                                {activePartner.email}
                                            </div>
                                        </div>
                                    </div>
                                </header>

                                <div
                                    ref={scrollRef}
                                    className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6"
                                >
                                    {grouped.length === 0 ? (
                                        <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-slate-400">
                                            <MessageSquare className="size-6" />
                                            <p className="text-[13px] font-medium">
                                                Belum ada pesan. Sapa {activePartner.name.split(' ')[0]}!
                                            </p>
                                        </div>
                                    ) : (
                                        grouped.map((group, gi) => (
                                            <div key={gi} className="space-y-2">
                                                <div className="flex items-center justify-center">
                                                    <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[10.5px] font-semibold text-slate-600">
                                                        {group.label}
                                                    </span>
                                                </div>
                                                {group.items.map((m, idx) => {
                                                    const showAvatar =
                                                        idx === 0 ||
                                                        group.items[idx - 1].is_self !== m.is_self;

                                                    return (
                                                        <MessageBubble
                                                            key={m.id}
                                                            message={m}
                                                            partner={activePartner}
                                                            showAvatar={showAvatar}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        ))
                                    )}
                                </div>

                                <form
                                    onSubmit={submitMessage}
                                    className="border-t border-slate-200/70 bg-white px-4 py-3 sm:px-5"
                                >
                                    {form.errors.body && (
                                        <p className="mb-1.5 text-[11.5px] text-rose-600">
                                            {form.errors.body}
                                        </p>
                                    )}
                                    <div className="flex items-end gap-2">
                                        <textarea
                                            value={form.data.body}
                                            onChange={(e) => form.setData('body', e.target.value)}
                                            onKeyDown={onComposerKeyDown}
                                            rows={1}
                                            maxLength={5000}
                                            placeholder="Tulis pesan... (Enter untuk kirim, Shift+Enter untuk baris baru)"
                                            className="max-h-32 flex-1 resize-none rounded-2xl bg-slate-100 px-4 py-2.5 text-[13.5px] outline-none placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-600"
                                        />
                                        <Button
                                            type="submit"
                                            disabled={!form.data.body.trim() || form.processing}
                                            className="h-10 rounded-2xl bg-brand-600 px-4 text-white hover:bg-brand-700 disabled:opacity-50"
                                        >
                                            <Send className="size-4" />
                                            <span className="ml-1.5 hidden sm:inline">Kirim</span>
                                        </Button>
                                    </div>
                                </form>
                            </>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}

function ConversationRow({
    conversation,
    active,
    onClick,
}: {
    conversation: Conversation;
    active: boolean;
    onClick: () => void;
}) {
    const { partner, last_message: last, unread_count: unread } = conversation;

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition',
                active ? 'bg-brand-50 ring-1 ring-brand-200' : 'hover:bg-slate-100',
            )}
        >
            <Avatar className="size-10 shrink-0 ring-2 ring-white">
                {partner.avatar_url && (
                    <AvatarImage src={partner.avatar_url} alt={partner.name} />
                )}
                <AvatarFallback className="bg-brand-50 text-[12px] font-bold text-brand-700">
                    {initials(partner.name)}
                </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                    <div
                        className={cn(
                            'truncate text-[13.5px] font-bold',
                            unread > 0 ? 'text-slate-900' : 'text-slate-800',
                        )}
                    >
                        {partner.name}
                    </div>
                    <div className="shrink-0 text-[10.5px] text-slate-500">
                        {timeAgo(last.created_at)}
                    </div>
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                    <p
                        className={cn(
                            'min-w-0 flex-1 truncate text-[12px]',
                            unread > 0 ? 'font-semibold text-slate-800' : 'text-slate-500',
                        )}
                    >
                        {last.is_self && (
                            <span className="text-slate-400">Anda: </span>
                        )}
                        {last.preview}
                    </p>
                    {unread > 0 && (
                        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                            {unread > 9 ? '9+' : unread}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}

function MessageBubble({
    message,
    partner,
    showAvatar,
}: {
    message: ThreadMessage;
    partner: Partner;
    showAvatar: boolean;
}) {
    const self = message.is_self;

    return (
        <div
            className={cn(
                'flex items-end gap-2',
                self ? 'justify-end' : 'justify-start',
            )}
        >
            {!self && (
                <div className="size-7 shrink-0">
                    {showAvatar && (
                        <Avatar className="size-7 ring-2 ring-white">
                            {partner.avatar_url && (
                                <AvatarImage src={partner.avatar_url} alt={partner.name} />
                            )}
                            <AvatarFallback className="bg-brand-50 text-[10px] font-bold text-brand-700">
                                {initials(partner.name)}
                            </AvatarFallback>
                        </Avatar>
                    )}
                </div>
            )}
            <div
                className={cn(
                    'max-w-[75%] rounded-2xl px-3.5 py-2 text-[13.5px] leading-relaxed shadow-sm',
                    self
                        ? 'rounded-br-md bg-brand-600 text-white'
                        : 'rounded-bl-md bg-white text-slate-800 ring-1 ring-slate-200/70',
                )}
            >
                <p className="whitespace-pre-wrap break-words">{message.body}</p>
                <div
                    className={cn(
                        'mt-1 text-right text-[10px]',
                        self ? 'text-white/70' : 'text-slate-400',
                    )}
                    title={fullTime(message.created_at)}
                >
                    {new Date(message.created_at ?? '').toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="grid size-16 place-items-center rounded-3xl bg-brand-50 text-brand-600">
                <MessageSquare className="size-7" />
            </div>
            <div>
                <p className="text-[16px] font-bold text-slate-900">Pilih percakapan</p>
                <p className="mt-1 max-w-[280px] text-[12.5px] text-slate-500">
                    Klik salah satu chat di daftar kiri untuk membuka percakapan, atau buat percakapan baru dengan tombol +.
                </p>
            </div>
            <Button asChild className="mt-2 rounded-xl bg-brand-600 hover:bg-brand-700">
                <Link href="/messages/compose">
                    <Plus className="mr-1.5 size-4" />
                    Tulis Pesan
                </Link>
            </Button>
        </div>
    );
}
