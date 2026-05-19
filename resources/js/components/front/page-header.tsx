import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { BackgroundDots } from '@/components/ui/background-dots';
import { cn } from '@/lib/utils';

export type PageHeaderCrumb = {
    label: string;
    href?: string;
};

type PageHeaderProps = {
    eyebrow?: string;
    title: ReactNode;
    description?: ReactNode;
    breadcrumbs?: PageHeaderCrumb[];
    actions?: ReactNode;
    children?: ReactNode;
    align?: 'left' | 'center';
    tone?: 'brand' | 'dark' | 'light';
    className?: string;
};

const TONE_STYLES = {
    brand: 'bg-gradient-to-br from-brand-700 via-brand-800 to-slate-950 text-white',
    dark: 'bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white',
    light: 'bg-gradient-to-br from-brand-50 via-white to-white text-slate-900',
} as const;

export function PageHeader({
    eyebrow,
    title,
    description,
    breadcrumbs,
    actions,
    children,
    align = 'left',
    tone = 'brand',
    className,
}: PageHeaderProps) {
    const isLight = tone === 'light';
    const alignWrap = align === 'center' ? 'text-center items-center' : '';

    return (
        <section
            className={cn(
                'relative isolate overflow-hidden',
                TONE_STYLES[tone],
                className,
            )}
        >
            {/* Decorative glows */}
            {!isLight && (
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -z-10"
                >
                    <div className="absolute -top-32 left-1/3 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-brand-400/25 blur-3xl" />
                    <div className="absolute -bottom-40 right-1/4 h-72 w-[36rem] translate-x-1/3 rounded-full bg-brand-500/20 blur-3xl" />
                </div>
            )}

            {/* Aceternity-style dotted background */}
            <BackgroundDots tone={isLight ? 'light' : 'dark'} spacing={22} />

            <div className="mx-auto max-w-7xl px-5 pt-16 pb-20 sm:pt-20 sm:pb-24 lg:px-8 lg:pt-24 lg:pb-28">
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <nav
                        aria-label="Breadcrumb"
                        className={cn(
                            'mb-6 flex flex-wrap items-center gap-1 text-[12.5px]',
                            isLight ? 'text-slate-500' : 'text-white/70',
                        )}
                    >
                        {breadcrumbs.map((crumb, idx) => {
                            const isLast = idx === breadcrumbs.length - 1;

                            return (
                                <span
                                    key={`${crumb.label}-${idx}`}
                                    className="inline-flex items-center gap-1"
                                >
                                    {crumb.href && !isLast ? (
                                        <Link
                                            href={crumb.href}
                                            className={cn(
                                                'transition hover:underline',
                                                isLight
                                                    ? 'hover:text-brand-700'
                                                    : 'hover:text-white',
                                            )}
                                        >
                                            {crumb.label}
                                        </Link>
                                    ) : (
                                        <span
                                            className={
                                                isLight
                                                    ? 'font-semibold text-slate-900'
                                                    : 'font-semibold text-white'
                                            }
                                        >
                                            {crumb.label}
                                        </span>
                                    )}
                                    {!isLast && (
                                        <ChevronRight
                                            className={cn(
                                                'size-3.5 shrink-0',
                                                isLight
                                                    ? 'text-slate-400'
                                                    : 'text-white/40',
                                            )}
                                        />
                                    )}
                                </span>
                            );
                        })}
                    </nav>
                )}

                <div
                    className={cn(
                        'flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between',
                        align === 'center' && 'lg:flex-col lg:items-center',
                    )}
                >
                    <div className={cn('flex flex-col gap-4', alignWrap)}>
                        {eyebrow && (
                            <span
                                className={cn(
                                    'inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.14em] uppercase ring-1 backdrop-blur',
                                    isLight
                                        ? 'bg-brand-50 text-brand-700 ring-brand-100'
                                        : 'bg-white/10 text-white ring-white/15',
                                )}
                            >
                                {eyebrow}
                            </span>
                        )}
                        <h1
                            className={cn(
                                'max-w-3xl text-[34px] leading-[1.05] font-extrabold tracking-tight text-balance sm:text-[44px] lg:text-[52px]',
                                isLight
                                    ? 'text-slate-900'
                                    : 'bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent',
                            )}
                        >
                            {title}
                        </h1>
                        {description && (
                            <p
                                className={cn(
                                    'max-w-2xl text-[15.5px] leading-relaxed sm:text-[16.5px]',
                                    isLight ? 'text-slate-600' : 'text-slate-300',
                                )}
                            >
                                {description}
                            </p>
                        )}
                    </div>

                    {actions && (
                        <div
                            className={cn(
                                'flex flex-wrap items-center gap-3',
                                align === 'center' && 'justify-center',
                            )}
                        >
                            {actions}
                        </div>
                    )}
                </div>

                {children && <div className="mt-10">{children}</div>}
            </div>
        </section>
    );
}
