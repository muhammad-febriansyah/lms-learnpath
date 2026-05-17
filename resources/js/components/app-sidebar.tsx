import { Link } from '@inertiajs/react';
import { BookOpen, FolderGit2 } from 'lucide-react';

import AppLogo from '@/components/app-logo';
import { NavAdmin } from '@/components/nav-admin';
import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { usePermission } from '@/hooks/use-permission';
import { ADMIN_NAV, STUDENT_NAV } from '@/lib/admin-nav';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

const ADMIN_ROLES = ['superadmin', 'admin_tenant', 'hr', 'instructor', 'supervisor'];
const LEARNER_ROLES = ['employee', 'user_public', 'instructor', 'supervisor'];

export function AppSidebar() {
    const { hasRole, roles } = usePermission();
    const isAdmin = hasRole(ADMIN_ROLES);
    const isLearner = hasRole(LEARNER_ROLES) || roles.length === 0;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {isAdmin && <NavAdmin sections={ADMIN_NAV} label="Administrasi" />}
                {isLearner && <NavAdmin sections={STUDENT_NAV} label="Belajar" />}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
