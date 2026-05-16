import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    BadgeCheck,
    BookOpen,
    GraduationCap,
    Pencil,
    Sparkles,
    UserCheck,
} from 'lucide-react';

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
};

type Instructor = {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    instructed_courses_count: number;
    instructor_profile: InstructorProfile | null;
};

type Props = {
    instructors: Paginator<Instructor>;
    filters: { search?: string; verified?: string };
    stats: {
        total: number;
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
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        title={
                            row.original.instructor_profile?.is_verified
                                ? 'Cabut verifikasi'
                                : 'Verifikasi'
                        }
                        onClick={() => toggleVerified(row.original.id)}
                    >
                        <BadgeCheck
                            className={
                                row.original.instructor_profile?.is_verified
                                    ? 'size-4 text-sky-500'
                                    : 'size-4 text-slate-400'
                            }
                        />
                    </Button>
                    <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="size-8"
                    >
                        <Link
                            href={`/admin/instructors/${row.original.id}/edit`}
                        >
                            <Pencil className="size-4 text-slate-500" />
                        </Link>
                    </Button>
                </div>
            ),
            meta: { label: 'Aksi', className: 'w-[100px] text-right' },
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

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard
                        label="Total Instruktur"
                        value={stats.total.toLocaleString('id-ID')}
                        icon={GraduationCap}
                        tint="bg-brand-50"
                        text="text-brand-600"
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
                                    <SelectItem value="yes">
                                        Verified
                                    </SelectItem>
                                    <SelectItem value="no">
                                        Belum verified
                                    </SelectItem>
                                </SelectContent>
                            </Select>
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
