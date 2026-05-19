import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    CheckCircle2,
    Pencil,
    Plus,
    ShieldOff,
    Trash2,
    User as UserIcon,
    Users,
    X,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import {
    DataTablePagination
    
} from '@/components/data-table/data-table-pagination';
import type {Paginator} from '@/components/data-table/data-table-pagination';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Role = { id: number; name: string };

type AdminUser = {
    id: number;
    name: string;
    email: string;
    username: string | null;
    phone: string | null;
    status: string;
    email_verified_at: string | null;
    last_login_at: string | null;
    roles: Role[];
};

type Props = {
    users: Paginator<AdminUser>;
    filters: {
        search?: string;
        role?: string;
        status?: string;
    };
    roleOptions: Role[];
    stats: {
        total: number;
        active: number;
        suspended: number;
        banned: number;
    };
};

const ROLE_LABELS: Record<string, string> = {
    superadmin: 'Super Admin',
    admin_tenant: 'Admin Tenant',
    hr: 'HR',
    instructor: 'Instruktur',
    supervisor: 'Supervisor',
    employee: 'Karyawan',
    user_public: 'Pengguna Publik',
};

const ROLE_TONES: Record<string, string> = {
    superadmin: 'border-transparent bg-brand-50 text-brand-700',
    admin_tenant: 'border-transparent bg-brand-50 text-brand-700',
    hr: 'border-transparent bg-sky-50 text-sky-700',
    instructor: 'border-transparent bg-emerald-50 text-emerald-700',
    supervisor: 'border-transparent bg-amber-50 text-amber-700',
    employee: 'border-transparent bg-slate-100 text-slate-600',
    user_public: 'border-transparent bg-zinc-100 text-zinc-700',
};

const STATUS_TONES: Record<string, string> = {
    active: 'border-transparent bg-emerald-100 text-emerald-700',
    suspended: 'border-transparent bg-amber-100 text-amber-700',
    banned: 'border-transparent bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
    active: 'Aktif',
    suspended: 'Suspended',
    banned: 'Banned',
};

