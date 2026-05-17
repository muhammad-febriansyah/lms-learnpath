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
            ['key' => 'legal_terms_title', 'value' => 'Syarat dan Ketentuan Penggunaan Platform LearnPath', 'type' => 'text', 'group' => 'legal', 'label' => 'Judul Syarat & Ketentuan', 'is_public' => false, 'sort_order' => 4],
            ['key' => 'legal_terms_content', 'value' => <<<'HTML'
<h2>1. Ruang Lingkup Layanan</h2>
<p>Dokumen ini mengatur hubungan hukum antara pengguna, perusahaan, mitra bisnis, instruktur, dan PT LearnPath Indonesia sebagai penyedia platform pembelajaran digital, termasuk namun tidak terbatas pada akses akun, pembelian kursus, penggunaan sertifikat elektronik, aktivitas forum, fitur evaluasi, serta integrasi modul skill matrix dan pelaporan pembelajaran.</p>
<p>Dengan mendaftar, mengakses, atau menggunakan salah satu bagian layanan LearnPath, pengguna dianggap telah membaca, memahami, dan menyetujui seluruh ketentuan yang berlaku tanpa pengecualian.</p>

<h2>2. Ketentuan Akun Pengguna</h2>
<ul>
<li>Pengguna wajib memberikan data identitas yang akurat, lengkap, dan dapat dipertanggungjawabkan.</li>
<li>Pengguna bertanggung jawab penuh atas keamanan akun, kata sandi, dan aktivitas yang terjadi melalui akun tersebut.</li>
<li>LearnPath berhak menangguhkan atau menonaktifkan akun yang terindikasi digunakan untuk penyalahgunaan, pemalsuan identitas, atau aktivitas yang melanggar hukum.</li>
</ul>

<h2>3. Pembelian, Akses Kursus, dan Sertifikat</h2>
<p>Akses ke kursus atau learning path tertentu dapat diberikan melalui pembelian langsung, bundling perusahaan, voucher, assignment dari administrator, atau skema langganan korporat. Sertifikat hanya diterbitkan apabila pengguna memenuhi seluruh prasyarat pembelajaran, termasuk penyelesaian materi, kehadiran, nilai minimum, dan ketentuan evaluasi yang ditetapkan.</p>
<blockquote>LearnPath berhak membatalkan penerbitan sertifikat atau mencabut sertifikat yang sudah diterbitkan apabila ditemukan indikasi kecurangan, manipulasi data, pelanggaran integritas akademik, atau penggunaan akun yang tidak sah.</blockquote>

<h2>4. Kewajiban dan Larangan Pengguna</h2>
<ol>
<li>Dilarang menggandakan, mendistribusikan ulang, menjual, atau memonetisasi materi pembelajaran tanpa izin tertulis.</li>
<li>Dilarang melakukan scraping, reverse engineering, eksploitasi celah, atau intervensi terhadap infrastruktur platform.</li>
<li>Dilarang mengunggah konten yang mengandung fitnah, ujaran kebencian, pornografi, malware, atau materi yang melanggar hak pihak ketiga.</li>
</ol>

<h2>5. Hak Kekayaan Intelektual</h2>
<p>Seluruh materi pembelajaran, ilustrasi, logo, desain antarmuka, video, modul interaktif, basis data, serta struktur sertifikat pada platform LearnPath dilindungi oleh peraturan perundang-undangan terkait hak cipta, merek, dan kekayaan intelektual lainnya. Penggunaan materi di luar kepentingan pembelajaran internal yang sah wajib memperoleh persetujuan tertulis dari pemilik hak.</p>

<h2>6. Pembatasan Tanggung Jawab</h2>
<p>LearnPath menyediakan layanan sebagaimana adanya dan berupaya menjaga ketersediaan sistem secara wajar. Namun demikian, LearnPath tidak bertanggung jawab atas kerugian tidak langsung, kehilangan peluang bisnis, hilangnya data akibat kelalaian pengguna, atau gangguan layanan yang timbul karena force majeure, gangguan jaringan, tindakan pihak ketiga, atau pemeliharaan sistem yang wajar.</p>

<h2>7. Perubahan Ketentuan</h2>
<p>Perusahaan dapat memperbarui syarat dan ketentuan sewaktu-waktu untuk menyesuaikan kebutuhan operasional, perubahan layanan, atau kewajiban hukum. Versi terbaru akan dipublikasikan melalui platform dan berlaku sejak tanggal ditetapkan.</p>

<h2>8. Hukum yang Berlaku</h2>
<p>Dokumen ini diatur dan ditafsirkan berdasarkan hukum Republik Indonesia. Apabila timbul perselisihan, para pihak sepakat untuk mengutamakan penyelesaian secara musyawarah sebelum menempuh upaya hukum sesuai yurisdiksi yang berlaku.</p>
HTML, 'type' => 'textarea', 'group' => 'legal', 'label' => 'Isi Syarat & Ketentuan', 'is_public' => false, 'sort_order' => 5],
            ['key' => 'legal_privacy_title', 'value' => 'Kebijakan Privasi dan Perlindungan Data Pribadi LearnPath', 'type' => 'text', 'group' => 'legal', 'label' => 'Judul Kebijakan Privasi', 'is_public' => false, 'sort_order' => 6],
            ['key' => 'legal_privacy_content', 'value' => <<<'HTML'
<h2>1. Data yang Kami Kumpulkan</h2>
<p>Kami dapat mengumpulkan data identitas, data kontak, informasi organisasi, histori pembelajaran, hasil asesmen, progres kursus, data transaksi, log aktivitas, dan data teknis perangkat sepanjang diperlukan untuk penyediaan layanan pembelajaran, sertifikasi, evaluasi, serta peningkatan keamanan platform.</p>

<h2>2. Tujuan Penggunaan Data</h2>
<ul>
<li>Menyediakan akses akun, kursus, learning path, penilaian, dan sertifikat digital.</li>
<li>Mengirim notifikasi operasional, pembaruan status pembelajaran, dan komunikasi layanan pelanggan.</li>
<li>Menyusun laporan pembelajaran, analisis kompetensi, serta evaluasi performa untuk pelanggan korporat sesuai otorisasi yang berlaku.</li>
<li>Mendeteksi, mencegah, dan menangani penyalahgunaan, fraud, atau insiden keamanan.</li>
</ul>

<h2>3. Dasar Pemrosesan dan Pengungkapan Data</h2>
<p>Data diproses berdasarkan persetujuan pengguna, pelaksanaan kontrak layanan, kepentingan sah perusahaan, serta kewajiban hukum yang berlaku. Dalam kondisi tertentu, data dapat dibagikan kepada penyedia infrastruktur, mitra pembayaran, penyedia email, auditor, atau klien korporat secara terbatas dan proporsional sesuai tujuan layanan.</p>
<blockquote>Kami tidak menjual data pribadi pengguna kepada pihak ketiga untuk kepentingan pemasaran independen tanpa dasar hukum atau persetujuan yang sah.</blockquote>

<h2>4. Penyimpanan dan Keamanan</h2>
<p>LearnPath menerapkan langkah pengamanan administratif, teknis, dan organisasi yang wajar, termasuk pembatasan akses, pencatatan aktivitas, pengelolaan kredensial, dan kontrol pemrosesan data. Walaupun demikian, tidak ada mekanisme transmisi atau penyimpanan data yang sepenuhnya bebas risiko.</p>

<h2>5. Hak Pengguna</h2>
<ol>
<li>Meminta akses dan koreksi atas data pribadi yang tidak akurat.</li>
<li>Meminta pembaruan, pembatasan, atau penghapusan data sepanjang dimungkinkan oleh ketentuan hukum dan kontrak layanan.</li>
<li>Menyampaikan keberatan terhadap pemrosesan tertentu atau menarik persetujuan untuk aktivitas yang berbasis consent.</li>
</ol>

<h2>6. Retensi Data</h2>
<p>Data akan disimpan selama masih diperlukan untuk tujuan layanan, kewajiban audit, kepatuhan hukum, penyelesaian sengketa, atau kebutuhan pembuktian. Setelah masa retensi berakhir, data akan dihapus, dianonimkan, atau diproses sesuai kebijakan internal yang berlaku.</p>

<h2>7. Cookie dan Analitik</h2>
<p>Platform dapat menggunakan cookie, local storage, dan teknologi serupa untuk menjaga sesi login, memahami preferensi pengguna, serta menganalisis performa layanan. Pengguna dapat mengatur preferensi browser, namun sebagian fitur mungkin tidak berjalan optimal apabila cookie dinonaktifkan.</p>

<h2>8. Hubungi Kami</h2>
<p>Apabila Anda memiliki pertanyaan, permintaan, atau keluhan terkait privasi dan perlindungan data, silakan menghubungi tim kami melalui email resmi yang tercantum pada halaman kontak atau pengaturan perusahaan.</p>
HTML, 'type' => 'textarea', 'group' => 'legal', 'label' => 'Isi Kebijakan Privasi', 'is_public' => false, 'sort_order' => 7],

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
