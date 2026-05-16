import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import {
    IconArrowR,
    IconBadge,
    IconBolt,
    IconBook,
    IconCap,
    IconChart,
    IconCheck,
    IconMessage,
    IconPlayFill,
    IconPlus,
    IconSparkle,
    IconStar,
    IconUsers,
    IconWallet,
} from '@/components/learnpath-icons';
import { dashboard, login, register } from '@/routes';

type WelcomeProps = { canRegister?: boolean };

const NAV_LINKS = [
    { href: '#features', label: 'Fitur' },
    { href: '#how', label: 'Cara Kerja' },
    { href: '#courses', label: 'Kursus' },
    { href: '#pricing', label: 'Harga' },
    { href: '#faq', label: 'FAQ' },
];

const FEATURES = [
    {
        icon: IconChart,
        title: 'Roadmap personal',
        desc: 'Jalur belajar tersusun otomatis berdasarkan tujuan karier dan level saat ini.',
        tint: 'bg-brand-50 text-brand-600',
    },
    {
        icon: IconSparkle,
        title: 'AI Tutor 24/7',
        desc: 'Tanya kapan saja — dapat penjelasan kontekstual lengkap dengan contoh kode.',
        tint: 'bg-violet-50 text-violet-600',
    },
    {
        icon: IconCap,
        title: 'Mentor bersertifikat',
        desc: 'Sesi 1-on-1 dengan praktisi industri dari perusahaan teknologi terkemuka.',
        tint: 'bg-emerald-50 text-emerald-600',
    },
    {
        icon: IconBolt,
        title: 'Sesi adaptif',
        desc: 'Jadwal & kesulitan menyesuaikan ritmemu — tidak pernah kepayahan, tidak pernah bosan.',
        tint: 'bg-amber-50 text-amber-600',
    },
    {
        icon: IconBadge,
        title: 'Sertifikat resmi',
        desc: 'Sertifikat terverifikasi blockchain, diakui 140+ mitra HR di Asia Tenggara.',
        tint: 'bg-rose-50 text-rose-600',
    },
    {
        icon: IconUsers,
        title: 'Komunitas cohort',
        desc: 'Belajar bareng dalam batch, diskusi mingguan, dan proyek kolaboratif.',
        tint: 'bg-teal-50 text-teal-600',
    },
];

const STEPS = [
    {
        n: '01',
        title: 'Tentukan tujuanmu',
        desc: 'Pilih peran impian — Frontend, Data Scientist, Product Designer, atau yang lain.',
        icon: IconCap,
    },
    {
        n: '02',
        title: 'Ikuti roadmap',
        desc: 'Materi tersusun otomatis dengan urutan yang masuk akal. Tidak perlu menebak.',
        icon: IconChart,
    },
    {
        n: '03',
        title: 'Lulus & buktikan',
        desc: 'Sertifikat + portfolio yang sudah direview mentor. Siap ditampilkan ke recruiter.',
        icon: IconBadge,
    },
];

const COURSE_CATS = [
    { name: 'Pengembangan Web', count: 48, hours: 320, color: 'from-brand-500 to-brand-700', icon: IconBook },
    { name: 'Data & AI', count: 36, hours: 280, color: 'from-violet-500 to-fuchsia-600', icon: IconChart },
    { name: 'Desain Produk', count: 24, hours: 190, color: 'from-teal-500 to-emerald-600', icon: IconBadge },
    { name: 'Bisnis & Karier', count: 18, hours: 140, color: 'from-amber-500 to-orange-600', icon: IconWallet },
    { name: 'Bahasa Inggris', count: 12, hours: 96, color: 'from-rose-500 to-pink-600', icon: IconMessage },
    { name: 'Soft Skills', count: 14, hours: 110, color: 'from-slate-500 to-slate-700', icon: IconUsers },
];

const STATS = [
    { v: '8.420+', l: 'Siswa aktif' },
    { v: '128', l: 'Kursus terkurasi' },
    { v: '94%', l: 'Tingkat penyelesaian' },
    { v: '4,9 / 5', l: 'Rating siswa' },
];

const TESTIMONIALS = [
    {
        name: 'Rifqi Andika',
        role: 'Frontend Engineer · Jakarta',
        text: 'Dari pemula ke kontributor open-source dalam 4 bulan. Roadmap-nya bikin saya nggak nebak-nebak lagi.',
        color: 'from-brand-300 to-brand-500',
    },
    {
        name: 'Maya Anggraini',
        role: 'Data Analyst · Surabaya',
        text: 'AI Tutor jadi penyelamat saat stuck malam-malam. Penjelasannya pas, tidak terlalu panjang, tidak terlalu pendek.',
        color: 'from-emerald-300 to-emerald-500',
    },
    {
        name: 'Dimas Prabowo',
        role: 'Product Designer · Bandung',
        text: 'Sertifikat Learnpath beneran dilihat recruiter. Diterima di 3 perusahaan dalam 6 minggu setelah lulus.',
        color: 'from-violet-300 to-violet-500',
    },
];

