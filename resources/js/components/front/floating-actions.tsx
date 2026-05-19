import { ArrowUp, MessageCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

const WA_NUMBER = '6281234567890';
const WA_MESSAGE = 'Halo Learnpath, saya ingin tanya tentang...';

export function FloatingActions() {
    const [showScroll, setShowScroll] = useState(false);

    useEffect(() => {
        const onScroll = () => setShowScroll(window.scrollY > 400);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`;

    return (
        <div className="pointer-events-none fixed right-4 bottom-24 z-50 flex flex-col items-end gap-3 sm:right-6 lg:bottom-6">
            <AnimatePresence>
                {showScroll && (
                    <motion.button
                        type="button"
                        onClick={() =>
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                        }
                        initial={{ opacity: 0, scale: 0.6, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.6, y: 10 }}
                        transition={{ duration: 0.2 }}
                        aria-label="Kembali ke atas"
                        className="pointer-events-auto grid size-11 place-items-center rounded-full bg-white text-slate-700 shadow-[0_8px_20px_-8px_rgba(15,23,42,0.3)] ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-brand-50 hover:text-brand-700"
                    >
                        <ArrowUp className="size-5" strokeWidth={2.4} />
                    </motion.button>
                )}
            </AnimatePresence>

            <motion.a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat WhatsApp admin"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 220 }}
                className="group pointer-events-auto relative grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_24px_-8px_rgba(37,211,102,0.6)] transition hover:-translate-y-0.5 hover:bg-[#1ebe5b] hover:shadow-[0_14px_30px_-10px_rgba(37,211,102,0.75)]"
            >
                <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 motion-safe:animate-ping"
                    style={{ animationDuration: '2s' }}
                />
                <MessageCircle className="relative size-6 fill-white" />
                <span className="pointer-events-none absolute right-full mr-3 hidden rounded-lg bg-slate-900 px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap text-white opacity-0 shadow-lg transition group-hover:opacity-100 sm:block">
                    Chat admin
                    <span className="absolute top-1/2 -right-1 size-2 -translate-y-1/2 rotate-45 bg-slate-900" />
                </span>
            </motion.a>
        </div>
    );
}
