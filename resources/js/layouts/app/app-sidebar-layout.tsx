import { LearnpathSidebar, LearnpathTopbar, useSidebarState } from '@/components/learnpath-sidebar';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: AppLayoutProps) {
    const { collapsed, toggleCollapse, mobileOpen, openMobile, closeMobile } = useSidebarState();

    return (
        <div className="flex min-h-screen bg-surface text-slate-800">
            <LearnpathSidebar
                collapsed={collapsed}
                onToggleCollapse={toggleCollapse}
                mobileOpen={mobileOpen}
                onCloseMobile={closeMobile}
            />
            <div className="flex min-w-0 flex-1 flex-col">
                <LearnpathTopbar
                    onOpenMobile={openMobile}
                    onToggleCollapse={toggleCollapse}
                    breadcrumbs={breadcrumbs}
                />
                <main className="flex-1 px-5 py-6 lg:px-8">{children}</main>
            </div>
        </div>
    );
}
