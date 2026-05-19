import { Link, usePage } from '@inertiajs/react';
import {
    GraduationCap,
    Home,
    LogIn,
    
    Route as RouteIcon,
    Search,
    User as UserIcon
} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';
import { openSearchPalette } from '@/components/front/nav-search';
import { cn } from '@/lib/utils';
import { login } from '@/routes';
import * as coursesRoutes from '@/routes/courses';
import * as pathsRoutes from '@/routes/paths';
import type { User } from '@/types';

type NavItem = {
    icon: LucideIcon;
    label: string;
    href: string;
    matchPrefixes: string[];
    onClick?: () => void;
};

type Props = {
    user: User | null;
};

export function MobileBottomNav({ user }: Props) {
    const { url } = usePage();

    const isAuthed = !!user;

    const items: NavItem[] = isAuthed
        ? [
              { icon: Home, label: 'Beranda', href: '/dashboard', matchPrefixes: ['/dashboard'] },
              {
                  icon: GraduationCap,
                  label: 'Kursus Saya',
                  href: '/my-courses',
                  matchPrefixes: ['/my-courses', '/learn'],
              },
              {
                  icon: Search,
                  label: 'Cari',
                  href: '#search',
                  matchPrefixes: [],
                  onClick: openSearchPalette,
              },
              {
                  icon: RouteIcon,
                  label: 'Path Saya',
                  href: '/my-paths',
                  matchPrefixes: ['/my-paths'],
              },
              {
                  icon: UserIcon,
                  label: 'Profil',
                  href: '/settings/profile',
                  matchPrefixes: ['/settings'],
              },
          ]
        : [
              { icon: Home, label: 'Beranda', href: '/', matchPrefixes: ['/'] },
              {
                  icon: GraduationCap,
                  label: 'Kursus',
                  href: coursesRoutes.index().url,
                  matchPrefixes: ['/courses'],
              },
              {
                  icon: Search,
                  label: 'Cari',
                  href: '#search',
                  matchPrefixes: [],
                  onClick: openSearchPalette,
              },
              {
                  icon: RouteIcon,
                  label: 'Path',
                  href: pathsRoutes.index().url,
                  matchPrefixes: ['/paths'],
              },
              { icon: LogIn, label: 'Masuk', href: login().url, matchPrefixes: ['/login'] },
          ];

    const isActive = (item: NavItem): boolean => {
        if (item.matchPrefixes.length === 0) {
return false;
}

        return item.matchPrefixes.some((prefix) =>
            prefix === '/' ? url === '/' : url === prefix || url.startsWith(prefix + '/'),
        );
    };

    return (
        <nav
            aria-label="Navigasi utama"
            className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[max(env(safe-area-inset-bottom),0.25rem)] backdrop-blur lg:hidden dark:border-neutral-800 dark:bg-neutral-950/95"
        >
            <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 pt-1.5">
                {items.map((item) => {
                    const active = isActive(item);
                    const Icn = item.icon;
                    const content = (
                        <span
                            className={cn(
                                'flex w-full flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 transition-colors',
                                active
                                    ? 'text-brand-600'
                                    : 'text-slate-500 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-neutral-100',
                            )}
                        >
                            <span
                                className={cn(
                                    'grid size-9 place-items-center rounded-full transition-colors',
                                    active && 'bg-brand-50 text-brand-600 dark:bg-brand-950/40',
                                )}
                            >
                                <Icn className="size-[18px]" strokeWidth={active ? 2.4 : 2} />
                            </span>
                            <span
                                className={cn(
                                    'text-[10.5px] leading-none',
                                    active ? 'font-semibold' : 'font-medium',
                                )}
                            >
                                {item.label}
                            </span>
                        </span>
                    );

                    if (item.onClick) {
                        return (
                            <li key={item.label} className="flex-1">
                                <button
                                    type="button"
                                    onClick={item.onClick}
                                    aria-label={item.label}
                                    className="flex w-full"
                                >
                                    {content}
                                </button>
                            </li>
                        );
                    }

                    return (
                        <li key={item.label} className="flex-1">
                            <Link
                                href={item.href}
                                aria-current={active ? 'page' : undefined}
                                className="flex w-full"
                            >
                                {content}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
