import { Link, router, usePage } from '@inertiajs/react';
import {
    BookOpen,
    ChevronDown,
    Coins,
    Flame,
    Headset,
    Mail,
    Phone,
    User as UserIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import AppLogoIcon from '@/components/app-logo-icon';
import {
    IconBell,
    IconChevL,
    IconChevR,
    IconChevron,
    IconLogout,
    IconPanel,
    IconSearch,
} from '@/components/learnpath-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePermission } from '@/hooks/use-permission';
import {
    ADMIN_NAV,
    EMPLOYEE_NAV,
    HR_NAV,
    INSTRUCTOR_NAV,
    STUDENT_NAV,
    SUPERADMIN_NAV,
    USER_PUBLIC_NAV,
} from '@/lib/admin-nav';
import type { AdminNavSection } from '@/lib/admin-nav';
import { logout } from '@/routes';
import { edit as editProfile } from '@/routes/profile';
import type { User } from '@/types';

const ADMIN_ROLES = ['superadmin', 'admin_tenant', 'hr', 'instructor', 'supervisor'];

const COLLAPSED_KEY = 'lp_sb_collapsed';

type SidebarProps = {
    mobileOpen: boolean;
    onCloseMobile: () => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
};

export function LearnpathSidebar({
    mobileOpen,
    onCloseMobile,
    collapsed,
    onToggleCollapse,
}: SidebarProps) {
    const { url: currentUrl, props } = usePage<{
        auth: { user: User | null };
        tenant: {
            id: number;
            name: string;
            display_name: string | null;
            tagline: string | null;
            slug: string;
            logo_url: string | null;
            industry: string | null;
            seat_quota: number;
            seats_used: number;
            seats_available: number;
        } | null;
        about: {
            title: string | null;
            tagline: string | null;
            contact_email: string | null;
            contact_phone: string | null;
            contact_address: string | null;
        } | null;
    }>();
    const user = props.auth.user;
    const tenant = props.tenant;
    const about = props.about;
    const { hasRole, hasPermission } = usePermission();

    const isAdmin = hasRole(ADMIN_ROLES);
    const isSuperAdmin = hasRole(['superadmin']);
    const isInstructorOnly =
        hasRole(['instructor']) &&
        !hasRole(['superadmin', 'admin_tenant', 'hr', 'supervisor']);
    const isHrOnly =
        hasRole(['hr']) &&
        !hasRole(['superadmin', 'admin_tenant']);
    const isEmployeeOnly =
        hasRole(['employee']) &&
        !hasRole(['superadmin', 'admin_tenant', 'hr', 'instructor', 'supervisor']);
    const isUserPublic =
        hasRole(['user_public']) &&
        !hasRole(['superadmin', 'admin_tenant', 'hr', 'instructor', 'supervisor', 'employee']);

    const navSource = isSuperAdmin
        ? SUPERADMIN_NAV
        : isHrOnly
            ? HR_NAV
            : isInstructorOnly
                ? INSTRUCTOR_NAV
                : isAdmin
                    ? ADMIN_NAV
                    : isEmployeeOnly
                        ? EMPLOYEE_NAV
                        : isUserPublic
                            ? USER_PUBLIC_NAV
                            : STUDENT_NAV;

    const visibleNav = useMemo(
        () => filterByPermission(navSource, hasPermission, hasRole),
        [navSource, hasPermission, hasRole],
    );

    const labelHidden = collapsed ? 'lg:hidden' : '';

    return (
        <>
            <div
                onClick={onCloseMobile}
                className={
                    'fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm transition lg:hidden ' +
                    (mobileOpen
                        ? 'pointer-events-auto opacity-100'
                        : 'pointer-events-none opacity-0')
                }
            />

            <aside
                className={
                    'fixed top-0 left-0 z-40 flex h-screen w-[260px] shrink-0 flex-col bg-white ring-1 ring-slate-200/70 transition-[width,transform] duration-300 ease-out lg:sticky lg:border-r lg:border-slate-200/70 lg:ring-0 ' +
                    (collapsed ? 'lg:w-[76px] ' : 'lg:w-[260px] ') +
                    (mobileOpen
                        ? 'translate-x-0'
                        : '-translate-x-full lg:translate-x-0')
                }
            >
                <div
                    className={
                        'flex h-[68px] items-center border-b border-slate-100 ' +
                        (collapsed
                            ? 'gap-2.5 px-5 lg:justify-center lg:px-0'
                            : 'gap-2.5 px-5')
                    }
                >
                    <Link
                        href="/"
                        aria-label="Beranda Learnpath"
                        className="flex items-center gap-2.5"
                    >
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
                            <AppLogoIcon className="size-5" />
                        </span>
                        <span className={'leading-tight ' + labelHidden}>
                            <span className="block text-[17px] font-extrabold tracking-tight text-slate-900">
                                Learnpath
                            </span>
                            <span className="block text-[10px] tracking-[0.16em] text-slate-400 uppercase">
                                {isAdmin ? 'Admin Console' : 'Belajar'}
                            </span>
                        </span>
                    </Link>
                </div>

                {/* Tenant context card */}
                {tenant && !isUserPublic && (
                    <TenantCard tenant={tenant} collapsed={collapsed} />
                )}
                {!tenant && hasRole(['superadmin']) && !collapsed && (
                    <div className="mx-3 mt-3 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2">
                        <div className="flex items-center gap-2">
                            <span className="grid size-6 place-items-center rounded-full bg-brand-200 text-[10px] font-bold text-brand-700">
                                SA
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="text-[11px] font-bold tracking-wider text-brand-700 uppercase">
                                    Global View
                                </div>
                                <div className="truncate text-[11.5px] text-brand-600">
                                    Akses lintas tenant
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={onToggleCollapse}
                    title={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
                    className="absolute top-[58px] -right-3 z-10 hidden size-6 place-items-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:text-brand-600 hover:ring-brand-300 lg:grid"
                >
                    {collapsed ? (
                        <IconChevR size={12} />
                    ) : (
                        <IconChevL size={12} />
                    )}
                </button>

                <nav
                    className={
                        'flex-1 space-y-1.5 overflow-x-hidden overflow-y-auto py-5 ' +
                        (collapsed ? 'px-4 lg:px-3' : 'px-4')
                    }
                >
                    {visibleNav.map((section, idx) => {
                        if (section.type === 'divider') {
                            return (
                                <div
                                    key={`divider-${idx}-${section.label}`}
                                    className={
                                        'mt-5 mb-2 px-3 pt-1 text-[10.5px] font-bold tracking-wider text-slate-400 uppercase ' +
                                        (collapsed ? 'lg:hidden' : '')
                                    }
                                >
                                    {section.label}
                                </div>
                            );
                        }
                        if (section.type === 'item') {
                            return (
                                <SingleLink
                                    key={section.href}
                                    href={section.href}
                                    title={section.title}
                                    Icon={section.icon}
                                    badge={section.badge}
                                    collapsed={collapsed}
                                    isActive={isUrlActive(currentUrl, section.href)}
                                    onClick={onCloseMobile}
                                />
                            );
                        }
                        return (
                            <NavGroup
                                key={section.label}
                                section={section}
                                collapsed={collapsed}
                                currentUrl={currentUrl}
                                onClickItem={onCloseMobile}
                            />
                        );
                    })}
                </nav>

                {about &&
                    (about.contact_email || about.contact_phone) &&
                    !collapsed && (
                        <div className={'p-3 ' + labelHidden}>
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white">
                                <div className="absolute -top-10 -right-10 size-28 rounded-full bg-white/10 blur-xl" />
                                <div className="absolute top-3 right-3 text-white/40">
                                    <Headset size={20} />
                                </div>
                                <div className="relative">
                                    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                                        <span className="size-1.5 rounded-full bg-emerald-300" />
                                        Butuh Bantuan?
                                    </div>
                                    <div className="mt-2 pr-6 text-[14px] leading-snug font-bold">
                                        Hubungi Admin
                                    </div>
                                    <div className="mt-2 space-y-1.5">
                                        {about.contact_email && (
                                            <a
                                                href={`mailto:${about.contact_email}`}
                                                className="flex items-center gap-2 text-[11.5px] text-white/90 transition hover:text-white"
                                            >
                                                <Mail
                                                    size={12}
                                                    className="shrink-0 text-white/60"
                                                />
                                                <span className="truncate">
                                                    {about.contact_email}
                                                </span>
                                            </a>
                                        )}
                                        {about.contact_phone && (
                                            <a
                                                href={`tel:${about.contact_phone.replace(/\s+/g, '')}`}
                                                className="flex items-center gap-2 text-[11.5px] text-white/90 transition hover:text-white"
                                            >
                                                <Phone
                                                    size={12}
                                                    className="shrink-0 text-white/60"
                                                />
                                                <span className="truncate">
                                                    {about.contact_phone}
                                                </span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                <div
                    className={
                        'flex items-center gap-3 border-t border-slate-100 p-3 ' +
                        (collapsed ? 'lg:justify-center' : '')
                    }
                >
                    <div className="relative shrink-0">
                        <div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-brand-300 to-brand-600 text-sm font-bold text-white">
                            {user ? initials(user.name) : 'LP'}
                        </div>
                        <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    </div>
                    <div
                        className={
                            'min-w-0 flex-1 leading-tight ' + labelHidden
                        }
                    >
                        <div className="truncate text-[13px] font-semibold text-slate-900">
                            {user?.name ?? 'Pengguna'}
                        </div>
                        <div className="truncate text-[11px] text-slate-500">
                            {user?.email ?? ''}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.post(logout().url)}
                        title="Keluar"
                        className={
                            'grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-rose-500 ' +
                            labelHidden
                        }
                    >
                        <IconLogout size={16} />
                    </button>
                </div>
            </aside>
        </>
    );
}

function TenantCard({
    tenant,
    collapsed,
}: {
    tenant: {
        id: number;
        name: string;
        display_name: string | null;
        tagline: string | null;
        slug: string;
        logo_url: string | null;
        seat_quota: number;
        seats_used: number;
        seats_available: number;
    };
    collapsed: boolean;
}) {
    const label = tenant.display_name || tenant.name;
    const initials = label
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0])
        .join('')
        .toUpperCase();

    const seatPct = tenant.seat_quota > 0
        ? Math.round((tenant.seats_used / tenant.seat_quota) * 100)
        : 0;

    if (collapsed) {
        return (
            <div className="mt-3 hidden justify-center lg:flex">
                <div
                    title={label}
                    className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 text-[12px] font-bold text-brand-700 ring-1 ring-brand-200"
                >
                    {tenant.logo_url ? (
                        <img
                            src={tenant.logo_url}
                            alt={label}
                            className="size-9 rounded-xl object-cover"
                        />
                    ) : (
                        initials
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="mx-3 mt-3 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100/60 p-3 ring-1 ring-brand-200/60">
            <div className="flex items-center gap-2.5">
                <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-white text-[12px] font-bold text-brand-700 ring-1 ring-brand-200">
                    {tenant.logo_url ? (
                        <img
                            src={tenant.logo_url}
                            alt={label}
                            className="size-10 object-cover"
                        />
                    ) : (
                        initials
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-[9.5px] font-bold tracking-[0.14em] text-brand-700/70 uppercase">
                        Tenant
                    </div>
                    <div
                        className="truncate text-[12.5px] font-bold text-slate-900"
                        title={label}
                    >
                        {label}
                    </div>
                    {tenant.tagline && (
                        <div
                            className="truncate text-[10.5px] text-slate-500"
                            title={tenant.tagline}
                        >
                            {tenant.tagline}
                        </div>
                    )}
                </div>
            </div>
            {tenant.seat_quota > 0 && (
                <div className="mt-2.5">
                    <div className="mb-1 flex items-center justify-between text-[10.5px] font-semibold">
                        <span className="text-slate-600">Seat</span>
                        <span className="text-slate-700 tabular-nums">
                            {tenant.seats_used}/{tenant.seat_quota}
                        </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white">
                        <div
                            className={
                                'h-full rounded-full transition-all ' +
                                (seatPct >= 90
                                    ? 'bg-rose-500'
                                    : seatPct >= 70
                                        ? 'bg-amber-500'
                                        : 'bg-brand-500')
                            }
                            style={{ width: `${Math.min(100, seatPct)}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function SingleLink({
    href,
    title,
    Icon,
    badge,
    collapsed,
    isActive,
    onClick,
}: {
    href: string;
    title: string;
    Icon?: React.ComponentType<{ className?: string; size?: number }>;
    badge?: string;
    collapsed: boolean;
    isActive: boolean;
    onClick?: () => void;
}) {
    const labelHidden = collapsed ? 'lg:hidden' : '';

    return (
        <Link
            href={href}
            onClick={onClick}
            title={collapsed ? title : undefined}
            className={
                'group/item relative flex min-h-[38px] w-full items-center rounded-xl text-[14px] font-medium transition ' +
                (collapsed
                    ? 'gap-3 px-3 py-2 lg:justify-center lg:px-0 lg:py-2 '
                    : 'gap-3 px-3 py-2 ') +
                (isActive
                    ? 'bg-brand-600 text-white shadow-[0_8px_18px_-10px_rgba(18,35,125,0.6)]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
            }
        >
            {Icon && (
                <Icon
                    size={18}
                    className={
                        isActive
                            ? 'shrink-0 text-white'
                            : 'shrink-0 text-slate-400 group-hover/item:text-brand-600'
                    }
                />
            )}
            <span className={'flex-1 text-left ' + labelHidden}>{title}</span>
            {badge && !collapsed && (
                <span
                    className={
                        'rounded-full px-1.5 py-0.5 text-[10px] font-semibold ' +
                        (isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-amber-100 text-amber-700')
                    }
                >
                    {badge}
                </span>
            )}
            {collapsed && (
                <span className="pointer-events-none absolute top-1/2 left-full z-50 ml-3 hidden -translate-y-1/2 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[12px] font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition group-hover/item:opacity-100 lg:block">
                    {title}
                </span>
            )}
        </Link>
    );
}

function NavGroup({
    section,
    collapsed,
    currentUrl,
    onClickItem,
}: {
    section: Extract<AdminNavSection, { type: 'group' }>;
    collapsed: boolean;
    currentUrl: string;
    onClickItem?: () => void;
}) {
    const hasActive = section.items.some((item) =>
        isUrlActive(currentUrl, item.href),
    );
    const [open, setOpen] = useState<boolean>(false);

    const labelHidden = collapsed ? 'lg:hidden' : '';
    const Icon = section.icon;

    return (
        <div className={'space-y-0.5 ' + (open && !collapsed ? 'pb-3' : '')}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                title={collapsed ? section.label : undefined}
                className={
                    'group/group relative flex min-h-[38px] w-full items-center rounded-xl text-[13px] font-semibold tracking-wider uppercase transition ' +
                    (collapsed
                        ? 'gap-3 px-3 py-2 lg:justify-center lg:px-0 '
                        : 'gap-3 px-3 py-2 ') +
                    (hasActive
                        ? 'text-brand-700'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700')
                }
            >
                <Icon
                    size={18}
                    className={
                        (hasActive
                            ? 'text-brand-600'
                            : 'text-slate-400 group-hover/group:text-brand-600') +
                        ' shrink-0'
                    }
                />
                <span className={'flex-1 text-left text-[11px] ' + labelHidden}>
                    {section.label}
                </span>
                <ChevronDown
                    size={14}
                    className={
                        'transition-transform ' +
                        labelHidden +
                        (open ? ' rotate-0' : ' -rotate-90')
                    }
                />
                {collapsed && (
                    <span className="pointer-events-none absolute top-1/2 left-full z-50 ml-3 hidden -translate-y-1/2 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[12px] font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition group-hover/group:opacity-100 lg:block">
                        {section.label}
                    </span>
                )}
            </button>

            {open && !collapsed && (
                <ul className="mt-2 space-y-1.5 pl-3">
                    {section.items.map((item) => {
                        const is = isUrlActive(currentUrl, item.href);

                        return (
                            <li key={item.href} className="group/item relative">
                                <Link
                                    href={item.href}
                                    onClick={onClickItem}
                                    className={
                                        'flex w-full items-center gap-2.5 rounded-lg py-2 pr-3 pl-4 text-[13.5px] font-medium transition ' +
                                        (is
                                            ? 'bg-brand-600 text-white shadow-[0_8px_18px_-10px_rgba(18,35,125,0.6)]'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
                                    }
                                >
                                    <span
                                        className={
                                            'inline-block size-1.5 shrink-0 rounded-full ' +
                                            (is
                                                ? 'bg-white'
                                                : 'bg-slate-300 group-hover/item:bg-brand-500')
                                        }
                                    />
                                    <span className="flex-1 text-left">
                                        {item.title}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}

            {/* Saat collapsed: tampilkan flyout list ketika hover group */}
            {collapsed && (
                <div className="pointer-events-none absolute left-full z-50 ml-3 hidden -translate-y-2 rounded-xl bg-white p-2 opacity-0 shadow-xl ring-1 ring-slate-200 transition group-hover/group:pointer-events-auto group-hover/group:opacity-100 lg:block">
                    <div className="px-2 pt-1 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                        {section.label}
                    </div>
                    <ul className="space-y-0.5">
                        {section.items.map((item) => {
                            const is = isUrlActive(currentUrl, item.href);

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={onClickItem}
                                        className={
                                            'flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium whitespace-nowrap transition ' +
                                            (is
                                                ? 'bg-brand-50 text-brand-700'
                                                : 'text-slate-600 hover:bg-slate-50')
                                        }
                                    >
                                        <span
                                            className={
                                                'inline-block size-1.5 shrink-0 rounded-full ' +
                                                (is ? 'bg-brand-600' : 'bg-slate-300')
                                            }
                                        />
                                        {item.title}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}

function isUrlActive(currentUrl: string, href: string): boolean {
    const path = currentUrl.split('?')[0];

    if (href === '/dashboard' || href === '/admin/dashboard') {
        return path === href;
    }

    return path === href || path.startsWith(href + '/');
}

function filterByPermission(
    sections: AdminNavSection[],
    hasPermission: (perm: string | string[]) => boolean,
    hasRole: (roles: string | string[]) => boolean,
): AdminNavSection[] {
    const allowedByGate = (gate: { permission?: string; roles?: string[] }) => {
        if (gate.permission && !hasPermission(gate.permission)) {
            return false;
        }
        if (gate.roles && gate.roles.length > 0 && !hasRole(gate.roles)) {
            return false;
        }
        return true;
    };

    return sections
        .map((section) => {
            if (section.type === 'divider') {
                if (section.roles && section.roles.length > 0 && !hasRole(section.roles)) {
                    return null;
                }

                return section;
            }

            if (section.type === 'item') {
                return allowedByGate(section) ? section : null;
            }

            if (! allowedByGate(section)) {
                return null;
            }

            const items = section.items.filter((item) => allowedByGate(item));

            if (items.length === 0) {
                return null;
            }

            return { ...section, items };
        })
        .filter((s): s is AdminNavSection => s !== null);
}

function initials(name: string) {
    return name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

type TopbarProps = {
    onOpenMobile: () => void;
    onToggleCollapse: () => void;
    breadcrumbs?: { title: string; href: string | { url: string } }[];
};

export function LearnpathTopbar({
    onOpenMobile,
    onToggleCollapse,
    breadcrumbs = [],
}: TopbarProps) {
    const { props } = usePage<{ auth: { user: User | null } }>();
    const { hasRole } = usePermission();
    const user = props.auth.user;
    const isSuperAdmin = hasRole(['superadmin']);
    const last = breadcrumbs[breadcrumbs.length - 1];

    return (
        <header className="sticky top-0 z-20 bg-surface/85 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
            <div className="flex h-[68px] items-center gap-3 border-b border-slate-200/70 px-5 lg:px-8">
                <button
                    onClick={onOpenMobile}
                    className="grid size-10 place-items-center rounded-xl bg-white ring-1 ring-slate-200 hover:bg-slate-50 lg:hidden"
                    aria-label="Open menu"
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
                        <path d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <button
                    onClick={onToggleCollapse}
                    title="Toggle sidebar"
                    className="hidden size-10 place-items-center rounded-xl bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 lg:grid"
                >
                    <IconPanel size={18} />
                </button>

                <div className="hidden items-center gap-1.5 text-[12.5px] text-slate-500 md:flex">
                    <span>Beranda</span>
                    <IconChevR size={12} className="text-slate-300" />
                    <span className="font-semibold text-slate-900">
                        {last?.title ?? 'Dasbor'}
                    </span>
                </div>

                <div className="flex-1" />

                <QuickSearch />

                <div className="flex items-center gap-2">
                    {user && !isSuperAdmin && <PointsBadge />}
                    <NotificationDropdown />
                    {user && <UserDropdown user={user} />}
                </div>
            </div>
        </header>
    );
}

type QuickSearchCourse = {
    id: number;
    title: string;
    slug: string;
    thumbnail: string | null;
    review_status: string | null;
    instructor: string | null;
    url: string;
};

type QuickSearchUser = {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    role: string | null;
    url: string;
};

type QuickSearchResponse = {
    query: string;
    courses: QuickSearchCourse[];
    users: QuickSearchUser[];
};

function QuickSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<QuickSearchResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const term = query.trim();

        if (term.length < 2) {
            setResults(null);
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        setLoading(true);

        const timer = setTimeout(() => {
            fetch(`/admin/search/quick?q=${encodeURIComponent(term)}`, {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
                signal: controller.signal,
            })
                .then((res) => (res.ok ? res.json() : Promise.reject(res)))
                .then((data: QuickSearchResponse) => {
                    setResults(data);
                    setLoading(false);
                })
                .catch((err) => {
                    if (err?.name === 'AbortError') return;
                    setLoading(false);
                });
        }, 250);

        return () => {
            controller.abort();
            clearTimeout(timer);
        };
    }, [query]);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    useEffect(() => {
        const handleKey = (event: KeyboardEvent) => {
            const isMac = navigator.platform.toLowerCase().includes('mac');
            const cmd = isMac ? event.metaKey : event.ctrlKey;
            if (cmd && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                inputRef.current?.focus();
                setOpen(true);
            }
            if (event.key === 'Escape') {
                setOpen(false);
                inputRef.current?.blur();
            }
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, []);

    const handleSelect = (url: string) => {
        setOpen(false);
        setQuery('');
        setResults(null);
        router.visit(url);
    };

    const totalResults =
        (results?.courses.length ?? 0) + (results?.users.length ?? 0);
    const hasQuery = query.trim().length >= 2;
    const showDropdown = open && hasQuery;

    return (
        <div
            ref={containerRef}
            className="relative hidden w-[320px] md:block"
        >
            <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 ring-1 ring-slate-200 transition focus-within:ring-2 focus-within:ring-brand-600">
                <IconSearch size={18} className="text-slate-400" />
                <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    placeholder="Cari kursus, siswa…"
                    className="min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-slate-400"
                />
                <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 ring-1 ring-slate-200">
                    ⌘K
                </span>
            </div>

            {showDropdown && (
                <div className="absolute top-[calc(100%+8px)] right-0 left-0 z-50 max-h-[420px] overflow-y-auto rounded-xl bg-white p-2 shadow-xl ring-1 ring-slate-200">
                    {loading && !results && (
                        <div className="px-3 py-6 text-center text-[12.5px] text-slate-500">
                            Mencari…
                        </div>
                    )}

                    {!loading && results && totalResults === 0 && (
                        <div className="px-3 py-6 text-center">
                            <IconSearch
                                size={20}
                                className="mx-auto mb-2 text-slate-300"
                            />
                            <div className="text-[12.5px] font-semibold text-slate-700">
                                Tidak ada hasil
                            </div>
                            <div className="text-[11px] text-slate-500">
                                Coba kata kunci lain.
                            </div>
                        </div>
                    )}

                    {results && results.courses.length > 0 && (
                        <div className="mb-1">
                            <div className="px-2 pt-1 pb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                Kursus
                            </div>
                            <ul className="space-y-0.5">
                                {results.courses.map((course) => (
                                    <li key={`c-${course.id}`}>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleSelect(course.url)
                                            }
                                            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition hover:bg-slate-50"
                                        >
                                            <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-md bg-brand-50 text-brand-600">
                                                {course.thumbnail ? (
                                                    <img
                                                        src={course.thumbnail}
                                                        alt={course.title}
                                                        className="size-8 object-cover"
                                                    />
                                                ) : (
                                                    <BookOpen size={14} />
                                                )}
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-[13px] font-semibold text-slate-900">
                                                    {course.title}
                                                </span>
                                                <span className="block truncate text-[11px] text-slate-500">
                                                    {course.instructor
                                                        ? `oleh ${course.instructor}`
                                                        : course.slug}
                                                </span>
                                            </span>
                                            {course.review_status && (
                                                <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-semibold tracking-wide text-slate-600 uppercase">
                                                    {course.review_status}
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {results && results.users.length > 0 && (
                        <div>
                            <div className="px-2 pt-1 pb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                Pengguna
                            </div>
                            <ul className="space-y-0.5">
                                {results.users.map((u) => (
                                    <li key={`u-${u.id}`}>
                                        <button
                                            type="button"
                                            onClick={() => handleSelect(u.url)}
                                            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition hover:bg-slate-50"
                                        >
                                            <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-brand-300 to-brand-600 text-[11px] font-bold text-white">
                                                {u.avatar ? (
                                                    <img
                                                        src={u.avatar}
                                                        alt={u.name}
                                                        className="size-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    initials(u.name)
                                                )}
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-[13px] font-semibold text-slate-900">
                                                    {u.name}
                                                </span>
                                                <span className="block truncate text-[11px] text-slate-500">
                                                    {u.email}
                                                </span>
                                            </span>
                                            {u.role && (
                                                <span className="flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-semibold tracking-wide text-slate-600 uppercase">
                                                    <UserIcon size={9} />
                                                    {u.role}
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function PointsBadge() {
    const { props } = usePage<{
        gamification: {
            total_points: number;
            level: string;
            current_streak: number;
        } | null;
    }>();
    const data = props.gamification;
    if (!data) {
        return null;
    }

    const formatted = new Intl.NumberFormat('id-ID').format(data.total_points);

    return (
        <Link
            href="/my-points"
            className="hidden h-10 items-center gap-2 rounded-xl bg-white px-3 ring-1 ring-slate-200 hover:bg-slate-50 sm:inline-flex"
            aria-label="Lihat poin & streak"
        >
            <Coins className="size-4 text-amber-500" />
            <span className="text-[12.5px] font-bold tabular-nums text-slate-900">
                {formatted}
            </span>
            {data.current_streak > 0 && (
                <span className="ml-1 inline-flex items-center gap-0.5 rounded-md bg-rose-50 px-1.5 py-0.5 text-[10.5px] font-bold text-rose-700">
                    <Flame className="size-2.5" />
                    {data.current_streak}
                </span>
            )}
        </Link>
    );
}

function NotificationDropdown() {
    const { props } = usePage<{
        notifications: {
            unread_count: number;
            items: Array<{
                id: string;
                type: string;
                title: string;
                description: string;
                href: string | null;
                read: boolean;
                created_at: string | null;
            }>;
        } | null;
    }>();

    const data = props.notifications;
    const items = data?.items ?? [];
    const unread = data?.unread_count ?? 0;

    const handleItemClick = (id: string, href: string | null) => {
        router.post(
            `/notifications/${id}/read`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only: ['notifications'],
                onSuccess: () => {
                    if (href) router.visit(href);
                },
            },
        );
    };

    const handleReadAll = () => {
        router.post('/notifications/read-all', {}, { preserveScroll: true });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="relative grid size-10 place-items-center rounded-xl bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                    aria-label="Notifikasi"
                >
                    <IconBell size={18} />
                    {unread > 0 && (
                        <span className="absolute top-1.5 right-2 grid size-4 place-items-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
                            {unread > 9 ? '9+' : unread}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[340px] p-0">
                <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
                    <div>
                        <div className="text-[13px] font-bold text-slate-900">
                            Notifikasi
                        </div>
                        <div className="text-[11px] text-slate-500">
                            {unread > 0
                                ? `${unread} belum dibaca`
                                : 'Semua sudah dibaca'}
                        </div>
                    </div>
                    {unread > 0 && (
                        <button
                            type="button"
                            onClick={handleReadAll}
                            className="text-[11px] font-semibold text-brand-600 hover:underline"
                        >
                            Tandai dibaca
                        </button>
                    )}
                </div>
                <div className="max-h-[360px] overflow-y-auto py-1">
                    {items.length === 0 ? (
                        <div className="px-3 py-8 text-center">
                            <IconBell
                                size={22}
                                className="mx-auto mb-2 text-slate-300"
                            />
                            <p className="text-[12.5px] font-semibold text-slate-700">
                                Tidak ada notifikasi
                            </p>
                            <p className="text-[11px] text-slate-500">
                                Aktivitas penting akan muncul di sini.
                            </p>
                        </div>
                    ) : (
                        items.map((n) => (
                            <button
                                key={n.id}
                                type="button"
                                onClick={() => handleItemClick(n.id, n.href)}
                                className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
                            >
                                <span
                                    className={
                                        'mt-1 size-2 shrink-0 rounded-full ' +
                                        (n.read
                                            ? 'bg-transparent'
                                            : 'bg-brand-500')
                                    }
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="text-[12.5px] font-semibold text-slate-900">
                                        {n.title}
                                    </div>
                                    <div className="line-clamp-2 text-[11.5px] text-slate-600">
                                        {n.description}
                                    </div>
                                    <div className="mt-0.5 text-[10.5px] text-slate-400">
                                        {formatTimeAgo(n.created_at)}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
                <div className="border-t border-slate-100 px-3 py-2">
                    <button
                        type="button"
                        onClick={() => router.visit('/notifications')}
                        className="w-full text-[11.5px] font-semibold text-brand-600 hover:underline"
                    >
                        Lihat semua notifikasi
                    </button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function formatTimeAgo(iso: string | null): string {
    if (!iso) return '';

    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60_000);

    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `${hours} jam lalu`;

    const days = Math.floor(hours / 24);

    if (days < 7) return `${days} hari lalu`;

    return new Date(iso).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
    });
}

function UserDropdown({ user }: { user: User }) {
    const handleLogout = () => {
        router.flushAll();
    };

    const avatarUrl =
        typeof user.avatar_url === 'string' && user.avatar_url
            ? user.avatar_url
            : typeof user.avatar === 'string' && user.avatar
              ? user.avatar
              : undefined;

    const roleLabel =
        typeof user.role_label === 'string' ? user.role_label : null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="ml-1 hidden items-center gap-2 rounded-xl border-l border-slate-200 pl-2 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 sm:flex">
                    <Avatar className="size-9 ring-1 ring-slate-200">
                        {avatarUrl && (
                            <AvatarImage src={avatarUrl} alt={user.name} />
                        )}
                        <AvatarFallback className="bg-gradient-to-br from-brand-300 to-brand-600 text-[12px] font-bold text-white">
                            {initials(user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="hidden leading-tight lg:block">
                        <div className="text-[13px] font-semibold text-slate-900">
                            {user.name.split(' ')[0]}
                        </div>
                        <div className="text-[11px] text-slate-500">
                            {roleLabel ?? 'Pengguna'}
                        </div>
                    </div>
                    <IconChevron size={16} className="text-slate-400" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px]">
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2.5 px-2 py-2">
                        <Avatar className="size-9">
                            {avatarUrl && (
                                <AvatarImage src={avatarUrl} alt={user.name} />
                            )}
                            <AvatarFallback className="bg-gradient-to-br from-brand-300 to-brand-600 text-[12px] font-bold text-white">
                                {initials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <div className="truncate text-[13px] font-bold text-slate-900">
                                {user.name}
                            </div>
                            <div className="truncate text-[11px] text-slate-500">
                                {user.email}
                            </div>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={editProfile()} className="cursor-pointer">
                        <IconPanel size={14} className="mr-2 text-slate-500" />
                        Edit Profil
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link
                        href={logout()}
                        as="button"
                        method="post"
                        onClick={handleLogout}
                        className="w-full cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                        data-test="logout-button"
                    >
                        <IconLogout size={14} className="mr-2" />
                        Keluar
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function useSidebarState() {
    const [collapsed, setCollapsed] = useState<boolean>(false);

    useEffect(() => {
        try {
            setCollapsed(localStorage.getItem(COLLAPSED_KEY) === '1');
        } catch {
            /* noop */
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0');
        } catch {
            /* noop */
        }
    }, [collapsed]);

    const [mobileOpen, setMobileOpen] = useState(false);

    return {
        collapsed,
        toggleCollapse: () => setCollapsed((c) => !c),
        mobileOpen,
        openMobile: () => setMobileOpen(true),
        closeMobile: () => setMobileOpen(false),
    };
}
