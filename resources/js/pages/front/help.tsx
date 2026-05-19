import { Head, Link } from '@inertiajs/react';
import {
    Award,
    BookOpenText,
    Building2,
    CreditCard,
    GraduationCap,
    LifeBuoy,
    MessageCircle,
    Search,
    Settings,
    Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/front/page-header';

type Faq = { id: number; category: string; question: string; answer: string };

const TOPICS = [
    {
        title: 'Memulai',
        desc: 'Daftar akun, lengkapi profil, dan pilih kursus pertama Anda.',
        icon: Sparkles,
        color: 'bg-brand-50 text-brand-700',
        articles: ['Cara daftar akun', 'Verifikasi email', 'Lengkapi profil'],
    },
    {
        title: 'Kursus & Belajar',
        desc: 'Enrollment, akses materi, dan tracking progress.',
        icon: GraduationCap,
        color: 'bg-brand-50 text-brand-700',
        articles: ['Enroll kursus', 'Akses video offline', 'Tracking progress'],
    },
    {
        title: 'Sertifikat',
        desc: 'Syarat kelulusan dan cara unduh sertifikat.',
        icon: Award,
        color: 'bg-amber-50 text-amber-700',
        articles: [
            'Cara dapat sertifikat',
            'Verifikasi sertifikat',
            'Sertifikat learning path',
        ],
    },
    {
        title: 'Pembayaran',
        desc: 'Metode pembayaran, invoice, dan refund.',
        icon: CreditCard,
        color: 'bg-emerald-50 text-emerald-700',
        articles: ['Metode pembayaran', 'Pakai kupon', 'Kebijakan refund'],
    },
    {
        title: 'Korporat',
        desc: 'Manajemen tenant, seat, dan laporan belajar.',
        icon: Building2,
        color: 'bg-sky-50 text-sky-700',
        articles: ['Undang karyawan', 'Atur learning path internal', 'Lihat laporan'],
    },
    {
        title: 'Pengaturan Akun',
        desc: 'Profil, keamanan, dan notifikasi.',
        icon: Settings,
        color: 'bg-rose-50 text-rose-700',
        articles: ['Ganti password', 'Aktifkan 2FA', 'Atur notifikasi email'],
    },
];

export default function HelpPage({ popular_faqs }: { popular_faqs: Faq[] }) {
    const [query, setQuery] = useState('');

    const filteredFaqs = useMemo(() => {
        const q = query.trim().toLowerCase();

        if (!q) return popular_faqs;

        return popular_faqs.filter(
            (f) =>
                f.question.toLowerCase().includes(q) ||
                f.answer.toLowerCase().includes(q),
        );
    }, [popular_faqs, query]);

    return (
        <>
            <Head title="Pusat Bantuan · Learnpath" />

            <PageHeader
                eyebrow="Pusat Bantuan"
                title="Apa yang bisa kami bantu hari ini?"
                description="Jelajahi panduan, tonton video tutorial, atau hubungi tim support kami."
                align="center"
                breadcrumbs={[
                    { label: 'Beranda', href: '/' },
                    { label: 'Bantuan' },
                ]}
            >
                <div className="relative mx-auto max-w-2xl">
                    <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/60" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Cari panduan, fitur, atau pertanyaan..."
                        className="block w-full rounded-full border border-white/15 bg-white/10 px-12 py-4 text-[14.5px] text-white placeholder:text-white/60 backdrop-blur focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                </div>
            </PageHeader>

            <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
                {/* Topic grid */}
                <div className="max-w-2xl">
                    <h2 className="text-[24px] font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                        Topik populer
                    </h2>
                    <p className="mt-2 text-[14px] text-slate-600">
                        Klik topik untuk lihat semua panduan terkait.
                    </p>
                </div>

                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {TOPICS.map((topic) => (
                        <Link
                            key={topic.title}
                            href="#"
                            className="group rounded-2xl bg-white p-6 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:ring-brand-200"
                        >
                            <span
                                className={`grid size-11 place-items-center rounded-xl ${topic.color}`}
                            >
                                <topic.icon className="size-5" />
                            </span>
                            <h3 className="mt-4 text-[16px] font-bold tracking-tight text-slate-900">
                                {topic.title}
                            </h3>
                            <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-600">
                                {topic.desc}
                            </p>
                            <ul className="mt-4 space-y-1.5 text-[12.5px] text-slate-500">
                                {topic.articles.map((a) => (
                                    <li
                                        key={a}
                                        className="flex items-center gap-2"
                                    >
                                        <BookOpenText className="size-3 text-brand-500" />
                                        {a}
                                    </li>
                                ))}
                            </ul>
                            <span className="mt-4 inline-flex text-[12.5px] font-semibold text-brand-700 group-hover:underline">
                                Lihat semua →
                            </span>
                        </Link>
                    ))}
                </div>

                {/* Popular FAQ */}
                <div className="mt-20">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <h2 className="text-[24px] font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                                Pertanyaan paling sering ditanyakan
                            </h2>
                            <p className="mt-2 text-[14px] text-slate-600">
                                Jawaban cepat untuk kebutuhan paling umum.
                            </p>
                        </div>
                        <Link
                            href="/faq"
                            className="hidden text-[13px] font-semibold text-brand-700 hover:underline sm:inline"
                        >
                            Lihat semua FAQ →
                        </Link>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        {filteredFaqs.map((f) => (
                            <details
                                key={f.id}
                                className="group rounded-2xl bg-white p-5 ring-1 ring-slate-200 open:ring-brand-200"
                            >
                                <summary className="flex cursor-pointer items-start justify-between gap-3 text-[14px] font-semibold text-slate-900 marker:hidden">
                                    <span>{f.question}</span>
                                    <span className="mt-0.5 text-brand-600 transition group-open:rotate-45">
                                        +
                                    </span>
                                </summary>
                                <p className="mt-3 text-[13px] leading-relaxed text-slate-600">
                                    {f.answer}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>

                {/* Contact card */}
                <div className="mt-20 grid gap-6 rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-8 text-white ring-1 ring-brand-800 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10.5px] font-bold tracking-[0.14em] text-white uppercase ring-1 ring-white/20">
                            <LifeBuoy className="size-3" /> Butuh bantuan lebih?
                        </span>
                        <h2 className="mt-3 text-[22px] font-extrabold tracking-tight sm:text-[26px]">
                            Tim support kami siap membantu
                        </h2>
                        <p className="mt-2 max-w-xl text-[14px] text-white/85">
                            Senin – Jumat, 09.00 – 18.00 WIB. Untuk urgent
                            issue, gunakan WhatsApp untuk respon lebih cepat.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-brand-700 transition hover:-translate-y-0.5 hover:bg-brand-50"
                        >
                            <MessageCircle className="size-4" />
                            Kirim Pesan
                        </Link>
                        <a
                            href="https://wa.me/6281234567890"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-[14px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600"
                        >
                            <MessageCircle className="size-4" /> WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
