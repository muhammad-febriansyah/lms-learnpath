<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\AboutSetting;
use App\Models\Category;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Faq;
use App\Models\LearningPath;
use App\Models\Organization;
use App\Models\Review;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class PageController extends Controller
{
    public function home(): Response
    {
        return Inertia::render('front/index', [
            'canRegister' => Features::enabled(Features::registration()),
            'hero' => $this->heroData(),
            'partners' => $this->homePartners(),
            'categories' => $this->homeCategories(),
            'stats' => $this->homeStats(),
            'testimonials' => $this->homeTestimonials(),
            'faqs' => $this->homeFaqs(),
        ]);
    }

    public function about(): Response
    {
        $about = AboutSetting::query()->first();

        return Inertia::render('front/about', [
            'about' => $about ? [
                'title' => $about->title,
                'tagline' => $about->tagline,
                'description' => $about->description,
                'founded_year' => $about->founded_year,
                'vision' => $about->vision,
                'mission' => $about->mission,
                'values' => $about->values ?? [],
                'stats' => $about->stats ?? [],
                'founder_name' => $about->founder_name,
                'founder_role' => $about->founder_role,
                'founder_message' => $about->founder_message,
                'contact_email' => $about->contact_email,
                'contact_phone' => $about->contact_phone,
                'contact_address' => $about->contact_address,
                'socials' => array_filter([
                    'facebook' => $about->social_facebook,
                    'instagram' => $about->social_instagram,
                    'twitter' => $about->social_twitter,
                    'linkedin' => $about->social_linkedin,
                    'youtube' => $about->social_youtube,
                ]),
            ] : null,
        ]);
    }

    public function contact(): Response
    {
        $about = AboutSetting::query()->first();
        $siteSettings = $this->settingsByGroup('general');

        return Inertia::render('front/contact', [
            'contact' => [
                'email' => $about?->contact_email ?? ($siteSettings['site_email'] ?? null),
                'phone' => $about?->contact_phone ?? ($siteSettings['site_phone'] ?? null),
                'whatsapp' => $siteSettings['site_whatsapp'] ?? null,
                'address' => $about?->contact_address ?? ($siteSettings['site_address'] ?? null),
                'map_url' => $about?->contact_map_url,
            ],
        ]);
    }

    public function contactSubmit(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:160'],
            'subject' => ['required', 'string', 'max:200'],
            'message' => ['required', 'string', 'max:2000'],
        ]);

        // Catatan: integrasi pengiriman email/Notification dilakukan di iterasi berikutnya.
        // Sementara cukup flash agar UX form tetap lengkap.
        return back()->with('success', 'Terima kasih, pesan Anda sudah kami terima. Tim Learnpath akan menghubungi dalam 1x24 jam kerja.');
    }

    public function faq(Request $request): Response
    {
        $faqs = Faq::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'category', 'question', 'answer'])
            ->groupBy('category')
            ->map(fn ($group, $category) => [
                'category' => $category,
                'items' => $group->map(fn ($faq) => [
                    'id' => $faq->id,
                    'question' => $faq->question,
                    'answer' => $faq->answer,
                ])->values(),
            ])
            ->values();

        return Inertia::render('front/faq', [
            'faqs' => $faqs,
        ]);
    }

    public function terms(): Response
    {
        $legal = $this->settingsByGroup('legal');

        return Inertia::render('front/legal', [
            'page' => [
                'kind' => 'terms',
                'title' => $legal['legal_terms_title'] ?? 'Syarat dan Ketentuan',
                'subtitle' => 'Aturan yang berlaku saat Anda menggunakan platform Learnpath.',
                'content' => $legal['legal_terms_content'] ?? '<p>Konten syarat & ketentuan belum tersedia.</p>',
                'company' => $legal['legal_company_name'] ?? 'PT Learnpath Indonesia',
                'last_updated' => '2026-01-01',
            ],
        ]);
    }

    public function privacy(): Response
    {
        $legal = $this->settingsByGroup('legal');

        return Inertia::render('front/legal', [
            'page' => [
                'kind' => 'privacy',
                'title' => $legal['legal_privacy_title'] ?? 'Kebijakan Privasi',
                'subtitle' => 'Bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda.',
                'content' => $legal['legal_privacy_content'] ?? '<p>Konten kebijakan privasi belum tersedia.</p>',
                'company' => $legal['legal_company_name'] ?? 'PT Learnpath Indonesia',
                'last_updated' => '2026-01-01',
            ],
        ]);
    }

    public function help(): Response
    {
        $popularFaqs = Faq::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->limit(6)
            ->get(['id', 'category', 'question', 'answer']);

        return Inertia::render('front/help', [
            'popular_faqs' => $popularFaqs,
        ]);
    }

    public function careers(): Response
    {
        return Inertia::render('front/careers', [
            'positions' => $this->openPositions(),
        ]);
    }

    public function blog(): Response
    {
        return Inertia::render('front/blog', [
            'posts' => $this->blogPosts(),
        ]);
    }

    /**
     * @return array<string, string|null>
     */
    private function settingsByGroup(string $group): array
    {
        return Setting::query()
            ->where('group', $group)
            ->pluck('value', 'key')
            ->toArray();
    }

    /**
     * Daftar lowongan demo. Ganti dengan model `JobPosting` ketika modul recruiting siap.
     *
     * @return array<int, array{title: string, department: string, location: string, type: string, description: string}>
     */
    private function openPositions(): array
    {
        return [
            ['title' => 'Senior Full-Stack Engineer', 'department' => 'Engineering', 'location' => 'Jakarta / Remote', 'type' => 'Full-time', 'description' => 'Bangun fitur LMS modern dengan Laravel, Inertia, dan React. Pengalaman 5+ tahun.'],
            ['title' => 'Product Designer (UI/UX)', 'department' => 'Product', 'location' => 'Jakarta / Hybrid', 'type' => 'Full-time', 'description' => 'Desain pengalaman pembelajaran end-to-end untuk learner dan corporate admin.'],
            ['title' => 'Instructional Designer', 'department' => 'Content', 'location' => 'Remote (Indonesia)', 'type' => 'Full-time', 'description' => 'Susun kurikulum, struktur modul, dan asesmen yang efektif untuk berbagai domain.'],
            ['title' => 'B2B Account Executive', 'department' => 'Sales', 'location' => 'Jakarta', 'type' => 'Full-time', 'description' => 'Tutup deal corporate training di sektor perbankan, fintech, dan FMCG.'],
            ['title' => 'Customer Success Manager', 'department' => 'Customer Success', 'location' => 'Jakarta / Hybrid', 'type' => 'Full-time', 'description' => 'Pastikan klien korporat sukses mengimplementasikan Learnpath dari onboarding sampai expansion.'],
            ['title' => 'Data Analyst', 'department' => 'Data', 'location' => 'Remote', 'type' => 'Full-time', 'description' => 'Analisa funnel pembelajaran, retention, dan konversi untuk dukung tim product & marketing.'],
        ];
    }

    /**
     * Blog dummy posts.
     *
     * @return array<int, array{slug: string, title: string, excerpt: string, category: string, author: string, read_time: string, published_at: string, cover: string}>
     */
    private function blogPosts(): array
    {
        $covers = [
            'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=70',
            'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=900&q=70',
            'https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=900&q=70',
            'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&w=900&q=70',
            'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=900&q=70',
            'https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=900&q=70',
            'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=70',
            'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=70',
        ];

        $rows = [
            ['title' => '7 Tanda Karyawan Siap Naik ke Level Manager', 'excerpt' => 'Indikator perilaku, technical skill, dan dampak yang biasa muncul sebelum promosi ke manajemen lini pertama.', 'category' => 'Leadership', 'author' => 'Dewi Lestari', 'read_time' => '8 menit'],
            ['title' => 'Roadmap Belajar Data Analyst untuk Pemula', 'excerpt' => 'Urutan kursus dan project portofolio yang realistis dijalani sambil bekerja full-time.', 'category' => 'Data & AI', 'author' => 'Budi Hartono', 'read_time' => '10 menit'],
            ['title' => 'Cara Bank Daerah Mempercepat Onboarding Account Officer', 'excerpt' => 'Studi kasus penerapan learning path dan OJT digital yang memangkas waktu ramp-up dari 6 bulan ke 8 minggu.', 'category' => 'Case Study', 'author' => 'Tim Learnpath', 'read_time' => '6 menit'],
            ['title' => 'Membangun Skill Matrix yang Benar-benar Dipakai Bisnis', 'excerpt' => 'Framework praktis menyusun, mengisi, dan menjaga skill matrix tetap relevan dengan strategi perusahaan.', 'category' => 'HR & L&D', 'author' => 'Sari Wijaya', 'read_time' => '12 menit'],
            ['title' => 'Service Recovery: Mengubah Komplain Jadi Loyalitas', 'excerpt' => 'Framework 4 langkah service recovery dengan studi kasus dari unit operasional perbankan.', 'category' => 'Service Excellence', 'author' => 'Dewi Lestari', 'read_time' => '7 menit'],
            ['title' => 'Anti Money Laundering 101 untuk Frontliner', 'excerpt' => 'Konsep dasar APU-PPT dan red flag transaksi yang wajib dikenali setiap petugas frontliner.', 'category' => 'Compliance', 'author' => 'Sari Wijaya', 'read_time' => '9 menit'],
            ['title' => 'Public Speaking: Latihan 15 Menit Setiap Hari', 'excerpt' => 'Routine sederhana untuk membangun confidence presentasi tanpa harus ikut kelas mahal.', 'category' => 'Soft Skill', 'author' => 'Budi Hartono', 'read_time' => '5 menit'],
            ['title' => 'Strategi Bilingual Email Bisnis yang Profesional', 'excerpt' => 'Template dan frasa kunci untuk email negosiasi, follow-up, dan permintaan resmi dalam bahasa Inggris.', 'category' => 'Bahasa', 'author' => 'Budi Hartono', 'read_time' => '6 menit'],
        ];

        return collect($rows)->map(function (array $row, int $i) use ($covers) {
            return [
                'slug' => Str::slug($row['title']),
                'title' => $row['title'],
                'excerpt' => $row['excerpt'],
                'category' => $row['category'],
                'author' => $row['author'],
                'read_time' => $row['read_time'],
                'published_at' => now()->subDays(($i + 1) * 3)->format('d M Y'),
                'cover' => $covers[$i % count($covers)],
            ];
        })->all();
    }

    /**
     * Data dinamis untuk hero section di landing page.
     *
     * @return array{
     *     roles: array<int, string>,
     *     totalStudents: int,
     *     avgRating: float,
     *     totalReviews: int,
     *     showcase: array{title: string, progress: int}|null
     * }
     */
    private function heroData(): array
    {
        $roles = LearningPath::query()
            ->where('is_published', true)
            ->orderByDesc('total_students')
            ->limit(10)
            ->pluck('title')
            ->map(fn (string $title) => trim(Str::after($title, 'Roadmap')) ?: $title)
            ->values()
            ->all();

        $totalStudents = (int) Course::query()
            ->where('is_published', true)
            ->sum('total_students');

        $reviewAgg = Review::query()
            ->where('is_public', true)
            ->selectRaw('ROUND(AVG(rating), 1) AS avg_rating, COUNT(*) AS total_reviews')
            ->first();

        $avgRating = (float) ($reviewAgg->avg_rating ?? 4.9);
        $totalReviews = (int) ($reviewAgg->total_reviews ?? 0);

        $course = Course::query()
            ->where('is_published', true)
            ->orderByDesc('total_students')
            ->first(['id', 'title']);

        $showcase = $course ? [
            'title' => (string) $course->title,
            'progress' => 64,
        ] : null;

        return [
            'roles' => $roles,
            'totalStudents' => $totalStudents,
            'avgRating' => $avgRating,
            'totalReviews' => $totalReviews,
            'showcase' => $showcase,
        ];
    }

    /**
     * Daftar kategori untuk section Courses di landing page.
     *
     * @return array<int, array{name: string, slug: string, courseCount: int, hours: int}>
     */
    private function homeCategories(): array
    {
        return Category::query()
            ->select('categories.id', 'categories.name', 'categories.slug', 'categories.thumbnail')
            ->selectRaw('COUNT(courses.id) AS course_count')
            ->selectRaw('COALESCE(SUM(courses.duration_minutes), 0) AS total_minutes')
            ->leftJoin('courses', function ($join) {
                $join->on('courses.category_id', '=', 'categories.id')
                    ->where('courses.is_published', true);
            })
            ->where('categories.is_active', true)
            ->groupBy('categories.id', 'categories.name', 'categories.slug', 'categories.thumbnail')
            ->orderByDesc('course_count')
            ->orderBy('categories.name')
            ->limit(6)
            ->get()
            ->map(fn ($row) => [
                'name' => (string) $row->name,
                'slug' => (string) $row->slug,
                'thumbnail' => $row->thumbnail
                    ? Storage::disk('public')->url($row->thumbnail)
                    : null,
                'courseCount' => (int) $row->course_count,
                'hours' => (int) ceil(((int) $row->total_minutes) / 60),
            ])
            ->all();
    }

    /**
     * Statistik agregat untuk section Stats.
     *
     * @return array{students: int, courses: int, completionRate: int, rating: float}
     */
    private function homeStats(): array
    {
        $totalStudents = (int) Course::query()
            ->where('is_published', true)
            ->sum('total_students');

        $totalCourses = (int) Course::query()
            ->where('is_published', true)
            ->count();

        $completionRate = (int) (Enrollment::query()
            ->selectRaw('ROUND(100 * SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 0) AS rate', ['completed'])
            ->value('rate') ?? 0);

        $avgRating = (float) (Review::query()
            ->where('is_public', true)
            ->selectRaw('ROUND(AVG(rating), 1) AS avg_rating')
            ->value('avg_rating') ?? 4.9);

        return [
            'students' => $totalStudents,
            'courses' => $totalCourses,
            'completionRate' => $completionRate,
            'rating' => $avgRating,
        ];
    }

    /**
     * Testimoni siswa terbaik untuk section Testimonials.
     *
     * @return array<int, array{name: string, role: string, text: string, avatar: string|null}>
     */
    private function homeTestimonials(): array
    {
        return Review::query()
            ->with(['user:id,name,avatar_path', 'course:id,title'])
            ->where('is_public', true)
            ->where('rating', '>=', 4)
            ->whereNotNull('content')
            ->whereRaw('CHAR_LENGTH(content) > 30')
            ->orderByDesc('rating')
            ->orderByDesc('id')
            ->limit(24)
            ->get()
            ->unique('user_id')
            ->take(6)
            ->values()
            ->map(fn ($review) => [
                'name' => (string) ($review->user->name ?? 'Alumni Learnpath'),
                'role' => (string) ('Lulusan '.($review->course->title ?? 'kursus Learnpath')),
                'text' => (string) $review->content,
                'avatar' => $review->user?->avatar_url,
            ])
            ->all();
    }

    /**
     * FAQ untuk section FAQ landing page.
     *
     * @return array<int, array{q: string, a: string}>
     */
    /**
     * Partner / organisasi yang menjadi klien LMS untuk section LogosBar.
     *
     * @return array<int, array{name: string, logoUrl: string|null}>
     */
    private function homePartners(): array
    {
        return Organization::query()
            ->where('status', 'active')
            ->whereNull('deleted_at')
            ->orderBy('id')
            ->limit(12)
            ->get(['name', 'display_name', 'logo_path'])
            ->map(fn ($org) => [
                'name' => (string) ($org->display_name ?: $org->name),
                'logoUrl' => $org->logo_path
                    ? asset('storage/'.$org->logo_path)
                    : null,
            ])
            ->all();
    }

    private function homeFaqs(): array
    {
        return Faq::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->limit(6)
            ->get(['question', 'answer'])
            ->map(fn ($faq) => [
                'q' => (string) $faq->question,
                'a' => (string) $faq->answer,
            ])
            ->all();
    }
}
