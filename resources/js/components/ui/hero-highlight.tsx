import { motion, useMotionTemplate, useMotionValue } from 'motion/react';
import React from 'react';
import { cn } from '@/lib/utils';

const dotPatterns = {
    light: {
        default: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='16' height='16' fill='none'%3E%3Ccircle fill='%23d4d4d4' id='pattern-circle' cx='10' cy='10' r='2.5'%3E%3C/circle%3E%3C/svg%3E")`,
        hover: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='16' height='16' fill='none'%3E%3Ccircle fill='%236366f1' id='pattern-circle' cx='10' cy='10' r='2.5'%3E%3C/circle%3E%3C/svg%3E")`,
    },
    dark: {
        default: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='16' height='16' fill='none'%3E%3Ccircle fill='%23404040' id='pattern-circle' cx='10' cy='10' r='2.5'%3E%3C/circle%3E%3C/svg%3E")`,
        hover: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='16' height='16' fill='none'%3E%3Ccircle fill='%238183f4' id='pattern-circle' cx='10' cy='10' r='2.5'%3E%3C/circle%3E%3C/svg%3E")`,
    },
};

export const HeroHighlight = ({
    children,
    className,
    containerClassName,
}: {
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
}) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = ({
        currentTarget,
        clientX,
        clientY,
    }: React.MouseEvent<HTMLDivElement>) => {
        if (!currentTarget) return;
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    };

    const lightMask = useMotionTemplate`radial-gradient(200px circle at ${mouseX}px ${mouseY}px, black 0%, transparent 100%)`;
    const darkMask = useMotionTemplate`radial-gradient(200px circle at ${mouseX}px ${mouseY}px, black 0%, transparent 100%)`;

    return (
        <div
            className={cn(
                'group relative flex w-full items-center justify-center bg-white dark:bg-black',
                containerClassName,
            )}
            onMouseMove={handleMouseMove}
        >
            <div
                className="pointer-events-none absolute inset-0 dark:hidden"
                style={{ backgroundImage: dotPatterns.light.default }}
            />
            <div
                className="pointer-events-none absolute inset-0 hidden dark:block"
                style={{ backgroundImage: dotPatterns.dark.default }}
            />
            <motion.div
                className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 dark:hidden"
                style={{
                    backgroundImage: dotPatterns.light.hover,
                    WebkitMaskImage: lightMask,
                    maskImage: lightMask,
                }}
            />
            <motion.div
                className="pointer-events-none absolute inset-0 hidden opacity-0 transition duration-300 group-hover:opacity-100 dark:block"
                style={{
                    backgroundImage: dotPatterns.dark.hover,
                    WebkitMaskImage: darkMask,
                    maskImage: darkMask,
                }}
            />

            <div className={cn('relative z-20', className)}>{children}</div>
        </div>
    );
};

export const Highlight = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <motion.span
            initial={{ backgroundSize: '0% 100%' }}
            animate={{ backgroundSize: '100% 100%' }}
            transition={{ duration: 1.6, ease: 'easeOut', delay: 0.3 }}
            style={{
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'left center',
                display: 'inline',
            }}
            className={cn(
                'relative inline-block rounded-lg bg-gradient-to-r from-brand-200 to-violet-200 px-1 pb-1 dark:from-brand-500 dark:to-violet-500',
                className,
            )}
        >
            {children}
        </motion.span>
    );
};
