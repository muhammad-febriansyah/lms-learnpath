import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

const RECAPTCHA_SCRIPT_ID = 'google-recaptcha-v3';

let recaptchaScriptPromise: Promise<void> | null = null;

function getSiteKey(): string {
    return import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim() ?? '';
}

type SharedRecaptcha = { recaptcha?: { enabled: boolean } };

function loadRecaptchaScript(siteKey: string): Promise<void> {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('reCAPTCHA hanya tersedia di browser.'));
    }

    const grecaptcha = window.grecaptcha;

    if (grecaptcha?.execute) {
        return new Promise((resolve) => grecaptcha.ready(resolve));
    }

    if (recaptchaScriptPromise) {
        return recaptchaScriptPromise;
    }

    recaptchaScriptPromise = new Promise<void>((resolve, reject) => {
        const existingScript = document.getElementById(RECAPTCHA_SCRIPT_ID) as HTMLScriptElement | null;

        if (existingScript) {
            existingScript.addEventListener('load', () => window.grecaptcha?.ready(resolve), { once: true });
            existingScript.addEventListener('error', () => reject(new Error('Gagal memuat reCAPTCHA.')), {
                once: true,
            });

            return;
        }

        const script = document.createElement('script');
        script.id = RECAPTCHA_SCRIPT_ID;
        script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
        script.async = true;
        script.defer = true;
        script.onload = () => window.grecaptcha?.ready(resolve);
        script.onerror = () => {
            recaptchaScriptPromise = null;
            reject(new Error('Gagal memuat reCAPTCHA.'));
        };

        document.head.appendChild(script);
    });

    return recaptchaScriptPromise;
}

export function useRecaptchaV3() {
    const siteKey = getSiteKey();
    const page = usePage<SharedRecaptcha>();
    const serverEnabled = page.props.recaptcha?.enabled ?? true;
    const enabled = siteKey !== '' && serverEnabled;

    useEffect(() => {
        if (! enabled) {
            return;
        }

        void loadRecaptchaScript(siteKey);
    }, [enabled, siteKey]);

    async function execute(action: string): Promise<string> {
        if (! enabled) {
            return '';
        }

        await loadRecaptchaScript(siteKey);

        if (! window.grecaptcha) {
            throw new Error('reCAPTCHA belum siap.');
        }

        return window.grecaptcha.execute(siteKey, { action });
    }

    return { enabled, execute };
}
