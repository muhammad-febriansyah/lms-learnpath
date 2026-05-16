import { useFlashToast } from '@/hooks/use-flash-toast';

/**
 * Listener mount-only yang memanggil `useFlashToast` di dalam Inertia context.
 * Render <FlashListener /> di dalam layout (AppLayout/AuthLayout) supaya
 * `usePage()` dari hook terhubung ke page context.
 */
export function FlashListener() {
    useFlashToast();

    return null;
}
