import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Lock, Save, ShieldCheck } from 'lucide-react';
import { useMemo } from 'react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

type Permission = {
    id: number;
    name: string;
    label: string;
};

type PermissionGroup = {
    label: string;
    items: Permission[];
};

type Role = {
    id: number;
    name: string;
    guard_name: string;
    permission_ids: number[];
    is_locked: boolean;
};

type Props = {
    role: Role;
    permissionGroups: PermissionGroup[];
    usersCount: number;
};

export default function RoleForm({ role, permissionGroups, usersCount }: Props) {
    const form = useForm({
        name: role.name,
        permission_ids: [...role.permission_ids],
    });

    const totalPermissions = useMemo(
        () => permissionGroups.reduce((sum, g) => sum + g.items.length, 0),
        [permissionGroups],
    );

    const toggle = (id: number) => {
        const next = form.data.permission_ids.includes(id)
            ? form.data.permission_ids.filter((p) => p !== id)
            : [...form.data.permission_ids, id];
        form.setData('permission_ids', next);
    };

    const toggleGroup = (group: PermissionGroup) => {
        const groupIds = group.items.map((i) => i.id);
        const allSelected = groupIds.every((id) =>
            form.data.permission_ids.includes(id),
        );
        const next = allSelected
            ? form.data.permission_ids.filter((id) => !groupIds.includes(id))
            : [...new Set([...form.data.permission_ids, ...groupIds])];
        form.setData('permission_ids', next);
    };

    const selectAll = () => {
        const all = permissionGroups.flatMap((g) => g.items.map((i) => i.id));
        form.setData('permission_ids', all);
    };

    const clearAll = () => form.setData('permission_ids', []);

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.put(`/admin/roles/${role.id}`);
    }

    return (
        <>
            <Head title={`Edit Role: ${role.name}`} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <Link href="/admin/roles" className="hover:text-slate-700">
                            Roles
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">{role.name}</span>
                    </nav>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                            Edit Role
                        </h1>
                        {role.is_locked && (
                            <Badge className="border-transparent bg-amber-50 text-amber-700">
                                <Lock className="mr-1 size-3" />
                                Nama terkunci
                            </Badge>
                        )}
                    </div>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Atur permission yang dimiliki role ini.{' '}
                        <span className="font-semibold text-slate-700">{usersCount}</span> user
                        memiliki role ini.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <FormCard
                        title="Identitas Role"
                        description="Nama unik untuk role ini."
                    >
                        <Field label="Nama Role" required error={form.errors.name}>
                            <Input
                                placeholder="Contoh: content_editor"
                                value={form.data.name}
                                disabled={role.is_locked}
                                onChange={(e) => form.setData('name', e.target.value)}
                            />
                            {role.is_locked && (
                                <p className="text-[11.5px] text-amber-700">
                                    Role bawaan sistem tidak dapat di-rename. Permission masih
                                    bisa diatur.
                                </p>
                            )}
                        </Field>
                    </FormCard>

                    <FormCard
                        title="Permission"
                        description={`Pilih izin yang boleh diakses role ini.`}
                        action={
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge className="border-transparent bg-brand-50 text-brand-700">
                                    <ShieldCheck className="mr-1 size-3" />
                                    {form.data.permission_ids.length} / {totalPermissions}
                                </Badge>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={selectAll}
                                    className="h-7 rounded-lg text-[12px]"
                                >
                                    Pilih Semua
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearAll}
                                    className="h-7 rounded-lg text-[12px] text-slate-500"
                                >
                                    Kosongkan
                                </Button>
                            </div>
                        }
                    >
                        <div className="space-y-4">
                            {permissionGroups.map((group) => {
                                const groupIds = group.items.map((i) => i.id);
                                const selectedInGroup = groupIds.filter((id) =>
                                    form.data.permission_ids.includes(id),
                                ).length;
                                const allSelected = selectedInGroup === groupIds.length;
                                const someSelected =
                                    selectedInGroup > 0 && selectedInGroup < groupIds.length;

                                return (
                                    <div
                                        key={group.label}
                                        className="rounded-xl border border-slate-200/80"
                                    >
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => toggleGroup(group)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    toggleGroup(group);
                                                }
                                            }}
                                            className="flex w-full cursor-pointer items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50/60"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    checked={
                                                        allSelected
                                                            ? true
                                                            : someSelected
                                                              ? 'indeterminate'
                                                              : false
                                                    }
                                                    aria-label={`Pilih semua ${group.label}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onCheckedChange={() => toggleGroup(group)}
                                                />
                                                <div>
                                                    <div className="text-[13.5px] font-semibold text-slate-900">
                                                        {group.label}
                                                    </div>
                                                    <div className="text-[11.5px] text-slate-500">
                                                        {selectedInGroup} dari {groupIds.length} dipilih
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {group.items.map((perm) => {
                                                const checked = form.data.permission_ids.includes(
                                                    perm.id,
                                                );

                                                return (
                                                    <label
                                                        key={perm.id}
                                                        className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 transition hover:bg-slate-50"
                                                    >
                                                        <Checkbox
                                                            checked={checked}
                                                            onCheckedChange={() => toggle(perm.id)}
                                                            className="mt-0.5"
                                                        />
                                                        <div className="min-w-0">
                                                            <div className="text-[13px] font-medium text-slate-800">
                                                                {perm.label}
                                                            </div>
                                                            <div className="font-mono text-[10.5px] text-slate-400">
                                                                {perm.name}
                                                            </div>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <FieldError message={form.errors.permission_ids} />
                    </FormCard>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button asChild type="button" variant="outline" className="rounded-xl">
                            <Link href="/admin/roles">
                                <ArrowLeft className="mr-1.5 size-4" />
                                Batal
                            </Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-xl bg-brand-600 hover:bg-brand-700"
                        >
                            <Save className="mr-1.5 size-4" />
                            {form.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

function FormCard({
    title,
    description,
    action,
    children,
}: {
    title: string;
    description?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-[15px] font-bold text-slate-900">{title}</h2>
                    {description && (
                        <p className="mt-0.5 text-[12.5px] text-slate-500">{description}</p>
                    )}
                </div>
                {action}
            </div>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

function Field({
    label,
    required,
    error,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <RequiredLabel required={required}>{label}</RequiredLabel>
            {children}
            <FieldError message={error} />
        </div>
    );
}
