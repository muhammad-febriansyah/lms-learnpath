import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, Building2, CheckCircle2, Eye, EyeOff, XCircle } from 'lucide-react';
import { useState } from 'react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Invitation = {
    token: string;
    email: string;
    role: string;
    is_expired: boolean;
    is_accepted: boolean;
    organization: { name: string; logo: string | null } | null;
};

type Props = {
    invitation: Invitation | null;
    user_logged_in: boolean;
    existing_user: boolean;
};

export default function InvitationAccept({ invitation, user_logged_in, existing_user }: Props) {
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm({
        name: '',
        password: '',
        password_confirmation: '',
    });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        if (invitation) {
            form.post(`/business/invitations/${invitation.token}/accept`);
        }
    }

    if (!invitation) {
        return <Status icon={XCircle} title="Undangan tidak ditemukan" description="Link undangan ini tidak valid." />;
    }

    if (invitation.is_accepted) {
        return (
            <Status
                icon={CheckCircle2}
                title="Undangan sudah diterima"
                description="Anda sudah jadi member organisasi ini sebelumnya."
                cta={{ href: '/dashboard', label: 'Ke Dashboard' }}
            />
        );
    }

    if (invitation.is_expired) {
        return (
            <Status
                icon={XCircle}
                title="Undangan kedaluwarsa"
                description="Hubungi admin organisasi Anda untuk meminta undangan baru."
            />
        );
    }

    return (
        <>
            <Head title="Terima Undangan" />
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6">
                <div className="w-full max-w-md">
                    <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200/70">
                        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-600 text-white">
                            <Building2 className="size-7" />
                        </div>
                        <h1 className="mt-5 text-center text-2xl font-extrabold text-slate-900">
                            Anda diundang ke<br />
                            <span className="text-brand-600">{invitation.organization?.name}</span>
                        </h1>
                        <p className="mt-2 text-center text-[13.5px] text-slate-600">
                            Email: <b>{invitation.email}</b>
                        </p>
                        <p className="mt-1 text-center text-[12px] text-slate-500">
                            Setelah bergabung, Anda otomatis dapat akses ke semua course Learnpath.
                        </p>

                        {user_logged_in ? (
                            <form onSubmit={submit} className="mt-6">
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="w-full rounded-xl bg-brand-600 py-6 text-[15px] font-bold hover:bg-brand-700"
                                >
                                    {form.processing ? 'Memproses...' : 'Terima Undangan'}
                                    <ArrowRight className="ml-2 size-4" />
                                </Button>
                                <p className="mt-3 text-center text-[11px] text-slate-500">
                                    Anda akan join dengan akun yang sedang login.
                                </p>
                            </form>
                        ) : existing_user ? (
                            <div className="mt-6">
                                <Button
                                    asChild
                                    className="w-full rounded-xl bg-brand-600 py-6 text-[15px] font-bold hover:bg-brand-700"
                                >
                                    <Link href={`/login?intended=${encodeURIComponent(`/business/invitations/${invitation.token}/accept`)}`}>
                                        Login untuk Terima
                                        <ArrowRight className="ml-2 size-4" />
                                    </Link>
                                </Button>
                                <p className="mt-3 text-center text-[12px] text-slate-500">
                                    Email <b>{invitation.email}</b> sudah terdaftar. Login dulu untuk
                                    menerima undangan.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={submit} className="mt-6 space-y-4">
                                <p className="text-center text-[12px] text-slate-500">
                                    Buat password untuk akun baru
                                </p>

                                <div className="space-y-1.5">
                                    <RequiredLabel htmlFor="name" required>
                                        Nama Lengkap
                                    </RequiredLabel>
                                    <Input
                                        id="name"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="Nama Anda"
                                        required
                                    />
                                    <FieldError message={form.errors.name} />
                                </div>

                                <div className="space-y-1.5">
                                    <RequiredLabel htmlFor="password" required>
                                        Password
                                    </RequiredLabel>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={form.data.password}
                                            onChange={(e) => form.setData('password', e.target.value)}
                                            placeholder="Min 8 karakter"
                                            required
                                            minLength={8}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="size-4" />
                                            ) : (
                                                <Eye className="size-4" />
                                            )}
                                        </button>
                                    </div>
                                    <FieldError message={form.errors.password} />
                                </div>

                                <div className="space-y-1.5">
                                    <RequiredLabel htmlFor="password_confirmation" required>
                                        Konfirmasi Password
                                    </RequiredLabel>
                                    <Input
                                        id="password_confirmation"
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.data.password_confirmation}
                                        onChange={(e) =>
                                            form.setData('password_confirmation', e.target.value)
                                        }
                                        placeholder="Ulangi password"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="w-full rounded-xl bg-brand-600 py-6 text-[15px] font-bold hover:bg-brand-700"
                                >
                                    {form.processing ? 'Memproses...' : 'Daftar & Terima Undangan'}
                                    <ArrowRight className="ml-2 size-4" />
                                </Button>
                            </form>
                        )}
                    </div>

                    <p className="mt-6 text-center text-[11px] text-slate-500">
                        Powered by <Link href="/" className="font-bold text-brand-600">Learnpath</Link>
                    </p>
                </div>
            </div>
        </>
    );
}

function Status({
    icon: Icon,
    title,
    description,
    cta,
}: {
    icon: typeof CheckCircle2;
    title: string;
    description: string;
    cta?: { href: string; label: string };
}) {
    return (
        <>
            <Head title={title} />
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
                <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
                    <div className="mx-auto grid size-14 place-items-center rounded-full bg-slate-100 text-slate-500">
                        <Icon className="size-7" />
                    </div>
                    <h1 className="mt-5 text-xl font-extrabold text-slate-900">{title}</h1>
                    <p className="mt-2 text-[13px] text-slate-600">{description}</p>
                    {cta && (
                        <Button asChild className="mt-5 rounded-xl bg-brand-600 hover:bg-brand-700">
                            <Link href={cta.href}>{cta.label}</Link>
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
}
