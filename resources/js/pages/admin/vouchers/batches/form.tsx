import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Package, Save } from 'lucide-react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
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
import { Textarea } from '@/components/ui/textarea';

type Kind = 'course' | 'bundle' | 'learning_path' | 'points';

type Option = { id: number; label: string };

type Props = {
    options: Partial<Record<Kind, Option[]>>;
};

const KIND_LABEL: Record<Kind, string> = {
    course: 'Course',
    bundle: 'Bundle',
    learning_path: 'Learning Path',
    points: 'Top-up Poin',
};

export default function BatchForm({ options }: Props) {
    const form = useForm<{
        name: string;
        prefix: string;
        grant_kind: Kind;
        grantable_id: number | '';
        points_amount: number | '';
        count: number | '';
        valid_from: string;
        valid_until: string;
        single_use_per_user: boolean;
        is_active: boolean;
        note: string;
    }>({
        name: '',
        prefix: '',
        grant_kind: 'course',
        grantable_id: '',
        points_amount: '',
        count: 100,
        valid_from: '',
        valid_until: '',
        single_use_per_user: true,
        is_active: true,
        note: '',
    });

    const currentOptions = options[form.data.grant_kind] ?? [];
    const isPoints = form.data.grant_kind === 'points';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/voucher-batches', { preserveScroll: true });
    };

    return (
        <>
            <Head title="Generate Batch Voucher" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/vouchers" className="hover:text-slate-700">
                            Voucher Akses
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <Link
                            href="/admin/voucher-batches"
                            className="hover:text-slate-700"
                        >
                            Batch
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Generate</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Generate Batch Voucher
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Buat banyak kode sekaligus untuk dibagikan ke peserta event.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 rounded-2xl bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <RequiredLabel htmlFor="name">Nama Batch</RequiredLabel>
                            <Input
                                id="name"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                placeholder="Harbolnas 2026"
                                maxLength={120}
                            />
                            <FieldError message={form.errors.name} />
                        </div>
                        <div>
                            <Label htmlFor="prefix">Prefix Kode (opsional)</Label>
                            <Input
                                id="prefix"
                                value={form.data.prefix}
                                onChange={(e) =>
                                    form.setData(
                                        'prefix',
                                        e.target.value.toUpperCase(),
                                    )
                                }
                                placeholder="HARBOLNAS"
                                maxLength={16}
                                className="font-mono"
                            />
                            <FieldError message={form.errors.prefix} />
                            <p className="mt-1 text-[11.5px] text-slate-500">
                                Contoh: HARBOLNAS-A3K9F2X7
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <RequiredLabel htmlFor="grant_kind">Tipe Hadiah</RequiredLabel>
                            <Select
                                value={form.data.grant_kind}
                                onValueChange={(v) => {
                                    form.setData('grant_kind', v as Kind);
                                    form.setData('grantable_id', '');
                                    form.setData('points_amount', '');
                                }}
                            >
                                <SelectTrigger id="grant_kind">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {(Object.keys(KIND_LABEL) as Kind[]).map((k) => (
                                        <SelectItem key={k} value={k}>
                                            {KIND_LABEL[k]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {isPoints ? (
                            <div>
                                <RequiredLabel htmlFor="points_amount">
                                    Poin per Kode
                                </RequiredLabel>
                                <Input
                                    id="points_amount"
                                    type="number"
                                    min={1}
                                    max={1000000}
                                    value={form.data.points_amount}
                                    onChange={(e) =>
                                        form.setData(
                                            'points_amount',
                                            e.target.value === ''
                                                ? ''
                                                : Number(e.target.value),
                                        )
                                    }
                                    placeholder="500"
                                />
                                <FieldError message={form.errors.points_amount} />
                            </div>
                        ) : (
                            <div>
                                <RequiredLabel htmlFor="grantable_id">
                                    Pilih {KIND_LABEL[form.data.grant_kind]}
                                </RequiredLabel>
                                <Select
                                    value={
                                        form.data.grantable_id
                                            ? String(form.data.grantable_id)
                                            : ''
                                    }
                                    onValueChange={(v) =>
                                        form.setData('grantable_id', Number(v))
                                    }
                                >
                                    <SelectTrigger id="grantable_id">
                                        <SelectValue
                                            placeholder={`Pilih ${KIND_LABEL[form.data.grant_kind]}`}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currentOptions.length === 0 ? (
                                            <div className="px-3 py-2 text-[12px] text-slate-500">
                                                Tidak ada item.
                                            </div>
                                        ) : (
                                            currentOptions.map((opt) => (
                                                <SelectItem
                                                    key={opt.id}
                                                    value={String(opt.id)}
                                                >
                                                    {opt.label}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <FieldError message={form.errors.grantable_id} />
                            </div>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <RequiredLabel htmlFor="count">Jumlah Kode</RequiredLabel>
                            <Input
                                id="count"
                                type="number"
                                min={1}
                                max={10000}
                                value={form.data.count}
                                onChange={(e) =>
                                    form.setData(
                                        'count',
                                        e.target.value === '' ? '' : Number(e.target.value),
                                    )
                                }
                                placeholder="100"
                            />
                            <FieldError message={form.errors.count} />
                            <p className="mt-1 text-[11px] text-slate-500">
                                Maks 10.000 kode per batch.
                            </p>
                        </div>
                        <div>
                            <Label htmlFor="valid_from">Berlaku Dari</Label>
                            <Input
                                id="valid_from"
                                type="datetime-local"
                                value={form.data.valid_from}
                                onChange={(e) => form.setData('valid_from', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="valid_until">Berlaku Sampai</Label>
                            <Input
                                id="valid_until"
                                type="datetime-local"
                                value={form.data.valid_until}
                                onChange={(e) => form.setData('valid_until', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                            <Switch
                                checked={form.data.single_use_per_user}
                                onCheckedChange={(c) =>
                                    form.setData('single_use_per_user', c)
                                }
                            />
                            <div>
                                <div className="text-[13px] font-semibold text-slate-900">
                                    Single use per user
                                </div>
                                <div className="text-[11.5px] text-slate-500">
                                    User hanya bisa pakai 1 kode dari batch ini
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                            <Switch
                                checked={form.data.is_active}
                                onCheckedChange={(c) => form.setData('is_active', c)}
                            />
                            <div>
                                <div className="text-[13px] font-semibold text-slate-900">
                                    Aktif
                                </div>
                                <div className="text-[11.5px] text-slate-500">
                                    Kode bisa langsung dipakai user
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="note">Catatan Internal</Label>
                        <Textarea
                            id="note"
                            value={form.data.note}
                            onChange={(e) => form.setData('note', e.target.value)}
                            rows={2}
                            maxLength={255}
                            placeholder="Untuk kerjasama brand X, dll"
                        />
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                        <Button variant="outline" asChild>
                            <Link href="/admin/voucher-batches">
                                <ArrowLeft className="mr-1.5 size-4" />
                                Kembali
                            </Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-xl bg-brand-600 hover:bg-brand-700"
                        >
                            <Package className="mr-1.5 size-4" />
                            {form.processing
                                ? 'Generating...'
                                : `Generate ${form.data.count || 0} Kode`}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
