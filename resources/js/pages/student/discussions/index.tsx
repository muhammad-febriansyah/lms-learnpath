import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowUp,
    CheckCircle2,
    Clock,
    MessageCircleQuestion,
    MessageSquare,
    MessagesSquare,
    Plus,
    Search,
    Sparkles,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import {
    DataTablePagination,
    type Paginator,
} from '@/components/data-table/data-table-pagination';
import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Thread = {
    id: number;
    title: string;
    body_excerpt: string;
    replies_count: number;
    upvotes_count: number;
    last_reply_at: string | null;
    created_at: string | null;
    user: { id: number; name: string } | null;
    has_upvoted: boolean;
};

type Props = {
    course: { id: number; title: string; slug: string };
    threads: Paginator<Thread>;
    canPost: boolean;
};

type SortKey = 'recent' | 'popular' | 'active' | 'unanswered';

function formatTimeAgo(iso: string | null): string {
    if (!iso) return '-';
    const date = new Date(iso);
    const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
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

function getInitials(name: string | null | undefined): string {
    if (!name) return '?';
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? '')
        .join('');
}

export default function DiscussionsIndex({
    course,
    threads,
    canPost,
}: Props) {
    const [composerOpen, setComposerOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState<SortKey>('recent');

    const visibleThreads = useMemo(() => {
        let items = threads.data;
        const q = query.trim().toLowerCase();
        if (q) {
            items = items.filter(
                (t) =>
                    t.title.toLowerCase().includes(q) ||
                    t.body_excerpt.toLowerCase().includes(q) ||
                    t.user?.name.toLowerCase().includes(q),
            );
        }
        const arr = [...items];
        switch (sort) {
            case 'popular':
                arr.sort((a, b) => b.upvotes_count - a.upvotes_count);
                break;
            case 'active':
                arr.sort((a, b) => {
                    const ta = a.last_reply_at
                        ? new Date(a.last_reply_at).getTime()
                        : 0;
                    const tb = b.last_reply_at
                        ? new Date(b.last_reply_at).getTime()
                        : 0;
                    return tb - ta;
                });
                break;
            case 'unanswered':
                return arr.filter((t) => t.replies_count === 0);
            default:
                arr.sort((a, b) => {
                    const ta = a.created_at
                        ? new Date(a.created_at).getTime()
                        : 0;
                    const tb = b.created_at
                        ? new Date(b.created_at).getTime()
                        : 0;
                    return tb - ta;
                });
        }
        return arr;
    }, [threads.data, query, sort]);

    const totalDiscussions = threads.total ?? threads.data.length;
    const totalReplies = threads.data.reduce(
        (acc, t) => acc + t.replies_count,
        0,
    );
    const uniqueContributors = new Set(
        threads.data.map((t) => t.user?.id).filter(Boolean),
    ).size;

    return (
        <>
            <Head title={`Diskusi — ${course.title}`} />
            <div className="space-y-5">
                <Link
                    href={`/learn/${course.slug}`}
                    className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-600 transition hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                    <ArrowLeft className="size-3.5" />
                    Kembali ke course
                </Link>

                {/* Hero */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-6 text-white shadow-[0_10px_40px_-20px_rgba(15,23,42,0.5)] sm:p-8 dark:from-neutral-950 dark:via-neutral-950 dark:to-indigo-950">
                    <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-indigo-500/20 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-violet-500/10 blur-3xl" />

                    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="min-w-0 flex-1">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase ring-1 ring-white/15 backdrop-blur">
                                <MessagesSquare className="size-3" />
                                Diskusi
                            </span>
                            <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                                Diskusi Course
                            </h1>
                            <p className="mt-1 max-w-2xl text-[13.5px] text-white/70">
                                Tanya jawab dengan sesama siswa &amp; mentor
                                untuk{' '}
                                <span className="font-semibold text-white">
                                    {course.title}
                                </span>
                                .
                            </p>
                        </div>
                        {canPost && (
                            <div className="shrink-0">
                                <Button
                                    onClick={() => setComposerOpen(true)}
                                    size="lg"
                                    className="h-12 rounded-xl bg-white px-5 text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-brand-50 hover:text-brand-700"
                                >
                                    <Plus className="mr-1.5 size-4" />
                                    Tanya Baru
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="relative mt-6 grid grid-cols-3 gap-3">
                        <HeroStat
                            icon={<MessagesSquare className="size-4" />}
                            label="Total Diskusi"
                            value={totalDiscussions}
                        />
                        <HeroStat
                            icon={<MessageSquare className="size-4" />}
                            label="Total Balasan"
                            value={totalReplies}
                        />
                        <HeroStat
                            icon={<Users className="size-4" />}
                            label="Kontributor"
                            value={uniqueContributors}
                        />
                    </div>
                </div>

                {/* Toolbar */}
                <div className="rounded-2xl bg-card p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 dark:ring-neutral-800">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Cari pertanyaan, topik, atau penanya..."
                                className="h-10 rounded-xl border-slate-200 bg-slate-50/60 pl-9 dark:border-neutral-800 dark:bg-neutral-900/60"
                            />
                        </div>
                        <div className="flex items-center gap-1.5 rounded-xl bg-slate-50/60 p-1 ring-1 ring-slate-200 dark:bg-neutral-900/60 dark:ring-neutral-800">
                            <SortChip
                                active={sort === 'recent'}
                                onClick={() => setSort('recent')}
                                icon={<Sparkles className="size-3.5" />}
                                label="Terbaru"
                            />
                            <SortChip
                                active={sort === 'popular'}
                                onClick={() => setSort('popular')}
                                icon={<ArrowUp className="size-3.5" />}
                                label="Populer"
                            />
                            <SortChip
                                active={sort === 'active'}
                                onClick={() => setSort('active')}
                                icon={<Clock className="size-3.5" />}
                                label="Aktif"
                            />
                            <SortChip
                                active={sort === 'unanswered'}
                                onClick={() => setSort('unanswered')}
                                icon={
                                    <MessageCircleQuestion className="size-3.5" />
                                }
                                label="Belum"
                            />
                        </div>
                    </div>
                </div>

                {/* List */}
                {visibleThreads.length === 0 ? (
                    <EmptyState
                        hasQuery={query.trim() !== '' || sort === 'unanswered'}
                        canPost={canPost}
                        onCompose={() => setComposerOpen(true)}
                    />
                ) : (
                    <div className="space-y-3">
                        {visibleThreads.map((t) => (
                            <ThreadCard
                                key={t.id}
                                thread={t}
                                courseSlug={course.slug}
                            />
                        ))}
                    </div>
                )}

                {threads.data.length > 0 && (
                    <div className="rounded-2xl bg-card p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 dark:ring-neutral-800">
                        <DataTablePagination paginator={threads} />
                    </div>
                )}
            </div>

            <ComposerDialog
                open={composerOpen}
                onOpenChange={setComposerOpen}
                courseSlug={course.slug}
            />
        </>
    );
}

function HeroStat({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur">
            <div className="flex items-center gap-1.5 text-[10.5px] font-semibold tracking-wider text-white/60 uppercase">
                {icon}
                {label}
            </div>
            <div className="mt-1 text-[18px] font-bold tabular-nums">
                {value.toLocaleString('id-ID')}
            </div>
        </div>
    );
}

function SortChip({
    active,
    onClick,
    icon,
    label,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition',
                active
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-neutral-100 dark:text-neutral-900'
                    : 'text-slate-600 hover:bg-white/80 dark:text-neutral-400 dark:hover:bg-neutral-800/80',
            )}
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}

function ThreadCard({
    thread,
    courseSlug,
}: {
    thread: Thread;
    courseSlug: string;
}) {
    const toggleUpvote = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.post(
            `/discussions/threads/${thread.id}/upvote`,
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    const noReply = thread.replies_count === 0;

    return (
        <Link
            href={`/learn/${courseSlug}/discussions/${thread.id}`}
            className="group block rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.15)] hover:ring-brand-200 sm:p-5 dark:ring-neutral-800 dark:hover:ring-brand-500/40"
        >
            <div className="flex gap-4">
                {/* Upvote */}
                <button
                    type="button"
                    onClick={toggleUpvote}
                    className={cn(
                        'flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-2.5 py-2 text-[11px] font-bold ring-1 transition',
                        thread.has_upvoted
                            ? 'bg-brand-50 text-brand-700 ring-brand-300 dark:bg-brand-500/15 dark:text-brand-300 dark:ring-brand-500/40'
                            : 'bg-slate-50 text-slate-600 ring-slate-200 hover:bg-slate-100 hover:text-slate-800 dark:bg-neutral-900 dark:text-neutral-300 dark:ring-neutral-700 dark:hover:bg-neutral-800',
                    )}
                    aria-label="Upvote"
                >
                    <ArrowUp className="size-4" />
                    <span className="tabular-nums">
                        {thread.upvotes_count}
                    </span>
                </button>

                {/* Body */}
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start gap-2">
                        <h3 className="line-clamp-2 flex-1 text-[14.5px] font-bold text-slate-900 transition group-hover:text-brand-700 dark:text-neutral-100 dark:group-hover:text-brand-300">
                            {thread.title}
                        </h3>
                        {noReply ? (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                                <MessageCircleQuestion className="size-3" />
                                Belum dibalas
                            </span>
                        ) : (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                                <CheckCircle2 className="size-3" />
                                Aktif
                            </span>
                        )}
                    </div>

                    <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-slate-600 dark:text-neutral-400">
                        {thread.body_excerpt}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11.5px] text-slate-500 dark:text-neutral-400">
                        <span className="inline-flex items-center gap-1.5">
                            <span className="grid size-5 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-[9px] font-bold text-white">
                                {getInitials(thread.user?.name)}
                            </span>
                            <span className="font-semibold text-slate-700 dark:text-neutral-300">
                                {thread.user?.name ?? 'Anonim'}
                            </span>
                        </span>
                        <span className="text-slate-300 dark:text-neutral-600">
                            ·
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Clock className="size-3" />
                            {formatTimeAgo(thread.created_at)}
                        </span>
                        <span className="text-slate-300 dark:text-neutral-600">
                            ·
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <MessageSquare className="size-3" />
                            {thread.replies_count} balasan
                        </span>
                        {thread.last_reply_at && (
                            <>
                                <span className="text-slate-300 dark:text-neutral-600">
                                    ·
                                </span>
                                <span>
                                    Aktivitas{' '}
                                    {formatTimeAgo(thread.last_reply_at)}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}

function EmptyState({
    hasQuery,
    canPost,
    onCompose,
}: {
    hasQuery: boolean;
    canPost: boolean;
    onCompose: () => void;
}) {
    return (
        <div className="rounded-2xl bg-card px-6 py-16 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 dark:ring-neutral-800">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-lg">
                <MessagesSquare className="size-6" />
            </div>
            <h3 className="mt-4 text-[15px] font-extrabold text-slate-900 dark:text-neutral-100">
                {hasQuery
                    ? 'Tidak ada hasil yang cocok'
                    : 'Belum ada diskusi'}
            </h3>
            <p className="mx-auto mt-1.5 max-w-md text-[12.5px] text-slate-500 dark:text-neutral-400">
                {hasQuery
                    ? 'Coba ubah kata kunci atau filter — bisa juga jadi yang pertama membuka diskusi baru.'
                    : 'Belum ada yang bertanya. Jadi yang pertama memulai diskusi & dapatkan insight dari teman sekelas.'}
            </p>
            {canPost && (
                <Button
                    onClick={onCompose}
                    className="mt-5 rounded-xl bg-brand-600 hover:bg-brand-700"
                >
                    <Plus className="mr-1.5 size-4" />
                    Tanya Baru
                </Button>
            )}
        </div>
    );
}

function ComposerDialog({
    open,
    onOpenChange,
    courseSlug,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseSlug: string;
}) {
    const form = useForm<{ title: string; body: string }>({
        title: '',
        body: '',
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.post(`/learn/${courseSlug}/discussions`, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onOpenChange(false);
            },
        });
    };

    const canSubmit =
        !form.processing &&
        form.data.title.trim() !== '' &&
        form.data.body.trim() !== '';

    return (
        <Dialog
            open={open}
            onOpenChange={(o) => {
                onOpenChange(o);
                if (!o) form.reset();
            }}
        >
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="inline-flex items-center gap-2">
                        <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 text-white">
                            <Plus className="size-4" />
                        </span>
                        Tanya Baru
                    </DialogTitle>
                    <DialogDescription>
                        Tulis pertanyaan singkat dan jelas. Sertakan konteks
                        agar mudah dibalas.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1.5">
                        <RequiredLabel htmlFor="title" required>
                            Judul Pertanyaan
                        </RequiredLabel>
                        <Input
                            id="title"
                            value={form.data.title}
                            onChange={(e) =>
                                form.setData('title', e.target.value)
                            }
                            placeholder="Mis: Pivot table vs Power Query, mana yang lebih cepat?"
                            maxLength={200}
                        />
                        <FieldError message={form.errors.title} />
                    </div>
                    <div className="space-y-1.5">
                        <RequiredLabel htmlFor="body" required>
                            Detail
                        </RequiredLabel>
                        <Textarea
                            id="body"
                            rows={6}
                            value={form.data.body}
                            onChange={(e) =>
                                form.setData('body', e.target.value)
                            }
                            placeholder="Jelaskan konteks, langkah yang sudah dicoba, error message kalau ada…"
                            className="resize-none"
                        />
                        <FieldError message={form.errors.body} />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={!canSubmit}
                            className="rounded-xl bg-brand-600 hover:bg-brand-700"
                        >
                            {form.processing ? 'Mengirim...' : 'Posting'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
