import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

import { FieldError } from '@/components/form/field-error';
import { RequiredLabel } from '@/components/form/required-label';
import { IconChevR } from '@/components/learnpath-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

type Coupon = {
    id: number;
    code: string;
    name: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    max_discount: number | null;
    applicable_to: 'all' | 'specific';
    max_uses: number | null;
    uses_count: number;
    is_active: boolean;
    course_ids: number[];
};

type CourseOption = { id: number; title: string };

type Props = {
    coupon: Coupon | null;
    courses: CourseOption[];
};

export default function CouponForm({ coupon, courses }: Props) {
    const isEdit = !!coupon;

    const form = useForm<{
        code: string;
        name: string;
        discount_type: 'percentage' | 'fixed';
        discount_value: number | '';
        max_discount: number | '';
        applicable_to: 'all' | 'specific';
        course_ids: number[];
        max_uses: number | '';
        is_active: boolean;
    }>({
        code: coupon?.code ?? '',
        name: coupon?.name ?? '',
        discount_type: coupon?.discount_type ?? 'percentage',
        discount_value: coupon?.discount_value ?? 10,
        max_discount: coupon?.max_discount ?? '',
        applicable_to: coupon?.applicable_to ?? 'all',
        course_ids: coupon?.course_ids ?? [],
        max_uses: coupon?.max_uses ?? '',
        is_active: coupon?.is_active ?? true,
    });

    function submit(event: React.FormEvent) {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            discount_value: data.discount_value === '' ? 0 : Number(data.discount_value),
            max_discount: data.max_discount === '' ? null : Number(data.max_discount),
            max_uses: data.max_uses === '' ? null : Number(data.max_uses),
        }));

        if (isEdit) {
            form.put(`/admin/coupons/${coupon!.id}`);
        } else {
            form.post('/admin/coupons');
        }
    }

    function toggleCourse(id: number) {
        const next = form.data.course_ids.includes(id)
            ? form.data.course_ids.filter((c) => c !== id)
            : [...form.data.course_ids, id];
        form.setData('course_ids', next);
    }

    const isPercentage = form.data.discount_type === 'percentage';
    const isSpecific = form.data.applicable_to === 'specific';

    return (
        <>
            <Head title={isEdit ? 'Edit Voucher' : 'Tambah Voucher'} />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <Link href="/admin/coupons" className="hover:text-slate-700">
                            Voucher
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">
                            {isEdit ? 'Edit' : 'Tambah'}
                        </span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        {isEdit ? 'Edit Voucher' : 'Tambah Voucher'}
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        {isEdit
                            ? 'Perbarui konfigurasi voucher. Voucher yang sudah dipakai tetap tercatat.'
                            : 'Buat voucher diskon yang bisa dipakai pelanggan saat checkout.'}
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-5 rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:p-6"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <RequiredLabel htmlFor="code" required>
                                Kode Voucher
                            </RequiredLabel>
                            <Input
                                id="code"
                                placeholder="DISKON70"
                                value={form.data.code}
                                onChange={(e) =>
                                    form.setData('code', e.target.value.toUpperCase())
                                }
                                className="font-mono tracking-wider"
                            />
                            <p className="text-[11.5px] text-slate-500">
                                Huruf besar, angka, tanda hubung/garis bawah.
                            </p>
                            <FieldError message={form.errors.code} />
                        </div>

                        <div className="space-y-2">
                            <RequiredLabel htmlFor="name">Nama Internal</RequiredLabel>
                            <Input
                                id="name"
                                placeholder="Promo Akhir Tahun"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                            />
                            <p className="text-[11.5px] text-slate-500">
                                Catatan internal, tidak ditampilkan ke pelanggan.
                            </p>
                            <FieldError message={form.errors.name} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <RequiredLabel required>Tipe Diskon</RequiredLabel>
                        <div className="grid gap-2 sm:grid-cols-2">
                            <RadioCard
                                active={isPercentage}
                                onClick={() => form.setData('discount_type', 'percentage')}
                                title="Persen"
                                description="Diskon X% dari harga course"
                            />
                            <RadioCard
                                active={!isPercentage}
                                onClick={() => form.setData('discount_type', 'fixed')}
                                title="Nominal Tetap"
                                description="Potongan Rp X langsung"
                            />
                        </div>
                        <FieldError message={form.errors.discount_type} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <RequiredLabel htmlFor="discount_value" required>
                                {isPercentage ? 'Diskon (%)' : 'Diskon (Rp)'}
                            </RequiredLabel>
                            <Input
                                id="discount_value"
                                type="number"
                                min={1}
                                max={isPercentage ? 100 : undefined}
                                value={form.data.discount_value}
                                onChange={(e) =>
                                    form.setData(
                                        'discount_value',
                                        e.target.value === '' ? '' : Number(e.target.value),
                                    )
                                }
                            />
                            <FieldError message={form.errors.discount_value} />
                        </div>

                        {isPercentage && (
                            <div className="space-y-2">
                                <RequiredLabel htmlFor="max_discount">
                                    Diskon Maks (Rp)
                                </RequiredLabel>
                                <Input
                                    id="max_discount"
                                    type="number"
                                    min={0}
                                    placeholder="Opsional"
                                    value={form.data.max_discount}
                                    onChange={(e) =>
                                        form.setData(
                                            'max_discount',
                                            e.target.value === '' ? '' : Number(e.target.value),
                                        )
                                    }
                                />
                                <p className="text-[11.5px] text-slate-500">
                                    Batas potongan untuk voucher persen. Kosongkan jika tanpa batas.
                                </p>
                                <FieldError message={form.errors.max_discount} />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <RequiredLabel required>Scope Voucher</RequiredLabel>
                        <div className="grid gap-2 sm:grid-cols-2">
                            <RadioCard
                                active={!isSpecific}
                                onClick={() => form.setData('applicable_to', 'all')}
                                title="Semua Kursus"
                                description="Berlaku untuk semua course"
                            />
                            <RadioCard
                                active={isSpecific}
                                onClick={() => form.setData('applicable_to', 'specific')}
                                title="Kursus Tertentu"
                                description="Pilih course yang dapat memakainya"
                            />
                        </div>
                        <FieldError message={form.errors.applicable_to} />
                    </div>

                    {isSpecific && (
                        <div className="space-y-2">
                            <RequiredLabel required>Pilih Kursus</RequiredLabel>
                            <div className="max-h-72 overflow-auto rounded-xl border border-slate-200">
                                {courses.length === 0 ? (
                                    <p className="p-4 text-center text-[12.5px] text-slate-500">
                                        Belum ada kursus.
                                    </p>
                                ) : (
                                    <ul className="divide-y divide-slate-100">
                                        {courses.map((c) => {
                                            const checked = form.data.course_ids.includes(c.id);
                                            return (
                                                <li key={c.id}>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleCourse(c.id)}
                                                        className={cn(
                                                            'flex w-full items-center gap-3 p-3 text-left text-[13px] transition hover:bg-slate-50',
                                                            checked && 'bg-brand-50/40',
                                                        )}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            readOnly
                                                            className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                                        />
                                                        <span className="flex-1 text-slate-900">
                                                            {c.title}
                                                        </span>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                            <p className="text-[11.5px] text-slate-500">
                                {form.data.course_ids.length} kursus dipilih.
                            </p>
                            <FieldError message={form.errors.course_ids as unknown as string} />
                        </div>
                    )}

                    <div className="space-y-2">
                        <RequiredLabel htmlFor="max_uses">Total Pemakaian Maks</RequiredLabel>
                        <Input
                            id="max_uses"
                            type="number"
                            min={1}
                            placeholder="Kosongkan untuk tanpa batas"
                            value={form.data.max_uses}
                            onChange={(e) =>
                                form.setData(
                                    'max_uses',
                                    e.target.value === '' ? '' : Number(e.target.value),
                                )
                            }
                        />
                        {isEdit && coupon && (
                            <p className="text-[11.5px] text-slate-500">
                                Sudah dipakai {coupon.uses_count} kali.
                            </p>
                        )}
                        <FieldError message={form.errors.max_uses} />
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                        <div>
                            <div className="text-[13.5px] font-semibold text-slate-900">
                                Status Aktif
                            </div>
                            <div className="text-[12px] text-slate-500">
                                Voucher nonaktif tidak bisa dipakai meski belum kedaluwarsa.
                            </div>
                        </div>
                        <Switch
                            checked={form.data.is_active}
                            onCheckedChange={(checked) => form.setData('is_active', checked)}
                        />
                    </div>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button asChild type="button" variant="outline" className="rounded-xl">
                            <Link href="/admin/coupons">
                                <ArrowLeft className="mr-1.5 size-4" />
                                Batal
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
                                  : 'Buat Voucher'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

function RadioCard({
    active,
    onClick,
    title,
    description,
}: {
    active: boolean;
    onClick: () => void;
    title: string;
    description: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'rounded-xl border p-3.5 text-left transition',
                active
                    ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-200'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
            )}
        >
            <div className="text-[13.5px] font-semibold text-slate-900">{title}</div>
            <div className="mt-0.5 text-[11.5px] text-slate-500">{description}</div>
        </button>
    );
}
