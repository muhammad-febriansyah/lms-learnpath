import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRecaptchaV3 } from '@/hooks/use-recaptcha-v3';
import { login } from '@/routes';
import { email as emailRoute } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    const form = useForm<{ email: string; recaptcha_token: string }>({
        email: '',
        recaptcha_token: '',
    });
    const { execute } = useRecaptchaV3();

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        let token = '';
        try {
            token = await execute('forgot_password');
            form.clearErrors('recaptcha_token');
        } catch {
            form.setError('recaptcha_token', 'Verifikasi reCAPTCHA gagal. Silakan coba lagi.');
            return;
        }

        form.transform((data) => ({ ...data, recaptcha_token: token }));
        form.post(emailRoute.url(), {
            onSuccess: () => form.reset('recaptcha_token'),
            onFinish: () => form.transform((data) => data),
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title="Lupa kata sandi" />

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div className="grid gap-2">
                    <Label htmlFor="email">Alamat email</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        autoComplete="off"
                        autoFocus
                        value={form.data.email}
                        onChange={(e) => form.setData('email', e.target.value)}
                        placeholder="email@example.com"
                        required
                    />
                    <InputError message={form.errors.email} />
                </div>

                {form.errors.recaptcha_token && (
                    <p className="text-sm font-medium text-rose-600">{form.errors.recaptcha_token}</p>
                )}

                <div className="my-6 flex items-center justify-start">
                    <Button
                        className="w-full"
                        disabled={form.processing}
                        data-test="email-password-reset-link-button"
                    >
                        {form.processing && (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                        )}
                        Kirim link reset password
                    </Button>
                </div>
            </form>

            <div className="space-x-1 text-center text-sm text-muted-foreground">
                <span>Atau, kembali ke</span>
                <TextLink href={login()}>masuk</TextLink>
            </div>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Lupa kata sandi',
    description: 'Masukkan email Anda untuk menerima link reset password',
};
