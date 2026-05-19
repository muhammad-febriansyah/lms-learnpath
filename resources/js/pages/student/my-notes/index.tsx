import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    BookOpen,
    ChevronDown,
    Clock,
    NotebookPen,
    Pencil,
    Play,
    Search,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { IconChevR } from '@/components/learnpath-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Note = {
    id: number;
    content: string;
    timestamp_seconds: number | null;
    created_at: string | null;
    updated_at: string | null;
    course: { id: number; title: string; slug: string } | null;
    lesson: { id: number; title: string } | null;
};

type CourseOption = { id: number; title: string; slug: string };

type Props = {
    notes: Note[];
    courseOptions: CourseOption[];
    filters: { course_id: number | null };
};

type CourseGroup = {
    course: { id: number; title: string; slug: string };
    notes: Note[];
};

function formatTimestamp(seconds: number | null): string | null {
    if (seconds === null || seconds < 0) return null;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

function timeAgo(iso: string | null): string {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} mnt lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} hari lalu`;
    return new Date(iso).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function formatFullDate(iso: string | null): string {
    if (!iso) return '';
    return new Date(iso).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function groupByCourse(notes: Note[]): CourseGroup[] {
    const map = new Map<number, CourseGroup>();
    for (const note of notes) {
        if (!note.course) continue;
        const key = note.course.id;
        if (!map.has(key)) {
            map.set(key, { course: note.course, notes: [] });
        }
        map.get(key)!.notes.push(note);
    }
    return [...map.values()].sort((a, b) => a.course.title.localeCompare(b.course.title));
}

export default function MyNotesIndex({ notes }: Props) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [query, setQuery] = useState('');
    const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

    const filteredNotes = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return notes;
        return notes.filter(
            (n) =>
                n.content.toLowerCase().includes(q) ||
                n.lesson?.title.toLowerCase().includes(q) ||
                n.course?.title.toLowerCase().includes(q),
        );
    }, [notes, query]);

    const groups = useMemo(() => groupByCourse(filteredNotes), [filteredNotes]);

    const handleDelete = (id: number) => {
        if (!confirm('Hapus catatan ini?')) return;
        router.delete(`/notes/${id}`, { preserveScroll: true });
    };

    const toggleCollapse = (courseId: number) => {
        setCollapsed((prev) => {
            const next = new Set(prev);
            if (next.has(courseId)) next.delete(courseId);
            else next.add(courseId);
            return next;
        });
    };

    const totalCourses = useMemo(
        () => new Set(notes.map((n) => n.course?.id).filter(Boolean)).size,
        [notes],
    );

    return (
        <>
            <Head title="Catatan Saya" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/dashboard" className="hover:text-slate-700">
                            Beranda
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Catatan Saya</span>
                    </nav>
                    <div className="mt-1.5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                                Catatan Saya
                            </h1>
                            <p className="mt-1 text-[13.5px] text-slate-500">
                                {notes.length === 0
                                    ? 'Belum ada catatan tersimpan.'
                                    : `${notes.length} catatan dari ${totalCourses} course`}
                            </p>
                        </div>
                    </div>
                </div>

                {notes.length === 0 ? (
                    <EmptyState />
                ) : (
                    <>
                        <div className="relative">
                            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Cari isi catatan, lesson, atau course..."
                                className="h-11 rounded-xl pl-10 text-[13.5px]"
                            />
                        </div>

                        {groups.length === 0 ? (
                            <div className="rounded-2xl bg-white px-6 py-12 text-center ring-1 ring-slate-200/70">
                                <div className="mx-auto grid size-12 place-items-center rounded-xl bg-slate-100 text-slate-400">
                                    <Search className="size-5" />
                                </div>
                                <p className="mt-3 text-[14px] font-semibold text-slate-700">
                                    Tidak ada catatan yang cocok
                                </p>
                                <p className="mt-1 text-[12.5px] text-slate-500">
                                    Coba kata kunci lain atau bersihkan filter.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {groups.map((g) => (
                                    <CourseGroupCard
                                        key={g.course.id}
                                        group={g}
                                        collapsed={collapsed.has(g.course.id)}
                                        onToggleCollapse={() => toggleCollapse(g.course.id)}
                                        editingId={editingId}
                                        onEdit={setEditingId}
                                        onCancelEdit={() => setEditingId(null)}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

function CourseGroupCard({
    group,
    collapsed,
    onToggleCollapse,
    editingId,
    onEdit,
    onCancelEdit,
    onDelete,
}: {
    group: CourseGroup;
    collapsed: boolean;
    onToggleCollapse: () => void;
    editingId: number | null;
    onEdit: (id: number) => void;
    onCancelEdit: () => void;
    onDelete: (id: number) => void;
}) {
    return (
        <section className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70">
            <button
                type="button"
                onClick={onToggleCollapse}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50"
            >
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <BookOpen className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-bold text-slate-900">
                        {group.course.title}
                    </div>
                    <div className="text-[11.5px] text-slate-500">
                        {group.notes.length} catatan
                    </div>
                </div>
                <ChevronDown
                    className={cn(
                        'size-4 shrink-0 text-slate-400 transition-transform',
                        collapsed && '-rotate-90',
                    )}
                />
            </button>

            {!collapsed && (
                <ul className="divide-y divide-slate-100 border-t border-slate-100">
                    {group.notes.map((note) => (
                        <NoteRow
                            key={note.id}
                            note={note}
                            editing={editingId === note.id}
                            onEdit={() => onEdit(note.id)}
                            onCancelEdit={onCancelEdit}
                            onDelete={() => onDelete(note.id)}
                        />
                    ))}
                </ul>
            )}
        </section>
    );
}

function NoteRow({
    note,
    editing,
    onEdit,
    onCancelEdit,
    onDelete,
}: {
    note: Note;
    editing: boolean;
    onEdit: () => void;
    onCancelEdit: () => void;
    onDelete: () => void;
}) {
    const form = useForm<{ content: string }>({ content: note.content });
    const ts = formatTimestamp(note.timestamp_seconds);
    const playUrl = note.course && note.lesson
        ? `/learn/${note.course.slug}/lessons/${note.lesson.id}${
              note.timestamp_seconds ? `?t=${note.timestamp_seconds}` : ''
          }`
        : null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.data.content.trim() || form.processing) return;
        form.patch(`/notes/${note.id}`, {
            preserveScroll: true,
            onSuccess: () => onCancelEdit(),
        });
    };

    return (
        <li className={cn('px-4 py-4 transition', editing ? 'bg-brand-50/40' : 'hover:bg-slate-50/40')}>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                {/* Timestamp anchor (clickable to jump to video) */}
                <div className="shrink-0">
                    {playUrl ? (
                        <Link
                            href={playUrl}
                            className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1 font-mono text-[11.5px] font-bold text-brand-700 transition hover:bg-brand-100"
                            title="Buka di video pada timestamp ini"
                        >
                            <Clock className="size-3.5" />
                            {ts ?? '—'}
                        </Link>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[11.5px] font-bold text-slate-600">
                            <Clock className="size-3.5" />
                            {ts ?? '—'}
                        </span>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    {note.lesson && note.course && (
                        <Link
                            href={`/learn/${note.course.slug}/lessons/${note.lesson.id}`}
                            className="line-clamp-1 text-[12.5px] font-bold text-slate-900 hover:text-brand-700"
                        >
                            {note.lesson.title}
                        </Link>
                    )}

                    {editing ? (
                        <form onSubmit={handleSubmit} className="mt-2">
                            <Textarea
                                value={form.data.content}
                                onChange={(e) => form.setData('content', e.target.value)}
                                rows={4}
                                className="resize-none text-[13px]"
                                maxLength={5000}
                                autoFocus
                            />
                            <div className="mt-2 flex items-center justify-end gap-1.5">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={onCancelEdit}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={!form.data.content.trim() || form.processing}
                                    className="h-8 rounded-lg bg-brand-600 hover:bg-brand-700"
                                >
                                    Simpan
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <p className="mt-1.5 text-[13px] leading-relaxed whitespace-pre-wrap text-slate-700">
                                {note.content}
                            </p>
                            <div className="mt-2.5 flex items-center justify-between gap-2">
                                <span
                                    className="text-[11px] text-slate-400"
                                    title={formatFullDate(note.updated_at ?? note.created_at)}
                                >
                                    {timeAgo(note.updated_at ?? note.created_at)}
                                </span>
                                <div className="flex items-center gap-1">
                                    {playUrl && (
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 rounded-lg px-2 text-[11.5px] text-brand-700 hover:bg-brand-50 hover:text-brand-800"
                                        >
                                            <Link href={playUrl}>
                                                <Play className="mr-1 size-3" />
                                                Lanjut nonton
                                            </Link>
                                        </Button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={onEdit}
                                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                        title="Edit catatan"
                                        aria-label="Edit catatan"
                                    >
                                        <Pencil className="size-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onDelete}
                                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                                        title="Hapus catatan"
                                        aria-label="Hapus catatan"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </li>
    );
}

function EmptyState() {
    return (
        <div className="grid place-items-center rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-slate-200/70">
            <div>
                <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-100 text-brand-700">
                    <NotebookPen className="size-6" />
                </div>
                <h2 className="mt-4 text-[18px] font-extrabold text-slate-900">
                    Belum ada catatan
                </h2>
                <p className="mt-1 max-w-md text-[13px] text-slate-500">
                    Mulai belajar dan tulis catatan langsung dari halaman lesson untuk
                    menyimpan poin penting yang ingin Anda ingat.
                </p>
                <Button asChild className="mt-5 rounded-xl bg-brand-600 hover:bg-brand-700">
                    <Link href="/my-courses">Buka Course Saya</Link>
                </Button>
            </div>
        </div>
    );
}
