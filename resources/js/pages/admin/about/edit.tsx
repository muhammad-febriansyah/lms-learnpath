import { Head, Link, useForm } from '@inertiajs/react';
import {
    Building2,
    Facebook,
    Image as ImageIcon,
    Instagram,
    Linkedin,
    Mail,
    MapPin,
    Phone,
    Plus,
    Save,
    Sparkles,
    Trash2,
    Twitter,
    UserCircle2,
    Youtube,
} from 'lucide-react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import { IconChevR } from '@/components/learnpath-icons';
import { RichTextEditor } from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type ValueItem = { title: string; description: string };
type StatItem = { label: string; value: string; suffix: string };

type AboutPayload = {
    title: string | null;
    tagline: string | null;
    hero_image: string | null;
    hero_image_url: string | null;
    description: string | null;
    founded_year: number | null;
    vision: string | null;
    mission: string | null;
    values: ValueItem[] | null;
    stats: StatItem[] | null;
    founder_name: string | null;
    founder_role: string | null;
    founder_photo: string | null;
    founder_photo_url: string | null;
    founder_message: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    contact_address: string | null;
    contact_map_url: string | null;
    social_facebook: string | null;
    social_instagram: string | null;
    social_twitter: string | null;
    social_linkedin: string | null;
    social_youtube: string | null;
};

type Props = {
    about: AboutPayload;
};

