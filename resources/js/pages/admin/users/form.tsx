import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff, Save } from 'lucide-react';
import { useState } from 'react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import { IconChevR } from '@/components/learnpath-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    role: string | null;
};

type Props = {
    user: AdminUser | null;
    roleOptions: Role[];
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

export default function UserForm({ user, roleOptions }: Props) {
    const isEdit = !!user;
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const form = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        username: user?.username ?? '',
        phone: user?.phone ?? '',
        password: '',
        password_confirmation: '',
        role: user?.role ?? 'employee',
        status: user?.status ?? 'active',
    });

    function submit(event: React.FormEvent) {
        event.preventDefault();

        if (isEdit) {
            form.put(`/admin/users/${user!.id}`);
        } else {
            form.post('/admin/users');
        }
    }

    return (
        <>
            <Head title={isEdit ? 'Edit User' : 'Tambah User'} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <Link href="/admin/users" className="hover:text-slate-700">
                            Users
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            {isEdit ? 'Edit' : 'Tambah'}
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        {isEdit ? 'Edit User' : 'Tambah User'}
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        {isEdit
                            ? 'Perbarui informasi user dan akses role.'
                            : 'Buat akun baru beserta role yang sesuai.'}
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <FormCard
                        title="Informasi Pribadi"
                        description="Identitas dan kontak user."
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Nama Lengkap" required error={form.errors.name}>
                                <Input
                                    placeholder="Contoh: Andi Saputra"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                />
                            </Field>

                            <Field label="Email" required error={form.errors.email}>
                                <Input
                                    type="email"
                                    placeholder="andi@example.com"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                />
                            </Field>

                            <Field
                                label="Username"
                                error={form.errors.username}
                                hint="Opsional. Untuk URL profil dan @mention."
                            >
                                <Input
                                    placeholder="contoh: andi-saputra"
                                    value={form.data.username}
                                    onChange={(e) => form.setData('username', e.target.value)}
                                />
                            </Field>

                            <Field label="Nomor Telepon" error={form.errors.phone}>
                                <Input
                                    placeholder="Contoh: 081234567890"
                                    value={form.data.phone}
                                    onChange={(e) => form.setData('phone', e.target.value)}
                                />
                            </Field>
                        </div>
                    </FormCard>

                    <FormCard
                        title={isEdit ? 'Ganti Password' : 'Set Password'}
                        description={
                            isEdit
                                ? 'Biarkan kosong jika tidak ingin mengganti password.'
                                : 'Minimal 8 karakter.'
                        }
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field
                                label="Password"
                                required={!isEdit}
                                error={form.errors.password}
                            >
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder={isEdit ? 'Kosongkan jika tidak ganti' : 'Minimal 8 karakter'}
                                        value={form.data.password}
                                        onChange={(e) => form.setData('password', e.target.value)}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </button>
                                </div>
                            </Field>

                            <Field
                                label="Konfirmasi Password"
                                required={!isEdit}
                                error={form.errors.password_confirmation}
                            >
                                <div className="relative">
                                    <Input
                                        type={showConfirm ? 'text' : 'password'}
                                        placeholder="Ulangi password"
                                        value={form.data.password_confirmation}
                                        onChange={(e) =>
                                            form.setData('password_confirmation', e.target.value)
                                        }
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((v) => !v)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showConfirm ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </button>
                                </div>
                            </Field>
                        </div>
                    </FormCard>

                    <FormCard
                        title="Role & Status"
                        description="Tentukan hak akses dan status akun."
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Role" required error={form.errors.role}>
                                <Select
                                    value={form.data.role}
                                    onValueChange={(v) => form.setData('role', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roleOptions.map((r) => (
                                            <SelectItem key={r.id} value={r.name}>
                                                {ROLE_LABELS[r.name] ?? r.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field label="Status Akun" required error={form.errors.status}>
                                <Select
                                    value={form.data.status}
                                    onValueChange={(v) => form.setData('status', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Aktif</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                        <SelectItem value="banned">Banned</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>
                    </FormCard>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button asChild type="button" variant="outline" className="rounded-xl">
                            <Link href="/admin/users">
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
                            {form.processing
                                ? 'Menyimpan...'
                                : isEdit
                                  ? 'Simpan Perubahan'
                                  : 'Simpan User'}
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
    children,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:p-6">
            <div className="mb-5">
                <h2 className="text-[15px] font-bold text-slate-900">{title}</h2>
                {description && (
                    <p className="mt-0.5 text-[12.5px] text-slate-500">{description}</p>
                )}
            </div>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

function Field({
    label,
    required,
    error,
    hint,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <RequiredLabel required={required}>{label}</RequiredLabel>
            {children}
            {hint && !error && <p className="text-[11.5px] text-slate-500">{hint}</p>}
            <FieldError message={error} />
        </div>
    );
}
