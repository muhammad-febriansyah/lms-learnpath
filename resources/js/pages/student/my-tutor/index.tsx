import { Head, Link, router } from '@inertiajs/react';
import {
    Bot,
    BookOpen,
    FileText,
    Loader2,
    MessageSquare,
    Plus,
    Send,
    Sparkles,
    Square,
    Trash2,
    User as UserIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

type Citation = {
    title: string;
    content: string;
    document_id: number;
};

type Message = {
    id: number;
    role: 'user' | 'assistant' | 'system';
    content: string;
    citations: Citation[] | null;
    created_at: string | null;
};

type ActiveThread = Thread & { messages: Message[] };

type Quota = {
    ok: boolean;
    reason: string | null;
    usage: { messages: number; tokens: number };
    limits: { daily_message_limit: number; daily_token_limit: number };
};

type Persona = { kind: 'instructor' | 'student' };

type Props = {
    threads: Thread[];
    activeThread: ActiveThread | null;
    available: boolean;
    quota: Quota;
    persona?: Persona;
};

const PERSONA_COPY = {
    instructor: {
        sidebarHint:
            'Bantu rancang topik, outline, & ide referensi untuk materi yang Anda ajarkan.',
        composerPlaceholder:
            'Minta ide topik, outline, contoh kasus, soal latihan... (Enter untuk kirim, Shift+Enter baris baru)',
        emptyTitle: 'Halo Mentor! Mau menyusun apa hari ini?',
        emptyBody:
            'Saya bisa bantu menghasilkan ide topik, kerangka course, outline lesson, contoh kasus, soal latihan, hingga referensi sumber bacaan. Pilih ide cepat di bawah atau ketik permintaan Anda.',
        suggestions: [
            'Susun outline 6 modul untuk course "Dasar Analisa Kredit"',
            'Beri 5 ide topik lanjutan untuk kelas Manajemen Risiko',
            'Buat 3 contoh kasus AO menghadapi nasabah sulit + pembahasan',
            'Generate 5 soal pilihan ganda tentang survey debitur (level menengah)',
        ],
    },
    student: {
        sidebarHint: 'Tanya apapun tentang materi yang sedang Anda pelajari.',
        composerPlaceholder:
            'Tanyakan sesuatu... (Enter untuk kirim, Shift+Enter baris baru)',
        emptyTitle: 'Halo! Saya AI Tutor.',
        emptyBody:
            'Saya bisa bantu jelaskan konsep dalam course, beri contoh, ringkas materi, atau membahas soal latihan. Mulai dengan mengetik pertanyaan di bawah.',
        suggestions: [
            'Jelaskan apa itu Analisa 5C dalam kredit',
            'Ringkas 3 prinsip survey debitur',
            'Buatkan contoh percakapan AO dengan nasabah',
            'Soal latihan tentang manajemen risiko',
        ],
    },
} as const;

function formatNumber(n: number): string {
    return n.toLocaleString('id-ID');
}

function timeShort(iso: string | null): string {
    if (!iso) return '';
    const date = new Date(iso);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    }
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
    });
}

function getCsrfToken(): string {
    const el = document.querySelector<HTMLMetaElement>(
        'meta[name="csrf-token"]',
    );
    return el?.content ?? '';
}

