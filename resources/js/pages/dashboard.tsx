import { Head } from '@inertiajs/react';
import { useState  } from 'react';
import type {ComponentType} from 'react';
import { ActivityChart, Donut, ProgressBar, Spark } from '@/components/learnpath-charts';
import {
    IconArrowDn,
    IconArrowUp,
    IconBadge,
    IconBolt,
    IconBook,
    IconCheck,
    IconChevR,
    IconClock,
    IconDot,
    IconDownload,
    IconFilter,
    IconPlus,
    IconSparkle,
    IconUpRight,
    IconUsers,
    IconWallet,
} from '@/components/learnpath-icons';
import { dashboard } from '@/routes';

type IconCmp = ComponentType<{ size?: number; className?: string }>;

type Kpi = {
    label: string;
    value: string;
    delta: string;
    up: boolean;
    sub: string;
    spark: number[];
    color: string;
    tint: string;
    text: string;
    icon: IconCmp;
};

const KPIS: Kpi[] = [
    {
        label: 'Total Siswa',
        value: '18.426',
        delta: '+12,4%',
        up: true,
        sub: 'vs 30 hari sebelumnya',
        spark: [12, 14, 13, 17, 16, 19, 18, 22, 21, 24, 23, 26, 28, 27, 30],
        color: '#12237D',
        tint: 'bg-brand-50',
        text: 'text-brand-600',
        icon: IconUsers,
    },
    {
        label: 'Kursus Aktif',
        value: '128',
        delta: '+6 baru',
        up: true,
        sub: 'minggu ini',
        spark: [4, 5, 5, 6, 7, 6, 7, 8, 9, 8, 9, 10, 11, 10, 12],
        color: '#0EA5A0',
        tint: 'bg-teal-50',
        text: 'text-teal-600',
        icon: IconBook,
    },
    {
        label: 'Pendapatan',
        value: 'Rp 482 Jt',
        delta: '+8,1%',
        up: true,
        sub: 'MRR Mei 2026',
        spark: [22, 25, 24, 28, 26, 30, 29, 33, 32, 36, 34, 38, 37, 40, 42],
        color: '#7C3AED',
        tint: 'bg-brand-50',
        text: 'text-brand-600',
        icon: IconWallet,
    },
    {
        label: 'Tingkat Selesai',
        value: '76,3%',
        delta: '-1,8%',
        up: false,
        sub: 'Target 80%',
        spark: [70, 72, 71, 74, 73, 75, 76, 78, 77, 78, 77, 76, 77, 76, 76],
        color: '#F59E0B',
        tint: 'bg-amber-50',
        text: 'text-amber-600',
        icon: IconBadge,
    },
];

function buildSeries(n: number, base: number, amp: number, seed = 1): number[] {
    const out: number[] = [];
    let v = base;

    for (let i = 0; i < n; i++) {
        v += (Math.sin(i * 0.5 + seed) + (i % 5 === 0 ? 1.2 : 0)) * amp - amp * 0.5;
        out.push(Math.max(20, Math.round(v + amp * Math.sin(i * 0.9 + seed))));
    }

    return out;
}

const SERIES_30 = {
    A: buildSeries(30, 320, 80, 1.4),
    B: buildSeries(30, 240, 60, 0.6),
    labels: Array.from({ length: 30 }, (_, i) => `${i + 1} Mei`),
};
const SERIES_7 = {
    A: buildSeries(7, 380, 60, 2.1),
    B: buildSeries(7, 280, 40, 1.1),
    labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
};
const SERIES_90 = {
    A: buildSeries(90, 280, 90, 3.3),
    B: buildSeries(90, 210, 70, 2.7),
    labels: Array.from({ length: 90 }, (_, i) => `H-${90 - i}`),
};

const CATEGORIES = [
    { label: 'Pengembangan Web', value: 4820, color: '#12237D' },
    { label: 'Data & AI', value: 3140, color: '#5663C2' },
    { label: 'Desain Produk', value: 2210, color: '#0EA5A0' },
    { label: 'Bisnis & Karier', value: 1860, color: '#F59E0B' },
    { label: 'Bahasa & Soft Skill', value: 1396, color: '#94A3B8' },
];

