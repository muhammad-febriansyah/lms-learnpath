import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import { RupiahInput } from '@/components/form/rupiah-input';
import { IconChevR } from '@/components/learnpath-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type Addon = { name: string; price: number | ''; note: string | null };

type Plan = {
    id: number;
    code: string;
    name: string;
    tagline: string | null;
    min_users: number;
    max_users: number | null;
    price_per_user_per_month: number;
    currency: string;
    features: string[];
    addons: Addon[];
    is_popular: boolean;
    is_active: boolean;
    contact_sales_only: boolean;
    sort_order: number;
};

type Props = {
    plan: Plan | null;
};

export default function PlanForm({ plan }: Props) {
    const isEdit = !!plan;

    const form = useForm<{
        code: string;
        name: string;
        tagline: string;
        min_users: number | '';
        max_users: number | '';
        price_per_user_per_month: number | '';
        currency: string;
        features: string[];
        addons: Addon[];
        is_popular: boolean;
        is_active: boolean;
        contact_sales_only: boolean;
        sort_order: number | '';
    }>({
        code: plan?.code ?? '',
        name: plan?.name ?? '',
        tagline: plan?.tagline ?? '',
        min_users: plan?.min_users ?? 1,
        max_users: plan?.max_users ?? '',
        price_per_user_per_month: plan?.price_per_user_per_month ?? '',
        currency: plan?.currency ?? 'IDR',
        features: plan?.features ?? [],
        addons: plan?.addons ?? [],
        is_popular: plan?.is_popular ?? false,
        is_active: plan?.is_active ?? true,
        contact_sales_only: plan?.contact_sales_only ?? true,
        sort_order: plan?.sort_order ?? 0,
    });

    const addFeature = () => form.setData('features', [...form.data.features, '']);
    const setFeature = (idx: number, value: string) =>
        form.setData(
            'features',
            form.data.features.map((f, i) => (i === idx ? value : f)),
        );
    const removeFeature = (idx: number) =>
        form.setData('features', form.data.features.filter((_, i) => i !== idx));

    const addAddon = () =>
        form.setData('addons', [...form.data.addons, { name: '', price: 0, note: null }]);
    const setAddon = (idx: number, key: keyof Addon, value: string | number) =>
        form.setData(
            'addons',
            form.data.addons.map((a, i) => (i === idx ? { ...a, [key]: value } : a)),
        );
    const removeAddon = (idx: number) =>
        form.setData('addons', form.data.addons.filter((_, i) => i !== idx));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...form.data,
            features: form.data.features.filter(Boolean),
            addons: form.data.addons.map((addon) => ({
                ...addon,
                price: addon.price === '' ? 0 : Number(addon.price),
            })),
        };
        form.transform(() => payload);

        if (isEdit) {
            form.patch(`/admin/subscription-plans/${plan!.id}`, {
                onFinish: () => form.transform((d) => d),
            });
        } else {
            form.post('/admin/subscription-plans', {
                onFinish: () => form.transform((d) => d),
            });
        }
    };

    return (
        <>
            <Head title={isEdit ? `Edit ${plan?.name}` : 'Tambah Paket'} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link
                            href="/admin/subscription-plans"
                            className="hover:text-slate-700"
                        >
                            Paket Subscription
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            {isEdit ? 'Edit' : 'Tambah'}
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        {isEdit ? `Edit ${plan?.name}` : 'Tambah Paket Subscription'}
                    </h1>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-5 rounded-2xl bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <RequiredLabel htmlFor="code">Kode</RequiredLabel>
                            <Input
                                id="code"
                                value={form.data.code}
                                onChange={(e) =>
                                    form.setData('code', e.target.value.toLowerCase())
                                }
                                placeholder="starter"
                                className="font-mono"
                            />
                            <FieldError message={form.errors.code} />
                        </div>
                        <div>
                            <RequiredLabel htmlFor="name">Nama Paket</RequiredLabel>
                            <Input
                                id="name"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                placeholder="Starter"
                            />
                            <FieldError message={form.errors.name} />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="tagline">Tagline</Label>
                        <Input
                            id="tagline"
                            value={form.data.tagline}
                            onChange={(e) => form.setData('tagline', e.target.value)}
                            placeholder="Mulai perjalanan learning tim Anda"
                            maxLength={200}
                        />
                        <FieldError message={form.errors.tagline} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <RequiredLabel htmlFor="min_users">Min User</RequiredLabel>
                            <Input
                                id="min_users"
                                type="number"
                                min={1}
                                value={form.data.min_users}
                                onChange={(e) =>
                                    form.setData(
                                        'min_users',
                                        e.target.value === '' ? '' : Number(e.target.value),
                                    )
                                }
                            />
                            <FieldError message={form.errors.min_users} />
                        </div>
                        <div>
                            <Label htmlFor="max_users">Max User (opsional)</Label>
                            <Input
                                id="max_users"
                                type="number"
                                min={1}
                                value={form.data.max_users}
                                onChange={(e) =>
                                    form.setData(
                                        'max_users',
                                        e.target.value === '' ? '' : Number(e.target.value),
                                    )
                                }
                                placeholder="kosong = unlimited"
                            />
                            <FieldError message={form.errors.max_users} />
                        </div>
                        <div>
                            <RequiredLabel htmlFor="price_per_user_per_month">
                                Harga / user / bulan
                            </RequiredLabel>
                            <RupiahInput
                                id="price_per_user_per_month"
                                value={form.data.price_per_user_per_month}
                                onChange={(value) =>
                                    form.setData('price_per_user_per_month', value)
                                }
                                onClear={() =>
                                    form.setData('price_per_user_per_month', '')
                                }
                                placeholder="Rp 500.000 (0 = custom)"
                            />
                            <FieldError
                                message={form.errors.price_per_user_per_month}
                            />
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <Label>Fitur</Label>
                        <div className="mt-2 space-y-2">
                            {form.data.features.map((feat, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <Input
                                        value={feat}
                                        onChange={(e) => setFeature(idx, e.target.value)}
                                        placeholder="300+ Online Course"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="shrink-0"
                                        onClick={() => removeFeature(idx)}
                                    >
                                        <Trash2 className="size-3.5" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addFeature}
                            >
                                <Plus className="mr-1 size-3.5" />
                                Tambah Fitur
                            </Button>
                        </div>
                    </div>

                    {/* Addons */}
                    <div>
                        <Label>Add-ons (opsional)</Label>
                        <p className="mt-1 text-[11.5px] text-slate-500">
                            Layanan/program terpisah dengan harga sendiri (mis. LX Forum,
                            CDHX).
                        </p>
                        <div className="mt-2 space-y-2">
                            {form.data.addons.map((addon, idx) => (
                                <div
                                    key={idx}
                                    className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1fr_180px_auto]"
                                >
                                    <Input
                                        value={addon.name}
                                        onChange={(e) => setAddon(idx, 'name', e.target.value)}
                                        placeholder="Nama add-on"
                                    />
                                    <RupiahInput
                                        value={addon.price}
                                        onChange={(value) =>
                                            setAddon(idx, 'price', value)
                                        }
                                        onClear={() => setAddon(idx, 'price', '')}
                                        placeholder="Harga add-on"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeAddon(idx)}
                                    >
                                        <Trash2 className="size-3.5" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addAddon}
                            >
                                <Plus className="mr-1 size-3.5" />
                                Tambah Add-on
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <ToggleRow
                            label="Tampilkan badge Popular"
                            checked={form.data.is_popular}
                            onChange={(c) => form.setData('is_popular', c)}
                        />
                        <ToggleRow
                            label="Aktif (tampil di pricing)"
                            checked={form.data.is_active}
                            onChange={(c) => form.setData('is_active', c)}
                        />
                        <ToggleRow
                            label="Sales-led only"
                            checked={form.data.contact_sales_only}
                            onChange={(c) => form.setData('contact_sales_only', c)}
                        />
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                        <Button variant="outline" asChild>
                            <Link href="/admin/subscription-plans">
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
                            {form.processing
                                ? 'Menyimpan...'
                                : isEdit
                                  ? 'Update Paket'
                                  : 'Tambah Paket'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

function ToggleRow({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (c: boolean) => void;
}) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5">
            <Switch checked={checked} onCheckedChange={onChange} />
            <span className="text-[12.5px] font-semibold text-slate-700">
                {label}
            </span>
        </div>
    );
}
