import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Bot,
    BookOpen,
    Loader2,
    MessageSquare,
    Plus,
    Send,
    Sparkles,
    Trash2,
    User as UserIcon,
} from 'lucide-react';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Thread = {
    id: number;
    title: string;
    last_message_at: string | null;
    created_at: string | null;
    course: { id: number; title: string; slug: string } | null;
    lesson: { id: number; title: string } | null;
};

type Message = {
    id: number;
    role: 'user' | 'assistant' | 'system';
    content: string;
    created_at: string | null;
};

type ActiveThread = Thread & { messages: Message[] };

type Quota = {
    ok: boolean;
    reason: string | null;
    usage: { messages: number; tokens: number };
    limits: { daily_message_limit: number; daily_token_limit: number };
};

type Props = {
    threads: Thread[];
    activeThread: ActiveThread | null;
    available: boolean;
    quota: Quota;
};

function formatNumber(n: number): string {
    return n.toLocaleString('id-ID');
}

function timeShort(iso: string | null): string {
    if (!iso) return '';
    const date = new Date(iso);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}

export default function MyTutorIndex({ threads, activeThread, available, quota }: Props) {
    const composerDisabled = !available || !quota.ok;
    const form = useForm<{ content: string; thread_id: number | null }>({
        content: '',
        thread_id: activeThread?.id ?? null,
    });

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [activeThread?.messages.length]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.data.content.trim() || form.processing) return;
        form.post('/my-tutor/messages', {
            preserveScroll: true,
            onSuccess: () => form.reset('content'),
        });
    };

    const handleDelete = (threadId: number) => {
        if (!confirm('Hapus percakapan ini?')) return;
        router.delete(`/my-tutor/${threadId}`, { preserveScroll: false });
    };

    return (
        <>
            <Head title="AI Tutor" />
            <div className="-mx-5 lg:-mx-8">
                <div className="flex h-[calc(100vh-7rem)] flex-col lg:flex-row">
                    {/* Threads list */}
                    <aside className="flex shrink-0 flex-col lg:w-[300px] lg:border-r lg:border-slate-200/70">
                        <div className="border-b border-slate-100 p-4">
                            <div className="flex items-center justify-between">
                                <h2 className="inline-flex items-center gap-1.5 text-[15px] font-extrabold text-slate-900">
                                    <Bot className="size-5 text-brand-600" />
                                    AI Tutor
                                </h2>
                                <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                    className="h-8 rounded-lg"
                                >
                                    <Link href="/my-tutor">
                                        <Plus className="size-3.5" />
                                    </Link>
                                </Button>
                            </div>
                            <p className="mt-1 text-[11.5px] text-slate-500">
                                Tanya apapun tentang materi yang sedang Anda pelajari.
                            </p>
                            <QuotaBadge quota={quota} />
                        </div>

                        <nav className="flex-1 overflow-y-auto p-2">
                            {threads.length === 0 ? (
                                <div className="p-6 text-center">
                                    <MessageSquare className="mx-auto mb-2 size-6 text-slate-300" />
                                    <p className="text-[12.5px] font-semibold text-slate-700">
                                        Belum ada percakapan
                                    </p>
                                    <p className="mt-1 text-[11px] text-slate-500">
                                        Kirim pesan pertama untuk mulai.
                                    </p>
                                </div>
                            ) : (
                                <ul className="space-y-1">
                                    {threads.map((t) => (
                                        <li key={t.id}>
                                            <Link
                                                href={`/my-tutor/${t.id}`}
                                                className={cn(
                                                    'group flex flex-col gap-1 rounded-lg px-3 py-2.5 transition',
                                                    activeThread?.id === t.id
                                                        ? 'bg-brand-50 ring-1 ring-brand-200'
                                                        : 'hover:bg-slate-50',
                                                )}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="line-clamp-1 text-[12.5px] font-bold text-slate-900">
                                                        {t.title}
                                                    </span>
                                                    <span className="shrink-0 text-[10.5px] text-slate-400">
                                                        {timeShort(t.last_message_at ?? t.created_at)}
                                                    </span>
                                                </div>
                                                {t.course && (
                                                    <div className="inline-flex items-center gap-1 text-[10.5px] text-slate-500">
                                                        <BookOpen className="size-3" />
                                                        <span className="line-clamp-1">
                                                            {t.course.title}
                                                        </span>
                                                    </div>
                                                )}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </nav>
                    </aside>

                    {/* Chat panel */}
                    <main className="flex min-w-0 flex-1 flex-col bg-slate-50/40">
                        {!available && (
                            <div className="m-4 rounded-xl bg-amber-50 p-3 text-[12px] text-amber-900 ring-1 ring-amber-200">
                                AI Tutor belum aktif. Admin perlu set <code className="font-mono">OPENAI_API_KEY</code> di .env.
                            </div>
                        )}
                        {available && !quota.ok && quota.reason && (
                            <div className="m-4 rounded-xl bg-rose-50 p-3 text-[12px] text-rose-900 ring-1 ring-rose-200">
                                <strong className="font-bold">Kuota harian habis.</strong> {quota.reason} Coba lagi besok.
                            </div>
                        )}

                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-200/70 bg-white px-5 py-3">
                            <div className="min-w-0">
                                <div className="line-clamp-1 text-[14px] font-extrabold text-slate-900">
                                    {activeThread?.title ?? 'Percakapan Baru'}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                    {activeThread?.course
                                        ? `Konteks: ${activeThread.course.title}${activeThread.lesson ? ` · ${activeThread.lesson.title}` : ''}`
                                        : 'Belum ada konteks course. Buka course untuk konteks lebih spesifik.'}
                                </div>
                            </div>
                            {activeThread && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="size-8 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                    onClick={() => handleDelete(activeThread.id)}
                                    title="Hapus percakapan"
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            )}
                        </div>

                        {/* Messages */}
                        <div
                            ref={containerRef}
                            className="flex-1 overflow-y-auto px-5 py-6"
                        >
                            {!activeThread ? (
                                <EmptyState />
                            ) : (
                                <div className="mx-auto max-w-3xl space-y-4">
                                    {activeThread.messages.map((m) => (
                                        <MessageBubble key={m.id} message={m} />
                                    ))}
                                    {form.processing && (
                                        <MessageBubble
                                            message={{
                                                id: -1,
                                                role: 'assistant',
                                                content: '',
                                                created_at: null,
                                            }}
                                            isLoading
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Composer */}
                        <form onSubmit={handleSubmit} className="border-t border-slate-200/70 bg-white p-3">
                            <div className="mx-auto flex max-w-3xl items-end gap-2">
                                <Textarea
                                    value={form.data.content}
                                    onChange={(e) => form.setData('content', e.target.value)}
                                    placeholder={
                                        !available
                                            ? 'AI Tutor belum aktif.'
                                            : !quota.ok
                                                ? 'Kuota harian habis. Coba lagi besok.'
                                                : 'Tanyakan sesuatu... (Enter untuk kirim, Shift+Enter baris baru)'
                                    }
                                    rows={2}
                                    disabled={composerDisabled || form.processing}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                    }}
                                    className="resize-none"
                                />
                                <Button
                                    type="submit"
                                    disabled={composerDisabled || form.processing || !form.data.content.trim()}
                                    className="h-12 rounded-xl bg-brand-600 hover:bg-brand-700"
                                >
                                    {form.processing ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <Send className="size-4" />
                                    )}
                                </Button>
                            </div>
                        </form>
                    </main>
                </div>
            </div>
        </>
    );
}

function QuotaBadge({ quota }: { quota: Quota }) {
    const msgPct = quota.limits.daily_message_limit > 0
        ? Math.min(100, (quota.usage.messages / quota.limits.daily_message_limit) * 100)
        : 0;
    const tokenPct = quota.limits.daily_token_limit > 0
        ? Math.min(100, (quota.usage.tokens / quota.limits.daily_token_limit) * 100)
        : 0;
    const isWarning = msgPct >= 80 || tokenPct >= 80;
    const isBlocked = !quota.ok;
    const tone = isBlocked
        ? 'bg-rose-50 ring-rose-200 text-rose-900'
        : isWarning
            ? 'bg-amber-50 ring-amber-200 text-amber-900'
            : 'bg-slate-50 ring-slate-200 text-slate-700';

    return (
        <div className={cn('mt-3 rounded-lg p-2 text-[10.5px] ring-1', tone)}>
            <div className="flex items-center justify-between font-semibold">
                <span>Pesan hari ini</span>
                <span>
                    {formatNumber(quota.usage.messages)}/{formatNumber(quota.limits.daily_message_limit)}
                </span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/70">
                <div
                    className={cn(
                        'h-full rounded-full',
                        isBlocked ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-brand-500',
                    )}
                    style={{ width: `${msgPct}%` }}
                />
            </div>
            <div className="mt-1.5 flex items-center justify-between font-semibold">
                <span>Token hari ini</span>
                <span>
                    {formatNumber(quota.usage.tokens)}/{formatNumber(quota.limits.daily_token_limit)}
                </span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/70">
                <div
                    className={cn(
                        'h-full rounded-full',
                        isBlocked ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-brand-500',
                    )}
                    style={{ width: `${tokenPct}%` }}
                />
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center text-center">
            <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-xl">
                <Sparkles className="size-7" />
            </div>
            <h2 className="mt-5 text-[20px] font-extrabold text-slate-900">
                Halo! Saya AI Tutor.
            </h2>
            <p className="mt-2 max-w-md text-[13.5px] text-slate-600">
                Saya bisa bantu jelaskan konsep dalam course, beri contoh, ringkas materi, atau
                membahas soal latihan. Mulai dengan mengetik pertanyaan di bawah.
            </p>
            <div className="mt-6 grid w-full max-w-md grid-cols-2 gap-2 text-left">
                {[
                    'Jelaskan apa itu Analisa 5C dalam kredit',
                    'Ringkas 3 prinsip survey debitur',
                    'Buatkan contoh percakapan AO dengan nasabah',
                    'Soal latihan tentang manajemen risiko',
                ].map((suggestion) => (
                    <button
                        key={suggestion}
                        type="button"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        onClick={() => {
                            const textarea = document.querySelector<HTMLTextAreaElement>(
                                'form textarea',
                            );
                            if (textarea) {
                                textarea.value = suggestion;
                                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                                textarea.focus();
                            }
                        }}
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
        </div>
    );
}

function MessageBubble({
    message,
    isLoading = false,
}: {
    message: Message;
    isLoading?: boolean;
}) {
    const isUser = message.role === 'user';

    return (
        <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
            <div
                className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-full',
                    isUser
                        ? 'bg-brand-600 text-white'
                        : 'bg-gradient-to-br from-indigo-500 to-brand-700 text-white',
                )}
            >
                {isUser ? <UserIcon className="size-4" /> : <Bot className="size-4" />}
            </div>
            <div
                className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1',
                    isUser
                        ? 'bg-brand-600 text-white ring-brand-700/30'
                        : 'bg-white text-slate-800 ring-slate-200/70',
                )}
            >
                {isLoading ? (
                    <div className="flex items-center gap-1.5 py-1">
                        <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-slate-400" />
                    </div>
                ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                )}
            </div>
        </div>
    );
}
