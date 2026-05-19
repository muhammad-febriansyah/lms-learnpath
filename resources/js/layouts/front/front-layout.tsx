import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    BadgePercent,
    Bell,
    Briefcase,
    Building2,
    Code2,
    CreditCard,
    Database,
    GraduationCap,
    Home,
    Instagram,
    Languages,
    LayoutDashboard,
    Linkedin,
    LogOut,
    Mail,
    Megaphone,
    MessageCircle,
    MessageSquare,
    Palette,
    Play,
    Route as RouteIcon,
    Settings,
    Sparkles,
    Twitter,
    Users,
    Youtube,
} from 'lucide-react';
import { useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { FlashListener } from '@/components/flash-listener';
import { FloatingActions } from '@/components/front/floating-actions';
import { MobileBottomNav } from '@/components/front/mobile-bottom-nav';
import { NavHelpDropdown } from '@/components/front/nav-help-dropdown';
import { NavMegaMenu } from '@/components/front/nav-mega-menu';
import { NavNotifications } from '@/components/front/nav-notifications';
import { NavResumeCta } from '@/components/front/nav-resume-cta';
import { NavSearch } from '@/components/front/nav-search';
import { NavUserMenu } from '@/components/front/nav-user-menu';
import { PromoBanner } from '@/components/front/promo-banner';
import { IconArrowR } from '@/components/learnpath-icons';
import {
    MobileNav,
    MobileNavHeader,
    MobileNavMenu,
    MobileNavToggle,
    NavBody,
    Navbar,
    NavbarLogo,
} from '@/components/ui/resizable-navbar';
import { login, register } from '@/routes';
import * as corporateRoutes from '@/routes/corporate';
import * as coursesRoutes from '@/routes/courses';
import * as pathsRoutes from '@/routes/paths';
import type { User } from '@/types';

const COURSES_MENU = [
    {
        title: 'Populer',
        items: [
            {
                icon: Code2,
                label: 'Pengembangan Web',
                desc: '48 kursus · 320 jam',
                href: '/courses?category=web',
                tint: 'bg-brand-50 text-brand-600',
            },
            {
                icon: Database,
                label: 'Data & AI',
                desc: '36 kursus · 280 jam',
                href: '/courses?category=data',
                tint: 'bg-violet-50 text-violet-600',
            },
            {
                icon: Palette,
                label: 'Desain Produk',
                desc: '24 kursus · 190 jam',
                href: '/courses?category=design',
                tint: 'bg-teal-50 text-teal-600',
            },
        ],
    },
    {
        title: 'Lainnya',
        items: [
            {
                icon: Briefcase,
                label: 'Bisnis & Karier',
                desc: '18 kursus · 140 jam',
                href: '/courses?category=business',
                tint: 'bg-amber-50 text-amber-600',
            },
            {
                icon: Languages,
                label: 'Bahasa Inggris',
                desc: '12 kursus · 96 jam',
                href: '/courses?category=english',
                tint: 'bg-rose-50 text-rose-600',
            },
            {
                icon: MessageSquare,
                label: 'Soft Skills',
                desc: '14 kursus · 110 jam',
                href: '/courses?category=soft-skills',
                tint: 'bg-slate-100 text-slate-600',
            },
        ],
    },
];

const BUSINESS_MENU = [
    {
        title: 'Untuk Bisnis',
        items: [
            {
                icon: Building2,
                label: 'Learnpath untuk Tim',
                desc: 'Skalakan pembelajaran karyawan dari 5 sampai 5.000 orang',
                href: corporateRoutes.index().url,
                tint: 'bg-brand-50 text-brand-600',
            },
            {
                icon: Megaphone,
                label: 'Paket Harga',
                desc: 'Lihat paket Starter, Growth, Pro, dan Enterprise',
                href: '/corporate/pricing',
                tint: 'bg-amber-50 text-amber-600',
            },
            {
                icon: Sparkles,
                label: 'Studi Kasus',
                desc: 'Cerita transformasi tim dari berbagai industri',
                href: '/corporate/case-studies',
                tint: 'bg-violet-50 text-violet-600',
            },
        ],
    },
];

type FooterLink = { label: string; href: string };
type FooterColumn = { title: string; links: FooterLink[] };

const FOOTER_LINKS: FooterColumn[] = [
    {
        title: 'Produk',
        links: [
            { label: 'Kursus', href: '/courses' },
            { label: 'Learning Path', href: '/paths' },
            { label: 'Bundle', href: '/bundles' },
            { label: 'Langganan Personal', href: '/subscribe' },
            { label: 'Untuk Bisnis', href: '/corporate' },
            { label: 'Paket Harga', href: '/corporate/pricing' },
            { label: 'Studi Kasus', href: '/corporate/case-studies' },
        ],
    },
    {
        title: 'Perusahaan',
        links: [
            { label: 'Tentang', href: '/about' },
            { label: 'Karier', href: '/careers' },
            { label: 'Blog', href: '/blog' },
            { label: 'Kontak', href: '/contact' },
        ],
    },
    {
        title: 'Sumber Daya',
        links: [
            { label: 'Pusat Bantuan', href: '/help' },
            { label: 'FAQ', href: '/faq' },
            { label: 'Status sistem', href: '#' },
            { label: 'Roadmap publik', href: '#' },
        ],
    },
    {
        title: 'Legal',
        links: [
            { label: 'Syarat & Ketentuan', href: '/terms' },
            { label: 'Kebijakan Privasi', href: '/privacy' },
        ],
    },
];

type NavCategory = {
    name: string;
    slug: string;
    courses_count: number;
};

type FrontPageProps = {
    auth?: { user: User | null };
    canRegister?: boolean;
    navCategories?: NavCategory[];
    site?: {
        site_name?: string | null;
        site_logo_url?: string | null;
    };
};

type SiteBrand = {
    name: string;
    logoUrl: string | null;
};

const CATEGORY_TINTS = [
    'bg-brand-50 text-brand-600',
    'bg-violet-50 text-violet-600',
    'bg-teal-50 text-teal-600',
    'bg-amber-50 text-amber-600',
    'bg-rose-50 text-rose-600',
    'bg-emerald-50 text-emerald-600',
    'bg-sky-50 text-sky-600',
    'bg-slate-100 text-slate-600',
];

function pickCategoryIcon(slug: string) {
    const s = slug.toLowerCase();

    if (s.match(/web|frontend|backend|develop|program|code|engineer/)) {
        return Code2;
    }

    if (s.match(/data|ai|machine|analyt|bi|science/)) {
        return Database;
    }

    if (s.match(/desain|design|ui|ux|product/)) {
        return Palette;
    }

    if (s.match(/bisnis|business|karier|career|marketing|sales|leader/)) {
        return Briefcase;
    }

    if (s.match(/bahasa|language|english|inggris/)) {
        return Languages;
    }

    if (s.match(/soft|komunikasi|communic/)) {
        return MessageSquare;
    }

    if (s.match(/compliance|legal|hukum/)) {
        return Award;
    }

    return GraduationCap;
}

function buildCoursesMenu(categories: NavCategory[]) {
    if (!categories || categories.length === 0) {
        return null;
    }

    const popular = categories.slice(0, 3);
    const others = categories.slice(3, 6);

    const mapItem = (cat: NavCategory, idx: number) => ({
        icon: pickCategoryIcon(cat.slug),
        label: cat.name,
        desc: `${cat.courses_count} kursus tersedia`,
        href: `/courses?category=${cat.slug}`,
        tint: CATEGORY_TINTS[idx % CATEGORY_TINTS.length],
    });

    const columns = [
        { title: 'Populer', items: popular.map((c, i) => mapItem(c, i)) },
    ];

    if (others.length > 0) {
        columns.push({
            title: 'Lainnya',
            items: others.map((c, i) => mapItem(c, i + 3)),
        });
    }

    return columns;
}

export default function FrontLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const {
        auth,
        canRegister = true,
        navCategories = [],
        site,
    } = usePage<FrontPageProps>().props;
    const user = auth?.user ?? null;
    const dynamicCoursesMenu = buildCoursesMenu(navCategories);
    const brand: SiteBrand = {
        name: site?.site_name?.trim() || 'Learnpath',
        logoUrl: site?.site_logo_url ?? null,
    };

    return (
        <div className="flex min-h-screen flex-col bg-surface text-slate-800">
            <FlashListener />
            <PromoBanner />
            <FrontNav
                user={user}
                canRegister={canRegister}
                coursesMenu={dynamicCoursesMenu ?? COURSES_MENU}
                brand={brand}
            />
            <main className="flex-1 pb-20 lg:pb-0">{children}</main>
            <FrontFooter />
            <MobileBottomNav user={user} />
            <FloatingActions />
        </div>
    );
}

