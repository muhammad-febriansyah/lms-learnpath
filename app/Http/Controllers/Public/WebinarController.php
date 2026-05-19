<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class WebinarController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('public/webinars', [
            'upcoming' => $this->upcomingWebinars(),
            'past' => $this->pastWebinars(),
        ]);
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function upcomingWebinars(): array
    {
        return [
            [
                'slug' => 'building-skill-matrix-2026',
                'title' => 'Building Skill Matrix yang Aligned dengan Strategi Bisnis',
                'speaker' => 'Tania Kusuma',
                'speaker_role' => 'Head of People Development, Bank Mandiri',
                'date' => now()->addDays(7)->setTime(13, 0)->toIso8601String(),
                'duration_minutes' => 60,
                'format' => 'Live + Q&A',
                'audience' => 'HR & L&D Leader',
                'gradient' => 'from-blue-700 to-indigo-900',
                'tags' => ['Skill Matrix', 'HR Strategy'],
                'seats' => 250,
                'is_free' => true,
            ],
            [
                'slug' => 'ai-tutor-for-corporate-learning',
                'title' => 'Memanfaatkan AI Tutor untuk Skala Pembelajaran Korporat',
                'speaker' => 'Budi Hartono',
                'speaker_role' => 'Senior Trainer, Learnpath',
                'date' => now()->addDays(14)->setTime(10, 0)->toIso8601String(),
                'duration_minutes' => 45,
                'format' => 'Webinar + Demo',
                'audience' => 'L&D, Operasional',
                'gradient' => 'from-violet-700 to-fuchsia-900',
                'tags' => ['AI', 'Personalisasi'],
                'seats' => 500,
                'is_free' => true,
            ],
            [
                'slug' => 'compliance-bnsp-2026',
                'title' => 'Compliance L&D di Era POJK Baru: Apa yang Berubah',
                'speaker' => 'Dewi Lestari',
                'speaker_role' => 'Compliance Specialist, OJK Certified',
                'date' => now()->addDays(21)->setTime(14, 0)->toIso8601String(),
                'duration_minutes' => 90,
                'format' => 'Workshop',
                'audience' => 'Compliance & Audit',
                'gradient' => 'from-emerald-700 to-teal-900',
                'tags' => ['Compliance', 'AML/KYC'],
                'seats' => 150,
                'is_free' => false,
            ],
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function pastWebinars(): array
    {
        return [
            [
                'slug' => 'onboarding-account-officer',
                'title' => 'Memangkas Onboarding Account Officer dari 24 ke 8 Minggu',
                'speaker' => 'Rizky Pramudita',
                'date' => now()->subDays(20)->toIso8601String(),
                'views' => 1248,
                'tags' => ['Onboarding', 'Banking'],
            ],
            [
                'slug' => 'leadership-pipeline-hipo',
                'title' => 'Membangun Leadership Pipeline untuk High-Potential Employee',
                'speaker' => 'Sari Wijaya',
                'date' => now()->subDays(45)->toIso8601String(),
                'views' => 892,
                'tags' => ['Leadership', 'Talent Management'],
            ],
            [
                'slug' => 'reskilling-manufaktur',
                'title' => 'Reskilling Karyawan Manufaktur ke Era Digital',
                'speaker' => 'Andi Wibowo',
                'date' => now()->subDays(60)->toIso8601String(),
                'views' => 1567,
                'tags' => ['Reskilling', 'Manufaktur'],
            ],
        ];
    }
}
