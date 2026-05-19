import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ImageIcon,
    Lock,
    MessageSquare,
    Paperclip,
    Send,
    ThumbsUp,
    Trash2,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';

import { FieldError } from '@/components/form/field-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DiscussionUser = {
    id: number;
    name: string;
    avatar_url: string | null;
};

type Reply = {
    id: number;
    body: string;
    image_url: string | null;
    upvotes_count: number;
    has_upvoted: boolean;
    created_at: string | null;
    user: DiscussionUser | null;
    can_delete: boolean;
};

type Thread = {
    id: number;
    title: string;
    body: string;
    image_url: string | null;
    upvotes_count: number;
    has_upvoted: boolean;
    created_at: string | null;
    user: DiscussionUser | null;
    can_delete: boolean;
    is_locked: boolean;
};

type Props = {
    course: { id: number; title: string; slug: string };
    thread: Thread;
    replies: Reply[];
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

function timeAgo(iso: string | null): string {
    if (!iso) return '-';
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} hari lalu`;
    return formatDateTime(iso);
}

export default function DiscussionShow({ course, thread, replies }: Props) {
    const [deleteThread, setDeleteThread] = useState(false);
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

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
            <div className="mx-auto max-w-3xl space-y-5">
                <div>
                    <Link
                        href={`/learn/${course.slug}/discussions`}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12.5px] font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                        <ArrowLeft className="size-3.5" />
                        Kembali ke diskusi
                    </Link>
                </div>

                {/* === Thread (original question) === */}
                <article className="overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <header className="flex flex-wrap items-start gap-3 border-b border-slate-100 px-5 py-4">
                        <Avatar className="size-10 ring-2 ring-slate-100">
                            {thread.user?.avatar_url && (
                                <AvatarImage src={thread.user.avatar_url} alt={thread.user.name} />
                            )}
                            <AvatarFallback className="bg-brand-50 text-[12px] font-bold text-brand-700">
                                {initials(thread.user?.name ?? '?')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="text-[13.5px] font-bold text-slate-900">
                                    {thread.user?.name ?? 'Anonim'}
                                </div>
                                {thread.is_locked && (
                                    <Badge className="border-transparent bg-slate-100 text-slate-600">
                                        <Lock className="mr-1 size-3" />
                                        Locked
                                    </Badge>
                                )}
                            </div>
                            <div className="text-[11.5px] text-slate-500" title={formatDateTime(thread.created_at)}>
                                {timeAgo(thread.created_at)}
                            </div>
                        </div>
                        {thread.can_delete && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="rounded-lg border-rose-200 px-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                onClick={() => setDeleteThread(true)}
                            >
                                <Trash2 className="size-3.5" />
                            </Button>
                        )}
                    </header>

                    <div className="space-y-4 px-5 py-5">
                        <h1 className="text-[20px] leading-tight font-extrabold text-slate-900">
                            {thread.title}
                        </h1>
                        <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-slate-800">
                            {thread.body}
                        </p>
                        {thread.image_url && (
                            <button
                                type="button"
                                onClick={() => setLightboxUrl(thread.image_url)}
                                className="block max-w-full overflow-hidden rounded-xl ring-1 ring-slate-200 transition hover:ring-brand-300"
                            >
                                <img
                                    src={thread.image_url}
                                    alt=""
                                    loading="lazy"
                                    className="max-h-[480px] w-auto"
                                />
                            </button>
                        )}
                    </div>

                    <footer className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/40 px-5 py-3">
                        <UpvoteButton
                            count={thread.upvotes_count}
                            active={thread.has_upvoted}
                            onToggle={toggleThreadUpvote}
                        />
                        <div className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-slate-500">
                            <MessageSquare className="size-3.5" />
                            {replies.length} balasan
                        </div>
                    </footer>
                </article>

                {/* === Replies list === */}
                {replies.length > 0 && (
                    <section className="space-y-3">
                        <h2 className="px-1 text-[13px] font-bold text-slate-600">
                            {replies.length} Balasan
                        </h2>
                        <ul className="space-y-3">
                            {replies.map((r) => (
                                <ReplyCard
                                    key={r.id}
                                    reply={r}
                                    courseSlug={course.slug}
                                    threadId={thread.id}
                                    onImageClick={setLightboxUrl}
                                />
                            ))}
                        </ul>
                    </section>
                )}

                {/* === Composer === */}
                {!thread.is_locked && (
                    <ReplyComposer course={course} thread={thread} />
                )}
            </div>

            {deleteThread && (
                <Confirm
                    title="Hapus pertanyaan?"
                    description="Semua balasan akan ikut terhapus. Tindakan ini tidak bisa dibatalkan."
                    onConfirm={confirmDeleteThread}
                    onCancel={() => setDeleteThread(false)}
                />
            )}

            {lightboxUrl && (
                <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
            )}
        </>
    );
}

function ReplyCard({
    reply,
    courseSlug,
    threadId,
    onImageClick,
}: {
    reply: Reply;
    courseSlug: string;
    threadId: number;
    onImageClick: (url: string) => void;
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
        <li className="overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 transition hover:ring-slate-300">
            <div className="flex items-start gap-3 px-4 pt-4">
                <Avatar className="size-9 ring-2 ring-slate-100">
                    {reply.user?.avatar_url && (
                        <AvatarImage src={reply.user.avatar_url} alt={reply.user.name} />
                    )}
                    <AvatarFallback className="bg-slate-100 text-[11.5px] font-bold text-slate-700">
                        {initials(reply.user?.name ?? '?')}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[12.5px] font-bold text-slate-900">
                            {reply.user?.name ?? 'Anonim'}
                        </span>
                        <span
                            className="text-[11px] text-slate-400"
                            title={formatDateTime(reply.created_at)}
                        >
                            · {timeAgo(reply.created_at)}
                        </span>
                    </div>
                </div>
                {reply.can_delete && (
                    <button
                        type="button"
                        onClick={remove}
                        className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                        aria-label="Hapus balasan"
                    >
                        <Trash2 className="size-3.5" />
                    </button>
                )}
            </div>

            <div className="space-y-3 px-4 py-3 pl-[60px]">
                <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-slate-800">
                    {reply.body}
                </p>
                {reply.image_url && (
                    <button
                        type="button"
                        onClick={() => onImageClick(reply.image_url!)}
                        className="block max-w-full overflow-hidden rounded-xl ring-1 ring-slate-200 transition hover:ring-brand-300"
                    >
                        <img
                            src={reply.image_url}
                            alt=""
                            loading="lazy"
                            className="max-h-[360px] w-auto"
                        />
                    </button>
                )}
            </div>

            <footer className="border-t border-slate-100 bg-slate-50/40 px-4 py-2 pl-[60px]">
                <UpvoteButton
                    count={reply.upvotes_count}
                    active={reply.has_upvoted}
                    onToggle={toggleUpvote}
                    size="sm"
                />
            </footer>
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
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const form = useForm<{ body: string; image: File | null }>({
        body: '',
        image: null,
    });

    function handleImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] ?? null;
        if (!file) return;

        // Reject oversize early before upload
        if (file.size > 5 * 1024 * 1024) {
            form.setError('image', 'Ukuran gambar maksimal 5 MB.');

            return;
        }

        form.clearErrors('image');
        form.setData('image', file);

        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
    }

    function clearImage() {
        form.setData('image', null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    function submit(event: React.FormEvent) {
        event.preventDefault();
        if (!form.data.body.trim()) return;

        form.post(`/learn/${course.slug}/discussions/${thread.id}/replies`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    }

    function onTextareaKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            submit(event);
        }
    }

    return (
        <form
            onSubmit={submit}
            className="overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70"
        >
            <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-2.5 text-[12.5px] font-bold text-slate-700">
                <MessageSquare className="size-3.5 text-brand-600" />
                Tulis balasan
            </div>

            <textarea
                rows={3}
                value={form.data.body}
                onChange={(e) => form.setData('body', e.target.value)}
                onKeyDown={onTextareaKeyDown}
                placeholder="Bantu jawab atau tambah konteks…"
                className="block w-full resize-none border-0 bg-transparent px-4 py-3 text-[13.5px] leading-relaxed outline-none placeholder:text-slate-400 focus:ring-0"
                maxLength={5000}
            />

            {preview && (
                <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3">
                    <div className="relative inline-block max-w-full">
                        <img
                            src={preview}
                            alt="Preview"
                            className="max-h-32 rounded-lg ring-1 ring-slate-200"
                        />
                        <button
                            type="button"
                            onClick={clearImage}
                            className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-rose-600 text-white shadow-md transition hover:bg-rose-700"
                            aria-label="Hapus gambar"
                        >
                            <X className="size-3" />
                        </button>
                    </div>
                </div>
            )}

            <FieldError message={form.errors.body} />
            <FieldError message={form.errors.image} />

            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/40 px-3 py-2.5">
                <div className="flex items-center gap-1">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleImageSelect}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                        title="Lampirkan gambar (auto-compress)"
                    >
                        <Paperclip className="size-3.5" />
                        Gambar
                    </button>
                    <span className="hidden text-[10.5px] text-slate-400 sm:inline">
                        JPG/PNG/WEBP · maks 5 MB · otomatis dikompres
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="hidden text-[10.5px] text-slate-400 md:inline">
                        ⌘/Ctrl + Enter
                    </span>
                    <Button
                        type="submit"
                        disabled={form.processing || !form.data.body.trim()}
                        size="sm"
                        className="rounded-xl bg-brand-600 hover:bg-brand-700"
                    >
                        <Send className="mr-1 size-3.5" />
                        Kirim
                    </Button>
                </div>
            </div>
        </form>
    );
}

function UpvoteButton({
    count,
    active,
    onToggle,
    size = 'md',
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
                'inline-flex items-center gap-1.5 rounded-full font-semibold transition ring-1',
                size === 'md' ? 'px-3 py-1.5 text-[12px]' : 'px-2.5 py-1 text-[11.5px]',
                active
                    ? 'bg-brand-50 text-brand-700 ring-brand-300'
                    : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 hover:text-slate-800',
            )}
            aria-label="Upvote"
        >
            <ThumbsUp
                className={cn(
                    size === 'md' ? 'size-3.5' : 'size-3',
                    active && 'fill-brand-600',
                )}
            />
            <span className="tabular-nums">{count}</span>
            <span className="hidden text-[11px] font-medium opacity-80 sm:inline">
                {active ? 'Disukai' : 'Suka'}
            </span>
        </button>
    );
}

function Lightbox({ url, onClose }: { url: string; onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={onClose}
            role="dialog"
            aria-label="Pratinjau gambar"
        >
            <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                aria-label="Tutup"
            >
                <X className="size-5" />
            </button>
            <img
                src={url}
                alt=""
                className="max-h-full max-w-full rounded-xl"
                onClick={(e) => e.stopPropagation()}
            />
            <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-[12px] font-semibold text-white backdrop-blur transition hover:bg-white/20"
                onClick={(e) => e.stopPropagation()}
            >
                <ImageIcon className="mr-1 inline size-3.5" />
                Buka di tab baru
            </a>
        </div>
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