export default function AboutEdit({ about }: Props) {
    const form = useForm({
        title: about.title ?? '',
        tagline: about.tagline ?? '',
        description: about.description ?? '',
        founded_year: about.founded_year ?? '',
        vision: about.vision ?? '',
        mission: about.mission ?? '',
        values: (about.values ?? []) as ValueItem[],
        stats: (about.stats ?? []) as StatItem[],
        founder_name: about.founder_name ?? '',
        founder_role: about.founder_role ?? '',
        founder_message: about.founder_message ?? '',
        contact_email: about.contact_email ?? '',
        contact_phone: about.contact_phone ?? '',
        contact_address: about.contact_address ?? '',
        contact_map_url: about.contact_map_url ?? '',
        social_facebook: about.social_facebook ?? '',
        social_instagram: about.social_instagram ?? '',
        social_twitter: about.social_twitter ?? '',
        social_linkedin: about.social_linkedin ?? '',
        social_youtube: about.social_youtube ?? '',
        hero_image: null as File | null,
        founder_photo: null as File | null,
        _method: 'PUT',
    });

    const setValueItem = (idx: number, key: keyof ValueItem, val: string) => {
        const next = [...form.data.values];
        next[idx] = { ...next[idx], [key]: val };
        form.setData('values', next);
    };

    const addValueItem = () => {
        form.setData('values', [
            ...form.data.values,
            { title: '', description: '' },
        ]);
    };

    const removeValueItem = (idx: number) => {
        form.setData(
            'values',
            form.data.values.filter((_, i) => i !== idx),
        );
    };

    const setStatItem = (idx: number, key: keyof StatItem, val: string) => {
        const next = [...form.data.stats];
        next[idx] = { ...next[idx], [key]: val };
        form.setData('stats', next);
    };

    const addStatItem = () => {
        form.setData('stats', [
            ...form.data.stats,
            { label: '', value: '', suffix: '' },
        ]);
    };

    const removeStatItem = (idx: number) => {
        form.setData(
            'stats',
            form.data.stats.filter((_, i) => i !== idx),
        );
    };

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post('/admin/about', { forceFormData: true });
    }

    return (
        <>
            <Head title="Tentang Kami" />
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
                        <span className="font-semibold text-slate-900">
                            Tentang Kami
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Halaman Tentang Kami
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Kelola informasi yang ditampilkan di halaman publik
                        "Tentang Kami".
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    {/* Hero */}
                    <SectionCard
                        icon={Sparkles}
                        title="Hero"
                        description="Tampilan utama di bagian atas halaman Tentang Kami."
                    >
                        <div className="space-y-2.5">
                            <RequiredLabel htmlFor="title">
                                Judul
                            </RequiredLabel>
                            <Input
                                id="title"
                                placeholder="Contoh: Tentang Learnpath"
                                value={form.data.title}
                                onChange={(e) =>
                                    form.setData('title', e.target.value)
                                }
                                className="h-11"
                            />
                            <FieldError message={form.errors.title} />
                        </div>

                        <div className="space-y-2.5">
                            <RequiredLabel htmlFor="tagline">
                                Tagline
                            </RequiredLabel>
                            <Input
                                id="tagline"
                                placeholder="Satu kalimat singkat yang menggambarkan platform."
                                value={form.data.tagline}
                                onChange={(e) =>
                                    form.setData('tagline', e.target.value)
                                }
                                className="h-11"
                            />
                            <FieldError message={form.errors.tagline} />
                        </div>

                        <div className="space-y-2.5">
                            <RequiredLabel htmlFor="hero_image">
                                Gambar Hero
                            </RequiredLabel>
                            {about.hero_image_url && (
                                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                                    <img
                                        src={about.hero_image_url}
                                        alt="Hero saat ini"
                                        className="h-16 w-28 rounded-lg object-cover ring-1 ring-slate-200"
                                    />
                                    <div className="text-[12px] text-slate-600">
                                        Gambar saat ini. Pilih file baru untuk
                                        menggantinya.
                                    </div>
                                </div>
                            )}
                            <Input
                                id="hero_image"
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    form.setData(
                                        'hero_image',
                                        e.target.files?.[0] ?? null,
                                    )
                                }
                                className="h-11"
                            />
                            <p className="text-[11.5px] text-slate-500">
                                Format: JPG, PNG, WEBP. Maksimal 4 MB.
                            </p>
                            <FieldError message={form.errors.hero_image} />
                        </div>
                    </SectionCard>

                    {/* Tentang */}
                    <SectionCard
                        icon={Building2}
                        title="Tentang"
                        description="Deskripsi singkat tentang perusahaan/platform."
                    >
                        <div className="space-y-2.5">
                            <RequiredLabel htmlFor="description">
                                Deskripsi
                            </RequiredLabel>
                            <RichTextEditor
                                value={form.data.description}
                                onChange={(v) => form.setData('description', v)}
                                placeholder="Ceritakan tentang platform Anda, untuk siapa, dan apa yang membuat berbeda."
                            />
                            <FieldError message={form.errors.description} />
                        </div>

                        <div className="space-y-2.5 sm:max-w-[200px]">
                            <RequiredLabel htmlFor="founded_year">
                                Tahun Berdiri
                            </RequiredLabel>
                            <Input
                                id="founded_year"
                                type="number"
                                min={1900}
                                max={2100}
                                placeholder="2024"
                                value={form.data.founded_year}
                                onChange={(e) =>
                                    form.setData(
                                        'founded_year',
                                        e.target.value,
                                    )
                                }
                                className="h-11"
                            />
                            <FieldError message={form.errors.founded_year} />
                        </div>
                    </SectionCard>

                    {/* Visi & Misi */}
                    <SectionCard
                        icon={Sparkles}
                        title="Visi & Misi"
                        description="Tujuan jangka panjang dan langkah strategis perusahaan."
                    >
                        <div className="space-y-2.5">
                            <RequiredLabel htmlFor="vision">Visi</RequiredLabel>
                            <RichTextEditor
                                value={form.data.vision}
                                onChange={(v) => form.setData('vision', v)}
                                placeholder="Menjadi platform pembelajaran terdepan…"
                            />
                            <FieldError message={form.errors.vision} />
                        </div>

                        <div className="space-y-2.5">
                            <RequiredLabel htmlFor="mission">Misi</RequiredLabel>
                            <RichTextEditor
                                value={form.data.mission}
                                onChange={(v) => form.setData('mission', v)}
                                placeholder="Tuliskan misi sebagai daftar poin atau paragraf."
                            />
                            <FieldError message={form.errors.mission} />
                        </div>
                    </SectionCard>

                    {/* Statistik */}
                    <SectionCard
                        icon={Sparkles}
                        title="Statistik"
                        description="Angka-angka yang menggambarkan pencapaian platform."
                        action={
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addStatItem}
                                className="rounded-xl"
                            >
                                <Plus className="mr-1 size-3.5" />
                                Tambah Statistik
                            </Button>
                        }
                    >
                        {form.data.stats.length === 0 ? (
                            <EmptyRow text="Belum ada statistik. Tambahkan minimal 3–4 angka kunci." />
                        ) : (
                            <div className="space-y-3">
                                {form.data.stats.map((stat, idx) => (
                                    <div
                                        key={idx}
                                        className="grid gap-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200 sm:grid-cols-[1fr_120px_120px_auto]"
                                    >
                                        <Input
                                            placeholder="Label (contoh: Siswa)"
                                            value={stat.label}
                                            onChange={(e) =>
                                                setStatItem(
                                                    idx,
                                                    'label',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-10"
                                        />
                                        <Input
                                            placeholder="Nilai (10000)"
                                            value={stat.value}
                                            onChange={(e) =>
                                                setStatItem(
                                                    idx,
                                                    'value',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-10"
                                        />
                                        <Input
                                            placeholder="Suffix (+ atau %)"
                                            value={stat.suffix}
                                            onChange={(e) =>
                                                setStatItem(
                                                    idx,
                                                    'suffix',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => removeStatItem(idx)}
                                            className="h-10 w-10 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>

                    {/* Nilai */}
                    <SectionCard
                        icon={Sparkles}
                        title="Nilai-Nilai Perusahaan"
                        description="Prinsip yang dipegang oleh tim dalam bekerja."
                        action={
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addValueItem}
                                className="rounded-xl"
                            >
                                <Plus className="mr-1 size-3.5" />
                                Tambah Nilai
                            </Button>
                        }
                    >
                        {form.data.values.length === 0 ? (
                            <EmptyRow text="Belum ada nilai. Tambahkan 3–4 prinsip inti tim Anda." />
                        ) : (
                            <div className="space-y-3">
                                {form.data.values.map((val, idx) => (
                                    <div
                                        key={idx}
                                        className="grid gap-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200 sm:grid-cols-[220px_1fr_auto]"
                                    >
                                        <Input
                                            placeholder="Judul (contoh: Integritas)"
                                            value={val.title}
                                            onChange={(e) =>
                                                setValueItem(
                                                    idx,
                                                    'title',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-10"
                                        />
                                        <Input
                                            placeholder="Deskripsi singkat"
                                            value={val.description}
                                            onChange={(e) =>
                                                setValueItem(
                                                    idx,
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => removeValueItem(idx)}
                                            className="h-10 w-10 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>

                    {/* Founder */}
                    <SectionCard
                        icon={UserCircle2}
                        title="Founder / CEO"
                        description="Pesan dari pendiri atau pimpinan perusahaan."
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2.5">
                                <RequiredLabel htmlFor="founder_name">
                                    Nama
                                </RequiredLabel>
                                <Input
                                    id="founder_name"
                                    placeholder="Nama founder/CEO"
                                    value={form.data.founder_name}
                                    onChange={(e) =>
                                        form.setData(
                                            'founder_name',
                                            e.target.value,
                                        )
                                    }
                                    className="h-11"
                                />
                                <FieldError
                                    message={form.errors.founder_name}
                                />
                            </div>

                            <div className="space-y-2.5">
                                <RequiredLabel htmlFor="founder_role">
                                    Jabatan
                                </RequiredLabel>
                                <Input
                                    id="founder_role"
                                    placeholder="Contoh: Founder & CEO"
                                    value={form.data.founder_role}
                                    onChange={(e) =>
                                        form.setData(
                                            'founder_role',
                                            e.target.value,
                                        )
                                    }
                                    className="h-11"
                                />
                                <FieldError
                                    message={form.errors.founder_role}
                                />
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <RequiredLabel htmlFor="founder_photo">
                                Foto
                            </RequiredLabel>
                            {about.founder_photo_url && (
                                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                                    <img
                                        src={about.founder_photo_url}
                                        alt="Foto founder saat ini"
                                        className="size-14 rounded-full object-cover ring-1 ring-slate-200"
                                    />
                                    <div className="text-[12px] text-slate-600">
                                        Foto saat ini. Pilih file baru untuk
                                        menggantinya.
                                    </div>
                                </div>
                            )}
                            <Input
                                id="founder_photo"
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    form.setData(
                                        'founder_photo',
                                        e.target.files?.[0] ?? null,
                                    )
                                }
                                className="h-11"
                            />
                            <p className="text-[11.5px] text-slate-500">
                                Format: JPG, PNG, WEBP. Maksimal 2 MB.
                            </p>
                            <FieldError message={form.errors.founder_photo} />
                        </div>

                        <div className="space-y-2.5">
                            <RequiredLabel htmlFor="founder_message">
                                Pesan
                            </RequiredLabel>
                            <RichTextEditor
                                value={form.data.founder_message}
                                onChange={(v) =>
                                    form.setData('founder_message', v)
                                }
                                placeholder="Pesan singkat dari founder kepada pengguna."
                            />
                            <FieldError
                                message={form.errors.founder_message}
                            />
                        </div>
                    </SectionCard>

                    {/* Kontak */}
                    <SectionCard
                        icon={Mail}
                        title="Kontak"
                        description="Informasi cara menghubungi tim."
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2.5">
                                <RequiredLabel htmlFor="contact_email">
                                    Email
                                </RequiredLabel>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="contact_email"
                                        type="email"
                                        placeholder="hello@learnpath.id"
                                        value={form.data.contact_email}
                                        onChange={(e) =>
                                            form.setData(
                                                'contact_email',
                                                e.target.value,
                                            )
                                        }
                                        className="h-11 pl-9"
                                    />
                                </div>
                                <FieldError
                                    message={form.errors.contact_email}
                                />
                            </div>

                            <div className="space-y-2.5">
                                <RequiredLabel htmlFor="contact_phone">
                                    Telepon
                                </RequiredLabel>
                                <div className="relative">
                                    <Phone className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="contact_phone"
                                        placeholder="+62 21 1234 5678"
                                        value={form.data.contact_phone}
                                        onChange={(e) =>
                                            form.setData(
                                                'contact_phone',
                                                e.target.value,
                                            )
                                        }
                                        className="h-11 pl-9"
                                    />
                                </div>
                                <FieldError
                                    message={form.errors.contact_phone}
                                />
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <RequiredLabel htmlFor="contact_address">
                                Alamat
                            </RequiredLabel>
                            <div className="relative">
                                <MapPin className="pointer-events-none absolute top-3 left-3 size-4 text-slate-400" />
                                <Textarea
                                    id="contact_address"
                                    rows={3}
                                    placeholder="Alamat kantor / studio."
                                    value={form.data.contact_address}
                                    onChange={(e) =>
                                        form.setData(
                                            'contact_address',
                                            e.target.value,
                                        )
                                    }
                                    className="pl-9"
                                />
                            </div>
                            <FieldError
                                message={form.errors.contact_address}
                            />
                        </div>

                        <div className="space-y-2.5">
                            <RequiredLabel htmlFor="contact_map_url">
                                URL Peta (opsional)
                            </RequiredLabel>
                            <Input
                                id="contact_map_url"
                                placeholder="https://goo.gl/maps/…"
                                value={form.data.contact_map_url}
                                onChange={(e) =>
                                    form.setData(
                                        'contact_map_url',
                                        e.target.value,
                                    )
                                }
                                className="h-11"
                            />
                            <FieldError
                                message={form.errors.contact_map_url}
                            />
                        </div>
                    </SectionCard>

                    {/* Sosial Media */}
                    <SectionCard
                        icon={Instagram}
                        title="Sosial Media"
                        description="Link akun resmi (kosongkan kalau tidak ada)."
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
                            <SocialField
                                id="social_facebook"
                                label="Facebook"
                                Icon={Facebook}
                                placeholder="https://facebook.com/learnpath"
                                value={form.data.social_facebook}
                                onChange={(v) =>
                                    form.setData('social_facebook', v)
                                }
                                error={form.errors.social_facebook}
                            />
                            <SocialField
                                id="social_instagram"
                                label="Instagram"
                                Icon={Instagram}
                                placeholder="https://instagram.com/learnpath"
                                value={form.data.social_instagram}
                                onChange={(v) =>
                                    form.setData('social_instagram', v)
                                }
                                error={form.errors.social_instagram}
                            />
                            <SocialField
                                id="social_twitter"
                                label="Twitter / X"
                                Icon={Twitter}
                                placeholder="https://x.com/learnpath"
                                value={form.data.social_twitter}
                                onChange={(v) =>
                                    form.setData('social_twitter', v)
                                }
                                error={form.errors.social_twitter}
                            />
                            <SocialField
                                id="social_linkedin"
                                label="LinkedIn"
                                Icon={Linkedin}
                                placeholder="https://linkedin.com/company/learnpath"
                                value={form.data.social_linkedin}
                                onChange={(v) =>
                                    form.setData('social_linkedin', v)
                                }
                                error={form.errors.social_linkedin}
                            />
                            <SocialField
                                id="social_youtube"
                                label="YouTube"
                                Icon={Youtube}
                                placeholder="https://youtube.com/@learnpath"
                                value={form.data.social_youtube}
                                onChange={(v) =>
                                    form.setData('social_youtube', v)
                                }
                                error={form.errors.social_youtube}
                            />
                        </div>
                    </SectionCard>

                    <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-2 rounded-2xl bg-white/85 p-4 shadow-[0_-4px_12px_-6px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 backdrop-blur sm:flex-row sm:justify-end">
                        <Button
                            asChild
                            type="button"
                            variant="outline"
                            className="rounded-xl"
                        >
                            <Link href="/admin/dashboard">Batal</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-xl bg-brand-600 hover:bg-brand-700"
                        >
                            <Save className="mr-1.5 size-4" />
                            {form.processing ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

type SectionCardProps = {
    icon: React.ComponentType<{ className?: string; size?: number }>;
    title: string;
    description?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
};

function SectionCard({
    icon: Icon,
    title,
    description,
    action,
    children,
}: SectionCardProps) {
    return (
        <section className="space-y-5 rounded-2xl bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:p-7">
            <header className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                        <Icon size={18} />
                    </span>
                    <div>
                        <h2 className="text-[15px] font-bold text-slate-900">
                            {title}
                        </h2>
                        {description && (
                            <p className="mt-0.5 text-[12.5px] text-slate-500">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
                {action}
            </header>
            <div className="space-y-5">{children}</div>
        </section>
    );
}

type SocialFieldProps = {
    id: string;
    label: string;
    Icon: React.ComponentType<{ className?: string; size?: number }>;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
};

function SocialField({
    id,
    label,
    Icon,
    placeholder,
    value,
    onChange,
    error,
}: SocialFieldProps) {
    return (
        <div className="space-y-2.5">
            <RequiredLabel htmlFor={id}>{label}</RequiredLabel>
            <div className="relative">
                <Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                    id={id}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-11 pl-9"
                />
            </div>
            <FieldError message={error} />
        </div>
    );
}

function EmptyRow({ text }: { text: string }) {
    return (
        <div className="flex items-center justify-center rounded-xl bg-slate-50 px-4 py-6 text-center text-[12.5px] text-slate-500 ring-1 ring-dashed ring-slate-200">
            <ImageIcon size={14} className="mr-2 text-slate-400" />
            {text}
        </div>
    );
}
