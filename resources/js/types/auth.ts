export type User = {
    id: number;
    name: string;
    email: string;
    username?: string | null;
    avatar?: string;
    avatar_url?: string | null;
    phone?: string | null;
    bio?: string | null;
    status?: string;
    language?: string;
    timezone?: string;
    country?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
    roles: string[];
    permissions: string[];
};

export type SiteSettings = Record<string, string | number | boolean | null>;

export type FlashMessages = {
    success?: string | null;
    error?: string | null;
    info?: string | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
