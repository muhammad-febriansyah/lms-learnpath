import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, Building2, Eye, EyeOff, Minus, Plus } from 'lucide-react';
import { useState } from 'react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRecaptchaV3 } from '@/hooks/use-recaptcha-v3';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Props = {
    pricePerSeat: number;
    minSeats: number;
    maxSeats: number;
};

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

const INDUSTRIES = [
    'Teknologi & IT',
    'Manufaktur',
    'Keuangan & Perbankan',
    'Pendidikan',
    'Kesehatan',
    'Retail & E-commerce',
    'F&B',
    'Properti & Konstruksi',
    'Konsultan',
    'Lainnya',
];

const SIZES = ['1-10 karyawan', '11-50 karyawan', '51-200 karyawan', '201-500 karyawan', '500+ karyawan'];

export default function BusinessRegister({ pricePerSeat, minSeats, maxSeats }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const form = useForm({
        company_name: '',
        industry: '',
        size_range: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        password: '',
        password_confirmation: '',
        seats: minSeats,
        agreed_terms: false,
        recaptcha_token: '',
    });
    const { execute } = useRecaptchaV3();

    const total = form.data.seats * pricePerSeat;

    const adjustSeats = (delta: number) => {
        const next = Math.max(minSeats, Math.min(maxSeats, form.data.seats + delta));
        form.setData('seats', next);
    };

    async function submit(event: React.FormEvent) {
        event.preventDefault();

        let token = '';
        try {
            token = await execute('business_register');
            form.clearErrors('recaptcha_token');
        } catch {
            form.setError('recaptcha_token', 'Verifikasi reCAPTCHA gagal. Silakan coba lagi.');
            return;
        }

        form.transform((d) => ({ ...d, recaptcha_token: token }));
        form.post('/business/register', {
            onFinish: () => form.transform((d) => d),
        });
    }

    return (
        <>
            <Head title="Daftar Perusahaan" />
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
                <nav className="border-b border-slate-100 bg-white/80 backdrop-blur">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <Link href="/" className="text-[18px] font-extrabold text-brand-700">
                            Learnpath
                        </Link>
                        <Link
                            href="/business"
                            className="text-[13px] font-semibold text-slate-600 hover:text-slate-900"
                        >
                            ← Kembali ke halaman bisnis
                        </Link>
                    </div>
                </nav>

                <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[1fr_320px]">
                    <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[11.5px] font-bold tracking-wider text-brand-700 uppercase">
                            <Building2 className="size-3.5" />
                            Daftar untuk Bisnis
                        </div>
                        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
                            Aktifkan paket Learnpath untuk tim Anda
                        </h1>
                        <p className="mt-2 text-[14px] text-slate-600">
                            Isi data perusahaan dan PIC. Setelah pembayaran berhasil, Anda langsung
                            mendapat akses dashboard HR untuk mengundang karyawan.
                        </p>

                        <form
                            onSubmit={submit}
                            className="mt-8 space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70"
                        >
                            <h2 className="text-[14px] font-bold text-slate-900">Data Perusahaan</h2>
                            <div className="space-y-2">
                                <RequiredLabel htmlFor="company_name" required>
                                    Nama Perusahaan
                                </RequiredLabel>
                                <Input
                                    id="company_name"
                                    placeholder="PT Contoh Sejahtera"
                                    value={form.data.company_name}
                                    onChange={(e) => form.setData('company_name', e.target.value)}
                                    required
                                />
                                <FieldError message={form.errors.company_name} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <RequiredLabel htmlFor="industry">Industri</RequiredLabel>
                                    <Select
                                        value={form.data.industry}
                                        onValueChange={(v) => form.setData('industry', v)}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Pilih industri" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {INDUSTRIES.map((i) => (
                                                <SelectItem key={i} value={i}>
                                                    {i}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldError message={form.errors.industry} />
                                </div>
                                <div className="space-y-2">
                                    <RequiredLabel htmlFor="size_range">Ukuran Perusahaan</RequiredLabel>
                                    <Select
                                        value={form.data.size_range}
                                        onValueChange={(v) => form.setData('size_range', v)}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Pilih ukuran" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SIZES.map((s) => (
                                                <SelectItem key={s} value={s}>
                                                    {s}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldError message={form.errors.size_range} />
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-5">
                                <h2 className="text-[14px] font-bold text-slate-900">
                                    Akun Admin (PIC HR)
                                </h2>
                                <p className="mt-0.5 text-[11.5px] text-slate-500">
                                    Akun ini akan jadi admin organisasi yang mengelola karyawan.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <RequiredLabel htmlFor="contact_name" required>
                                    Nama Lengkap
                                </RequiredLabel>
                                <Input
                                    id="contact_name"
                                    placeholder="Nama PIC"
                                    value={form.data.contact_name}
                                    onChange={(e) => form.setData('contact_name', e.target.value)}
                                    required
                                />
                                <FieldError message={form.errors.contact_name} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <RequiredLabel htmlFor="contact_email" required>
                                        Email
                                    </RequiredLabel>
                                    <Input
                                        id="contact_email"
                                        type="email"
                                        placeholder="hr@perusahaan.com"
                                        value={form.data.contact_email}
                                        onChange={(e) => form.setData('contact_email', e.target.value)}
                                        required
                                    />
                                    <FieldError message={form.errors.contact_email} />
                                </div>
                                <div className="space-y-2">
                                    <RequiredLabel htmlFor="contact_phone" required>
                                        Telepon / WA
                                    </RequiredLabel>
                                    <Input
                                        id="contact_phone"
                                        placeholder="+62 812 3456 7890"
                                        value={form.data.contact_phone}
                                        onChange={(e) => form.setData('contact_phone', e.target.value)}
                                        required
                                    />
                                    <FieldError message={form.errors.contact_phone} />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <RequiredLabel htmlFor="password" required>
                                        Password
                                    </RequiredLabel>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Minimal 8 karakter"
                                            value={form.data.password}
                                            onChange={(e) => form.setData('password', e.target.value)}
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
                                <div className="space-y-2">
                                    <RequiredLabel htmlFor="password_confirmation" required>
                                        Konfirmasi Password
                                    </RequiredLabel>
                                    <div className="relative">
                                        <Input
                                            id="password_confirmation"
                                            type={showConfirm ? 'text' : 'password'}
                                            placeholder="Ulangi password"
                                            value={form.data.password_confirmation}
                                            onChange={(e) =>
                                                form.setData('password_confirmation', e.target.value)
                                            }
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm((v) => !v)}
                                            className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                                        >
                                            {showConfirm ? (
                                                <EyeOff className="size-4" />
                                            ) : (
                                                <Eye className="size-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-5">
                                <h2 className="text-[14px] font-bold text-slate-900">Paket Seat</h2>
                                <p className="mt-0.5 text-[11.5px] text-slate-500">
                                    1 seat = 1 karyawan dengan akses penuh ke semua course.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <RequiredLabel required>Jumlah Seat</RequiredLabel>
                                <div className="flex items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => adjustSeats(-5)}
                                        disabled={form.data.seats <= minSeats}
                                    >
                                        <Minus className="size-4" />
                                    </Button>
                                    <Input
                                        type="number"
                                        min={minSeats}
                                        max={maxSeats}
                                        value={form.data.seats}
                                        onChange={(e) => {
                                            const v = parseInt(e.target.value) || minSeats;
                                            form.setData(
                                                'seats',
                                                Math.max(minSeats, Math.min(maxSeats, v)),
                                            );
                                        }}
                                        className="h-12 max-w-[140px] text-center text-[18px] font-bold tabular-nums"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => adjustSeats(5)}
                                        disabled={form.data.seats >= maxSeats}
                                    >
                                        <Plus className="size-4" />
                                    </Button>
                                    <div className="text-[12.5px] text-slate-500">
                                        × {formatRupiah(pricePerSeat)} = <b className="text-slate-900">{formatRupiah(total)}</b>
                                    </div>
                                </div>
                                <FieldError message={form.errors.seats} />
                            </div>

                            <label className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3">
                                <input
                                    type="checkbox"
                                    checked={form.data.agreed_terms}
                                    onChange={(e) => form.setData('agreed_terms', e.target.checked)}
                                    className="mt-0.5 size-4 rounded border-slate-300"
                                />
                                <span className="text-[12.5px] text-slate-600">
                                    Saya menyetujui <Link href="/terms" className="text-brand-600 underline">syarat &amp; ketentuan</Link>{' '}
                                    dan <Link href="/privacy" className="text-brand-600 underline">kebijakan privasi</Link> Learnpath.
                                </span>
                            </label>
                            <FieldError message={form.errors.agreed_terms} />

                            {form.errors.recaptcha_token && (
                                <p className="text-sm font-medium text-rose-600">
                                    {form.errors.recaptcha_token}
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="w-full rounded-xl bg-brand-600 py-6 text-[15px] font-bold hover:bg-brand-700"
                            >
                                {form.processing ? 'Memproses...' : 'Daftar & Lanjut Pembayaran'}
                                <ArrowRight className="ml-2 size-4" />
                            </Button>
                        </form>
                    </div>

                    <aside className="space-y-4">
                        <div className="rounded-2xl bg-slate-900 p-6 text-white">
                            <div className="text-[11px] font-bold tracking-wider uppercase opacity-70">
                                Ringkasan
                            </div>
                            <div className="mt-3 flex items-baseline justify-between">
                                <span className="text-[13px] opacity-80">Jumlah seat</span>
                                <span className="text-[15px] font-bold tabular-nums">
                                    {form.data.seats}
                                </span>
                            </div>
                            <div className="mt-1 flex items-baseline justify-between">
                                <span className="text-[13px] opacity-80">Harga per seat</span>
                                <span className="text-[13px] tabular-nums">{formatRupiah(pricePerSeat)}</span>
                            </div>
                            <div className="mt-4 border-t border-white/20 pt-4">
                                <div className="text-[11px] opacity-70">Total bayar</div>
                                <div className="mt-1 text-[28px] font-extrabold tabular-nums leading-none">
                                    {formatRupiah(total)}
                                </div>
                                <div className="mt-1 text-[10.5px] opacity-60">Sudah termasuk akses unlimited</div>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200/70">
                            <h3 className="text-[13px] font-bold text-slate-900">Yang akan Anda dapat</h3>
                            <ul className="mt-3 space-y-2 text-[12.5px] text-slate-700">
                                <li>✓ Dashboard HR khusus</li>
                                <li>✓ Akses semua course library</li>
                                <li>✓ Undang karyawan bulk via CSV</li>
                                <li>✓ Skill matrix per posisi</li>
                                <li>✓ Laporan progress real-time</li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
}