const COURSES = [
    {
        title: 'Fullstack JavaScript dari Nol',
        cat: 'Web Dev',
        instr: 'Ayu Pratiwi',
        students: 1843,
        completion: 82,
        revenue: 'Rp 92 Jt',
        status: 'Aktif',
        cover: 'from-brand-500 to-brand-700',
    },
    {
        title: 'Machine Learning untuk Pemula',
        cat: 'Data & AI',
        instr: 'Reza Mahendra',
        students: 1521,
        completion: 71,
        revenue: 'Rp 76 Jt',
        status: 'Aktif',
        cover: 'from-brand-500 to-brand-600',
    },
    {
        title: 'UI/UX Foundations',
        cat: 'Desain',
        instr: 'Nadia Sari',
        students: 1287,
        completion: 88,
        revenue: 'Rp 64 Jt',
        status: 'Aktif',
        cover: 'from-teal-500 to-emerald-600',
    },
    {
        title: 'Product Management 101',
        cat: 'Bisnis',
        instr: 'Bagas Wijaya',
        students: 942,
        completion: 64,
        revenue: 'Rp 48 Jt',
        status: 'Aktif',
        cover: 'from-amber-500 to-orange-600',
    },
    {
        title: 'Bahasa Inggris untuk Karier',
        cat: 'Bahasa',
        instr: 'Sinta Larasati',
        students: 812,
        completion: 79,
        revenue: 'Rp 32 Jt',
        status: 'Draf',
        cover: 'from-rose-500 to-pink-600',
    },
];

const STUDENTS = [
    { name: 'Rifqi Andika', email: 'rifqi@email.com', plan: 'Pro', joined: '5 menit lalu', online: true, color: 'from-brand-300 to-brand-500' },
    { name: 'Maya Anggraini', email: 'maya.a@email.com', plan: 'Basic', joined: '12 menit lalu', online: true, color: 'from-emerald-300 to-emerald-500' },
    { name: 'Dimas Prabowo', email: 'dimas.p@email.com', plan: 'Pro', joined: '1 jam lalu', online: false, color: 'from-amber-300 to-amber-500' },
    { name: 'Kirana Putri', email: 'kirana@email.com', plan: 'Team', joined: '2 jam lalu', online: true, color: 'from-brand-300 to-brand-500' },
    { name: 'Yoga Adi', email: 'yoga.adi@email.com', plan: 'Basic', joined: '3 jam lalu', online: false, color: 'from-rose-300 to-rose-500' },
];

const INSTRUCTORS = [
    { name: 'Ayu Pratiwi', role: 'Senior Web Dev', students: 4820, rating: 4.9, color: 'from-brand-400 to-brand-600' },
    { name: 'Reza Mahendra', role: 'ML Engineer', students: 3140, rating: 4.8, color: 'from-brand-400 to-brand-600' },
    { name: 'Nadia Sari', role: 'Product Designer', students: 2210, rating: 4.9, color: 'from-teal-400 to-emerald-600' },
];

const INITIAL_TASKS = [
    { label: 'Tinjau pengajuan kursus baru', meta: '4 kursus', done: false },
    { label: 'Setujui penarikan dana instruktur', meta: 'Rp 18,4 Jt', done: false },
    { label: 'Balas tiket dukungan prioritas', meta: '7 tiket', done: false },
    { label: 'Publikasi pengumuman cohort Juni', meta: 'Draf siap', done: true },
];

const COHORTS = [
    { name: 'Cohort Bootcamp Frontend #14', date: '20 Mei 2026', time: '19:00 WIB', seats: '32 / 40', pct: 80, color: 'bg-brand-600', barColor: '#12237D' },
    { name: 'Workshop Prompt Engineering', date: '22 Mei 2026', time: '20:00 WIB', seats: '78 / 120', pct: 65, color: 'bg-brand-600', barColor: '#7C3AED' },
    { name: 'Live Q&A Data Career Path', date: '25 Mei 2026', time: '19:30 WIB', seats: '210 / 300', pct: 70, color: 'bg-emerald-600', barColor: '#10B981' },
];

