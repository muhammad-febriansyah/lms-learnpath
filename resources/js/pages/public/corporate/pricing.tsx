import { Head, useForm } from '@inertiajs/react';
import { Check, Send, Sparkles, Star } from 'lucide-react';
import { useState } from 'react';

import { FieldError } from '@/components/form/field-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Addon = { name: string; price: number; note: string | null };

type Plan = {
    id: number;
    code: string;
    name: string;
    tagline: string | null;
    min_users: number;
    max_users: number | null;
    user_range: string;
    price_per_user_per_month: number;
    currency: string;
    features: string[];
    addons: Addon[];
    is_popular: boolean;
    contact_sales_only: boolean;
    is_custom_price: boolean;
};

type Props = {
    plans: Plan[];
};

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

export default function CorporatePricing({ plans }: Props) {
    const [contactPlan, setContactPlan] = useState<Plan | null>(null);

    const form = useForm({
        subscription_plan_id: '' as number | '',
        company_name: '',
        contact_name: '',
        email: '',
        phone: '',
        employee_count: '' as number | '',
        message: '',
    });

    const openContact = (plan: Plan) => {
        setContactPlan(plan);
        form.setData('subscription_plan_id', plan.id);
        if (!form.data.employee_count) {
            form.setData('employee_count', plan.min_users);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/corporate/pricing/contact', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset(
                    'company_name',
                    'contact_name',
                    'email',
                    'phone',
                    'employee_count',
                    'message',
                );
                setContactPlan(null);
            },
        });
    };

    return (
        <>
            <Head title="Paket Harga — Corporate Solution" />
            <div className="space-y-12 py-8">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[11.5px] font-bold uppercase tracking-wider text-brand-700">
                        <Sparkles className="size-3" />
                        Corporate Solution
                    </div>
                    <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                        Paket Harga Langganan
                    </h1>
                    <p className="mt-3 text-[15px] text-slate-600">
                        Pilih paket yang sesuai dengan kebutuhan perusahaan Anda. Semua
                        paket termasuk akses katalog lengkap, sertifikat, dan dashboard
                        HR.
                    </p>
                </div>

                <div className="grid gap-5 px-4 lg:grid-cols-4 lg:gap-4 lg:px-0">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={cn(
                                'relative flex flex-col rounded-3xl bg-card p-6 ring-1 transition',
                                plan.is_popular
                                    ? 'shadow-[0_20px_50px_-20px_rgba(220,38,38,0.4)] ring-2 ring-rose-500'
                                    : 'shadow-sm ring-slate-200',
                            )}
                        >
                            {plan.is_popular && (
                                <div className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-white shadow-md">
                                    <Star className="size-3" />
                                    Popular
                                </div>
                            )}

                            <div className="text-center">
                                <h2
                                    className={cn(
                                        'text-2xl font-extrabold uppercase tracking-wider',
                                        plan.is_popular ? 'text-rose-600' : 'text-brand-700',
                                    )}
                                >
                                    {plan.name}
                                </h2>
                                <p className="mt-1 text-[12px] text-slate-500">
                                    {plan.user_range}
                                </p>
                            </div>

                            <div className="mt-5 text-center">
                                {plan.is_custom_price ? (
                                    <>
                                        <div className="text-[15px] font-bold leading-tight text-orange-600">
                                            Learning ecosystem untuk
                                        </div>
                                        <div className="text-[15px] font-bold text-orange-600">
                                            perusahaan berskala besar
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div
                                            className={cn(
                                                'text-3xl font-extrabold',
                                                plan.is_popular ? 'text-rose-700' : 'text-slate-900',
                                            )}
                                        >
                                            {formatRupiah(plan.price_per_user_per_month)}
                                        </div>
                                        <div className="mt-0.5 text-[11.5px] text-slate-500">
                                            per user per bulan
                                        </div>
                                    </>
                                )}
                                {plan.tagline && (
                                    <p className="mt-2 text-[12.5px] leading-tight text-slate-600">
                                        {plan.tagline}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="button"
                                onClick={() => openContact(plan)}
                                className={cn(
                                    'mt-5 w-full rounded-xl py-5 text-[13px] font-bold',
                                    plan.is_popular
                                        ? 'bg-rose-600 hover:bg-rose-700'
                                        : 'bg-brand-600 hover:bg-brand-700',
                                )}
                            >
                                Hubungi Kami
                            </Button>

                            <ul className="mt-6 space-y-2 border-t border-slate-100 pt-5">
                                {plan.features.map((feat, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-2 text-[12.5px] text-slate-700"
                                    >
                                        <Check
                                            className={cn(
                                                'mt-0.5 size-4 shrink-0',
                                                plan.is_popular ? 'text-rose-500' : 'text-emerald-500',
                                            )}
                                        />
                                        <span>{feat}</span>
                                    </li>
                                ))}
                                {plan.addons.map((addon, i) => (
                                    <li
                                        key={`addon-${i}`}
                                        className="flex items-start gap-2 text-[12.5px] text-slate-700"
                                    >
                                        <Check
                                            className={cn(
                                                'mt-0.5 size-4 shrink-0',
                                                plan.is_popular ? 'text-rose-500' : 'text-emerald-500',
                                            )}
                                        />
                                        <span>
                                            {addon.name} —{' '}
                                            <strong className="text-slate-900">
                                                {formatRupiah(addon.price)}
                                            </strong>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mx-auto mt-12 max-w-2xl rounded-2xl bg-slate-50 p-6 text-center text-[13px] text-slate-600 ring-1 ring-slate-200">
                    <p>
                        <strong className="text-slate-900">Butuh kustomisasi lebih lanjut?</strong>{' '}
                        Tim sales kami siap membantu menyusun paket khusus sesuai kebutuhan
                        perusahaan Anda — termasuk integrasi LMS internal, white-label, atau
                        custom course development.
                    </p>
                </div>
            </div>

            {/* Contact form modal */}
            <Dialog
                open={contactPlan !== null}
                onOpenChange={(open) => !open && setContactPlan(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            Hubungi Sales — Paket {contactPlan?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Isi data perusahaan Anda. Tim sales akan menghubungi dalam 1×24
                            jam untuk diskusi penawaran khusus.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submit} className="space-y-3">
                        <div>
                            <Label htmlFor="company_name">Nama Perusahaan *</Label>
                            <Input
                                id="company_name"
                                value={form.data.company_name}
                                onChange={(e) =>
                                    form.setData('company_name', e.target.value)
                                }
                                placeholder="PT Maju Bersama"
                            />
                            <FieldError message={form.errors.company_name} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="contact_name">Nama Anda *</Label>
                                <Input
                                    id="contact_name"
                                    value={form.data.contact_name}
                                    onChange={(e) =>
                                        form.setData('contact_name', e.target.value)
                                    }
                                />
                                <FieldError message={form.errors.contact_name} />
                            </div>
                            <div>
                                <Label htmlFor="employee_count">Jumlah Karyawan</Label>
                                <Input
                                    id="employee_count"
                                    type="number"
                                    min={1}
                                    value={form.data.employee_count}
                                    onChange={(e) =>
                                        form.setData(
                                            'employee_count',
                                            e.target.value === '' ? '' : Number(e.target.value),
                                        )
                                    }
                                />
                                <FieldError message={form.errors.employee_count} />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                placeholder="hr@perusahaan.com"
                            />
                            <FieldError message={form.errors.email} />
                        </div>
                        <div>
                            <Label htmlFor="phone">No. HP / WhatsApp</Label>
                            <Input
                                id="phone"
                                value={form.data.phone}
                                onChange={(e) => form.setData('phone', e.target.value)}
                                placeholder="081234567890"
                            />
                            <FieldError message={form.errors.phone} />
                        </div>
                        <div>
                            <Label htmlFor="message">Pesan (opsional)</Label>
                            <Textarea
                                id="message"
                                rows={3}
                                value={form.data.message}
                                onChange={(e) => form.setData('message', e.target.value)}
                                placeholder="Kebutuhan training, timeline, dll..."
                                maxLength={2000}
                            />
                            <FieldError message={form.errors.message} />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setContactPlan(null)}
                                disabled={form.processing}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className={cn(
                                    'rounded-xl font-bold',
                                    contactPlan?.is_popular
                                        ? 'bg-rose-600 hover:bg-rose-700'
                                        : 'bg-brand-600 hover:bg-brand-700',
                                )}
                            >
                                <Send className="mr-1.5 size-4" />
                                {form.processing ? 'Mengirim...' : 'Kirim Permintaan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
