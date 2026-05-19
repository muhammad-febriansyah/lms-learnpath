import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import { RupiahInput } from '@/components/form/rupiah-input';
import { IconChevR } from '@/components/learnpath-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

type Period = 'monthly' | 'quarterly' | 'yearly';

type Plan = {
    id: number;
    code: string;
    name: string;
    tagline: string | null;
    price: number;
    compare_at_price: number | null;
    billing_period: Period;
    currency: string;
    features: string[];
    is_popular: boolean;
    is_active: boolean;
    sort_order: number;
};

type Props = {
    plan: Plan | null;
    periods: Period[];
};

const PERIOD_LABELS: Record<Period, string> = {
    monthly: 'Bulanan (30 hari)',
    quarterly: 'Kuartalan (90 hari)',
    yearly: 'Tahunan (365 hari)',
};

export default function B2cPlanForm({ plan, periods }: Props) {
    const isEdit = !!plan;

    const form = useForm<{
        code: string;
        name: string;
        tagline: string;
        price: number | '';
        compare_at_price: number | '';
        billing_period: Period;
        currency: string;
        features: string[];
        is_popular: boolean;
        is_active: boolean;
        sort_order: number | '';
    }>({
        code: plan?.code ?? '',
        name: plan?.name ?? '',
        tagline: plan?.tagline ?? '',
        price: plan?.price ?? '',
        compare_at_price: plan?.compare_at_price ?? '',
        billing_period: plan?.billing_period ?? 'monthly',
        currency: plan?.currency ?? 'IDR',
        features: plan?.features ?? [],
        is_popular: plan?.is_popular ?? false,
        is_active: plan?.is_active ?? true,
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

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...form.data,
            features: form.data.features.filter(Boolean),
        };
        form.transform(() => payload);

        if (isEdit) {
            form.patch(`/admin/b2c-plans/${plan!.id}`, {
                onFinish: () => form.transform((d) => d),
            });
        } else {
            form.post('/admin/b2c-plans', {
                onFinish: () => form.transform((d) => d),
            });
        }
    };

    return (
        <>
            <Head title={isEdit ? `Edit ${plan?.name}` : 'Tambah Paket Langganan'} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/b2c-plans" className="hover:text-slate-700">
                            Paket Langganan
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            {isEdit ? 'Edit' : 'Tambah'}
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        {isEdit ? `Edit ${plan?.name}` : 'Tambah Paket Langganan'}
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
                                placeholder="personal-monthly"
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
                                placeholder="Personal Monthly"
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
                            placeholder="Akses semua kursus selama 1 bulan"
                            maxLength={200}
                        />
                        <FieldError message={form.errors.tagline} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <RequiredLabel htmlFor="price">Harga</RequiredLabel>
                            <RupiahInput
                                id="price"
                                value={form.data.price}
                                onChange={(value) => form.setData('price', value)}
                                onClear={() => form.setData('price', '')}
                                placeholder="Rp 99.000"
                            />
                            <FieldError message={form.errors.price} />
                        </div>
                        <div>
                            <Label htmlFor="compare_at_price">Harga Coret (opsional)</Label>
                            <RupiahInput
                                id="compare_at_price"
                                value={form.data.compare_at_price}
                                onChange={(value) => form.setData('compare_at_price', value)}
                                onClear={() => form.setData('compare_at_price', '')}
                                placeholder="Harga normal sebelum diskon"
                            />
                            <FieldError message={form.errors.compare_at_price} />
                        </div>
                        <div>
                            <RequiredLabel htmlFor="billing_period">Periode</RequiredLabel>
                            <Select
                                value={form.data.billing_period}
                                onValueChange={(v) =>
                                    form.setData('billing_period', v as Period)
                                }
                            >
                                <SelectTrigger id="billing_period">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {periods.map((p) => (
                                        <SelectItem key={p} value={p}>
                                            {PERIOD_LABELS[p]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError message={form.errors.billing_period} />
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
                                        placeholder="Akses 500+ kursus"
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

                    <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                            <Label htmlFor="sort_order">Urutan</Label>
                            <Input
                                id="sort_order"
                                type="number"
                                min={0}
                                value={form.data.sort_order}
                                onChange={(e) =>
                                    form.setData(
                                        'sort_order',
                                        e.target.value === '' ? '' : Number(e.target.value),
                                    )
                                }
                            />
                        </div>
                        <ToggleRow
                            label="Badge Populer"
                            checked={form.data.is_popular}
                            onChange={(c) => form.setData('is_popular', c)}
                        />
                        <ToggleRow
                            label="Aktif"
                            checked={form.data.is_active}
                            onChange={(c) => form.setData('is_active', c)}
                        />
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                        <Button variant="outline" asChild>
                            <Link href="/admin/b2c-plans">
                                <ArrowLeft className="mr-1.5 size-4" />
                                Kembali
                            </Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-xl bg-violet-600 hover:bg-violet-700"
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
