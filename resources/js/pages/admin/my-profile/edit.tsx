import { Head, Link, useForm } from '@inertiajs/react';
import {
    Camera,
    Globe,
    Instagram,
    KeyRound,
    Linkedin,
    Lock,
    Save,
    ShieldCheck,
    Twitter,
    User,
    Youtube,
} from 'lucide-react';
import { useRef, useState } from 'react';

import { FieldError } from '@/components/form/field-error';
import { IconChevR } from '@/components/learnpath-icons';
import PasswordInput from '@/components/password-input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

type Profile = {
    headline: string | null;
    bio: string | null;
    expertise: string[] | null;
    photo_path: string | null;
    social_links: {
        linkedin?: string;
        instagram?: string;
        twitter?: string;
        youtube?: string;
    } | null;
    website: string | null;
    is_verified: boolean;
    is_active: boolean;
};

type Instructor = {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    profile: Profile;
};

type Props = { instructor: Instructor };

export default function MyProfileEdit({ instructor }: Props) {
    const [photoPreview, setPhotoPreview] = useState<string | null>(
        instructor.profile.photo_path
            ? `/storage/${instructor.profile.photo_path}`
            : (instructor.avatar ?? null),
    );

    const form = useForm({
        headline: instructor.profile.headline ?? '',
        bio: instructor.profile.bio ?? '',
        expertise: (instructor.profile.expertise ?? []) as string[],
        website: instructor.profile.website ?? '',
        social_links: {
            linkedin: instructor.profile.social_links?.linkedin ?? '',
            instagram: instructor.profile.social_links?.instagram ?? '',
            twitter: instructor.profile.social_links?.twitter ?? '',
            youtube: instructor.profile.social_links?.youtube ?? '',
        },
        photo: null as File | null,
        _method: 'PUT',
    });

    const [expertInput, setExpertInput] = useState('');

    const addExpertise = () => {
        const val = expertInput.trim();
        if (!val || form.data.expertise.includes(val)) return;
        form.setData('expertise', [...form.data.expertise, val]);
        setExpertInput('');
    };

    const removeExpertise = (item: string) => {
        form.setData(
            'expertise',
            form.data.expertise.filter((e) => e !== item),
        );
    };

    const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        form.setData('photo', file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/my-profile', { forceFormData: true });
    };

    return (
        <>
            <Head title="Profil Mentor" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Profil Mentor</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Profil Mentor
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Lengkapi profil agar peserta lebih mengenal Anda.
                    </p>
                </div>

                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 rounded-xl bg-slate-100 p-1 sm:max-w-md">
                        <TabsTrigger
                            value="profile"
                            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                        >
                            <User className="mr-1.5 size-3.5" />
                            Profil
                        </TabsTrigger>
                        <TabsTrigger
                            value="security"
                            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                        >
                            <Lock className="mr-1.5 size-3.5" />
                            Keamanan
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="mt-5">
                <form onSubmit={submit} className="grid gap-5 lg:grid-cols-3">
                    <div className="space-y-5 lg:col-span-2">
                        <Card title="Identitas Mentor">
                            <div className="flex items-start gap-5">
                                <div className="relative">
                                    <Avatar className="size-24 ring-4 ring-white shadow-md">
                                        {photoPreview ? (
                                            <AvatarImage src={photoPreview} alt={instructor.name} />
                                        ) : null}
                                        <AvatarFallback className="bg-brand-100 text-xl font-bold text-brand-700">
                                            {instructor.name
                                                .split(' ')
                                                .map((s) => s[0])
                                                .slice(0, 2)
                                                .join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <label className="absolute -right-1 -bottom-1 grid size-8 cursor-pointer place-items-center rounded-full bg-brand-600 text-white shadow-md ring-2 ring-white hover:bg-brand-700">
                                        <Camera className="size-4" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhoto}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <div className="text-[14px] font-bold text-slate-900">
                                            {instructor.name}
                                        </div>
                                        <div className="text-[12.5px] text-slate-500">
                                            {instructor.email}
                                        </div>
                                    </div>
                                    {instructor.profile.is_verified && (
                                        <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                                            <ShieldCheck className="size-3" />
                                            Mentor Terverifikasi
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>

                        <Card title="Tentang Anda">
                            <Field label="Headline" error={form.errors.headline} hint="1 kalimat profesional. Contoh: Senior Marketing Strategist · 10+ tahun pengalaman">
                                <Input
                                    placeholder="Senior Marketing Strategist"
                                    value={form.data.headline}
                                    onChange={(e) => form.setData('headline', e.target.value)}
                                />
                            </Field>

                            <Field label="Bio" error={form.errors.bio} hint="Ceritakan latar belakang, pengalaman, dan keahlian Anda.">
                                <Textarea
                                    rows={6}
                                    placeholder="Saya adalah marketing strategist berpengalaman 10+ tahun..."
                                    value={form.data.bio}
                                    onChange={(e) => form.setData('bio', e.target.value)}
                                />
                            </Field>

                            <Field label="Keahlian / Expertise" hint="Tambah satu per satu. Tekan Enter atau tombol Tambah.">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="SEO, Branding, Copywriting..."
                                        value={expertInput}
                                        onChange={(e) => setExpertInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addExpertise();
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addExpertise}
                                    >
                                        Tambah
                                    </Button>
                                </div>
                                {form.data.expertise.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {form.data.expertise.map((item) => (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => removeExpertise(item)}
                                                className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-[12px] font-semibold text-brand-700 transition hover:bg-rose-100 hover:text-rose-700"
                                            >
                                                {item}
                                                <span className="text-[10px] opacity-60">×</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </Field>
                        </Card>

                        <Card title="Tautan & Sosial Media">
                            <Field label="Website pribadi" error={form.errors.website}>
                                <div className="relative">
                                    <Globe className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        type="url"
                                        placeholder="https://"
                                        value={form.data.website}
                                        onChange={(e) => form.setData('website', e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </Field>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <SocialField
                                    label="LinkedIn"
                                    icon={<Linkedin className="size-4" />}
                                    value={form.data.social_links.linkedin}
                                    onChange={(v) =>
                                        form.setData('social_links', {
                                            ...form.data.social_links,
                                            linkedin: v,
                                        })
                                    }
                                />
                                <SocialField
                                    label="Instagram"
                                    icon={<Instagram className="size-4" />}
                                    value={form.data.social_links.instagram}
                                    onChange={(v) =>
                                        form.setData('social_links', {
                                            ...form.data.social_links,
                                            instagram: v,
                                        })
                                    }
                                />
                                <SocialField
                                    label="Twitter / X"
                                    icon={<Twitter className="size-4" />}
                                    value={form.data.social_links.twitter}
                                    onChange={(v) =>
                                        form.setData('social_links', {
                                            ...form.data.social_links,
                                            twitter: v,
                                        })
                                    }
                                />
                                <SocialField
                                    label="YouTube"
                                    icon={<Youtube className="size-4" />}
                                    value={form.data.social_links.youtube}
                                    onChange={(v) =>
                                        form.setData('social_links', {
                                            ...form.data.social_links,
                                            youtube: v,
                                        })
                                    }
                                />
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-5">
                        <div className="sticky top-5 rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                            <h3 className="text-[13px] font-bold text-slate-900">
                                Tips Mengisi Profil
                            </h3>
                            <ul className="mt-2 space-y-1.5 text-[12.5px] text-slate-600">
                                <li>• Gunakan foto profesional dengan latar netral</li>
                                <li>• Headline = 1 kalimat menjual</li>
                                <li>• Bio 3–5 paragraf, ceritakan journey karier</li>
                                <li>• Cantumkan minimal 3 keahlian</li>
                                <li>• LinkedIn = bukti kredibilitas</li>
                            </ul>
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="mt-4 w-full rounded-xl bg-brand-600 hover:bg-brand-700"
                            >
                                <Save className="mr-1.5 size-4" />
                                {form.processing ? 'Menyimpan...' : 'Simpan Profil'}
                            </Button>
                        </div>
                    </div>
                </form>
                    </TabsContent>

                    <TabsContent value="security" className="mt-5">
                        <SecurityTab />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}

function SecurityTab() {
    const currentRef = useRef<HTMLInputElement>(null);
    const newRef = useRef<HTMLInputElement>(null);

    const form = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [savedAt, setSavedAt] = useState<Date | null>(null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put('/settings/password', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setSavedAt(new Date());
            },
            onError: (errors) => {
                if (errors.password) {
                    newRef.current?.focus();
                }
                if (errors.current_password) {
                    currentRef.current?.focus();
                }
            },
        });
    };

    return (
        <div className="grid gap-5 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
                <Card title="Ubah Password">
                    <form onSubmit={submit} className="space-y-4">
                        <Field
                            label="Password Saat Ini"
                            error={form.errors.current_password}
                            hint="Isi password Anda yang sedang aktif."
                        >
                            <PasswordInput
                                id="current_password"
                                ref={currentRef}
                                name="current_password"
                                autoComplete="current-password"
                                placeholder="Password saat ini"
                                value={form.data.current_password}
                                onChange={(e) =>
                                    form.setData('current_password', e.target.value)
                                }
                            />
                        </Field>

                        <Field
                            label="Password Baru"
                            error={form.errors.password}
                            hint="Minimal 8 karakter, kombinasi huruf dan angka."
                        >
                            <PasswordInput
                                id="password"
                                ref={newRef}
                                name="password"
                                autoComplete="new-password"
                                placeholder="Password baru"
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                            />
                        </Field>

                        <Field
                            label="Konfirmasi Password Baru"
                            error={form.errors.password_confirmation}
                        >
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                autoComplete="new-password"
                                placeholder="Ulangi password baru"
                                value={form.data.password_confirmation}
                                onChange={(e) =>
                                    form.setData('password_confirmation', e.target.value)
                                }
                            />
                        </Field>

                        <div className="flex items-center gap-3 pt-2">
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-xl bg-brand-600 hover:bg-brand-700"
                            >
                                <KeyRound className="mr-1.5 size-4" />
                                {form.processing ? 'Menyimpan...' : 'Perbarui Password'}
                            </Button>
                            {savedAt && (
                                <span className="text-[12.5px] font-medium text-emerald-600">
                                    ✓ Password berhasil diperbarui
                                </span>
                            )}
                        </div>
                    </form>
                </Card>
            </div>

            <div className="space-y-5">
                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <div className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                        <ShieldCheck className="size-5" />
                    </div>
                    <h3 className="text-[13px] font-bold text-slate-900">
                        Tips Keamanan
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-[12.5px] text-slate-600">
                        <li>• Gunakan minimal 8 karakter</li>
                        <li>• Kombinasikan huruf besar, kecil, angka</li>
                        <li>• Hindari nama, tanggal lahir, atau kata umum</li>
                        <li>• Jangan pakai password yang sama dengan email/sosmed</li>
                        <li>• Ganti password berkala minimal 6 bulan sekali</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:p-6">
            <h2 className="mb-4 text-[14px] font-bold text-slate-900">{title}</h2>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

function Field({
    label,
    error,
    hint,
    children,
}: {
    label: string;
    error?: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <label className="block text-[13px] font-semibold text-slate-700">{label}</label>
            {children}
            {hint && !error && <p className="text-[11.5px] text-slate-500">{hint}</p>}
            <FieldError message={error} />
        </div>
    );
}

function SocialField({
    label,
    icon,
    value,
    onChange,
}: {
    label: string;
    icon: React.ReactNode;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="space-y-1.5">
            <label className="block text-[12px] font-semibold text-slate-700">{label}</label>
            <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
                    {icon}
                </span>
                <Input
                    type="url"
                    placeholder="https://"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="pl-9"
                />
            </div>
        </div>
    );
}