const PLANS = [
    {
        name: 'Basic',
        desc: 'Mulai eksplorasi tanpa biaya.',
        price: 'Rp 0',
        period: 'selamanya',
        cta: 'Mulai gratis',
        features: ['12 kursus gratis pilihan', 'AI Tutor terbatas (10/hari)', 'Sertifikat partisipasi', 'Dukungan komunitas'],
        popular: false,
    },
    {
        name: 'Pro',
        desc: 'Untuk yang serius berkembang.',
        price: 'Rp 199.000',
        period: '/bulan',
        cta: 'Coba 7 hari gratis',
        features: [
            'Akses 128+ kursus',
            'AI Tutor tanpa batas',
            'Sertifikat terverifikasi',
            'Sesi mentor 2x/bulan',
            'Review portfolio',
            'Komunitas cohort',
        ],
        popular: true,
    },
    {
        name: 'Team',
        desc: 'Untuk tim & perusahaan.',
        price: 'Rp 499.000',
        period: '/bulan / 5 user',
        cta: 'Hubungi sales',
        features: ['Semua di paket Pro', 'Dashboard admin', 'Analitik tim', 'SSO & SCIM', 'Manajer akun khusus'],
        popular: false,
    },
];

const FAQS = [
    {
        q: 'Apakah Learnpath cocok untuk pemula total?',
        a: 'Ya. Roadmap personal akan menyesuaikan level mulai dari nol — kami punya jalur khusus untuk yang belum pernah coding atau desain sama sekali.',
    },
    {
        q: 'Bagaimana cara kerja AI Tutor?',
        a: 'AI Tutor mengenali konteks materi dan progres belajarmu. Pertanyaan dijawab dengan referensi langsung ke pelajaran terkait, lengkap dengan contoh praktis.',
    },
    {
        q: 'Apakah sertifikat Learnpath diakui industri?',
        a: 'Sertifikat kami diverifikasi via blockchain dan diakui oleh 140+ mitra HR di Asia Tenggara. Banyak alumni diterima kerja dalam 6–12 minggu pasca-lulus.',
    },
    {
        q: 'Bisa batal langganan kapan saja?',
        a: 'Tentu. Tidak ada kontrak minimum. Batalkan dari pengaturan akun — akses berlanjut sampai akhir periode tagihan.',
    },
    {
        q: 'Apakah ada diskon untuk pelajar?',
        a: 'Ada diskon 40% untuk pelajar/mahasiswa aktif. Cukup verifikasi dengan email institusi atau kartu pelajar di pengaturan akun.',
    },
    {
        q: 'Bagaimana dukungan untuk paket Team?',
        a: 'Paket Team mendapat manajer akun khusus, onboarding tim, dan SLA respons dukungan 4 jam pada hari kerja.',
    },
];

const FOOTER_LINKS = [
    { title: 'Produk', links: ['Kursus', 'AI Tutor', 'Mentor', 'Sertifikat', 'Cohort'] },
    { title: 'Perusahaan', links: ['Tentang', 'Karier', 'Blog', 'Press kit', 'Kontak'] },
    { title: 'Sumber Daya', links: ['Bantuan', 'Komunitas', 'Status sistem', 'Roadmap publik', 'Changelog'] },
    { title: 'Legal', links: ['Ketentuan', 'Privasi', 'Cookie', 'Akreditasi', 'Keamanan'] },
];

export default function Welcome({ canRegister = true }: WelcomeProps) {
    const { auth } = usePage<{ auth: { user: { name: string } | null } }>().props;
    const isAuthed = !!auth?.user;
    const ctaHref = isAuthed ? dashboard().url : login().url;

    return (
        <>
            <Head title="Belajar terarah, karier tumbuh cepat" />
            <div className="flex min-h-screen flex-col bg-surface text-slate-800">
                <Nav isAuthed={isAuthed} canRegister={canRegister} />
                <main className="flex-1">
                    <Hero ctaHref={ctaHref} />
                    <LogosBar />
                    <Features />
                    <HowItWorks />
                    <Courses />
                    <AITutor ctaHref={ctaHref} />
                    <Stats />
                    <Testimonials />
                    <Pricing ctaHref={ctaHref} />
                    <FAQ />
                    <CTABanner ctaHref={ctaHref} />
                </main>
                <Footer />
            </div>
        </>
    );
}

