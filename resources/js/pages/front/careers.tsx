import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Briefcase,
    Building2,
    Coffee,
    Globe2,
    GraduationCap,
    HeartHandshake,
    Laptop,
    MapPin,
    Sparkles,
    Stethoscope,
    Wallet,
} from 'lucide-react';
import { PageHeader } from '@/components/front/page-header';

type Position = {
    title: string;
    department: string;
    location: string;
    type: string;
    description: string;
};

const BENEFITS = [
    {
        icon: Wallet,
        title: 'Kompensasi Kompetitif',
        desc: 'Gaji di atas market + bonus performa kuartalan.',
        color: 'bg-emerald-50 text-emerald-700',
    },
    {
        icon: Laptop,
        title: 'Remote-Friendly',
        desc: 'Fleksibel WFH/WFO dengan tunjangan internet & coworking.',
        color: 'bg-brand-50 text-brand-700',
    },
    {
        icon: Stethoscope,
        title: 'Asuransi Kesehatan',
        desc: 'BPJS + asuransi swasta untuk Anda & keluarga inti.',
        color: 'bg-rose-50 text-rose-700',
    },
    {
        icon: GraduationCap,
        title: 'Belajar Tanpa Batas',
        desc: 'Akses gratis semua kursus Learnpath + budget belajar tahunan.',
        color: 'bg-violet-50 text-violet-700',
    },
    {
        icon: Coffee,
        title: 'Cuti Fleksibel',
        desc: '14 hari cuti tahunan + work-from-anywhere 2 minggu/tahun.',
        color: 'bg-amber-50 text-amber-700',
    },
    {
        icon: HeartHandshake,
        title: 'Stock Option Plan',
        desc: 'Karyawan tetap eligible mendapat ESOP setelah 1 tahun.',
        color: 'bg-sky-50 text-sky-700',
    },
];

const VALUES = [
    {
        title: 'Learner First',
        desc: 'Setiap keputusan diukur dari dampak ke learner & klien.',
    },
    {
        title: 'Bias to Action',
        desc: 'Ship cepat, iterasi cepat, belajar dari data nyata.',
    },
    {
        title: 'Ownership',
        desc: 'Setiap orang adalah owner — bukan sekadar eksekutor task.',
    },
    {
        title: 'Kindness',
        desc: 'Kritik tajam pada ide, lembut pada manusia.',
    },
];

