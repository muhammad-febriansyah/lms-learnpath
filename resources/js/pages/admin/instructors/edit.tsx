import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    BadgeCheck,
    Download,
    FileText,
    ImageIcon,
    Plus,
    Save,
    Upload,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import { IconChevR } from '@/components/learnpath-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

type InstructorCv = {
    original_name: string | null;
    uploaded_at: string | null;
    download_url: string;
};

type InstructorProfile = {
    headline: string | null;
    bio: string | null;
    expertise: string[] | null;
    photo_path: string | null;
    social_links: Record<string, string> | null;
    website: string | null;
    is_verified: boolean;
    is_active: boolean;
    cv: InstructorCv | null;
};

type Instructor = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    profile: InstructorProfile;
};

type Props = {
    instructor: Instructor;
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

function photoUrl(path: string | null | undefined): string | undefined {
    if (!path) {
        return undefined;
    }

    if (path.startsWith('http')) {
        return path;
    }

    return `/storage/${path}`;
}

export default function InstructorEdit({ instructor }: Props) {
    const profile = instructor.profile;
    const [photoPreview, setPhotoPreview] = useState<string | undefined>(
        photoUrl(profile.photo_path),
    );
    const [expertiseInput, setExpertiseInput] = useState('');
    const photoInputRef = useRef<HTMLInputElement | null>(null);
    const cvInputRef = useRef<HTMLInputElement | null>(null);

    const form = useForm<{
        headline: string;
        bio: string;
        expertise: string[];
        website: string;
        social_links: {
            linkedin: string;
            instagram: string;
            youtube: string;
            twitter: string;
        };
        photo: File | null;
        cv: File | null;
        is_verified: boolean;
        is_active: boolean;
        _method: string;
    }>({
        headline: profile.headline ?? '',
        bio: profile.bio ?? '',
        expertise: profile.expertise ?? [],
        website: profile.website ?? '',
        social_links: {
            linkedin: profile.social_links?.linkedin ?? '',
            instagram: profile.social_links?.instagram ?? '',
            youtube: profile.social_links?.youtube ?? '',
            twitter: profile.social_links?.twitter ?? '',
        },
        photo: null,
        cv: null,
        is_verified: profile.is_verified,
        is_active: profile.is_active,
        _method: 'put',
    });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post(`/admin/instructors/${instructor.id}`, {
            forceFormData: true,
            preserveScroll: true,
        });
    }

    function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        form.setData('photo', file);
        const reader = new FileReader();
        reader.onload = () => setPhotoPreview(reader.result as string);
        reader.readAsDataURL(file);
    }

    function handleCvChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] ?? null;
        form.setData('cv', file);
    }

    function cvUploadedLabel(iso: string | null): string {
        if (!iso) return '';
        try {
            return new Date(iso).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return '';
        }
    }

    function addExpertise() {
        const value = expertiseInput.trim();

        if (!value) {
            return;
        }

        if (form.data.expertise.includes(value)) {
            setExpertiseInput('');

            return;
        }

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

    return (
        <>
            <Head title={`Edit ${instructor.name}`} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link
                            href="/admin/dashboard"
                            className="hover:text-slate-700"
                        >
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <Link
                            href="/admin/instructors"
                            className="hover:text-slate-700"
                        >
                            Instruktur
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            {instructor.name}
                        </span>
                    </nav>
                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                            Edit Profil Instruktur
                        </h1>
                        <Button
                            asChild
                            variant="outline"
                            className="rounded-xl"
                        >
                            <Link href="/admin/instructors">
                                <ArrowLeft className="mr-1.5 size-4" />
                                Kembali
                            </Link>
                        </Button>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <h2 className="mb-4 text-[15px] font-bold text-slate-900">
                            Identitas
                        </h2>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                            <div className="flex flex-col items-center gap-3">
                                <Avatar className="size-24 ring-2 ring-slate-100">
                                    {photoPreview && (
                                        <AvatarImage
                                            src={photoPreview}
                                            alt={instructor.name}
                                        />
                                    )}
                                    <AvatarFallback className="bg-brand-50 text-2xl font-bold text-brand-700">
                                        {initials(instructor.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <input
                                    ref={photoInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        photoInputRef.current?.click()
                                    }
                                    className="rounded-xl text-[12px]"
                                >
                                    <ImageIcon className="mr-1.5 size-3.5" />
                                    Ganti Foto
                                </Button>
                                <FieldError message={form.errors.photo} />
                            </div>
                            <div className="flex-1 space-y-3 text-[13px]">
                                <div>
                                    <span className="text-slate-500">Nama</span>
                                    <div className="font-semibold text-slate-900">
                                        {instructor.name}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-slate-500">
                                        Email
                                    </span>
                                    <div className="font-medium text-slate-900">
                                        {instructor.email}
                                    </div>
                                </div>
                                {instructor.phone && (
                                    <div>
                                        <span className="text-slate-500">
                                            Telepon
                                        </span>
                                        <div className="font-medium text-slate-900">
                                            {instructor.phone}
                                        </div>
                                    </div>
                                )}
                                <p className="text-[11.5px] text-slate-500">
                                    Data dasar dikelola di menu Users. Halaman
                                    ini hanya untuk profil publik.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <h2 className="mb-4 text-[15px] font-bold text-slate-900">
                            Profil Publik
                        </h2>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <RequiredLabel htmlFor="headline">
                                    Headline
                                </RequiredLabel>
                                <Input
                                    id="headline"
                                    value={form.data.headline}
                                    onChange={(e) =>
                                        form.setData('headline', e.target.value)
                                    }
                                    placeholder="Senior Data Engineer · Mentor di Qubisa"
                                    maxLength={200}
                                />
                                <FieldError message={form.errors.headline} />
                            </div>

                            <div className="space-y-1.5">
                                <RequiredLabel htmlFor="bio">Bio</RequiredLabel>
                                <Textarea
                                    id="bio"
                                    value={form.data.bio}
                                    onChange={(e) =>
                                        form.setData('bio', e.target.value)
                                    }
                                    placeholder="Ceritakan pengalaman, pencapaian, dan filosofi mengajar..."
                                    rows={6}
                                    maxLength={5000}
                                />
                                <div className="flex justify-between">
                                    <FieldError message={form.errors.bio} />
                                    <span className="text-[11px] text-slate-400">
                                        {form.data.bio.length}/5000
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <RequiredLabel>Expertise</RequiredLabel>
                                <div className="flex flex-wrap gap-1.5">
                                    {form.data.expertise.map((tag) => (
                                        <Badge
                                            key={tag}
                                            className="inline-flex items-center gap-1 border-transparent bg-violet-50 px-2 py-1 text-[11.5px] font-semibold text-violet-700"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeExpertise(tag)
                                                }
                                                className="rounded-full p-0.5 hover:bg-violet-100"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        value={expertiseInput}
                                        onChange={(e) =>
                                            setExpertiseInput(e.target.value)
                                        }
                                        onKeyDown={onExpertiseKeyDown}
                                        placeholder="Misal: Data Science, Excel, Machine Learning"
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addExpertise}
                                        className="rounded-xl"
                                    >
                                        <Plus className="mr-1 size-4" />
                                        Tambah
                                    </Button>
                                </div>
                                <p className="text-[11px] text-slate-500">
                                    Tekan Enter untuk menambah tag.
                                </p>
                                <FieldError message={form.errors.expertise} />
                            </div>

                            <div className="space-y-1.5">
                                <RequiredLabel htmlFor="website">
                                    Website
                                </RequiredLabel>
                                <Input
                                    id="website"
                                    type="url"
                                    value={form.data.website}
                                    onChange={(e) =>
                                        form.setData('website', e.target.value)
                                    }
                                    placeholder="https://example.com"
                                />
                                <FieldError message={form.errors.website} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <h2 className="mb-4 text-[15px] font-bold text-slate-900">
                            Sosial Media
                        </h2>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {(
                                [
                                    'linkedin',
                                    'instagram',
                                    'youtube',
                                    'twitter',
                                ] as const
                            ).map((key) => (
                                <div key={key} className="space-y-1.5">
                                    <RequiredLabel htmlFor={`social-${key}`}>
                                        {key.charAt(0).toUpperCase() +
                                            key.slice(1)}
                                    </RequiredLabel>
                                    <Input
                                        id={`social-${key}`}
                                        value={form.data.social_links[key]}
                                        onChange={(e) =>
                                            form.setData('social_links', {
                                                ...form.data.social_links,
                                                [key]: e.target.value,
                                            })
                                        }
                                        placeholder={`username atau URL ${key}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <h2 className="mb-1 text-[15px] font-bold text-slate-900">CV / Resume</h2>
                        <p className="mb-4 text-[12px] text-slate-500">
                            File CV hanya dapat diakses oleh admin (private storage).
                        </p>

                        <input
                            ref={cvInputRef}
                            type="file"
                            accept="application/pdf"
                            onChange={handleCvChange}
                            className="hidden"
                        />

                        {profile.cv && !form.data.cv ? (
                            <div className="flex flex-col gap-3 rounded-xl bg-slate-50/60 p-4 sm:flex-row sm:items-center">
                                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600">
                                    <FileText className="size-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-[13.5px] font-semibold text-slate-900">
                                        {profile.cv.original_name ?? 'cv.pdf'}
                                    </div>
                                    <div className="text-[11.5px] text-slate-500">
                                        Diunggah {cvUploadedLabel(profile.cv.uploaded_at)}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button asChild variant="outline" size="sm" className="rounded-xl">
                                        <a
                                            href={profile.cv.download_url}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <Download className="mr-1 size-3.5" />
                                            Unduh
                                        </a>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl"
                                        onClick={() => cvInputRef.current?.click()}
                                    >
                                        <Upload className="mr-1 size-3.5" />
                                        Ganti
                                    </Button>
                                </div>
                            </div>
                        ) : (
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
                                        <span className="text-slate-500">
                                            {profile.cv ? 'Pilih file CV baru (PDF)' : 'Unggah CV (PDF)'}
                                        </span>
                                    )}
                                </span>
                                {form.data.cv && (
                                    <span className="text-[11.5px] font-medium text-emerald-700">
                                        {(form.data.cv.size / 1024 / 1024).toFixed(2)} MB
                                    </span>
                                )}
                            </button>
                        )}
                        <FieldError message={form.errors.cv} />
                    </div>

                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <h2 className="mb-4 text-[15px] font-bold text-slate-900">
                            Status
                        </h2>
                        <div className="space-y-4">
                            <ToggleRow
                                title="Verified"
                                description="Tampilkan badge centang biru di profil publik."
                                icon={
                                    <BadgeCheck className="size-4 text-sky-500" />
                                }
                                checked={form.data.is_verified}
                                onChange={(v) => form.setData('is_verified', v)}
                            />
                            <ToggleRow
                                title="Aktif"
                                description="Profil bisa tampil sebagai instruktur kursus di marketplace."
                                checked={form.data.is_active}
                                onChange={(v) => form.setData('is_active', v)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <Button
                            asChild
                            variant="outline"
                            className="rounded-xl"
                        >
                            <Link href="/admin/instructors">Batal</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-xl"
                        >
                            <Save className="mr-1.5 size-4" />
                            {form.processing
                                ? 'Menyimpan...'
                                : 'Simpan Perubahan'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

function ToggleRow({
    title,
    description,
    icon,
    checked,
    onChange,
}: {
    title: string;
    description: string;
    icon?: React.ReactNode;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50/60 p-3">
            <div className="flex items-start gap-2.5">
                {icon}
                <div>
                    <div className="text-[13px] font-semibold text-slate-900">
                        {title}
                    </div>
                    <p className="text-[11.5px] text-slate-500">
                        {description}
                    </p>
                </div>
            </div>
            <Switch checked={checked} onCheckedChange={onChange} />
        </div>
    );
}
