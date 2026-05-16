import { Head, Link, useForm } from '@inertiajs/react';
import {
    AuthField,
    AuthInput,
    AuthPasswordInput,
    LockIcon,
    MailIcon,
    UserIcon,
} from '@/components/auth-field';
import { useRecaptchaV3 } from '@/hooks/use-recaptcha-v3';
import { IconArrowR } from '@/components/learnpath-icons';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    const form = useForm<{
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        recaptcha_token: string;
    }>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        recaptcha_token: '',
    });
    const { execute } = useRecaptchaV3();

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        let recaptchaToken = '';

        try {
            recaptchaToken = await execute('register');
            form.clearErrors('recaptcha_token');
        } catch {
            form.setError('recaptcha_token', 'Verifikasi reCAPTCHA gagal. Silakan coba lagi.');

            return;
        }

        form.transform((data) => ({
            ...data,
            recaptcha_token: recaptchaToken,
        }));

        form.post(store.url(), {
            onSuccess: () => form.reset('password', 'password_confirmation', 'recaptcha_token'),
            onFinish: () => form.transform((data) => data),
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title="Daftar" />

            <form onSubmit={submit}>
                <div className="space-y-4">
                    <AuthField label="Nama lengkap" icon={<UserIcon />} error={form.errors.name}>
                        <AuthInput
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            placeholder="Nama Anda"
                            required
                            autoFocus
                            tabIndex={1}
                            value={form.data.name}
                            onChange={(event) => form.setData('name', event.target.value)}
                        />
                    </AuthField>

                    <AuthField label="Email" icon={<MailIcon />} error={form.errors.email}>
                        <AuthInput
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="nama@learnpath.id"
                            required
                            tabIndex={2}
                            value={form.data.email}
                            onChange={(event) => form.setData('email', event.target.value)}
                        />
                    </AuthField>

                    <AuthField label="Kata sandi" icon={<LockIcon />} error={form.errors.password}>
                        <AuthPasswordInput
                            id="password"
                            name="password"
                            autoComplete="new-password"
                            required
                            tabIndex={3}
                            value={form.data.password}
                            onChange={(event) => form.setData('password', event.target.value)}
                        />
                    </AuthField>

                    <AuthField
                        label="Konfirmasi kata sandi"
                        icon={<LockIcon />}
                        error={form.errors.password_confirmation}
                    >
                        <AuthPasswordInput
                            id="password_confirmation"
                            name="password_confirmation"
                            autoComplete="new-password"
                            required
                            tabIndex={4}
                            value={form.data.password_confirmation}
                            onChange={(event) => form.setData('password_confirmation', event.target.value)}
                        />
                    </AuthField>

                    {passwordRules && (
                        <p className="text-[12px] text-slate-500">
                            Sandi harus memenuhi: {passwordRules.toLowerCase()}
                        </p>
                    )}

                    {form.errors.recaptcha_token && (
                        <p className="text-sm font-medium text-rose-600">{form.errors.recaptcha_token}</p>
                    )}

                    <button
                        type="submit"
                        disabled={form.processing}
                        tabIndex={5}
                        data-test="register-user-button"
                        className="relative mt-2 w-full rounded-xl bg-brand-600 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(18,35,125,0.6)] transition hover:bg-brand-700 focus:ring-4 focus:ring-brand-600/20 focus:outline-none active:bg-brand-800 disabled:opacity-80"
                    >
                        <span
                            className={
                                'inline-flex items-center justify-center gap-2 ' +
                                (form.processing ? 'opacity-0' : '')
                            }
                        >
                            Buat akun <IconArrowR size={16} />
                        </span>
                        {form.processing && (
                            <span className="absolute inset-0 grid place-items-center">
                                <svg viewBox="0 0 24 24" className="size-5 animate-spin">
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="9"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeOpacity=".25"
                                        strokeWidth="3"
                                    />
                                    <path
                                        d="M21 12a9 9 0 0 0-9-9"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </span>
                        )}
                    </button>
                </div>

                <p className="mt-6 text-center text-[13.5px] text-slate-500">
                    Sudah punya akun?{' '}
                    <Link
                        href={login()}
                        className="font-semibold text-brand-600 underline-offset-4 hover:text-brand-700 hover:underline"
                        tabIndex={6}
                    >
                        Masuk
                    </Link>
                </p>
            </form>
        </>
    );
}

Register.layout = {
    title: 'Buat akun gratis',
    description: 'Mulai perjalanan belajar Anda',
};
