import { Head, Link, router } from '@inertiajs/react';
import {
    BookOpen,
    Check,
    Eye,
    GraduationCap,
    Layers,
    Pencil,
    Plus,
    Search,
    Send,
    Trash2,
    Users,
    X,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import type { Paginator } from '@/components/data-table/data-table-pagination';
import { IconChevR } from '@/components/learnpath-icons';
import { StatusBadge } from '@/components/status/status-badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { storageUrl } from '@/lib/storage-url';

type Course = {
    id: number;
    title: string;
    subtitle: string | null;
    slug: string;
    thumbnail: string | null;
    price: number;
    level: string | null;
    review_status: 'draft' | 'pending_review' | 'published' | 'rejected';
    sections_count: number;
    lessons_count: number;
    enrollments_count: number;
    category: { id: number; name: string } | null;
    instructor: { id: number; name: string } | null;
};

type CategoryOption = { id: number; name: string };
type ReviewStatusOption = { value: string; label: string };

type Permissions = {
    canCreate: boolean;
    canReview: boolean;
    isInstructor: boolean;
};

type Props = {
    courses: Paginator<Course>;
    filters: {
        search?: string;
        category_id?: string;
        review_status?: string;
    };
    categoryOptions: CategoryOption[];
    reviewStatusOptions: ReviewStatusOption[];
    permissions: Permissions;
};

function formatRupiah(value: number): string {
    if (value === 0) {
        return 'Gratis';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

const LEVEL_LABELS: Record<string, string> = {
    beginner: 'Pemula',
    intermediate: 'Menengah',
    advanced: 'Lanjutan',
    all: 'Semua Level',
};

export default function CoursesIndex({
    courses,
    filters,
    categoryOptions,
    reviewStatusOptions,
    permissions,
}: Props) {
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteName, setDeleteName] = useState<string>('');
    const [deleting, setDeleting] = useState(false);

    const [approveTarget, setApproveTarget] = useState<Course | null>(null);
    const [approving, setApproving] = useState(false);

    const [rejectTarget, setRejectTarget] = useState<Course | null>(null);
    const [rejectNotes, setRejectNotes] = useState('');
    const [rejecting, setRejecting] = useState(false);

    const [submitTarget, setSubmitTarget] = useState<Course | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkApproveOpen, setBulkApproveOpen] = useState(false);
    const [bulkRejectOpen, setBulkRejectOpen] = useState(false);
    const [bulkSubmitOpen, setBulkSubmitOpen] = useState(false);
    const [bulkRejectNotes, setBulkRejectNotes] = useState('');
    const [bulkProcessing, setBulkProcessing] = useState(false);

    const [searchInput, setSearchInput] = useState(filters.search ?? '');

    const isReviewable = (c: Course) =>
        permissions.canReview && c.review_status === 'pending_review';
    const isSubmittable = (c: Course) =>
        permissions.isInstructor &&
        (c.review_status === 'draft' || c.review_status === 'rejected');
    const isSelectable = (c: Course) => isReviewable(c) || isSubmittable(c);

    const selectedCourses = courses.data.filter((c) => selectedIds.has(c.id));
    const selectedReviewable = selectedCourses.filter(isReviewable);
    const selectedSubmittable = selectedCourses.filter(isSubmittable);

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const selectableInPage = courses.data.filter(isSelectable);
    const allSelectableSelected =
        selectableInPage.length > 0 &&
        selectableInPage.every((c) => selectedIds.has(c.id));

    const toggleSelectAll = () => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allSelectableSelected) {
                selectableInPage.forEach((c) => next.delete(c.id));
            } else {
                selectableInPage.forEach((c) => next.add(c.id));
            }
            return next;
        });
    };

    const clearSelection = () => setSelectedIds(new Set());

    const performBulkApprove = () => {
        const ids = selectedReviewable.map((c) => c.id);
        if (ids.length === 0) return;
        setBulkProcessing(true);
        router.post(
            '/admin/courses/bulk/approve',
            { ids },
            {
                preserveScroll: true,
                onFinish: () => {
                    setBulkProcessing(false);
                    setBulkApproveOpen(false);
                    clearSelection();
                },
            },
        );
    };

    const performBulkReject = () => {
        const ids = selectedReviewable.map((c) => c.id);
        if (ids.length === 0) return;
        setBulkProcessing(true);
        router.post(
            '/admin/courses/bulk/reject',
            { ids, review_notes: bulkRejectNotes },
            {
                preserveScroll: true,
                onFinish: () => {
                    setBulkProcessing(false);
                    setBulkRejectOpen(false);
                    setBulkRejectNotes('');
                    clearSelection();
                },
            },
        );
    };

    const performBulkSubmit = () => {
        const ids = selectedSubmittable.map((c) => c.id);
        if (ids.length === 0) return;
        setBulkProcessing(true);
        router.post(
            '/admin/courses/bulk/submit-review',
            { ids },
            {
                preserveScroll: true,
                onFinish: () => {
                    setBulkProcessing(false);
                    setBulkSubmitOpen(false);
                    clearSelection();
                },
            },
        );
    };

    const performApprove = () => {
        if (!approveTarget) return;
        setApproving(true);
        router.post(`/admin/courses/${approveTarget.id}/approve`, {}, {
            preserveScroll: true,
            onFinish: () => {
                setApproving(false);
                setApproveTarget(null);
            },
        });
    };

    const performReject = () => {
        if (!rejectTarget) return;
        setRejecting(true);
        router.post(
            `/admin/courses/${rejectTarget.id}/reject`,
            { review_notes: rejectNotes },
            {
                preserveScroll: true,
                onFinish: () => {
                    setRejecting(false);
                    setRejectTarget(null);
                    setRejectNotes('');
                },
            },
        );
    };

    const performSubmitReview = () => {
        if (!submitTarget) return;
        setSubmitting(true);
        router.post(`/admin/courses/${submitTarget.id}/submit-review`, {}, {
            preserveScroll: true,
            onFinish: () => {
                setSubmitting(false);
                setSubmitTarget(null);
            },
        });
    };

    const handleFilter = (next: Record<string, string | undefined>) => {
        router.get(
            '/admin/courses',
            { ...filters, ...next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        handleFilter({ search: searchInput.trim() || undefined });
    };

    const performDelete = () => {
        if (!deleteId) return;
        setDeleting(true);
        router.delete(`/admin/courses/${deleteId}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeleteId(null);
            },
        });
    };

    const headerHint = permissions.isInstructor
        ? 'Course yang Anda buat sebagai mentor.'
        : permissions.canReview
            ? 'Tinjau dan setujui pengajuan course dari mentor.'
            : 'Daftar seluruh course di platform (read-only).';

    return (
        <>
            <Head title="Course" />
            <div className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                            <Link href="/admin/dashboard" className="hover:text-slate-700">
                                Dashboard
                            </Link>
                            <IconChevR size={12} className="text-slate-300" />
                            <span className="font-semibold text-slate-900">Course</span>
                        </nav>
                        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                            Master Course
                        </h1>
                        <p className="mt-1 text-[13.5px] text-slate-500">{headerHint}</p>
                    </div>
                    {permissions.canCreate && (
                        <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                            <Link href="/admin/courses/create">
                                <Plus className="mr-1.5 size-4" />
                                Tambah Course
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-[15px] font-bold text-slate-900">Daftar Course</h2>
                            <p className="mt-0.5 text-[12.5px] text-slate-500">
                                {courses.total} course terdaftar
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <form
                                onSubmit={handleSearchSubmit}
                                className="relative w-full sm:w-[280px]"
                            >
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Cari judul atau slug course..."
                                    className="h-9 rounded-xl pl-9"
                                />
                            </form>

                            <Select
                                value={filters.category_id ?? 'all'}
                                onValueChange={(value) =>
                                    handleFilter({
                                        category_id: value === 'all' ? undefined : value,
                                    })
                                }
                            >
                                <SelectTrigger className="h-9 w-full rounded-xl sm:w-[180px]">
                                    <SelectValue placeholder="Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Kategori</SelectItem>
                                    {categoryOptions.map((cat) => (
                                        <SelectItem key={cat.id} value={String(cat.id)}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.review_status ?? 'all'}
                                onValueChange={(value) =>
                                    handleFilter({
                                        review_status: value === 'all' ? undefined : value,
                                    })
                                }
                            >
                                <SelectTrigger className="h-9 w-full rounded-xl sm:w-[160px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    {reviewStatusOptions.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {selectableInPage.length > 0 && (
                        <div className="mb-3 flex items-center gap-2 text-[12px] text-slate-500">
                            <Checkbox
                                id="select-all-courses"
                                checked={allSelectableSelected}
                                onCheckedChange={toggleSelectAll}
                                aria-label="Pilih semua course yang bisa ditindak"
                            />
                            <label
                                htmlFor="select-all-courses"
                                className="cursor-pointer select-none font-medium"
                            >
                                Pilih semua di halaman ini ({selectableInPage.length} dapat ditindak)
                            </label>
                        </div>
                    )}

                    {selectedIds.size > 0 && (
                        <div className="mb-4 flex flex-col gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-[13px] sm:flex-row sm:items-center sm:justify-between">
                            <div className="font-semibold text-brand-800">
                                {selectedIds.size} course dipilih
                                {selectedReviewable.length > 0 && (
                                    <span className="ml-2 text-[12px] font-normal text-brand-700">
                                        · {selectedReviewable.length} pending review
                                    </span>
                                )}
                                {selectedSubmittable.length > 0 && (
                                    <span className="ml-2 text-[12px] font-normal text-brand-700">
                                        · {selectedSubmittable.length} bisa diajukan
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                                {selectedReviewable.length > 0 && (
                                    <>
                                        <Button
                                            size="sm"
                                            className="h-8 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                                            onClick={() => setBulkApproveOpen(true)}
                                        >
                                            <Check className="mr-1 size-3.5" />
                                            Setujui ({selectedReviewable.length})
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="h-8 rounded-xl bg-rose-600 text-white hover:bg-rose-700"
                                            onClick={() => setBulkRejectOpen(true)}
                                        >
                                            <XCircle className="mr-1 size-3.5" />
                                            Tolak ({selectedReviewable.length})
                                        </Button>
                                    </>
                                )}
                                {selectedSubmittable.length > 0 && (
                                    <Button
                                        size="sm"
                                        className="h-8 rounded-xl bg-brand-600 text-white hover:bg-brand-700"
                                        onClick={() => setBulkSubmitOpen(true)}
                                    >
                                        <Send className="mr-1 size-3.5" />
                                        Ajukan Review ({selectedSubmittable.length})
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 rounded-xl"
                                    onClick={clearSelection}
                                >
                                    <X className="mr-1 size-3.5" />
                                    Batal
                                </Button>
                            </div>
                        </div>
                    )}

                    {courses.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                            <div className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                                <BookOpen className="size-5" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-slate-900">
                                    Belum ada course
                                </p>
                                <p className="text-sm text-slate-500">
                                    {permissions.canCreate
                                        ? 'Mulai dengan menambahkan course pertama Anda.'
                                        : 'Belum ada course yang terdaftar di platform.'}
                                </p>
                            </div>
                            {permissions.canCreate && (
                                <Button
                                    asChild
                                    className="mt-2 rounded-xl bg-brand-600 hover:bg-brand-700"
                                >
                                    <Link href="/admin/courses/create">
                                        <Plus className="mr-1.5 size-4" />
                                        Tambah Course
                                    </Link>
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {courses.data.map((course) => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    selected={selectedIds.has(course.id)}
                                    selectable={isSelectable(course)}
                                    canReview={isReviewable(course)}
                                    canSubmit={isSubmittable(course)}
                                    isInstructor={permissions.isInstructor}
                                    onToggleSelect={() => toggleSelect(course.id)}
                                    onApprove={() => setApproveTarget(course)}
                                    onReject={() => setRejectTarget(course)}
                                    onSubmitReview={() => setSubmitTarget(course)}
                                    onDelete={() => {
                                        setDeleteId(course.id);
                                        setDeleteName(course.title);
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    <div className="mt-5">
                        <DataTablePagination paginator={courses} />
                    </div>
                </div>
            </div>

            <Dialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus course?</DialogTitle>
                        <DialogDescription>
                            Course <span className="font-semibold">"{deleteName}"</span> beserta
                            section, lesson, enrollment, dan data terkait akan dihapus permanen.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>
                            <X className="mr-1.5 size-4" />
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={performDelete}
                            disabled={deleting}
                        >
                            <Trash2 className="mr-1.5 size-4" />
                            {deleting ? 'Menghapus...' : 'Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={approveTarget !== null}
                onOpenChange={(open) => !open && setApproveTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Setujui & publikasi course?</DialogTitle>
                        <DialogDescription>
                            Course <span className="font-semibold">"{approveTarget?.title}"</span>{' '}
                            akan langsung tampil di catalog publik dan dapat dibeli peserta.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApproveTarget(null)}>
                            <X className="mr-1.5 size-4" />
                            Batal
                        </Button>
                        <Button
                            onClick={performApprove}
                            disabled={approving}
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                            <Check className="mr-1.5 size-4" />
                            {approving ? 'Menyetujui...' : 'Ya, Setujui'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={rejectTarget !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setRejectTarget(null);
                        setRejectNotes('');
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tolak course & kirim catatan revisi</DialogTitle>
                        <DialogDescription>
                            Course <span className="font-semibold">"{rejectTarget?.title}"</span>{' '}
                            akan dikembalikan ke instructor sebagai draft dengan catatan revisi
                            yang Anda tulis.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-1.5">
                        <label className="text-[12.5px] font-semibold text-slate-700">
                            Catatan revisi
                        </label>
                        <Textarea
                            rows={4}
                            placeholder="Contoh: Materi modul 2 belum lengkap, tambahkan studi kasus dan contoh kode."
                            value={rejectNotes}
                            onChange={(e) => setRejectNotes(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setRejectTarget(null);
                                setRejectNotes('');
                            }}
                        >
                            <X className="mr-1.5 size-4" />
                            Batal
                        </Button>
                        <Button
                            onClick={performReject}
                            disabled={rejecting || !rejectNotes.trim()}
                            className="bg-rose-600 text-white hover:bg-rose-700"
                        >
                            <XCircle className="mr-1.5 size-4" />
                            {rejecting ? 'Mengirim...' : 'Tolak & Kirim Catatan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={bulkApproveOpen}
                onOpenChange={(open) => !open && setBulkApproveOpen(false)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Setujui {selectedReviewable.length} course sekaligus?
                        </DialogTitle>
                        <DialogDescription>
                            Semua course yang dipilih akan langsung dipublikasi ke catalog
                            publik. Course yang tidak berstatus pending review akan dilewati.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkApproveOpen(false)}>
                            <X className="mr-1.5 size-4" />
                            Batal
                        </Button>
                        <Button
                            onClick={performBulkApprove}
                            disabled={bulkProcessing}
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                            <Check className="mr-1.5 size-4" />
                            {bulkProcessing ? 'Memproses...' : 'Ya, Setujui Semua'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={bulkRejectOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setBulkRejectOpen(false);
                        setBulkRejectNotes('');
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Tolak {selectedReviewable.length} course sekaligus?
                        </DialogTitle>
                        <DialogDescription>
                            Catatan revisi akan dikirim ke setiap instructor pemilik course.
                            Course non-pending akan dilewati.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-1.5">
                        <label className="text-[12.5px] font-semibold text-slate-700">
                            Catatan revisi (berlaku untuk semua course terpilih)
                        </label>
                        <Textarea
                            rows={4}
                            placeholder="Tulis catatan revisi yang berlaku untuk semua course terpilih..."
                            value={bulkRejectNotes}
                            onChange={(e) => setBulkRejectNotes(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setBulkRejectOpen(false);
                                setBulkRejectNotes('');
                            }}
                        >
                            <X className="mr-1.5 size-4" />
                            Batal
                        </Button>
                        <Button
                            onClick={performBulkReject}
                            disabled={bulkProcessing || !bulkRejectNotes.trim()}
                            className="bg-rose-600 text-white hover:bg-rose-700"
                        >
                            <XCircle className="mr-1.5 size-4" />
                            {bulkProcessing ? 'Memproses...' : 'Ya, Tolak Semua'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={bulkSubmitOpen}
                onOpenChange={(open) => !open && setBulkSubmitOpen(false)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Ajukan {selectedSubmittable.length} course untuk review?
                        </DialogTitle>
                        <DialogDescription>
                            Semua course yang dipilih akan dikirim ke Super Admin untuk
                            ditinjau. Setelah diajukan, course akan terkunci dari pengeditan
                            sampai disetujui atau dikembalikan dengan catatan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkSubmitOpen(false)}>
                            <X className="mr-1.5 size-4" />
                            Batal
                        </Button>
                        <Button
                            onClick={performBulkSubmit}
                            disabled={bulkProcessing}
                            className="bg-brand-600 text-white hover:bg-brand-700"
                        >
                            <Send className="mr-1.5 size-4" />
                            {bulkProcessing ? 'Memproses...' : 'Ya, Ajukan Semua'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={submitTarget !== null}
                onOpenChange={(open) => !open && setSubmitTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ajukan course untuk review?</DialogTitle>
                        <DialogDescription>
                            Course <span className="font-semibold">"{submitTarget?.title}"</span>{' '}
                            akan dikunci dari pengeditan sampai Super Admin menyetujui atau
                            mengembalikan dengan catatan revisi.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSubmitTarget(null)}>
                            <X className="mr-1.5 size-4" />
                            Batal
                        </Button>
                        <Button
                            onClick={performSubmitReview}
                            disabled={submitting}
                            className="bg-brand-600 text-white hover:bg-brand-700"
                        >
                            <Send className="mr-1.5 size-4" />
                            {submitting ? 'Mengirim...' : 'Ya, Ajukan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

type CourseCardProps = {
    course: Course;
    selected: boolean;
    selectable: boolean;
    canReview: boolean;
    canSubmit: boolean;
    isInstructor: boolean;
    onToggleSelect: () => void;
    onApprove: () => void;
    onReject: () => void;
    onSubmitReview: () => void;
    onDelete: () => void;
};

function CourseCard({
    course,
    selected,
    selectable,
    canReview,
    canSubmit,
    isInstructor,
    onToggleSelect,
    onApprove,
    onReject,
    onSubmitReview,
    onDelete,
}: CourseCardProps) {
    const thumb = storageUrl(course.thumbnail);
    const canEdit =
        isInstructor &&
        (course.review_status === 'draft' || course.review_status === 'rejected');
    const canDelete = isInstructor && course.review_status === 'draft';

    return (
        <article
            className={
                'group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 transition hover:shadow-[0_12px_28px_-12px_rgba(15,23,42,0.18)] ' +
                (selected
                    ? 'ring-2 ring-brand-500'
                    : 'ring-slate-200/70 hover:ring-brand-200')
            }
        >
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200">
                {thumb ? (
                    <img
                        src={thumb}
                        alt={course.title}
                        loading="lazy"
                        className="size-full object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center bg-gradient-to-br from-brand-500 to-brand-700">
                        <BookOpen className="size-10 text-white/50" />
                    </div>
                )}

                <div className="absolute top-3 right-3">
                    <StatusBadge status={course.review_status} />
                </div>

                {selectable && (
                    <label className="absolute top-3 left-3 flex size-7 cursor-pointer items-center justify-center rounded-lg bg-white/95 shadow ring-1 ring-slate-200 backdrop-blur transition hover:bg-white">
                        <Checkbox
                            checked={selected}
                            onCheckedChange={onToggleSelect}
                            aria-label={`Pilih ${course.title}`}
                            className="size-4"
                        />
                    </label>
                )}

                {course.level && (
                    <span className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-black/60 px-2.5 py-0.5 text-[10.5px] font-semibold text-white backdrop-blur">
                        {LEVEL_LABELS[course.level] ?? course.level}
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-brand-700 uppercase">
                        <span className="truncate">
                            {course.category?.name ?? 'Tanpa kategori'}
                        </span>
                    </div>
                    <h3 className="mt-1 line-clamp-2 text-[14.5px] font-bold leading-snug text-slate-900">
                        {course.title}
                    </h3>
                    {course.subtitle && (
                        <p className="mt-1 line-clamp-1 text-[12px] text-slate-500">
                            {course.subtitle}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2 text-[11.5px] text-slate-500">
                    <GraduationCap className="size-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">
                        {course.instructor?.name ?? 'Tanpa mentor'}
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-3 text-[11.5px] text-slate-600">
                    <span className="inline-flex items-center gap-1">
                        <BookOpen className="size-3.5 text-slate-400" />
                        <span className="tabular-nums font-semibold text-slate-900">
                            {course.lessons_count}
                        </span>{' '}
                        lesson
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <Layers className="size-3.5 text-slate-400" />
                        <span className="tabular-nums font-semibold text-slate-900">
                            {course.sections_count}
                        </span>{' '}
                        section
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <Users className="size-3.5 text-slate-400" />
                        <span className="tabular-nums font-semibold text-slate-900">
                            {course.enrollments_count}
                        </span>{' '}
                        peserta
                    </span>
                </div>

                <div className="mt-auto flex items-end justify-between gap-3">
                    <div>
                        <div className="text-[10.5px] font-semibold tracking-wide text-slate-400 uppercase">
                            Harga
                        </div>
                        <div
                            className={
                                course.price === 0
                                    ? 'text-[14.5px] font-extrabold text-emerald-600'
                                    : 'text-[14.5px] font-extrabold text-slate-900 tabular-nums'
                            }
                        >
                            {formatRupiah(course.price)}
                        </div>
                    </div>
                    <Button
                        asChild
                        size="sm"
                        className="h-8 rounded-xl bg-brand-600 text-white shadow-sm hover:bg-brand-700"
                    >
                        <Link
                            href={`/admin/courses/${course.id}`}
                            title="Lihat detail course"
                        >
                            <Eye className="mr-1 size-3.5" />
                            Lihat
                        </Link>
                    </Button>
                </div>

                {(canReview || canSubmit || canEdit || canDelete) && (
                    <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
                        {canReview && (
                            <>
                                <Button
                                    size="sm"
                                    onClick={onApprove}
                                    className="h-7 rounded-lg bg-emerald-600 px-2.5 text-[11.5px] text-white hover:bg-emerald-700"
                                >
                                    <Check className="mr-1 size-3" />
                                    Setujui
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={onReject}
                                    className="h-7 rounded-lg bg-rose-600 px-2.5 text-[11.5px] text-white hover:bg-rose-700"
                                >
                                    <XCircle className="mr-1 size-3" />
                                    Tolak
                                </Button>
                            </>
                        )}
                        {canSubmit && (
                            <Button
                                size="sm"
                                onClick={onSubmitReview}
                                className="h-7 rounded-lg bg-brand-600 px-2.5 text-[11.5px] text-white hover:bg-brand-700"
                            >
                                <Send className="mr-1 size-3" />
                                Ajukan
                            </Button>
                        )}
                        {canEdit && (
                            <Button
                                asChild
                                size="sm"
                                className="h-7 rounded-lg bg-amber-500 px-2.5 text-[11.5px] text-white hover:bg-amber-600"
                            >
                                <Link href={`/admin/courses/${course.id}/edit`}>
                                    <Pencil className="mr-1 size-3" />
                                    Edit
                                </Link>
                            </Button>
                        )}
                        {canDelete && (
                            <Button
                                size="sm"
                                onClick={onDelete}
                                variant="outline"
                                className="h-7 rounded-lg border-rose-200 px-2.5 text-[11.5px] text-rose-600 hover:bg-rose-50"
                            >
                                <Trash2 className="size-3" />
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
}
