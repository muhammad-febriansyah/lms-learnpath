import { Head, Link } from '@inertiajs/react';
import {
    GraduationCap,
    Lock,
    Pencil,
    Settings,
    Shield,
    ShieldCheck,
    UserCog,
    Users,
} from 'lucide-react';

import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Role = {
    id: number;
    name: string;
    permissions_count: number;
    users_count: number;
    guard_name: string;
};

type Props = {
    roles: Role[];
    lockedRoles: string[];
};

const ROLE_META: Record<
    string,
    { label: string; description: string; icon: typeof Shield; tint: string; text: string }
> = {
    super_admin: {
        label: 'Super Admin',
        description: 'Akses penuh ke seluruh modul dan setting sistem.',
        icon: ShieldCheck,
        tint: 'bg-violet-50',
        text: 'text-violet-600',
    },
    admin: {
        label: 'Admin',
        description: 'Kelola konten, course, peserta, dan transaksi.',
        icon: Shield,
        tint: 'bg-brand-50',
        text: 'text-brand-600',
    },
    hr: {
        label: 'HR',
        description: 'Kelola karyawan, kompetensi, dan skill matrix.',
        icon: UserCog,
        tint: 'bg-sky-50',
        text: 'text-sky-600',
    },
    instructor: {
        label: 'Instruktur',
        description: 'Buat & kelola course, assessment, dan grade peserta.',
        icon: GraduationCap,
        tint: 'bg-emerald-50',
        text: 'text-emerald-600',
    },
    supervisor: {
        label: 'Supervisor',
        description: 'Beri OJT score & approve review kompetensi tim.',
        icon: Settings,
        tint: 'bg-amber-50',
        text: 'text-amber-600',
    },
    student: {
        label: 'Peserta',
        description: 'Ikut course, kerjakan assessment, dapat sertifikat.',
        icon: Users,
        tint: 'bg-slate-100',
        text: 'text-slate-600',
    },
};

export default function RolesIndex({ roles, lockedRoles }: Props) {
    return (
        <>
            <Head title="Roles & Permissions" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            Roles & Permissions
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Roles & Permissions
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Atur akses tiap role ke modul dan aksi yang tersedia.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {roles.map((role) => {
                        const meta = ROLE_META[role.name] ?? {
                            label: role.name,
                            description: 'Custom role',
                            icon: Shield,
                            tint: 'bg-slate-100',
                            text: 'text-slate-600',
                        };
                        const Icon = meta.icon;
                        const isLocked = lockedRoles.includes(role.name);

                        return (
                            <div
                                key={role.id}
                                className="group flex flex-col rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:ring-slate-300"
                            >
                                <div className="flex items-start justify-between">
                                    <div
                                        className={`grid size-11 place-items-center rounded-xl ${meta.tint} ${meta.text}`}
                                    >
                                        <Icon className="size-5" />
                                    </div>
                                    {isLocked && (
                                        <Badge className="border-transparent bg-amber-50 text-amber-700">
                                            <Lock className="mr-1 size-3" />
                                            Locked
                                        </Badge>
                                    )}
                                </div>

                                <div className="mt-4 flex-1">
                                    <h3 className="text-[16px] font-bold tracking-tight text-slate-900">
                                        {meta.label}
                                    </h3>
                                    <p className="mt-1 text-[12.5px] text-slate-500">
                                        {meta.description}
                                    </p>

                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <div className="rounded-xl bg-slate-50/70 px-3 py-2.5 ring-1 ring-slate-100">
                                            <div className="text-[10.5px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                                                Permissions
                                            </div>
                                            <div className="mt-0.5 text-[18px] font-extrabold text-slate-900 tabular-nums">
                                                {role.permissions_count}
                                            </div>
                                        </div>
                                        <div className="rounded-xl bg-slate-50/70 px-3 py-2.5 ring-1 ring-slate-100">
                                            <div className="text-[10.5px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                                                Users
                                            </div>
                                            <div className="mt-0.5 text-[18px] font-extrabold text-slate-900 tabular-nums">
                                                {role.users_count}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    asChild
                                    variant="outline"
                                    className="mt-5 w-full rounded-xl border-slate-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                                >
                                    <Link href={`/admin/roles/${role.id}/edit`}>
                                        <Pencil className="mr-1.5 size-4" />
                                        Atur Permission
                                    </Link>
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
