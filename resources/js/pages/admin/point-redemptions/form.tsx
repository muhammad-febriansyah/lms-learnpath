import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

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

type RedeemableType = 'course' | 'bundle' | 'learning_path';

type Option = { id: number; label: string; meta: string | null };

type Offer = {
    id: number;
    redeemable_type: RedeemableType;
    redeemable_id: number;
    redeemable_title: string;
    point_price: number;
    is_active: boolean;
    redeemable_from: string | null;
    redeemable_until: string | null;
    max_per_user: number | null;
    max_total: number | null;
    note: string | null;
};

type Props = {
    offer: Offer | null;
    options: Record<RedeemableType, Option[]>;
};

const TYPE_LABEL: Record<RedeemableType, string> = {
    course: 'Course',
    bundle: 'Bundle',
    learning_path: 'Learning Path',
};

function toDateTimeLocal(iso: string | null): string {
    if (!iso) {
        return '';
    }
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function PointRedemptionForm({ offer, options }: Props) {
    const isEdit = !!offer;

    const form = useForm<{
        redeemable_type: RedeemableType;
        redeemable_id: number | '';
        point_price: number | '';
        is_active: boolean;
        redeemable_from: string;
        redeemable_until: string;
        max_per_user: number | '';
        max_total: number | '';
        note: string;
    }>({
        redeemable_type: offer?.redeemable_type ?? 'course',
        redeemable_id: offer?.redeemable_id ?? '',
        point_price: offer?.point_price ?? '',
        is_active: offer?.is_active ?? true,
        redeemable_from: toDateTimeLocal(offer?.redeemable_from ?? null),
        redeemable_until: toDateTimeLocal(offer?.redeemable_until ?? null),
        max_per_user: offer?.max_per_user ?? '',
        max_total: offer?.max_total ?? '',
        note: offer?.note ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            form.patch(`/admin/point-redemptions/${offer.id}`, {
                preserveScroll: true,
            });
        } else {
            form.post('/admin/point-redemptions', {
                preserveScroll: true,
            });
        }
    };

    const currentOptions = options[form.data.redeemable_type] ?? [];

    return (
        <>
            <Head title={isEdit ? 'Edit Penawaran' : 'Buat Penawaran'} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link
                            href="/admin/point-redemptions"
                            className="hover:text-slate-700"
                        >
                            Tukar Poin
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            {isEdit ? 'Edit' : 'Buat'}
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        {isEdit ? 'Edit Penawaran Tukar Poin' : 'Buat Penawaran Tukar Poin'}
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        {isEdit
                            ? `Mengubah penawaran untuk ${offer?.redeemable_title}`
                            : 'Pilih item dan tentukan harga poinnya.'}
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 rounded-2xl bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70"
                >
                    {/* Item picker */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <RequiredLabel htmlFor="redeemable_type">
                                Tipe Item
                            </RequiredLabel>
                            <Select
                                value={form.data.redeemable_type}
                                onValueChange={(v) => {
                                    form.setData('redeemable_type', v as RedeemableType);
                                    form.setData('redeemable_id', '');
                                }}
                                disabled={isEdit}
                            >
                                <SelectTrigger id="redeemable_type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {(Object.keys(TYPE_LABEL) as RedeemableType[]).map(
                                        (t) => (
                                            <SelectItem key={t} value={t}>
                                                {TYPE_LABEL[t]}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                            <FieldError message={form.errors.redeemable_type} />
                            {isEdit && (
                                <p className="mt-1 text-[11.5px] text-slate-500">
                                    Tipe item dan item tidak bisa diubah setelah dibuat.
                                </p>
                            )}
                        </div>

                        <div>
                            <RequiredLabel htmlFor="redeemable_id">
                                Pilih {TYPE_LABEL[form.data.redeemable_type]}
                            </RequiredLabel>
                            <Select
                                value={
                                    form.data.redeemable_id
                                        ? String(form.data.redeemable_id)
                                        : ''
                                }
                                onValueChange={(v) =>
                                    form.setData('redeemable_id', Number(v))
                                }
                                disabled={isEdit}
                            >
                                <SelectTrigger id="redeemable_id">
                                    <SelectValue
                                        placeholder={
                                            isEdit
                                                ? offer?.redeemable_title
                                                : `Pilih ${TYPE_LABEL[form.data.redeemable_type]}`
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {currentOptions.length === 0 ? (
                                        <div className="px-3 py-2 text-[12px] text-slate-500">
                                            Tidak ada item tersedia.
                                        </div>
                                    ) : (
                                        currentOptions.map((opt) => (
                                            <SelectItem
                                                key={opt.id}
                                                value={String(opt.id)}
                                            >
                                                <span className="flex w-full items-center justify-between gap-3">
                                                    <span className="truncate">
                                                        {opt.label}
                                                    </span>
                                                    {opt.meta ? (
                                                        <span className="text-[10.5px] text-slate-500">
                                                            {opt.meta}
                                                        </span>
                                                    ) : null}
                                                </span>
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            <FieldError message={form.errors.redeemable_id} />
                        </div>
                    </div>

                    {/* Price + status */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <RequiredLabel htmlFor="point_price">
                                Harga Poin
                            </RequiredLabel>
                            <Input
                                id="point_price"
                                type="number"
                                min={1}
                                max={1000000}
                                value={form.data.point_price}
                                onChange={(e) =>
                                    form.setData(
                                        'point_price',
                                        e.target.value === ''
                                            ? ''
                                            : Number(e.target.value),
                                    )
                                }
                                placeholder="500"
                            />
                            <FieldError message={form.errors.point_price} />
                            <p className="mt-1 text-[11.5px] text-slate-500">
                                Jumlah poin yang dipotong saat ditukar.
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="is_active">Status</Label>
                            <div className="mt-2 flex h-9 items-center gap-2">
                                <Switch
                                    id="is_active"
                                    checked={form.data.is_active}
                                    onCheckedChange={(c) => form.setData('is_active', c)}
                                />
                                <span className="text-[13px] font-semibold text-slate-700">
                                    {form.data.is_active ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>
                            <p className="mt-1 text-[11.5px] text-slate-500">
                                Nonaktifkan untuk menyembunyikan dari peserta tanpa
                                menghapus.
                            </p>
                        </div>
                    </div>

                    {/* Window */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="redeemable_from">Mulai (opsional)</Label>
                            <Input
                                id="redeemable_from"
                                type="datetime-local"
                                value={form.data.redeemable_from}
                                onChange={(e) =>
                                    form.setData('redeemable_from', e.target.value)
                                }
                            />
                            <FieldError message={form.errors.redeemable_from} />
                        </div>
                        <div>
                            <Label htmlFor="redeemable_until">
                                Berakhir (opsional)
                            </Label>
                            <Input
                                id="redeemable_until"
                                type="datetime-local"
                                value={form.data.redeemable_until}
                                onChange={(e) =>
                                    form.setData('redeemable_until', e.target.value)
                                }
                            />
                            <FieldError message={form.errors.redeemable_until} />
                        </div>
                    </div>

                    {/* Caps */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="max_per_user">Maks per User (opsional)</Label>
                            <Input
                                id="max_per_user"
                                type="number"
                                min={1}
                                value={form.data.max_per_user}
                                onChange={(e) =>
                                    form.setData(
                                        'max_per_user',
                                        e.target.value === ''
                                            ? ''
                                            : Number(e.target.value),
                                    )
                                }
                                placeholder="1"
                            />
                            <FieldError message={form.errors.max_per_user} />
                            <p className="mt-1 text-[11.5px] text-slate-500">
                                Default: unlimited per user.
                            </p>
                        </div>
                        <div>
                            <Label htmlFor="max_total">Kuota Total (opsional)</Label>
                            <Input
                                id="max_total"
                                type="number"
                                min={1}
                                value={form.data.max_total}
                                onChange={(e) =>
                                    form.setData(
                                        'max_total',
                                        e.target.value === ''
                                            ? ''
                                            : Number(e.target.value),
                                    )
                                }
                                placeholder="100"
                            />
                            <FieldError message={form.errors.max_total} />
                            <p className="mt-1 text-[11.5px] text-slate-500">
                                Default: unlimited total.
                            </p>
                        </div>
                    </div>

                    {/* Note */}
                    <div>
                        <Label htmlFor="note">Catatan Internal (opsional)</Label>
                        <Textarea
                            id="note"
                            value={form.data.note}
                            onChange={(e) => form.setData('note', e.target.value)}
                            rows={2}
                            maxLength={255}
                            placeholder="Promo Harbolnas, dll"
                        />
                        <FieldError message={form.errors.note} />
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                        <Button variant="outline" asChild>
                            <Link href="/admin/point-redemptions">
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
                                  ? 'Simpan Perubahan'
                                  : 'Buat Penawaran'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
