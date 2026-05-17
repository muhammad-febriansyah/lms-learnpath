import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ExternalLink,
    ImagePlus,
    Layers3,
    Save,
    Sparkles,
    Upload,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
    title: string;
    subtitle: string;
    body_text: string;
    show_qr: boolean;
    show_signature: boolean;
    sort_order: string;
    background: File | null;
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

const presetInlineBackgrounds: Record<string, string> = {
    'classic-blue':
        'radial-gradient(circle at top left, rgba(219,234,254,0.92), rgba(255,255,255,0.98) 36%), linear-gradient(135deg, #eff6ff 0%, #dbeafe 35%, #ffffff 100%)',
    'premium-gold':
        'radial-gradient(circle at top left, rgba(254,240,138,0.7), rgba(255,255,255,0.96) 38%), linear-gradient(135deg, #fff7ed 0%, #fef3c7 35%, #ffffff 100%)',
    'modern-aurora':
        'radial-gradient(circle at top left, rgba(216,180,254,0.55), transparent 30%), radial-gradient(circle at bottom right, rgba(125,211,252,0.5), transparent 28%), linear-gradient(135deg, #f8fafc 0%, #eef2ff 42%, #ffffff 100%)',
    'corporate-slate':
        'radial-gradient(circle at top right, rgba(30,64,175,0.18), transparent 30%), linear-gradient(135deg, #e2e8f0 0%, #f8fafc 40%, #ffffff 100%)',
};

