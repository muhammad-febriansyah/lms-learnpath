import { useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type NumberTickerProps = {
    value: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    duration?: number;
    locale?: string;
    className?: string;
};

export function NumberTicker({
    value,
    prefix = '',
    suffix = '',
    decimals = 0,
    duration = 1.6,
    locale = 'id-ID',
    className,
}: NumberTickerProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: '-50px' });
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (!inView) return;

        let rafId = 0;
        const start = performance.now();
        const from = 0;
        const ms = duration * 1000;

        const tick = (now: number) => {
            const elapsed = Math.min(1, (now - start) / ms);
            const eased = 1 - Math.pow(1 - elapsed, 3);
            setDisplay(from + (value - from) * eased);
            if (elapsed < 1) {
                rafId = requestAnimationFrame(tick);
            } else {
                setDisplay(value);
            }
        };

        rafId = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(rafId);
    }, [inView, value, duration]);

    const formatted = display.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

    return (
        <span ref={ref} className={cn('tabular-nums', className)}>
            {prefix}
            {formatted}
            {suffix}
        </span>
    );
}
