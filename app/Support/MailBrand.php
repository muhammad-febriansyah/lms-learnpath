<?php

namespace App\Support;

/**
 * Snapshot brand info untuk dipakai di email templates (header & footer).
 * Dipakai supaya email punya identitas konsisten tanpa harus query setting
 * berulang di tiap composer.
 */
final class MailBrand
{
    /**
     * @return array{
     *     name: string,
     *     tagline: string|null,
     *     logo_url: string|null,
     *     primary_color: string,
     *     secondary_color: string,
     *     email: string|null,
     *     phone: string|null,
     *     whatsapp: string|null,
     *     address: string|null,
     *     company_name: string|null,
     *     home_url: string,
     *     social: array<string, string|null>,
     * }
     */
    public static function snapshot(): array
    {
        $logo = Setting::imageUrl('site_logo');

        return [
            'name' => (string) (Setting::get('site_name') ?: config('app.name', 'LearnPath')),
            'tagline' => self::nullable(Setting::get('site_tagline')),
            'logo_url' => $logo,
            'primary_color' => (string) (Setting::get('brand_primary_color') ?: '#12237D'),
            'secondary_color' => (string) (Setting::get('brand_secondary_color') ?: '#1e3a8a'),
            'email' => self::nullable(Setting::get('site_email')),
            'phone' => self::nullable(Setting::get('site_phone')),
            'whatsapp' => self::nullable(Setting::get('site_whatsapp')),
            'address' => self::nullable(Setting::get('site_address')),
            'company_name' => self::nullable(Setting::get('legal_company_name')),
            'home_url' => (string) (config('app.url') ?: url('/')),
            'social' => [
                'facebook' => self::nullable(Setting::get('social_facebook')),
                'instagram' => self::nullable(Setting::get('social_instagram')),
                'twitter' => self::nullable(Setting::get('social_twitter')),
                'youtube' => self::nullable(Setting::get('social_youtube')),
                'linkedin' => self::nullable(Setting::get('social_linkedin')),
                'tiktok' => self::nullable(Setting::get('social_tiktok')),
            ],
        ];
    }

    private static function nullable(mixed $value): ?string
    {
        $value = trim((string) ($value ?? ''));

        return $value === '' ? null : $value;
    }
}
