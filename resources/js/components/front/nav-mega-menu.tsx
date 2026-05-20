import { ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type MegaMenuColumn = {
    title: string;
    items: {
        icon?: LucideIcon;
        label: string;
        desc?: string;
        href: string;
        tint?: string;
    }[];
};

type NavMegaMenuProps = {
    label: string;
    columns: MegaMenuColumn[];
    footer?: React.ReactNode;
    width?: 'md' | 'lg' | 'xl';
    /** Tandai sebagai menu aktif (highlight). */
    active?: boolean;
};

const WIDTH_CLASS: Record<NonNullable<NavMegaMenuProps['width']>, string> = {
    md: 'w-[420px]',
    lg: 'w-[640px]',
    xl: 'w-[760px]',
};

export function NavMegaMenu({
    label,
    columns,
    footer,
    width = 'lg',
    active = false,
}: NavMegaMenuProps) {
    const [open, setOpen] = useState(false);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleEnter = () => {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }

        setOpen(true);
    };

    const handleLeave = () => {
        closeTimer.current = setTimeout(() => setOpen(false), 120);
    };

    return (
        <div
            className="relative"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
        >
            <button
                type="button"
                aria-expanded={open}
                aria-current={active ? 'page' : undefined}
                className={cn(
                    'inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap transition 2xl:px-4',
                    active
                        ? 'bg-brand-50 text-brand-700 '
                        : 'text-neutral-600 hover:text-neutral-900 ',
                )}
            >
                {label}
                <ChevronDown
                    className={cn(
                        'size-3.5 transition-transform duration-200',
                        open && 'rotate-180',
                        active ? 'text-brand-600' : 'text-slate-400',
                    )}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className={cn(
                            'absolute top-full left-1/2 z-[70] -translate-x-1/2 pt-3',
                            WIDTH_CLASS[width],
                        )}
                    >
                        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.25),0_0_0_1px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/70 ">
                            <div
                                className={cn(
                                    'grid gap-2 p-4',
                                    columns.length > 1
                                        ? 'grid-cols-2'
                                        : 'grid-cols-1',
                                )}
                            >
                                {columns.map((col) => (
                                    <div key={col.title}>
                                        <div className="px-3 pt-1 pb-2 text-[10.5px] font-bold tracking-[0.14em] text-slate-400 uppercase">
                                            {col.title}
                                        </div>
                                        <ul>
                                            {col.items.map((item) => {
                                                const Icn = item.icon;

                                                return (
                                                    <li key={item.label}>
                                                        <a
                                                            href={item.href}
                                                            className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-brand-50"
                                                        >
                                                            {Icn && (
                                                                <span
                                                                    className={cn(
                                                                        'mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg',
                                                                        item.tint ??
                                                                            'bg-brand-50 text-brand-600',
                                                                    )}
                                                                >
                                                                    <Icn className="size-4" />
                                                                </span>
                                                            )}
                                                            <span className="min-w-0 flex-1">
                                                                <span className="block text-[13.5px] font-semibold text-slate-900 transition group-hover:text-brand-700 ">
                                                                    {item.label}
                                                                </span>
                                                                {item.desc && (
                                                                    <span className="mt-0.5 block text-[11.5px] leading-snug text-slate-500 ">
                                                                        {
                                                                            item.desc
                                                                        }
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </a>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                            {footer && (
                                <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3 ">
                                    {footer}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
