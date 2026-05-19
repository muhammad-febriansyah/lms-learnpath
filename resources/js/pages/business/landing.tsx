import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    BarChart3,
    BookOpen,
    Building2,
    CheckCircle2,
    Sparkles,
    Target,
    Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

type Props = {
    pricePerSeat: number;
    minSeats: number;
    maxSeats: number;
};

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

const FEATURES = [
    {
        icon: BookOpen,
        title: 'Akses semua course library',
        description: 'Karyawan Anda bisa mengikuti semua course di Learnpath tanpa biaya tambahan.',
    },
    {
        icon: Users,
        title: 'Manajemen karyawan terpusat',
        description: 'Undang karyawan via email atau upload CSV, kelola akses dari satu dashboard HR.',
    },
    {
        icon: Target,
        title: 'Skill Matrix per jabatan',
        description: 'Set target kompetensi per posisi, lacak gap, dan dapatkan rekomendasi training otomatis.',
    },
    {
        icon: BarChart3,
        title: 'Laporan progress real-time',
        description: 'Pantau penyelesaian course, hasil assessment, dan sertifikat karyawan Anda.',
    },
    {
        icon: Award,
        title: 'Sertifikat terverifikasi',
        description: 'Setiap karyawan dapat sertifikat dengan kode verifikasi unik setelah menyelesaikan course.',
    },
    {
        icon: Sparkles,
        title: 'OJT & Supervisor Review',
        description: 'Supervisor bisa input penilaian on-the-job training dan review kompetensi bawahan.',
    },
];

const BENEFITS = [
    'Akses unlimited semua course library',
    'Dashboard khusus untuk HR / admin perusahaan',
    'Undang karyawan bulk via CSV',
    'Skill matrix per jabatan + analisis gap',
    'Laporan progress & sertifikat real-time',
    'Support prioritas dari tim Learnpath',
];