export default function Dashboard() {
    return (
        <>
            <Head title="Dasbor" />
            <div className="space-y-5">
                <Hero />

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {KPIS.map((k) => (
                        <KpiCard key={k.label} k={k} />
                    ))}
                </section>

                <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                        <ActivityCard />
                    </div>
                    <CategoryCard />
                </section>

                <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                        <CoursesCard />
                    </div>
                    <StudentsCard />
                </section>

                <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                    <TasksCard />
                    <InstructorsCard />
                    <CohortsCard />
                </section>

                <div className="pt-2 pb-1 text-center text-[12px] text-slate-400">
                    © 2026 Learnpath · Admin v2.4
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};

function Hero() {
    return (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white">
            <div className="absolute -top-20 -right-16 size-72 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
            <div className="absolute -right-32 -bottom-24 size-80 rounded-full bg-brand-300/30 blur-3xl" aria-hidden="true" />

            <div className="relative grid grid-cols-1 items-center gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:p-10">
                <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold tracking-[0.16em] ring-1 ring-white/20 uppercase backdrop-blur">
                        <IconSparkle size={12} /> AI Insight · Kamis, 14 Mei 2026
                    </div>
                    <h1 className="mt-3 text-[26px] leading-tight font-extrabold tracking-tight sm:text-[32px] lg:text-[36px]">
                        Selamat pagi, Admin
                    </h1>
                    <p className="mt-2 max-w-xl text-[14.5px] text-pretty text-white/80 sm:text-[15px]">
                        Pendaftaran <span className="font-semibold text-white">naik 18%</span> minggu ini — terutama
                        dari kategori <span className="font-semibold text-white">Data &amp; AI</span>. Pertimbangkan
                        jadwal cohort tambahan di bulan Juni.
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                        <button className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2.5 text-[13px] font-semibold text-brand-700 shadow-sm hover:bg-brand-50">
                            <IconPlus size={14} /> Tambah Kursus
                        </button>
                        <button className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2.5 text-[13px] font-semibold text-white ring-1 ring-white/20 hover:bg-white/15">
                            <IconBolt size={14} /> Lihat rekomendasi
                        </button>
                        <button className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-white/90 hover:bg-white/10">
                            <IconFilter size={14} /> Filter periode
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:min-w-[320px]">
                    <HeroStat label="Pertumbuhan" value="+18,2%" trend="vs minggu lalu" pct={72} />
                    <HeroStat label="Retensi 30H" value="84,7%" trend="target 85%" pct={84} />
                    <HeroStat label="Pendaftaran" value="1.284" trend="hari ini" pct={56} accent />
                    <HeroStat label="Sesi live" value="12" trend="minggu ini" pct={40} accent />
                </div>
            </div>
        </section>
    );
}

function HeroStat({
    label,
    value,
    trend,
    pct,
    accent = false,
}: {
    label: string;
    value: string;
    trend: string;
    pct: number;
    accent?: boolean;
}) {
    return (
        <div className="rounded-2xl bg-white/10 p-3.5 ring-1 ring-white/15 backdrop-blur">
            <div className="text-[10.5px] font-semibold tracking-[0.14em] text-white/70 uppercase">{label}</div>
            <div className="mt-1 text-[20px] font-extrabold tracking-tight">{value}</div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/15">
                <div
                    className={'h-full rounded-full ' + (accent ? 'bg-emerald-300' : 'bg-white')}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <div className="mt-1.5 text-[11px] text-white/60">{trend}</div>
        </div>
    );
}

function KpiCard({ k }: { k: Kpi }) {
    const Icn = k.icon;

    return (
        <div className="group relative rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 transition-all duration-200 hover:-translate-y-0.5 hover:ring-slate-300">
            <div className="flex items-start justify-between">
                <div className={'grid size-11 place-items-center rounded-xl ' + k.tint + ' ' + k.text}>
                    <Icn size={20} />
                </div>
                <span
                    className={
                        'inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[11.5px] font-bold ' +
                        (k.up ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')
                    }
                >
                    {k.up ? <IconArrowUp size={11} /> : <IconArrowDn size={11} />} {k.delta}
                </span>
            </div>
            <div className="mt-4 text-[12.5px] text-slate-500">{k.label}</div>
            <div className="mt-0.5 text-[28px] font-extrabold tracking-tight text-slate-900 tabular-nums">
                {k.value}
            </div>
            <div className="mt-3 flex items-end justify-between gap-3">
                <div className="text-[11px] text-slate-400">{k.sub}</div>
                <Spark data={k.spark} color={k.color} />
            </div>
        </div>
    );
}

function ActivityCard() {
    const [range, setRange] = useState<'7H' | '30H' | '90H'>('30H');
    const data = range === '7H' ? SERIES_7 : range === '90H' ? SERIES_90 : SERIES_30;
    const total = data.A.reduce((a, b) => a + b, 0);
    const peak = Math.max(...data.A);
    const avg = Math.round(total / data.A.length);

    return (
        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div className="text-[15px] font-bold text-slate-900">Aktivitas Pembelajaran</div>
                    <div className="mt-0.5 text-[12.5px] text-slate-500">Jumlah sesi belajar harian</div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden items-center gap-3 text-[12px] text-slate-500 sm:flex">
                        <span className="inline-flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-brand-600" />
                            Periode ini
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-slate-400" />
                            Periode lalu
                        </span>
                    </div>
                    <div className="flex rounded-lg bg-slate-100 p-0.5 text-[12px] font-semibold">
                        {(['7H', '30H', '90H'] as const).map((r) => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                className={
                                    'rounded-md px-2.5 py-1 transition ' +
                                    (range === r
                                        ? 'bg-white text-brand-700 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700')
                                }
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-4">
                <StatPill label="Total sesi" value={total.toLocaleString('id-ID')} accent="text-brand-700" />
                <StatPill label="Puncak harian" value={peak.toLocaleString('id-ID')} accent="text-emerald-700" />
                <StatPill label="Rata-rata" value={avg.toLocaleString('id-ID')} accent="text-brand-700" />
            </div>

            <div className="mt-4">
                <ActivityChart seriesA={data.A} seriesB={data.B} labels={data.labels} />
            </div>
        </div>
    );
}

function StatPill({ label, value, accent }: { label: string; value: string; accent: string }) {
    return (
        <div className="rounded-xl bg-slate-50/70 px-3 py-2.5 ring-1 ring-slate-100">
            <div className="text-[10.5px] font-semibold tracking-[0.14em] text-slate-400 uppercase">{label}</div>
            <div className={'mt-0.5 text-[18px] font-extrabold tabular-nums ' + accent}>{value}</div>
        </div>
    );
}

function CategoryCard() {
    const total = CATEGORIES.reduce((a, c) => a + c.value, 0);

    return (
        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-[15px] font-bold text-slate-900">Distribusi Kategori</div>
                    <div className="mt-0.5 text-[12.5px] text-slate-500">Pendaftaran 30 hari terakhir</div>
                </div>
                <button className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-600 hover:text-brand-700">
                    Detail <IconUpRight size={12} />
                </button>
            </div>
            <div className="mt-4 grid place-items-center">
                <Donut segments={CATEGORIES} total={total} />
            </div>
            <ul className="mt-4 space-y-2.5">
                {CATEGORIES.map((c) => (
                    <li key={c.label} className="flex items-center gap-3 text-[13px]">
                        <span className="size-2.5 shrink-0 rounded-full" style={{ background: c.color }} />
                        <span className="flex-1 truncate text-slate-700">{c.label}</span>
                        <span className="text-slate-500 tabular-nums">{c.value.toLocaleString('id-ID')}</span>
                        <span className="w-10 text-right text-[12px] text-slate-400 tabular-nums">
                            {Math.round((c.value / total) * 100)}%
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function CoursesCard() {
    const [tab, setTab] = useState('Semua');

    return (
        <div className="overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                    <div className="text-[15px] font-bold text-slate-900">Kursus Terpopuler</div>
                    <div className="mt-0.5 text-[12.5px] text-slate-500">
                        Berdasarkan jumlah siswa &amp; penyelesaian
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex rounded-lg bg-slate-100 p-0.5 text-[12px] font-semibold">
                        {['Semua', 'Web', 'Data', 'Desain'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={
                                    'rounded-md px-2.5 py-1 transition ' +
                                    (tab === t
                                        ? 'bg-white text-brand-700 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700')
                                }
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <button className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[12px] font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50">
                        <IconDownload size={13} /> Ekspor
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-[13.5px]">
                    <thead>
                        <tr className="bg-slate-50/60 text-left text-[11px] tracking-wider text-slate-400 uppercase">
                            <th className="w-10 px-5 py-3 font-semibold">#</th>
                            <th className="px-5 py-3 font-semibold">Kursus</th>
                            <th className="px-5 py-3 font-semibold">Instruktur</th>
                            <th className="px-5 py-3 font-semibold">Siswa</th>
                            <th className="w-[200px] px-5 py-3 font-semibold">Penyelesaian</th>
                            <th className="px-5 py-3 font-semibold">Pendapatan</th>
                            <th className="px-5 py-3 font-semibold">Status</th>
                            <th className="w-12 px-5 py-3 font-semibold" />
                        </tr>
                    </thead>
                    <tbody>
                        {COURSES.map((c, i) => (
                            <tr key={i} className="border-t border-slate-100 transition hover:bg-slate-50/50">
                                <td className="px-5 py-4 font-semibold text-slate-400 tabular-nums">
                                    {String(i + 1).padStart(2, '0')}
                                </td>
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={
                                                'grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br font-bold text-white ' +
                                                c.cover
                                            }
                                        >
                                            {c.title[0]}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="max-w-[260px] truncate font-semibold text-slate-900">
                                                {c.title}
                                            </div>
                                            <div className="inline-flex items-center gap-1.5 text-[11.5px] text-slate-500">
                                                <span className="inline-block size-1.5 rounded-full bg-slate-300" />
                                                {c.cat}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-slate-700">{c.instr}</td>
                                <td className="px-5 py-4 text-slate-700 tabular-nums">
                                    {c.students.toLocaleString('id-ID')}
                                </td>
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-2.5">
                                        <ProgressBar value={c.completion} />
                                        <span className="w-9 text-right text-[12px] font-semibold text-slate-700 tabular-nums">
                                            {c.completion}%
                                        </span>
                                    </div>
                                </td>
                                <td className="px-5 py-4 font-semibold text-slate-900 tabular-nums">{c.revenue}</td>
                                <td className="px-5 py-4">
                                    <span
                                        className={
                                            'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11.5px] font-semibold ' +
                                            (c.status === 'Aktif'
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'bg-amber-50 text-amber-700')
                                        }
                                    >
                                        <span
                                            className={
                                                'size-1.5 rounded-full ' +
                                                (c.status === 'Aktif' ? 'bg-emerald-500' : 'bg-amber-500')
                                            }
                                        />
                                        {c.status}
                                    </span>
                                </td>
                                <td className="px-5 py-4">
                                    <button className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                                        <IconDot size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5 text-[12px] text-slate-500">
                <div>
                    Menampilkan <span className="font-semibold text-slate-700">5</span> dari 128 kursus
                </div>
                <a
                    href="#"
                    className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700"
                >
                    Lihat semua <IconChevR size={12} />
                </a>
            </div>
        </div>
    );
}

function StudentsCard() {
    return (
        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-[15px] font-bold text-slate-900">Siswa Baru</div>
                    <div className="mt-0.5 text-[12.5px] text-slate-500">5 pendaftar terakhir</div>
                </div>
                <a
                    href="#"
                    className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-600 hover:text-brand-700"
                >
                    Lihat semua <IconChevR size={12} />
                </a>
            </div>
            <ul className="mt-4 space-y-1">
                {STUDENTS.map((s) => (
                    <li
                        key={s.email}
                        className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-slate-50"
                    >
                        <div className="relative shrink-0">
                            <div
                                className={
                                    'grid size-10 place-items-center rounded-full bg-gradient-to-br text-[12px] font-bold text-white ' +
                                    s.color
                                }
                            >
                                {s.name
                                    .split(' ')
                                    .map((p) => p[0])
                                    .slice(0, 2)
                                    .join('')}
                            </div>
                            {s.online && (
                                <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-[13.5px] font-semibold text-slate-900">{s.name}</div>
                            <div className="truncate text-[11.5px] text-slate-500">{s.email}</div>
                        </div>
                        <div className="shrink-0 text-right">
                            <div
                                className={
                                    'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold ' +
                                    (s.plan === 'Pro'
                                        ? 'bg-brand-50 text-brand-600'
                                        : s.plan === 'Team'
                                          ? 'bg-brand-50 text-brand-600'
                                          : 'bg-slate-100 text-slate-600')
                                }
                            >
                                {s.plan}
                            </div>
                            <div className="mt-0.5 text-[10.5px] text-slate-400">{s.joined}</div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function TasksCard() {
    const [tasks, setTasks] = useState(INITIAL_TASKS);
    function toggle(i: number) {
        setTasks((ts) => ts.map((t, idx) => (idx === i ? { ...t, done: !t.done } : t)));
    }
    const done = tasks.filter((t) => t.done).length;

    return (
        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-[15px] font-bold text-slate-900">Tugas Hari Ini</div>
                    <div className="mt-0.5 text-[12.5px] text-slate-500">
                        {done} dari {tasks.length} selesai
                    </div>
                </div>
                <button className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100">
                    <IconPlus size={16} />
                </button>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all"
                    style={{ width: `${(done / tasks.length) * 100}%` }}
                />
            </div>
            <ul className="mt-4 space-y-1">
                {tasks.map((t, i) => (
                    <li key={i}>
                        <button
                            onClick={() => toggle(i)}
                            className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-slate-50"
                        >
                            <span
                                className={
                                    'grid size-5 shrink-0 place-items-center rounded-md ring-1 transition ' +
                                    (t.done
                                        ? 'bg-brand-600 text-white ring-brand-600'
                                        : 'bg-white ring-slate-300')
                                }
                            >
                                {t.done && <IconCheck size={12} />}
                            </span>
                            <span
                                className={
                                    'flex-1 text-[13.5px] ' +
                                    (t.done ? 'text-slate-400 line-through' : 'text-slate-800')
                                }
                            >
                                {t.label}
                            </span>
                            <span className="text-[11.5px] text-slate-400">{t.meta}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function CohortsCard() {
    return (
        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-[15px] font-bold text-slate-900">Sesi Mendatang</div>
                    <div className="mt-0.5 text-[12.5px] text-slate-500">Cohort dan workshop live</div>
                </div>
                <a
                    href="#"
                    className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-600 hover:text-brand-700"
                >
                    Kalender <IconUpRight size={12} />
                </a>
            </div>
            <ul className="mt-4 space-y-2.5">
                {COHORTS.map((c, i) => (
                    <li
                        key={i}
                        className="rounded-xl p-3 ring-1 ring-slate-100 transition hover:ring-slate-200"
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={
                                    'grid size-11 shrink-0 place-items-center rounded-xl text-white ' + c.color
                                }
                            >
                                <IconClock size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="truncate text-[13.5px] font-semibold text-slate-900">{c.name}</div>
                                <div className="text-[11.5px] text-slate-500">
                                    {c.date} · {c.time}
                                </div>
                            </div>
                            <div className="shrink-0 text-right">
                                <div className="text-[12px] font-semibold text-slate-700 tabular-nums">{c.seats}</div>
                                <div className="text-[10.5px] tracking-wider text-slate-400 uppercase">Terisi</div>
                            </div>
                        </div>
                        <div className="mt-3">
                            <ProgressBar value={c.pct} color={c.barColor} />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function InstructorsCard() {
    return (
        <div className="rounded-2xl bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-[15px] font-bold text-slate-900">Instruktur Terbaik</div>
                    <div className="mt-0.5 text-[12.5px] text-slate-500">Rating &amp; jumlah siswa bulan ini</div>
                </div>
                <a
                    href="#"
                    className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-600 hover:text-brand-700"
                >
                    Semua <IconChevR size={12} />
                </a>
            </div>
            <ul className="mt-4 space-y-2">
                {INSTRUCTORS.map((p, i) => (
                    <li
                        key={p.name}
                        className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-slate-50"
                    >
                        <div className="relative shrink-0">
                            <div
                                className={
                                    'grid size-11 place-items-center rounded-xl bg-gradient-to-br font-bold text-white ' +
                                    p.color
                                }
                            >
                                {p.name
                                    .split(' ')
                                    .map((s) => s[0])
                                    .slice(0, 2)
                                    .join('')}
                            </div>
                            <div className="absolute -top-1.5 -left-1.5 grid size-5 place-items-center rounded-full bg-white text-[10px] font-bold text-slate-700 ring-1 ring-slate-200">
                                {i + 1}
                            </div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-[13.5px] font-semibold text-slate-900">{p.name}</div>
                            <div className="truncate text-[11.5px] text-slate-500">{p.role}</div>
                        </div>
                        <div className="shrink-0 text-right">
                            <div className="text-[13px] font-bold text-slate-900 tabular-nums">
                                {p.students.toLocaleString('id-ID')}
                            </div>
                            <div className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-amber-600">
                                <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor">
                                    <path d="M12 2 15 9l7 .8-5.2 4.9L18.2 22 12 18 5.8 22l1.4-7.3L2 9.8 9 9z" />
                                </svg>
                                {p.rating}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
