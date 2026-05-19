import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    BookOpen,
    ChevronDown,
    Compass,
    Plus,
    Search,
    Settings,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type AttachedCourse = {
    id: number;
    title: string;
    level: string | null;
    duration_minutes: number;
    sort_order: number;
    is_required: boolean;
};

type AvailableCourse = {
    id: number;
    title: string;
    level: string | null;
    duration_minutes: number;
};

type Path = {
    id: number;
    title: string;
    slug: string;
    subtitle: string | null;
    level: string | null;
    duration_weeks: number | null;
    is_published: boolean;
    total_courses: number;
    total_students: number;
    enrollments_count: number;
    position: { id: number; name: string } | null;
    courses: AttachedCourse[];
};

type Props = {
    path: Path;
    availableCourses: AvailableCourse[];
};

function formatDuration(minutes: number): string {
    if (!minutes) return '-';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m} mnt`;
    return `${h}j ${m}m`;
}

const LEVEL_LABEL: Record<string, string> = {
    beginner: 'Pemula',
    intermediate: 'Menengah',
    advanced: 'Lanjutan',
};

export default function LearningPathShow({ path, availableCourses }: Props) {
    const [attachOpen, setAttachOpen] = useState(false);
    const [removePathOpen, setRemovePathOpen] = useState(false);
    const [detachId, setDetachId] = useState<number | null>(null);
    const [search, setSearch] = useState('');

    const filteredAvailable = useMemo(() => {
        const term = search.toLowerCase().trim();
        if (!term) return availableCourses;
        return availableCourses.filter((c) =>
            c.title.toLowerCase().includes(term),
        );
    }, [availableCourses, search]);

    const moveCourse = (idx: number, direction: 'up' | 'down') => {
        const next = [...path.courses];
        const target = direction === 'up' ? idx - 1 : idx + 1;
        if (target < 0 || target >= next.length) return;
        [next[idx], next[target]] = [next[target], next[idx]];

        router.patch(
            `/admin/learning-paths/${path.id}/courses/reorder`,
            { course_ids: next.map((c) => c.id) },
            { preserveScroll: true },
        );
    };

    const attachCourse = (courseId: number) => {
        router.post(
            `/admin/learning-paths/${path.id}/courses`,
            { course_id: courseId, is_required: true },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAttachOpen(false);
                    setSearch('');
                },
            },
        );
    };

    const performDetach = () => {
        if (!detachId) return;
        router.delete(`/admin/learning-paths/${path.id}/courses/${detachId}`, {
            preserveScroll: true,
            onFinish: () => setDetachId(null),
        });
    };

    const performRemovePath = () => {
        router.delete(`/admin/learning-paths/${path.id}`, {
            onFinish: () => setRemovePathOpen(false),
        });
    };

    return (
        <>
            <Head title={`Kelola Path — ${path.title}`} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <Link href="/admin/learning-paths" className="hover:text-slate-700">
                            Learning Path
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">{path.title}</span>
                    </nav>
                    <div className="mt-1.5 flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h1 className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
                                <Compass className="size-6 text-brand-600" />
                                {path.title}
                            </h1>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[12.5px]">
                                <Badge
                                    className={
                                        path.is_published
                                            ? 'border-transparent bg-emerald-50 text-emerald-700'
                                            : 'border-transparent bg-slate-100 text-slate-700'
                                    }
                                >
                                    {path.is_published ? 'Published' : 'Draft'}
                                </Badge>
                                {path.level && (
                                    <Badge className="border-transparent bg-slate-100 text-slate-700">
                                        {LEVEL_LABEL[path.level] ?? path.level}
                                    </Badge>
                                )}
                                {path.position && (
                                    <span className="text-slate-500">
                                        Untuk jabatan{' '}
                                        <span className="font-semibold text-slate-800">
                                            {path.position.name}
                                        </span>
                                    </span>
                                )}
                            </div>
                            {path.subtitle && (
                                <p className="mt-1 max-w-2xl text-[13px] text-slate-600">
                                    {path.subtitle}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button asChild variant="outline" size="sm" className="rounded-xl">
                                <Link href={`/admin/learning-paths/${path.id}/edit`}>
                                    <Settings className="mr-1.5 size-4" />
                                    Edit Metadata
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                onClick={() => setRemovePathOpen(true)}
                            >
                                <Trash2 className="mr-1.5 size-4" />
                                Hapus
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Stat label="Total Course" value={String(path.total_courses)} />
                    <Stat label="Durasi" value={path.duration_weeks ? `${path.duration_weeks} mgg` : '-'} />
                    <Stat label="Peserta" value={String(path.enrollments_count)} />
                    <Stat label="Status" value={path.is_published ? 'Live' : 'Draft'} />
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-[15px] font-bold text-slate-900">
                                Course dalam Path
                            </h2>
                            <p className="mt-0.5 text-[12.5px] text-slate-500">
                                Urutan course sesuai panah atas/bawah.
                            </p>
                        </div>
                        <Button
                            size="sm"
                            className="rounded-xl bg-brand-600 hover:bg-brand-700"
                            onClick={() => setAttachOpen(true)}
                        >
                            <Plus className="mr-1.5 size-4" />
                            Tambah Course
                        </Button>
                    </div>

                    {path.courses.length === 0 ? (
                        <div className="py-10 text-center">
                            <BookOpen className="mx-auto mb-2 size-8 text-slate-400" />
                            <p className="text-sm font-semibold text-slate-900">
                                Belum ada course
                            </p>
                            <p className="mt-1 text-[12.5px] text-slate-500">
                                Tambahkan minimal 1 course agar path dapat di-publish.
                            </p>
                        </div>
                    ) : (
                        <ol className="space-y-2">
                            {path.courses.map((c, idx) => (
                                <li
                                    key={c.id}
                                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
                                >
                                    <div className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 text-[12.5px] font-extrabold text-brand-700">
                                        {idx + 1}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="line-clamp-1 text-[13.5px] font-semibold text-slate-900">
                                            {c.title}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                                            <span>{formatDuration(c.duration_minutes)}</span>
                                            <span>{LEVEL_LABEL[c.level ?? ''] ?? '-'}</span>
                                            {!c.is_required && (
                                                <span className="text-amber-700">Opsional</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1.5">
                                        <Button
                                            size="sm"
                                            className="h-8 rounded-xl bg-slate-700 text-white shadow-sm hover:bg-slate-800"
                                            disabled={idx === 0}
                                            onClick={() => moveCourse(idx, 'up')}
                                            title="Pindah ke atas"
                                        >
                                            <ArrowUp className="mr-1 size-3.5" />
                                            Naik
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="h-8 rounded-xl bg-slate-700 text-white shadow-sm hover:bg-slate-800"
                                            disabled={idx === path.courses.length - 1}
                                            onClick={() => moveCourse(idx, 'down')}
                                            title="Pindah ke bawah"
                                        >
                                            <ArrowDown className="mr-1 size-3.5" />
                                            Turun
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    className="h-8 rounded-xl bg-slate-700 text-white shadow-sm hover:bg-slate-800"
                                                >
                                                    <ChevronDown className="mr-1 size-3.5" />
                                                    Aksi
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    className="text-rose-600 focus:text-rose-700"
                                                    onClick={() => setDetachId(c.id)}
                                                >
                                                    <Trash2 className="mr-1.5 size-4" />
                                                    Lepas dari Path
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </div>

            <Dialog open={attachOpen} onOpenChange={setAttachOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Tambah Course ke Path</DialogTitle>
                        <DialogDescription>
                            Pilih course yang sudah published. Course akan ditambahkan di urutan
                            terakhir.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari course..."
                            className="pl-9"
                        />
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-slate-200">
                        {filteredAvailable.length === 0 ? (
                            <div className="px-4 py-10 text-center">
                                <p className="text-[13px] font-semibold text-slate-900">
                                    Tidak ada course tersedia
                                </p>
                                <p className="mt-1 text-[11.5px] text-slate-500">
                                    Semua course published sudah ada di path ini, atau coba kata
                                    kunci lain.
                                </p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {filteredAvailable.map((c) => (
                                    <li
                                        key={c.id}
                                        className="flex items-center gap-3 px-4 py-3"
                                    >
                                        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-500">
                                            <BookOpen className="size-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="line-clamp-1 text-[13px] font-semibold text-slate-900">
                                                {c.title}
                                            </div>
                                            <div className="text-[11px] text-slate-500">
                                                {formatDuration(c.duration_minutes)}
                                                {c.level && (
                                                    <span className="ml-2">
                                                        {LEVEL_LABEL[c.level] ?? c.level}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="rounded-lg bg-brand-600 hover:bg-brand-700"
                                            onClick={() => attachCourse(c.id)}
                                        >
                                            <Plus className="mr-1 size-3.5" />
                                            Tambah
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={detachId !== null} onOpenChange={(o) => !o && setDetachId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Lepas course dari path?</DialogTitle>
                        <DialogDescription>
                            Course hanya dilepas dari path ini. Enrollment course-nya tetap
                            tersimpan untuk peserta yang sudah daftar.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDetachId(null)}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={performDetach}>
                            Lepas Course
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={removePathOpen} onOpenChange={setRemovePathOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus learning path?</DialogTitle>
                        <DialogDescription>
                            Path <strong>{path.title}</strong> akan dihapus permanen. Path
                            enrollment peserta juga terhapus, tapi enrollment course mereka
                            tetap ada.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRemovePathOpen(false)}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={performRemovePath}>
                            Hapus Path
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="text-[10.5px] tracking-wider text-slate-500 uppercase">
                {label}
            </div>
            <div className={cn('mt-1 text-[18px] font-extrabold text-slate-900 tabular-nums')}>
                {value}
            </div>
        </div>
    );
}