export default function BusinessLanding({ pricePerSeat, minSeats, maxSeats }: Props) {
    return (
        <>
            <Head title="Learnpath untuk Perusahaan" />
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
                <nav className="border-b border-slate-100 bg-white/80 backdrop-blur">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <Link href="/" className="text-[18px] font-extrabold text-brand-700">
                            Learnpath
                        </Link>
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline" className="rounded-xl">
                                <Link href="/login">Masuk</Link>
                            </Button>
                            <Button asChild className="rounded-xl bg-brand-600 hover:bg-brand-700">
                                <Link href="/business/register">Daftar Sekarang</Link>
                            </Button>
                        </div>
                    </div>
                </nav>

                {/* Hero */}
                <section className="relative overflow-hidden">
                    <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
                        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                            <div>
                                <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[11.5px] font-bold tracking-wider text-brand-700 uppercase">
                                    <Building2 className="size-3.5" />
                                    Learnpath for Business
                                </div>
                                <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                                    Latih seluruh karyawan dengan{' '}
                                    <span className="bg-gradient-to-r from-brand-600 to-brand-600 bg-clip-text text-transparent">
                                        satu paket seat
                                    </span>
                                </h1>
                                <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-slate-600">
                                    Beli paket seat sekali, undang karyawan Anda, dan biarkan mereka
                                    mengakses semua course Learnpath. Kelola progress, sertifikat, dan skill
                                    matrix dari satu dashboard HR.
                                </p>

                                <div className="mt-6 flex flex-wrap items-center gap-3">
                                    <Button
                                        asChild
                                        className="rounded-xl bg-brand-600 px-6 py-6 text-[15px] hover:bg-brand-700"
                                    >
                                        <Link href="/business/register">
                                            Mulai dari {formatRupiah(pricePerSeat)} / seat
                                            <ArrowRight className="ml-2 size-4" />
                                        </Link>
                                    </Button>
                                    <a
                                        href="#features"
                                        className="text-[13.5px] font-semibold text-brand-600 hover:text-brand-700"
                                    >
                                        Lihat fitur lengkap →
                                    </a>
                                </div>

                                <div className="mt-6 flex items-center gap-4 text-[12px] text-slate-500">
                                    <div className="inline-flex items-center gap-1.5">
                                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                                        Tanpa kontrak panjang
                                    </div>
                                    <div className="inline-flex items-center gap-1.5">
                                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                                        Setup &lt; 10 menit
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 p-8 text-white shadow-2xl">
                                <div className="text-[11.5px] font-bold tracking-wider uppercase opacity-80">
                                    Hitung Estimasi
                                </div>
                                <div className="mt-2 text-[42px] font-extrabold tabular-nums leading-none">
                                    {formatRupiah(pricePerSeat)}
                                </div>
                                <div className="mt-1 text-[13px] opacity-80">per seat / karyawan</div>

                                <div className="mt-6 space-y-2 border-t border-white/20 pt-6">
                                    {[
                                        [10, 'Tim kecil'],
                                        [50, 'Tim menengah'],
                                        [200, 'Perusahaan'],
                                    ].map(([qty, label]) => (
                                        <div
                                            key={qty as number}
                                            className="flex items-center justify-between gap-3 rounded-xl bg-white/10 px-4 py-3"
                                        >
                                            <div>
                                                <div className="text-[13px] font-bold">
                                                    {qty} seat
                                                </div>
                                                <div className="text-[10.5px] opacity-70">{label}</div>
                                            </div>
                                            <div className="text-[16px] font-extrabold tabular-nums">
                                                {formatRupiah((qty as number) * pricePerSeat)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <p className="mt-4 text-[11px] opacity-70">
                                    Minimum {minSeats} seat, maksimum {maxSeats} seat per order.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section id="features" className="border-y border-slate-100 bg-white py-16">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="text-center">
                            <div className="text-[11.5px] font-bold tracking-wider text-brand-600 uppercase">
                                Fitur
                            </div>
                            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                                Semua yang Anda butuhkan untuk{' '}
                                <span className="text-brand-600">L&amp;D modern</span>
                            </h2>
                        </div>

                        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {FEATURES.map((f) => (
                                <div
                                    key={f.title}
                                    className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 transition-shadow hover:shadow-md"
                                >
                                    <div className="grid size-11 place-items-center rounded-xl bg-brand-600 text-white">
                                        <f.icon className="size-5" />
                                    </div>
                                    <h3 className="mt-4 text-[15px] font-bold text-slate-900">
                                        {f.title}
                                    </h3>
                                    <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
                                        {f.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* What's included */}
                <section className="py-16">
                    <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2 lg:items-center">
                        <div>
                            <div className="text-[11.5px] font-bold tracking-wider text-brand-600 uppercase">
                                Yang Anda dapatkan
                            </div>
                            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                                Paket seat = akses penuh
                            </h2>
                            <p className="mt-3 text-[14.5px] text-slate-600">
                                1 seat = 1 karyawan dengan akses unlimited ke semua course di Learnpath
                                Library.
                            </p>
                            <ul className="mt-6 space-y-2">
                                {BENEFITS.map((b) => (
                                    <li key={b} className="flex items-start gap-2.5">
                                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                                        <span className="text-[13.5px] text-slate-700">{b}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button
                                asChild
                                className="mt-6 rounded-xl bg-brand-600 px-6 py-5 hover:bg-brand-700"
                            >
                                <Link href="/business/register">
                                    Daftar sekarang
                                    <ArrowRight className="ml-2 size-4" />
                                </Link>
                            </Button>
                        </div>
                        <div className="rounded-2xl bg-slate-900 p-8 text-white">
                            <div className="text-[11.5px] font-bold tracking-wider opacity-70 uppercase">
                                Studi Kasus
                            </div>
                            <blockquote className="mt-3 text-[16px] leading-relaxed">
                                "Kami onboarding 80 karyawan baru cuma butuh 2 hari. Skill matrix-nya
                                kebantu banget buat tracking pelatihan per departemen."
                            </blockquote>
                            <div className="mt-6 flex items-center gap-3">
                                <div className="grid size-10 place-items-center rounded-full bg-brand-500 text-[12px] font-bold">
                                    AR
                                </div>
                                <div>
                                    <div className="text-[13px] font-bold">Anita Ratnasari</div>
                                    <div className="text-[11px] opacity-70">Head of L&amp;D · PT Sinergi</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-gradient-to-br from-brand-600 to-brand-700 py-16 text-white">
                    <div className="mx-auto max-w-3xl px-6 text-center">
                        <h2 className="text-3xl font-extrabold tracking-tight">
                            Mulai upskill tim Anda hari ini
                        </h2>
                        <p className="mt-3 text-[15px] opacity-90">
                            Beli paket sekali, undang karyawan, langsung jalan. Tidak perlu kontrak
                            tahunan.
                        </p>
                        <Button
                            asChild
                            className="mt-6 rounded-xl bg-white px-6 py-5 text-brand-700 hover:bg-slate-50"
                        >
                            <Link href="/business/register">
                                Daftar Sekarang
                                <ArrowRight className="ml-2 size-4" />
                            </Link>
                        </Button>
                    </div>
                </section>

                <footer className="border-t border-slate-100 bg-white py-8">
                    <div className="mx-auto max-w-6xl px-6 text-center text-[12px] text-slate-500">
                        © 2026 Learnpath. All rights reserved.
                    </div>
                </footer>
            </div>
        </>
    );
}
