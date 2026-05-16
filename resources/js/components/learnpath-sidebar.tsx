import { Link, router, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import AppLogoIcon from '@/components/app-logo-icon';
import {
    IconBell,
    IconChevL,
    IconChevR,
    IconChevron,
    IconLogout,
    IconPanel,
    IconSearch,
    IconSparkle,
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
import { ADMIN_NAV, STUDENT_NAV } from '@/lib/admin-nav';
import type { AdminNavSection } from '@/lib/admin-nav';
import { dashboard, logout } from '@/routes';
import { edit as editProfile } from '@/routes/profile';
import type { User } from '@/types';

const ADMIN_ROLES = ['super_admin', 'admin', 'hr', 'instructor', 'supervisor'];

const COLLAPSED_KEY = 'lp_sb_collapsed';
const GROUP_STATE_KEY = 'lp_sb_groups';

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
    }>();
    const user = props.auth.user;
    const { hasRole, hasPermission } = usePermission();

    const isAdmin = hasRole(ADMIN_ROLES);
    const isPrivilegedAdmin = hasRole(['super_admin', 'admin']);
    const navSource = isAdmin ? ADMIN_NAV : STUDENT_NAV;

    const visibleNav = useMemo(
        () => filterByPermission(navSource, hasPermission),
        [navSource, hasPermission],
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
                    (collapsed ? 'lg:w-[76px]' : 'lg:w-[260px]') +
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
                        href={dashboard()}
                        className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-white"
                    >
                        <AppLogoIcon className="size-5" />
                    </Link>
                    <div className={'leading-tight ' + labelHidden}>
                        <div className="text-[17px] font-extrabold tracking-tight text-slate-900">
                            Learnpath
                        </div>
                        <div className="text-[10px] tracking-[0.16em] text-slate-400 uppercase">
                            {isAdmin ? 'Admin Console' : 'Belajar'}
                        </div>
                    </div>
                </div>

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
                        'flex-1 space-y-1 overflow-x-hidden overflow-y-auto py-4 ' +
                        (collapsed ? 'px-3 lg:px-2' : 'px-3')
                    }
                >
                    {visibleNav.map((section) =>
                        section.type === 'item' ? (
                            <SingleLink
                                key={section.title}
                                href={section.href}
                                title={section.title}
                                Icon={section.icon}
                                collapsed={collapsed}
                                isActive={isUrlActive(currentUrl, section.href)}
                                onClick={onCloseMobile}
                            />
                        ) : (
                            <NavGroup
                                key={section.label}
                                section={section}
                                collapsed={collapsed}
                                currentUrl={currentUrl}
                                onClickItem={onCloseMobile}
                            />
                        ),
                    )}
                </nav>

                {isAdmin && !isPrivilegedAdmin && (
                    <div className={'p-3 ' + labelHidden}>
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white">
                            <div className="absolute -top-10 -right-10 size-28 rounded-full bg-white/10 blur-xl" />
                            <div className="absolute top-3 right-3 text-white/40">
                                <IconSparkle size={20} />
                            </div>
                            <div className="relative">
                                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                                    <span className="size-1.5 rounded-full bg-emerald-300" />{' '}
                                    Baru
                                </div>
                                <div className="mt-2 pr-6 text-[15px] leading-snug font-bold">
                                    Aktifkan AI Tutor untuk semua kursus
                                </div>
                                <button className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[12px] font-semibold text-brand-700 transition hover:bg-brand-50">
                                    Pelajari <IconChevR size={12} />
                                </button>
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

function SingleLink({
    href,
    title,
    Icon,
    collapsed,
    isActive,
    onClick,
}: {
    href: string;
    title: string;
    Icon?: React.ComponentType<{ className?: string; size?: number }>;
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
                'group/item relative flex w-full items-center rounded-xl text-[14px] font-medium transition ' +
                (collapsed
                    ? 'gap-3 px-3 py-2.5 lg:justify-center lg:px-0 lg:py-2.5'
                    : 'gap-3 px-3 py-2.5') +
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
    const [open, setOpen] = useGroupOpenState(section.label, hasActive);

    const labelHidden = collapsed ? 'lg:hidden' : '';
    const Icon = section.icon;

    return (
        <div className="space-y-0.5">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                title={collapsed ? section.label : undefined}
                className={
                    'group/group relative flex w-full items-center rounded-xl text-[13px] font-semibold tracking-wider uppercase transition ' +
                    (collapsed
                        ? 'gap-3 px-3 py-2 lg:justify-center lg:px-0'
                        : 'gap-3 px-3 py-2') +
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
                <ul className="space-y-0.5 pl-2">
                    {section.items.map((item) => {
                        const is = isUrlActive(currentUrl, item.href);
                        const ItemIcon = item.icon;

                        return (
                            <li key={item.href} className="group/item relative">
                                <Link
                                    href={item.href}
                                    onClick={onClickItem}
                                    className={
                                        'flex w-full items-center gap-3 rounded-lg py-2 pr-3 pl-5 text-[13.5px] font-medium transition ' +
                                        (is
                                            ? 'bg-brand-600 text-white shadow-[0_8px_18px_-10px_rgba(18,35,125,0.6)]'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
                                    }
                                >
                                    {ItemIcon && (
                                        <ItemIcon
                                            size={16}
                                            className={
                                                is
                                                    ? 'shrink-0 text-white'
                                                    : 'shrink-0 text-slate-400 group-hover/item:text-brand-600'
                                            }
                                        />
                                    )}
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
                            const ItemIcon = item.icon;

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={onClickItem}
                                        className={
                                            'flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium whitespace-nowrap transition ' +
                                            (is
                                                ? 'bg-brand-50 text-brand-700'
                                                : 'text-slate-600 hover:bg-slate-50')
                                        }
                                    >
                                        {ItemIcon && <ItemIcon size={14} />}
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
): AdminNavSection[] {
    return sections
        .map((section) => {
            if (section.type === 'item') {
                if (section.permission && !hasPermission(section.permission)) {
                    return null;
                }

                return section;
            }

            if (section.permission && !hasPermission(section.permission)) {
                return null;
            }

            const items = section.items.filter(
                (item) => !item.permission || hasPermission(item.permission),
            );

            if (items.length === 0) {
                return null;
            }

            return { ...section, items };
        })
        .filter((s): s is AdminNavSection => s !== null);
}

function useGroupOpenState(
    key: string,
    defaultOpen: boolean,
): [boolean, (v: boolean) => void] {
    const [open, setOpen] = useState<boolean>(defaultOpen);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(GROUP_STATE_KEY);

            if (!raw) return;

            const map = JSON.parse(raw) as Record<string, boolean>;

            if (key in map) {
                setOpen(map[key]);
            }
        } catch {
            /* noop */
        }
    }, [key]);

    const update = (v: boolean) => {
        setOpen(v);

        try {
            const raw = localStorage.getItem(GROUP_STATE_KEY);
            const map = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
            map[key] = v;
            localStorage.setItem(GROUP_STATE_KEY, JSON.stringify(map));
        } catch {
            /* noop */
        }
    };

    return [open, update];
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
    const user = props.auth.user;
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

                <div className="hidden w-[320px] items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 ring-1 ring-slate-200 transition focus-within:ring-2 focus-within:ring-brand-600 md:flex">
                    <IconSearch size={18} className="text-slate-400" />
                    <input
                        placeholder="Cari kursus, siswa…"
                        className="min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-slate-400"
                    />
                    <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 ring-1 ring-slate-200">
                        ⌘K
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <NotificationDropdown />
                    {user && <UserDropdown user={user} />}
                </div>
            </div>
        </header>
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
                        Profil Saya
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/settings/security" className="cursor-pointer">
                        <IconSparkle
                            size={14}
                            className="mr-2 text-slate-500"
                        />
                        Keamanan
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
