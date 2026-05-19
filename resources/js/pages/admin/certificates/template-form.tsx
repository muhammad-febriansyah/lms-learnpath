import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Award,
    Check,
    ExternalLink,
    Image as ImageIcon,
    ImagePlus,
    Layers3,
    Palette,
    PenLine,
    Save,
    Sparkles,
    Type,
    Upload,
    UserCheck,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import { IconChevR } from '@/components/learnpath-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import admin from '@/routes/admin';

type TemplateFormData = {
    name: string;
    scope: string;
    orientation: string;
    status: string;
    background_type: string;
    background_preset: string;
    primary_color: string;
    accent_color: string;
    font_family: string;
    issuer_name: string;
    signatory_name: string;
    signatory_title: string;
    title: string;
    subtitle: string;
    body_text: string;
    show_qr: boolean;
    show_signature: boolean;
    sort_order: string;
    background: File | null;
    issuer_logo: File | null;
    signature_image: File | null;
};

type BackgroundPreset = {
    key: string;
    label: string;
    description: string;
};

type Props = {
    template: null;
    backgroundPresets: BackgroundPreset[];
};

type StepDef = {
    id: number;
    title: string;
    description: string;
    icon: typeof Sparkles;
};

const STEPS: StepDef[] = [
    {
        id: 1,
        title: 'Info Dasar',
        description: 'Nama, cakupan, orientasi, status.',
        icon: Layers3,
    },
    {
        id: 2,
        title: 'Konten',
        description: 'Judul, deskripsi, dan token dinamis.',
        icon: PenLine,
    },
    {
        id: 3,
        title: 'Branding',
        description: 'Warna, font, dan background.',
        icon: Palette,
    },
    {
        id: 4,
        title: 'Penerbit & Tanda Tangan',
        description: 'Issuer, signatory, dan upload aset.',
        icon: UserCheck,
    },
    {
        id: 5,
        title: 'Tinjau',
        description: 'Periksa preview sebelum simpan.',
        icon: Check,
    },
];

const PLACEHOLDER_TOKENS: Array<{ token: string; label: string }> = [
    { token: '{recipient_name}', label: 'Nama Peserta' },
    { token: '{course_title}', label: 'Judul Course' },
    { token: '{issue_date}', label: 'Tanggal Terbit' },
    { token: '{certificate_number}', label: 'Nomor Sertifikat' },
    { token: '{instructor_name}', label: 'Nama Instruktur' },
];

const FONT_OPTIONS: Array<{ value: string; label: string; sample: string; family: string }> = [
    { value: 'sans', label: 'Sans Serif (modern)', sample: 'Aa', family: '"Inter", system-ui, sans-serif' },
    { value: 'serif', label: 'Serif (formal)', sample: 'Aa', family: '"Playfair Display", "Times New Roman", serif' },
    { value: 'display', label: 'Display (premium)', sample: 'Aa', family: '"Cormorant Garamond", "Times New Roman", serif' },
    { value: 'mono', label: 'Mono (technical)', sample: 'Aa', family: '"JetBrains Mono", ui-monospace, monospace' },
];

const presetClasses: Record<string, string> = {
    'classic-blue':
        'bg-[radial-gradient(circle_at_top_left,rgba(219,234,254,0.92),rgba(255,255,255,0.98)_36%),linear-gradient(135deg,#eff6ff_0%,#dbeafe_35%,#ffffff_100%)]',
    'premium-gold':
        'bg-[radial-gradient(circle_at_top_left,rgba(254,240,138,0.7),rgba(255,255,255,0.96)_38%),linear-gradient(135deg,#fff7ed_0%,#fef3c7_35%,#ffffff_100%)]',
    'modern-aurora':
        'bg-[radial-gradient(circle_at_top_left,rgba(216,180,254,0.55),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(125,211,252,0.5),transparent_28%),linear-gradient(135deg,#f8fafc_0%,#eef2ff_42%,#ffffff_100%)]',
    'corporate-slate':
        'bg-[radial-gradient(circle_at_top_right,rgba(30,64,175,0.18),transparent_30%),linear-gradient(135deg,#e2e8f0_0%,#f8fafc_40%,#ffffff_100%)]',
};

