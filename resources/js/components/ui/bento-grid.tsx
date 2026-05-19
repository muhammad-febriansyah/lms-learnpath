import { cn } from '@/lib/utils';

export const BentoGrid = ({
    className,
    children,
}: {
    className?: string;
    children?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                'mx-auto grid max-w-7xl grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3',
                className,
            )}
        >
            {children}
        </div>
    );
};

export const BentoGridItem = ({
    className,
    title,
    description,
    header,
    icon,
}: {
    className?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    header?: React.ReactNode;
    icon?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                'group/bento row-span-1 flex flex-col justify-between space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-200 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-950',
                className,
            )}
        >
            {header}
            <div className="transition duration-200 group-hover/bento:translate-x-1">
                {icon}
                <div className="mt-3 mb-1.5 font-sans text-[15px] font-bold text-slate-900 dark:text-neutral-100">
                    {title}
                </div>
                <div className="font-sans text-[12.5px] leading-relaxed text-slate-600 dark:text-neutral-400">
                    {description}
                </div>
            </div>
        </div>
    );
};
