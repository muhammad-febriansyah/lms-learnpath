import { Sparkles, X } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'promo:student-discount:dismissed';

function subscribe(callback: () => void): () => void {
    if (typeof window === 'undefined') {
        return () => {};
    }

    window.addEventListener('storage', callback);

    return () => window.removeEventListener('storage', callback);
}

function readVisible(): boolean {
    try {
        return window.localStorage.getItem(STORAGE_KEY) !== '1';
    } catch {
        return true;
    }
}

export function PromoBanner() {
    const persistedVisible = useSyncExternalStore(
        subscribe,
        readVisible,
        () => false,
    );
    const [overrideHidden, setOverrideHidden] = useState(false);

    if (!persistedVisible || overrideHidden) {
        return null;
    }

    const handleDismiss = () => {
        try {
            window.localStorage.setItem(STORAGE_KEY, '1');
        } catch {
            // ignore
        }

        setOverrideHidden(true);
    };

    return (
        <div className="relative z-50 bg-gradient-to-r from-brand-700 via-brand-600 to-brand-800 text-white">
            <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2 text-[12.5px] sm:text-[13px]">
                <Sparkles className="hidden size-3.5 shrink-0 text-amber-300 sm:block" />
                <p className="text-center">
                    <span className="font-semibold">Diskon 40% untuk pelajar</span>
                    <span className="mx-2 hidden text-white/40 sm:inline">·</span>
                    <span className="hidden text-white/85 sm:inline">
                        Verifikasi dengan email institusi & klaim sekarang
                    </span>
                    <a
                        href="/#pricing"
                        className="ml-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 font-semibold text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/25"
                    >
                        Klaim →
                    </a>
                </p>
                <button
                    type="button"
                    onClick={handleDismiss}
                    aria-label="Tutup banner promo"
                    className="absolute top-1/2 right-3 grid size-6 -translate-y-1/2 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                    <X className="size-3.5" />
                </button>
            </div>
        </div>
    );
}
