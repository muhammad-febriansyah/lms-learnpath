<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class CorporateHubController extends Controller
{
    /**
     * Slugs of the categories surfaced as tabs in the corporate hub.
     * Falls back to all active categories when none of these exist in DB.
     */
    private const CORPORATE_CATEGORY_SLUGS = [
        'leadership',
        'sales-lending',
        'operations',
        'compliance',
        'digital-marketing',
    ];

    public function index(Request $request): Response
    {
        $categories = $this->resolveCorporateCategories();

        $activeSlug = $request->string('category')->toString() ?: ($categories->first()?->slug ?? '');

        $courses = Course::query()
            ->where('is_published', true)
            ->when($activeSlug, fn ($q) => $q->whereHas('category', fn ($qq) => $qq->where('slug', $activeSlug)))
            ->with([
                'category:id,name,slug',
                'instructor:id,name',
                'instructor.instructorProfile:id,user_id,headline,photo_path',
            ])
            ->withCount(['lessons', 'enrollments'])
            ->orderByDesc('total_students')
            ->orderByDesc('id')
            ->limit(12)
            ->get();

        return Inertia::render('public/corporate', [
            'categories' => $categories->map(fn (Category $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'slug' => $c->slug,
                'courses_count' => $c->courses_count,
            ])->values(),
            'activeSlug' => $activeSlug,
            'courses' => $courses,
            'stats' => [
                'total_courses' => Course::where('is_published', true)->count(),
                'total_categories' => $categories->count(),
            ],
        ]);
    }

    public function caseStudies(): Response
    {
        return Inertia::render('front/case-studies', [
            'studies' => $this->caseStudyData(),
        ]);
    }

    /**
     * Data demo case study sampai modul CMS siap.
     *
     * @return array<int, array<string, mixed>>
     */
    private function caseStudyData(): array
    {
        return [
            [
                'company' => 'Bank Mandiri',
                'industry' => 'Perbankan',
                'logo_initial' => 'BM',
                'tagline' => 'Memangkas onboarding Account Officer dari 24 ke 8 minggu',
                'summary' => 'Implementasi learning path terstruktur + OJT digital untuk 1.200 Account Officer baru di seluruh Indonesia.',
                'metrics' => [
                    ['label' => 'Waktu onboarding', 'value' => '-66%'],
                    ['label' => 'Tingkat kelulusan', 'value' => '92%'],
                    ['label' => 'Karyawan dilatih', 'value' => '1.200+'],
                ],
                'tags' => ['Sales & Lending', 'Learning Path', 'OJT Digital'],
                'color' => 'from-blue-700 to-blue-900',
            ],
            [
                'company' => 'BCA',
                'industry' => 'Perbankan',
                'logo_initial' => 'BCA',
                'tagline' => 'Sertifikasi Compliance untuk 850 frontliner',
                'summary' => 'Roll-out modul AML & KYC interaktif dengan tracking individu untuk audit OJK tahunan.',
                'metrics' => [
                    ['label' => 'Compliance score', 'value' => '+38%'],
                    ['label' => 'Audit findings', 'value' => '-72%'],
                    ['label' => 'Karyawan tersertifikasi', 'value' => '850'],
                ],
                'tags' => ['Compliance', 'AML & KYC', 'Sertifikasi'],
                'color' => 'from-sky-700 to-blue-900',
            ],
            [
                'company' => 'Telkom Indonesia',
                'industry' => 'Telekomunikasi',
                'logo_initial' => 'TLK',
                'tagline' => 'Akselerasi reskilling 3.500 karyawan ke digital',
                'summary' => 'Skill matrix yang terhubung dengan rekomendasi kursus otomatis berbasis gap analysis.',
                'metrics' => [
                    ['label' => 'Skill gap closed', 'value' => '64%'],
                    ['label' => 'Rata-rata jam belajar', 'value' => '4.2 jam/minggu'],
                    ['label' => 'Karyawan dilatih', 'value' => '3.500+'],
                ],
                'tags' => ['Skill Matrix', 'Reskilling', 'Data & AI'],
                'color' => 'from-rose-700 to-red-900',
            ],
            [
                'company' => 'Astra International',
                'industry' => 'Otomotif & Manufaktur',
                'logo_initial' => 'AI',
                'tagline' => 'Leadership pipeline untuk 240 future leader',
                'summary' => 'Program 6 bulan blended learning + coaching cohort untuk high-potential employee.',
                'metrics' => [
                    ['label' => 'Promotion-readiness', 'value' => '78%'],
                    ['label' => 'Retention high-po', 'value' => '94%'],
                    ['label' => 'Talent pool', 'value' => '240'],
                ],
                'tags' => ['Leadership', 'Talent Management', 'Coaching'],
                'color' => 'from-indigo-700 to-violet-900',
            ],
            [
                'company' => 'Unilever Indonesia',
                'industry' => 'FMCG',
                'logo_initial' => 'UL',
                'tagline' => 'Service Excellence untuk 600 sales force',
                'summary' => 'Modul komunikasi & teknik negosiasi yang dipersonalisasi per segmen pasar tradisional dan modern.',
                'metrics' => [
                    ['label' => 'Closing rate', 'value' => '+22%'],
                    ['label' => 'NPS distributor', 'value' => '8.6/10'],
                    ['label' => 'Sales dilatih', 'value' => '600'],
                ],
                'tags' => ['Sales', 'Soft Skill', 'Service Excellence'],
                'color' => 'from-emerald-700 to-emerald-900',
            ],
            [
                'company' => 'GoTo',
                'industry' => 'Teknologi & E-commerce',
                'logo_initial' => 'GTO',
                'tagline' => 'Bootcamp Data Analyst internal untuk 180 talent',
                'summary' => 'Program 12 minggu dengan kombinasi self-paced course, live session, dan capstone project.',
                'metrics' => [
                    ['label' => 'Capstone passing', 'value' => '88%'],
                    ['label' => 'Pindah ke role data', 'value' => '54%'],
                    ['label' => 'Cohort size', 'value' => '180'],
                ],
                'tags' => ['Data & AI', 'Bootcamp', 'Career Switch'],
                'color' => 'from-green-700 to-emerald-900',
            ],
        ];
    }

    /**
     * @return Collection<int, Category>
     */
    private function resolveCorporateCategories()
    {
        $base = Category::query()
            ->where('is_active', true)
            ->whereHas('courses', fn ($q) => $q->where('is_published', true))
            ->withCount(['courses' => fn ($q) => $q->where('is_published', true)])
            ->orderBy('name');

        $curated = (clone $base)
            ->whereIn('slug', self::CORPORATE_CATEGORY_SLUGS)
            ->get();

        if ($curated->isNotEmpty()) {
            return $curated;
        }

        return $base->get();
    }
}