export default function MyTutorIndex({
    threads,
    activeThread,
    available,
    quota,
    persona,
}: Props) {
    const composerDisabled = !available || !quota.ok;
    const copy = PERSONA_COPY[persona?.kind ?? 'student'];

    const [input, setInput] = useState('');
    const [streaming, setStreaming] = useState(false);
    const [streamText, setStreamText] = useState('');
    const [pendingUser, setPendingUser] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);
    const activeThreadId = activeThread?.id ?? null;

    // Reset transient state whenever the server thread changes.
    useEffect(() => {
        setStreamText('');
        setPendingUser(null);
        setErrorMsg(null);
    }, [activeThreadId, activeThread?.messages.length]);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop =
                containerRef.current.scrollHeight;
        }
    }, [activeThread?.messages.length, streamText, pendingUser]);

    const messages = useMemo<Message[]>(() => {
        const base = activeThread?.messages ?? [];
        const extras: Message[] = [];
        if (pendingUser) {
            extras.push({
                id: -2,
                role: 'user',
                content: pendingUser,
                citations: null,
                created_at: null,
            });
        }
        if (streaming) {
            extras.push({
                id: -1,
                role: 'assistant',
                content: streamText,
                citations: null,
                created_at: null,
            });
        }
        return [...base, ...extras];
    }, [activeThread?.messages, pendingUser, streaming, streamText]);

    const stopStream = useCallback(() => {
        abortRef.current?.abort();
        abortRef.current = null;
        setStreaming(false);
    }, []);

    const handleSubmit = useCallback(
        async (text: string) => {
            const content = text.trim();
            if (!content || streaming || composerDisabled) return;

            setErrorMsg(null);
            setInput('');
            setPendingUser(content);
            setStreamText('');
            setStreaming(true);

            const controller = new AbortController();
            abortRef.current = controller;

            try {
                const res = await fetch('/my-tutor/stream', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'text/event-stream',
                        'X-CSRF-TOKEN': getCsrfToken(),
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({
                        content,
                        thread_id: activeThreadId,
                    }),
                    signal: controller.signal,
                });

                if (!res.ok || !res.body) {
                    let msg = 'Gagal menghubungi AI Tutor.';
                    try {
                        const j = await res.json();
                        if (j?.error) msg = j.error;
                    } catch {
                        // ignore
                    }
                    throw new Error(msg);
                }

                const newThreadId =
                    res.headers.get('X-Thread-Id') ??
                    (activeThreadId ? String(activeThreadId) : null);

                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';
                let assembled = '';

                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });

                    let idx: number;
                    while ((idx = buffer.indexOf('\n\n')) !== -1) {
                        const chunk = buffer.slice(0, idx);
                        buffer = buffer.slice(idx + 2);
                        const line = chunk
                            .split('\n')
                            .find((l) => l.startsWith('data:'));
                        if (!line) continue;
                        const payload = line.slice(5).trim();
                        if (payload === '[DONE]') continue;
                        try {
                            const event = JSON.parse(payload);
                            if (
                                event.type === 'text_delta' &&
                                typeof event.delta === 'string'
                            ) {
                                assembled += event.delta;
                                setStreamText(assembled);
                            }
                        } catch {
                            // ignore malformed payloads
                        }
                    }
                }

                // Stream complete — sync with server to pull persisted message + citations.
                const target = newThreadId
                    ? `/my-tutor/${newThreadId}`
                    : '/my-tutor';
                router.visit(target, {
                    preserveScroll: true,
                    preserveState: false,
                });
            } catch (e: unknown) {
                if ((e as { name?: string }).name === 'AbortError') {
                    // user cancelled; keep what we have
                } else {
                    setErrorMsg(
                        e instanceof Error
                            ? e.message
                            : 'Terjadi kesalahan tak terduga.',
                    );
                }
                setStreaming(false);
                setPendingUser(null);
                setStreamText('');
            } finally {
                abortRef.current = null;
                setStreaming(false);
            }
        },
        [activeThreadId, composerDisabled, streaming],
    );

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        void handleSubmit(input);
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
                                {copy.sidebarHint}
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
                                                        {timeShort(
                                                            t.last_message_at ??
                                                                t.created_at,
                                                        )}
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
                                AI Tutor belum aktif. Admin perlu set{' '}
                                <code className="font-mono">
                                    OPENAI_API_KEY
                                </code>{' '}
                                di .env.
                            </div>
                        )}
                        {available && !quota.ok && quota.reason && (
                            <div className="m-4 rounded-xl bg-rose-50 p-3 text-[12px] text-rose-900 ring-1 ring-rose-200">
                                <strong className="font-bold">
                                    Kuota harian habis.
                                </strong>{' '}
                                {quota.reason} Coba lagi besok.
                            </div>
                        )}
                        {errorMsg && (
                            <div className="m-4 rounded-xl bg-rose-50 p-3 text-[12px] text-rose-900 ring-1 ring-rose-200">
                                {errorMsg}
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
                                    size="sm"
                                    className="h-8 rounded-xl bg-rose-600 text-white shadow-sm hover:bg-rose-700"
                                    onClick={() =>
                                        handleDelete(activeThread.id)
                                    }
                                    title="Hapus percakapan"
                                >
                                    <Trash2 className="mr-1 size-3.5" />
                                    Hapus
                                </Button>
                            )}
                        </div>

                        {/* Messages */}
                        <div
                            ref={containerRef}
                            className="flex-1 overflow-y-auto px-5 py-6"
                        >
                            {!activeThread && messages.length === 0 ? (
                                <EmptyState
                                    copy={copy}
                                    onSelect={(t) => setInput(t)}
                                />
                            ) : (
                                <div className="mx-auto max-w-3xl space-y-4">
                                    {messages.map((m) => (
                                        <MessageBubble
                                            key={m.id}
                                            message={m}
                                            isStreaming={
                                                streaming &&
                                                m.id === -1 &&
                                                streamText === ''
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Composer */}
                        <form
                            onSubmit={handleFormSubmit}
                            className="border-t border-slate-200/70 bg-white p-3"
                        >
                            <div className="mx-auto flex max-w-3xl items-end gap-2">
                                <Textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={
                                        !available
                                            ? 'AI Tutor belum aktif.'
                                            : !quota.ok
                                              ? 'Kuota harian habis. Coba lagi besok.'
                                              : copy.composerPlaceholder
                                    }
                                    rows={2}
                                    disabled={composerDisabled || streaming}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            void handleSubmit(input);
                                        }
                                    }}
                                    className="resize-none"
                                />
                                {streaming ? (
                                    <Button
                                        type="button"
                                        onClick={stopStream}
                                        className="h-12 rounded-xl bg-slate-800 hover:bg-slate-900"
                                        title="Hentikan"
                                    >
                                        <Square className="size-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={
                                            composerDisabled ||
                                            !input.trim()
                                        }
                                        className="h-12 rounded-xl bg-brand-600 hover:bg-brand-700"
                                    >
                                        <Send className="size-4" />
                                    </Button>
                                )}
                            </div>
                        </form>
                    </main>
                </div>
            </div>
        </>
    );
}

