import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Briefcase,
    Building2,
    FileText,
    Globe,
    GraduationCap,
    Linkedin,
    Phone,
    Plus,
    Upload,
    User as UserSquare,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';

import {
    AuthField,
    AuthInput,
    AuthPasswordInput,
    LockIcon,
    MailIcon,
    UserIcon,
} from '@/components/auth-field';
import { GoogleButton } from '@/components/auth/google-button';
import { IconArrowR, IconChevR } from '@/components/learnpath-icons';
import { useRecaptchaV3 } from '@/hooks/use-recaptcha-v3';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

type IntendedRole = 'user_public' | 'instructor';

type Step1Data = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

const ROLE_META: Record<IntendedRole, { title: string; tagline: string; icon: typeof UserSquare; tint: string }> = {
    user_public: {
        title: 'Akun Pribadi',
        tagline: 'Belajar di marketplace, beli kursus sendiri.',
        icon: UserSquare,
        tint: 'from-brand-500 to-brand-700',
    },
    instructor: {
        title: 'Mentor / Instructor',
        tagline: 'Buat course, ajar peserta, dapat pendapatan.',
        icon: GraduationCap,
        tint: 'from-emerald-500 to-emerald-700',
    },
};

export default function Register({ passwordRules }: Props) {
    const [selectedRole, setSelectedRole] = useState<IntendedRole | null>(null);

    if (!selectedRole) {
        return <RolePicker onPick={setSelectedRole} />;
    }

    if (selectedRole === 'instructor') {
        return <InstructorRegister passwordRules={passwordRules} onBack={() => setSelectedRole(null)} />;
    }

    return <UserPublicRegister passwordRules={passwordRules} onBack={() => setSelectedRole(null)} />;
}

function RolePicker({ onPick }: { onPick: (role: IntendedRole) => void }) {
    const googleError = (usePage().props.errors as Record<string, string>)?.google;

    return (
        <>
            <Head title="Daftar" />
            <div className="space-y-4">
                {googleError && (
                    <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
                        {googleError}
                    </div>
                )}
                <p className="text-[13.5px] text-slate-500">
                    Pilih tipe akun yang sesuai. Akun bisnis (B2B tenant) dibuat lewat halaman terpisah.
                </p>

                <button
                    type="button"
                    onClick={() => onPick('user_public')}
                    className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-brand-300 hover:bg-brand-50/40"
                >
                    <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                        <UserSquare className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-[15px] font-bold text-slate-900">
                            {ROLE_META.user_public.title}
                        </div>
                        <div className="text-[12.5px] text-slate-500">
                            {ROLE_META.user_public.tagline}
                        </div>
                    </div>
                    <IconChevR size={16} className="text-slate-400 transition group-hover:text-brand-600" />
                </button>

                <button
                    type="button"
                    onClick={() => onPick('instructor')}
                    className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50/40"
                >
                    <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
                        <GraduationCap className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-[15px] font-bold text-slate-900">
                            {ROLE_META.instructor.title}
                        </div>
                        <div className="text-[12.5px] text-slate-500">
                            {ROLE_META.instructor.tagline}
                        </div>
                    </div>
                    <IconChevR size={16} className="text-slate-400 transition group-hover:text-emerald-600" />
                </button>

                <Link
                    href="/business/register"
                    className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-violet-300 hover:bg-violet-50/40"
                >
                    <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 text-white">
                        <Building2 className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-[15px] font-bold text-slate-900">
                            Bisnis / Perusahaan (B2B)
                        </div>
                        <div className="text-[12.5px] text-slate-500">
                            Buat tenant baru untuk training karyawan, dapat seat HR.
                        </div>
                    </div>
                    <IconChevR size={16} className="text-slate-400 transition group-hover:text-violet-600" />
                </Link>

                <p className="pt-2 text-center text-[12.5px] text-slate-500">
                    Karyawan?{' '}
                    <span className="text-slate-700">
                        Akun dibuat otomatis lewat undangan HR — cek inbox Anda.
                    </span>
                </p>

                <p className="text-center text-[13.5px] text-slate-500">
                    Sudah punya akun?{' '}
                    <Link
                        href={login()}
                        className="font-semibold text-brand-600 underline-offset-4 hover:text-brand-700 hover:underline"
                    >
                        Masuk
                    </Link>
                </p>
            </div>
        </>
    );
}

