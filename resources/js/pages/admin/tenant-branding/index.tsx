import { Head, useForm } from '@inertiajs/react';
import { Image as ImageIcon, Palette, Save, Sparkles, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Props = {
    tenant: {
        id: number;
        name: string;
        display_name: string | null;
        tagline: string | null;
        brand_primary_color: string | null;
        logo_url: string | null;
    };
};

const PRESET_COLORS = [
    '#12237D',
    '#1E40AF',
    '#0EA5E9',
    '#059669',
    '#DC2626',
    '#EA580C',
    '#7C3AED',
    '#DB2777',
];

export default function TenantBrandingPage({ tenant }: Props) {
    const fileRef = useRef<HTMLInputElement | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(tenant.logo_url);

    const form = useForm<{
        display_name: string;
        tagline: string;
        brand_primary_color: string;
        logo: File | null;
        remove_logo: boolean;
    }>({
        display_name: tenant.display_name ?? '',
        tagline: tenant.tagline ?? '',
        brand_primary_color: tenant.brand_primary_color ?? '',
        logo: null,
        remove_logo: false,
    });

    useEffect(() => {
        if (!form.data.logo) return;
        const url = URL.createObjectURL(form.data.logo);
        setLogoPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [form.data.logo]);

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post('/admin/tenant-branding', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                form.setData('logo', null);
                form.setData('remove_logo', false);
                if (fileRef.current) fileRef.current.value = '';
            },
        });
    }

    function clearLogo() {
        form.setData('logo', null);
        form.setData('remove_logo', true);
        setLogoPreview(null);
        if (fileRef.current) fileRef.current.value = '';
    }

    const previewLabel = form.data.display_name.trim() || tenant.name;
    const previewColor = form.data.brand_primary_color || '#12237D';

    return (
        <>
            <Head title="Branding Tenant" />
            <div className="space-y-5">
                <div>
                    <h1 className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
                        <Sparkles className="size-6 text-brand-600" />
                        Branding Tenant
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Atur logo, warna brand, dan nama tampilan organisasi Anda. Akan
                        diterapkan ke sidebar, login page, dan komunikasi otomatis.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="grid gap-5 lg:grid-cols-[1fr_minmax(320px,360px)]"
                >
                    <div className="space-y-4 rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <div className="space-y-1.5">
                            <RequiredLabel>Nama Tampilan</RequiredLabel>
                            <Input
                                value={form.data.display_name}
                                onChange={(e) =>
                                    form.setData('display_name', e.target.value)
                                }
                                placeholder={tenant.name}
                            />
                            <FieldError message={form.errors.display_name} />
                            <p className="text-[11px] text-slate-500">
                                Override nama organisasi yang muncul di sidebar.
                                Default: <b>{tenant.name}</b>
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <RequiredLabel>Tagline</RequiredLabel>
                            <Input
                                value={form.data.tagline}
                                onChange={(e) => form.setData('tagline', e.target.value)}
                                placeholder="mis. Belajar Bareng Bank XYZ"
                            />
                            <FieldError message={form.errors.tagline} />
                        </div>

                        <div className="space-y-2">
                            <RequiredLabel>
                                <span className="inline-flex items-center gap-1.5">
                                    <Palette className="size-3.5" />
                                    Warna Brand Utama
                                </span>
                            </RequiredLabel>
                            <div className="flex flex-wrap items-center gap-2">
                                <input
                                    type="color"
                                    value={previewColor}
                                    onChange={(e) =>
                                        form.setData(
                                            'brand_primary_color',
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    className="h-10 w-14 cursor-pointer rounded-lg border border-slate-200"
                                />
                                <Input
                                    className="flex-1 max-w-[160px] font-mono"
                                    value={form.data.brand_primary_color}
                                    onChange={(e) =>
                                        form.setData(
                                            'brand_primary_color',
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    placeholder="#12237D"
                                />
                                {form.data.brand_primary_color && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            form.setData('brand_primary_color', '')
                                        }
                                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-700"
                                    >
                                        Reset ke default platform
                                    </button>
                                )}
                            </div>
                            <FieldError message={form.errors.brand_primary_color} />
                            <div className="flex flex-wrap gap-1.5">
                                {PRESET_COLORS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() =>
                                            form.setData('brand_primary_color', c)
                                        }
                                        className="size-6 rounded-md ring-1 ring-slate-300 hover:scale-110 transition"
                                        style={{ backgroundColor: c }}
                                        title={c}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <RequiredLabel>
                                <span className="inline-flex items-center gap-1.5">
                                    <ImageIcon className="size-3.5" />
                                    Logo
                                </span>
                            </RequiredLabel>
                            <div className="flex items-center gap-3">
                                <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
                                    {logoPreview ? (
                                        <img
                                            src={logoPreview}
                                            alt="Preview logo"
                                            className="size-16 object-cover"
                                        />
                                    ) : (
                                        <ImageIcon className="size-6 text-slate-400" />
                                    )}
                                </div>
                                <div className="flex-1 space-y-1.5">
                                    <Input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                        onChange={(e) =>
                                            form.setData(
                                                'logo',
                                                e.target.files?.[0] ?? null,
                                            )
                                        }
                                    />
                                    <p className="text-[11px] text-slate-500">
                                        PNG/JPG/SVG/WEBP, maks 1MB. Disarankan
                                        square 256×256 atau lebih.
                                    </p>
                                </div>
                                {logoPreview && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={clearLogo}
                                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                    >
                                        <X className="mr-1 size-3.5" />
                                        Hapus
                                    </Button>
                                )}
                            </div>
                            <FieldError message={form.errors.logo} />
                        </div>

                        <div className="flex items-center justify-end pt-2">
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-xl bg-brand-600 hover:bg-brand-700"
                            >
                                {form.processing ? (
                                    <>
                                        <Upload className="mr-1.5 size-4 animate-spin" />
                                        Menyimpan…
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-1.5 size-4" />
                                        Simpan Branding
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    <aside className="space-y-3 rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <h2 className="text-[14px] font-bold text-slate-900">Preview</h2>
                        <p className="text-[11.5px] text-slate-500">
                            Pratinjau bagaimana tenant Anda muncul di sidebar.
                        </p>

                        <div
                            className="rounded-xl p-3 ring-1"
                            style={{
                                background: `linear-gradient(to bottom right, ${previewColor}10, ${previewColor}20)`,
                                borderColor: `${previewColor}40`,
                                boxShadow: `inset 0 0 0 1px ${previewColor}30`,
                            }}
                        >
                            <div className="flex items-center gap-2.5">
                                <div
                                    className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-white text-[12px] font-bold ring-1"
                                    style={{
                                        color: previewColor,
                                        borderColor: `${previewColor}40`,
                                    }}
                                >
                                    {logoPreview ? (
                                        <img
                                            src={logoPreview}
                                            alt={previewLabel}
                                            className="size-10 object-cover"
                                        />
                                    ) : (
                                        previewLabel
                                            .split(' ')
                                            .slice(0, 2)
                                            .map((s) => s[0])
                                            .join('')
                                            .toUpperCase()
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div
                                        className="text-[9.5px] font-bold tracking-[0.14em] uppercase"
                                        style={{ color: previewColor }}
                                    >
                                        Tenant
                                    </div>
                                    <div className="truncate text-[12.5px] font-bold text-slate-900">
                                        {previewLabel}
                                    </div>
                                    {form.data.tagline && (
                                        <div className="truncate text-[10.5px] text-slate-500">
                                            {form.data.tagline}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 pt-1">
                            <div className="text-[11.5px] font-semibold text-slate-700">
                                Contoh tombol
                            </div>
                            <button
                                type="button"
                                className="w-full rounded-xl px-4 py-2 text-[13px] font-bold text-white shadow"
                                style={{ backgroundColor: previewColor }}
                            >
                                Tombol Aksi
                            </button>
                        </div>
                    </aside>
                </form>
            </div>
        </>
    );
}
