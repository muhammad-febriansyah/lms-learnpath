import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, RefreshCw, Save } from 'lucide-react';

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
    voucher: null;
    options: Partial<Record<Kind, Option[]>>;
};

const KIND_LABEL: Record<Kind, string> = {
    course: 'Course',
    bundle: 'Bundle',
    learning_path: 'Learning Path',
    points: 'Top-up Poin',
};

function randomCode(): string {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < 8; i++) {
        out += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return out;
}

export default function VoucherForm({ options }: Props) {
    const form = useForm<{
        code: string;
        grant_kind: Kind;
        grantable_id: number | '';
        points_amount: number | '';
        valid_from: string;
        valid_until: string;
        max_uses: number | '';
        single_use_per_user: boolean;
        is_active: boolean;
        bound_email: string;
        note: string;
    }>({
        code: randomCode(),
        grant_kind: 'course',
        grantable_id: '',
        points_amount: '',
        valid_from: '',
        valid_until: '',
        max_uses: 1,
        single_use_per_user: true,
        is_active: true,
        bound_email: '',
        note: '',
    });

    const currentOptions = options[form.data.grant_kind] ?? [];
    const isPoints = form.data.grant_kind === 'points';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/vouchers', { preserveScroll: true });
    };

    return (
        <>
            <Head title="Buat Voucher" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/vouchers" className="hover:text-slate-700">
                            Voucher Akses
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Buat</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Buat Voucher Tunggal
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Untuk generate banyak kode sekaligus, gunakan{' '}
                        <Link
                            href="/admin/voucher-batches/create"
                            className="font-semibold text-brand-600 hover:underline"
                        >
                            Batch
                        </Link>
                        .
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 rounded-2xl bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70"
                >
                    <div>
                        <RequiredLabel htmlFor="code">Kode Voucher</RequiredLabel>
                        <div className="flex gap-2">
                            <Input
                                id="code"
                                value={form.data.code}
                                onChange={(e) =>
                                    form.setData('code', e.target.value.toUpperCase())
                                }
                                placeholder="HARBOLNAS2026"
                                maxLength={64}
                                className="font-mono tracking-wider"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => form.setData('code', randomCode())}
                            >
                                <RefreshCw className="mr-1.5 size-3.5" />
                                Random
                            </Button>
                        </div>
                        <FieldError message={form.errors.code} />
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
                                    Jumlah Poin
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
                                            e.target.value === '' ? '' : Number(e.target.value),
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
                                        <SelectValue placeholder={`Pilih ${KIND_LABEL[form.data.grant_kind]}`} />
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

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="valid_from">Berlaku Dari (opsional)</Label>
                            <Input
                                id="valid_from"
                                type="datetime-local"
                                value={form.data.valid_from}
                                onChange={(e) => form.setData('valid_from', e.target.value)}
                            />
                            <FieldError message={form.errors.valid_from} />
                        </div>
                        <div>
                            <Label htmlFor="valid_until">Berlaku Sampai (opsional)</Label>
                            <Input
                                id="valid_until"
                                type="datetime-local"
                                value={form.data.valid_until}
                                onChange={(e) => form.setData('valid_until', e.target.value)}
                            />
                            <FieldError message={form.errors.valid_until} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <Label htmlFor="max_uses">Max Pemakaian</Label>
                            <Input
                                id="max_uses"
                                type="number"
                                min={1}
                                max={10000}
                                value={form.data.max_uses}
                                onChange={(e) =>
                                    form.setData(
                                        'max_uses',
                                        e.target.value === '' ? '' : Number(e.target.value),
                                    )
                                }
                            />
                            <p className="mt-1 text-[11px] text-slate-500">
                                Default 1 (single-use voucher).
                            </p>
                        </div>
                        <div>
                            <Label>1 user 1 kali</Label>
                            <div className="mt-2 flex h-9 items-center gap-2">
                                <Switch
                                    checked={form.data.single_use_per_user}
                                    onCheckedChange={(c) =>
                                        form.setData('single_use_per_user', c)
                                    }
                                />
                                <span className="text-[13px] text-slate-700">
                                    {form.data.single_use_per_user ? 'Ya' : 'Tidak'}
                                </span>
                            </div>
                        </div>
                        <div>
                            <Label>Status</Label>
                            <div className="mt-2 flex h-9 items-center gap-2">
                                <Switch
                                    checked={form.data.is_active}
                                    onCheckedChange={(c) => form.setData('is_active', c)}
                                />
                                <span className="text-[13px] text-slate-700">
                                    {form.data.is_active ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="bound_email">Bind ke Email (opsional)</Label>
                        <Input
                            id="bound_email"
                            type="email"
                            value={form.data.bound_email}
                            onChange={(e) => form.setData('bound_email', e.target.value)}
                            placeholder="user@example.com"
                        />
                        <FieldError message={form.errors.bound_email} />
                        <p className="mt-1 text-[11.5px] text-slate-500">
                            Voucher hanya bisa dipakai user dengan email ini.
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="note">Catatan Internal</Label>
                        <Textarea
                            id="note"
                            value={form.data.note}
                            onChange={(e) => form.setData('note', e.target.value)}
                            rows={2}
                            maxLength={255}
                            placeholder="Kerjasama vendor, hadiah event, dll"
                        />
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                        <Button variant="outline" asChild>
                            <Link href="/admin/vouchers">
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
                            {form.processing ? 'Menyimpan...' : 'Buat Voucher'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