const COLOR_PRESETS = [
    { name: 'Royal Blue', primary: '#1d4ed8', accent: '#f59e0b' },
    { name: 'Emerald', primary: '#047857', accent: '#fbbf24' },
    { name: 'Plum', primary: '#7e22ce', accent: '#f472b6' },
    { name: 'Charcoal', primary: '#0f172a', accent: '#facc15' },
    { name: 'Crimson', primary: '#b91c1c', accent: '#fde047' },
    { name: 'Ocean', primary: '#0e7490', accent: '#fb923c' },
];

function substituteTokens(text: string): string {
    return text
        .replace(/\{recipient_name\}/g, 'Andi Pratama')
        .replace(/\{course_title\}/g, 'Digital Marketing Fundamentals')
        .replace(/\{issue_date\}/g, '17 Mei 2026')
        .replace(/\{certificate_number\}/g, 'LP-2026-00123')
        .replace(/\{instructor_name\}/g, 'Budi Santoso');
}

export default function CertificateTemplateForm({
    backgroundPresets,
}: Props) {
    const [currentStep, setCurrentStep] = useState(1);
    const [backgroundPreviewUrl, setBackgroundPreviewUrl] = useState<string | null>(null);
    const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
    const [signaturePreviewUrl, setSignaturePreviewUrl] = useState<string | null>(null);

    const form = useForm<TemplateFormData>({
        name: '',
        scope: 'course',
        orientation: 'landscape',
        status: 'draft',
        background_type: 'preset',
        background_preset: backgroundPresets[0]?.key ?? 'classic-blue',
        primary_color: '#1d4ed8',
        accent_color: '#f59e0b',
        font_family: 'sans',
        issuer_name: '',
        signatory_name: '',
        signatory_title: '',
        title: 'Sertifikat Penyelesaian',
        subtitle: 'Diberikan dengan bangga kepada',
        body_text:
            'Telah berhasil menyelesaikan course {course_title} dan memenuhi seluruh kriteria kelulusan pada {issue_date}.',
        show_qr: true,
        show_signature: true,
        sort_order: '0',
        background: null,
        issuer_logo: null,
        signature_image: null,
    });

    useEffect(() => {
        if (!form.data.background) {
            setBackgroundPreviewUrl(null);

            return undefined;
        }

        const url = URL.createObjectURL(form.data.background);
        setBackgroundPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [form.data.background]);

    useEffect(() => {
        if (!form.data.issuer_logo) {
            setLogoPreviewUrl(null);

            return undefined;
        }

        const url = URL.createObjectURL(form.data.issuer_logo);
        setLogoPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [form.data.issuer_logo]);

    useEffect(() => {
        if (!form.data.signature_image) {
            setSignaturePreviewUrl(null);

            return undefined;
        }

        const url = URL.createObjectURL(form.data.signature_image);
        setSignaturePreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [form.data.signature_image]);

    const stepErrors = useMemo<Record<number, string[]>>(() => {
        const errs: Record<number, string[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };

        if (!form.data.name.trim()) errs[1].push('Nama template wajib diisi.');
        if (!form.data.title.trim()) errs[2].push('Judul sertifikat wajib diisi.');
        if (
            form.data.background_type === 'upload'
            && !form.data.background
        ) {
            errs[3].push('Background image wajib diupload.');
        }
        if (
            form.data.background_type === 'preset'
            && !form.data.background_preset
        ) {
            errs[3].push('Preset background wajib dipilih.');
        }
        if (!/^#[0-9a-fA-F]{6}$/.test(form.data.primary_color)) {
            errs[3].push('Warna primer harus HEX (#RRGGBB).');
        }
        if (!/^#[0-9a-fA-F]{6}$/.test(form.data.accent_color)) {
            errs[3].push('Warna aksen harus HEX (#RRGGBB).');
        }

        return errs;
    }, [form.data]);

    const totalErrors = Object.values(stepErrors).flat().length;

    const canGoToStep = (target: number): boolean => {
        if (target <= currentStep) return true;
        for (let s = currentStep; s < target; s++) {
            if ((stepErrors[s] ?? []).length > 0) return false;
        }
        return true;
    };

    const next = () => {
        if ((stepErrors[currentStep] ?? []).length > 0) return;
        setCurrentStep((s) => Math.min(STEPS.length, s + 1));
    };

    const prev = () => setCurrentStep((s) => Math.max(1, s - 1));

    const applyColorPreset = (preset: typeof COLOR_PRESETS[number]) => {
        form.setData('primary_color', preset.primary);
        form.setData('accent_color', preset.accent);
    };

    const insertToken = (field: 'title' | 'subtitle' | 'body_text', token: string) => {
        form.setData(field, `${form.data[field]}${token}`);
    };

    function submit() {
        if (totalErrors > 0) return;
        form.transform((data) => ({
            ...data,
            sort_order: Number(data.sort_order || 0),
        }));

        form.submit(admin.certificates.templates.store(), {
            forceFormData: true,
            preserveScroll: true,
        });
    }

    const selectedPresetClass =
        presetClasses[form.data.background_preset] ?? presetClasses['classic-blue'];

    const previewBgStyle =
        form.data.background_type === 'upload' && backgroundPreviewUrl
            ? {
                  backgroundImage: `linear-gradient(135deg,rgba(255,255,255,0.78),rgba(248,250,252,0.86)), url(${backgroundPreviewUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
              }
            : undefined;

    const fontFamily =
        FONT_OPTIONS.find((f) => f.value === form.data.font_family)?.family ??
        FONT_OPTIONS[0].family;

    return (
        <>
            <Head title="Buat Template Sertifikat" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href={admin.dashboard().url} className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <Link
                            href={admin.certificates.index().url}
                            className="hover:text-slate-700"
                        >
                            Sertifikat
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Buat Template</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Buat Template Sertifikat
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Ikuti 5 langkah berikut untuk menyusun template. Pakai token dinamis
                        agar nama peserta, course, dan tanggal terisi otomatis saat sertifikat
                        diterbitkan.
                    </p>
                </div>

                <Stepper
                    steps={STEPS}
                    current={currentStep}
                    onJump={(id) => canGoToStep(id) && setCurrentStep(id)}
                    errorsByStep={stepErrors}
                />

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:p-6">
                        {currentStep === 1 && (
                            <StepShell title="Info Dasar" description="Identitas template untuk memudahkan pengelolaan banyak template.">
                                <div className="space-y-2 md:col-span-2">
                                    <RequiredLabel htmlFor="name" required>
                                        Nama Template
                                    </RequiredLabel>
                                    <Input
                                        id="name"
                                        placeholder="Contoh: Sertifikat Banking Batch 01"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                    />
                                    <FieldError message={form.errors.name} />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <RequiredLabel htmlFor="scope" required>
                                            Scope
                                        </RequiredLabel>
                                        <Select
                                            value={form.data.scope}
                                            onValueChange={(v) => form.setData('scope', v)}
                                        >
                                            <SelectTrigger id="scope">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="course">Course</SelectItem>
                                                <SelectItem value="learning_path">Learning Path</SelectItem>
                                                <SelectItem value="corporate">Corporate</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FieldError message={form.errors.scope} />
                                    </div>

                                    <div className="space-y-2">
                                        <RequiredLabel htmlFor="orientation" required>
                                            Orientasi
                                        </RequiredLabel>
                                        <Select
                                            value={form.data.orientation}
                                            onValueChange={(v) => form.setData('orientation', v)}
                                        >
                                            <SelectTrigger id="orientation">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="landscape">Landscape</SelectItem>
                                                <SelectItem value="portrait">Portrait</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <RequiredLabel htmlFor="status" required>
                                            Status
                                        </RequiredLabel>
                                        <Select
                                            value={form.data.status}
                                            onValueChange={(v) => form.setData('status', v)}
                                        >
                                            <SelectTrigger id="status">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="archived">Archived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <RequiredLabel htmlFor="sort_order">Urutan</RequiredLabel>
                                        <Input
                                            id="sort_order"
                                            type="number"
                                            min={0}
                                            value={form.data.sort_order}
                                            onChange={(e) => form.setData('sort_order', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </StepShell>
                        )}

                        {currentStep === 2 && (
                            <StepShell title="Konten Sertifikat" description="Gunakan token dinamis untuk substitusi otomatis saat sertifikat terbit.">
                                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12.5px] text-amber-800">
                                    <p className="font-semibold">Token dinamis:</p>
                                    <div className="mt-1.5 flex flex-wrap gap-1">
                                        {PLACEHOLDER_TOKENS.map((t) => (
                                            <code
                                                key={t.token}
                                                className="rounded bg-white px-1.5 py-0.5 text-[11.5px] font-semibold text-amber-700 ring-1 ring-amber-200"
                                            >
                                                {t.token}
                                            </code>
                                        ))}
                                    </div>
                                    <p className="mt-1.5 text-[11.5px]">
                                        Klik tombol "+" di samping field di bawah untuk menyisipkan token.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <RequiredLabel htmlFor="title" required>
                                        Judul Sertifikat
                                    </RequiredLabel>
                                    <Input
                                        id="title"
                                        value={form.data.title}
                                        onChange={(e) => form.setData('title', e.target.value)}
                                    />
                                    <TokenButtons onInsert={(t) => insertToken('title', t)} />
                                    <FieldError message={form.errors.title} />
                                </div>

                                <div className="space-y-2">
                                    <RequiredLabel htmlFor="subtitle">Subjudul</RequiredLabel>
                                    <Input
                                        id="subtitle"
                                        placeholder="Diberikan kepada {recipient_name}"
                                        value={form.data.subtitle}
                                        onChange={(e) => form.setData('subtitle', e.target.value)}
                                    />
                                    <TokenButtons onInsert={(t) => insertToken('subtitle', t)} />
                                </div>

                                <div className="space-y-2">
                                    <RequiredLabel htmlFor="body_text">Deskripsi / Body</RequiredLabel>
                                    <Textarea
                                        id="body_text"
                                        rows={5}
                                        placeholder="Telah menyelesaikan {course_title} pada {issue_date}."
                                        value={form.data.body_text}
                                        onChange={(e) => form.setData('body_text', e.target.value)}
                                    />
                                    <TokenButtons onInsert={(t) => insertToken('body_text', t)} />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <ToggleCard
                                        label="Tampilkan QR Verifikasi"
                                        description="Generate QR code yang mengarah ke halaman verifikasi publik."
                                        checked={form.data.show_qr}
                                        onChange={(v) => form.setData('show_qr', v)}
                                    />
                                    <ToggleCard
                                        label="Tampilkan Tanda Tangan"
                                        description="Tampilkan blok signatory di bagian bawah sertifikat."
                                        checked={form.data.show_signature}
                                        onChange={(v) => form.setData('show_signature', v)}
                                    />
                                </div>
                            </StepShell>
                        )}

                        {currentStep === 3 && (
                            <StepShell title="Branding & Visual" description="Atur warna, jenis font, dan background sertifikat.">
                                <div className="space-y-3">
                                    <RequiredLabel>Color Preset</RequiredLabel>
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                                        {COLOR_PRESETS.map((p) => {
                                            const isActive =
                                                form.data.primary_color === p.primary
                                                && form.data.accent_color === p.accent;
                                            return (
                                                <button
                                                    key={p.name}
                                                    type="button"
                                                    onClick={() => applyColorPreset(p)}
                                                    className={cn(
                                                        'rounded-xl border px-2 py-2 text-left transition',
                                                        isActive
                                                            ? 'border-brand-500 ring-2 ring-brand-100'
                                                            : 'border-slate-200 hover:border-slate-300',
                                                    )}
                                                >
                                                    <div className="flex gap-1">
                                                        <span
                                                            className="h-6 flex-1 rounded"
                                                            style={{ background: p.primary }}
                                                        />
                                                        <span
                                                            className="h-6 w-3 rounded"
                                                            style={{ background: p.accent }}
                                                        />
                                                    </div>
                                                    <div className="mt-1.5 text-[11px] font-semibold text-slate-700">
                                                        {p.name}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <ColorField
                                        label="Warna Primer"
                                        value={form.data.primary_color}
                                        onChange={(v) => form.setData('primary_color', v)}
                                        error={form.errors.primary_color}
                                    />
                                    <ColorField
                                        label="Warna Aksen"
                                        value={form.data.accent_color}
                                        onChange={(v) => form.setData('accent_color', v)}
                                        error={form.errors.accent_color}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <RequiredLabel required>
                                        <Type className="mr-1 inline size-3.5" />
                                        Jenis Font
                                    </RequiredLabel>
                                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                        {FONT_OPTIONS.map((font) => {
                                            const isActive = form.data.font_family === font.value;
                                            return (
                                                <button
                                                    key={font.value}
                                                    type="button"
                                                    onClick={() => form.setData('font_family', font.value)}
                                                    className={cn(
                                                        'rounded-xl border p-3 text-left transition',
                                                        isActive
                                                            ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100'
                                                            : 'border-slate-200 hover:border-slate-300',
                                                    )}
                                                >
                                                    <div
                                                        className="text-3xl font-bold text-slate-900"
                                                        style={{ fontFamily: font.family }}
                                                    >
                                                        {font.sample}
                                                    </div>
                                                    <div className="mt-1 text-[12px] font-semibold text-slate-700">
                                                        {font.label}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <RequiredLabel required>Jenis Background</RequiredLabel>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <button
                                            type="button"
                                            onClick={() => form.setData('background_type', 'preset')}
                                            className={cn(
                                                'rounded-2xl border px-4 py-4 text-left transition',
                                                form.data.background_type === 'preset'
                                                    ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100'
                                                    : 'border-slate-200 hover:border-slate-300',
                                            )}
                                        >
                                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                                <Layers3 className="size-4 text-brand-600" />
                                                Preset Sistem
                                            </div>
                                            <p className="mt-2 text-[12.5px] leading-5 text-slate-500">
                                                Background siap pakai, lebih cepat dan konsisten.
                                            </p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => form.setData('background_type', 'upload')}
                                            className={cn(
                                                'rounded-2xl border px-4 py-4 text-left transition',
                                                form.data.background_type === 'upload'
                                                    ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100'
                                                    : 'border-slate-200 hover:border-slate-300',
                                            )}
                                        >
                                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                                <Upload className="size-4 text-brand-600" />
                                                Upload Custom
                                            </div>
                                            <p className="mt-2 text-[12.5px] leading-5 text-slate-500">
                                                Pakai desain kustom dari brand kit.
                                            </p>
                                        </button>
                                    </div>
                                </div>

                                {form.data.background_type === 'preset' ? (
                                    <div className="space-y-3">
                                        <RequiredLabel required>Preset Background</RequiredLabel>
                                        <div className="grid gap-3 md:grid-cols-2">
                                            {backgroundPresets.map((p) => (
                                                <button
                                                    key={p.key}
                                                    type="button"
                                                    onClick={() => form.setData('background_preset', p.key)}
                                                    className={cn(
                                                        'rounded-2xl border p-3 text-left transition',
                                                        form.data.background_preset === p.key
                                                            ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100'
                                                            : 'border-slate-200 hover:border-slate-300',
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            'aspect-[1.414/1] rounded-xl border border-white/70 shadow-sm',
                                                            presetClasses[p.key] ?? presetClasses['classic-blue'],
                                                        )}
                                                    />
                                                    <div className="mt-3 font-semibold text-slate-900">
                                                        {p.label}
                                                    </div>
                                                    <p className="mt-1 text-[12px] leading-5 text-slate-500">
                                                        {p.description}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <FileDropField
                                        label="Upload Background"
                                        hint="JPG / PNG / WEBP, rasio 16:9, maks 4MB"
                                        accept=".jpg,.jpeg,.png,.webp"
                                        previewUrl={backgroundPreviewUrl}
                                        onChange={(f) => form.setData('background', f)}
                                        error={form.errors.background}
                                    />
                                )}
                            </StepShell>
                        )}

                        {currentStep === 4 && (
                            <StepShell title="Penerbit & Tanda Tangan" description="Identitas organisasi penerbit dan blok tanda tangan.">
                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                                    <h3 className="text-[13px] font-semibold text-slate-800">
                                        Penerbit (Issuer)
                                    </h3>
                                    <div className="space-y-2">
                                        <RequiredLabel htmlFor="issuer_name">
                                            Nama Penerbit
                                        </RequiredLabel>
                                        <Input
                                            id="issuer_name"
                                            placeholder="LearnPath Academy"
                                            value={form.data.issuer_name}
                                            onChange={(e) => form.setData('issuer_name', e.target.value)}
                                        />
                                    </div>
                                    <FileDropField
                                        label="Logo Penerbit"
                                        hint="JPG / PNG / WEBP / SVG, maks 2MB"
                                        accept=".jpg,.jpeg,.png,.webp,.svg"
                                        previewUrl={logoPreviewUrl}
                                        onChange={(f) => form.setData('issuer_logo', f)}
                                        error={form.errors.issuer_logo}
                                        compact
                                    />
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                                    <h3 className="text-[13px] font-semibold text-slate-800">
                                        Tanda Tangan (Signatory)
                                    </h3>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <RequiredLabel htmlFor="signatory_name">
                                                Nama Penandatangan
                                            </RequiredLabel>
                                            <Input
                                                id="signatory_name"
                                                placeholder="Dr. Andi Wijaya"
                                                value={form.data.signatory_name}
                                                onChange={(e) =>
                                                    form.setData('signatory_name', e.target.value)
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <RequiredLabel htmlFor="signatory_title">
                                                Jabatan
                                            </RequiredLabel>
                                            <Input
                                                id="signatory_title"
                                                placeholder="Direktur Akademik"
                                                value={form.data.signatory_title}
                                                onChange={(e) =>
                                                    form.setData('signatory_title', e.target.value)
                                                }
                                            />
                                        </div>
                                    </div>
                                    <FileDropField
                                        label="Gambar Tanda Tangan"
                                        hint="PNG transparan disarankan, maks 2MB"
                                        accept=".jpg,.jpeg,.png,.webp"
                                        previewUrl={signaturePreviewUrl}
                                        onChange={(f) => form.setData('signature_image', f)}
                                        error={form.errors.signature_image}
                                        compact
                                    />
                                </div>
                            </StepShell>
                        )}

                        {currentStep === 5 && (
                            <StepShell title="Tinjau & Simpan" description="Periksa ringkasan template sebelum disimpan.">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <SummaryItem label="Nama" value={form.data.name || '—'} />
                                    <SummaryItem label="Scope" value={form.data.scope} />
                                    <SummaryItem label="Orientasi" value={form.data.orientation} />
                                    <SummaryItem label="Status" value={form.data.status} />
                                    <SummaryItem label="Font" value={form.data.font_family} />
                                    <SummaryItem
                                        label="Background"
                                        value={
                                            form.data.background_type === 'preset'
                                                ? `Preset: ${form.data.background_preset}`
                                                : 'Upload custom'
                                        }
                                    />
                                    <SummaryItem
                                        label="Penerbit"
                                        value={form.data.issuer_name || '—'}
                                    />
                                    <SummaryItem
                                        label="Penandatangan"
                                        value={
                                            form.data.signatory_name
                                                ? `${form.data.signatory_name}${form.data.signatory_title ? ` · ${form.data.signatory_title}` : ''}`
                                                : '—'
                                        }
                                    />
                                </div>

                                {totalErrors > 0 && (
                                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-[13px] text-amber-800">
                                        <p className="font-semibold">
                                            Masih ada {totalErrors} hal yang perlu dilengkapi:
                                        </p>
                                        <ul className="mt-2 list-inside list-disc space-y-0.5">
                                            {Object.entries(stepErrors).map(([s, list]) =>
                                                list.map((msg, i) => (
                                                    <li key={`${s}-${i}`}>
                                                        <button
                                                            type="button"
                                                            onClick={() => setCurrentStep(Number(s))}
                                                            className="underline hover:text-amber-900"
                                                        >
                                                            Langkah {s}: {msg}
                                                        </button>
                                                    </li>
                                                )),
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </StepShell>
                        )}

                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <Button
                                    asChild
                                    type="button"
                                    variant="ghost"
                                    className="rounded-xl"
                                >
                                    <Link href={admin.certificates.index().url}>
                                        <ArrowLeft className="mr-1.5 size-4" />
                                        Batal
                                    </Link>
                                </Button>
                                {currentStep > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={prev}
                                        className="rounded-xl"
                                    >
                                        <ArrowLeft className="mr-1.5 size-4" />
                                        Sebelumnya
                                    </Button>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {currentStep < STEPS.length && (
                                    <Button
                                        type="button"
                                        onClick={next}
                                        disabled={(stepErrors[currentStep] ?? []).length > 0}
                                        className="rounded-xl bg-brand-600 hover:bg-brand-700"
                                    >
                                        Lanjut
                                        <ArrowRight className="ml-1.5 size-4" />
                                    </Button>
                                )}
                                {currentStep === STEPS.length && (
                                    <Button
                                        type="button"
                                        onClick={submit}
                                        disabled={form.processing || totalErrors > 0}
                                        className="rounded-xl bg-brand-600 hover:bg-brand-700"
                                    >
                                        <Save className="mr-1.5 size-4" />
                                        {form.processing ? 'Menyimpan...' : 'Simpan Template'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-4">
                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                    Live Preview
                                </h2>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700">
                                    <Sparkles className="size-3" />
                                    Sample data
                                </span>
                            </div>
                            <div
                                className={cn(
                                    'mt-4 overflow-hidden rounded-2xl border border-slate-200 p-3 shadow-inner',
                                    form.data.background_type === 'preset'
                                        ? selectedPresetClass
                                        : 'bg-slate-100',
                                    form.data.orientation === 'portrait'
                                        ? 'mx-auto aspect-[1/1.414] max-w-[260px]'
                                        : 'aspect-[1.414/1]',
                                )}
                                style={previewBgStyle}
                            >
                                <div
                                    className="flex h-full flex-col rounded-xl border bg-white/55 p-3 text-center backdrop-blur-[1px]"
                                    style={{
                                        borderColor: `${form.data.accent_color}40`,
                                        fontFamily,
                                    }}
                                >
                                    {logoPreviewUrl && (
                                        <img
                                            src={logoPreviewUrl}
                                            alt="Logo"
                                            className="mx-auto mb-1 h-6 w-auto object-contain"
                                        />
                                    )}
                                    <span
                                        className="text-[8px] font-bold uppercase tracking-[0.32em]"
                                        style={{ color: form.data.primary_color }}
                                    >
                                        {form.data.issuer_name || 'Issuer Name'}
                                    </span>
                                    <div className="flex flex-1 flex-col items-center justify-center">
                                        <p className="text-[9px] text-slate-500">
                                            {substituteTokens(form.data.subtitle) || 'Subjudul'}
                                        </p>
                                        <p
                                            className="mt-1.5 text-sm leading-tight font-black"
                                            style={{ color: form.data.primary_color }}
                                        >
                                            {substituteTokens(form.data.title) || 'Judul Sertifikat'}
                                        </p>
                                        <p className="mt-1.5 text-[9px] leading-snug text-slate-600 line-clamp-3 px-1">
                                            {substituteTokens(form.data.body_text) || 'Body text...'}
                                        </p>
                                    </div>
                                    {form.data.show_signature && (
                                        <div className="mt-1.5 border-t pt-1.5 text-center" style={{ borderColor: `${form.data.accent_color}40` }}>
                                            {signaturePreviewUrl && (
                                                <img
                                                    src={signaturePreviewUrl}
                                                    alt="Signature"
                                                    className="mx-auto h-5 w-auto object-contain"
                                                />
                                            )}
                                            <p className="text-[8px] font-bold text-slate-700">
                                                {form.data.signatory_name || 'Signatory Name'}
                                            </p>
                                            <p className="text-[7px] text-slate-500">
                                                {form.data.signatory_title || 'Jabatan'}
                                            </p>
                                        </div>
                                    )}
                                    <div className="mt-1 flex justify-center gap-1 text-[7px] font-semibold uppercase">
                                        {form.data.show_qr && (
                                            <span
                                                className="rounded px-1.5 py-0.5"
                                                style={{
                                                    background: `${form.data.accent_color}30`,
                                                    color: form.data.primary_color,
                                                }}
                                            >
                                                QR
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <p className="mt-3 text-[11px] text-slate-500">
                                Preview menggunakan data contoh. Token akan disubstitusi otomatis
                                saat sertifikat diterbitkan.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                            <div className="flex items-start gap-2.5">
                                <Award className="mt-0.5 size-4 text-brand-600" />
                                <div className="text-[12.5px] leading-5 text-slate-600">
                                    Setelah template tersimpan, kamu bisa pakai di kursus / learning
                                    path lewat halaman edit konten masing-masing.
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
}

function StepShell({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="mb-5">
                <h2 className="text-[15px] font-bold text-slate-900">{title}</h2>
                {description && (
                    <p className="mt-0.5 text-[12.5px] text-slate-500">{description}</p>
                )}
            </div>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

function Stepper({
    steps,
    current,
    onJump,
    errorsByStep,
}: {
    steps: StepDef[];
    current: number;
    onJump: (id: number) => void;
    errorsByStep: Record<number, string[]>;
}) {
    return (
        <ol
            className="grid gap-2 rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70"
            style={{
                gridTemplateColumns: `repeat(${Math.min(steps.length, 5)}, minmax(0, 1fr))`,
            }}
        >
            {steps.map((s) => {
                const Icon = s.icon;
                const isActive = s.id === current;
                const isDone = s.id < current && (errorsByStep[s.id] ?? []).length === 0;
                const hasError = (errorsByStep[s.id] ?? []).length > 0 && s.id < current;
                return (
                    <li key={s.id}>
                        <button
                            type="button"
                            onClick={() => onJump(s.id)}
                            className={cn(
                                'flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition',
                                isActive
                                    ? 'bg-brand-50 ring-1 ring-brand-200'
                                    : 'hover:bg-slate-50',
                            )}
                        >
                            <span
                                className={cn(
                                    'grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-bold',
                                    isActive
                                        ? 'bg-brand-600 text-white'
                                        : isDone
                                            ? 'bg-emerald-500 text-white'
                                            : hasError
                                                ? 'bg-amber-500 text-white'
                                                : 'bg-slate-100 text-slate-500',
                                )}
                            >
                                {isDone ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
                            </span>
                            <span className="min-w-0">
                                <span
                                    className={cn(
                                        'block truncate text-[12.5px] font-semibold',
                                        isActive ? 'text-brand-700' : 'text-slate-900',
                                    )}
                                >
                                    {s.title}
                                </span>
                                <span className="block truncate text-[11px] text-slate-500">
                                    {s.description}
                                </span>
                            </span>
                        </button>
                    </li>
                );
            })}
        </ol>
    );
}

function TokenButtons({ onInsert }: { onInsert: (token: string) => void }) {
    return (
        <div className="flex flex-wrap gap-1">
            {PLACEHOLDER_TOKENS.map((t) => (
                <button
                    key={t.token}
                    type="button"
                    onClick={() => onInsert(t.token)}
                    className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10.5px] font-semibold text-amber-800 ring-1 ring-amber-200 transition hover:bg-amber-200"
                    title={`Sisipkan ${t.token}`}
                >
                    + {t.label}
                </button>
            ))}
        </div>
    );
}

function ColorField({
    label,
    value,
    onChange,
    error,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
}) {
    return (
        <div className="space-y-2">
            <RequiredLabel required>{label}</RequiredLabel>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white"
                />
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#1d4ed8"
                    className="flex-1 font-mono"
                />
            </div>
            <FieldError message={error} />
        </div>
    );
}

function ToggleCard({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
            <div className="pr-4">
                <div className="text-[13.5px] font-semibold text-slate-900">{label}</div>
                <div className="text-[12px] text-slate-500">{description}</div>
            </div>
            <Switch checked={checked} onCheckedChange={onChange} />
        </div>
    );
}

function FileDropField({
    label,
    hint,
    accept,
    previewUrl,
    onChange,
    error,
    compact,
}: {
    label: string;
    hint: string;
    accept: string;
    previewUrl: string | null;
    onChange: (f: File | null) => void;
    error?: string;
    compact?: boolean;
}) {
    return (
        <div className="space-y-2">
            <RequiredLabel>{label}</RequiredLabel>
            {previewUrl ? (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className={cn(
                            'rounded-lg object-cover ring-1 ring-slate-200',
                            compact ? 'h-12 w-12' : 'h-20 w-32',
                        )}
                    />
                    <div className="flex-1 text-[12.5px] text-slate-600">
                        <div className="font-semibold text-slate-900">Preview siap</div>
                        <div className="text-slate-500">Klik di bawah untuk ganti file.</div>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50"
                        onClick={() => onChange(null)}
                    >
                        Hapus
                    </Button>
                </div>
            ) : null}
            <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center text-slate-600 transition hover:border-brand-300 hover:bg-brand-50/30">
                {previewUrl ? (
                    <ImagePlus className="size-4 text-slate-400" />
                ) : (
                    <ImageIcon className="size-5 text-slate-400" />
                )}
                <span className="text-[12.5px] font-semibold text-slate-700">
                    {previewUrl ? 'Ganti file' : 'Klik untuk upload'}
                </span>
                <span className="text-[11px] text-slate-500">{hint}</span>
                <input
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={(e) => onChange(e.target.files?.[0] ?? null)}
                />
            </label>
            <FieldError message={error} />
        </div>
    );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
            <div className="text-[11.5px] font-medium text-slate-500">{label}</div>
            <div className="mt-0.5 truncate text-[13px] font-semibold text-slate-900">
                {value}
            </div>
        </div>
    );
}
