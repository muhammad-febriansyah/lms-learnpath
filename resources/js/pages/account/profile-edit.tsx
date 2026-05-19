import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Camera,
    CheckCircle2,
    Eye,
    EyeOff,
    Key,
    Lock,
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
import { cn } from '@/lib/utils';
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

    return (
        <>
            <Head title="Edit Profil" />
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
                {/* Header */}
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/" className="hover:text-slate-700">
                            Beranda
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            Pengaturan Akun
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                        Pengaturan Akun
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Kelola informasi profil dan keamanan akun Anda.
                    </p>
                </div>

                {/* Status banners */}
                {status === 'verification-link-sent' && (
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                        <p className="text-[13px] text-emerald-900">
                            Link verifikasi baru sudah dikirim ke email Anda.
                        </p>
                    </div>
                )}
                {status === 'password-updated' && (
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                        <p className="text-[13px] text-emerald-900">
                            Kata sandi berhasil diperbarui.
                        </p>
                    </div>
                )}

                {mustVerifyEmail && user.email_verified_at === null && (
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

                {/* Body — 2 column on lg+ */}
                <div className="mt-7 grid gap-6 lg:grid-cols-[220px_1fr] lg:gap-8">
                    {/* Sidebar nav */}
                    <aside className="lg:sticky lg:top-24 lg:self-start">
                        <nav className="flex gap-1 overflow-x-auto rounded-2xl bg-white p-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 lg:flex-col lg:overflow-visible">
                            <SectionNavItem
                                href="#profile"
                                icon={<UserIcon className="size-4" />}
                                label="Profil"
                            />
                            <SectionNavItem
                                href="#password"
                                icon={<Key className="size-4" />}
                                label="Kata Sandi"
                            />
                        </nav>

                        <p className="mt-4 hidden text-[11.5px] leading-relaxed text-slate-500 lg:block">
                            Lupa password? Gunakan menu{' '}
                            <Link
                                href="/forgot-password"
                                className="font-semibold text-brand-700 underline hover:text-brand-800"
                            >
                                Lupa kata sandi
                            </Link>{' '}
                            saat login.
                        </p>
                    </aside>

                    {/* Cards */}
                    <div className="min-w-0 space-y-6">
                        <ProfileCard user={user} />
                        <PasswordCard />
                    </div>
                </div>

                {/* userId silently referenced to keep auth context import meaningful */}
                <span className="sr-only" data-user-id={userId} />
            </div>
        </>
    );
}

function SectionNavItem({
    href,
    icon,
    label,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <a
            href={href}
            className="inline-flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
        >
            <span className="grid size-7 place-items-center rounded-lg bg-slate-100 text-slate-600">
                {icon}
            </span>
            {label}
        </a>
    );
}

function ProfileCard({ user }: { user: ProfileUser }) {
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

    return (
        <section
            id="profile"
            className="scroll-mt-24 overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70"
        >
            <CardHeader
                icon={<UserIcon className="size-4" />}
                title="Profil"
                description="Perbarui nama, email, nomor telepon, dan foto profil."
            />

            <form onSubmit={submit} className="space-y-6 p-6 sm:p-7">
                {/* Avatar */}
                <div className="flex flex-col items-start gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
                    <Avatar className="size-20 ring-2 ring-slate-100">
                        {preview && <AvatarImage src={preview} alt={user.name} />}
                        <AvatarFallback className="bg-gradient-to-br from-brand-400 to-brand-700 text-xl font-bold text-white">
                            {initials(user.name || 'U')}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
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
                            onChange={(e) =>
                                handleFile(e.target.files?.[0] ?? null)
                            }
                        />
                        <FieldError message={form.errors.avatar} />
                    </div>
                </div>

                {/* Fields — 2 col on md+ */}
                <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-1.5 md:col-span-2">
                        <RequiredLabel htmlFor="name" required>
                            <span className="inline-flex items-center gap-1.5">
                                <UserIcon className="size-3.5 text-slate-400" />
                                Nama Lengkap
                            </span>
                        </RequiredLabel>
                        <Input
                            id="name"
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                            placeholder="Nama lengkap"
                            required
                        />
                        <FieldError message={form.errors.name} />
                    </div>

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
                            onChange={(e) =>
                                form.setData('email', e.target.value)
                            }
                            placeholder="anda@perusahaan.com"
                            required
                        />
                        <p className="text-[11.5px] text-slate-500">
                            Mengganti email mengirim verifikasi baru.
                        </p>
                        <FieldError message={form.errors.email} />
                    </div>

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
                            onChange={(e) =>
                                form.setData('phone', e.target.value)
                            }
                            placeholder="+62 812 3456 7890"
                        />
                        <FieldError message={form.errors.phone} />
                    </div>
                </div>

                <div className="flex flex-col-reverse items-stretch gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
                    <Button
                        asChild
                        type="button"
                        variant="outline"
                        className="rounded-xl"
                    >
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
        </section>
    );
}

function PasswordCard() {
    const [show, setShow] = useState({
        current: false,
        next: false,
        confirm: false,
    });
    const [done, setDone] = useState(false);

    const form = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put('/user/password', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setDone(true);
                window.setTimeout(() => setDone(false), 4000);
            },
        });
    };

    const strength = scorePassword(form.data.password);

    return (
        <section
            id="password"
            className="scroll-mt-24 overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70"
        >
            <CardHeader
                icon={<Key className="size-4" />}
                title="Ganti Kata Sandi"
                description="Untuk keamanan, gunakan kata sandi yang kuat (min. 8 karakter, kombinasi huruf, angka, simbol)."
            />

            <form onSubmit={submit} className="space-y-5 p-6 sm:p-7">
                {done && (
                    <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[12.5px] text-emerald-900">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                        Kata sandi berhasil diperbarui.
                    </div>
                )}

                <div className="space-y-1.5">
                    <RequiredLabel htmlFor="current_password" required>
                        <span className="inline-flex items-center gap-1.5">
                            <Lock className="size-3.5 text-slate-400" />
                            Kata Sandi Saat Ini
                        </span>
                    </RequiredLabel>
                    <PasswordInput
                        id="current_password"
                        value={form.data.current_password}
                        onChange={(v) => form.setData('current_password', v)}
                        show={show.current}
                        onToggle={() =>
                            setShow((s) => ({ ...s, current: !s.current }))
                        }
                        autoComplete="current-password"
                    />
                    <FieldError message={form.errors.current_password} />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-1.5">
                        <RequiredLabel htmlFor="password" required>
                            <span className="inline-flex items-center gap-1.5">
                                <Key className="size-3.5 text-slate-400" />
                                Kata Sandi Baru
                            </span>
                        </RequiredLabel>
                        <PasswordInput
                            id="password"
                            value={form.data.password}
                            onChange={(v) => form.setData('password', v)}
                            show={show.next}
                            onToggle={() =>
                                setShow((s) => ({ ...s, next: !s.next }))
                            }
                            autoComplete="new-password"
                        />
                        <FieldError message={form.errors.password} />
                        {form.data.password && (
                            <StrengthMeter score={strength} />
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <RequiredLabel
                            htmlFor="password_confirmation"
                            required
                        >
                            <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 className="size-3.5 text-slate-400" />
                                Konfirmasi Kata Sandi
                            </span>
                        </RequiredLabel>
                        <PasswordInput
                            id="password_confirmation"
                            value={form.data.password_confirmation}
                            onChange={(v) =>
                                form.setData('password_confirmation', v)
                            }
                            show={show.confirm}
                            onToggle={() =>
                                setShow((s) => ({ ...s, confirm: !s.confirm }))
                            }
                            autoComplete="new-password"
                        />
                        <FieldError
                            message={form.errors.password_confirmation}
                        />
                        {form.data.password_confirmation &&
                            form.data.password !==
                                form.data.password_confirmation && (
                                <p className="text-[11.5px] text-rose-600">
                                    Konfirmasi tidak cocok dengan kata sandi
                                    baru.
                                </p>
                            )}
                    </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 text-[11.5px] text-slate-600 ring-1 ring-slate-100">
                    <div className="font-semibold text-slate-700">
                        Tips kata sandi yang kuat:
                    </div>
                    <ul className="mt-1 grid grid-cols-1 gap-x-4 gap-y-0.5 sm:grid-cols-2">
                        <li>• Minimal 8 karakter</li>
                        <li>• Campuran huruf besar &amp; kecil</li>
                        <li>• Sertakan angka (0-9)</li>
                        <li>• Sertakan simbol (!@#$ dll)</li>
                    </ul>
                </div>

                <div className="flex flex-col-reverse items-stretch gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.reset()}
                        disabled={form.processing}
                        className="rounded-xl"
                    >
                        Reset
                    </Button>
                    <Button
                        type="submit"
                        disabled={
                            form.processing ||
                            !form.data.current_password ||
                            !form.data.password ||
                            form.data.password !==
                                form.data.password_confirmation
                        }
                        className="rounded-xl bg-brand-600 hover:bg-brand-700"
                    >
                        <Key className="mr-1.5 size-4" />
                        {form.processing
                            ? 'Memperbarui...'
                            : 'Perbarui Kata Sandi'}
                    </Button>
                </div>
            </form>
        </section>
    );
}

function CardHeader({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50/60 to-white p-6 sm:p-7">
            <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-sm">
                    {icon}
                </span>
                <div className="min-w-0">
                    <h2 className="text-[16px] font-extrabold text-slate-900">
                        {title}
                    </h2>
                    <p className="mt-0.5 text-[12.5px] text-slate-500">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}

function PasswordInput({
    id,
    value,
    onChange,
    show,
    onToggle,
    autoComplete,
}: {
    id: string;
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    onToggle: () => void;
    autoComplete?: string;
}) {
    return (
        <div className="relative">
            <Input
                id={id}
                type={show ? 'text' : 'password'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoComplete={autoComplete}
                className="pr-10"
            />
            <button
                type="button"
                onClick={onToggle}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label={
                    show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'
                }
            >
                {show ? (
                    <EyeOff className="size-4" />
                ) : (
                    <Eye className="size-4" />
                )}
            </button>
        </div>
    );
}

function scorePassword(password: string): number {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return Math.min(score, 4);
}

function StrengthMeter({ score }: { score: number }) {
    const labels = ['Sangat lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat'];
    const tones = [
        'bg-rose-500',
        'bg-orange-500',
        'bg-amber-500',
        'bg-emerald-500',
        'bg-emerald-600',
    ];
    const textTones = [
        'text-rose-600',
        'text-orange-600',
        'text-amber-600',
        'text-emerald-600',
        'text-emerald-700',
    ];
    return (
        <div className="space-y-1">
            <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className={cn(
                            'h-1 flex-1 rounded-full transition',
                            i < score ? tones[Math.min(score, 4)] : 'bg-slate-200',
                        )}
                    />
                ))}
            </div>
            <p
                className={cn(
                    'text-[11px] font-semibold',
                    textTones[Math.min(score, 4)],
                )}
            >
                {labels[Math.min(score, 4)]}
            </p>
        </div>
    );
}
