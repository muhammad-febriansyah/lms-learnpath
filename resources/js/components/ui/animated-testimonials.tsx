import { ArrowLeft, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

export type Testimonial = {
    quote: string;
    name: string;
    designation: string;
    src?: string;
    initials?: string;
    gradient?: string;
};

export const AnimatedTestimonials = ({
    testimonials,
    autoplay = false,
}: {
    testimonials: Testimonial[];
    autoplay?: boolean;
}) => {
    const [active, setActive] = useState(0);

    const handleNext = () => {
        setActive((prev) => (prev + 1) % testimonials.length);
    };

    const handlePrev = () => {
        setActive(
            (prev) => (prev - 1 + testimonials.length) % testimonials.length,
        );
    };

    const isActive = (index: number) => index === active;

    useEffect(() => {
        if (!autoplay) return;
        const interval = setInterval(handleNext, 5000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoplay]);

    // Deterministik berbasis index supaya SSR & client render menghasilkan
    // angka yang sama (mencegah hydration mismatch dari Math.random).
    const rotationFor = (index: number) => (((index * 73) % 21) - 10);

    return (
        <div className="mx-auto max-w-sm px-4 py-12 font-sans antialiased md:max-w-4xl md:px-8 md:py-16 lg:px-12">
            <div className="relative grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
                <div>
                    <div className="relative h-72 w-full sm:h-80">
                        <AnimatePresence>
                            {testimonials.map((t, index) => (
                                <motion.div
                                    key={`${t.name}-${index}`}
                                    initial={{
                                        opacity: 0,
                                        scale: 0.9,
                                        z: -100,
                                        rotate: rotationFor(index),
                                    }}
                                    animate={{
                                        opacity: isActive(index) ? 1 : 0.5,
                                        scale: isActive(index) ? 1 : 0.95,
                                        z: isActive(index) ? 0 : -100,
                                        rotate: isActive(index) ? 0 : rotationFor(index),
                                        zIndex: isActive(index)
                                            ? 40
                                            : testimonials.length + 2 - index,
                                        y: isActive(index) ? [0, -40, 0] : 0,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        scale: 0.9,
                                        z: 100,
                                        rotate: rotationFor(index),
                                    }}
                                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                                    className="absolute inset-0 origin-bottom"
                                >
                                    {t.src ? (
                                        <img
                                            src={t.src}
                                            alt={t.name}
                                            draggable={false}
                                            className="h-full w-full rounded-3xl object-cover object-center shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)]"
                                        />
                                    ) : (
                                        <div
                                            className={
                                                'flex h-full w-full items-center justify-center rounded-3xl bg-gradient-to-br text-[88px] font-extrabold tracking-tight text-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)] ' +
                                                (t.gradient ?? 'from-brand-400 to-brand-600')
                                            }
                                        >
                                            {t.initials ??
                                                t.name
                                                    .split(' ')
                                                    .map((s) => s[0])
                                                    .slice(0, 2)
                                                    .join('')}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
                <div className="flex flex-col justify-between py-2 md:py-4">
                    <motion.div
                        key={active}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                        <h3 className="text-[20px] font-bold text-slate-900 sm:text-[22px]">
                            {testimonials[active].name}
                        </h3>
                        <p className="text-[13px] text-slate-500 ">
                            {testimonials[active].designation}
                        </p>
                        <motion.p className="mt-6 text-[16px] leading-[1.6] text-slate-700 sm:text-[17px]">
                            {testimonials[active].quote
                                .split(' ')
                                .map((word, index) => (
                                    <motion.span
                                        key={index}
                                        initial={{
                                            filter: 'blur(10px)',
                                            opacity: 0,
                                            y: 5,
                                        }}
                                        animate={{
                                            filter: 'blur(0px)',
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        transition={{
                                            duration: 0.2,
                                            ease: 'easeInOut',
                                            delay: 0.015 * index,
                                        }}
                                        className="inline-block"
                                    >
                                        {word}&nbsp;
                                    </motion.span>
                                ))}
                        </motion.p>
                    </motion.div>
                    <div className="flex gap-3 pt-8 md:pt-6">
                        <button
                            type="button"
                            onClick={handlePrev}
                            aria-label="Sebelumnya"
                            className="group/btn grid size-9 place-items-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-brand-50 hover:text-brand-700 "
                        >
                            <ArrowLeft className="size-4 transition-transform group-hover/btn:-translate-x-0.5" />
                        </button>
                        <button
                            type="button"
                            onClick={handleNext}
                            aria-label="Selanjutnya"
                            className="group/btn grid size-9 place-items-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-brand-50 hover:text-brand-700 "
                        >
                            <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
