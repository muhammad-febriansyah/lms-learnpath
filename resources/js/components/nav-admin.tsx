import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useMemo } from 'react';

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { usePermission } from '@/hooks/use-permission';
import type {
    AdminNavGroup,
    AdminNavItem,
    AdminNavSection,
} from '@/lib/admin-nav';

type NavAdminProps = {
    sections: AdminNavSection[];
    label?: string;
};

export function NavAdmin({ sections, label = 'Menu' }: NavAdminProps) {
    const { hasPermission, hasRole } = usePermission();
    const { isCurrentUrl } = useCurrentUrl();

    const visibleSections = useMemo(() => {
        const allowed = (gate: { permission?: string; roles?: string[] }) => {
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
                if (section.type === 'item') {
                    return allowed(section) ? section : null;
                }

                if (!allowed(section)) {
                    return null;
                }

                const visibleItems = section.items.filter((item) => allowed(item));

                if (visibleItems.length === 0) {
                    return null;
                }

                return { ...section, items: visibleItems };
            })
            .filter((section): section is AdminNavSection => section !== null);
    }, [sections, hasPermission, hasRole]);

    if (visibleSections.length === 0) {
        return null;
    }

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarMenu>
                {visibleSections.map((section) =>
                    section.type === 'item' ? (
                        <NavSingle
                            key={section.title}
                            item={section}
                            isActive={isCurrentUrl(section.href)}
                        />
                    ) : (
                        <NavGroup
                            key={section.label}
                            section={section as AdminNavGroup & { type: 'group' }}
                            isItemActive={(href) => isCurrentUrl(href)}
                        />
                    ),
                )}
            </SidebarMenu>
        </SidebarGroup>
    );
}

function NavSingle({
    item,
    isActive,
}: {
    item: { title: string; href: string; icon?: AdminNavItem['icon'] };
    isActive: boolean;
}) {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={{ children: item.title }}
            >
                <Link href={item.href} prefetch>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

function NavGroup({
    section,
    isItemActive,
}: {
    section: AdminNavGroup & { type: 'group' };
    isItemActive: (href: string) => boolean;
}) {
    const hasActiveChild = section.items.some((item) => isItemActive(item.href));

    return (
        <Collapsible
            asChild
            defaultOpen={hasActiveChild}
            className="group/collapsible"
        >
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                        tooltip={{ children: section.label }}
                        isActive={hasActiveChild}
                    >
                        <section.icon />
                        <span>{section.label}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <SidebarMenuSub>
                        {section.items.map((item) => (
                            <SidebarMenuSubItem key={item.href}>
                                <SidebarMenuSubButton
                                    asChild
                                    isActive={isItemActive(item.href)}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    );
}
