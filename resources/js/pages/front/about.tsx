import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Facebook,
    Instagram,
    Linkedin,
    Mail,
    MapPin,
    Phone,
    Sparkles,
    Twitter,
    Youtube,
} from 'lucide-react';
import { PageHeader } from '@/components/front/page-header';

type AboutData = {
    title: string;
    tagline: string | null;
    description: string | null;
    founded_year: number | null;
    vision: string | null;
    mission: string | null;
    values: Array<{ title: string; description: string }>;
    stats: Array<{ label: string; value: string; suffix?: string }>;
    founder_name: string | null;
    founder_role: string | null;
    founder_message: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    contact_address: string | null;
    socials: Record<string, string>;
};

const SOCIAL_ICONS = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin,
    youtube: Youtube,
} as const;

export default function AboutPage({ about }: { about: AboutData | null }) {
    return (
        <>
            <Head title={`${about?.title ?? 'Tentang Learnpath'} · Learnpath`} />

            <PageHeader
                eyebrow="Tentang Kami"
                title={about?.title ?? 'Tentang Learnpath'}
                description={about?.tagline ?? 'Belajar tanpa batas, tumbuh tanpa henti.'}
                breadcrumbs={[
                    { label: 'Beranda', href: '/' },
                    { label: 'Tentang' },
                ]}
            />

            <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
                {/* Intro */}
                {about?.description && (
                    <div className="mx-auto max-w-3xl">
                        <div
                            className="prose prose-slate prose-headings:font-extrabold prose-headings:tracking-tight prose-strong:text-slate-900 prose-p:leading-relaxed max-w-none"
                            dangerouslySetInnerHTML={{
                                __html: about.description,
                            }}
                        />
                    </div>
                )}

                {/* Stats */}
                {about?.stats && about.stats.length > 0 && (
                    <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-slate-200 ring-1 ring-slate-200 sm:grid-cols-4">
                        {about.stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="bg-white p-6 text-center"
                            >
                                <div className="text-[28px] font-extrabold tracking-tight text-brand-700 sm:text-[32px]">
                                    {stat.value}
                                    {stat.suffix ?? ''}
                                </div>
                                <div className="mt-1 text-[12.5px] font-medium text-slate-500">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Vision & Mission */}
                {(about?.vision || about?.mission) && (
                    <div className="mt-16 grid gap-6 lg:grid-cols-2">
                        {about?.vision && (
                            <div className="rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-8 text-white ring-1 ring-brand-800 sm:p-10">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10.5px] font-bold tracking-[0.14em] text-white uppercase ring-1 ring-white/20 backdrop-blur">
                                    <Sparkles className="size-3" /> Visi
                                </span>
                                <h2 className="mt-4 text-[22px] font-extrabold tracking-tight sm:text-[24px]">
                                    Arah jangka panjang kami
                                </h2>
                                <div
                                    className="prose prose-invert prose-p:leading-relaxed prose-strong:text-white mt-3 max-w-none text-white/90"
                                    dangerouslySetInnerHTML={{
                                        __html: about.vision,
                                    }}
                                />
                            </div>
                        )}
                        {about?.mission && (
                            <div className="rounded-3xl bg-white p-8 ring-1 ring-slate-200 sm:p-10">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[10.5px] font-bold tracking-[0.14em] text-brand-700 uppercase ring-1 ring-brand-100">
                                    Misi
                                </span>
                                <h2 className="mt-4 text-[22px] font-extrabold tracking-tight text-slate-900 sm:text-[24px]">
                                    Bagaimana kami mewujudkannya
                                </h2>
                                <div
                                    className="prose prose-slate prose-li:my-1 prose-ul:mt-3 mt-3 max-w-none"
                                    dangerouslySetInnerHTML={{
                                        __html: about.mission,
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Values */}
                {about?.values && about.values.length > 0 && (
                    <div className="mt-20">
                        <div className="max-w-2xl">
                            <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-[10.5px] font-bold tracking-[0.14em] text-brand-700 uppercase ring-1 ring-brand-100">
                                Values
                            </span>
                            <h2 className="mt-3 text-[28px] font-extrabold tracking-tight text-slate-900 sm:text-[32px]">
                                Nilai yang menggerakkan tim kami
                            </h2>
                        </div>
                        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {about.values.map((value, idx) => (
                                <div
                                    key={value.title}
                                    className="group relative overflow-hidden rounded-2xl bg-white p-6 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:ring-brand-200"
                                >
                                    <div className="grid size-10 place-items-center rounded-xl bg-brand-50 text-[14px] font-extrabold text-brand-700">
                                        {String(idx + 1).padStart(2, '0')}
                                    </div>
                                    <h3 className="mt-4 text-[16px] font-bold tracking-tight text-slate-900">
                                        {value.title}
                                    </h3>
                                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-600">
                                        {value.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Founder */}
                {about?.founder_message && (
                    <div className="mt-20 grid items-start gap-8 rounded-3xl bg-gradient-to-br from-brand-50 via-white to-white p-8 ring-1 ring-brand-100 sm:p-10 lg:grid-cols-[280px_1fr] lg:gap-12">
                        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                            <div className="grid size-32 place-items-center rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 text-[44px] font-extrabold text-white shadow-lg">
                                {about.founder_name?.charAt(0) ?? 'L'}
                            </div>
                            <div className="mt-4 text-[16px] font-bold text-slate-900">
                                {about.founder_name}
                            </div>
                            <div className="text-[12.5px] text-brand-700">
                                {about.founder_role}
                            </div>
                        </div>
                        <div>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-600/10 px-3 py-1 text-[10.5px] font-bold tracking-[0.14em] text-brand-700 uppercase">
                                Pesan Founder
                            </span>
                            <div
                                className="prose prose-slate prose-p:leading-relaxed prose-em:text-brand-700 mt-3 max-w-none"
                                dangerouslySetInnerHTML={{
                                    __html: about.founder_message,
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Contact card */}
                <div className="mt-20 grid gap-6 rounded-3xl bg-slate-950 p-8 text-white ring-1 ring-slate-800 sm:p-10 lg:grid-cols-[1.4fr_1fr]">
                    <div>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10.5px] font-bold tracking-[0.14em] text-white uppercase ring-1 ring-white/15">
                            Hubungi Kami
                        </span>
                        <h2 className="mt-3 max-w-md text-[24px] font-extrabold tracking-tight sm:text-[28px]">
                            Ada pertanyaan? Tim kami siap membantu.
                        </h2>
                        <p className="mt-2 max-w-md text-[14px] text-slate-300">
                            Untuk demo enterprise, kerja sama instruktur, atau
                            pertanyaan umum — kami balas dalam 1x24 jam kerja.
                        </p>
                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-brand-700 transition hover:-translate-y-0.5 hover:bg-brand-50"
                            >
                                Kirim Pesan{' '}
                                <ArrowRight className="size-4" />
                            </Link>
                            {about?.contact_email && (
                                <a
                                    href={`mailto:${about.contact_email}`}
                                    className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[14px] font-semibold text-white/85 ring-1 ring-white/20 transition hover:bg-white/10 hover:text-white"
                                >
                                    {about.contact_email}
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3 text-[13.5px]">
                        {about?.contact_email && (
                            <a
                                href={`mailto:${about.contact_email}`}
                                className="flex items-start gap-3 rounded-xl bg-white/5 p-4 ring-1 ring-white/10 transition hover:bg-white/10"
                            >
                                <Mail className="size-4 text-brand-300" />
                                <div>
                                    <div className="text-[11px] tracking-[0.14em] text-white/60 uppercase">
                                        Email
                                    </div>
                                    <div className="font-semibold text-white">
                                        {about.contact_email}
                                    </div>
                                </div>
                            </a>
                        )}
                        {about?.contact_phone && (
                            <div className="flex items-start gap-3 rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                                <Phone className="size-4 text-brand-300" />
                                <div>
                                    <div className="text-[11px] tracking-[0.14em] text-white/60 uppercase">
                                        Telepon
                                    </div>
                                    <div className="font-semibold text-white">
                                        {about.contact_phone}
                                    </div>
                                </div>
                            </div>
                        )}
                        {about?.contact_address && (
                            <div className="flex items-start gap-3 rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                                <MapPin className="mt-0.5 size-4 text-brand-300" />
                                <div>
                                    <div className="text-[11px] tracking-[0.14em] text-white/60 uppercase">
                                        Alamat
                                    </div>
                                    <div className="font-semibold whitespace-pre-line text-white">
                                        {about.contact_address}
                                    </div>
                                </div>
                            </div>
                        )}

                        {about?.socials && Object.keys(about.socials).length > 0 && (
                            <div className="flex items-center gap-2 pt-2">
                                {Object.entries(about.socials).map(([key, url]) => {
                                    const Icon =
                                        SOCIAL_ICONS[key as keyof typeof SOCIAL_ICONS];

                                    if (!Icon || !url) return null;

                                    return (
                                        <a
                                            key={key}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={key}
                                            className="grid size-9 place-items-center rounded-full bg-white/10 text-white/80 ring-1 ring-white/15 transition hover:-translate-y-0.5 hover:bg-white/20 hover:text-white"
                                        >
                                            <Icon className="size-4" />
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