function Nav({ isAuthed, canRegister }: { isAuthed: boolean; canRegister: boolean }) {
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/65">
            <div className="relative mx-auto flex h-[76px] max-w-7xl items-center gap-6 px-5 lg:px-8">
                <Link href="/" className="relative z-10 flex shrink-0 items-center gap-2.5">
                    <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white">
                        <AppLogoIcon className="size-5" />
                    </span>
                    <span className="text-[17px] font-extrabold tracking-tight text-slate-900">Learnpath</span>
                </Link>

                <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full bg-white/70 px-2 py-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 backdrop-blur lg:flex">
                    {NAV_LINKS.map((l) => (
                        <a
                            key={l.href}
                            href={l.href}
                            className="rounded-full px-3.5 py-1.5 text-[13.5px] font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-600"
                        >
                            {l.label}
                        </a>
                    ))}
                </nav>

                <div className="flex-1" />

                <div className="relative z-10 hidden items-center gap-2 sm:flex">
                    {isAuthed ? (
                        <Link
                            href={dashboard()}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-[14px] font-semibold text-white shadow-[0_8px_18px_-10px_rgba(18,35,125,0.6)] transition hover:bg-brand-700"
                        >
                            Buka Dasbor <IconArrowR size={14} />
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={login()}
                                className="rounded-lg px-3 py-2 text-[14px] font-semibold text-slate-700 transition hover:text-brand-600"
                            >
                                Masuk
                            </Link>
                            {canRegister && (
                                <Link
                                    href={register()}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-[14px] font-semibold text-white shadow-[0_8px_18px_-10px_rgba(18,35,125,0.6)] transition hover:bg-brand-700"
                                >
                                    Mulai gratis <IconArrowR size={14} />
                                </Link>
                            )}
                        </>
                    )}
                </div>

                <button
                    onClick={() => setOpen((o) => !o)}
                    className="grid size-10 place-items-center rounded-xl bg-white ring-1 ring-slate-200 sm:hidden"
                    aria-label="Toggle menu"
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    >
                        {open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
                    </svg>
                </button>
            </div>

            {open && (
                <div className="space-y-1 border-t border-slate-200/60 bg-white px-5 py-4 sm:hidden">
                    {NAV_LINKS.map((l) => (
                        <a
                            key={l.href}
                            href={l.href}
                            onClick={() => setOpen(false)}
                            className="block py-2 text-[14px] font-medium text-slate-700"
                        >
                            {l.label}
                        </a>
                    ))}
                    <div className="flex gap-2 pt-3">
                        {isAuthed ? (
                            <Link
                                href={dashboard()}
                                className="flex-1 rounded-xl bg-brand-600 py-2.5 text-center text-[14px] font-semibold text-white"
                            >
                                Buka Dasbor
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="flex-1 rounded-xl py-2.5 text-center text-[14px] font-semibold ring-1 ring-slate-200"
                                >
                                    Masuk
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="flex-1 rounded-xl bg-brand-600 py-2.5 text-center text-[14px] font-semibold text-white"
                                    >
                                        Mulai gratis
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}

function Hero({ ctaHref }: { ctaHref: string }) {
    return (
        <section className="relative overflow-hidden">
            <div className="absolute -top-32 -left-32 size-[480px] rounded-full bg-brand-100/60 blur-3xl" aria-hidden="true" />
            <div className="absolute -top-40 right-0 size-[520px] rounded-full bg-violet-100/60 blur-3xl" aria-hidden="true" />

            <div className="relative mx-auto max-w-7xl px-5 pt-20 pb-24 lg:px-8 lg:pt-28 lg:pb-32">
                <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-[11.5px] font-bold tracking-[0.14em] text-brand-700 ring-1 ring-brand-100 uppercase">
                            <IconSparkle size={12} /> Baru · AI Tutor 24/7 untuk semua kursus
                        </div>
                        <h1 className="mt-5 text-[40px] leading-[1.02] font-extrabold tracking-tight text-balance text-slate-900 sm:text-[52px] lg:text-[60px]">
                            Jalur belajar yang <span className="text-brand-600">terarah</span>, untuk karier yang
                            tumbuh cepat.
                        </h1>
                        <p className="mx-auto mt-5 max-w-xl text-[16.5px] leading-relaxed text-pretty text-slate-600 sm:text-[17px] lg:mx-0">
                            Roadmap personal, AI Tutor 24/7, dan progres yang terukur — semua dalam satu platform
                            yang dirancang untuk hasil nyata.
                        </p>

                        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                            <Link
                                href={ctaHref}
                                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(18,35,125,0.65)] transition hover:bg-brand-700"
                            >
                                Mulai gratis 7 hari <IconArrowR size={16} />
                            </Link>
                            <button className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-[15px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50">
                                <span className="grid size-6 place-items-center rounded-full bg-brand-50 text-brand-600">
                                    <IconPlayFill size={10} />
                                </span>
                                Lihat demo (2 mnt)
                            </button>
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-5 lg:justify-start">
                            <div className="flex -space-x-2">
                                {[
                                    'from-amber-300 to-amber-500',
                                    'from-emerald-300 to-emerald-500',
                                    'from-violet-300 to-violet-500',
                                    'from-rose-300 to-rose-500',
                                ].map((c, i) => (
                                    <div
                                        key={i}
                                        className={'size-8 rounded-full bg-gradient-to-br ring-2 ring-surface ' + c}
                                    />
                                ))}
                                <div className="grid size-8 place-items-center rounded-full bg-slate-900 text-[10px] font-bold text-white ring-2 ring-surface">
                                    +8k
                                </div>
                            </div>
                            <div className="text-left">
                                <div className="flex items-center gap-0.5 text-amber-500">
                                    {[0, 1, 2, 3, 4].map((i) => (
                                        <IconStar key={i} size={13} />
                                    ))}
                                    <span className="ml-1.5 text-[12.5px] font-bold text-slate-900">4,9 / 5</span>
                                </div>
                                <div className="text-[11.5px] text-slate-500">Dari 8.420 ulasan siswa</div>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <HeroMock />
                    </div>
                </div>
            </div>
        </section>
    );
}

function HeroMock() {
    return (
        <div className="relative mx-auto w-full max-w-[540px]">
            <div className="relative z-10 rounded-3xl bg-white p-5 shadow-[0_24px_60px_-24px_rgba(18,35,125,0.35)] ring-1 ring-slate-200/70 sm:p-6">
                <div className="flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                        <IconBook size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-[14px] font-bold text-slate-900">
                            Fullstack JavaScript dari Nol
                        </div>
                        <div className="text-[11.5px] text-slate-500">Modul 3 dari 8 · Ayu Pratiwi</div>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold tracking-wider text-emerald-700 uppercase">
                        Live
                    </span>
                </div>

                <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800">
                    <div className="absolute inset-0 grid place-items-center">
                        <button className="grid size-14 place-items-center rounded-full bg-white text-brand-700 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.4)] transition hover:scale-105">
                            <IconPlayFill size={22} />
                        </button>
                    </div>
                    <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 text-[11px] text-white/85">
                        <span className="tabular-nums">04:12</span>
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
                            <div className="h-full w-[36%] rounded-full bg-white" />
                        </div>
                        <span className="tabular-nums">11:30</span>
                    </div>
                </div>

                <div className="mt-4">
                    <div className="flex items-center justify-between text-[12px]">
                        <span className="font-semibold text-slate-700">Progres modul</span>
                        <span className="font-bold text-brand-700 tabular-nums">64%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full w-[64%] rounded-full bg-gradient-to-r from-brand-500 to-brand-700" />
                    </div>
                </div>

                <ul className="mt-4 space-y-1.5">
                    {[
                        { name: '01 · Setup environment', done: true, time: '8 mnt' },
                        { name: '02 · Variabel & tipe', done: true, time: '12 mnt' },
                        { name: '03 · Fungsi & scope', done: false, time: '15 mnt', active: true },
                        { name: '04 · Async / await', done: false, time: '18 mnt' },
                    ].map((l) => (
                        <li
                            key={l.name}
                            className={
                                'flex items-center gap-3 rounded-xl px-3 py-2.5 ring-1 ' +
                                (l.active ? 'bg-brand-50 ring-brand-100' : 'bg-slate-50/60 ring-slate-100')
                            }
                        >
                            <span
                                className={
                                    'grid size-5 shrink-0 place-items-center rounded-md ring-1 ' +
                                    (l.done
                                        ? 'bg-brand-600 text-white ring-brand-600'
                                        : l.active
                                          ? 'bg-white text-brand-600 ring-brand-300'
                                          : 'bg-white text-slate-300 ring-slate-200')
                                }
                            >
                                {l.done ? <IconCheck size={11} /> : <IconPlayFill size={9} />}
                            </span>
                            <span
                                className={
                                    'flex-1 truncate text-[12.5px] ' +
                                    (l.active ? 'font-semibold text-slate-900' : 'text-slate-600')
                                }
                            >
                                {l.name}
                            </span>
                            <span className="text-[11px] text-slate-400 tabular-nums">{l.time}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="absolute -top-4 -right-4 z-20 hidden w-[230px] rotate-[3deg] rounded-2xl bg-white p-3.5 shadow-[0_18px_36px_-18px_rgba(18,35,125,0.35)] ring-1 ring-slate-200/70 sm:block lg:-right-10">
                <div className="flex items-center gap-2">
                    <div className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                        <IconSparkle size={14} />
                    </div>
                    <div className="text-[11.5px] font-bold text-slate-900">AI Tutor</div>
                    <span className="ml-auto inline-flex items-center gap-1 text-[9.5px] font-semibold text-emerald-600">
                        <span className="size-1.5 rounded-full bg-emerald-500" /> Online
                    </span>
                </div>
                <div className="mt-2 text-[11.5px] leading-relaxed text-slate-600">
                    Closure terjadi saat fungsi{' '}
                    <span className="rounded bg-slate-100 px-1 font-mono">menyimpan referensi</span> ke variabel di
                    lingkup luarnya.
                </div>
            </div>

            <div className="absolute -bottom-6 -left-4 z-20 hidden w-[240px] -rotate-[4deg] items-center gap-3 rounded-2xl bg-white p-3.5 shadow-[0_18px_36px_-18px_rgba(18,35,125,0.35)] ring-1 ring-slate-200/70 sm:flex lg:-left-10">
                <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                    <IconBadge size={20} />
                </div>
                <div className="min-w-0">
                    <div className="text-[12px] font-bold text-slate-900">Sertifikat diterbitkan</div>
                    <div className="text-[11px] text-slate-500">Diverifikasi oleh 14 mitra HR</div>
                </div>
            </div>
        </div>
    );
}

function LogosBar() {
    const logos = ['Tokoaja', 'Nimbus', 'Pintaria', 'Brevo', 'Sintra', 'Kunci'];

    return (
        <section className="relative">
            <div className="mx-auto max-w-7xl border-y border-slate-200/70 px-5 py-12 lg:px-8">
                <div className="text-center text-[11.5px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                    Dipercaya tim pembelajaran di seluruh Indonesia
                </div>
                <div className="mt-7 grid grid-cols-2 items-center gap-x-8 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
                    {logos.map((l) => (
                        <div
                            key={l}
                            className="text-center text-[20px] font-extrabold tracking-tight text-slate-300 transition hover:text-slate-500"
                        >
                            {l}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function SectionHead({
    eyebrow,
    title,
    desc,
    align = 'center',
}: {
    eyebrow: string;
    title: React.ReactNode;
    desc?: string;
    align?: 'center' | 'left';
}) {
    const a = align === 'center' ? 'text-center mx-auto' : 'text-left';

    return (
        <div className={'max-w-2xl ' + a}>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11.5px] font-bold tracking-[0.14em] text-brand-700 ring-1 ring-brand-100 uppercase">
                {eyebrow}
            </div>
            <h2 className="mt-5 text-[32px] leading-[1.05] font-extrabold tracking-tight text-balance text-slate-900 sm:text-[40px]">
                {title}
            </h2>
            {desc && <p className="mt-5 text-[15.5px] leading-relaxed text-pretty text-slate-600">{desc}</p>}
        </div>
    );
}

function Features() {
    return (
        <section id="features" className="relative">
            <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
                <SectionHead
                    eyebrow="Fitur Utama"
                    title={
                        <>
                            Dirancang untuk hasil <span className="text-brand-600">yang terukur</span>.
                        </>
                    }
                    desc="Bukan sekadar kumpulan video — Learnpath memandu setiap langkah dari nol sampai siap kerja."
                />
                <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {FEATURES.map((f) => {
                        const Icn = f.icon;

                        return (
                            <div
                                key={f.title}
                                className="group rounded-2xl bg-card p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 transition-all duration-200 hover:-translate-y-0.5 hover:ring-slate-300"
                            >
                                <div className={'grid size-12 place-items-center rounded-xl ' + f.tint}>
                                    <Icn size={22} />
                                </div>
                                <h3 className="mt-5 text-[17px] font-bold text-slate-900">{f.title}</h3>
                                <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{f.desc}</p>
                                <div className="mt-5 inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand-600 opacity-0 transition group-hover:opacity-100">
                                    Pelajari <IconArrowR size={13} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function HowItWorks() {
    return (
        <section id="how" className="relative bg-gradient-to-b from-brand-50/30 to-transparent">
            <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
                <SectionHead
                    eyebrow="Cara Kerja"
                    title={
                        <>
                            Dari nol ke <span className="text-brand-600">siap kerja</span> dalam 3 langkah.
                        </>
                    }
                    desc="Sederhana tapi terstruktur. Setiap langkah punya milestone yang jelas."
                />

                <div className="relative mt-16 grid gap-6 lg:grid-cols-3">
                    <div
                        className="absolute top-12 right-[16.6%] left-[16.6%] hidden h-px bg-gradient-to-r from-brand-100 via-brand-300 to-brand-100 lg:block"
                        aria-hidden="true"
                    />

                    {STEPS.map((s) => {
                        const Icn = s.icon;

                        return (
                            <div
                                key={s.n}
                                className="relative rounded-2xl bg-card p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative grid size-12 place-items-center rounded-2xl bg-brand-600 text-white">
                                        <Icn size={22} />
                                    </div>
                                    <div className="text-[42px] leading-none font-extrabold tracking-tighter text-slate-100">
                                        {s.n}
                                    </div>
                                </div>
                                <h3 className="mt-6 text-[19px] font-bold text-slate-900">{s.title}</h3>
                                <p className="mt-2.5 text-[14.5px] leading-relaxed text-slate-600">{s.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function Courses() {
    return (
        <section id="courses" className="relative">
            <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <SectionHead
                        align="left"
                        eyebrow="Kursus"
                        title={
                            <>
                                Pilih dari <span className="text-brand-600">128+ kursus</span> di kategori paling
                                diminati.
                            </>
                        }
                        desc="Dari fundamental sampai topik lanjutan — semua dengan proyek nyata."
                    />
                    <a
                        href="#"
                        className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand-600 hover:text-brand-700"
                    >
                        Lihat semua kursus <IconArrowR size={14} />
                    </a>
                </div>

                <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {COURSE_CATS.map((c) => {
                        const Icn = c.icon;

                        return (
                            <a
                                key={c.name}
                                href="#"
                                className="group relative overflow-hidden rounded-2xl bg-card p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 transition hover:ring-slate-300"
                            >
                                <div
                                    className={
                                        'grid size-14 place-items-center rounded-2xl bg-gradient-to-br text-white ' +
                                        c.color
                                    }
                                >
                                    <Icn size={26} />
                                </div>
                                <h3 className="mt-5 text-[17px] font-bold text-slate-900">{c.name}</h3>
                                <div className="mt-2 flex items-center gap-3 text-[12.5px] text-slate-500">
                                    <span>
                                        <span className="font-semibold text-slate-700 tabular-nums">{c.count}</span>{' '}
                                        kursus
                                    </span>
                                    <span className="size-1 rounded-full bg-slate-300" />
                                    <span>
                                        <span className="font-semibold text-slate-700 tabular-nums">{c.hours}</span>{' '}
                                        jam
                                    </span>
                                </div>
                                <div className="mt-5 inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand-600">
                                    Mulai jelajahi{' '}
                                    <IconArrowR size={13} className="transition group-hover:translate-x-0.5" />
                                </div>
                            </a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function AITutor({ ctaHref }: { ctaHref: string }) {
    return (
        <section className="relative">
            <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white">
                    <div
                        className="absolute -top-20 -right-20 size-72 rounded-full bg-white/10 blur-3xl"
                        aria-hidden="true"
                    />
                    <div
                        className="absolute -bottom-24 -left-32 size-80 rounded-full bg-violet-400/30 blur-3xl"
                        aria-hidden="true"
                    />

                    <div className="relative grid items-center gap-12 p-10 sm:p-14 lg:grid-cols-2 lg:gap-14 lg:p-20">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[11.5px] font-bold tracking-[0.14em] ring-1 ring-white/20 uppercase backdrop-blur">
                                <IconSparkle size={12} /> AI Tutor
                            </div>
                            <h2 className="mt-4 text-[32px] leading-[1.05] font-extrabold tracking-tight text-balance sm:text-[40px]">
                                Tanya apa saja, kapan saja — tutor pribadimu tidak pernah tidur.
                            </h2>
                            <p className="mt-4 text-[15.5px] leading-relaxed text-pretty text-white/80">
                                Konteks materimu langsung dikenali. Penjelasan dengan contoh, bukan jawaban template.
                                Bisa diminta meng-quiz, merangkum, atau membahas error spesifik.
                            </p>

                            <ul className="mt-6 space-y-3">
                                {[
                                    'Penjelasan kontekstual dengan contoh kode',
                                    'Quiz otomatis untuk mengecek pemahaman',
                                    'Tersedia dalam Bahasa Indonesia & Inggris',
                                ].map((t) => (
                                    <li key={t} className="flex items-start gap-3 text-[14.5px] text-white/90">
                                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-emerald-400/20 text-emerald-300 ring-1 ring-emerald-300/30">
                                            <IconCheck size={12} />
                                        </span>
                                        <span>{t}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <Link
                                    href={ctaHref}
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-[14.5px] font-semibold text-brand-700 shadow-sm hover:bg-brand-50"
                                >
                                    Coba AI Tutor <IconArrowR size={14} />
                                </Link>
                                <a
                                    href="#"
                                    className="inline-flex items-center gap-2 px-2 py-3 text-[14.5px] font-semibold text-white/90 hover:text-white"
                                >
                                    Pelajari cara kerjanya
                                </a>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="mx-auto max-w-md space-y-3 rounded-2xl bg-white p-4 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.4)] ring-1 ring-white/30">
                                <ChatBubble me text="Bagaimana cara closure bekerja di JavaScript?" />
                                <ChatBubble text="Closure adalah ketika fungsi 'mengingat' variabel dari lingkup luarnya, meskipun lingkup itu sudah selesai dijalankan." />
                                <CodeBlock />
                                <ChatBubble me text="Bisa kasih quiz singkat?" />
                                <ChatBubble typing />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ChatBubble({ me, text, typing }: { me?: boolean; text?: string; typing?: boolean }) {
    if (typing) {
        return (
            <div className="flex justify-start">
                <div className="inline-flex items-center gap-1 rounded-2xl rounded-bl-md bg-slate-100 px-3 py-2.5">
                    {[0, 1, 2].map((i) => (
                        <span
                            key={i}
                            className="size-1.5 animate-bounce rounded-full bg-slate-400"
                            style={{ animationDelay: `${i * 120}ms` }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={'flex ' + (me ? 'justify-end' : 'justify-start')}>
            <div
                className={
                    'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed ' +
                    (me ? 'rounded-br-md bg-brand-600 text-white' : 'rounded-bl-md bg-slate-100 text-slate-800')
                }
            >
                {text}
            </div>
        </div>
    );
}

function CodeBlock() {
    return (
        <div className="rounded-xl bg-slate-900 p-3 font-mono text-[12px] leading-relaxed text-slate-100 shadow-inner">
            <div className="text-slate-400">// counter.js</div>
            <div>
                <span className="text-violet-300">function</span>{' '}
                <span className="text-emerald-300">makeCounter</span>() {'{'}
            </div>
            <div className="pl-3">
                <span className="text-violet-300">let</span> n = <span className="text-amber-300">0</span>;
            </div>
            <div className="pl-3">
                <span className="text-violet-300">return</span> () =&gt; ++n;
            </div>
            <div>{'}'}</div>
        </div>
    );
}

function Stats() {
    return (
        <section className="relative">
            <div className="mx-auto max-w-7xl px-5 pt-8 pb-16 lg:px-8">
                <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
                    {STATS.map((s) => (
                        <div
                            key={s.l}
                            className="rounded-2xl bg-card px-6 py-8 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70"
                        >
                            <div className="text-[36px] leading-none font-extrabold tracking-tight text-brand-600 sm:text-[42px]">
                                {s.v}
                            </div>
                            <div className="mt-2 text-[12.5px] text-slate-500">{s.l}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Testimonials() {
    return (
        <section className="relative bg-gradient-to-b from-transparent to-brand-50/30">
            <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
                <SectionHead
                    eyebrow="Testimoni"
                    title={
                        <>
                            Cerita nyata dari <span className="text-brand-600">siswa Learnpath</span>.
                        </>
                    }
                    desc="Tidak ada review berbayar — semua dari alumni yang sudah lulus dan bekerja."
                />
                <div className="mt-16 grid gap-5 md:grid-cols-3">
                    {TESTIMONIALS.map((t) => (
                        <figure
                            key={t.name}
                            className="relative rounded-2xl bg-card p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70"
                        >
                            <div className="flex items-center gap-0.5 text-amber-500">
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <IconStar key={i} size={14} />
                                ))}
                            </div>
                            <blockquote className="mt-5 text-[15px] leading-relaxed text-slate-800">
                                &ldquo;{t.text}&rdquo;
                            </blockquote>
                            <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-6">
                                <div
                                    className={
                                        'grid size-10 place-items-center rounded-full bg-gradient-to-br text-[12px] font-bold text-white ' +
                                        t.color
                                    }
                                >
                                    {t.name
                                        .split(' ')
                                        .map((s) => s[0])
                                        .slice(0, 2)
                                        .join('')}
                                </div>
                                <div>
                                    <div className="text-[13.5px] font-bold text-slate-900">{t.name}</div>
                                    <div className="text-[11.5px] text-slate-500">{t.role}</div>
                                </div>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Pricing({ ctaHref }: { ctaHref: string }) {
    const [annual, setAnnual] = useState(false);

    return (
        <section id="pricing" className="relative">
            <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
                <SectionHead
                    eyebrow="Harga"
                    title={
                        <>
                            Bayar untuk hasil, <span className="text-brand-600">bukan kontrak.</span>
                        </>
                    }
                    desc="Mulai gratis, upgrade saat siap. Batalkan kapan saja tanpa biaya tersembunyi."
                />

                <div className="mt-10 flex items-center justify-center gap-3">
                    <span
                        className={'text-[13.5px] font-semibold ' + (!annual ? 'text-slate-900' : 'text-slate-400')}
                    >
                        Bulanan
                    </span>
                    <button
                        onClick={() => setAnnual((a) => !a)}
                        className={
                            'relative h-6 w-12 rounded-full transition ' +
                            (annual ? 'bg-brand-600' : 'bg-slate-200')
                        }
                    >
                        <span
                            className={
                                'absolute top-0.5 size-5 rounded-full bg-white shadow transition ' +
                                (annual ? 'left-6' : 'left-0.5')
                            }
                        />
                    </button>
                    <span
                        className={'text-[13.5px] font-semibold ' + (annual ? 'text-slate-900' : 'text-slate-400')}
                    >
                        Tahunan
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600 ring-1 ring-emerald-200">
                        Hemat 20%
                    </span>
                </div>

                <div className="mt-12 grid items-stretch gap-6 md:grid-cols-3">
                    {PLANS.map((p) => (
                        <div
                            key={p.name}
                            className={
                                'relative flex flex-col rounded-3xl p-8 transition ' +
                                (p.popular
                                    ? 'bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white shadow-[0_24px_60px_-24px_rgba(18,35,125,0.45)] ring-1 ring-brand-500 md:-translate-y-2'
                                    : 'bg-card text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70')
                            }
                        >
                            {p.popular && (
                                <span className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-[10.5px] font-bold tracking-wider text-amber-900 ring-2 ring-brand-700 uppercase">
                                    Paling populer
                                </span>
                            )}
                            <div>
                                <div
                                    className={
                                        'text-[13px] font-bold tracking-[0.14em] uppercase ' +
                                        (p.popular ? 'text-brand-200' : 'text-brand-600')
                                    }
                                >
                                    {p.name}
                                </div>
                                <div className={'mt-2 text-[14px] ' + (p.popular ? 'text-white/75' : 'text-slate-500')}>
                                    {p.desc}
                                </div>
                                <div className="mt-5 flex items-baseline gap-1.5">
                                    <span
                                        className={
                                            'text-[34px] font-extrabold tracking-tight tabular-nums sm:text-[40px] ' +
                                            (p.popular ? 'text-white' : 'text-slate-900')
                                        }
                                    >
                                        {annual && p.price !== 'Rp 0'
                                            ? `Rp ${Math.round(
                                                  (parseInt(p.price.replace(/\D/g, '')) * 0.8) / 1000,
                                              ).toLocaleString('id-ID')}.000`
                                            : p.price}
                                    </span>
                                    <span className={'text-[13px] ' + (p.popular ? 'text-white/70' : 'text-slate-500')}>
                                        {p.period}
                                    </span>
                                </div>
                            </div>

                            <ul className="mt-6 flex-1 space-y-2.5">
                                {p.features.map((f) => (
                                    <li
                                        key={f}
                                        className={
                                            'flex items-start gap-2.5 text-[14px] ' +
                                            (p.popular ? 'text-white/90' : 'text-slate-700')
                                        }
                                    >
                                        <span
                                            className={
                                                'mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-md ' +
                                                (p.popular
                                                    ? 'bg-white/15 text-emerald-300 ring-1 ring-white/20'
                                                    : 'bg-brand-50 text-brand-600')
                                            }
                                        >
                                            <IconCheck size={11} />
                                        </span>
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={ctaHref}
                                className={
                                    'mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-center text-[14px] font-semibold transition ' +
                                    (p.popular
                                        ? 'bg-white text-brand-700 hover:bg-brand-50'
                                        : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50')
                                }
                            >
                                {p.cta} <IconArrowR size={14} />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function FAQ() {
    const [open, setOpen] = useState<number>(0);

    return (
        <section id="faq" className="relative">
            <div className="mx-auto max-w-3xl px-5 py-24 lg:px-8 lg:py-32">
                <SectionHead
                    eyebrow="FAQ"
                    title={
                        <>
                            Pertanyaan yang <span className="text-brand-600">sering muncul</span>.
                        </>
                    }
                    desc="Belum menemukan jawabanmu? Hubungi tim dukungan kami."
                />
                <div className="mt-12 divide-y divide-slate-100 overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    {FAQS.map((f, i) => {
                        const isOpen = open === i;

                        return (
                            <div key={i}>
                                <button
                                    onClick={() => setOpen(isOpen ? -1 : i)}
                                    className="flex w-full items-center gap-4 px-6 py-6 text-left transition hover:bg-slate-50/50 sm:px-7"
                                >
                                    <span className="flex-1 text-[15px] font-semibold text-slate-900 sm:text-[16px]">
                                        {f.q}
                                    </span>
                                    <span
                                        className={
                                            'grid size-8 shrink-0 place-items-center rounded-full ring-1 transition ' +
                                            (isOpen
                                                ? 'rotate-45 bg-brand-600 text-white ring-brand-600'
                                                : 'bg-white text-slate-500 ring-slate-200')
                                        }
                                    >
                                        <IconPlus size={14} />
                                    </span>
                                </button>
                                <div
                                    className={
                                        'grid transition-all duration-300 ' +
                                        (isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')
                                    }
                                >
                                    <div className="overflow-hidden">
                                        <p className="px-6 pb-6 text-[14.5px] leading-relaxed text-slate-600 sm:px-7">
                                            {f.a}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function CTABanner({ ctaHref }: { ctaHref: string }) {
    return (
        <section className="relative">
            <div className="mx-auto max-w-7xl px-5 pb-24 lg:px-8 lg:pb-32">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 p-12 text-center text-white sm:p-16 lg:p-20">
                    <div
                        className="absolute -top-20 left-1/2 size-72 -translate-x-1/2 rounded-full bg-white/10 blur-3xl"
                        aria-hidden="true"
                    />

                    <div className="relative mx-auto max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[11.5px] font-bold tracking-[0.14em] ring-1 ring-white/20 uppercase backdrop-blur">
                            <IconSparkle size={12} /> Coba 7 hari gratis
                        </div>
                        <h2 className="mt-5 text-[34px] leading-[1.05] font-extrabold tracking-tight text-balance sm:text-[44px]">
                            Karier baru dimulai dari kebiasaan belajar yang baru.
                        </h2>
                        <p className="mt-4 text-[16px] leading-relaxed text-white/80">
                            Buat akun gratis dalam 30 detik. Tidak butuh kartu kredit. Batalkan kapan saja.
                        </p>
                        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                            <Link
                                href={ctaHref}
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-[15px] font-semibold text-brand-700 shadow-sm hover:bg-brand-50"
                            >
                                Mulai sekarang <IconArrowR size={15} />
                            </Link>
                            <a
                                href="#pricing"
                                className="inline-flex items-center gap-2 px-3 py-3.5 text-[15px] font-semibold text-white/90 hover:text-white"
                            >
                                Lihat semua paket
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer className="relative border-t border-slate-200/70 bg-white">
            <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
                <div className="grid gap-12 lg:grid-cols-[2fr_3fr]">
                    <div>
                        <Link href="/" className="flex items-center gap-2.5">
                            <span className="grid size-10 place-items-center rounded-xl bg-brand-600 text-white">
                                <AppLogoIcon className="size-5" />
                            </span>
                            <div className="leading-tight">
                                <div className="text-[18px] font-extrabold tracking-tight text-slate-900">Learnpath</div>
                                <div className="text-[10px] tracking-[0.18em] text-slate-500 uppercase">
                                    Learn Smarter, Grow Faster
                                </div>
                            </div>
                        </Link>
                        <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-slate-600">
                            Platform pembelajaran terstruktur untuk talenta digital Indonesia. Roadmap personal, AI
                            Tutor, dan sertifikat yang diakui industri.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                        {FOOTER_LINKS.map((c) => (
                            <div key={c.title}>
                                <div className="text-[12px] font-bold tracking-[0.14em] text-slate-900 uppercase">
                                    {c.title}
                                </div>
                                <ul className="mt-3 space-y-2">
                                    {c.links.map((l) => (
                                        <li key={l}>
                                            <a
                                                href="#"
                                                className="text-[13.5px] text-slate-500 transition hover:text-brand-600"
                                            >
                                                {l}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 text-[12.5px] text-slate-500 sm:flex-row">
                    <div>© 2026 PT Learnpath Indonesia. Hak cipta dilindungi.</div>
                    <div className="flex items-center gap-4">
                        <span className="inline-flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-emerald-500" /> Sistem normal
                        </span>
                        <a href="#" className="hover:text-brand-600">
                            Bahasa: ID
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
