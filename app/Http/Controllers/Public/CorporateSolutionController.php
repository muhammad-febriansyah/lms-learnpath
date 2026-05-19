<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class CorporateSolutionController extends Controller
{
    /**
     * @var array<string, array<string, mixed>>
     */
    private const INDUSTRIES = [
        'banking' => [
            'name' => 'Perbankan & Finance',
            'tagline' => 'Compliance siap audit, AO siap lapangan, leadership siap scale.',
            'description' => 'Solusi pembelajaran end-to-end untuk bank, multifinance, dan lembaga keuangan — dari onboarding Account Officer baru hingga sertifikasi AML/KYC sesuai regulasi OJK.',
            'gradient' => 'from-blue-700 to-indigo-900',
            'pain_points' => [
                ['title' => 'Audit OJK & compliance tahunan', 'desc' => 'Sertifikasi AML, KYC, dan APU-PPT yang trackable per individu untuk laporan audit.'],
                ['title' => 'Onboarding frontliner massal', 'desc' => 'Cabang baru butuh AO/CSR siap dalam minggu, bukan bulan.'],
                ['title' => 'Skill gap kredit & risk management', 'desc' => 'Analisa 5C, NPL handling, dan financial modeling yang up-to-date.'],
            ],
            'features' => [
                ['icon' => 'shield-check', 'title' => 'Compliance Tracker', 'desc' => 'Audit log lengkap per modul. Siap diserahkan ke auditor OJK.'],
                ['icon' => 'route', 'title' => 'Learning Path AO', 'desc' => 'Roadmap 6-8 minggu dengan OJT digital + sertifikasi akhir.'],
                ['icon' => 'target', 'title' => 'Skill Matrix Banking', 'desc' => 'Kompetensi per jabatan (AO, RM, BM, Compliance) yang sudah dipetakan.'],
            ],
            'case_studies' => ['Bank Mandiri', 'BCA'],
            'modules_count' => 48,
        ],
        'manufacturing' => [
            'name' => 'Manufaktur & Otomotif',
            'tagline' => 'Safety nol toleransi, lean operations, dan leadership pipeline.',
            'description' => 'Pelatihan untuk pabrik, plant, dan operasi manufaktur — dari safety induction wajib, lean six sigma, hingga program future leader untuk supervisor & manager.',
            'gradient' => 'from-orange-600 to-red-800',
            'pain_points' => [
                ['title' => 'Safety induction untuk shift baru', 'desc' => 'Karyawan baru/kontrak butuh refreshment safety setiap masuk shift.'],
                ['title' => 'Standardisasi SOP antar plant', 'desc' => 'Beberapa lokasi pabrik, SOP tidak konsisten antar daerah.'],
                ['title' => 'Leadership pipeline supervisor', 'desc' => 'Promosi internal tidak terstruktur, banyak skill gap di lini supervisor.'],
            ],
            'features' => [
                ['icon' => 'shield-check', 'title' => 'Safety Library', 'desc' => 'Modul K3, JSA, dan investigasi insiden siap pakai.'],
                ['icon' => 'workflow', 'title' => 'SOP Standardisasi', 'desc' => 'Versi SOP terpusat, sinkron ke semua plant via course.'],
                ['icon' => 'users', 'title' => 'Future Leader', 'desc' => 'Program 6 bulan blended learning + coaching cohort.'],
            ],
            'case_studies' => ['Astra International'],
            'modules_count' => 36,
        ],
        'technology' => [
            'name' => 'Teknologi & Startup',
            'tagline' => 'Reskilling data & AI, engineering excellence, scale tanpa hire baru.',
            'description' => 'Bootcamp dan continuous learning untuk tim engineering, data, dan product. Cocok untuk tech company yang butuh upskill cepat tanpa beban hire baru.',
            'gradient' => 'from-indigo-700 to-violet-900',
            'pain_points' => [
                ['title' => 'Reskilling ke data & AI', 'desc' => 'Karyawan existing perlu pivot ke role data tanpa keluar masuk.'],
                ['title' => 'Engineering best practice', 'desc' => 'Tim engineering tumbuh cepat, perlu standar coding & arsitektur.'],
                ['title' => 'Capstone project trackable', 'desc' => 'Output learning harus konkret (project di repo, deployable).'],
            ],
            'features' => [
                ['icon' => 'sparkles', 'title' => 'Data & AI Bootcamp', 'desc' => '12 minggu blended dengan capstone project.'],
                ['icon' => 'git-branch', 'title' => 'Engineering Track', 'desc' => 'Curated path: backend, frontend, DevOps, SRE.'],
                ['icon' => 'bot', 'title' => 'AI Tutor Build-in', 'desc' => 'Tutor 24/7 dengan konteks materi course.'],
            ],
            'case_studies' => ['GoTo'],
            'modules_count' => 62,
        ],
        'retail' => [
            'name' => 'Retail & FMCG',
            'tagline' => 'Sales excellence, service yang konsisten lintas outlet & distributor.',
            'description' => 'Modul service excellence, teknik negosiasi, dan product knowledge untuk sales force dan frontliner retail — bisa di-deploy ke ratusan distributor sekaligus.',
            'gradient' => 'from-emerald-600 to-teal-800',
            'pain_points' => [
                ['title' => 'Service excellence tidak konsisten', 'desc' => 'Standar layanan berbeda antar cabang/outlet.'],
                ['title' => 'Product knowledge cepat usang', 'desc' => 'Produk baru launch, tim sales belum update.'],
                ['title' => 'Distributor & reseller training', 'desc' => 'Sulit melatih jaringan eksternal yang tersebar.'],
            ],
            'features' => [
                ['icon' => 'shopping-bag', 'title' => 'Service Excellence', 'desc' => 'Modul role-play customer handling.'],
                ['icon' => 'megaphone', 'title' => 'Product Launch Kit', 'desc' => 'Modul mini untuk every product launch.'],
                ['icon' => 'users', 'title' => 'Distributor Portal', 'desc' => 'Akses terpisah untuk jaringan eksternal.'],
            ],
            'case_studies' => ['Unilever Indonesia'],
            'modules_count' => 28,
        ],
        'government' => [
            'name' => 'BUMN & Pemerintahan',
            'tagline' => 'Talent pipeline, reskilling massal, dan kompetensi sesuai standar nasional.',
            'description' => 'Solusi untuk BUMN, kementerian, dan lembaga pemerintah — termasuk pelatihan ASN, sertifikasi kompetensi BNSP, dan reskilling karyawan ke era digital.',
            'gradient' => 'from-rose-700 to-pink-900',
            'pain_points' => [
                ['title' => 'Standar kompetensi BNSP/SKKNI', 'desc' => 'Modul harus selaras dengan standar nasional yang berlaku.'],
                ['title' => 'Reskilling massal ke digital', 'desc' => 'Ribuan karyawan perlu upskill digital literacy.'],
                ['title' => 'Anggaran pelatihan terbatas', 'desc' => 'Butuh ROI yang clear & laporan terstandar.'],
            ],
            'features' => [
                ['icon' => 'shield-check', 'title' => 'BNSP-Aligned', 'desc' => 'Modul mapping ke standar SKKNI.'],
                ['icon' => 'target', 'title' => 'Skill Matrix ASN', 'desc' => 'Kompetensi per jabatan fungsional.'],
                ['icon' => 'sparkles', 'title' => 'Reskilling Path', 'desc' => 'Roadmap karyawan menuju role digital.'],
            ],
            'case_studies' => ['Telkom Indonesia'],
            'modules_count' => 54,
        ],
    ];

    public function show(string $industry): Response
    {
        $data = self::INDUSTRIES[$industry] ?? null;
        abort_if($data === null, 404);

        $other = collect(self::INDUSTRIES)
            ->except($industry)
            ->map(fn (array $row, string $slug) => [
                'slug' => $slug,
                'name' => $row['name'],
                'tagline' => $row['tagline'],
            ])
            ->values();

        return Inertia::render('public/corporate-solution', [
            'industry' => array_merge($data, ['slug' => $industry]),
            'others' => $other,
        ]);
    }
}
