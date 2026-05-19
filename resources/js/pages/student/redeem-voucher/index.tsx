import { Head, useForm, usePage } from '@inertiajs/react';
import { Coins, Gift, Send, Tag, Ticket } from 'lucide-react';

import { FieldError } from '@/components/form/field-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Flash = {
    success?: string | null;
    error?: string | null;
};

export default function RedeemVoucherIndex() {
    const { props } = usePage<{ flash: Flash | null }>();
    const flashSuccess = props.flash?.success ?? null;

    const form = useForm<{ code: string }>({
        code: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/redeem', {
            preserveScroll: true,
            onSuccess: () => form.reset('code'),
        });
    };

    return (
        <>
            <Head title="Tukar Voucher" />
            <div className="mx-auto max-w-2xl space-y-5">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                        Tukar Voucher
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Masukkan kode voucher yang kamu punya untuk akses course, bundle,
                        learning path, atau top-up poin.
                    </p>
                </div>

                {flashSuccess && (
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-[13px] text-emerald-800">
                        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white">
                            <Gift className="size-4" />
                        </div>
                        <div className="font-semibold">{flashSuccess}</div>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-6 ring-1 ring-amber-200"
                >
                    <div className="flex items-center gap-3">
                        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
                            <Ticket className="size-6" />
                        </div>
                        <div>
                            <div className="text-[15px] font-bold text-slate-900">
                                Punya kode voucher?
                            </div>
                            <div className="text-[12.5px] text-slate-600">
                                Kode dari event, brand partner, atau hadiah promo.
                            </div>
                        </div>
                    </div>

                    <div className="mt-5">
                        <label
                            htmlFor="code"
                            className="text-[12.5px] font-bold uppercase tracking-wider text-slate-700"
                        >
                            Kode Voucher
                        </label>
                        <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
                            <Input
                                id="code"
                                value={form.data.code}
                                onChange={(e) =>
                                    form.setData('code', e.target.value.toUpperCase())
                                }
                                placeholder="HARBOLNAS-A3K9F2X7"
                                maxLength={64}
                                autoComplete="off"
                                className="h-11 flex-1 border-2 border-amber-200 bg-white font-mono text-base tracking-widest focus-visible:border-amber-500"
                            />
                            <Button
                                type="submit"
                                disabled={form.processing || !form.data.code.trim()}
                                className="h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 px-6 text-[13px] font-bold text-amber-950 hover:from-amber-600 hover:to-orange-600"
                            >
                                <Send className="mr-1.5 size-4" />
                                {form.processing ? 'Memproses...' : 'Tukar'}
                            </Button>
                        </div>
                        <FieldError message={form.errors.code} />
                    </div>
                </form>

                {/* Info section */}
                <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    <h2 className="text-[14px] font-bold text-slate-900">
                        Apa yang bisa kamu dapat?
                    </h2>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <InfoTile
                            icon={Tag}
                            color="text-brand-600 bg-brand-50 ring-brand-200"
                            title="Akses Course / Bundle"
                            desc="Langsung enroll tanpa bayar, lifetime access."
                        />
                        <InfoTile
                            icon={Coins}
                            color="text-amber-700 bg-amber-50 ring-amber-200"
                            title="Top-up Poin"
                            desc="Poin masuk ke saldo, bisa untuk tukar course lain."
                        />
                    </div>
                </div>

                <div className="text-center text-[11.5px] text-slate-500">
                    Tidak punya voucher? Kumpulkan poin dari aktivitas belajar, lalu tukar
                    di{' '}
                    <a href="/my-points" className="font-semibold text-brand-600 hover:underline">
                        halaman Poin
                    </a>
                    .
                </div>
            </div>
        </>
    );
}

function InfoTile({
    icon: Icon,
    color,
    title,
    desc,
}: {
    icon: typeof Tag;
    color: string;
    title: string;
    desc: string;
}) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className={`grid size-9 shrink-0 place-items-center rounded-xl ring-1 ${color}`}>
                <Icon className="size-4" />
            </div>
            <div className="min-w-0">
                <div className="text-[13px] font-bold text-slate-900">{title}</div>
                <div className="text-[11.5px] text-slate-600">{desc}</div>
            </div>
        </div>
    );
}