export default function CertificateTemplateForm({
    backgroundPresets,
}: Props) {
    const [backgroundPreviewUrl, setBackgroundPreviewUrl] = useState<string | null>(null);

    const form = useForm<TemplateFormData>({
        name: '',
        scope: 'course',
        orientation: 'landscape',
        status: 'draft',
        background_type: 'preset',
        background_preset: backgroundPresets[0]?.key ?? 'classic-blue',
        title: 'Sertifikat Penyelesaian',
        subtitle: '',
        body_text: '',
        show_qr: true,
        show_signature: true,
        sort_order: '0',
        background: null,
    });

    useEffect(() => {
        if (!form.data.background) {
            setBackgroundPreviewUrl(null);

            return undefined;
        }

        const objectUrl = URL.createObjectURL(form.data.background);
        setBackgroundPreviewUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [form.data.background]);

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            sort_order: Number(data.sort_order || 0),
        }));

        form.submit(admin.certificates.templates.store(), {
            preserveScroll: true,
        });
    }

    const selectedPresetClass =
        presetClasses[form.data.background_preset] ?? presetClasses['classic-blue'];

    const previewInlineStyle =
        form.data.background_type === 'upload' && backgroundPreviewUrl
            ? {
                  backgroundImage: `linear-gradient(135deg,rgba(255,255,255,0.76),rgba(248,250,252,0.84)), url(${backgroundPreviewUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
              }
            : undefined;

    function escapeHtml(value: string): string {
        return value
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }

    function readFileAsDataUrl(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result);
                } else {
                    reject(new Error('Failed to read preview image.'));
                }
            };

            reader.onerror = () => {
                reject(reader.error ?? new Error('Failed to read preview image.'));
            };

            reader.readAsDataURL(file);
        });
    }

    async function openPreviewInNewTab() {
        const backgroundStyle =
            form.data.background_type === 'upload' && form.data.background
                ? `linear-gradient(135deg, rgba(255,255,255,0.76), rgba(248,250,252,0.84)), url('${await readFileAsDataUrl(form.data.background)}')`
                : (presetInlineBackgrounds[form.data.background_preset] ??
                    presetInlineBackgrounds['classic-blue']);

        const subtitle = escapeHtml(form.data.subtitle || 'Subjudul');
        const title = escapeHtml(form.data.title || 'Judul Sertifikat');
        const scope = escapeHtml(form.data.scope.replace('_', ' '));
        const bodyText = escapeHtml(
            form.data.body_text || 'Deskripsi template sertifikat akan tampil di area ini.',
        );
        const metaBadges = [
            form.data.show_qr ? '<span>QR</span>' : '',
            form.data.show_signature ? '<span>SIGNATURE</span>' : '',
        ]
            .filter(Boolean)
            .join('');
        const canvasAspect =
            form.data.orientation === 'portrait'
                ? 'width: 820px; max-width: 58vw;'
                : 'width: min(1180px, 86vw);';
        const ratioPadding = form.data.orientation === 'portrait' ? '141.4%' : '70.72%';
        const html = `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Preview Template Sertifikat</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: Inter, ui-sans-serif, system-ui, sans-serif;
      background:
        radial-gradient(circle at top left, rgba(59,130,246,0.10), transparent 22%),
        radial-gradient(circle at bottom right, rgba(236,72,153,0.10), transparent 24%),
        #f8fafc;
      color: #0f172a;
      display: grid;
      place-items: center;
      padding: 40px 24px;
    }
    .shell {
      width: min(1360px, 100%);
      display: grid;
      gap: 28px;
      justify-items: center;
    }
    .toolbar {
      width: min(1360px, 100%);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 14px 18px;
      border: 1px solid rgba(226,232,240,0.9);
      border-radius: 18px;
      background: rgba(255,255,255,0.82);
      backdrop-filter: blur(12px);
      box-shadow: 0 18px 50px rgba(15,23,42,0.08);
    }
    .toolbar strong { font-size: 14px; }
    .toolbar span { color: #64748b; font-size: 13px; }
    .toolbar button {
      border: 0;
      border-radius: 12px;
      padding: 10px 16px;
      background: #1d4ed8;
      color: white;
      font-weight: 700;
      cursor: pointer;
    }
    .canvas-wrap {
      ${canvasAspect}
    }
    .canvas-ratio {
      position: relative;
      width: 100%;
      padding-top: ${ratioPadding};
    }
    .canvas {
      position: absolute;
      inset: 0;
      overflow: hidden;
      border-radius: 30px;
      padding: 26px;
      background-image: ${backgroundStyle};
      background-size: cover;
      background-position: center;
      box-shadow: 0 28px 90px rgba(15,23,42,0.22);
    }
    .canvas::before {
      content: "";
      position: absolute;
      inset: 24px;
      border-radius: 24px;
      border: 1px solid rgba(255,255,255,0.75);
      pointer-events: none;
    }
    .inner {
      position: relative;
      z-index: 1;
      height: 100%;
      border-radius: 22px;
      border: 1px solid rgba(255,255,255,0.78);
      background: linear-gradient(180deg, rgba(255,255,255,0.72), rgba(255,255,255,0.56));
      backdrop-filter: blur(3px);
      display: flex;
      flex-direction: column;
      padding: 34px 40px;
      text-align: center;
    }
    .eyebrow {
      letter-spacing: .35em;
      text-transform: uppercase;
      font-size: 11px;
      font-weight: 800;
      color: #4f46e5;
    }
    .subtitle {
      margin-top: 42px;
      font-size: 18px;
      color: #64748b;
    }
    .title {
      margin-top: 16px;
      font-size: clamp(32px, 3.4vw, 58px);
      line-height: 1.05;
      font-weight: 900;
      color: #0f172a;
    }
    .scope {
      margin-top: 18px;
      font-size: 17px;
      font-weight: 700;
      color: #334155;
      text-transform: capitalize;
    }
    .body {
      margin: 26px auto 0;
      max-width: 720px;
      font-size: 15px;
      line-height: 1.8;
      color: #475569;
    }
    .meta {
      margin-top: auto;
      display: inline-flex;
      align-self: center;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .meta span {
      border-radius: 999px;
      border: 1px solid rgba(99,102,241,0.18);
      background: rgba(255,255,255,0.86);
      padding: 9px 14px;
      font-size: 11px;
      letter-spacing: .24em;
      font-weight: 800;
      color: #4f46e5;
    }
    @media print {
      body { background: white; padding: 0; }
      .toolbar { display: none; }
      .shell { width: 100%; }
      .canvas-wrap { width: 100%; max-width: none; }
      .canvas { box-shadow: none; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="shell">
    <div class="toolbar">
      <div>
        <strong>${escapeHtml(form.data.name || 'Preview Template Sertifikat')}</strong><br />
        <span>Preview live dari data form saat ini. Bisa langsung dicetak atau dicek di tab baru.</span>
      </div>
      <button onclick="window.print()">Cetak Preview</button>
    </div>
    <div class="canvas-wrap">
      <div class="canvas-ratio">
        <div class="canvas">
          <div class="inner">
            <div class="eyebrow">Preview Template</div>
            <div class="subtitle">${subtitle}</div>
            <div class="title">${title}</div>
            <div class="scope">${scope}</div>
            <div class="body">${bodyText}</div>
            <div class="meta">${metaBadges || '<span>TEMPLATE</span>'}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

        const previewBlob = new Blob([html], { type: 'text/html' });
        const previewUrl = URL.createObjectURL(previewBlob);
        const previewWindow = window.open(previewUrl, '_blank');

        if (!previewWindow) {
            URL.revokeObjectURL(previewUrl);

            return;
        }

        window.setTimeout(() => {
            URL.revokeObjectURL(previewUrl);
        }, 60_000);
    }

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
                        Gunakan preset modern bawaan sistem atau upload background
                        sendiri untuk kebutuhan yang lebih custom.
                    </p>
                </div>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
                    <form
                        onSubmit={submit}
                        className="space-y-5 rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:p-6"
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2 md:col-span-2">
                                <RequiredLabel htmlFor="name" required>
                                    Nama Template
                                </RequiredLabel>
                                <Input
                                    id="name"
                                    placeholder="Contoh: Sertifikat Banking Batch 01"
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                />
                                <FieldError message={form.errors.name} />
                            </div>

                            <div className="space-y-2">
                                <RequiredLabel htmlFor="scope" required>
                                    Scope
                                </RequiredLabel>
                                <Select
                                    value={form.data.scope}
                                    onValueChange={(value) => form.setData('scope', value)}
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
                                    onValueChange={(value) =>
                                        form.setData('orientation', value)
                                    }
                                >
                                    <SelectTrigger id="orientation">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="landscape">Landscape</SelectItem>
                                        <SelectItem value="portrait">Portrait</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FieldError message={form.errors.orientation} />
                            </div>

                            <div className="space-y-2">
                                <RequiredLabel htmlFor="status" required>
                                    Status
                                </RequiredLabel>
                                <Select
                                    value={form.data.status}
                                    onValueChange={(value) => form.setData('status', value)}
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
                                <FieldError message={form.errors.status} />
                            </div>

                            <div className="space-y-2">
                                <RequiredLabel htmlFor="sort_order">Urutan</RequiredLabel>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    min={0}
                                    value={form.data.sort_order}
                                    onChange={(event) =>
                                        form.setData('sort_order', event.target.value)
                                    }
                                />
                                <FieldError message={form.errors.sort_order} />
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
                                            : 'border-slate-200 bg-white hover:border-slate-300',
                                    )}
                                >
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <Layers3 className="size-4 text-brand-600" />
                                        Preset dari Sistem
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Pilih background bawaan platform yang lebih cepat dan konsisten.
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => form.setData('background_type', 'upload')}
                                    className={cn(
                                        'rounded-2xl border px-4 py-4 text-left transition',
                                        form.data.background_type === 'upload'
                                            ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100'
                                            : 'border-slate-200 bg-white hover:border-slate-300',
                                    )}
                                >
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <Upload className="size-4 text-brand-600" />
                                        Upload Image Sendiri
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Pakai desain custom untuk kebutuhan corporate, event, atau batch khusus.
                                    </p>
                                </button>
                            </div>
                            <FieldError message={form.errors.background_type} />
                        </div>

                        {form.data.background_type === 'preset' ? (
                            <div className="space-y-3">
                                <RequiredLabel required>Pilih Preset Background</RequiredLabel>
                                <div className="grid gap-3 md:grid-cols-2">
                                    {backgroundPresets.map((preset) => (
                                        <button
                                            key={preset.key}
                                            type="button"
                                            onClick={() =>
                                                form.setData('background_preset', preset.key)
                                            }
                                            className={cn(
                                                'rounded-2xl border p-3 text-left transition',
                                                form.data.background_preset === preset.key
                                                    ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100'
                                                    : 'border-slate-200 bg-white hover:border-slate-300',
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'aspect-[1.414/1] rounded-xl border border-white/70 shadow-sm',
                                                    presetClasses[preset.key] ?? presetClasses['classic-blue'],
                                                )}
                                            />
                                            <div className="mt-3 font-semibold text-slate-900">
                                                {preset.label}
                                            </div>
                                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                                {preset.description}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                                <FieldError message={form.errors.background_preset} />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <RequiredLabel htmlFor="background">Upload Background</RequiredLabel>
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
                                    <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                                        <ImagePlus className="size-4" />
                                        Upload JPG, PNG, atau WEBP maksimal 4MB
                                    </div>
                                    <Input
                                        id="background"
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.webp"
                                        onChange={(event) =>
                                            form.setData(
                                                'background',
                                                event.target.files?.[0] ?? null,
                                            )
                                        }
                                    />
                                </div>
                                <FieldError message={form.errors.background} />
                            </div>
                        )}

                        <div className="space-y-2">
                            <RequiredLabel htmlFor="title" required>
                                Judul Sertifikat
                            </RequiredLabel>
                            <Input
                                id="title"
                                value={form.data.title}
                                onChange={(event) => form.setData('title', event.target.value)}
                            />
                            <FieldError message={form.errors.title} />
                        </div>

                        <div className="space-y-2">
                            <RequiredLabel htmlFor="subtitle">Subjudul</RequiredLabel>
                            <Input
                                id="subtitle"
                                placeholder="Teks pengantar di bawah judul"
                                value={form.data.subtitle}
                                onChange={(event) =>
                                    form.setData('subtitle', event.target.value)
                                }
                            />
                            <FieldError message={form.errors.subtitle} />
                        </div>

                        <div className="space-y-2">
                            <RequiredLabel htmlFor="body_text">Deskripsi</RequiredLabel>
                            <Textarea
                                id="body_text"
                                rows={5}
                                placeholder="Jelaskan kapan template ini dipakai."
                                value={form.data.body_text}
                                onChange={(event) =>
                                    form.setData('body_text', event.target.value)
                                }
                            />
                            <FieldError message={form.errors.body_text} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                                <div>
                                    <div className="text-[13.5px] font-semibold text-slate-900">
                                        Tampilkan QR
                                    </div>
                                    <div className="text-[12px] text-slate-500">
                                        Untuk verifikasi publik
                                    </div>
                                </div>
                                <Switch
                                    checked={form.data.show_qr}
                                    onCheckedChange={(checked) =>
                                        form.setData('show_qr', checked)
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                                <div>
                                    <div className="text-[13.5px] font-semibold text-slate-900">
                                        Tampilkan Tanda Tangan
                                    </div>
                                    <div className="text-[12px] text-slate-500">
                                        Untuk approval instruktur
                                    </div>
                                </div>
                                <Switch
                                    checked={form.data.show_signature}
                                    onCheckedChange={(checked) =>
                                        form.setData('show_signature', checked)
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <Button asChild type="button" variant="outline" className="rounded-xl">
                                <Link href={admin.certificates.index().url}>
                                    <ArrowLeft className="mr-1.5 size-4" />
                                    Kembali
                                </Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-xl bg-brand-600 hover:bg-brand-700"
                            >
                                <Save className="mr-1.5 size-4" />
                                {form.processing ? 'Menyimpan...' : 'Simpan Template'}
                            </Button>
                        </div>
                    </form>

                    <aside className="space-y-4">
                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
                            <div className="flex items-center gap-3">
                                <div className="grid size-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                                    <Sparkles className="size-5" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-900">Hybrid Background</h2>
                                    <p className="text-sm text-slate-500">
                                        Kamu bisa pakai preset modern dari sistem atau upload image custom sendiri.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
                                    Live Preview
                                </h2>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl"
                                    onClick={openPreviewInNewTab}
                                >
                                    <ExternalLink className="mr-1.5 size-3.5" />
                                    Preview Tab Baru
                                </Button>
                            </div>
                            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
                                <div
                                    className={cn(
                                        'rounded-xl p-4 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.7)]',
                                        form.data.background_type === 'preset'
                                            ? selectedPresetClass
                                            : 'bg-slate-100',
                                        form.data.orientation === 'portrait'
                                            ? 'mx-auto aspect-[1/1.414] max-w-[210px]'
                                            : 'aspect-[1.414/1]',
                                    )}
                                    style={previewInlineStyle}
                                >
                                    <div className="flex h-full flex-col rounded-lg border border-white/70 bg-white/55 px-4 py-3 text-center backdrop-blur-[1px]">
                                        <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-indigo-500">
                                            Preview
                                        </span>
                                        <div className="flex flex-1 flex-col items-center justify-center">
                                            <p className="text-[10px] text-slate-500">
                                                {form.data.subtitle || 'Subjudul'}
                                            </p>
                                            <p className="mt-2 text-sm font-black text-slate-900">
                                                {form.data.title || 'Judul Sertifikat'}
                                            </p>
                                            <p className="mt-2 text-[10px] text-slate-600">
                                                {form.data.scope.replace('_', ' ')}
                                            </p>
                                            <div className="mt-4 flex gap-2 text-[8px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                {form.data.show_qr && <span>QR</span>}
                                                {form.data.show_signature && <span>Signature</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
}
