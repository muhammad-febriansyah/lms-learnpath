<?php

namespace Database\Seeders;

use App\Models\AboutSetting;
use Illuminate\Database\Seeder;

class AboutSettingSeeder extends Seeder
{
    public function run(): void
    {
        AboutSetting::updateOrCreate(
            ['id' => 1],
            [
                'title' => 'Tentang Learnpath',
                'tagline' => 'Belajar tanpa batas, tumbuh tanpa henti.',
                'description' => <<<'HTML'
                <p>Learnpath adalah platform pembelajaran digital yang dirancang untuk membantu individu maupun perusahaan mengembangkan keterampilan secara terstruktur dan terukur.</p>
                <p>Sejak <strong>2024</strong>, kami telah mendampingi ribuan pelajar dan ratusan perusahaan di Indonesia untuk membangun jalur pembelajaran yang relevan dengan kebutuhan dunia kerja.</p>
                HTML,
                'founded_year' => 2024,
                'vision' => <<<'HTML'
                <p>Menjadi <strong>platform pembelajaran digital terdepan</strong> di Asia Tenggara yang memberdayakan setiap individu dan organisasi untuk berkembang melalui pendidikan berkualitas.</p>
                HTML,
                'mission' => <<<'HTML'
                <ul>
                    <li>Menyediakan kursus berkualitas yang dikurasi oleh praktisi industri.</li>
                    <li>Memberdayakan instruktur lokal untuk berbagi pengetahuan dengan jangkauan luas.</li>
                    <li>Menghadirkan teknologi pembelajaran adaptif berbasis AI.</li>
                    <li>Membangun ekosistem skill-matrix yang menghubungkan kompetensi dengan kebutuhan bisnis.</li>
                </ul>
                HTML,
                'values' => [
                    [
                        'title' => 'Integritas',
                        'description' => 'Kami berkomitmen pada kejujuran, transparansi, dan tanggung jawab dalam setiap keputusan.',
                    ],
                    [
                        'title' => 'Inovasi',
                        'description' => 'Terus mencari cara baru untuk membuat pembelajaran lebih efektif, menarik, dan terjangkau.',
                    ],
                    [
                        'title' => 'Kolaborasi',
                        'description' => 'Bertumbuh bersama instruktur, mitra, dan pelajar dengan saling menghargai kontribusi setiap pihak.',
                    ],
                    [
                        'title' => 'Berdampak',
                        'description' => 'Mengukur keberhasilan dari dampak nyata yang kami berikan terhadap karier dan organisasi pengguna.',
                    ],
                ],
                'stats' => [
                    ['label' => 'Siswa Aktif', 'value' => '12000', 'suffix' => '+'],
                    ['label' => 'Kursus Tersedia', 'value' => '350', 'suffix' => '+'],
                    ['label' => 'Instruktur Tersertifikasi', 'value' => '180', 'suffix' => ''],
                    ['label' => 'Tingkat Kepuasan', 'value' => '96', 'suffix' => '%'],
                ],
                'founder_name' => 'Dimas Pratama',
                'founder_role' => 'Founder & CEO',
                'founder_message' => <<<'HTML'
                <p>"Learnpath lahir dari keyakinan bahwa <em>akses terhadap pendidikan berkualitas</em> seharusnya tidak dibatasi oleh lokasi atau latar belakang."</p>
                <p>Kami membangun platform ini untuk menjembatani <strong>pelajar, instruktur, dan perusahaan</strong> dalam satu ekosistem pembelajaran yang adaptif. Terima kasih telah menjadi bagian dari perjalanan kami.</p>
                HTML,
                'contact_email' => 'hello@learnpath.id',
                'contact_phone' => '+62 21 5000 1234',
                'contact_address' => "Gedung Cyber 2 Lantai 15\nJl. HR Rasuna Said Blok X-5\nKuningan, Jakarta Selatan 12950\nIndonesia",
                'contact_map_url' => 'https://maps.google.com/?q=Jakarta+Selatan',
                'social_facebook' => 'https://facebook.com/learnpath.id',
                'social_instagram' => 'https://instagram.com/learnpath.id',
                'social_twitter' => 'https://x.com/learnpath_id',
                'social_linkedin' => 'https://linkedin.com/company/learnpath',
                'social_youtube' => 'https://youtube.com/@learnpath',
            ],
        );
    }
}
