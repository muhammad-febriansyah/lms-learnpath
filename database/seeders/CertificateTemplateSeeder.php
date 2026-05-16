<?php

namespace Database\Seeders;

use App\Models\CertificateTemplate;
use Illuminate\Database\Seeder;

class CertificateTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Sertifikat Course Default',
                'scope' => CertificateTemplate::SCOPE_COURSE,
                'orientation' => 'landscape',
                'status' => 'active',
                'title' => 'Sertifikat Penyelesaian Course',
                'subtitle' => 'Diberikan sebagai apresiasi atas keberhasilan belajar',
                'body_text' => 'Template utama untuk sertifikat penyelesaian course reguler.',
                'show_qr' => true,
                'show_signature' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Sertifikat Learning Path',
                'scope' => CertificateTemplate::SCOPE_LEARNING_PATH,
                'orientation' => 'landscape',
                'status' => 'draft',
                'title' => 'Sertifikat Kelulusan Learning Path',
                'subtitle' => 'Untuk peserta yang menuntaskan jalur belajar lengkap',
                'body_text' => 'Disiapkan untuk learning path yang memiliki milestone berjenjang.',
                'show_qr' => true,
                'show_signature' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Sertifikat Corporate',
                'scope' => CertificateTemplate::SCOPE_CORPORATE,
                'orientation' => 'portrait',
                'status' => 'draft',
                'title' => 'Sertifikat Corporate Training',
                'subtitle' => 'Template branding untuk perusahaan atau batch internal',
                'body_text' => 'Disiapkan untuk kebutuhan branding khusus perusahaan.',
                'show_qr' => true,
                'show_signature' => false,
                'sort_order' => 3,
            ],
        ];

        foreach ($templates as $template) {
            CertificateTemplate::query()->updateOrCreate(
                ['name' => $template['name']],
                $template,
            );
        }
    }
}