function FrontNav({
    user,
    canRegister,
    coursesMenu,
    brand,
}: {
    user: User | null;
    canRegister: boolean;
    coursesMenu: typeof COURSES_MENU;
    brand: SiteBrand;
}) {
    const [open, setOpen] = useState(false);
    const { url: currentUrl } = usePage();
    const isAuthed = !!user;

    const loginUrl = login().url;
    const registerUrl = register().url;
    const pathsUrl = pathsRoutes.index().url;
    const coursesUrl = coursesRoutes.index().url;
    const corporateUrl = corporateRoutes.index().url;

    const isHomeActive = currentUrl === '/' || currentUrl === '';
    const isCoursesActive = currentUrl.startsWith('/courses');
    const isPathsActive = currentUrl.startsWith('/paths');
    const isCorporateActive = currentUrl.startsWith('/corporate');

    return (
        <Navbar>
            <NavBody>
                <NavbarLogo href="/">
                    {brand.logoUrl ? (
                        <img
                            src={brand.logoUrl}
                            alt={brand.name}
                            className="block h-20 w-auto object-cover"
                        />
                    ) : (
                        <>
                            <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white">
                                <AppLogoIcon className="size-5" />
                            </span>
                            <span className="text-[17px] font-extrabold tracking-tight text-slate-900 dark:text-white">
                                {brand.name}
                            </span>
                        </>
                    )}
                </NavbarLogo>

                <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 xl:flex">
                    <Link
                        href="/"
                        aria-current={isHomeActive ? 'page' : undefined}
                        className={
                            'shrink-0 rounded-full px-3 py-2 text-sm font-medium transition 2xl:px-4 ' +
                            (isHomeActive
                                ? 'dark:bg-brand-950/40 bg-brand-50 text-brand-700 dark:text-brand-300'
                                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white')
                        }
                    >
                        Beranda
                    </Link>
                    <NavMegaMenu
                        label="Kursus"
                        columns={coursesMenu}
                        width="lg"
                        active={isCoursesActive}
                    />
                    <a
                        href={pathsUrl}
                        aria-current={isPathsActive ? 'page' : undefined}
                        className={
                            'shrink-0 rounded-full px-3 py-2 text-sm font-medium transition 2xl:px-4 ' +
                            (isPathsActive
                                ? 'dark:bg-brand-950/40 bg-brand-50 text-brand-700 dark:text-brand-300'
                                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white')
                        }
                    >
                        Learning Path
                    </a>
                    <NavMegaMenu
                        label="Untuk Bisnis"
                        columns={BUSINESS_MENU}
                        width="md"
                        active={isCorporateActive}
                    />
                </div>

                <div className="relative z-20 flex shrink-0 items-center gap-1.5">
                    <NavSearch />
                    <NavHelpDropdown />
                    <span
                        aria-hidden="true"
                        className="mx-1 h-5 w-px bg-slate-200 dark:bg-neutral-800"
                    />
                    {isAuthed ? (
                        <>
                            <NavResumeCta />
                            <NavNotifications />
                            <NavUserMenu user={user} />
                        </>
                    ) : (
                        <>
                            <a
                                href={loginUrl}
                                className="inline-flex shrink-0 items-center rounded-full bg-white px-4 py-2.5 text-[13.5px] font-semibold whitespace-nowrap text-slate-700 ring-1 ring-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-50 hover:text-brand-700 hover:ring-brand-200 2xl:px-5 dark:bg-neutral-900 dark:text-neutral-200 dark:ring-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-brand-300 dark:hover:ring-neutral-600"
                            >
                                Masuk
                            </a>
                            {canRegister && (
                                <a
                                    href={registerUrl}
                                    className="group inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2.5 text-[13.5px] font-semibold whitespace-nowrap text-white shadow-[0_8px_18px_-10px_rgba(18,35,125,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-[0_10px_24px_-10px_rgba(18,35,125,0.75)] 2xl:px-5"
                                >
                                    Mulai gratis
                                    <IconArrowR
                                        size={14}
                                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                                    />
                                </a>
                            )}
                        </>
                    )}
                </div>
            </NavBody>

            <MobileNav>
                <MobileNavHeader>
                    <Link
                        href="/"
                        className="relative z-20 flex items-center gap-2.5 px-2 py-1"
                    >
                        {brand.logoUrl ? (
                            <img
                                src={brand.logoUrl}
                                alt={brand.name}
                                className="block h-12 w-auto max-w-[200px] object-contain"
                            />
                        ) : (
                            <>
                                <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white">
                                    <AppLogoIcon className="size-5" />
                                </span>
                                <span className="text-[17px] font-extrabold tracking-tight text-slate-900 dark:text-white">
                                    {brand.name}
                                </span>
                            </>
                        )}
                    </Link>
                    <div className="flex items-center gap-1">
                        <NavSearch />
                        {isAuthed && <NavNotifications />}
                        <MobileNavToggle
                            isOpen={open}
                            onClick={() => setOpen((o) => !o)}
                        />
                    </div>
                </MobileNavHeader>

                <MobileNavMenu isOpen={open} onClose={() => setOpen(false)}>
                    {isAuthed && user && (
                        <Link
                            href="/dashboard"
                            onClick={() => setOpen(false)}
                            className="flex w-full items-center gap-3 rounded-xl bg-brand-50 px-3 py-3 ring-1 ring-brand-100"
                        >
                            <span className="grid size-9 place-items-center rounded-full bg-brand-600 text-white">
                                <LayoutDashboard className="size-4" />
                            </span>
                            <span className="flex-1">
                                <span className="block text-[13px] font-bold text-slate-900">
                                    {user.name}
                                </span>
                                <span className="block text-[11.5px] text-brand-700">
                                    Buka Dasbor →
                                </span>
                            </span>
                        </Link>
                    )}

                    <MobileMenuGroup
                        label="Jelajahi"
                        items={[
                            {
                                icon: Home,
                                label: 'Beranda',
                                href: '/',
                            },
                            {
                                icon: GraduationCap,
                                label: 'Kursus',
                                href: coursesUrl,
                            },
                            {
                                icon: RouteIcon,
                                label: 'Learning Path',
                                href: pathsUrl,
                            },
                            {
                                icon: Building2,
                                label: 'Untuk Bisnis',
                                href: corporateUrl,
                            },
                        ]}
                        onItem={() => setOpen(false)}
                    />

                    {isAuthed && (
                        <MobileMenuGroup
                            label="Akun"
                            items={[
                                {
                                    icon: GraduationCap,
                                    label: 'Kursus Saya',
                                    href: '/my-courses',
                                },
                                {
                                    icon: RouteIcon,
                                    label: 'Learning Path Saya',
                                    href: '/my-paths',
                                },
                                {
                                    icon: Award,
                                    label: 'Sertifikat Saya',
                                    href: '/my-certificates',
                                },
                                {
                                    icon: Bell,
                                    label: 'Notifikasi',
                                    href: '/notifications',
                                },
                                {
                                    icon: Settings,
                                    label: 'Pengaturan',
                                    href: '/settings/profile',
                                },
                            ]}
                            onItem={() => setOpen(false)}
                        />
                    )}

                    {!isAuthed && (
                        <MobileMenuGroup
                            label="Promo"
                            items={[
                                {
                                    icon: BadgePercent,
                                    label: 'Diskon 40% untuk pelajar',
                                    href: '/#pricing',
                                },
                                {
                                    icon: Users,
                                    label: 'Paket Tim untuk perusahaan',
                                    href: corporateUrl,
                                },
                                {
                                    icon: CreditCard,
                                    label: 'Coba 7 hari gratis',
                                    href: registerUrl,
                                },
                            ]}
                            onItem={() => setOpen(false)}
                        />
                    )}

                    <div className="flex w-full gap-2 pt-2">
                        {isAuthed ? (
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                onClick={() => setOpen(false)}
                                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-rose-50 py-2.5 text-[13.5px] font-semibold text-rose-700 ring-1 ring-rose-100"
                            >
                                <LogOut className="size-4" /> Keluar
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    onClick={() => setOpen(false)}
                                    className="flex-1 rounded-full py-2.5 text-center text-[13.5px] font-semibold text-slate-700 ring-1 ring-slate-200 dark:text-neutral-200 dark:ring-neutral-700"
                                >
                                    Masuk
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        onClick={() => setOpen(false)}
                                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-600 py-2.5 text-center text-[13.5px] font-semibold text-white"
                                    >
                                        Mulai gratis{' '}
                                        <Play className="size-3 fill-white" />
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                </MobileNavMenu>
            </MobileNav>
        </Navbar>
    );
}

type MobileMenuItem = {
    icon: typeof Sparkles;
    label: string;
    href: string;
};

function MobileMenuGroup({
    label,
    items,
    onItem,
}: {
    label: string;
    items: MobileMenuItem[];
    onItem: () => void;
}) {
    return (
        <div className="w-full">
            <div className="px-1 pt-2 pb-1 text-[10.5px] font-bold tracking-[0.14em] text-slate-400 uppercase">
                {label}
            </div>
            <ul className="space-y-0.5">
                {items.map((item) => (
                    <li key={item.label}>
                        <a
                            href={item.href}
                            onClick={onItem}
                            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-[14px] font-medium text-slate-700 transition hover:bg-slate-50 dark:text-neutral-200 dark:hover:bg-neutral-900"
                        >
                            <span className="grid size-8 place-items-center rounded-lg bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300">
                                <item.icon className="size-4" />
                            </span>
                            {item.label}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

const SOCIAL_LINKS = [
    {
        icon: Instagram,
        label: 'Instagram',
        href: 'https://instagram.com/learnpath',
    },
    {
        icon: Linkedin,
        label: 'LinkedIn',
        href: 'https://linkedin.com/company/learnpath',
    },
    { icon: Youtube, label: 'YouTube', href: 'https://youtube.com/@learnpath' },
    { icon: Twitter, label: 'Twitter', href: 'https://twitter.com/learnpath' },
];

function FrontFooter() {
    return (
        <footer className="relative border-t border-slate-200/70 bg-white">
            <div className="mx-auto max-w-7xl px-5 pt-16 pb-10 lg:px-8 lg:pt-20 lg:pb-12">
                <NewsletterBanner />

                <div className="mt-14 grid gap-12 lg:grid-cols-[2fr_3fr] lg:gap-16">
                    <div>
                        <Link href="/" className="flex items-center gap-2.5">
                            <span className="grid size-10 place-items-center rounded-xl bg-brand-600 text-white">
                                <AppLogoIcon className="size-5" />
                            </span>
                            <div className="leading-tight">
                                <div className="text-[18px] font-extrabold tracking-tight text-slate-900">
                                    Learnpath
                                </div>
                                <div className="text-[10px] tracking-[0.18em] text-slate-500 uppercase">
                                    Learn Smarter, Grow Faster
                                </div>
                            </div>
                        </Link>
                        <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-slate-600">
                            Platform pembelajaran terstruktur untuk talenta
                            digital Indonesia. Roadmap personal, AI Tutor, dan
                            sertifikat yang diakui industri.
                        </p>

                        <div className="mt-6 space-y-2.5">
                            <a
                                href="mailto:halo@learnpath.id"
                                className="group flex items-center gap-2.5 text-[13.5px] text-slate-600 transition hover:text-brand-600"
                            >
                                <span className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand-600 transition group-hover:bg-brand-100">
                                    <Mail className="size-4" />
                                </span>
                                halo@learnpath.id
                            </a>
                            <a
                                href="https://wa.me/6281234567890"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-2.5 text-[13.5px] text-slate-600 transition hover:text-emerald-600"
                            >
                                <span className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100">
                                    <MessageCircle className="size-4" />
                                </span>
                                WhatsApp +62 812 3456 7890
                            </a>
                            <div className="pl-10 text-[11.5px] text-slate-400">
                                Dukungan Sen–Jum · 09.00–18.00 WIB
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-2">
                            {SOCIAL_LINKS.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={s.label}
                                    className="grid size-9 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:-translate-y-0.5 hover:bg-brand-600 hover:text-white"
                                >
                                    <s.icon className="size-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                        {FOOTER_LINKS.map((c) => (
                            <div key={c.title}>
                                <div className="text-[12px] font-bold tracking-[0.14em] text-slate-900 uppercase">
                                    {c.title}
                                </div>
                                <ul className="mt-3 space-y-2">
                                    {c.links.map((l) => (
                                        <li key={l.label}>
                                            <Link
                                                href={l.href}
                                                className="text-[13.5px] text-slate-500 transition hover:text-brand-600"
                                            >
                                                {l.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 text-[12.5px] text-slate-500 sm:flex-row">
                    <div>
                        © 2026 PT Learnpath Indonesia. Hak cipta dilindungi.
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="inline-flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-emerald-500" />{' '}
                            Sistem normal
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

function NewsletterBanner() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            return;
        }

        setSubmitted(true);
        // TODO: wire ke endpoint subscribe nanti
    };

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-violet-700 p-8 text-white sm:p-10 lg:p-12">
            <div
                aria-hidden="true"
                className="absolute -top-16 -right-16 size-64 rounded-full bg-violet-400/30 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="absolute -bottom-20 -left-12 size-64 rounded-full bg-brand-300/20 blur-3xl"
            />

            <div className="relative grid items-center gap-6 lg:grid-cols-[1.5fr_1fr] lg:gap-10">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10.5px] font-bold tracking-[0.14em] text-white uppercase ring-1 ring-white/20 backdrop-blur">
                        <Sparkles className="size-3" /> Newsletter mingguan
                    </div>
                    <h3 className="mt-3 text-[22px] leading-tight font-extrabold tracking-tight text-balance sm:text-[28px]">
                        Dapatkan tips belajar & roadmap karier setiap minggu.
                    </h3>
                    <p className="mt-2 max-w-md text-[13.5px] text-white/80">
                        Bergabung dengan <strong>2.400+ profesional</strong>{' '}
                        yang sudah dapat insight gratis tiap Jumat.
                    </p>
                </div>

                {submitted ? (
                    <div className="rounded-2xl bg-white/15 p-5 text-center ring-1 ring-white/20 backdrop-blur">
                        <div className="text-[13.5px] font-bold">
                            🎉 Terima kasih!
                        </div>
                        <div className="mt-1 text-[12px] text-white/85">
                            Cek inbox kamu untuk konfirmasi.
                        </div>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-2 sm:flex-row"
                    >
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@kamu.com"
                            className="flex-1 rounded-full bg-white/95 px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-white/40 focus:outline-none"
                        />
                        <button
                            type="submit"
                            className="group inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-5 py-3 text-[14px] font-semibold text-brand-700 transition hover:bg-brand-50"
                        >
                            Berlangganan
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
