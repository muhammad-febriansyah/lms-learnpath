import { Head, useForm } from '@inertiajs/react';
import {
    Briefcase,
    FileText,
    Globe,
    GraduationCap,
    Linkedin,
    Phone,
    Plus,
    Upload,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';

import { AuthField, AuthInput } from '@/components/auth-field';

type Props = {
    user: {
        name: string;
        email: string;
    };
};

export default function MentorOnboarding({ user }: Props) {
    const cvInputRef = useRef<HTMLInputElement | null>(null);
    const [expertiseInput, setExpertiseInput] = useState('');

    const form = useForm<{
        headline: string;
        phone: string;
        expertise: string[];
        linkedin_url: string;
        bio: string;
        website: string;
        cv: File | null;
    }>({
        headline: '',
        phone: '',
        expertise: [],
        linkedin_url: '',
        bio: '',
        website: '',
        cv: null,
    });

    function addExpertise() {
        const value = expertiseInput.trim();
        if (!value) return;
        if (form.data.expertise.includes(value)) {
            setExpertiseInput('');

            return;
        }
        if (form.data.expertise.length >= 10) return;
        form.setData('expertise', [...form.data.expertise, value]);
        setExpertiseInput('');
    }

    function removeExpertise(tag: string) {
        form.setData(
            'expertise',
            form.data.expertise.filter((t) => t !== tag),
        );
    }

    function onExpertiseKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            addExpertise();
        }
    }

    function handleCvChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] ?? null;
        form.setData('cv', file);
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/onboarding/mentor', {
            forceFormData: true,
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title="Lengkapi Profil Mentor" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 px-4 py-10">
                <div className="mx-auto max-w-2xl">
                    <div className="mb-5 flex items-center gap-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-4 text-white shadow-[0_12px_30px_-12px_rgba(16,185,129,0.6)]">
                        <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/15">
                            <GraduationCap className="size-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-[15px] font-bold">
                                Selamat datang, {user.name}!
                            </div>
                            <div className="text-[12.5px] opacity-90">
                                Lengkapi profil mentor untuk dikirim ke admin. Cuma butuh ~2 menit.
                            </div>
                        </div>
                    </div>

                    <form
                        onSubmit={submit}
                        className="rounded-2xl bg-white p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/70 sm:p-8"
                    >
                        <h1 className="text-[18px] font-extrabold tracking-tight text-slate-900">
                            Profil Mentor
                        </h1>
                        <p className="mt-1 mb-5 text-[12.5px] text-slate-500">
                            Email <span className="font-semibold text-slate-700">{user.email}</span> sudah
                            tersimpan. Isi info di bawah supaya admin bisa verifikasi.
                        </p>

                        <div className="space-y-4">
                            <AuthField
                                label="Headline profesional"
                                icon={<Briefcase className="size-[18px]" />}
                                error={form.errors.headline}
                            >
                                <AuthInput
                                    type="text"
                                    placeholder="Senior Data Engineer at Tokopedia"
                                    maxLength={200}
                                    required
                                    autoFocus
                                    value={form.data.headline}
                                    onChange={(e) => form.setData('headline', e.target.value)}
                                />
                            </AuthField>

                            <AuthField
                                label="Nomor telepon"
                                icon={<Phone className="size-[18px]" />}
                                error={form.errors.phone}
                            >
                                <AuthInput
                                    type="tel"
                                    placeholder="+62 812 3456 7890"
                                    autoComplete="tel"
                                    required
                                    value={form.data.phone}
                                    onChange={(e) => form.setData('phone', e.target.value)}
                                />
                            </AuthField>

                            <div>
                                <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
                                    Bidang keahlian <span className="text-rose-500">*</span>
                                </label>
                                {form.data.expertise.length > 0 && (
                                    <div className="mb-2 flex flex-wrap gap-1.5">
                                        {form.data.expertise.map((tag) => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[12px] font-semibold text-brand-700"
                                            >
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => removeExpertise(tag)}
                                                    className="rounded-full p-0.5 transition hover:bg-brand-100"
                                                >
                                                    <X className="size-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <div className="flex flex-1 items-center rounded-xl bg-surface px-3.5 py-3 ring-1 ring-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-600">
                                        <input
                                            type="text"
                                            value={expertiseInput}
                                            onChange={(e) => setExpertiseInput(e.target.value)}
                                            onKeyDown={onExpertiseKeyDown}
                                            placeholder="Contoh: Data Science, Machine Learning"
                                            className="w-full bg-transparent text-[14px] outline-none placeholder:text-slate-400"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addExpertise}
                                        className="rounded-xl bg-slate-100 px-3 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-200"
                                    >
                                        <Plus className="inline size-4" />
                                    </button>
                                </div>
                                <p className="mt-1 text-[11.5px] text-slate-500">
                                    Tekan Enter untuk menambah tag (maks 10).
                                </p>
                                {form.errors.expertise && (
                                    <p className="mt-1 text-[12.5px] text-rose-600">{form.errors.expertise}</p>
                                )}
                            </div>

                            <AuthField
                                label="URL LinkedIn"
                                icon={<Linkedin className="size-[18px]" />}
                                error={form.errors.linkedin_url}
                            >
                                <AuthInput
                                    type="url"
                                    placeholder="https://linkedin.com/in/username"
                                    required
                                    value={form.data.linkedin_url}
                                    onChange={(e) => form.setData('linkedin_url', e.target.value)}
                                />
                            </AuthField>

                            <div>
                                <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
                                    CV / Resume (PDF, maks 5 MB) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    ref={cvInputRef}
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleCvChange}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => cvInputRef.current?.click()}
                                    className={
                                        'flex w-full items-center gap-3 rounded-xl px-3.5 py-3 ring-1 transition ' +
                                        (form.errors.cv
                                            ? 'bg-rose-50/40 ring-rose-300'
                                            : form.data.cv
                                              ? 'bg-emerald-50/40 ring-emerald-300'
                                              : 'bg-surface ring-slate-200 hover:bg-white hover:ring-emerald-300')
                                    }
                                >
                                    <span className={form.data.cv ? 'text-emerald-600' : 'text-slate-400'}>
                                        {form.data.cv ? (
                                            <FileText className="size-[18px]" />
                                        ) : (
                                            <Upload className="size-[18px]" />
                                        )}
                                    </span>
                                    <span className="flex-1 truncate text-left text-[13.5px]">
                                        {form.data.cv ? (
                                            <span className="font-semibold text-slate-900">
                                                {form.data.cv.name}
                                            </span>
                                        ) : (
                                            <span className="text-slate-500">Pilih file CV (PDF)</span>
                                        )}
                                    </span>
                                    {form.data.cv && (
                                        <span className="text-[11.5px] font-medium text-emerald-700">
                                            {(form.data.cv.size / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                    )}
                                </button>
                                <p className="mt-1 text-[11.5px] text-slate-500">
                                    CV hanya bisa dilihat oleh admin saat proses approval.
                                </p>
                                {form.errors.cv && (
                                    <p className="mt-1 text-[12.5px] text-rose-600">{form.errors.cv}</p>
                                )}
                            </div>

                            <details className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-[12.5px]">
                                <summary className="cursor-pointer font-semibold text-slate-700">
                                    Tambah info opsional (bio, website)
                                </summary>
                                <div className="mt-3 space-y-3">
                                    <div>
                                        <label className="mb-1.5 block text-[12.5px] font-medium text-slate-700">
                                            Bio singkat (maks 500 karakter)
                                        </label>
                                        <textarea
                                            value={form.data.bio}
                                            onChange={(e) => form.setData('bio', e.target.value)}
                                            maxLength={500}
                                            rows={3}
                                            placeholder="Ceritakan motivasi mengajar atau pengalaman singkat..."
                                            className="w-full rounded-xl bg-white px-3 py-2 text-[13px] ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-brand-600"
                                        />
                                        <div className="mt-1 flex justify-between">
                                            {form.errors.bio && (
                                                <span className="text-[11.5px] text-rose-600">
                                                    {form.errors.bio}
                                                </span>
                                            )}
                                            <span className="ml-auto text-[11px] text-slate-400">
                                                {form.data.bio.length}/500
                                            </span>
                                        </div>
                                    </div>

                                    <AuthField
                                        label="Website / portfolio"
                                        icon={<Globe className="size-[18px]" />}
                                        error={form.errors.website}
                                    >
                                        <AuthInput
                                            type="url"
                                            placeholder="https://example.com"
                                            value={form.data.website}
                                            onChange={(e) => form.setData('website', e.target.value)}
                                        />
                                    </AuthField>
                                </div>
                            </details>
                        </div>

                        <button
                            type="submit"
                            disabled={form.processing}
                            data-test="mentor-onboarding-submit"
                            className="relative mt-6 w-full rounded-xl bg-emerald-600 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(16,185,129,0.6)] transition hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-600/20 focus:outline-none active:bg-emerald-800 disabled:opacity-80"
                        >
                            <span
                                className={
                                    'inline-flex items-center justify-center gap-2 ' +
                                    (form.processing ? 'opacity-0' : '')
                                }
                            >
                                Kirim untuk Approval
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

                        <p className="mt-4 text-center text-[11.5px] text-slate-500">
                            Setelah submit, Anda akan diarahkan ke halaman menunggu. Notifikasi
                            persetujuan dikirim via email.
                        </p>
                    </form>
                </div>
            </div>
        </>
    );
}
