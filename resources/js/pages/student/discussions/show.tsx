import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Lock, MessageSquare, ThumbsUp, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { FieldError } from '@/components/form/field-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Reply = {
    id: number;
    body: string;
    upvotes_count: number;
    has_upvoted: boolean;
    created_at: string | null;
    user: { id: number; name: string } | null;
    can_delete: boolean;
};

type Thread = {
    id: number;
    title: string;
    body: string;
    upvotes_count: number;
    has_upvoted: boolean;
    created_at: string | null;
    user: { id: number; name: string } | null;
    can_delete: boolean;
    is_locked: boolean;
};

type Props = {
    course: { id: number; title: string; slug: string };
    thread: Thread;
    replies: Reply[];
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

export default function DiscussionShow({ course, thread, replies }: Props) {
    const [deleteThread, setDeleteThread] = useState(false);

    const toggleThreadUpvote = () => {
        router.post(
            `/discussions/threads/${thread.id}/upvote`,
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    const confirmDeleteThread = () => {
        router.delete(`/learn/${course.slug}/discussions/${thread.id}`, {
            preserveScroll: false,
        });
    };

    return (
        <>
            <Head title={thread.title} />
            <div className="space-y-5">
                <div>
                    <Link
                        href={`/learn/${course.slug}/discussions`}
                        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-600 hover:text-slate-900"
                    >
                        <ArrowLeft className="size-3.5" />
                        Kembali ke diskusi
                    </Link>
                </div>

                <div className="space-y-3 rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="flex items-start gap-3">
                        <UpvoteButton
                            count={thread.upvotes_count}
                            active={thread.has_upvoted}
                            onToggle={toggleThreadUpvote}
                            size="md"
                        />
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-extrabold text-slate-900">
                                    {thread.title}
                                </h1>
                                {thread.is_locked && (
                                    <Badge className="border-transparent bg-slate-100 text-slate-600">
                                        <Lock className="mr-1 size-3" />
                                        Locked
                                    </Badge>
                                )}
                            </div>
                            <div className="mt-1 text-[12px] text-slate-500">
                                Oleh <b>{thread.user?.name ?? 'Anonim'}</b>{' '}
                                · {formatDateTime(thread.created_at)}
                            </div>
                            <p className="mt-3 whitespace-pre-wrap text-[13.5px] leading-relaxed text-slate-800">
                                {thread.body}
                            </p>
                        </div>
                        {thread.can_delete && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                onClick={() => setDeleteThread(true)}
                            >
                                <Trash2 className="size-3.5" />
                            </Button>
                        )}
                    </div>
                </div>

                <div>
                    <h2 className="text-[14px] font-bold text-slate-900">
                        {replies.length} balasan
                    </h2>
                    <ul className="mt-2 space-y-2">
                        {replies.map((r) => (
                            <ReplyRow
                                key={r.id}
                                reply={r}
                                courseSlug={course.slug}
                                threadId={thread.id}
                            />
                        ))}
                    </ul>
                </div>

                {!thread.is_locked && <ReplyComposer course={course} thread={thread} />}
            </div>

            {deleteThread && (
                <Confirm
                    title="Hapus pertanyaan?"
                    description="Semua balasan akan ikut terhapus. Tindakan ini tidak bisa dibatalkan."
                    onConfirm={confirmDeleteThread}
                    onCancel={() => setDeleteThread(false)}
                />
            )}
        </>
    );
}

function ReplyRow({
    reply,
    courseSlug,
    threadId,
}: {
    reply: Reply;
    courseSlug: string;
    threadId: number;
}) {
    const toggleUpvote = () => {
        router.post(
            `/discussions/replies/${reply.id}/upvote`,
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    const remove = () => {
        if (!confirm('Hapus balasan ini?')) return;
        router.delete(
            `/learn/${courseSlug}/discussions/${threadId}/replies/${reply.id}`,
            { preserveScroll: true },
        );
    };

    return (
        <li className="flex gap-3 rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <UpvoteButton
                count={reply.upvotes_count}
                active={reply.has_upvoted}
                onToggle={toggleUpvote}
            />
            <div className="min-w-0 flex-1">
                <div className="text-[11.5px] text-slate-500">
                    <b className="text-slate-700">{reply.user?.name ?? 'Anonim'}</b>{' '}
                    · {formatDateTime(reply.created_at)}
                </div>
                <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-slate-800">
                    {reply.body}
                </p>
            </div>
            {reply.can_delete && (
                <button
                    type="button"
                    onClick={remove}
                    className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Hapus"
                >
                    <Trash2 className="size-4" />
                </button>
            )}
        </li>
    );
}

function ReplyComposer({
    course,
    thread,
}: {
    course: { id: number; slug: string };
    thread: Thread;
}) {
    const form = useForm<{ body: string }>({ body: '' });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post(`/learn/${course.slug}/discussions/${thread.id}/replies`, {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    return (
        <form
            onSubmit={submit}
            className="space-y-2 rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70"
        >
            <div className="inline-flex items-center gap-1.5 text-[12px] font-bold text-slate-700">
                <MessageSquare className="size-3.5 text-brand-600" />
                Tulis balasan
            </div>
            <Textarea
                rows={4}
                value={form.data.body}
                onChange={(e) => form.setData('body', e.target.value)}
                placeholder="Bantu jawab atau tambah konteks…"
            />
            <FieldError message={form.errors.body} />
            <div className="flex items-center justify-end">
                <Button
                    type="submit"
                    disabled={form.processing || !form.data.body.trim()}
                    className="rounded-xl bg-brand-600 hover:bg-brand-700"
                >
                    Kirim balasan
                </Button>
            </div>
        </form>
    );
}

function UpvoteButton({
    count,
    active,
    onToggle,
    size = 'sm',
}: {
    count: number;
    active: boolean;
    onToggle: () => void;
    size?: 'sm' | 'md';
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={cn(
                'flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl font-bold transition ring-1',
                size === 'md' ? 'px-3 py-2 text-[12px]' : 'px-2 py-1.5 text-[11px]',
                active
                    ? 'bg-brand-50 text-brand-700 ring-brand-300'
                    : 'bg-slate-50 text-slate-600 ring-slate-200 hover:bg-slate-100',
            )}
            aria-label="Upvote"
        >
            <ThumbsUp className={size === 'md' ? 'size-4' : 'size-3.5'} />
            <span className="tabular-nums">{count}</span>
        </button>
    );
}

function Confirm({
    title,
    description,
    onConfirm,
    onCancel,
}: {
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <h3 className="text-[16px] font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-[13px] text-slate-600">{description}</p>
                <div className="mt-5 flex justify-end gap-2">
                    <Button variant="outline" onClick={onCancel}>
                        Batal
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        Ya, hapus
                    </Button>
                </div>
            </div>
        </div>
    );
}