export default function CareersPage({ positions }: { positions: Position[] }) {
    const grouped = positions.reduce<Record<string, Position[]>>((acc, p) => {
        acc[p.department] = acc[p.department] || [];
        acc[p.department].push(p);

        return acc;
    }, {});

    return (
        <>
            <Head title="Karier · Learnpath" />

            <PageHeader
                eyebrow="Karier"
                title="Bangun masa depan pembelajaran Indonesia bersama kami"
                description="Kami sedang merekrut talenta hebat di engineering, product, content, dan growth untuk mempercepat misi Learnpath."
                breadcrumbs={[
                    { label: 'Beranda', href: '/' },
                    { label: 'Karier' },
                ]}
                actions={
                    <a
                        href="#openings"
                        className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-brand-700 transition hover:-translate-y-0.5 hover:bg-brand-50"
                    >
                        Lihat Lowongan <ArrowRight className="size-4" />
                    </a>
                }
            />

            <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
                {/* Stats strip */}
                <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-slate-200 ring-1 ring-slate-200 sm:grid-cols-4">
                    {[
                        { label: 'Karyawan saat ini', value: '48' },
                        { label: 'Negara', value: '3' },
                        { label: 'Tahun didirikan', value: '2024' },
                        { label: 'Funding', value: 'Seed' },
                    ].map((s) => (
                        <div key={s.label} className="bg-white p-6 text-center">
                            <div className="text-[26px] font-extrabold tracking-tight text-brand-700">
                                {s.value}
                            </div>
                            <div className="mt-1 text-[12px] text-slate-500">
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Values */}
                <div className="mt-20">
                    <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-[10.5px] font-bold tracking-[0.14em] text-brand-700 uppercase">
                        Cara kami bekerja
                    </span>
                    <h2 className="mt-3 max-w-2xl text-[26px] font-extrabold tracking-tight text-slate-900 sm:text-[32px]">
                        Empat values yang menjadi kompas tim
                    </h2>
                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {VALUES.map((v, idx) => (
                            <div
                                key={v.title}
                                className="rounded-2xl bg-white p-6 ring-1 ring-slate-200"
                            >
                                <div className="text-[12px] font-bold tracking-[0.14em] text-brand-700">
                                    0{idx + 1}
                                </div>
                                <h3 className="mt-2 text-[17px] font-bold tracking-tight text-slate-900">
                                    {v.title}
                                </h3>
                                <p className="mt-2 text-[13.5px] leading-relaxed text-slate-600">
                                    {v.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Benefits */}
                <div className="mt-20">
                    <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-[10.5px] font-bold tracking-[0.14em] text-brand-700 uppercase">
                        Benefit & Perks
                    </span>
                    <h2 className="mt-3 max-w-2xl text-[26px] font-extrabold tracking-tight text-slate-900 sm:text-[32px]">
                        Kami investasi pada orang-orang terbaik
                    </h2>
                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {BENEFITS.map((b) => (
                            <div
                                key={b.title}
                                className="flex items-start gap-4 rounded-2xl bg-white p-6 ring-1 ring-slate-200"
                            >
                                <span
                                    className={`grid size-11 shrink-0 place-items-center rounded-xl ${b.color}`}
                                >
                                    <b.icon className="size-5" />
                                </span>
                                <div>
                                    <h3 className="text-[15px] font-bold tracking-tight text-slate-900">
                                        {b.title}
                                    </h3>
                                    <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
                                        {b.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Open positions */}
                <div id="openings" className="mt-20 scroll-mt-24">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-[10.5px] font-bold tracking-[0.14em] text-brand-700 uppercase">
                                Lowongan Terbuka
                            </span>
                            <h2 className="mt-3 text-[26px] font-extrabold tracking-tight text-slate-900 sm:text-[32px]">
                                {positions.length} posisi tersedia
                            </h2>
                        </div>
                        <Link
                            href="mailto:careers@learnpath.id"
                            className="text-[13px] font-semibold text-brand-700 hover:underline"
                        >
                            Kirim CV spontan →
                        </Link>
                    </div>

                    <div className="mt-8 space-y-8">
                        {Object.entries(grouped).map(([dept, items]) => (
                            <div key={dept}>
                                <h3 className="mb-3 inline-flex items-center gap-2 text-[12.5px] font-bold tracking-[0.14em] text-slate-500 uppercase">
                                    <Briefcase className="size-3.5" /> {dept}
                                </h3>
                                <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                                    {items.map((pos) => (
                                        <li
                                            key={pos.title}
                                            className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-[15.5px] font-bold text-slate-900">
                                                    {pos.title}
                                                </h4>
                                                <p className="mt-1 text-[13px] text-slate-600">
                                                    {pos.description}
                                                </p>
                                                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-slate-500">
                                                    <span className="inline-flex items-center gap-1">
                                                        <MapPin className="size-3.5" />
                                                        {pos.location}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <Building2 className="size-3.5" />
                                                        {pos.department}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <Globe2 className="size-3.5" />
                                                        {pos.type}
                                                    </span>
                                                </div>
                                            </div>
                                            <a
                                                href={`mailto:careers@learnpath.id?subject=Apply: ${pos.title}`}
                                                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-700"
                                            >
                                                Lamar <ArrowRight className="size-4" />
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* No match CTA */}
                <div className="mt-16 rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-8 text-center text-white sm:p-12">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10.5px] font-bold tracking-[0.14em] text-white uppercase ring-1 ring-white/20">
                        <Sparkles className="size-3" /> Open Application
                    </span>
                    <h2 className="mt-3 text-[24px] font-extrabold tracking-tight sm:text-[28px]">
                        Tidak menemukan posisi yang cocok?
                    </h2>
                    <p className="mx-auto mt-2 max-w-xl text-[14px] text-white/85">
                        Kirim CV dan ceritakan kontribusi yang ingin Anda berikan.
                        Kami akan menghubungi bila ada posisi yang relevan.
                    </p>
                    <a
                        href="mailto:careers@learnpath.id"
                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-brand-700 transition hover:-translate-y-0.5 hover:bg-brand-50"
                    >
                        Kirim CV ke careers@learnpath.id{' '}
                        <ArrowRight className="size-4" />
                    </a>
                </div>
            </div>
        </>
    );
}