function initials(name: string): string {
    return name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function formatDate(value: string | null): string {
    if (!value) {
return '-';
}

    return new Date(value).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function UsersIndex({ users, filters, roleOptions, stats }: Props) {
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteName, setDeleteName] = useState<string>('');
    const [deleting, setDeleting] = useState(false);

    const handleFilter = (next: Record<string, string | undefined>) => {
        router.get(
            '/admin/users',
            { ...filters, ...next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const performDelete = () => {
        if (!deleteId) {
return;
}

        setDeleting(true);
        router.delete(`/admin/users/${deleteId}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeleteId(null);
            },
        });
    };

    const columns: ColumnDef<AdminUser>[] = [
        {
            id: 'name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="User" />
            ),
            accessorKey: 'name',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-300 to-brand-600 text-sm font-bold text-white">
                        {initials(row.original.name)}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900">
                                {row.original.name}
                            </span>
                            {row.original.email_verified_at && (
                                <CheckCircle2 className="size-3.5 text-emerald-500" />
                            )}
                        </div>
                        <div className="truncate text-[11.5px] text-slate-500">
                            {row.original.email}
                            {row.original.username && (
                                <span className="text-slate-400">
                                    {' '}
                                    · @{row.original.username}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ),
            meta: { label: 'User' },
        },
        {
            id: 'role',
            header: 'Role',
            cell: ({ row }) => {
                const role = row.original.roles[0]?.name;

                if (!role) {
                    return <span className="text-slate-400 italic">Tanpa role</span>;
                }

                return (
                    <Badge className={ROLE_TONES[role] ?? 'bg-slate-100 text-slate-600'}>
                        {ROLE_LABELS[role] ?? role}
                    </Badge>
                );
            },
            meta: { label: 'Role' },
        },
        {
            id: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge className={STATUS_TONES[row.original.status] ?? ''}>
                    {STATUS_LABELS[row.original.status] ?? row.original.status}
                </Badge>
            ),
            meta: { label: 'Status' },
        },
        {
            id: 'last_login_at',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Login Terakhir" />
            ),
            accessorKey: 'last_login_at',
            cell: ({ row }) => (
                <span className="text-[12.5px] text-slate-600">
                    {formatDate(row.original.last_login_at)}
                </span>
            ),
            meta: { label: 'Login Terakhir' },
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                const isSuperAdmin = row.original.roles[0]?.name === 'superadmin';

                return (
                    <div className="flex items-center justify-end gap-1.5">
                        <Button asChild size="sm" className="h-8 rounded-xl bg-emerald-600 text-white shadow-sm hover:bg-emerald-700">
                            <Link href={`/admin/users/${row.original.id}/edit`}>
                                <Pencil className="mr-1 size-3.5" />
                                Edit
                            </Link>
                        </Button>
                        <Button
                            size="sm"
                            className="h-8 rounded-xl bg-rose-600 text-white shadow-sm hover:bg-rose-700 disabled:opacity-40"
                            disabled={isSuperAdmin}
                            onClick={() => {
                                setDeleteId(row.original.id);
                                setDeleteName(row.original.name);
                            }}
                            title={isSuperAdmin ? 'Super Admin tidak dapat dihapus' : 'Hapus'}
                        >
                            <Trash2 className="mr-1 size-3.5" />
                            Hapus
                        </Button>
                    </div>
                );
            },
            meta: { label: 'Aksi', className: 'w-[100px] text-right' },
            enableSorting: false,
            enableHiding: false,
        },
    ];

    return (
        <>
            <Head title="Users" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Users</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Manajemen User
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Kelola akun pengguna, role, dan status akses.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard
                        label="Total User"
                        value={stats.total}
                        icon={Users}
                        tint="bg-brand-50"
                        text="text-brand-600"
                    />
                    <StatCard
                        label="Aktif"
                        value={stats.active}
                        icon={CheckCircle2}
                        tint="bg-emerald-50"
                        text="text-emerald-600"
                    />
                    <StatCard
                        label="Suspended"
                        value={stats.suspended}
                        icon={ShieldOff}
                        tint="bg-amber-50"
                        text="text-amber-600"
                    />
                    <StatCard
                        label="Banned"
                        value={stats.banned}
                        icon={XCircle}
                        tint="bg-red-50"
                        text="text-red-600"
                    />
                </div>

                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-[15px] font-bold text-slate-900">
                                Daftar User
                            </h2>
                            <p className="mt-0.5 text-[12.5px] text-slate-500">
                                {users.total} user terdaftar
                            </p>
                        </div>
                        <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                            <Link href="/admin/users/create">
                                <Plus className="mr-1.5 size-4" />
                                Tambah User
                            </Link>
                        </Button>
                    </div>

                    <DataTable
                        columns={columns}
                        data={users.data}
                        searchValue={filters.search ?? ''}
                        searchPlaceholder="Cari nama, email, atau username..."
                        onSearchChange={(value) =>
                            handleFilter({ search: value || undefined })
                        }
                        toolbarSlot={
                            <>
                                <Select
                                    value={filters.role ?? 'all'}
                                    onValueChange={(value) =>
                                        handleFilter({
                                            role: value === 'all' ? undefined : value,
                                        })
                                    }
                                >
                                    <SelectTrigger className="h-9 w-[160px]">
                                        <SelectValue placeholder="Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Role</SelectItem>
                                        {roleOptions.map((r) => (
                                            <SelectItem key={r.id} value={r.name}>
                                                {ROLE_LABELS[r.name] ?? r.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filters.status ?? 'all'}
                                    onValueChange={(value) =>
                                        handleFilter({
                                            status: value === 'all' ? undefined : value,
                                        })
                                    }
                                >
                                    <SelectTrigger className="h-9 w-[140px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="active">Aktif</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                        <SelectItem value="banned">Banned</SelectItem>
                                    </SelectContent>
                                </Select>
                            </>
                        }
                        emptyState={
                            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                                <div className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                                    <UserIcon className="size-5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-slate-900">
                                        Belum ada user
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        Tambahkan user pertama untuk mulai mengelola akses.
                                    </p>
                                </div>
                                <Button
                                    asChild
                                    className="mt-2 rounded-xl bg-brand-600 hover:bg-brand-700"
                                >
                                    <Link href="/admin/users/create">
                                        <Plus className="mr-1.5 size-4" />
                                        Tambah User
                                    </Link>
                                </Button>
                            </div>
                        }
                    />

                    <div className="mt-4">
                        <DataTablePagination paginator={users} />
                    </div>
                </div>
            </div>

            <Dialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus user?</DialogTitle>
                        <DialogDescription>
                            User <span className="font-semibold">"{deleteName}"</span> akan
                            di-soft-delete. Data terkait (enrollment, sertifikat, dll) akan tetap
                            ada namun user tidak bisa login lagi.
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
                            {deleting ? 'Menghapus...' : 'Hapus User'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
    value: number;
    icon: typeof Users;
    tint: string;
    text: string;
}) {
    return (
        <div className="rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="flex items-center gap-3">
                <div className={`grid size-10 place-items-center rounded-xl ${tint} ${text}`}>
                    <Icon className="size-5" />
                </div>
                <div>
                    <div className="text-[11px] tracking-wider text-slate-500 uppercase">
                        {label}
                    </div>
                    <div className="text-[20px] font-extrabold text-slate-900 tabular-nums">
                        {value.toLocaleString('id-ID')}
                    </div>
                </div>
            </div>
        </div>
    );
}
