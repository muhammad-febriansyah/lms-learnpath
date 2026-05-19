import { Head, Link, useForm } from '@inertiajs/react';
import {
    CreditCard,
    FileText,
    Globe,
    Image as ImageIcon,
    Megaphone,
    Palette,
    Save,
    Scale,
    Settings,
    ToggleRight,
    Upload,
    Wallet,
    X,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { FieldError } from '@/components/form/field-error';
import { RupiahInput } from '@/components/form/rupiah-input';
import { RequiredLabel } from '@/components/form/required-label';
import { IconChevR } from '@/components/learnpath-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import admin from '@/routes/admin';

type SettingItem = {
    key: string;
    value: string | boolean | null;
    type: string;
    label: string;
    description: string | null;
    is_public: boolean;
};

type SettingGroup = {
    group: string;
    items: SettingItem[];
};

type Props = {
    groups: SettingGroup[];
};

const GROUP_META: Record<
    string,
    { label: string; description: string; icon: typeof Settings; tint: string; text: string }
> = {
    general: {
        label: 'Umum',
        description: 'Identitas website, kontak, dan info dasar.',
        icon: Globe,
        tint: 'bg-brand-50',
        text: 'text-brand-600',
    },
    seo: {
        label: 'SEO',
        description: 'Meta tag, analytics, dan tracking pixel.',
        icon: FileText,
        tint: 'bg-brand-50',
        text: 'text-brand-600',
    },
    social: {
        label: 'Sosial Media',
        description: 'Tautan akun sosial media perusahaan.',
        icon: Megaphone,
        tint: 'bg-rose-50',
        text: 'text-rose-600',
    },
    branding: {
        label: 'Branding',
        description: 'Warna brand untuk konsistensi visual.',
        icon: Palette,
        tint: 'bg-amber-50',
        text: 'text-amber-600',
    },
    payment: {
        label: 'Pembayaran',
        description: 'Mata uang, PPN, fee, dan masa berlaku order.',
        icon: CreditCard,
        tint: 'bg-emerald-50',
        text: 'text-emerald-600',
    },
    payout: {
        label: 'Payout',
        description: 'Bagi hasil instruktur, fee tarik, dan batas minimum.',
        icon: Wallet,
        tint: 'bg-teal-50',
        text: 'text-teal-600',
    },
    legal: {
        label: 'Legal',
        description: 'Syarat & ketentuan, privasi, perusahaan.',
        icon: Scale,
        tint: 'bg-slate-100',
        text: 'text-slate-600',
    },
    feature: {
        label: 'Feature Flags',
        description: 'Aktifkan / nonaktifkan modul tertentu.',
        icon: ToggleRight,
        tint: 'bg-sky-50',
        text: 'text-sky-600',
    },
};

const GROUP_ORDER = ['general', 'seo', 'social', 'payment', 'payout', 'legal', 'feature'];
const HIDDEN_GROUPS = ['branding', 'feature'];

export default function SettingsIndex({ groups }: Props) {
    const orderedGroups = useMemo(
        () =>
            groups
                .filter((g) => !HIDDEN_GROUPS.includes(g.group))
                .sort((a, b) => {
                    const ai = GROUP_ORDER.indexOf(a.group);
                    const bi = GROUP_ORDER.indexOf(b.group);

                    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
                }),
        [groups],
    );

    const [activeTab, setActiveTab] = useState<string>(
        orderedGroups[0]?.group ?? 'general',
    );

    return (
        <>
            <Head title="Pengaturan" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Pengaturan</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Pengaturan
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Atur identitas website, SEO, sosial media, dan konfigurasi lain.
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="rounded-2xl bg-card p-2 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto bg-transparent p-0">
                            {orderedGroups.map((g) => {
                                const meta = GROUP_META[g.group] ?? {
                                    label: g.group,
                                    icon: Settings,
                                    tint: 'bg-slate-100',
                                    text: 'text-slate-600',
                                    description: '',
                                };
                                const Icon = meta.icon;

                                return (
                                    <TabsTrigger
                                        key={g.group}
                                        value={g.group}
                                        className={cn(
                                            'shrink-0 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition',
                                            'data-[state=active]:bg-brand-600 data-[state=active]:text-white data-[state=active]:shadow-sm',
                                            'data-[state=inactive]:text-slate-600 hover:data-[state=inactive]:bg-slate-50',
                                        )}
                                    >
                                        <Icon className="mr-1.5 size-4" />
                                        {meta.label}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </div>

                    {orderedGroups.map((g) => (
                        <TabsContent key={g.group} value={g.group} className="mt-5">
                            <SettingGroupForm group={g} />
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </>
    );
}

function SettingGroupForm({ group }: { group: SettingGroup }) {
    const meta = GROUP_META[group.group] ?? {
        label: group.group,
        description: '',
        icon: Settings,
        tint: 'bg-slate-100',
        text: 'text-slate-600',
    };
    const Icon = meta.icon;

    type FormShape = {
        group: string;
        values: Record<string, string | boolean | null>;
        files: Record<string, File>;
    };

    const initialValues = useMemo(() => {
        const obj: Record<string, string | boolean | null> = {};

        for (const item of group.items) {
            obj[item.key] = item.value;
        }

        return obj;
    }, [group.items]);

    const form = useForm<FormShape>({
        group: group.group,
        values: initialValues,
        files: {},
    });

    const setValue = (key: string, value: string | boolean | null) => {
        form.setData('values', { ...form.data.values, [key]: value });
    };

    const setFile = (key: string, file: File | null) => {
        const nextFiles = { ...form.data.files };

        if (file) {
            nextFiles[key] = file;
        } else {
            delete nextFiles[key];
        }

        form.setData('files', nextFiles);
    };

    function submit(event: React.FormEvent) {
        event.preventDefault();
        const hasFiles = Object.keys(form.data.files).length > 0;
        form.post('/admin/settings', {
            forceFormData: hasFiles,
            preserveScroll: true,
            onSuccess: () => {
                form.setData('files', {});
            },
        });
    }

    return (
        <form
            onSubmit={submit}
            className="rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70"
        >
            <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-start gap-3">
                    <div
                        className={`grid size-10 shrink-0 place-items-center rounded-xl ${meta.tint} ${meta.text}`}
                    >
                        <Icon className="size-5" />
                    </div>
                    <div>
                        <h2 className="text-[15px] font-bold text-slate-900">{meta.label}</h2>
                        <p className="text-[12.5px] text-slate-500">{meta.description}</p>
                    </div>
                </div>
                <Badge className="border-transparent bg-slate-100 text-slate-600 sm:self-start">
                    {group.group === 'legal' ? '2 dokumen' : `${group.items.length} pengaturan`}
                </Badge>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
                {group.group === 'legal' ? (
                    <div className="grid gap-4 lg:grid-cols-2">
                        <Link
                            href={admin.settings.legal.terms.edit().url}
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-brand-300 hover:bg-brand-50/60"
                        >
                            <div className="text-sm font-bold text-slate-900">
                                Edit Syarat & Ketentuan
                            </div>
                            <p className="mt-1 text-[12.5px] leading-6 text-slate-500">
                                Kelola judul dan isi dokumen syarat & ketentuan dengan rich editor.
                            </p>
                        </Link>

                        <Link
                            href={admin.settings.legal.privacy.edit().url}
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-brand-300 hover:bg-brand-50/60"
                        >
                            <div className="text-sm font-bold text-slate-900">
                                Edit Kebijakan Privasi
                            </div>
                            <p className="mt-1 text-[12.5px] leading-6 text-slate-500">
                                Kelola judul dan isi dokumen kebijakan privasi untuk publik.
                            </p>
                        </Link>
                    </div>
                ) : (
                    group.items.map((item) => (
                        <SettingFieldRenderer
                            key={item.key}
                            item={item}
                            value={form.data.values[item.key] ?? ''}
                            fileValue={form.data.files[item.key] ?? null}
                            error={(form.errors as Record<string, string>)[`values.${item.key}`]}
                            fileError={(form.errors as Record<string, string>)[`files.${item.key}`]}
                            onChange={(v) => setValue(item.key, v)}
                            onFileChange={(f) => setFile(item.key, f)}
                        />
                    ))
                )}
            </div>

            {group.group !== 'legal' && (
                <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/40 p-5 sm:p-6">
                    <Button
                        type="submit"
                        disabled={form.processing}
                        className="rounded-xl bg-brand-600 hover:bg-brand-700"
                    >
                        <Save className="mr-1.5 size-4" />
                        {form.processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                    </Button>
                </div>
            )}
        </form>
    );
}

function SettingFieldRenderer({
    item,
    value,
    fileValue,
    error,
    fileError,
    onChange,
    onFileChange,
}: {
    item: SettingItem;
    value: string | boolean | null;
    fileValue: File | null;
    error?: string;
    fileError?: string;
    onChange: (value: string | boolean | null) => void;
    onFileChange: (file: File | null) => void;
}) {
    const isRupiahField = item.key === 'payout_min_amount';

    if (item.type === 'boolean') {
        return (
            <div className="flex items-center justify-between rounded-xl bg-slate-50/60 p-4">
                <div className="pr-4">
                    <div className="text-[13.5px] font-semibold text-slate-900">
                        {item.label}
                    </div>
                    {item.description && (
                        <div className="text-[12px] text-slate-500">{item.description}</div>
                    )}
                </div>
                <Switch
                    checked={Boolean(value)}
                    onCheckedChange={(checked) => onChange(checked)}
                />
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <RequiredLabel>{item.label}</RequiredLabel>
            {item.type === 'textarea' && (
                <Textarea
                    rows={4}
                    placeholder={item.description ?? ''}
                    value={value === null || value === undefined ? '' : String(value)}
                    onChange={(e) => onChange(e.target.value)}
                />
            )}
            {item.type === 'email' && (
                <Input
                    type="email"
                    placeholder={item.description ?? ''}
                    value={value === null || value === undefined ? '' : String(value)}
                    onChange={(e) => onChange(e.target.value)}
                />
            )}
            {item.type === 'url' && (
                <Input
                    type="url"
                    placeholder={item.description ?? 'https://...'}
                    value={value === null || value === undefined ? '' : String(value)}
                    onChange={(e) => onChange(e.target.value)}
                />
            )}
            {item.type === 'number' && (
                isRupiahField ? (
                    <RupiahInput
                        value={value === null || value === undefined ? '' : String(value)}
                        placeholder={item.description ?? 'Contoh: Rp 50.000'}
                        onChange={(nextValue) => onChange(String(nextValue))}
                        onClear={() => onChange('')}
                    />
                ) : (
                    <Input
                        type="number"
                        placeholder={item.description ?? ''}
                        value={value === null || value === undefined ? '' : String(value)}
                        onChange={(e) => onChange(e.target.value)}
                    />
                )
            )}
            {item.type === 'color' && (
                <ColorField
                    value={value === null || value === undefined ? '' : String(value)}
                    onChange={onChange}
                />
            )}
            {item.type === 'image' && (
                <ImageField
                    currentUrl={
                        value === null || value === undefined || value === ''
                            ? null
                            : String(value)
                    }
                    file={fileValue}
                    onFileChange={onFileChange}
                    onClear={() => {
                        onChange(null);
                        onFileChange(null);
                    }}
                />
            )}
            {(item.type === 'text' ||
                ![
                    'textarea',
                    'email',
                    'url',
                    'number',
                    'color',
                    'image',
                    'boolean',
                ].includes(item.type)) && (
                <Input
                    placeholder={item.description ?? ''}
                    value={value === null || value === undefined ? '' : String(value)}
                    onChange={(e) => onChange(e.target.value)}
                />
            )}
            {item.description && !error && item.type !== 'image' && (
                <p className="text-[11.5px] text-slate-500">{item.description}</p>
            )}
            <FieldError message={error ?? fileError} />
            {item.is_public && (
                <div className="text-[10.5px] tracking-wider text-slate-400 uppercase">
                    Public · tampil di frontend
                </div>
            )}
        </div>
    );
}

function ColorField({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="flex items-center gap-2">
            <input
                type="color"
                value={value || '#000000'}
                onChange={(e) => onChange(e.target.value)}
                className="size-10 cursor-pointer rounded-lg border border-slate-200 bg-white"
            />
            <Input
                value={value}
                placeholder="#000000"
                onChange={(e) => onChange(e.target.value)}
                className="w-32 font-mono"
            />
            {value && (
                <div
                    className="flex h-10 flex-1 items-center justify-center rounded-lg text-[12px] font-semibold text-white shadow-inner"
                    style={{ backgroundColor: value }}
                >
                    {value}
                </div>
            )}
        </div>
    );
}

function ImageField({
    currentUrl,
    file,
    onFileChange,
    onClear,
}: {
    currentUrl: string | null;
    file: File | null;
    onFileChange: (f: File | null) => void;
    onClear: () => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleSelect = (f: File | null) => {
        onFileChange(f);

        if (f) {
            const url = URL.createObjectURL(f);
            setPreview(url);
        } else {
            setPreview(null);
        }
    };

    const displayUrl = preview ?? currentUrl;

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
                {displayUrl ? (
                    <img
                        src={displayUrl}
                        alt="preview"
                        className="size-full object-contain"
                    />
                ) : (
                    <ImageIcon className="size-6 text-slate-400" />
                )}
            </div>
            <div className="flex flex-1 flex-col gap-2">
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleSelect(e.target.files?.[0] ?? null)}
                />
                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => inputRef.current?.click()}
                        className="rounded-xl"
                    >
                        <Upload className="mr-1.5 size-4" />
                        {file ? 'Ganti file' : 'Pilih file'}
                    </Button>
                    {(file || currentUrl) && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                handleSelect(null);
                                onClear();

                                if (inputRef.current) {
inputRef.current.value = '';
}
                            }}
                            className="rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                        >
                            <X className="mr-1.5 size-4" />
                            Hapus
                        </Button>
                    )}
                </div>
                <p className="text-[11.5px] text-slate-500">
                    JPG, PNG, WebP, SVG, atau ICO. Maks 2 MB.
                    {file && (
                        <>
                            {' '}
                            <span className="font-medium text-slate-700">
                                {file.name}
                            </span>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}
