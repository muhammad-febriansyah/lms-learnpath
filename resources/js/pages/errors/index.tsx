import { Head, Link } from '@inertiajs/react';
import type { FileWarning } from 'lucide-react';
import {
    ArrowLeft,
    Compass,
    Home,
    Lock,
    RefreshCcw,
    ServerCrash,
    ShieldAlert,
    TimerReset,
    Wrench,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

type Props = {
    status: number;
    message?: string | null;
    site?: {
        site_name?: string | null;
        site_logo_url?: string | null;
    } | null;
};

type Meta = {
    title: string;
    headline: string;
    description: string;
    icon: typeof FileWarning;
    accent: string;
    accentBg: string;
    accentRing: string;
};

const META: Record<number, Meta> = {
    403: {
        title: 'Akses ditolak',
        headline: 'Anda tidak punya akses',
        description:
            'Akun Anda tidak memiliki izin untuk membuka halaman ini. Hubungi admin jika menurut Anda ini keliru.',
        icon: ShieldAlert,
        accent: 'text-amber-600',
        accentBg: 'from-amber-100 to-amber-200',
        accentRing: 'ring-amber-200',
    },
    404: {
        title: 'Halaman tidak ditemukan',
        headline: 'Halaman ini hilang',
        description:
            'Tautan yang Anda buka mungkin sudah dihapus, dipindahkan, atau tidak pernah ada.',
        icon: Compass,
        accent: 'text-brand-600',
        accentBg: 'from-brand-100 to-brand-200',
        accentRing: 'ring-brand-200',
    },
    419: {
        title: 'Sesi kedaluwarsa',
        headline: 'Sesi Anda berakhir',
        description:
            'Untuk keamanan, sesi Anda otomatis berakhir setelah tidak aktif. Silakan muat ulang dan coba lagi.',
        icon: TimerReset,
        accent: 'text-violet-600',
        accentBg: 'from-violet-100 to-violet-200',
        accentRing: 'ring-violet-200',
    },
    429: {
        title: 'Terlalu banyak permintaan',
        headline: 'Pelan-pelan dulu',
        description:
            'Anda mengirim permintaan terlalu sering. Tunggu beberapa saat lalu coba lagi.',
        icon: RefreshCcw,
        accent: 'text-rose-600',
        accentBg: 'from-rose-100 to-rose-200',
        accentRing: 'ring-rose-200',
    },
    500: {
        title: 'Terjadi kesalahan',
        headline: 'Ada masalah di server',
        description:
            'Maaf, ada yang tidak beres di sisi kami. Tim teknis sudah diberi tahu — coba lagi sebentar lagi.',
        icon: ServerCrash,
        accent: 'text-rose-600',
        accentBg: 'from-rose-100 to-rose-200',
        accentRing: 'ring-rose-200',
    },
    503: {
        title: 'Sedang maintenance',
        headline: 'Kami sedang berbenah',
        description:
            'Layanan sementara tidak tersedia karena pemeliharaan. Silakan coba lagi beberapa menit lagi.',
        icon: Wrench,
        accent: 'text-slate-600',
        accentBg: 'from-slate-100 to-slate-200',
        accentRing: 'ring-slate-200',
    },
};

function metaFor(status: number): Meta {
    if (META[status]) {
        return META[status];
    }

    if (status >= 500) {
        return META[500];
    }

    if (status >= 400) {
        return META[404];
    }

    return META[500];
}

export default function ErrorPage({ status, message, site }: Props) {
    const meta = metaFor(status);
    const Icon = meta.icon;
    const brandName = site?.site_name?.trim() || 'Learnpath';
    const brandLogoUrl = site?.site_logo_url ?? null;

    return (
        <>
            <Head title={`${status} · ${meta.title} · ${brandName}`} />
            <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-brand-50/40">
                {/* Decorative blobs */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute -top-32 -left-24 size-96 rounded-full bg-brand-200/40 blur-3xl"
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute -right-32 bottom-0 size-[28rem] rounded-full bg-amber-100/40 blur-3xl"
                />

                <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-5 py-12 sm:px-8">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="mb-10 inline-flex items-center gap-2.5 transition hover:opacity-80"
                    >
                        {brandLogoUrl ? (
                            <img
                                src={brandLogoUrl}
                                alt={brandName}
                                className="h-9 w-auto max-w-[180px] object-contain"
                            />
                        ) : (
                            <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white shadow-[0_8px_18px_-10px_rgba(18,35,125,0.6)]">
                                <span className="text-[14px] font-extrabold">
                                    {brandName.charAt(0).toUpperCase()}
                                </span>
                            </span>
                        )}
                        <span className="text-[17px] font-extrabold tracking-tight text-slate-900">
                            {brandName}
                        </span>
                    </Link>

                    {/* Big number + Icon */}
                    <div className="relative mb-8 flex items-center justify-center">
                        <div
                            className={
                                'absolute inset-0 -z-10 mx-auto size-48 rounded-full bg-gradient-to-br ' +
                                meta.accentBg +
                                ' blur-2xl opacity-60'
                            }
                            aria-hidden
                        />
                        <div className="text-center">
                            <div
                                className={
                                    'mx-auto mb-4 grid size-20 place-items-center rounded-2xl bg-white shadow-[0_8px_30px_-12px_rgba(15,23,42,0.25)] ring-1 ' +
                                    meta.accentRing
                                }
                            >
                                <Icon className={'size-10 ' + meta.accent} />
                            </div>
                            <div className="font-mono text-[64px] font-extrabold leading-none tracking-tight text-slate-900 sm:text-[96px]">
                                {status}
                            </div>
                            <div className="mt-2 text-[11.5px] font-bold tracking-[0.18em] text-slate-400 uppercase">
                                {meta.title}
                            </div>
                        </div>
                    </div>

                    {/* Copy */}
                    <div className="max-w-xl text-center">
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                            {meta.headline}
                        </h1>
                        <p className="mt-3 text-[14px] leading-relaxed text-slate-600">
                            {meta.description}
                        </p>
                        {message && status !== 500 && (
                            <p className="mt-3 inline-block max-w-md rounded-xl bg-slate-100 px-3 py-2 text-[12.5px] text-slate-600">
                                <span className="font-semibold text-slate-700">Detail:</span>{' '}
                                {message}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
                        <Button
                            asChild
                            className="rounded-xl bg-brand-600 px-5 py-5 text-[14px] font-bold text-white hover:bg-brand-700"
                        >
                            <Link href="/">
                                <Home className="mr-1.5 size-4" />
                                Ke beranda
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="rounded-xl px-5 py-5 text-[14px] font-semibold"
                        >
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();

                                    if (window.history.length > 1) {
                                        window.history.back();
                                    } else {
                                        window.location.href = '/';
                                    }
                                }}
                            >
                                <ArrowLeft className="mr-1.5 size-4" />
                                Kembali
                            </a>
                        </Button>
                        {status === 419 && (
                            <Button
                                asChild
                                variant="outline"
                                className="rounded-xl px-5 py-5 text-[14px] font-semibold"
                            >
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        window.location.reload();
                                    }}
                                >
                                    <RefreshCcw className="mr-1.5 size-4" />
                                    Muat ulang
                                </a>
                            </Button>
                        )}
                    </div>

                    {/* Help links */}
                    <div className="mt-12 grid w-full max-w-2xl gap-2 sm:grid-cols-3">
                        <HelpCard
                            href="/courses"
                            icon={Compass}
                            title="Jelajahi katalog"
                            description="Temukan course yang relevan"
                        />
                        <HelpCard
                            href="/dashboard"
                            icon={Home}
                            title="Dashboard Anda"
                            description="Kembali ke ruang belajar"
                        />
                        <HelpCard
                            href="/login"
                            icon={Lock}
                            title="Masuk lagi"
                            description="Jika sesi kedaluwarsa"
                        />
                    </div>

                    <p className="mt-10 text-[11.5px] text-slate-400">
                        Kode error: <span className="font-mono">{status}</span> · {brandName}
                    </p>
                </div>
            </main>
        </>
    );
}

function HelpCard({
    href,
    icon: Icon,
    title,
    description,
}: {
    href: string;
    icon: typeof Home;
    title: string;
    description: string;
}) {
    return (
        <Link
            href={href}
            className="group rounded-2xl border border-slate-200 bg-white/70 p-4 backdrop-blur transition hover:border-brand-300 hover:bg-white"
        >
            <div className="flex items-start gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-brand-50 group-hover:text-brand-600">
                    <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                    <div className="text-[13px] font-bold text-slate-900">{title}</div>
                    <div className="text-[11.5px] text-slate-500">{description}</div>
                </div>
            </div>
        </Link>
    );
}
