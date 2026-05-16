<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            // ===== General =====
            ['key' => 'site_name', 'value' => 'LearnPath', 'type' => 'text', 'group' => 'general', 'label' => 'Nama Website', 'is_public' => true, 'sort_order' => 1],
            ['key' => 'site_tagline', 'value' => 'Belajar tanpa batas, kapan saja, di mana saja', 'type' => 'text', 'group' => 'general', 'label' => 'Tagline', 'is_public' => true, 'sort_order' => 2],
            ['key' => 'site_description', 'value' => 'Platform pembelajaran online untuk meningkatkan kompetensi profesional Anda.', 'type' => 'textarea', 'group' => 'general', 'label' => 'Deskripsi Website', 'is_public' => true, 'sort_order' => 3],
            ['key' => 'site_logo', 'value' => null, 'type' => 'image', 'group' => 'general', 'label' => 'Logo', 'is_public' => true, 'sort_order' => 4],
            ['key' => 'site_favicon', 'value' => null, 'type' => 'image', 'group' => 'general', 'label' => 'Favicon', 'is_public' => true, 'sort_order' => 5],
            ['key' => 'site_email', 'value' => 'hello@learnpath.id', 'type' => 'email', 'group' => 'general', 'label' => 'Email Kontak', 'is_public' => true, 'sort_order' => 7],
            ['key' => 'site_phone', 'value' => '+62 812 3456 7890', 'type' => 'text', 'group' => 'general', 'label' => 'Nomor Telepon', 'is_public' => true, 'sort_order' => 8],
            ['key' => 'site_whatsapp', 'value' => '+62 812 3456 7890', 'type' => 'text', 'group' => 'general', 'label' => 'WhatsApp', 'is_public' => true, 'sort_order' => 9],
            ['key' => 'site_address', 'value' => 'Jakarta, Indonesia', 'type' => 'textarea', 'group' => 'general', 'label' => 'Alamat', 'is_public' => true, 'sort_order' => 10],

            // ===== SEO =====
            ['key' => 'seo_meta_title', 'value' => 'LearnPath - Platform Belajar Online', 'type' => 'text', 'group' => 'seo', 'label' => 'Meta Title', 'is_public' => true, 'sort_order' => 1],
            ['key' => 'seo_meta_description', 'value' => 'Tingkatkan kompetensi Anda dengan kursus online berkualitas.', 'type' => 'textarea', 'group' => 'seo', 'label' => 'Meta Description', 'is_public' => true, 'sort_order' => 2],
            ['key' => 'seo_meta_keywords', 'value' => 'lms, kursus online, belajar online, sertifikasi, training, skill matrix', 'type' => 'text', 'group' => 'seo', 'label' => 'Meta Keywords', 'is_public' => true, 'sort_order' => 3],
            ['key' => 'seo_og_image', 'value' => null, 'type' => 'image', 'group' => 'seo', 'label' => 'Open Graph Image', 'is_public' => true, 'sort_order' => 4],
            ['key' => 'seo_google_analytics_id', 'value' => null, 'type' => 'text', 'group' => 'seo', 'label' => 'Google Analytics ID', 'is_public' => false, 'sort_order' => 5],
            ['key' => 'seo_gtm_id', 'value' => null, 'type' => 'text', 'group' => 'seo', 'label' => 'Google Tag Manager ID', 'is_public' => false, 'sort_order' => 6],
            ['key' => 'seo_facebook_pixel', 'value' => null, 'type' => 'text', 'group' => 'seo', 'label' => 'Facebook Pixel ID', 'is_public' => false, 'sort_order' => 7],

            // ===== Social =====
            ['key' => 'social_facebook', 'value' => null, 'type' => 'url', 'group' => 'social', 'label' => 'Facebook', 'is_public' => true, 'sort_order' => 1],
            ['key' => 'social_instagram', 'value' => null, 'type' => 'url', 'group' => 'social', 'label' => 'Instagram', 'is_public' => true, 'sort_order' => 2],
            ['key' => 'social_twitter', 'value' => null, 'type' => 'url', 'group' => 'social', 'label' => 'X / Twitter', 'is_public' => true, 'sort_order' => 3],
            ['key' => 'social_youtube', 'value' => null, 'type' => 'url', 'group' => 'social', 'label' => 'YouTube', 'is_public' => true, 'sort_order' => 4],
            ['key' => 'social_tiktok', 'value' => null, 'type' => 'url', 'group' => 'social', 'label' => 'TikTok', 'is_public' => true, 'sort_order' => 5],
            ['key' => 'social_linkedin', 'value' => null, 'type' => 'url', 'group' => 'social', 'label' => 'LinkedIn', 'is_public' => true, 'sort_order' => 6],
            ['key' => 'social_telegram', 'value' => null, 'type' => 'url', 'group' => 'social', 'label' => 'Telegram', 'is_public' => true, 'sort_order' => 7],

            // ===== Branding =====
            ['key' => 'brand_primary_color', 'value' => '#0ea5e9', 'type' => 'color', 'group' => 'branding', 'label' => 'Warna Primer', 'is_public' => true, 'sort_order' => 1],
            ['key' => 'brand_secondary_color', 'value' => '#6366f1', 'type' => 'color', 'group' => 'branding', 'label' => 'Warna Sekunder', 'is_public' => true, 'sort_order' => 2],

            // ===== Payment =====
            ['key' => 'payment_currency', 'value' => 'IDR', 'type' => 'text', 'group' => 'payment', 'label' => 'Mata Uang', 'is_public' => true, 'sort_order' => 1],
            ['key' => 'payment_tax_percent', 'value' => '0', 'type' => 'number', 'group' => 'payment', 'label' => 'Persentase PPN (%)', 'is_public' => false, 'sort_order' => 2],
            ['key' => 'payment_fee_percent', 'value' => '0', 'type' => 'number', 'group' => 'payment', 'label' => 'Persentase Fee Platform (%)', 'is_public' => false, 'sort_order' => 3],
            ['key' => 'payment_order_expiry_hours', 'value' => '24', 'type' => 'number', 'group' => 'payment', 'label' => 'Expiry Order (jam)', 'is_public' => false, 'sort_order' => 4],

            // ===== Legal =====
            ['key' => 'legal_terms_url', 'value' => '/terms', 'type' => 'url', 'group' => 'legal', 'label' => 'Syarat & Ketentuan', 'is_public' => true, 'sort_order' => 1],
            ['key' => 'legal_privacy_url', 'value' => '/privacy', 'type' => 'url', 'group' => 'legal', 'label' => 'Kebijakan Privasi', 'is_public' => true, 'sort_order' => 2],
            ['key' => 'legal_company_name', 'value' => 'PT LearnPath Indonesia', 'type' => 'text', 'group' => 'legal', 'label' => 'Nama Perusahaan', 'is_public' => true, 'sort_order' => 3],

            // ===== Features Toggle =====
            ['key' => 'feature_registration_enabled', 'value' => '1', 'type' => 'boolean', 'group' => 'feature', 'label' => 'Aktifkan registrasi publik', 'is_public' => false, 'sort_order' => 1],
            ['key' => 'feature_google_login_enabled', 'value' => '1', 'type' => 'boolean', 'group' => 'feature', 'label' => 'Aktifkan Login Google', 'is_public' => true, 'sort_order' => 2],
            ['key' => 'feature_recaptcha_enabled', 'value' => '0', 'type' => 'boolean', 'group' => 'feature', 'label' => 'Aktifkan reCAPTCHA', 'is_public' => true, 'sort_order' => 3],
            ['key' => 'feature_skill_matrix_enabled', 'value' => '1', 'type' => 'boolean', 'group' => 'feature', 'label' => 'Aktifkan modul Skill Matrix', 'is_public' => false, 'sort_order' => 4],
            ['key' => 'feature_marketplace_enabled', 'value' => '1', 'type' => 'boolean', 'group' => 'feature', 'label' => 'Aktifkan marketplace publik', 'is_public' => true, 'sort_order' => 5],
        ];

        foreach ($rows as $row) {
            Setting::query()->updateOrCreate(
                ['key' => $row['key']],
                $row,
            );
        }
    }
}
