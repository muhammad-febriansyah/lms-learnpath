import { Head, Link, useForm } from '@inertiajs/react';
import { AuthField, AuthInput, AuthPasswordInput, LockIcon, MailIcon } from '@/components/auth-field';
import { useRecaptchaV3 } from '@/hooks/use-recaptcha-v3';
import { IconArrowR, IconCheck } from '@/components/learnpath-icons';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({ status, canResetPassword, canRegister }: Props) {
    const form = useForm<{
        email: string;
        password: string;
        remember: boolean;
        recaptcha_token: string;
    }>({
        email: '',
        password: '',
        remember: false,
        recaptcha_token: '',
    });
    const { execute } = useRecaptchaV3();

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        let recaptchaToken = '';

        try {
            recaptchaToken = await execute('login');
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
            onSuccess: () => form.reset('password', 'recaptcha_token'),
            onFinish: () => form.transform((data) => data),
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title="Masuk" />

            {status && (
                <div className="mb-5 flex items-start gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-200">
                    <IconCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                    <div>{status}</div>
                </div>
            )}

            <form onSubmit={submit}>
                <div className="space-y-4">
                    <AuthField label="Email" icon={<MailIcon />} error={form.errors.email}>
                        <AuthInput
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="nama@learnpath.id"
                            required
                            autoFocus
                            tabIndex={1}
                            value={form.data.email}
                            onChange={(event) => form.setData('email', event.target.value)}
                        />
                    </AuthField>

                    <AuthField label="Kata sandi" icon={<LockIcon />} error={form.errors.password}>
                        <AuthPasswordInput
                            id="password"
                            name="password"
                            autoComplete="current-password"
                            required
                            tabIndex={2}
                            value={form.data.password}
                            onChange={(event) => form.setData('password', event.target.value)}
                        />
                    </AuthField>

                    <div className="flex items-center justify-between pt-1">
                        <label className="group inline-flex cursor-pointer items-center gap-2.5 select-none">
                            <span className="relative grid size-[18px] place-items-center rounded-md bg-white ring-1 ring-slate-300 transition group-hover:ring-brand-400 has-[:checked]:bg-brand-600 has-[:checked]:ring-brand-600">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={form.data.remember}
                                    onChange={(event) => form.setData('remember', event.target.checked)}
                                    tabIndex={3}
                                    className="peer absolute inset-0 cursor-pointer opacity-0"
                                />
                                <IconCheck className="absolute size-3 scale-0 text-white transition peer-checked:scale-100" />
                            </span>
                            <span className="text-[14px] text-slate-600">Ingat saya</span>
                        </label>
                        {canResetPassword && (
                            <Link
                                href={request()}
                                className="text-[14px] font-semibold text-brand-600 hover:text-brand-700"
                                tabIndex={5}
                            >
                                Lupa kata sandi?
                            </Link>
                        )}
                    </div>

                    {form.errors.recaptcha_token && (
                        <p className="text-sm font-medium text-rose-600">{form.errors.recaptcha_token}</p>
                    )}

                    <button
                        type="submit"
                        disabled={form.processing}
                        tabIndex={4}
                        data-test="login-button"
                        className="relative mt-2 w-full rounded-xl bg-brand-600 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(18,35,125,0.6)] transition hover:bg-brand-700 focus:ring-4 focus:ring-brand-600/20 focus:outline-none active:bg-brand-800 disabled:opacity-80"
                    >
                        <span
                            className={
                                'inline-flex items-center justify-center gap-2 ' +
                                (form.processing ? 'opacity-0' : '')
                            }
                        >
                            Masuk <IconArrowR size={16} />
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

                {canRegister && (
                    <p className="mt-6 text-center text-[13.5px] text-slate-500">
                        Belum punya akun?{' '}
                        <Link
                            href={register()}
                            className="font-semibold text-brand-600 underline-offset-4 hover:text-brand-700 hover:underline"
                            tabIndex={5}
                        >
                            Daftar gratis
                        </Link>
                    </p>
                )}
            </form>
        </>
    );
}

Login.layout = {
    title: 'Masuk ke akun Anda',
    description: 'Selamat datang kembali',
};
