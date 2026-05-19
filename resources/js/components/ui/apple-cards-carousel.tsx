import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { cn } from '@/lib/utils';

export type CarouselCard = {
    title: string;
    category: string;
    gradient: string;
    image?: string | null;
    icon?: React.ReactNode;
    href?: string;
    content?: React.ReactNode;
};

const CarouselContext = createContext<{
    onCardClose: (index: number) => void;
    currentIndex: number;
}>({
    onCardClose: () => {},
    currentIndex: 0,
});

export function AppleCardsCarousel({
    items,
    initialScroll = 0,
}: {
    items: React.ReactElement[];
    initialScroll?: number;
}) {
    const carouselRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    const checkScrollability = useCallback(() => {
        if (!carouselRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }, []);

    useEffect(() => {
        if (!carouselRef.current) return;
        carouselRef.current.scrollLeft = initialScroll;
        checkScrollability();
    }, [initialScroll, checkScrollability]);

    const scroll = (dir: 'left' | 'right') => {
        if (!carouselRef.current) return;
        const cardWidth =
            window.innerWidth < 768 ? 230 : 384; // matches card md:w-96
        const gap = window.innerWidth < 768 ? 16 : 32;
        const amount = (cardWidth + gap) * (dir === 'left' ? -1 : 1);
        carouselRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    };

    const handleCardClose = (index: number) => {
        if (!carouselRef.current) return;
        const cardWidth = window.innerWidth < 768 ? 230 : 384;
        const gap = window.innerWidth < 768 ? 16 : 32;
        const scrollPos = (cardWidth + gap) * index;
        carouselRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
        setCurrentIndex(index);
    };

    return (
        <CarouselContext.Provider
            value={{ onCardClose: handleCardClose, currentIndex }}
        >
            <div className="relative w-full">
                <div
                    ref={carouselRef}
                    onScroll={checkScrollability}
                    className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth py-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                    <div
                        className={cn(
                            'mx-auto flex flex-row justify-start gap-4 pl-4 md:gap-8',
                        )}
                    >
                        {items.map((item, index) => (
                            <motion.div
                                key={`carousel-${index}`}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.5,
                                    delay: 0.05 * index,
                                    ease: 'easeOut',
                                }}
                                className="rounded-3xl last:pr-4 md:last:pr-8"
                            >
                                {item}
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="mr-10 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => scroll('left')}
                        disabled={!canScrollLeft}
                        aria-label="Sebelumnya"
                        className="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-40 hover:bg-brand-50 hover:text-brand-700"
                    >
                        <ArrowLeft className="size-5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => scroll('right')}
                        disabled={!canScrollRight}
                        aria-label="Selanjutnya"
                        className="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-40 hover:bg-brand-50 hover:text-brand-700"
                    >
                        <ArrowRight className="size-5" />
                    </button>
                </div>
            </div>
        </CarouselContext.Provider>
    );
}

export function CarouselCardItem({
    card,
    index,
    layout = false,
}: {
    card: CarouselCard;
    index: number;
    layout?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { onCardClose } = useContext(CarouselContext);

    const handleClose = useCallback(() => {
        setOpen(false);
        onCardClose(index);
    }, [index, onCardClose]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
        };
        if (open) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', onKey);
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKey);
        };
    }, [open, handleClose]);

    return (
        <>
            <AnimatePresence>
                {open && (
                    <div className="fixed inset-0 z-50 grid place-items-center overflow-auto p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleClose}
                            className="fixed inset-0 h-full w-full bg-slate-900/70 backdrop-blur-sm"
                        />
                        <motion.div
                            ref={containerRef}
                            layoutId={layout ? `card-${card.title}` : undefined}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative z-[60] my-10 h-fit max-w-5xl rounded-3xl bg-white p-6 font-sans md:p-10 dark:bg-neutral-900"
                        >
                            <button
                                type="button"
                                onClick={handleClose}
                                aria-label="Tutup"
                                className="sticky top-4 right-0 ml-auto grid size-9 place-items-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                            >
                                <X className="size-5" />
                            </button>
                            <p className="text-[12px] font-bold tracking-[0.14em] text-brand-600 uppercase">
                                {card.category}
                            </p>
                            <h2 className="mt-2 text-[28px] leading-tight font-extrabold text-slate-900 dark:text-white md:text-[36px]">
                                {card.title}
                            </h2>
                            <div className="mt-6">
                                {card.content ?? (
                                    <div className="text-[14px] leading-relaxed text-slate-600 dark:text-neutral-300">
                                        Konten kategori akan tampil di sini.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <motion.button
                type="button"
                layoutId={layout ? `card-${card.title}` : undefined}
                onClick={() => setOpen(true)}
                className={cn(
                    'relative z-10 flex h-80 w-56 flex-col items-start justify-start overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-left text-white shadow-[0_18px_36px_-18px_rgba(15,23,42,0.35)] transition-transform hover:-translate-y-1 md:h-[26rem] md:w-96',
                    card.gradient,
                )}
            >
                {card.image && (
                    <img
                        src={card.image}
                        alt=""
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
                    />
                )}
                <div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
                <div className="relative z-40">
                    <p className="text-[12px] font-bold tracking-[0.14em] text-white/80 uppercase">
                        {card.category}
                    </p>
                    <h3 className="mt-2 max-w-xs text-[22px] leading-tight font-extrabold text-white md:text-[28px]">
                        {card.title}
                    </h3>
                </div>
                {card.icon && (
                    <div className="absolute right-6 bottom-6 z-40 grid size-16 place-items-center rounded-2xl bg-white/15 text-white backdrop-blur md:size-20">
                        {card.icon}
                    </div>
                )}
            </motion.button>
        </>
    );
}
