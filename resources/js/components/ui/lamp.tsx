import { motion } from 'motion/react';
import React from 'react';
import { cn } from '@/lib/utils';

export const LampContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div
            className={cn(
                'relative z-0 flex w-full items-end justify-center overflow-hidden rounded-3xl bg-slate-950 px-6 pt-[26rem] pb-16 sm:pt-[32rem] sm:pb-20',
                className,
            )}
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 isolate z-0 flex h-[26rem] w-full scale-y-125 items-center justify-center sm:h-[32rem]"
            >
                <motion.div
                    initial={{ opacity: 0.5, width: '20rem' }}
                    whileInView={{ opacity: 1, width: '44rem' }}
                    transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
                    viewport={{ once: true }}
                    style={{
                        backgroundImage:
                            'conic-gradient(var(--conic-position), var(--tw-gradient-stops))',
                    }}
                    className="absolute inset-auto right-1/2 h-72 w-[44rem] overflow-visible bg-gradient-conic from-brand-500 via-transparent to-transparent text-white [--conic-position:from_70deg_at_center_top]"
                >
                    <div className="absolute bottom-0 left-0 z-20 h-48 w-[100%] bg-slate-950 [mask-image:linear-gradient(to_top,white,transparent)]" />
                    <div className="absolute bottom-0 left-0 z-20 h-[100%] w-48 bg-slate-950 [mask-image:linear-gradient(to_right,white,transparent)]" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0.5, width: '20rem' }}
                    whileInView={{ opacity: 1, width: '44rem' }}
                    transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
                    viewport={{ once: true }}
                    style={{
                        backgroundImage:
                            'conic-gradient(var(--conic-position), var(--tw-gradient-stops))',
                    }}
                    className="absolute inset-auto left-1/2 h-72 w-[44rem] bg-gradient-conic from-transparent via-transparent to-brand-500 text-white [--conic-position:from_290deg_at_center_top]"
                >
                    <div className="absolute right-0 bottom-0 z-20 h-[100%] w-48 bg-slate-950 [mask-image:linear-gradient(to_left,white,transparent)]" />
                    <div className="absolute right-0 bottom-0 z-20 h-48 w-[100%] bg-slate-950 [mask-image:linear-gradient(to_top,white,transparent)]" />
                </motion.div>

                <div className="absolute top-1/2 h-56 w-full translate-y-12 scale-x-150 bg-slate-950 blur-2xl" />
                <div className="absolute top-1/2 z-50 h-56 w-full bg-transparent opacity-10 backdrop-blur-md" />
                <div className="absolute inset-auto z-50 h-44 w-[40rem] -translate-y-1/2 rounded-full bg-brand-500/40 opacity-60 blur-3xl" />

                <motion.div
                    initial={{ width: '10rem' }}
                    whileInView={{ width: '24rem' }}
                    transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
                    viewport={{ once: true }}
                    className="absolute inset-auto z-30 h-44 w-96 -translate-y-[7rem] rounded-full bg-brand-400 blur-2xl"
                />

                <motion.div
                    initial={{ width: '20rem' }}
                    whileInView={{ width: '44rem' }}
                    transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
                    viewport={{ once: true }}
                    className="absolute inset-auto z-50 h-0.5 w-[44rem] -translate-y-[8rem] bg-gradient-to-r from-transparent via-brand-300 to-transparent"
                />

                <div className="absolute inset-auto z-40 h-52 w-full -translate-y-[14rem] bg-slate-950" />
            </div>

            <div className="relative z-50 flex w-full max-w-3xl flex-col items-center">
                {children}
            </div>
        </div>
    );
};