function RoleHeader({ role, onBack }: { role: IntendedRole; onBack: () => void }) {
    const meta = ROLE_META[role];
    const Icon = meta.icon;

    return (
        <>
            <button
                type="button"
                onClick={onBack}
                className="mb-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-slate-500 transition hover:text-brand-600"
            >
                <ArrowLeft className="size-3.5" />
                Ganti tipe akun
            </button>

            <div className={`mb-4 flex items-center gap-3 rounded-2xl bg-gradient-to-br ${meta.tint} p-4 text-white`}>
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/15">
                    <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                    <div className="text-[13.5px] font-bold">{meta.title}</div>
                    <div className="text-[11.5px] opacity-90">{meta.tagline}</div>
                </div>
            </div>
        </>
    );
}

function UserPublicRegister({
    passwordRules,
    onBack,
}: {
    passwordRules: string;
    onBack: () => void;
}) {
    const form = useForm<{
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        intended_role: IntendedRole;
        recaptcha_token: string;
    }>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        intended_role: 'user_public',
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

        form.transform((data) => ({ ...data, recaptcha_token: recaptchaToken }));

        form.post(store.url(), {
            onSuccess: () => form.reset('password', 'password_confirmation', 'recaptcha_token'),
            onFinish: () => form.transform((data) => data),
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title="Daftar — Akun Pribadi" />
            <RoleHeader role="user_public" onBack={onBack} />

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

                    {form.errors.intended_role && (
                        <p className="text-sm font-medium text-rose-600">{form.errors.intended_role}</p>
                    )}

                    <SubmitButton processing={form.processing} label="Buat akun" />
                </div>

                <div className="mt-6 space-y-3">
                    <Divider />
                    <GoogleButton intent="register" role="user_public" />
                </div>

                <LoginLink />
            </form>
        </>
    );
}

function InstructorRegister({
    passwordRules,
    onBack,
}: {
    passwordRules: string;
    onBack: () => void;
}) {
    const [step, setStep] = useState<1 | 2>(1);
    const [step1, setStep1] = useState<Step1Data>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const form = useForm<{
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        intended_role: IntendedRole;
        headline: string;
        phone: string;
        expertise: string[];
        linkedin_url: string;
        bio: string;
        website: string;
        cv: File | null;
        recaptcha_token: string;
    }>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        intended_role: 'instructor',
        headline: '',
        phone: '',
        expertise: [],
        linkedin_url: '',
        bio: '',
        website: '',
        cv: null,
        recaptcha_token: '',
    });

    const { execute } = useRecaptchaV3();

    function next() {
        // Light client-side check; server validates fully on submit.
        if (
            !step1.name.trim() ||
            !step1.email.trim() ||
            !step1.password ||
            step1.password.length < 8 ||
            step1.password !== step1.password_confirmation
        ) {
            return;
        }
        setStep(2);
    }

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

        form.transform((data) => ({ ...data, ...step1, recaptcha_token: recaptchaToken }));

        form.post(store.url(), {
            forceFormData: true,
            onError: (errors) => {
                // If step-1 fields fail, send the user back to step 1.
                if (errors.name || errors.email || errors.password) {
                    setStep(1);
                }
            },
            onFinish: () => form.transform((data) => data),
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title={`Daftar — Mentor (Step ${step}/2)`} />
            <RoleHeader role="instructor" onBack={onBack} />

            <StepIndicator current={step} />

            {step === 1 ? (
                <div>
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
                                value={step1.name}
                                onChange={(event) =>
                                    setStep1((prev) => ({ ...prev, name: event.target.value }))
                                }
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
                                value={step1.email}
                                onChange={(event) =>
                                    setStep1((prev) => ({ ...prev, email: event.target.value }))
                                }
                            />
                        </AuthField>

                        <AuthField label="Kata sandi" icon={<LockIcon />} error={form.errors.password}>
                            <AuthPasswordInput
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                required
                                value={step1.password}
                                onChange={(event) =>
                                    setStep1((prev) => ({ ...prev, password: event.target.value }))
                                }
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
                                value={step1.password_confirmation}
                                onChange={(event) =>
                                    setStep1((prev) => ({
                                        ...prev,
                                        password_confirmation: event.target.value,
                                    }))
                                }
                            />
                        </AuthField>

                        {passwordRules && (
                            <p className="text-[12px] text-slate-500">
                                Sandi harus memenuhi: {passwordRules.toLowerCase()}
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={next}
                            className="relative mt-2 w-full rounded-xl bg-emerald-600 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(16,185,129,0.6)] transition hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-600/20 focus:outline-none active:bg-emerald-800"
                        >
                            <span className="inline-flex items-center justify-center gap-2">
                                Lanjut: Profil Mentor <IconArrowR size={16} />
                            </span>
                        </button>
                    </div>

                    <div className="mt-6 space-y-3">
                        <Divider />
                        <GoogleButton intent="register" role="instructor" />
                    </div>

                    <LoginLink />
                </div>
            ) : (
                <form onSubmit={submit}>
                    <InstructorStep2
                        data={form.data}
                        errors={form.errors}
                        setData={form.setData}
                    />

                    {form.errors.recaptcha_token && (
                        <p className="mt-3 text-sm font-medium text-rose-600">{form.errors.recaptcha_token}</p>
                    )}

                    <div className="mt-5 flex gap-2">
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="rounded-xl bg-slate-100 px-4 py-3.5 text-[14px] font-semibold text-slate-700 transition hover:bg-slate-200"
                        >
                            <ArrowLeft className="mr-1 inline size-4" />
                            Kembali
                        </button>
                        <button
                            type="submit"
                            disabled={form.processing}
                            data-test="register-mentor-button"
                            className="relative flex-1 rounded-xl bg-emerald-600 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(16,185,129,0.6)] transition hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-600/20 focus:outline-none active:bg-emerald-800 disabled:opacity-80"
                        >
                            <span
                                className={
                                    'inline-flex items-center justify-center gap-2 ' +
                                    (form.processing ? 'opacity-0' : '')
                                }
                            >
                                Daftar sebagai Mentor <IconArrowR size={16} />
                            </span>
                            {form.processing && (
                                <span className="absolute inset-0 grid place-items-center">
                                    <Spinner />
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </>
    );
}

type Step2Data = {
    headline: string;
    phone: string;
    expertise: string[];
    linkedin_url: string;
    bio: string;
    website: string;
    cv: File | null;
};

type Step2Errors = Partial<Record<keyof Step2Data, string>>;

function InstructorStep2({
    data,
    errors,
    setData,
}: {
    data: Step2Data;
    errors: Step2Errors;
    setData: (field: keyof Step2Data, value: Step2Data[keyof Step2Data]) => void;
}) {
    const [expertiseInput, setExpertiseInput] = useState('');
    const cvInputRef = useRef<HTMLInputElement | null>(null);

    function addExpertise() {
        const value = expertiseInput.trim();
        if (!value) return;
        if (data.expertise.includes(value)) {
            setExpertiseInput('');

            return;
        }
        if (data.expertise.length >= 10) return;
        setData('expertise', [...data.expertise, value]);
        setExpertiseInput('');
    }

    function removeExpertise(tag: string) {
        setData(
            'expertise',
            data.expertise.filter((t) => t !== tag),
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
        setData('cv', file);
    }

    return (
        <div className="space-y-4">
            <AuthField
                label="Headline profesional"
                icon={<Briefcase className="size-[18px]" />}
                error={errors.headline}
            >
                <AuthInput
                    type="text"
                    placeholder="Senior Data Engineer at Tokopedia"
                    maxLength={200}
                    required
                    value={data.headline}
                    onChange={(e) => setData('headline', e.target.value)}
                />
            </AuthField>

            <AuthField label="Nomor telepon" icon={<Phone className="size-[18px]" />} error={errors.phone}>
                <AuthInput
                    type="tel"
                    placeholder="+62 812 3456 7890"
                    autoComplete="tel"
                    required
                    value={data.phone}
                    onChange={(e) => setData('phone', e.target.value)}
                />
            </AuthField>

            <div>
                <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
                    Bidang keahlian <span className="text-rose-500">*</span>
                </label>
                {data.expertise.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                        {data.expertise.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[12px] font-semibold text-violet-700"
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => removeExpertise(tag)}
                                    className="rounded-full p-0.5 transition hover:bg-violet-100"
                                    aria-label={`Hapus ${tag}`}
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
                <p className="mt-1 text-[11.5px] text-slate-500">Tekan Enter untuk menambah tag (maks 10).</p>
                {errors.expertise && (
                    <p className="mt-1 text-[12.5px] text-rose-600">{errors.expertise}</p>
                )}
            </div>

            <AuthField
                label="URL LinkedIn"
                icon={<Linkedin className="size-[18px]" />}
                error={errors.linkedin_url}
            >
                <AuthInput
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    required
                    value={data.linkedin_url}
                    onChange={(e) => setData('linkedin_url', e.target.value)}
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
                        (errors.cv
                            ? 'bg-rose-50/40 ring-rose-300'
                            : data.cv
                              ? 'bg-emerald-50/40 ring-emerald-300'
                              : 'bg-surface ring-slate-200 hover:bg-white hover:ring-emerald-300')
                    }
                >
                    <span className={data.cv ? 'text-emerald-600' : 'text-slate-400'}>
                        {data.cv ? <FileText className="size-[18px]" /> : <Upload className="size-[18px]" />}
                    </span>
                    <span className="flex-1 truncate text-left text-[13.5px]">
                        {data.cv ? (
                            <span className="font-semibold text-slate-900">{data.cv.name}</span>
                        ) : (
                            <span className="text-slate-500">Pilih file CV (PDF)</span>
                        )}
                    </span>
                    {data.cv && (
                        <span className="text-[11.5px] font-medium text-emerald-700">
                            {(data.cv.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                    )}
                </button>
                <p className="mt-1 text-[11.5px] text-slate-500">
                    CV hanya bisa dilihat oleh admin saat proses approval.
                </p>
                {errors.cv && <p className="mt-1 text-[12.5px] text-rose-600">{errors.cv}</p>}
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
                            value={data.bio}
                            onChange={(e) => setData('bio', e.target.value)}
                            maxLength={500}
                            rows={3}
                            placeholder="Ceritakan motivasi mengajar atau pengalaman singkat..."
                            className="w-full rounded-xl bg-white px-3 py-2 text-[13px] ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-brand-600"
                        />
                        <div className="mt-1 flex justify-between">
                            {errors.bio && <span className="text-[11.5px] text-rose-600">{errors.bio}</span>}
                            <span className="ml-auto text-[11px] text-slate-400">{data.bio.length}/500</span>
                        </div>
                    </div>

                    <AuthField
                        label="Website / portfolio"
                        icon={<Globe className="size-[18px]" />}
                        error={errors.website}
                    >
                        <AuthInput
                            type="url"
                            placeholder="https://example.com"
                            value={data.website}
                            onChange={(e) => setData('website', e.target.value)}
                        />
                    </AuthField>
                </div>
            </details>
        </div>
    );
}

function StepIndicator({ current }: { current: 1 | 2 }) {
    return (
        <div className="mb-5 flex items-center gap-2">
            <div className="flex items-center gap-1.5">
                <span
                    className={
                        'grid size-6 place-items-center rounded-full text-[11px] font-bold ' +
                        (current >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500')
                    }
                >
                    1
                </span>
                <span className="text-[12px] font-semibold text-slate-700">Akun</span>
            </div>
            <div className="h-px flex-1 bg-slate-200" />
            <div className="flex items-center gap-1.5">
                <span
                    className={
                        'grid size-6 place-items-center rounded-full text-[11px] font-bold ' +
                        (current >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500')
                    }
                >
                    2
                </span>
                <span
                    className={
                        'text-[12px] font-semibold ' +
                        (current >= 2 ? 'text-slate-700' : 'text-slate-400')
                    }
                >
                    Profil Mentor
                </span>
            </div>
        </div>
    );
}

function SubmitButton({ processing, label }: { processing: boolean; label: string }) {
    return (
        <button
            type="submit"
            disabled={processing}
            tabIndex={5}
            data-test="register-user-button"
            className="relative mt-2 w-full rounded-xl bg-brand-600 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(18,35,125,0.6)] transition hover:bg-brand-700 focus:ring-4 focus:ring-brand-600/20 focus:outline-none active:bg-brand-800 disabled:opacity-80"
        >
            <span className={'inline-flex items-center justify-center gap-2 ' + (processing ? 'opacity-0' : '')}>
                {label} <IconArrowR size={16} />
            </span>
            {processing && (
                <span className="absolute inset-0 grid place-items-center">
                    <Spinner />
                </span>
            )}
        </button>
    );
}

function Spinner() {
    return (
        <svg viewBox="0 0 24 24" className="size-5 animate-spin">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
            <path
                d="M21 12a9 9 0 0 0-9-9"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            />
        </svg>
    );
}

function Divider() {
    return (
        <div className="relative flex items-center">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">atau</span>
            <div className="h-px flex-1 bg-slate-200" />
        </div>
    );
}

function LoginLink() {
    return (
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
    );
}

Register.layout = {
    title: 'Buat akun gratis',
    description: 'Mulai perjalanan belajar Anda',
};