function QuotaBadge({ quota }: { quota: Quota }) {
    const msgPct =
        quota.limits.daily_message_limit > 0
            ? Math.min(
                  100,
                  (quota.usage.messages / quota.limits.daily_message_limit) *
                      100,
              )
            : 0;
    const tokenPct =
        quota.limits.daily_token_limit > 0
            ? Math.min(
                  100,
                  (quota.usage.tokens / quota.limits.daily_token_limit) * 100,
              )
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
                    {formatNumber(quota.usage.messages)}/
                    {formatNumber(quota.limits.daily_message_limit)}
                </span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/70">
                <div
                    className={cn(
                        'h-full rounded-full',
                        isBlocked
                            ? 'bg-rose-500'
                            : isWarning
                              ? 'bg-amber-500'
                              : 'bg-brand-500',
                    )}
                    style={{ width: `${msgPct}%` }}
                />
            </div>
            <div className="mt-1.5 flex items-center justify-between font-semibold">
                <span>Token hari ini</span>
                <span>
                    {formatNumber(quota.usage.tokens)}/
                    {formatNumber(quota.limits.daily_token_limit)}
                </span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/70">
                <div
                    className={cn(
                        'h-full rounded-full',
                        isBlocked
                            ? 'bg-rose-500'
                            : isWarning
                              ? 'bg-amber-500'
                              : 'bg-brand-500',
                    )}
                    style={{ width: `${tokenPct}%` }}
                />
            </div>
        </div>
    );
}

function EmptyState({
    copy,
    onSelect,
}: {
    copy: (typeof PERSONA_COPY)[keyof typeof PERSONA_COPY];
    onSelect: (text: string) => void;
}) {
    return (
        <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center text-center">
            <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-xl">
                <Sparkles className="size-7" />
            </div>
            <h2 className="mt-5 text-[20px] font-extrabold text-slate-900">
                {copy.emptyTitle}
            </h2>
            <p className="mt-2 max-w-md text-[13.5px] text-slate-600">
                {copy.emptyBody}
            </p>
            <div className="mt-6 grid w-full max-w-md grid-cols-2 gap-2 text-left">
                {copy.suggestions.map((suggestion) => (
                    <button
                        key={suggestion}
                        type="button"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        onClick={() => onSelect(suggestion)}
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
    isStreaming = false,
}: {
    message: Message;
    isStreaming?: boolean;
}) {
    const isUser = message.role === 'user';
    const citations = message.citations ?? [];

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
                {isUser ? (
                    <UserIcon className="size-4" />
                ) : (
                    <Bot className="size-4" />
                )}
            </div>
            <div className={cn('max-w-[80%] space-y-2', isUser && 'items-end')}>
                <div
                    className={cn(
                        'rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1',
                        isUser
                            ? 'bg-brand-600 text-white ring-brand-700/30'
                            : 'bg-white text-slate-800 ring-slate-200/70',
                    )}
                >
                    {isStreaming && message.content === '' ? (
                        <div className="flex items-center gap-1.5 py-1">
                            <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                            <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                            <span className="size-1.5 animate-bounce rounded-full bg-slate-400" />
                        </div>
                    ) : (
                        <div className="whitespace-pre-wrap">
                            {renderWithCitationMarks(message.content)}
                            {message.id === -1 && (
                                <Loader2 className="ml-1 inline size-3 animate-spin text-slate-400" />
                            )}
                        </div>
                    )}
                </div>
                {citations.length > 0 && <Citations citations={citations} />}
            </div>
        </div>
    );
}

function renderWithCitationMarks(text: string): React.ReactNode {
    const parts = text.split(/(\[Sumber\s+\d+\])/g);
    return parts.map((part, i) => {
        if (/^\[Sumber\s+\d+\]$/.test(part)) {
            return (
                <span
                    key={i}
                    className="mx-0.5 inline-flex items-center rounded-md bg-brand-100 px-1.5 py-0 text-[11px] font-bold text-brand-700"
                >
                    {part}
                </span>
            );
        }
        return <span key={i}>{part}</span>;
    });
}

function Citations({ citations }: { citations: Citation[] }) {
    return (
        <div className="rounded-xl bg-slate-50 p-2.5 ring-1 ring-slate-200/70">
            <div className="mb-1.5 inline-flex items-center gap-1.5 text-[10.5px] font-bold tracking-wide text-slate-500 uppercase">
                <FileText className="size-3" />
                Sumber
            </div>
            <ul className="space-y-1.5">
                {citations.map((c, i) => (
                    <li
                        key={`${c.document_id}-${i}`}
                        className="rounded-lg bg-white p-2 ring-1 ring-slate-200/70"
                    >
                        <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-slate-900">
                            <span className="inline-flex items-center rounded bg-brand-100 px-1.5 py-0 text-[10px] font-bold text-brand-700">
                                {i + 1}
                            </span>
                            <span className="truncate">{c.title}</span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">
                            {c.content}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
