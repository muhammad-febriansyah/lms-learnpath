import { Head, Link, usePage } from '@inertiajs/react';
import { Award, Bot, Sparkles as SparklesLucide, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { FeaturesBento } from '@/components/front/features-bento';
import {
    IconArrowR,
    IconBadge,
    IconBook,
    IconCap,
    IconChart,
    IconCheck,
    IconMessage,
    IconPlus,
    IconSparkle,
    IconStar,
    IconUsers,
    IconWallet,
} from '@/components/learnpath-icons';
import { AnimatedTestimonials } from '@/components/ui/animated-testimonials';
import type { Testimonial } from '@/components/ui/animated-testimonials';
import {
    AppleCardsCarousel,
    CarouselCardItem,
} from '@/components/ui/apple-cards-carousel';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { Highlight, HeroHighlight } from '@/components/ui/hero-highlight';
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';
import { NumberTicker } from '@/components/ui/number-ticker';
import { SparklesText } from '@/components/ui/sparkles-text';
import { TracingBeam } from '@/components/ui/tracing-beam';
import { dashboard, login } from '@/routes';
import * as coursesRoutes from '@/routes/courses';

const FALLBACK_HERO_ROLES = [
    'Frontend Engineer',
    'Data Scientist',
    'Product Designer',
    'AI Engineer',
    'Digital Marketer',
    'Project Manager',
    'Business Analyst',
    'UI/UX Designer',
    'Mobile Developer',
    'Bahasa Inggris Pro',
];

type HeroShowcase = {
    title: string;
    progress: number;
};

type HeroData = {
    roles: string[];
    totalStudents: number;
    avgRating: number;
    totalReviews: number;
    showcase: HeroShowcase | null;
};

const FALLBACK_HERO_SHOWCASE: HeroShowcase = {
    title: 'Talent Management Pro',
    progress: 64,
};

function formatCompactCount(n: number): string {
    if (n >= 1000) {
        return `+${Math.floor(n / 1000)}k`;
    }

    return `+${n}`;
}

function formatIndonesianNumber(n: number): string {
    return n.toLocaleString('id-ID');
}

function formatIndonesianRating(rating: number): string {
    return rating.toFixed(1).replace('.', ',');
}

type TypewriterState = { wordIdx: number; text: string; deleting: boolean };

function useTypewriter(words: string[]) {
    const [state, setState] = useState<TypewriterState>({
        wordIdx: 0,
        text: '',
        deleting: false,
    });

    useEffect(() => {
        const current = words[state.wordIdx];
        const isDone = !state.deleting && state.text === current;
        const isCleared = state.deleting && state.text === '';
        const delay = isDone
            ? 1600
            : isCleared
              ? 200
              : state.deleting
                ? 40
                : 70;

        const t = setTimeout(() => {
            setState((s) => {
                const cur = words[s.wordIdx];

                if (!s.deleting && s.text === cur) {
                    return { ...s, deleting: true };
                }

                if (s.deleting && s.text === '') {
                    return {
                        wordIdx: (s.wordIdx + 1) % words.length,
                        text: '',
                        deleting: false,
                    };
                }

                return {
                    ...s,
                    text: s.deleting
                        ? s.text.slice(0, -1)
                        : cur.slice(0, s.text.length + 1),
                };
            });
        }, delay);

        return () => clearTimeout(t);
    }, [state, words]);

    return state.text;
}

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

type HomeCategory = {
    name: string;
    slug: string;
    thumbnail: string | null;
    courseCount: number;
    hours: number;
};

const CATEGORY_STYLES = [
    { color: 'from-brand-500 to-brand-700', icon: IconBook },
    { color: 'from-violet-500 to-fuchsia-600', icon: IconChart },
    { color: 'from-teal-500 to-emerald-600', icon: IconBadge },
    { color: 'from-amber-500 to-orange-600', icon: IconWallet },
    { color: 'from-rose-500 to-pink-600', icon: IconMessage },
    { color: 'from-slate-500 to-slate-700', icon: IconUsers },
];

const FALLBACK_CATEGORIES: HomeCategory[] = [
    {
        name: 'Pengembangan Web',
        slug: 'web',
        thumbnail: null,
        courseCount: 48,
        hours: 320,
    },
    {
        name: 'Data & AI',
        slug: 'data-ai',
        thumbnail: null,
        courseCount: 36,
        hours: 280,
    },
    {
        name: 'Desain Produk',
        slug: 'desain',
        thumbnail: null,
        courseCount: 24,
        hours: 190,
    },
    {
        name: 'Bisnis & Karier',
        slug: 'bisnis',
        thumbnail: null,
        courseCount: 18,
        hours: 140,
    },
    {
        name: 'Bahasa Inggris',
        slug: 'bahasa-inggris',
        thumbnail: null,
        courseCount: 12,
        hours: 96,
    },
    {
        name: 'Soft Skills',
        slug: 'soft-skills',
        thumbnail: null,
        courseCount: 14,
        hours: 110,
    },
];

type Stat = {
    value: number;
    suffix?: string;
    decimals?: number;
    label: string;
};

type HomeStats = {
    students: number;
    courses: number;
    completionRate: number;
    rating: number;
};

const FALLBACK_STATS: HomeStats = {
    students: 8420,
    courses: 128,
    completionRate: 94,
    rating: 4.9,
};

function buildStatItems(stats: HomeStats): Stat[] {
    return [
        { value: stats.students, suffix: '+', label: 'Siswa aktif' },
        { value: stats.courses, label: 'Kursus terkurasi' },
        {
            value: stats.completionRate,
            suffix: '%',
            label: 'Tingkat penyelesaian',
        },
        {
            value: stats.rating,
            decimals: 1,
            suffix: ' / 5',
            label: 'Rating siswa',
        },
    ];
}

type HomeTestimonial = {
    name: string;
    role: string;
    text: string;
};

const TESTIMONIAL_GRADIENTS = [
    'from-brand-300 to-brand-500',
    'from-emerald-300 to-emerald-500',
    'from-violet-300 to-violet-500',
    'from-amber-300 to-amber-500',
    'from-rose-300 to-rose-500',
    'from-teal-300 to-teal-500',
];

const FALLBACK_TESTIMONIALS: HomeTestimonial[] = [
    {
        name: 'Rifqi Andika',
        role: 'Frontend Engineer · Jakarta',
        text: 'Dari pemula ke kontributor open-source dalam 4 bulan. Roadmap-nya bikin saya nggak nebak-nebak lagi.',
    },
    {
        name: 'Maya Anggraini',
        role: 'Data Analyst · Surabaya',
        text: 'AI Tutor jadi penyelamat saat stuck malam-malam. Penjelasannya pas, tidak terlalu panjang, tidak terlalu pendek.',
    },
    {
        name: 'Dimas Prabowo',
        role: 'Product Designer · Bandung',
        text: 'Sertifikat Learnpath beneran dilihat recruiter. Diterima di 3 perusahaan dalam 6 minggu setelah lulus.',
    },
];

type HomePartner = {
    name: string;
    logoUrl: string | null;
};

const FALLBACK_PARTNERS: HomePartner[] = [
    { name: 'Tokoaja', logoUrl: null },
    { name: 'Nimbus', logoUrl: null },
    { name: 'Pintaria', logoUrl: null },
    { name: 'Brevo', logoUrl: null },
    { name: 'Sintra', logoUrl: null },
    { name: 'Kunci', logoUrl: null },
    { name: 'Velora', logoUrl: null },
    { name: 'Polaris', logoUrl: null },
    { name: 'Orbit', logoUrl: null },
    { name: 'Pulse', logoUrl: null },
];

type HomeFaq = { q: string; a: string };

const FALLBACK_FAQS: HomeFaq[] = [
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

export default function FrontHome() {
    const { auth, hero, partners, categories, stats, testimonials, faqs } =
        usePage<{
            auth: { user: { name: string } | null };
            hero?: HeroData;
            partners?: HomePartner[];
            categories?: HomeCategory[];
            stats?: HomeStats;
            testimonials?: HomeTestimonial[];
            faqs?: HomeFaq[];
        }>().props;
    const isAuthed = !!auth?.user;
    const ctaHref = isAuthed ? dashboard().url : login().url;

    return (
        <>
            <Head title="Belajar terarah, karier tumbuh cepat" />
            <Hero ctaHref={ctaHref} hero={hero} />
            <LogosBar partners={partners} />
            <Features />
            <HowItWorks />
            <Courses
                categories={categories}
                totalCourses={stats?.courses ?? FALLBACK_STATS.courses}
            />
            <AITutor ctaHref={ctaHref} />
            <Stats stats={stats} />
            <Testimonials testimonials={testimonials} />
            <FAQ faqs={faqs} />
            <CTABanner ctaHref={ctaHref} />
        </>
    );
}

function Hero({
    ctaHref,
    hero,
}: {
    ctaHref: string;
    hero?: HeroData;
}) {
    const roles =
        hero && hero.roles.length > 0 ? hero.roles : FALLBACK_HERO_ROLES;
    const showcase = hero?.showcase ?? FALLBACK_HERO_SHOWCASE;
    const totalStudents = hero?.totalStudents ?? 8000;
    const avgRating = hero?.avgRating ?? 4.9;
    const studentsLabel = formatCompactCount(totalStudents);
    const ratingLabel = formatIndonesianRating(avgRating);
    const studentsCountLabel = formatIndonesianNumber(totalStudents);
    const typed = useTypewriter(roles);

    return (
        <section className="relative overflow-hidden bg-slate-50/40">
            <HeroHighlight
                containerClassName="!h-auto !bg-transparent overflow-visible"
                className="w-full"
            >
                <BackgroundBeams className="opacity-50" />

                <FloatingDecor showcase={showcase} />

                <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pt-24 pb-28 text-center sm:px-8 lg:pt-32 lg:pb-36">
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-[11.5px] font-bold tracking-[0.14em] text-emerald-700 uppercase shadow-sm ring-1 ring-emerald-100"
                    >
                        <span className="grid size-3.5 place-items-center rounded-full bg-emerald-500 text-white">
                            <SparklesLucide className="size-2" />
                        </span>
                        Baru · AI Tutor 24/7 untuk semua kursus
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="mt-7 text-[44px] leading-[1.05] font-extrabold tracking-tight text-balance text-slate-900 sm:text-[56px] lg:text-[68px]"
                    >
                        Belajar{' '}
                        <Highlight className="text-slate-900">
                            terarah
                        </Highlight>
                        , jadi
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mt-3 flex min-h-[1.2em] items-center justify-center text-[44px] leading-[1.05] font-extrabold tracking-tight sm:text-[56px] lg:text-[68px]"
                    >
                        <span className="inline-block bg-gradient-to-r from-brand-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                            {typed || ' '}
                        </span>
                        <span
                            aria-hidden="true"
                            className="ml-1.5 inline-block h-[0.85em] w-[3px] translate-y-[0.05em] animate-pulse rounded-sm bg-brand-600 align-middle"
                        />
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="mt-7 max-w-xl text-[16.5px] leading-[1.7] text-pretty text-slate-600 sm:text-[17px]"
                    >
                        Roadmap personal, AI Tutor 24/7, dan progres yang
                        terukur — semua dalam satu platform yang dirancang untuk
                        hasil nyata.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="mt-10 flex flex-wrap items-center justify-center gap-3"
                    >
                        <Link
                            href={ctaHref}
                            className="group inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(18,35,125,0.65)] transition hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-[0_14px_30px_-12px_rgba(18,35,125,0.75)]"
                        >
                            Daftar gratis
                            <IconArrowR
                                size={16}
                                className="transition-transform group-hover:translate-x-0.5"
                            />
                        </Link>
                        <Link
                            href={coursesRoutes.index().url}
                            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[15px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-50 hover:ring-slate-300"
                        >
                            <span className="grid size-6 place-items-center rounded-full bg-brand-50 text-brand-600">
                                <IconBook size={12} />
                            </span>
                            Lihat kursus
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4"
                    >
                        <div className="flex -space-x-2">
                            {[
                                'from-amber-300 to-amber-500',
                                'from-emerald-300 to-emerald-500',
                                'from-violet-300 to-violet-500',
                                'from-rose-300 to-rose-500',
                            ].map((c, i) => (
                                <div
                                    key={i}
                                    className={
                                        'size-8 rounded-full bg-gradient-to-br ring-2 ring-white ' +
                                        c
                                    }
                                />
                            ))}
                            <div className="grid size-8 place-items-center rounded-full bg-slate-900 text-[10px] font-bold text-white ring-2 ring-white">
                                {studentsLabel}
                            </div>
                        </div>
                        <div className="text-left">
                            <div className="flex items-center gap-0.5 text-amber-500">
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <IconStar key={i} size={13} />
                                ))}
                                <span className="ml-1.5 text-[12.5px] font-bold text-slate-900">
                                    {ratingLabel} / 5
                                </span>
                            </div>
                            <div className="text-[11.5px] text-slate-500">
                                Dari {studentsCountLabel} siswa aktif
                            </div>
                        </div>
                    </motion.div>
                </div>
            </HeroHighlight>
        </section>
    );
}

