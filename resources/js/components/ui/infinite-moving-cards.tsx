import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type Item = {
    quote?: string;
    name: string;
    title?: string;
    image?: string;
};

export const InfiniteMovingCards = ({
    items,
    direction = 'left',
    speed = 'normal',
    pauseOnHover = true,
    className,
    renderItem,
}: {
    items: Item[];
    direction?: 'left' | 'right';
    speed?: 'fast' | 'normal' | 'slow';
    pauseOnHover?: boolean;
    className?: string;
    renderItem?: (item: Item, idx: number) => React.ReactNode;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollerRef = useRef<HTMLUListElement>(null);
    const [start, setStart] = useState(false);

    useEffect(() => {
        if (!containerRef.current || !scrollerRef.current) return;

        const scrollerContent = Array.from(scrollerRef.current.children);
        scrollerContent.forEach((item) => {
            const cloned = item.cloneNode(true);
            scrollerRef.current?.appendChild(cloned);
        });

        containerRef.current.style.setProperty(
            '--animation-direction',
            direction === 'left' ? 'forwards' : 'reverse',
        );
        containerRef.current.style.setProperty(
            '--animation-duration',
            speed === 'fast' ? '20s' : speed === 'slow' ? '80s' : '40s',
        );

        setStart(true);
    }, [direction, speed]);

    return (
        <div
            ref={containerRef}
            className={cn(
                'scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)]',
                className,
            )}
        >
            <ul
                ref={scrollerRef}
                className={cn(
                    'flex w-max min-w-full shrink-0 flex-nowrap gap-6 py-4',
                    start && 'animate-scroll',
                    pauseOnHover && 'hover:[animation-play-state:paused]',
                )}
            >
                {items.map((item, idx) =>
                    renderItem ? (
                        <li key={`${item.name}-${idx}`} className="shrink-0">
                            {renderItem(item, idx)}
                        </li>
                    ) : (
                        <li
                            key={`${item.name}-${idx}`}
                            className="relative w-[300px] max-w-full shrink-0 rounded-2xl border border-slate-200 bg-white px-7 py-5 md:w-[380px] "
                        >
                            {item.quote && (
                                <p className="text-[14px] leading-[1.6] text-slate-800 ">
                                    {item.quote}
                                </p>
                            )}
                            <div className="mt-5 flex flex-col gap-0.5">
                                <span className="text-[13px] font-semibold text-slate-900 ">
                                    {item.name}
                                </span>
                                {item.title && (
                                    <span className="text-[12px] text-slate-500 ">
                                        {item.title}
                                    </span>
                                )}
                            </div>
                        </li>
                    ),
                )}
            </ul>
        </div>
    );
};
