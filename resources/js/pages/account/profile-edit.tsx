import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Camera,
    CheckCircle2,
    Mail,
    Phone,
    Save,
    Trash2,
    User as UserIcon,
} from 'lucide-react';
import { useRef, useState } from 'react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import { IconChevR } from '@/components/learnpath-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { send as sendVerification } from '@/routes/verification';

type ProfileUser = {
    name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    email_verified_at: string | null;
};

type Props = {
    user: ProfileUser;
    mustVerifyEmail: boolean;
    status?: string;
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

export default function ProfileEdit({ user, mustVerifyEmail, status }: Props) {
    const { auth } = usePage<{ auth: { user: { id: number } } }>().props;
    const userId = auth?.user?.id;
    const fileRef = useRef<HTMLInputElement | null>(null);
    const [preview, setPreview] = useState<string | null>(user.avatar_url);
    const [removeAvatar, setRemoveAvatar] = useState(false);

    const form = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
        avatar: null as File | null,
        remove_avatar: false as boolean,
    });

    const handleFile = (file: File | null) => {
        form.setData('avatar', file);
        form.setData('remove_avatar', false);
        setRemoveAvatar(false);

        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
        } else {
            setPreview(user.avatar_url);
        }
    };

    const handleRemove = () => {
        form.setData('avatar', null);
        form.setData('remove_avatar', true);
        setRemoveAvatar(true);
        setPreview(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.post('/settings/profile', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.setData('avatar', null);
                form.setData('remove_avatar', false);
                setRemoveAvatar(false);
                if (fileRef.current) fileRef.current.value = '';
            },
        });
    };

    const emailUnverified =
        mustVerifyEmail && user.email_verified_at === null;

    return (
        <>
            <Head title="Edit Profil" />
            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/" className="hover:text-slate-700">
                            Beranda
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Edit Profil</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Edit Profil
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Perbarui nama, email, nomor telepon, dan foto profil Anda.
                    </p>
                </div>

                {status === 'verification-link-sent' && (
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                        <p className="text-[13px] text-emerald-900">
                            Link verifikasi baru sudah dikirim ke email Anda.
                        </p>
                    </div>
                )}

                {emailUnverified && (
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
                        <div className="flex-1 text-[13px] text-amber-900">
                            Email Anda belum diverifikasi.{' '}
                            <Link
                                href={sendVerification()}
                                as="button"
                                method="post"
                                className="font-semibold underline hover:text-amber-700"
                            >
                                Kirim ulang email verifikasi
                            </Link>
                            .
                        </div>
                    </div>
                )}

                <form
                    onSubmit={submit}
                    className="mt-6 space-y-6 rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:p-7"
                >
                    {/* Avatar section */}
                    <div className="flex flex-col items-start gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
                        <Avatar className="size-20 ring-2 ring-slate-100">
                            {preview && <AvatarImage src={preview} alt={user.name} />}
                            <AvatarFallback className="bg-gradient-to-br from-brand-400 to-brand-700 text-xl font-bold text-white">
                                {initials(user.name || 'U')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="text-[14px] font-semibold text-slate-900">
                                Foto Profil
                            </div>
                            <div className="mt-0.5 text-[12.5px] text-slate-500">
                                PNG, JPG, atau WEBP — maksimal 2MB.
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileRef.current?.click()}
                                    className="rounded-xl"
                                >
                                    <Camera className="mr-1.5 size-4" />
                                    Pilih Foto
                                </Button>
                                {(preview || user.avatar_url) && !removeAvatar && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleRemove}
                                        className="rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                    >
                                        <Trash2 className="mr-1.5 size-4" />
                                        Hapus Foto
                                    </Button>
                                )}
                            </div>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] ?? null;
                                    handleFile(file);
                                }}
                            />
                            <FieldError message={form.errors.avatar} />
                        </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-1.5">
                        <RequiredLabel htmlFor="name" required>
                            <span className="inline-flex items-center gap-1.5">
                                <UserIcon className="size-3.5 text-slate-400" />
                                Nama Lengkap
                            </span>
                        </RequiredLabel>
                        <Input
                            id="name"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            placeholder="Nama lengkap"
                            required
                        />
                        <FieldError message={form.errors.name} />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <RequiredLabel htmlFor="email" required>
                            <span className="inline-flex items-center gap-1.5">
                                <Mail className="size-3.5 text-slate-400" />
                                Email
                            </span>
                        </RequiredLabel>
                        <Input
                            id="email"
                            type="email"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            placeholder="anda@perusahaan.com"
                            required
                        />
                        <p className="text-[11.5px] text-slate-500">
                            Mengganti email akan mengirim email verifikasi baru.
                        </p>
                        <FieldError message={form.errors.email} />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                        <RequiredLabel htmlFor="phone">
                            <span className="inline-flex items-center gap-1.5">
                                <Phone className="size-3.5 text-slate-400" />
                                Nomor Telepon (opsional)
                            </span>
                        </RequiredLabel>
                        <Input
                            id="phone"
                            value={form.data.phone}
                            onChange={(e) => form.setData('phone', e.target.value)}
                            placeholder="+62 812 3456 7890"
                        />
                        <FieldError message={form.errors.phone} />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse items-stretch gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
                        <Button asChild type="button" variant="outline" className="rounded-xl">
                            <Link href="/">
                                <ArrowLeft className="mr-1.5 size-4" />
                                Kembali
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

                <p className="mt-5 text-center text-[11.5px] text-slate-400">
                    Lupa password? Gunakan menu{' '}
                    <Link href="/forgot-password" className="underline hover:text-slate-600">
                        Lupa kata sandi
                    </Link>{' '}
                    saat login.
                </p>
                {/* userId silently referenced to keep auth context import meaningful */}
                <span className="sr-only" data-user-id={userId} />
            </div>
        </>
    );
}