function FloatingDecor({ showcase }: { showcase: HeroShowcase }) {
    const progress = Math.max(0, Math.min(100, showcase.progress));

    return (
        <div
            className="pointer-events-none absolute inset-0 hidden md:block"
            aria-hidden="true"
        >
            <motion.div
                initial={{ opacity: 0, y: 20, rotate: -8 }}
                animate={{ opacity: 1, y: 0, rotate: -8 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="absolute top-[12%] left-[3%] w-[230px] lg:left-[6%]"
            >
                <div className="rounded-2xl bg-white p-3.5 shadow-[0_18px_36px_-18px_rgba(18,35,125,0.35)] ring-1 ring-slate-200/70">
                    <div className="flex items-center gap-2">
                        <div className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                            <Bot className="size-3.5" />
                        </div>
                        <div className="text-[11.5px] font-bold text-slate-900">
                            AI Tutor
                        </div>
                        <span className="ml-auto inline-flex items-center gap-1 text-[9.5px] font-semibold text-emerald-600">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            Online
                        </span>
                    </div>
                    <div className="mt-2 text-[11px] leading-relaxed text-slate-600">
                        KYC adalah prosedur{' '}
                        <span className="rounded bg-slate-100 px-1 font-semibold">
                            verifikasi identitas
                        </span>{' '}
                        nasabah untuk mencegah pencucian uang.
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: -20, rotate: 6 }}
                animate={{ opacity: 1, y: 0, rotate: 6 }}
                transition={{ duration: 0.7, delay: 0.8 }}
                className="absolute top-[14%] right-[3%] w-[210px] lg:right-[6%]"
            >
                <div className="rounded-2xl bg-white p-3.5 shadow-[0_18px_36px_-18px_rgba(18,35,125,0.35)] ring-1 ring-slate-200/70">
                    <div className="flex items-center gap-2.5">
                        <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                            <Award className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-[12px] font-bold text-slate-900">
                                Sertifikat diterbitkan
                            </div>
                            <div className="text-[10.5px] text-slate-500">
                                Diverifikasi 14 mitra HR
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20, rotate: 4 }}
                animate={{ opacity: 1, y: 0, rotate: 4 }}
                transition={{ duration: 0.7, delay: 1.0 }}
                className="absolute right-[5%] bottom-[10%] w-[220px] lg:right-[8%]"
            >
                <div className="rounded-2xl bg-white p-3.5 shadow-[0_18px_36px_-18px_rgba(18,35,125,0.35)] ring-1 ring-slate-200/70">
                    <div className="flex items-center gap-2">
                        <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                            <IconBook size={14} />
                        </div>
                        <div className="truncate text-[11.5px] font-bold text-slate-900">
                            {showcase.title}
                        </div>
                        <span className="ml-auto rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-emerald-700 uppercase">
                            Live
                        </span>
                    </div>
                    <div className="mt-2.5">
                        <div className="flex items-center justify-between text-[10px]">
                            <span className="font-semibold text-slate-600">
                                Progres modul
                            </span>
                            <span className="font-bold tabular-nums text-brand-700">
                                {progress}%
                            </span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: -20, rotate: -5 }}
                animate={{ opacity: 1, y: 0, rotate: -5 }}
                transition={{ duration: 0.7, delay: 1.2 }}
                className="absolute bottom-[12%] left-[4%] w-[200px] lg:left-[7%]"
            >
                <div className="rounded-2xl bg-white p-3 shadow-[0_18px_36px_-18px_rgba(18,35,125,0.35)] ring-1 ring-slate-200/70">
                    <div className="flex items-center gap-2.5">
                        <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
                            <Zap className="size-4" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-[11.5px] font-bold text-slate-900">
                                Roadmap aktif
                            </div>
                            <div className="text-[10.5px] text-slate-500">
                                Frontend · 3/8 modul
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.4 }}
                className="absolute top-[44%] left-[5%] hidden lg:block"
            >
                <div className="grid size-14 rotate-[-12deg] place-items-center rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-violet-700 text-white shadow-[0_12px_24px_-8px_rgba(18,35,125,0.5)] ring-4 ring-white">
                    <SparklesLucide className="size-6" />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.5 }}
                className="absolute top-[42%] right-[5%] hidden lg:block"
            >
                <div className="grid size-14 rotate-[10deg] place-items-center rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-white shadow-[0_12px_24px_-8px_rgba(244,63,94,0.45)] ring-4 ring-white">
                    <Zap className="size-6" />
                </div>
            </motion.div>
        </div>
    );
}

