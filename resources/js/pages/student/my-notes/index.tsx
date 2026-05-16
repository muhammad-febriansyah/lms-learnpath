import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    BookOpen,
    Clock,
    FileText,
    NotebookPen,
    Pencil,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

import { IconChevR } from '@/components/learnpath-icons';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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

function formatTimestamp(seconds: number | null): string | null {
    if (seconds === null || seconds < 0) return null;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

function formatDate(iso: string | null): string {
    if (!iso) return '';
    return new Date(iso).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function MyNotesIndex({ notes, courseOptions, filters }: Props) {
    const [editingId, setEditingId] = useState<number | null>(null);

    const handleFilterCourse = (value: string) => {
        router.get(
            '/my-notes',
            value === 'all' ? {} : { course_id: value },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleDelete = (id: number) => {
        if (!confirm('Hapus catatan ini?')) return;
        router.delete(`/notes/${id}`, { preserveScroll: true });
    };

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
                    <div className="mt-1.5 flex items-end justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                                Catatan Saya
                            </h1>
                            <p className="mt-1 text-[13.5px] text-slate-500">
                                Semua catatan dari materi yang telah Anda pelajari.
                            </p>
                        </div>
                        <div className="hidden items-center gap-2 sm:flex">
                            <span className="text-[12.5px] text-slate-500">Filter course:</span>
                            <Select
                                value={filters.course_id ? String(filters.course_id) : 'all'}
                                onValueChange={handleFilterCourse}
                            >
                                <SelectTrigger className="h-9 w-[220px]">
                                    <SelectValue placeholder="Semua course" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua course</SelectItem>
                                    {courseOptions.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {notes.length === 0 ? (
                    <EmptyState />
                ) : (
                    <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {notes.map((n) => (
                            <NoteCard
                                key={n.id}
                                note={n}
                                editing={editingId === n.id}
                                onEdit={() => setEditingId(n.id)}
                                onCancelEdit={() => setEditingId(null)}
                                onDelete={() => handleDelete(n.id)}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </>
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

function NoteCard({
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.data.content.trim() || form.processing) return;
        form.patch(`/notes/${note.id}`, {
            preserveScroll: true,
            onSuccess: () => onCancelEdit(),
        });
    };

    return (
        <li
            className={cn(
                'flex flex-col rounded-2xl bg-white p-4 ring-1 transition',
                editing
                    ? 'ring-brand-300 shadow-[0_4px_16px_rgba(67,56,202,0.15)]'
                    : 'ring-slate-200/70 hover:ring-slate-300',
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    {note.course && (
                        <Link
                            href={`/courses/${note.course.slug}`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:underline"
                        >
                            <BookOpen className="size-3" />
                            <span className="line-clamp-1">{note.course.title}</span>
                        </Link>
                    )}
                    {note.lesson && note.course && (
                        <Link
                            href={`/learn/${note.course.slug}/lessons/${note.lesson.id}`}
                            className="mt-1 line-clamp-2 block text-[13.5px] font-bold text-slate-900 hover:text-brand-700"
                        >
                            <FileText className="-mt-0.5 mr-1 inline size-3.5 text-slate-400" />
                            {note.lesson.title}
                        </Link>
                    )}
                </div>
                {ts && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-brand-50 px-1.5 py-0.5 font-mono text-[10.5px] font-bold text-brand-700">
                        <Clock className="size-3" />
                        {ts}
                    </span>
                )}
            </div>

            <div className="mt-3 flex-1">
                {editing ? (
                    <form onSubmit={handleSubmit}>
                        <Textarea
                            value={form.data.content}
                            onChange={(e) => form.setData('content', e.target.value)}
                            rows={5}
                            className="resize-none text-[12.5px]"
                            maxLength={5000}
                        />
                        <div className="mt-2 flex justify-end gap-1.5">
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
                    <p className="text-[12.5px] leading-relaxed whitespace-pre-wrap text-slate-700">
                        {note.content}
                    </p>
                )}
            </div>

            {!editing && (
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                    <span className="text-[10.5px] text-slate-400">
                        {formatDate(note.updated_at ?? note.created_at)}
                    </span>
                    <div className="flex items-center gap-0.5">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="size-7 text-slate-400 hover:text-slate-700"
                            onClick={onEdit}
                            title="Edit"
                        >
                            <Pencil className="size-3.5" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="size-7 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            onClick={onDelete}
                            title="Hapus"
                        >
                            <Trash2 className="size-3.5" />
                        </Button>
                    </div>
                </div>
            )}
        </li>
    );
}
