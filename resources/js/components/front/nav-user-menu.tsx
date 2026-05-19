import { Link, router } from '@inertiajs/react';
import {
    Award,
    ChevronDown,
    GraduationCap,
    LogOut,
    Route,
    Settings,
    User as UserIcon,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInitials } from '@/hooks/use-initials';
import { dashboard, logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { User } from '@/types';

const MENU_ITEMS = [
    { icon: GraduationCap, label: 'Kursus Saya', href: '/my-courses' },
    { icon: Route, label: 'Learning Path Saya', href: '/my-paths' },
    { icon: Award, label: 'Sertifikat', href: '/my-certificates' },
];

export function NavUserMenu({ user }: { user: User }) {
    const getInitials = useInitials();

    const handleLogout = () => {
        router.flushAll();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label="Menu pengguna"
                    className="group inline-flex items-center gap-1.5 rounded-full p-0.5 pr-2 transition-colors hover:bg-slate-100 dark:hover:bg-neutral-800"
                >
                    <Avatar className="size-8 overflow-hidden rounded-full ring-2 ring-white dark:ring-neutral-950">
                        {(user.avatar_url || user.avatar) && (
                            <AvatarImage src={user.avatar_url ?? user.avatar} alt={user.name} />
                        )}
                        <AvatarFallback className="rounded-full bg-brand-100 text-[12px] font-bold text-brand-700">
                            {getInitials(user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="size-3.5 text-slate-400 transition group-hover:text-slate-700 dark:group-hover:text-neutral-200" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="p-0 font-normal">
                    <Link
                        href={dashboard()}
                        className="flex items-center gap-3 rounded-md px-2 py-2.5 transition hover:bg-slate-50 dark:hover:bg-neutral-900"
                    >
                        <Avatar className="size-10 overflow-hidden rounded-full">
                            {(user.avatar_url || user.avatar) && (
                            <AvatarImage src={user.avatar_url ?? user.avatar} alt={user.name} />
                        )}
                            <AvatarFallback className="rounded-full bg-brand-100 text-[13px] font-bold text-brand-700">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-[13.5px] font-bold text-slate-900 dark:text-neutral-100">
                                {user.name}
                            </div>
                            <div className="truncate text-[11.5px] text-slate-500">
                                {user.email}
                            </div>
                        </div>
                    </Link>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link
                        href={dashboard()}
                        className="flex w-full cursor-pointer items-center gap-2.5 px-2 py-2 text-[13px]"
                    >
                        <UserIcon className="size-4 text-slate-500" />
                        Dasbor
                    </Link>
                </DropdownMenuItem>
                {MENU_ITEMS.map((item) => (
                    <DropdownMenuItem key={item.label} asChild>
                        <Link
                            href={item.href}
                            className="flex w-full cursor-pointer items-center gap-2.5 px-2 py-2 text-[13px]"
                        >
                            <item.icon className="size-4 text-slate-500" />
                            {item.label}
                        </Link>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link
                        href={edit()}
                        className="flex w-full cursor-pointer items-center gap-2.5 px-2 py-2 text-[13px]"
                    >
                        <Settings className="size-4 text-slate-500" />
                        Pengaturan
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link
                        href={logout()}
                        as="button"
                        onClick={handleLogout}
                        className="flex w-full cursor-pointer items-center gap-2.5 px-2 py-2 text-[13px] text-rose-600 focus:text-rose-700"
                    >
                        <LogOut className="size-4" />
                        Keluar
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