function LogosBar({ partners }: { partners?: HomePartner[] }) {
    const list =
        partners && partners.length > 0 ? partners : FALLBACK_PARTNERS;

    return (
        <section className="relative">
            <div className="mx-auto max-w-7xl border-y border-slate-200/70 px-5 py-12 lg:px-8">
                <div className="text-center text-[11.5px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                    Dipercaya tim pembelajaran di seluruh Indonesia
                </div>
                <div className="mt-6">
                    <InfiniteMovingCards
                        items={list.map((p) => ({
                            name: p.name,
                            image: p.logoUrl ?? undefined,
                        }))}
                        speed="slow"
                        pauseOnHover
                        className="mx-auto"
                        renderItem={(item) =>
                            item.image ? (
                                <div className="flex h-12 items-center justify-center px-8">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-9 w-auto max-w-[160px] object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
                                    />
                                </div>
                            ) : (
                                <div className="flex h-12 items-center justify-center px-8 text-[20px] font-extrabold tracking-tight text-slate-300 transition hover:text-slate-500">
                                    {item.name}
                                </div>
                            )
                        }
                    />
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
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11.5px] font-bold tracking-[0.14em] text-brand-700 uppercase ring-1 ring-brand-100">
                {eyebrow}
            </div>
            <h2 className="mt-5 text-[32px] leading-[1.05] font-extrabold tracking-tight text-balance text-slate-900 sm:text-[40px]">
                {title}
            </h2>
            {desc && (
                <p className="mt-5 text-[15.5px] leading-relaxed text-pretty text-slate-600">
                    {desc}
                </p>
            )}
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
                            Dirancang untuk hasil{' '}
                            <span className="text-brand-600">yang terukur</span>
                            .
                        </>
                    }
                    desc="Bukan sekadar kumpulan video — Learnpath memandu setiap langkah dari nol sampai siap kerja."
                />
                <div className="mt-16">
                    <FeaturesBento />
                </div>
            </div>
        </section>
    );
}

