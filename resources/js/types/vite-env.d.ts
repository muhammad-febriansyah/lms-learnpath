/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_RECAPTCHA_SITE_KEY?: string;
}

interface Grecaptcha {
    ready(callback: () => void): void;
    execute(siteKey: string, options: { action: string }): Promise<string>;
}

interface Window {
    grecaptcha?: Grecaptcha;
}
