import type { Auth, FlashMessages, SiteSettings } from '@/types/auth';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

type ToastPayload = {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
};

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            site: SiteSettings;
            flash: FlashMessages & { toast?: ToastPayload | null };
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
        flashDataType: {
            toast?: ToastPayload;
        };
    }

    export interface PageProps {
        name: string;
        auth: Auth;
        site: SiteSettings;
        flash: FlashMessages & { toast?: ToastPayload | null };
        sidebarOpen: boolean;
    }
}
