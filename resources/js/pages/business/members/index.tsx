import { Head, Link, router } from '@inertiajs/react';
import { Building2, Mail, RefreshCw, Search, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

import { DataTablePagination, type Paginator } from '@/components/data-table/data-table-pagination';
import { IconChevR } from '@/components/learnpath-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type Member = {
    id: number;
    role: string;
    joined_at: string | null;
    user: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        avatar_url: string | null;
        status: string | null;
        position: string | null;
        position_id: number | null;
    } | null;
};

type Props = {
    members: Paginator<Member>;
    organization: {
        name: string;
        seat_quota: number;
        seats_used: number;
        seats_available: number;
    };
    filters: { search?: string; role?: string };
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

function formatDate(iso: string | null): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function MembersIndex({ members, organization, filters }: Props) {
    const [removeId, setRemoveId] = useState<number | null>(null);
    const [removeName, setRemoveName] = useState('');
    const [removing, setRemoving] = useState(false);
    const [resyncingId, setResyncingId] = useState<number | null>(null);
    const [searchInput, setSearchInput] = useState(filters.search ?? '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/business/members',
            { ...filters, search: searchInput || undefined },
            { preserveState: true, replace: true },
        );
    };

    const handleFilter = (next: Record<string, string | undefined>) => {
        router.get(
            '/business/members',
            { ...filters, ...next },
            { preserveState: true, replace: true },
        );
    };

    const performRemove = () => {
        if (!removeId) return;
        setRemoving(true);
        router.delete(`/business/members/${removeId}`, {
            preserveScroll: true,
            onFinish: () => {
                setRemoving(false);
                setRemoveId(null);
            },
        });
    };

    const changeRole = (memberId: number, role: 'admin' | 'learner') => {
        router.patch(
            `/business/members/${memberId}/role`,
            { role },
            { preserveScroll: true },
        );
    };

    const resyncEnrollments = (memberId: number) => {
        setResyncingId(memberId);
        router.post(
            `/business/members/${memberId}/resync-enrollments`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setResyncingId(null),
            },
        );
    };

    return (
        <>
            <Head title="Karyawan" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/business/dashboard" className="hover:text-slate-700">
                            Dashboard Korporat
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Karyawan</span>
                    </nav>
                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
                        <h1 className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
                            <Users className="size-6 text-brand-600" />
                            Karyawan {organization.name}
                        </h1>
                        <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                            <Link href="/business/invitations">
                                <Mail className="mr-1.5 size-4" />
                                Undang Karyawan
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <StatCard label="Total Karyawan" value={organization.seats_used} icon={Users} />
                    <StatCard label="Seat Tersedia" value={organization.seats_available} icon={Mail} />
                    <StatCard label="Total Kuota" value={organization.seat_quota} icon={Building2} />
                </div>

                <div className="rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
                        <form onSubmit={handleSearch} className="relative max-w-sm flex-1">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Cari nama atau email..."
                                className="h-9 pl-9"
                            />
                        </form>
                        <Select
                            value={filters.role ?? 'all'}
                            onValueChange={(v) => handleFilter({ role: v === 'all' ? undefined : v })}
                        >
                            <SelectTrigger className="h-9 w-[140px]">
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="learner">Karyawan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {members.data.length === 0 ? (
                        <div className="px-4 py-16 text-center">
                            <Users className="mx-auto mb-3 size-7 text-slate-400" />
                            <p className="text-sm font-semibold text-slate-900">Belum ada karyawan</p>
                            <p className="mt-1 text-[12.5px] text-slate-500">
                                Mulai dengan mengundang karyawan via email.
                            </p>
                            <Button asChild className="mt-4 rounded-xl bg-brand-600 hover:bg-brand-700">
                                <Link href="/business/invitations">Undang Karyawan</Link>
                            </Button>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {members.data.map((m) => (
                                <li key={m.id} className="flex items-center gap-3 px-4 py-3">
                                    <Avatar className="size-10 ring-1 ring-slate-200">
                                        {m.user?.avatar_url && (
                                            <AvatarImage src={m.user.avatar_url} alt={m.user.name} />
                                        )}
                                        <AvatarFallback className="bg-gradient-to-br from-brand-300 to-brand-600 text-[11px] font-bold text-white">
                                            {m.user ? initials(m.user.name) : '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-[13px] font-semibold text-slate-900">
                                            {m.user?.name}
                                        </div>
                                        <div className="truncate text-[11.5px] text-slate-500">
                                            {m.user?.email}
                                            {m.user?.position && (
                                                <>
                                                    {' · '}
                                                    <span className="font-semibold text-slate-700">
                                                        {m.user.position}
                                                    </span>
                                                </>
                                            )}
                                            {' · Bergabung '}
                                            {formatDate(m.joined_at)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Select
                                            value={m.role}
                                            onValueChange={(v) =>
                                                changeRole(m.id, v as 'admin' | 'learner')
                                            }
                                        >
                                            <SelectTrigger className="h-8 w-[110px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="learner">Karyawan</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Badge
                                            className={cn(
                                                'border-transparent text-[10px]',
                                                m.user?.status === 'active'
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-slate-100 text-slate-600',
                                            )}
                                        >
                                            {m.user?.status === 'active' ? 'Aktif' : m.user?.status ?? '-'}
                                        </Badge>
                                        {m.user?.position_id && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8 text-brand-600 hover:bg-brand-50 hover:text-brand-700"
                                                title="Sinkron course sesuai jabatan"
                                                disabled={resyncingId === m.id}
                                                onClick={() => resyncEnrollments(m.id)}
                                            >
                                                <RefreshCw
                                                    className={cn(
                                                        'size-4',
                                                        resyncingId === m.id && 'animate-spin',
                                                    )}
                                                />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                                            onClick={() => {
                                                setRemoveId(m.id);
                                                setRemoveName(m.user?.name ?? '');
                                            }}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {members.data.length > 0 && (
                        <div className="border-t border-slate-100 p-3">
                            <DataTablePagination paginator={members} />
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={removeId !== null} onOpenChange={(o) => !o && setRemoveId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Keluarkan karyawan?</DialogTitle>
                        <DialogDescription>
                            <span className="font-semibold">{removeName}</span> akan dihapus dari organisasi
                            ini. Akun user tetap ada di sistem, tapi tidak lagi punya akses melalui paket
                            perusahaan. Seat akan dikembalikan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRemoveId(null)}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={performRemove} disabled={removing}>
                            {removing ? 'Memproses...' : 'Keluarkan'}
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
}: {
    label: string;
    value: number;
    icon: typeof Users;
}) {
    return (
        <div className="rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="size-5" />
                </div>
                <div>
                    <div className="text-[11px] tracking-wider text-slate-500 uppercase">{label}</div>
                    <div className="text-[18px] font-extrabold text-slate-900 tabular-nums">
                        {value.toLocaleString('id-ID')}
                    </div>
                </div>
            </div>
        </div>
    );
}
