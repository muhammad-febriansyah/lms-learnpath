import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import type { FlashToast } from '@/types/ui';

type FlashShape = {
    toast?: FlashToast | null;
    success?: string | null;
    error?: string | null;
    info?: string | null;
    warning?: string | null;
};

type PagePropsWithFlash = {
    flash?: FlashShape;
};

/**
 * Reactive ke `props.flash` dari HandleInertiaRequests::share.
 *
 * Format yang didukung (urutan prioritas):
 *  1. flash.toast = { type, message }     ← struktur eksplisit
 *  2. flash.success / .error / .info / .warning = "pesan"  ← Laravel std
 *
 * Setiap navigation, hook ini bandingkan signature toast terbaru dengan yang
 * sudah ditampilkan; kalau berubah, fire `toast[type](message)`.
 */
export function useFlashToast(): void {
    const { props } = usePage<PagePropsWithFlash>();
    const lastSignature = useRef<string | null>(null);

    useEffect(() => {
        const flash = props.flash;

        if (!flash) {
return;
}

        const data = resolveToast(flash);

        if (!data) {
            lastSignature.current = null;

            return;
        }

        const signature = `${data.type}::${data.message}`;

        if (signature === lastSignature.current) {
            return;
        }

        lastSignature.current = signature;
        toast[data.type](data.message);
    }, [props.flash]);
}

function resolveToast(flash: FlashShape): FlashToast | null {
    if (flash.toast?.message) {
        return flash.toast;
    }

    const fallbacks: Array<{ key: keyof FlashShape; type: FlashToast['type'] }> = [
        { key: 'success', type: 'success' },
        { key: 'error', type: 'error' },
        { key: 'warning', type: 'warning' },
        { key: 'info', type: 'info' },
    ];

    for (const { key, type } of fallbacks) {
        const message = flash[key];

        if (typeof message === 'string' && message.length > 0) {
            return { type, message };
        }
    }

    return null;
}