function HowItWorks() {
    return (
        <section
            id="how"
            className="relative bg-gradient-to-b from-brand-50/30 to-transparent"
        >
            <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
                <SectionHead
                    eyebrow="Cara Kerja"
                    title={
                        <>
                            Dari nol ke{' '}
                            <span className="text-brand-600">siap kerja</span>{' '}
                            dalam 3 langkah.
                        </>
                    }
                    desc="Sederhana tapi terstruktur. Setiap langkah punya milestone yang jelas."
                />

                <div className="mt-16">
                    <TracingBeam className="px-4">
                        <div className="flex flex-col gap-16">
                            {STEPS.map((s, idx) => {
                                const Icn = s.icon;

                                return (
                                    <motion.div
                                        key={s.n}
                                        initial={{ opacity: 0, y: 24 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{
                                            once: true,
                                            margin: '-100px',
                                        }}
                                        transition={{
                                            duration: 0.5,
                                            delay: idx * 0.05,
                                        }}
                                        className="rounded-2xl bg-card p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:p-9"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="relative grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-[0_10px_24px_-12px_rgba(67,56,202,0.65)]">
                                                <Icn size={24} />
                                            </div>
                                            <div className="text-[44px] leading-none font-extrabold tracking-tighter text-brand-100 sm:text-[56px]">
                                                {s.n}
                                            </div>
                                            <span className="ml-auto rounded-full bg-brand-50 px-2.5 py-1 text-[10.5px] font-bold tracking-[0.14em] text-brand-700 uppercase ring-1 ring-brand-100">
                                                Langkah {idx + 1}
                                            </span>
                                        </div>
                                        <h3 className="mt-6 text-[22px] font-bold text-slate-900 sm:text-[24px]">
                                            {s.title}
                                        </h3>
                                        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-600 sm:text-[15.5px]">
                                            {s.desc}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </TracingBeam>
                </div>
            </div>
        </section>
    );
}

function Courses({
    categories,
    totalCourses,
}: {
    categories?: HomeCategory[];
    totalCourses: number;
}) {
    const list =
        categories && categories.length > 0 ? categories : FALLBACK_CATEGORIES;
    const cards = list.map((c, idx) => {
        const style = CATEGORY_STYLES[idx % CATEGORY_STYLES.length];
        const Icn = style.icon;

        return (
            <CarouselCardItem
                key={c.slug || c.name}
                index={idx}
                card={{
                    title: c.name,
                    category: `${c.courseCount} kursus · ${c.hours} jam`,
                    gradient: style.color,
                    image: c.thumbnail,
                    icon: <Icn size={32} />,
                    content: (
                        <div className="space-y-4">
                            <p className="text-[14.5px] leading-relaxed text-slate-700 dark:text-neutral-300">
                                Kategori{' '}
                                <span className="font-semibold">{c.name}</span>{' '}
                                punya{' '}
                                <strong>{c.courseCount} kursus</strong> dengan
                                total <strong>{c.hours} jam materi</strong> —
                                semuanya dirancang dengan proyek nyata dan
                                review mentor bersertifikat.
                            </p>
                            <ul className="grid gap-2 sm:grid-cols-2">
                                {[
                                    'Roadmap terstruktur',
                                    'AI Tutor 24/7',
                                    'Proyek portfolio',
                                    'Sertifikat resmi',
                                ].map((feat) => (
                                    <li
                                        key={feat}
                                        className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[13px] text-slate-700 dark:bg-neutral-800 dark:text-neutral-200"
                                    >
                                        <span className="grid size-4 place-items-center rounded-full bg-brand-600 text-[9px] font-bold text-white">
                                            ✓
                                        </span>
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                            <a
                                href="/courses"
                                className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-brand-700"
                            >
                                Jelajahi {c.name} <IconArrowR size={14} />
                            </a>
                        </div>
                    ),
                }}
            />
        );
    });

    return (
        <section id="courses" className="relative">
            <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <SectionHead
                        align="left"
                        eyebrow="Kursus"
                        title={
                            <>
                                Pilih dari{' '}
                                <span className="text-brand-600">
                                    {totalCourses}+ kursus
                                </span>{' '}
                                di kategori paling diminati.
                            </>
                        }
                        desc="Dari fundamental sampai topik lanjutan — semua dengan proyek nyata."
                    />
                    <a
                        href="/courses"
                        className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand-600 hover:text-brand-700"
                    >
                        Lihat semua kursus <IconArrowR size={14} />
                    </a>
                </div>

                <div className="mt-10">
                    <AppleCardsCarousel items={cards} />
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
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[11.5px] font-bold tracking-[0.14em] uppercase ring-1 ring-white/20 backdrop-blur">
                                <IconSparkle size={12} />{' '}
                                <SparklesText count={8}>AI Tutor</SparklesText>
                            </div>
                            <h2 className="mt-4 text-[32px] leading-[1.05] font-extrabold tracking-tight text-balance sm:text-[40px]">
                                Tanya apa saja, kapan saja — tutor pribadimu
                                tidak pernah tidur.
                            </h2>
                            <p className="mt-4 text-[15.5px] leading-relaxed text-pretty text-white/80">
                                Konteks materimu langsung dikenali. Penjelasan
                                dengan contoh, bukan jawaban template. Bisa
                                diminta meng-quiz, merangkum, atau membahas
                                error spesifik.
                            </p>

                            <ul className="mt-6 space-y-3">
                                {[
                                    'Penjelasan kontekstual dengan contoh praktis',
                                    'Quiz otomatis untuk mengecek pemahaman',
                                    'Tersedia dalam Bahasa Indonesia & Inggris',
                                ].map((t) => (
                                    <li
                                        key={t}
                                        className="flex items-start gap-3 text-[14.5px] text-white/90"
                                    >
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
                                <ChatBubble
                                    me
                                    text="Apa itu AIDA dalam marketing funnel?"
                                />
                                <ChatBubble text="AIDA adalah model 4 tahap perjalanan customer — dari sadar produk sampai melakukan pembelian." />
                                <InsightCard />
                                <ChatBubble
                                    me
                                    text="Bisa kasih contoh penerapannya?"
                                />
                                <ChatBubble typing />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ChatBubble({
    me,
    text,
    typing,
}: {
    me?: boolean;
    text?: string;
    typing?: boolean;
}) {
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
                    (me
                        ? 'rounded-br-md bg-brand-600 text-white'
                        : 'rounded-bl-md bg-slate-100 text-slate-800')
                }
            >
                {text}
            </div>
        </div>
    );
}

function InsightCard() {
    const steps = [
        {
            letter: 'A',
            label: 'Attention',
            desc: 'Tarik perhatian — iklan, headline, hook video',
            tint: 'bg-rose-50 text-rose-700',
            bar: 'from-rose-400 to-rose-500',
            width: 'w-full',
        },
        {
            letter: 'I',
            label: 'Interest',
            desc: 'Bangun ketertarikan dengan benefit jelas',
            tint: 'bg-amber-50 text-amber-700',
            bar: 'from-amber-400 to-orange-500',
            width: 'w-[78%]',
        },
        {
            letter: 'D',
            label: 'Desire',
            desc: 'Buat audiens benar-benar menginginkannya',
            tint: 'bg-violet-50 text-violet-700',
            bar: 'from-violet-400 to-violet-600',
            width: 'w-[55%]',
        },
        {
            letter: 'A',
            label: 'Action',
            desc: 'Ajak melakukan langkah konkret (beli, daftar)',
            tint: 'bg-emerald-50 text-emerald-700',
            bar: 'from-emerald-400 to-teal-500',
            width: 'w-[32%]',
        },
    ];

    return (
        <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
            <div className="text-[10.5px] font-bold tracking-[0.14em] text-slate-500 uppercase">
                Marketing Funnel · AIDA
            </div>
            <div className="mt-2.5 space-y-1.5">
                {steps.map((s) => (
                    <div
                        key={s.label}
                        className="flex items-center gap-2.5"
                    >
                        <span
                            className={
                                'grid size-6 shrink-0 place-items-center rounded-md text-[10px] font-extrabold ' +
                                s.tint
                            }
                        >
                            {s.letter}
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between text-[10.5px]">
                                <span className="font-semibold text-slate-700">
                                    {s.label}
                                </span>
                                <span className="text-slate-400">
                                    {s.desc}
                                </span>
                            </div>
                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white">
                                <div
                                    className={
                                        'h-full rounded-full bg-gradient-to-r ' +
                                        s.bar +
                                        ' ' +
                                        s.width
                                    }
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Stats({ stats }: { stats?: HomeStats }) {
    const items = buildStatItems(stats ?? FALLBACK_STATS);

    return (
        <section className="relative">
            <div className="mx-auto max-w-7xl px-5 pt-8 pb-16 lg:px-8">
                <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
                    {items.map((s) => (
                        <div
                            key={s.label}
                            className="rounded-2xl bg-card px-6 py-8 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70"
                        >
                            <div className="text-[36px] leading-none font-extrabold tracking-tight text-brand-600 sm:text-[42px]">
                                <NumberTicker
                                    value={s.value}
                                    suffix={s.suffix}
                                    decimals={s.decimals}
                                />
                            </div>
                            <div className="mt-2 text-[12.5px] text-slate-500">
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Testimonials({
    testimonials,
}: {
    testimonials?: HomeTestimonial[];
}) {
    const list =
        testimonials && testimonials.length > 0
            ? testimonials
            : FALLBACK_TESTIMONIALS;
    const items: Testimonial[] = list.map((t, idx) => ({
        quote: t.text,
        name: t.name,
        designation: t.role,
        gradient: TESTIMONIAL_GRADIENTS[idx % TESTIMONIAL_GRADIENTS.length],
        initials: t.name
            .split(' ')
            .map((s) => s[0])
            .slice(0, 2)
            .join(''),
    }));

    return (
        <section className="relative bg-gradient-to-b from-transparent to-brand-50/30">
            <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
                <SectionHead
                    eyebrow="Testimoni"
                    title={
                        <>
                            Cerita nyata dari{' '}
                            <span className="text-brand-600">
                                siswa Learnpath
                            </span>
                            .
                        </>
                    }
                    desc="Tidak ada review berbayar — semua dari alumni yang sudah lulus dan bekerja."
                />
                <AnimatedTestimonials testimonials={items} autoplay />
            </div>
        </section>
    );
}

function FAQ({ faqs }: { faqs?: HomeFaq[] }) {
    const list = faqs && faqs.length > 0 ? faqs : FALLBACK_FAQS;
    const [open, setOpen] = useState<number>(0);

    return (
        <section id="faq" className="relative">
            <div className="mx-auto max-w-3xl px-5 py-24 lg:px-8 lg:py-32">
                <SectionHead
                    eyebrow="FAQ"
                    title={
                        <>
                            Pertanyaan yang{' '}
                            <span className="text-brand-600">
                                sering muncul
                            </span>
                            .
                        </>
                    }
                    desc="Belum menemukan jawabanmu? Hubungi tim dukungan kami."
                />
                <div className="mt-12 divide-y divide-slate-100 overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
                    {list.map((f, i) => {
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
                                        (isOpen
                                            ? 'grid-rows-[1fr]'
                                            : 'grid-rows-[0fr]')
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
    const perks = [
        'Tanpa kartu kredit',
        'Akses kursus gratis selamanya',
        'Sertifikat untuk setiap kelulusan',
    ];

    return (
        <section className="relative">
            <div className="mx-auto max-w-7xl px-5 pb-24 lg:px-8 lg:pb-32">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true, margin: '-80px' }}
                    className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-800 to-slate-950 px-6 py-16 ring-1 ring-white/10 sm:px-12 sm:py-20"
                >
                    {/* Glow lembut di belakang konten */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -z-10"
                    >
                        <div className="absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-brand-400/30 blur-3xl" />
                        <div className="absolute -bottom-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" />
                    </div>

                    {/* Subtle grid overlay */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
                    />

                    <div className="relative flex flex-col items-center text-center">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11.5px] font-bold tracking-[0.14em] text-white uppercase ring-1 ring-white/15 backdrop-blur">
                            <IconSparkle size={12} /> Belajar tanpa batas
                        </div>

                        <h2 className="mt-5 max-w-2xl bg-gradient-to-b from-white to-slate-300 bg-clip-text text-[30px] leading-[1.08] font-extrabold tracking-tight text-balance text-transparent sm:text-[42px]">
                            Karier baru dimulai dari kebiasaan belajar yang
                            baru.
                        </h2>

                        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-300">
                            Daftar gratis dalam 30 detik dan langsung akses
                            ratusan kursus pilihan. Bayar hanya saat butuh kelas
                            premium.
                        </p>

                        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                            <Link
                                href={ctaHref}
                                className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14.5px] font-semibold text-brand-700 shadow-[0_10px_30px_-10px_rgba(255,255,255,0.4)] transition hover:-translate-y-0.5 hover:bg-brand-50"
                            >
                                Mulai sekarang
                                <IconArrowR
                                    size={15}
                                    className="transition-transform group-hover:translate-x-0.5"
                                />
                            </Link>
                            <a
                                href="#pricing"
                                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14.5px] font-semibold text-white/85 ring-1 ring-white/15 transition hover:bg-white/10 hover:text-white"
                            >
                                Lihat semua paket
                            </a>
                        </div>

                        {/* Trust row */}
                        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px] text-slate-300">
                            {perks.map((perk) => (
                                <li
                                    key={perk}
                                    className="inline-flex items-center gap-1.5"
                                >
                                    <IconCheck
                                        size={14}
                                        className="text-brand-300"
                                    />
                                    {perk}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
