import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    BadgeCheck,
    BookOpen,
    Check,
    Clock,
    Eye,
    FileText,
    GraduationCap,
    Pencil,
    Sparkles,
    UserCheck,
    X,
} from 'lucide-react';
import { useState } from 'react';

import { DataTable } from '@/components/data-table/data-table';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import type { Paginator } from '@/components/data-table/data-table-pagination';
import { IconChevR } from '@/components/learnpath-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type InstructorProfile = {
    id: number;
    headline: string | null;
    photo_path: string | null;
    expertise: string[] | null;
    is_verified: boolean;
    is_active: boolean;
    cv_path: string | null;
    cv_original_name: string | null;
};

type Instructor = {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    status: 'active' | 'pending_approval' | 'rejected' | 'suspended';
    instructed_courses_count: number;
    instructor_profile: InstructorProfile | null;
};

type Props = {
    instructors: Paginator<Instructor>;
    filters: { search?: string; verified?: string; status?: string };
    stats: {
        total: number;
        pending: number;
        verified: number;
        active: number;
        with_courses: number;
    };
};

function initials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function photoUrl(path: string | null): string | undefined {
    if (!path) {
        return undefined;
    }

    if (path.startsWith('http')) {
        return path;
    }

    return `/storage/${path}`;
}

export default function InstructorsIndex({
    instructors,
    filters,
    stats,
}: Props) {
    const handleFilter = (next: Record<string, string | undefined>) => {
        router.get(
            '/admin/instructors',
            { ...filters, ...next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const toggleVerified = (id: number) => {
        router.post(
            `/admin/instructors/${id}/toggle-verified`,
            {},
            { preserveScroll: true },
        );
    };

    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const approve = (id: number, name: string) => {
        if (!window.confirm(`Setujui pendaftaran mentor ${name}?`)) return;
        router.post(`/admin/instructors/${id}/approve`, {}, { preserveScroll: true });
    };

    const submitReject = () => {
        if (rejectingId === null) return;
        router.post(
            `/admin/instructors/${rejectingId}/reject`,
            { reason: rejectReason },
            {
                preserveScroll: true,
                onFinish: () => {
                    setRejectingId(null);
                    setRejectReason('');
                },
            },
        );
    };

    const columns: ColumnDef<Instructor>[] = [
        {
            id: 'profile',
            header: 'Instruktur',
            cell: ({ row }) => {
                const photo = photoUrl(
                    row.original.instructor_profile?.photo_path ??
                        row.original.avatar,
                );

                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="size-10 ring-2 ring-slate-100">
                            {photo && (
                                <AvatarImage
                                    src={photo}
                                    alt={row.original.name}
                                />
                            )}
                            <AvatarFallback className="bg-brand-50 text-[12px] font-bold text-brand-700">
                                {initials(row.original.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                                <div className="truncate font-semibold text-slate-900">
                                    {row.original.name}
                                </div>
                                {row.original.instructor_profile
                                    ?.is_verified && (
                                    <BadgeCheck className="size-4 text-sky-500" />
                                )}
                            </div>
                            <div className="truncate text-[11.5px] text-slate-500">
                                {row.original.email}
                            </div>
                        </div>
                    </div>
                );
            },
            meta: { label: 'Instruktur' },
        },
        {
            id: 'headline',
            header: 'Headline',
            cell: ({ row }) => (
                <div className="max-w-[260px] truncate text-[12.5px] text-slate-700">
                    {row.original.instructor_profile?.headline ?? (
                        <span className="text-slate-400 italic">
                            Belum diisi
                        </span>
                    )}
                </div>
            ),
            meta: { label: 'Headline' },
        },
        {
            id: 'expertise',
            header: 'Expertise',
            cell: ({ row }) => {
                const tags = row.original.instructor_profile?.expertise ?? [];

                if (tags.length === 0) {
                    return (
                        <span className="text-[12px] text-slate-400 italic">
                            -
                        </span>
                    );
                }

                return (
                    <div className="flex max-w-[240px] flex-wrap gap-1">
                        {tags.slice(0, 3).map((tag) => (
                            <Badge
                                key={tag}
                                className="border-transparent bg-violet-50 px-1.5 py-0 text-[10.5px] font-semibold text-violet-700"
                            >
                                {tag}
                            </Badge>
                        ))}
                        {tags.length > 3 && (
                            <span className="text-[11px] text-slate-500">
                                +{tags.length - 3}
                            </span>
                        )}
                    </div>
                );
            },
            meta: { label: 'Expertise' },
        },
        {
            id: 'courses',
            header: 'Course',
            cell: ({ row }) => (
                <div className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-700">
                    <BookOpen className="size-3.5 text-slate-400" />
                    <span className="tabular-nums">
                        {row.original.instructed_courses_count}
                    </span>
                </div>
            ),
            meta: { label: 'Course', className: 'w-[100px]' },
        },
        {
            id: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const profile = row.original.instructor_profile;

                if (row.original.status === 'pending_approval') {
                    return (
                        <Badge className="border-transparent bg-amber-100 text-amber-800">
                            <Clock className="mr-1 size-3" />
                            Menunggu approval
                        </Badge>
                    );
                }

                if (row.original.status === 'rejected') {
                    return (
                        <Badge className="border-transparent bg-rose-50 text-rose-700">
                            Ditolak
                        </Badge>
                    );
                }

                if (!profile) {
                    return (
                        <Badge className="border-transparent bg-slate-100 text-slate-600">
                            Belum lengkap
                        </Badge>
                    );
                }

                if (!profile.is_active) {
                    return (
                        <Badge className="border-transparent bg-rose-50 text-rose-700">
                            Nonaktif
                        </Badge>
                    );
                }

                if (profile.is_verified) {
                    return (
                        <Badge className="border-transparent bg-sky-50 text-sky-700">
                            <BadgeCheck className="mr-1 size-3" />
                            Verified
                        </Badge>
                    );
                }

                return (
                    <Badge className="border-transparent bg-amber-50 text-amber-700">
                        Belum verified
                    </Badge>
                );
            },
            meta: { label: 'Status' },
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                if (row.original.status === 'pending_approval') {
                    const hasCv = !!row.original.instructor_profile?.cv_path;

                    return (
                        <div className="flex items-center justify-end gap-1.5">
                            {hasCv && (
                                <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                    className="h-8 rounded-xl"
                                    title="Lihat CV mentor"
                                >
                                    <a
                                        href={`/admin/instructors/${row.original.id}/cv`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <FileText className="mr-1 size-3.5" />
                                        CV
                                    </a>
                                </Button>
                            )}
                            <Button
                                size="sm"
                                className="h-8 rounded-xl bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                                onClick={() => approve(row.original.id, row.original.name)}
                            >
                                <Check className="mr-1 size-3.5" />
                                Setujui
                            </Button>
                            <Button
                                size="sm"
                                className="h-8 rounded-xl bg-rose-600 text-white shadow-sm hover:bg-rose-700"
                                onClick={() => setRejectingId(row.original.id)}
                            >
                                <X className="mr-1 size-3.5" />
                                Tolak
                            </Button>
                        </div>
                    );
                }

                return (
                    <div className="flex items-center justify-end gap-1.5">
                        <Button
                            asChild
                            size="sm"
                            className="h-8 rounded-xl bg-sky-600 text-white shadow-sm hover:bg-sky-700"
                            title="Lihat detail"
                        >
                            <Link href={`/admin/instructors/${row.original.id}`}>
                                <Eye className="mr-1 size-3.5" />
                                Lihat
                            </Link>
                        </Button>
                        <Button
                            size="sm"
                            className={
                                row.original.instructor_profile?.is_verified
                                    ? 'h-8 rounded-xl bg-amber-500 text-white shadow-sm hover:bg-amber-600'
                                    : 'h-8 rounded-xl bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                            }
                            title={
                                row.original.instructor_profile?.is_verified
                                    ? 'Cabut verifikasi'
                                    : 'Verifikasi'
                            }
                            onClick={() => toggleVerified(row.original.id)}
                        >
                            <BadgeCheck className="mr-1 size-3.5" />
                            {row.original.instructor_profile?.is_verified
                                ? 'Cabut'
                                : 'Verifikasi'}
                        </Button>
                        <Button
                            asChild
                            size="sm"
                            className="h-8 rounded-xl bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                        >
                            <Link href={`/admin/instructors/${row.original.id}/edit`}>
                                <Pencil className="mr-1 size-3.5" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                );
            },
            meta: { label: 'Aksi', className: 'w-[280px] text-right' },
            enableSorting: false,
        },
    ];

    return (
        <>
            <Head title="Instruktur" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link
                            href="/admin/dashboard"
                            className="hover:text-slate-700"
                        >
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            Instruktur
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Instruktur
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Kelola profil publik para pengajar yang tampil di
                        marketplace.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                    <StatCard
                        label="Total"
                        value={stats.total.toLocaleString('id-ID')}
                        icon={GraduationCap}
                        tint="bg-brand-50"
                        text="text-brand-600"
                    />
                    <StatCard
                        label="Menunggu"
                        value={stats.pending.toLocaleString('id-ID')}
                        icon={Clock}
                        tint="bg-amber-50"
                        text="text-amber-600"
                    />
                    <StatCard
                        label="Verified"
                        value={stats.verified.toLocaleString('id-ID')}
                        icon={BadgeCheck}
                        tint="bg-sky-50"
                        text="text-sky-600"
                    />
                    <StatCard
                        label="Aktif"
                        value={stats.active.toLocaleString('id-ID')}
                        icon={UserCheck}
                        tint="bg-emerald-50"
                        text="text-emerald-600"
                    />
                    <StatCard
                        label="Punya Course"
                        value={stats.with_courses.toLocaleString('id-ID')}
                        icon={Sparkles}
                        tint="bg-violet-50"
                        text="text-violet-600"
                    />
                </div>

                {stats.pending > 0 && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <Clock className="mt-0.5 size-5 shrink-0 text-amber-600" />
                        <div className="flex-1 text-[13px] text-amber-900">
                            <strong>{stats.pending} pendaftaran mentor</strong> sedang menunggu approval Anda.
                            Tinjau dan setujui mereka segera supaya bisa mulai membuat course.
                        </div>
                        <Button
                            size="sm"
                            className="h-8 rounded-xl bg-amber-600 text-white shadow-sm hover:bg-amber-700"
                            onClick={() => handleFilter({ status: 'pending_approval' })}
                        >
                            Lihat
                        </Button>
                    </div>
                )}

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4">
                        <h2 className="text-[15px] font-bold text-slate-900">
                            Daftar Instruktur
                        </h2>
                        <p className="mt-0.5 text-[12.5px] text-slate-500">
                            {instructors.total} instruktur terdaftar
                        </p>
                    </div>

                    <DataTable
                        columns={columns}
                        data={instructors.data}
                        searchValue={filters.search ?? ''}
                        searchPlaceholder="Cari nama atau email instruktur..."
                        onSearchChange={(v) =>
                            handleFilter({ search: v || undefined })
                        }
                        toolbarSlot={
                            <>
                                <Select
                                    value={filters.status ?? 'all'}
                                    onValueChange={(v) =>
                                        handleFilter({
                                            status: v === 'all' ? undefined : v,
                                        })
                                    }
                                >
                                    <SelectTrigger className="h-9 w-[160px]">
                                        <SelectValue placeholder="Status akun" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua status</SelectItem>
                                        <SelectItem value="pending_approval">Menunggu approval</SelectItem>
                                        <SelectItem value="active">Aktif</SelectItem>
                                        <SelectItem value="rejected">Ditolak</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filters.verified ?? 'all'}
                                    onValueChange={(v) =>
                                        handleFilter({
                                            verified: v === 'all' ? undefined : v,
                                        })
                                    }
                                >
                                    <SelectTrigger className="h-9 w-[150px]">
                                        <SelectValue placeholder="Verifikasi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua</SelectItem>
                                        <SelectItem value="yes">Verified</SelectItem>
                                        <SelectItem value="no">Belum verified</SelectItem>
                                    </SelectContent>
                                </Select>
                            </>
                        }
                        emptyState={
                            <div className="py-12 text-center">
                                <GraduationCap className="mx-auto mb-3 size-6 text-slate-400" />
                                <p className="text-sm font-semibold text-slate-900">
                                    Belum ada instruktur
                                </p>
                                <p className="mt-1 text-[12.5px] text-slate-500">
                                    Tambah user baru dengan role instructor
                                    untuk mulai.
                                </p>
                            </div>
                        }
                    />

                    <div className="mt-4">
                        <DataTablePagination paginator={instructors} />
                    </div>
                </div>
            </div>

            {rejectingId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-900">Tolak pendaftaran mentor?</h3>
                        <p className="mt-1 text-[13px] text-slate-500">
                            Mentor akan diberitahu via email bahwa pendaftarannya tidak disetujui.
                            Anda bisa menyertakan alasan (opsional).
                        </p>
                        <label className="mt-4 block text-[12.5px] font-semibold text-slate-700">
                            Alasan penolakan (opsional)
                        </label>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Contoh: Portofolio belum lengkap, harap lengkapi sebelum daftar ulang."
                            rows={4}
                            maxLength={500}
                            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
                        />
                        <div className="mt-5 flex justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setRejectingId(null);
                                    setRejectReason('');
                                }}
                            >
                                Batal
                            </Button>
                            <Button
                                size="sm"
                                className="bg-rose-600 text-white hover:bg-rose-700"
                                onClick={submitReject}
                            >
                                <X className="mr-1 size-3.5" />
                                Tolak Pendaftaran
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function StatCard({
    label,
    value,
    icon: Icon,
    tint,
    text,
}: {
    label: string;
    value: string;
    icon: typeof GraduationCap;
    tint: string;
    text: string;
}) {
    return (
        <div className="rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="flex items-center gap-3">
                <div
                    className={`grid size-10 place-items-center rounded-xl ${tint} ${text}`}
                >
                    <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                    <div className="text-[11px] tracking-wider text-slate-500 uppercase">
                        {label}
                    </div>
                    <div className="truncate text-[18px] font-extrabold text-slate-900 tabular-nums">
                        {value}
                    </div>
                </div>
            </div>
        </div>
    );
}
