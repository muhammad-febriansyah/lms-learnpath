import {
    Award,
    Bot,
    ClipboardCheck,
    Map as MapIcon,
    MessageSquare,
    Sparkles,
    Users,
    Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { cn } from '@/lib/utils';

function HeaderRoadmap() {
    return (
        <div className="relative flex h-full min-h-[6rem] w-full overflow-hidden rounded-xl bg-gradient-to-br from-brand-50 via-white to-brand-50 p-4 dark:from-brand-950/40 dark:via-neutral-900 dark:to-brand-950/30">
            <div className="relative z-10 flex w-full flex-col justify-center gap-1.5">
                {[
                    { label: 'Onboarding & Mindset', done: true },
                    { label: 'Komunikasi Profesional', done: true },
                    { label: 'Negosiasi & Closing', active: true },
                    { label: 'Manajemen Tim', done: false },
                    { label: 'Strategi Bisnis', done: false },
                ].map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.4 }}
                        viewport={{ once: true }}
                        className={cn(
                            'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] ring-1',
                            s.active
                                ? 'bg-brand-600 text-white ring-brand-600'
                                : s.done
                                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                                  : 'bg-white/80 text-slate-500 ring-slate-200/70',
                        )}
                    >
                        <span
                            className={cn(
                                'grid size-3.5 place-items-center rounded-full text-[8px] font-bold',
                                s.done
                                    ? 'bg-emerald-500 text-white'
                                    : s.active
                                      ? 'bg-white text-brand-600'
                                      : 'bg-slate-200 text-slate-400',
                            )}
                        >
                            {s.done ? '✓' : i + 1}
                        </span>
                        {s.label}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function HeaderAITutor() {
    return (
        <div className="relative flex h-full min-h-[6rem] w-full flex-col items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-700 p-4">
            <div
                className="absolute -top-8 -left-8 size-32 rounded-full bg-white/10 blur-2xl"
                aria-hidden="true"
            />
            <div
                className="absolute -right-8 -bottom-8 size-32 rounded-full bg-brand-400/20 blur-2xl"
                aria-hidden="true"
            />

            <div className="relative z-10 flex w-full flex-col gap-2">
                <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-white/90 px-3 py-1.5 text-[11px] text-slate-700 backdrop-blur">
                    Apa itu OKR?
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white px-3 py-1.5 text-[11px] text-slate-700">
                    Framework target kerja:{' '}
                    <span className="rounded bg-brand-100 px-1 font-semibold text-[10px]">
                        Objective
                    </span>{' '}
                    + 3–5 Key Results terukur.
                </div>
                <div className="ml-auto flex items-center gap-1 text-[10px] text-white/70">
                    <span className="grid size-4 place-items-center rounded-full bg-white/20">
                        <Bot className="size-2.5" />
                    </span>
                    AI Tutor · Online
                </div>
            </div>
        </div>
    );
}

function HeaderMentor() {
    const avatars = [
        { color: 'from-amber-400 to-orange-500', initial: 'AP' },
        { color: 'from-emerald-400 to-teal-500', initial: 'MR' },
        { color: 'from-brand-400 to-brand-500', initial: 'DI' },
        { color: 'from-rose-400 to-pink-500', initial: 'SY' },
        { color: 'from-brand-400 to-brand-600', initial: 'FA' },
    ];

    return (
        <div className="relative flex h-full min-h-[6rem] w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 dark:from-emerald-950/30 dark:via-neutral-900 dark:to-teal-950/30">
            <div className="flex -space-x-3">
                {avatars.map((a, i) => (
                    <motion.div
                        key={a.initial}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        viewport={{ once: true }}
                        className={cn(
                            'grid size-11 place-items-center rounded-full bg-gradient-to-br text-[12px] font-bold text-white ring-4 ring-white dark:ring-neutral-950',
                            a.color,
                        )}
                    >
                        {a.initial}
                    </motion.div>
                ))}
                <div className="grid size-11 place-items-center rounded-full bg-slate-900 text-[10px] font-bold text-white ring-4 ring-white dark:ring-neutral-950">
                    +24
                </div>
            </div>
        </div>
    );
}

function HeaderAdaptive() {
    return (
        <div className="relative flex h-full min-h-[6rem] w-full overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4 dark:from-amber-950/30 dark:via-neutral-900 dark:to-orange-950/30">
            <svg
                viewBox="0 0 200 80"
                className="absolute inset-0 size-full opacity-60"
                preserveAspectRatio="none"
            >
                <motion.path
                    d="M 0 60 Q 50 20, 100 45 T 200 25"
                    stroke="url(#adapt-grad)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    viewport={{ once: true }}
                />
                <defs>
                    <linearGradient id="adapt-grad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="relative z-10 flex w-full items-end justify-between">
                <div className="rounded-lg bg-white/80 px-2 py-1 text-[10px] font-semibold text-slate-700 backdrop-blur">
                    Senin
                </div>
                <div className="rounded-lg bg-amber-500 px-2 py-1 text-[10px] font-bold text-white shadow">
                    Rabu · Aktif
                </div>
                <div className="rounded-lg bg-white/80 px-2 py-1 text-[10px] font-semibold text-slate-500 backdrop-blur">
                    Jumat
                </div>
            </div>
        </div>
    );
}

function HeaderSertifikat() {
    return (
        <div className="relative flex h-full min-h-[6rem] w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-rose-50 via-white to-pink-50 p-4 dark:from-rose-950/30 dark:via-neutral-900 dark:to-pink-950/30">
            <motion.div
                initial={{ scale: 0.85, rotate: -4 }}
                whileInView={{ scale: 1, rotate: -4 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="relative w-44 rounded-xl bg-white p-3 shadow-[0_12px_28px_-12px_rgba(244,63,94,0.4)] ring-1 ring-rose-100"
            >
                <div className="flex items-center gap-2">
                    <div className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                        <Award className="size-3.5" />
                    </div>
                    <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                        Sertifikat
                    </div>
                </div>
                <div className="mt-2 text-[11.5px] font-bold text-slate-900">
                    Talent Management Pro
                </div>
                <div className="text-[9.5px] text-slate-500">
                    Diverifikasi blockchain · #LP-8240
                </div>
                <div className="mt-2 flex items-center gap-1 text-[9px] text-emerald-600">
                    <span className="size-1.5 rounded-full bg-emerald-500" />{' '}
                    Diakui 140+ mitra HR
                </div>
            </motion.div>
        </div>
    );
}

function HeaderKomunitas() {
    return (
        <div className="relative flex h-full min-h-[6rem] w-full flex-col justify-center overflow-hidden rounded-xl bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-4 dark:from-teal-950/30 dark:via-neutral-900 dark:to-cyan-950/30">
            <div className="space-y-1.5">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-2 rounded-lg bg-white/80 px-2.5 py-1.5 ring-1 ring-teal-100"
                >
                    <div className="grid size-5 place-items-center rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-[9px] font-bold text-white">
                        AP
                    </div>
                    <div className="flex-1 text-[10.5px] text-slate-700">
                        <span className="font-semibold">Ayu</span> selesai Public Speaking
                    </div>
                    <span className="text-[9px] text-slate-400">2 mnt</span>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-2 rounded-lg bg-white/80 px-2.5 py-1.5 ring-1 ring-teal-100"
                >
                    <div className="grid size-5 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-500 text-[9px] font-bold text-white">
                        DM
                    </div>
                    <div className="flex-1 text-[10.5px] text-slate-700">
                        <span className="font-semibold">Dimas</span> share studi kasus AML
                    </div>
                    <span className="text-[9px] text-slate-400">8 mnt</span>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-2 rounded-lg bg-white/80 px-2.5 py-1.5 ring-1 ring-teal-100"
                >
                    <div className="grid size-5 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[9px] font-bold text-white">
                        MR
                    </div>
                    <div className="flex-1 text-[10.5px] text-slate-700">
                        <span className="font-semibold">Maya</span> dapat sertifikat HR
                    </div>
                    <span className="text-[9px] text-slate-400">15 mnt</span>
                </motion.div>
            </div>
        </div>
    );
}

function HeaderPenilaian() {
    return (
        <div className="relative flex h-full min-h-[6rem] w-full overflow-hidden rounded-xl bg-gradient-to-br from-brand-50 via-white to-sky-50 p-4 dark:from-brand-950/30 dark:via-neutral-900 dark:to-sky-950/30">
            <div className="relative z-10 flex w-full flex-col justify-center gap-1.5">
                <div className="text-[10px] font-bold tracking-[0.14em] text-slate-500 uppercase">
                    Quiz · Performance Review
                </div>
                {[
                    { letter: 'A', text: 'Setting SMART goals' },
                    {
                        letter: 'B',
                        text: 'Framework OKR yang terukur',
                        correct: true,
                    },
                    { letter: 'C', text: 'KPI subjektif tahunan' },
                ].map((opt, i) => (
                    <motion.div
                        key={opt.letter}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.4 }}
                        viewport={{ once: true }}
                        className={cn(
                            'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[10.5px] ring-1',
                            opt.correct
                                ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                                : 'bg-white/80 text-slate-600 ring-slate-200/70',
                        )}
                    >
                        <span
                            className={cn(
                                'grid size-4 place-items-center rounded-full text-[8.5px] font-bold',
                                opt.correct
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-100 text-slate-500',
                            )}
                        >
                            {opt.letter}
                        </span>
                        <span
                            className={cn(
                                'flex-1 truncate',
                                opt.correct && 'font-semibold',
                            )}
                        >
                            {opt.text}
                        </span>
                        {opt.correct && (
                            <span className="text-[9px] font-bold text-emerald-600">
                                ✓
                            </span>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

const ITEMS = [
    {
        title: 'Roadmap personal',
        description:
            'Jalur belajar tersusun otomatis berdasarkan tujuan karier dan level saat ini. Tidak perlu menebak harus belajar apa selanjutnya.',
        header: <HeaderRoadmap />,
        icon: <MapIcon className="size-4 text-brand-600" />,
        className: 'md:col-span-2',
    },
    {
        title: 'AI Tutor 24/7',
        description:
            'Tanya kapan saja — dapat penjelasan kontekstual lengkap dengan contoh praktis untuk kebutuhan kerjamu.',
        header: <HeaderAITutor />,
        icon: <Sparkles className="size-4 text-brand-600" />,
        className: 'md:col-span-1',
    },
    {
        title: 'Mentor bersertifikat',
        description:
            'Sesi 1-on-1 dengan praktisi senior dari BCA, Mandiri, Unilever, dan perusahaan terkemuka lain.',
        header: <HeaderMentor />,
        icon: <Users className="size-4 text-emerald-600" />,
        className: 'md:col-span-1',
    },
    {
        title: 'Sesi adaptif',
        description:
            'Jadwal & kesulitan menyesuaikan ritmemu — tidak pernah kepayahan, tidak pernah bosan.',
        header: <HeaderAdaptive />,
        icon: <Zap className="size-4 text-amber-600" />,
        className: 'md:col-span-1',
    },
    {
        title: 'Sertifikat resmi',
        description:
            'Sertifikat terverifikasi blockchain, diakui 140+ mitra HR di Asia Tenggara.',
        header: <HeaderSertifikat />,
        icon: <Award className="size-4 text-rose-600" />,
        className: 'md:col-span-1',
    },
    {
        title: 'Komunitas cohort',
        description:
            'Belajar bareng dalam batch, diskusi mingguan, dan proyek kolaboratif dengan teman seangkatan.',
        header: <HeaderKomunitas />,
        icon: <MessageSquare className="size-4 text-teal-600" />,
        className: 'md:col-span-2',
    },
    {
        title: 'Penilaian otomatis',
        description:
            'Pre-test, post-test, dan quiz dengan koreksi instan & feedback personal untuk setiap modul.',
        header: <HeaderPenilaian />,
        icon: <ClipboardCheck className="size-4 text-brand-600" />,
        className: 'md:col-span-1',
    },
];

export function FeaturesBento() {
    return (
        <BentoGrid>
            {ITEMS.map((item) => (
                <BentoGridItem
                    key={item.title as string}
                    title={item.title}
                    description={item.description}
                    header={item.header}
                    icon={item.icon}
                    className={item.className}
                />
            ))}
        </BentoGrid>
    );
}

