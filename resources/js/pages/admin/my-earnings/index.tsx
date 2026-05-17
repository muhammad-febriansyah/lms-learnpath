import { Head, Link } from '@inertiajs/react';
import { Banknote, Bell, Sparkles, TrendingUp, Wallet } from 'lucide-react';

import { IconChevR } from '@/components/learnpath-icons';
import { Button } from '@/components/ui/button';

export default function MyEarningsComingSoon() {
    return (
        <>
            <Head title="Pendapatan" />
            <div className="space-y-5">
                <div>
                    <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                        <Link href="/admin/dashboard" className="hover:text-slate-700">
                            Dashboard
                        </Link>
                        <IconChevR size={12} className="text-slate-300" />
                        <span className="font-semibold text-slate-900">Pendapatan</span>
                    </nav>
                    <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                        Pendapatan
                    </h1>
                    <p className="mt-1 text-[13.5px] text-slate-500">
                        Pantau penghasilan, transaksi, dan penarikan dana dari course Anda.
                    </p>
                </div>

                <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 p-8 text-white">
                    <div className="grid gap-6 md:grid-cols-2 md:items-center">
                        <div>
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase backdrop-blur">
                                <Sparkles className="size-3" /> Segera Hadir
                            </div>
                            <h2 className="mt-3 text-2xl font-extrabold leading-tight">
                                Pelacakan Pendapatan Mentor
                            </h2>
                            <p className="mt-2 text-[14px] leading-relaxed text-white/80">
                                Fitur ini sedang kami siapkan. Anda akan bisa melihat ringkasan
                                pendapatan per course, riwayat transaksi, dan mengajukan
                                penarikan dana langsung dari sini.
                            </p>
                            <div className="mt-5 flex flex-wrap gap-2">
                                <Button
                                    asChild
                                    className="rounded-xl bg-white text-brand-700 hover:bg-brand-50"
                                >
                                    <Link href="/admin/courses">
                                        Lihat Course Saya
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20"
                                    disabled
                                >
                                    <Bell className="mr-1.5 size-4" />
                                    Beri tahu saya
                                </Button>
                            </div>
                        </div>

                        <div className="hidden md:flex md:justify-end">
                            <div className="relative">
                                <div className="grid size-44 place-items-center rounded-full bg-white/10 backdrop-blur">
                                    <Wallet className="size-20 text-white/90" />
                                </div>
                                <div className="absolute -top-2 -right-2 grid size-12 place-items-center rounded-full bg-amber-400 text-amber-900 shadow-lg">
                                    <Banknote className="size-6" />
                                </div>
                                <div className="absolute -bottom-2 -left-2 grid size-12 place-items-center rounded-full bg-emerald-400 text-emerald-900 shadow-lg">
                                    <TrendingUp className="size-6" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <PreviewCard
                        title="Ringkasan Pendapatan"
                        items={['Pendapatan bulan ini', 'Total all-time', 'Dana siap ditarik']}
                    />
                    <PreviewCard
                        title="Riwayat Transaksi"
                        items={['Tanggal & nomor order', 'Course terkait', 'Nominal & status']}
                    />
                    <PreviewCard
                        title="Penarikan Dana"
                        items={['Pilih bank tujuan', 'Minimum penarikan', 'Tracking status']}
                    />
                </div>
            </div>
        </>
    );
}

function PreviewCard({ title, items }: { title: string; items: string[] }) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/40 p-5">
            <h3 className="text-[13px] font-bold text-slate-700">{title}</h3>
            <ul className="mt-2 space-y-1.5 text-[12.5px] text-slate-500">
                {items.map((i) => (
                    <li key={i} className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-slate-400" />
                        {i}
                    </li>
                ))}
            </ul>
        </div>
    );
}
