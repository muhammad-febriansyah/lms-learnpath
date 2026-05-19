import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { IconCheck, IconStar } from '@/components/learnpath-icons';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="relative flex h-svh overflow-hidden">
            <BrandPanel />
            <main className="relative flex-1 overflow-y-auto">
                <div className="sticky top-0 z-10 flex items-center gap-2.5 bg-white/85 px-5 py-4 backdrop-blur-md lg:hidden">
                    <Link href={home()} className="grid size-10 place-items-center rounded-xl bg-brand-600 text-white">
                        <AppLogoIcon className="size-5" />
                    </Link>
                    <div className="leading-tight">
                        <div className="font-extrabold tracking-tight text-brand-600">Learnpath</div>
                        <div className="text-[10px] tracking-[0.16em] text-slate-500 uppercase">
                            Learn Smarter, Grow Faster
                        </div>
                    </div>
                </div>

                <div className="flex min-h-full items-center justify-center px-5 py-10 sm:px-8">
                    <div className="w-full max-w-[440px]">
                        <div className="rise rise-1 mb-6">
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold tracking-[0.16em] text-brand-700 ring-1 ring-brand-100 uppercase">
                                <span className="size-1.5 rounded-full bg-brand-600" />
                                {description ?? 'Selamat datang'}
                            </div>
                            <h2 className="mt-3 text-3xl leading-[1.1] font-extrabold tracking-tight text-balance text-slate-900 sm:text-[34px]">
                                {title ?? 'Masuk ke akun Anda'}
                            </h2>
                        </div>

                        <div className="rise rise-2 relative rounded-3xl bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_48px_-24px_rgba(18,35,125,0.18)] ring-1 ring-slate-200/70 sm:p-8">
                            <div
                                className="absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-brand-400/60 to-transparent"
                                aria-hidden="true"
                            />
                            {children}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function BrandPanel() {
    return (
        <aside className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-brand-600 p-12 text-white lg:flex xl:w-[42%] xl:p-14">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-32 -left-24 size-[420px] rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -right-24 -bottom-40 size-[480px] rounded-full bg-brand-400/30 blur-3xl" />
                <svg className="absolute inset-0 size-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="g" width="32" height="32" patternUnits="userSpaceOnUse">
                            <path d="M32 0H0V32" fill="none" stroke="white" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#g)" />
                </svg>
            </div>

            <Link href={home()} className="relative flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
                    <AppLogoIcon className="size-6 text-white" />
                </div>
                <div className="leading-tight">
                    <div className="text-xl font-extrabold tracking-tight">Learnpath</div>
                    <div className="text-[11px] tracking-[0.18em] text-white/60 uppercase">
                        Learn Smarter, Grow Faster
                    </div>
                </div>
            </Link>

            <div className="absolute top-12 right-12 hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-medium ring-1 ring-white/20 backdrop-blur xl:top-14 xl:right-14 xl:inline-flex">
                <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-300 opacity-60" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-white/85">1.284 siswa belajar sekarang</span>
            </div>

            <div className="relative space-y-9">
                <div className="max-w-[26rem] space-y-5">
                    <h1 className="text-4xl leading-[1.05] font-extrabold tracking-tight text-balance xl:text-[44px]">
                        Jalur belajarmu, <span className="text-brand-200">terarah</span> dari hari pertama.
                    </h1>
                    <p className="text-[15px] leading-relaxed text-pretty text-white/75">
                        Kurasi materi, jadwal adaptif, dan progres yang terukur — semua dalam satu tempat.
                    </p>
                </div>

                <ul className="max-w-md space-y-2.5">
                    {[
                        'Roadmap personal berbasis tujuan karier',
                        'AI Tutor 24/7 untuk semua kursus',
                        'Sertifikat & portfolio review oleh mentor',
                    ].map((f) => (
                        <li key={f} className="flex items-start gap-3 text-[14px] text-white/85">
                            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-emerald-400/20 text-emerald-300 ring-1 ring-emerald-300/30">
                                <IconCheck size={12} />
                            </span>
                            <span>{f}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="relative max-w-md rounded-2xl bg-white/8 p-5 ring-1 ring-white/15 backdrop-blur">
                <div className="flex items-center gap-4">
                    <div className="flex shrink-0 -space-x-2">
                        {[
                            'from-amber-300 to-amber-500',
                            'from-emerald-300 to-emerald-500',
                            'from-brand-300 to-brand-500',
                            'from-rose-300 to-rose-500',
                        ].map((c, i) => (
                            <div
                                key={i}
                                className={'size-8 rounded-full bg-gradient-to-br ring-2 ring-brand-600 ' + c}
                            />
                        ))}
                        <div className="grid size-8 place-items-center rounded-full bg-white/15 text-[10px] font-bold ring-2 ring-brand-600">
                            +8k
                        </div>
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1 text-amber-300">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <IconStar key={i} size={14} />
                            ))}
                            <span className="ml-1.5 text-[12px] font-semibold text-white">4,9 / 5</span>
                        </div>
                        <div className="mt-0.5 text-[12px] text-white/65">dari 8.420 ulasan siswa</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
