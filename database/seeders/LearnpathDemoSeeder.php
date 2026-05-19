<?php

namespace Database\Seeders;

use App\Models\Assessment;
use App\Models\Badge;
use App\Models\Bundle;
use App\Models\Category;
use App\Models\Certificate;
use App\Models\ChatMessage;
use App\Models\ChatThread;
use App\Models\Competency;
use App\Models\Coupon;
use App\Models\CouponRedemption;
use App\Models\Course;
use App\Models\CourseCompetencyMapping;
use App\Models\CourseSection;
use App\Models\DiscussionReply;
use App\Models\DiscussionThread;
use App\Models\Division;
use App\Models\EmployeeProfile;
use App\Models\Enrollment;
use App\Models\InstructorProfile;
use App\Models\LearningPath;
use App\Models\LearningPathEnrollment;
use App\Models\LearningStreak;
use App\Models\Lesson;
use App\Models\LessonNote;
use App\Models\LessonProgress;
use App\Models\Message;
use App\Models\OjtAssessment;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Organization;
use App\Models\OrganizationInvitation;
use App\Models\OrganizationMember;
use App\Models\Payment;
use App\Models\PayoutRequest;
use App\Models\Position;
use App\Models\PositionCompetencyTarget;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Review;
use App\Models\SkillGap;
use App\Models\SupervisorReview;
use App\Models\Tag;
use App\Models\User;
use App\Models\UserBadge;
use App\Models\UserCompetency;
use App\Models\Wishlist;
use App\Support\TenantManager;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Demo dataset Learnpath — mengisi 10 record per entitas utama dengan data realistis.
 *
 * Dipanggil oleh DatabaseSeeder setelah role/permission, settings, dan template seed
 * dasar selesai. Aman dijalankan setelah `php artisan lms:reset-demo`.
 */
class LearnpathDemoSeeder extends Seeder
{
    /** @var array<int, User> */
    private array $users = [];

    /** @var array<int, Organization> */
    private array $organizations = [];

    /** @var array<int, Position> */
    private array $positions = [];

    /** @var array<int, Competency> */
    private array $competencies = [];

    /** @var array<int, Category> */
    private array $categories = [];

    /** @var array<int, Tag> */
    private array $tags = [];

    /** @var array<int, Course> */
    private array $courses = [];

    /** @var array<int, Lesson> */
    private array $lessons = [];

    /** @var array<int, LearningPath> */
    private array $learningPaths = [];

    /** @var array<int, Bundle> */
    private array $bundles = [];

    /** @var array<int, Coupon> */
    private array $coupons = [];

    /** @var array<int, Order> */
    private array $orders = [];

    /** @var array<int, Enrollment> */
    private array $enrollments = [];

    public function run(): void
    {
        app(TenantManager::class)->bypass();

        $this->seedUsers();
        $this->seedOrganizations();
        $this->seedDivisions();
        $this->seedPositions();
        $this->seedCompetencies();
        $this->seedPositionCompetencyTargets();
        $this->seedProfiles();
        $this->seedCategories();
        $this->seedTags();
        $this->seedCourses();
        $this->seedCourseTags();
        $this->seedCourseSectionsAndLessons();
        $this->seedAssessments();
        $this->seedCourseCompetencyMappings();
        $this->seedBundles();
        $this->seedCoupons();
        $this->seedLearningPaths();
        $this->seedOrdersPaymentsEnrollments();
        $this->seedLearningPathEnrollments();
        $this->seedLessonProgress();
        $this->seedReviews();
        $this->seedCertificates();
        $this->seedWishlists();
        $this->seedPayoutRequests();
        $this->seedCouponRedemptions();
        $this->seedLessonNotes();
        $this->seedLearningStreaks();
        $this->seedUserBadges();
        $this->seedUserCompetencies();
        $this->seedSkillGaps();
        $this->seedOjtAssessments();
        $this->seedSupervisorReviews();
        $this->seedDiscussions();
        $this->seedChats();
        $this->seedMessages();
        $this->seedOrganizationInvitations();
    }

    private function seedUsers(): void
    {
        $rows = [
            ['name' => 'Super Admin Learnpath', 'email' => 'admin@learnpath.id', 'username' => 'superadmin', 'role' => 'superadmin', 'phone' => '+62 811 1000 001'],
            ['name' => 'Admin Tenant Bank Mandiri', 'email' => 'admin.tenant@learnpath.id', 'username' => 'admin_tenant', 'role' => 'admin_tenant', 'phone' => '+62 811 1000 002'],
            ['name' => 'HR Manager Learnpath', 'email' => 'hr@learnpath.id', 'username' => 'hr', 'role' => 'hr', 'phone' => '+62 811 1000 003'],
            ['name' => 'Supervisor One', 'email' => 'supervisor@learnpath.id', 'username' => 'supervisor', 'role' => 'supervisor', 'phone' => '+62 811 1000 004'],
            ['name' => 'Budi Hartono', 'email' => 'budi@learnpath.id', 'username' => 'budi.hartono', 'role' => 'instructor', 'phone' => '+62 811 2000 001'],
            ['name' => 'Dewi Lestari', 'email' => 'dewi@learnpath.id', 'username' => 'dewi.lestari', 'role' => 'instructor', 'phone' => '+62 811 2000 002'],
            ['name' => 'Sari Wijaya', 'email' => 'sari@learnpath.id', 'username' => 'sari.wijaya', 'role' => 'instructor', 'phone' => '+62 811 2000 003'],
            ['name' => 'Andi Saputra', 'email' => 'andi@learnpath.id', 'username' => 'andi.saputra', 'role' => 'employee', 'phone' => '+62 811 3000 001'],
            ['name' => 'Rina Anggraini', 'email' => 'rina@learnpath.id', 'username' => 'rina.anggraini', 'role' => 'employee', 'phone' => '+62 811 3000 002'],
            ['name' => 'Citra Maharani', 'email' => 'citra@learnpath.id', 'username' => 'citra.maharani', 'role' => 'user_public', 'phone' => '+62 811 4000 001'],
        ];

        foreach ($rows as $row) {
            $user = User::create([
                'name' => $row['name'],
                'email' => $row['email'],
                'username' => $row['username'],
                'phone' => $row['phone'],
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'status' => User::STATUS_ACTIVE,
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
                'country' => 'ID',
                'language' => 'id',
                'timezone' => 'Asia/Jakarta',
            ]);
            $user->assignRole($row['role']);
            $this->users[] = $user;
        }
    }

    private function seedOrganizations(): void
    {
        $rows = [
            ['name' => 'PT Bank Mandiri (Persero) Tbk', 'industry' => 'Perbankan', 'size_range' => '1000+', 'seat_quota' => 200, 'brand_primary_color' => '#003D7A'],
            ['name' => 'PT Bank Central Asia Tbk', 'industry' => 'Perbankan', 'size_range' => '1000+', 'seat_quota' => 180, 'brand_primary_color' => '#0060AF'],
            ['name' => 'PT Telkom Indonesia (Persero) Tbk', 'industry' => 'Telekomunikasi', 'size_range' => '1000+', 'seat_quota' => 150, 'brand_primary_color' => '#E60000'],
            ['name' => 'PT Astra International Tbk', 'industry' => 'Otomotif & Manufaktur', 'size_range' => '1000+', 'seat_quota' => 120, 'brand_primary_color' => '#003F87'],
            ['name' => 'PT Pertamina (Persero)', 'industry' => 'Energi & Migas', 'size_range' => '1000+', 'seat_quota' => 130, 'brand_primary_color' => '#0066B3'],
            ['name' => 'PT Unilever Indonesia Tbk', 'industry' => 'FMCG', 'size_range' => '501-1000', 'seat_quota' => 90, 'brand_primary_color' => '#1F36C7'],
            ['name' => 'PT Indofood Sukses Makmur Tbk', 'industry' => 'FMCG', 'size_range' => '1000+', 'seat_quota' => 110, 'brand_primary_color' => '#E20613'],
            ['name' => 'PT Bukalapak.com Tbk', 'industry' => 'Teknologi & E-commerce', 'size_range' => '501-1000', 'seat_quota' => 70, 'brand_primary_color' => '#E31E52'],
            ['name' => 'PT GoTo Gojek Tokopedia Tbk', 'industry' => 'Teknologi & E-commerce', 'size_range' => '1000+', 'seat_quota' => 160, 'brand_primary_color' => '#00AA13'],
            ['name' => 'PT XL Axiata Tbk', 'industry' => 'Telekomunikasi', 'size_range' => '501-1000', 'seat_quota' => 85, 'brand_primary_color' => '#00529B'],
        ];

        foreach ($rows as $idx => $row) {
            $shortName = Str::of($row['name'])->after('PT ')->before(' (Persero)')->before(' Tbk')->trim();
            $org = Organization::create([
                'name' => $row['name'],
                'display_name' => (string) $shortName,
                'tagline' => "Learning Hub {$shortName}",
                'slug' => Str::slug($shortName).'-'.($idx + 1),
                'brand_primary_color' => $row['brand_primary_color'],
                'industry' => $row['industry'],
                'size_range' => $row['size_range'],
                'contact_name' => 'L&D Team',
                'contact_email' => 'ld@'.Str::slug($shortName).'.co.id',
                'contact_phone' => '+62 21 '.random_int(5000000, 9999999),
                'address' => 'Jakarta, Indonesia',
                'seat_quota' => $row['seat_quota'],
                'seats_used' => random_int(10, (int) ($row['seat_quota'] * 0.6)),
                'status' => 'active',
            ]);
            $this->organizations[] = $org;
        }

        // Tenant utama (Mandiri) dapat admin_tenant + hr + employees + supervisor.
        $primary = $this->organizations[0];
        $tenantUsers = [
            ['user' => $this->users[1], 'role' => 'admin'], // admin_tenant
            ['user' => $this->users[2], 'role' => 'admin'], // HR
            ['user' => $this->users[3], 'role' => 'member'], // supervisor
            ['user' => $this->users[7], 'role' => 'member'], // Andi
            ['user' => $this->users[8], 'role' => 'member'], // Rina
        ];

        foreach ($tenantUsers as $row) {
            OrganizationMember::create([
                'organization_id' => $primary->id,
                'user_id' => $row['user']->id,
                'role' => $row['role'],
                'joined_at' => now()->subMonths(random_int(1, 18)),
            ]);
        }
    }

    private function seedDivisions(): void
    {
        $rows = [
            ['name' => 'Sales & Lending', 'code' => 'SLS'],
            ['name' => 'Operations', 'code' => 'OPS'],
            ['name' => 'Compliance & Risk', 'code' => 'CMP'],
            ['name' => 'Marketing', 'code' => 'MKT'],
            ['name' => 'Human Resources', 'code' => 'HRD'],
            ['name' => 'Finance & Accounting', 'code' => 'FIN'],
            ['name' => 'Information Technology', 'code' => 'IT'],
            ['name' => 'Customer Experience', 'code' => 'CX'],
            ['name' => 'Product Development', 'code' => 'PRD'],
            ['name' => 'Internal Audit', 'code' => 'AUD'],
        ];

        $primaryTenantId = $this->organizations[0]->id;

        foreach ($rows as $row) {
            Division::create([
                'tenant_id' => $primaryTenantId,
                'name' => $row['name'],
                'code' => $row['code'],
                'description' => "Divisi {$row['name']} pada organisasi.",
                'is_active' => true,
            ]);
        }
    }

    private function seedPositions(): void
    {
        $rows = [
            ['name' => 'Account Officer', 'division' => 'Sales & Lending', 'branch' => 'Jakarta Pusat'],
            ['name' => 'Customer Service', 'division' => 'Operations', 'branch' => 'Jakarta Selatan'],
            ['name' => 'Branch Manager', 'division' => 'Sales & Lending', 'branch' => 'Jakarta Pusat'],
            ['name' => 'Compliance Officer', 'division' => 'Compliance & Risk', 'branch' => 'Head Office'],
            ['name' => 'Marketing Manager', 'division' => 'Marketing', 'branch' => 'Head Office'],
            ['name' => 'HR Business Partner', 'division' => 'Human Resources', 'branch' => 'Head Office'],
            ['name' => 'Operations Manager', 'division' => 'Operations', 'branch' => 'Jakarta Selatan'],
            ['name' => 'Internal Auditor', 'division' => 'Internal Audit', 'branch' => 'Head Office'],
            ['name' => 'Product Owner', 'division' => 'Product Development', 'branch' => 'Head Office'],
            ['name' => 'Risk Analyst', 'division' => 'Compliance & Risk', 'branch' => 'Head Office'],
        ];

        $primaryTenantId = $this->organizations[0]->id;

        foreach ($rows as $row) {
            $this->positions[] = Position::create([
                'tenant_id' => $primaryTenantId,
                'name' => $row['name'],
                'division' => $row['division'],
                'branch' => $row['branch'],
                'description' => "Posisi {$row['name']} pada divisi {$row['division']}.",
                'is_active' => true,
            ]);
        }
    }

    private function seedCompetencies(): void
    {
        $rows = [
            ['name' => 'Analisa Kredit', 'category' => 'Technical Skill'],
            ['name' => 'Survey Debitur', 'category' => 'Technical Skill'],
            ['name' => 'Komunikasi Nasabah', 'category' => 'Soft Skill'],
            ['name' => 'Manajemen Risiko', 'category' => 'Technical Skill'],
            ['name' => 'Collection Dasar', 'category' => 'Technical Skill'],
            ['name' => 'Kepemimpinan', 'category' => 'Leadership'],
            ['name' => 'Compliance Awareness', 'category' => 'Compliance'],
            ['name' => 'Data Analysis', 'category' => 'Technical Skill'],
            ['name' => 'Public Speaking', 'category' => 'Soft Skill'],
            ['name' => 'Service Excellence', 'category' => 'Soft Skill'],
        ];

        $primaryTenantId = $this->organizations[0]->id;

        foreach ($rows as $row) {
            $this->competencies[] = Competency::create([
                'tenant_id' => $primaryTenantId,
                'name' => $row['name'],
                'category' => $row['category'],
                'description' => "Kompetensi {$row['name']} ({$row['category']}).",
                'is_active' => true,
            ]);
        }
    }

    private function seedPositionCompetencyTargets(): void
    {
        $byName = collect($this->positions)->keyBy('name');
        $byCompetency = collect($this->competencies)->keyBy('name');

        $targets = [
            ['Account Officer', 'Analisa Kredit', 4],
            ['Account Officer', 'Survey Debitur', 4],
            ['Account Officer', 'Komunikasi Nasabah', 3],
            ['Account Officer', 'Manajemen Risiko', 3],
            ['Account Officer', 'Collection Dasar', 3],
            ['Branch Manager', 'Kepemimpinan', 5],
            ['Branch Manager', 'Manajemen Risiko', 4],
            ['Branch Manager', 'Komunikasi Nasabah', 4],
            ['Compliance Officer', 'Compliance Awareness', 5],
            ['Customer Service', 'Service Excellence', 5],
        ];

        $primaryTenantId = $this->organizations[0]->id;

        foreach ($targets as [$positionName, $competencyName, $level]) {
            PositionCompetencyTarget::create([
                'tenant_id' => $primaryTenantId,
                'position_id' => $byName[$positionName]->id,
                'competency_id' => $byCompetency[$competencyName]->id,
                'target_level' => $level,
                'is_required' => true,
            ]);
        }
    }

    private function seedProfiles(): void
    {
        $primaryTenantId = $this->organizations[0]->id;
        $byName = collect($this->positions)->keyBy('name');

        // Instructor profiles (3 instruktur).
        $instructorRows = [
            [
                'user' => $this->users[4],
                'headline' => 'Senior Banking Trainer | 15+ Tahun Pengalaman',
                'expertise' => ['Analisa Kredit', 'Sales Lending', 'Customer Service'],
            ],
            [
                'user' => $this->users[5],
                'headline' => 'Leadership Coach Bersertifikasi ICF',
                'expertise' => ['Leadership', 'Coaching', 'Public Speaking'],
            ],
            [
                'user' => $this->users[6],
                'headline' => 'Compliance & Risk Management Specialist',
                'expertise' => ['Compliance', 'Anti Money Laundering', 'Risk Management'],
            ],
        ];

        foreach ($instructorRows as $row) {
            InstructorProfile::create([
                'user_id' => $row['user']->id,
                'headline' => $row['headline'],
                'bio' => 'Praktisi berpengalaman di industri perbankan dan keuangan. Telah melatih ribuan profesional di berbagai bank nasional.',
                'expertise' => $row['expertise'],
                'social_links' => ['linkedin' => 'https://linkedin.com/in/'.$row['user']->username],
                'website' => 'https://learnpath.id/instruktur/'.$row['user']->username,
                'is_verified' => true,
                'is_active' => true,
            ]);
        }

        // Employee profiles (2 karyawan tenant + supervisor).
        $employeeRows = [
            ['user' => $this->users[7], 'position' => 'Account Officer', 'supervisor' => $this->users[3], 'no' => 'EMP-10001', 'div' => 'Sales & Lending'],
            ['user' => $this->users[8], 'position' => 'Customer Service', 'supervisor' => $this->users[3], 'no' => 'EMP-10002', 'div' => 'Operations'],
            ['user' => $this->users[3], 'position' => 'Branch Manager', 'supervisor' => null, 'no' => 'EMP-10003', 'div' => 'Sales & Lending'],
        ];

        foreach ($employeeRows as $row) {
            EmployeeProfile::create([
                'tenant_id' => $primaryTenantId,
                'user_id' => $row['user']->id,
                'position_id' => $byName[$row['position']]->id,
                'supervisor_id' => $row['supervisor']?->id,
                'employee_number' => $row['no'],
                'division' => $row['div'],
                'branch' => 'Jakarta Pusat',
                'joined_at' => now()->subYears(random_int(1, 5))->subMonths(random_int(0, 11)),
            ]);
        }
    }

    private function seedCategories(): void
    {
        $rows = [
            ['name' => 'Digital Marketing', 'desc' => 'Strategi pemasaran online, SEO, SEM, social media, dan content marketing.'],
            ['name' => 'Sales & Lending', 'desc' => 'Teknik penjualan, analisa kredit, dan pengelolaan portfolio pinjaman.'],
            ['name' => 'Operations', 'desc' => 'Operational excellence dan service delivery untuk frontliner.'],
            ['name' => 'Leadership', 'desc' => 'Kepemimpinan, coaching, dan pengembangan tim.'],
            ['name' => 'Compliance & Risk Management', 'desc' => 'Manajemen risiko, AML, KYC, dan kepatuhan regulasi.'],
            ['name' => 'Soft Skill', 'desc' => 'Komunikasi, public speaking, time management, dan produktivitas.'],
            ['name' => 'Teknologi & Data', 'desc' => 'Data analytics, digitalisasi proses, dan literasi teknologi.'],
            ['name' => 'Keuangan & Akuntansi', 'desc' => 'Manajemen keuangan personal, korporat, dan akuntansi dasar.'],
            ['name' => 'Human Resources', 'desc' => 'Talent management, performance review, dan HR business partnering.'],
            ['name' => 'Bahasa Asing', 'desc' => 'Business English dan bahasa asing untuk profesional.'],
        ];

        foreach ($rows as $row) {
            $this->categories[] = Category::create([
                'name' => $row['name'],
                'slug' => Str::slug($row['name']),
                'description' => $row['desc'],
                'is_active' => true,
            ]);
        }
    }

    private function seedTags(): void
    {
        $rows = ['Pemula', 'Intermediate', 'Advanced', 'Bersertifikat', 'Live Class', 'Self Paced', 'Bestseller', 'Baru', 'Bootcamp', 'Corporate'];

        foreach ($rows as $name) {
            $this->tags[] = Tag::create([
                'name' => $name,
                'slug' => Str::slug($name),
            ]);
        }
    }

    private function seedCourses(): void
    {
        $byCategory = collect($this->categories)->keyBy('name');

        $rows = [
            [
                'title' => 'Fundamental Digital Marketing untuk Pemula',
                'subtitle' => 'Belajar SEO, social media, dan content marketing dari nol sampai siap eksekusi kampanye.',
                'category' => 'Digital Marketing',
                'instructor_idx' => 4, // Budi
                'level' => 'beginner', 'price' => 299_000, 'compare' => 499_000, 'duration' => 480,
                'objectives' => ['Memahami pillar digital marketing modern', 'Menyusun strategi social media yang terukur', 'Menjalankan kampanye SEO on-page dan off-page', 'Menganalisis performa dengan Google Analytics'],
                'requirements' => ['Memiliki akun email & social media aktif', 'Familiar dengan internet dasar', 'Tidak perlu pengalaman marketing sebelumnya'],
                'audience' => ['Mahasiswa & fresh graduate', 'Pemilik UMKM yang ingin go-digital', 'Karyawan yang ingin pindah ke peran digital'],
            ],
            [
                'title' => 'Mastery Analisa Kredit Perbankan',
                'subtitle' => 'Kuasai 5C analisa kredit, scoring, dan teknik mitigasi risiko untuk portfolio konsumer & UMKM.',
                'category' => 'Sales & Lending',
                'instructor_idx' => 4,
                'level' => 'intermediate', 'price' => 599_000, 'compare' => 899_000, 'duration' => 720,
                'objectives' => ['Mengaplikasikan prinsip 5C Character, Capacity, Capital, Collateral, Condition', 'Membangun credit scoring sederhana', 'Mengidentifikasi red flag fraud aplikasi kredit', 'Menyusun memorandum analisa kredit profesional'],
                'requirements' => ['Pemahaman dasar laporan keuangan', 'Pengalaman 6 bulan di unit lending menjadi nilai tambah'],
                'audience' => ['Account Officer baru / yang ingin upgrade', 'Credit Analyst pemula', 'Branch Manager yang reviewing aplikasi kredit'],
            ],
            [
                'title' => 'Service Excellence untuk Frontliner Bank',
                'subtitle' => 'Bangun mindset pelanggan dan teknik service recovery untuk customer service & teller.',
                'category' => 'Operations',
                'instructor_idx' => 5, // Dewi
                'level' => 'beginner', 'price' => 249_000, 'compare' => 349_000, 'duration' => 360,
                'objectives' => ['Menerapkan service standard frontliner profesional', 'Menangani complain nasabah dengan empati', 'Melakukan service recovery untuk pengalaman positif', 'Memahami SLA layanan dasar perbankan'],
                'requirements' => ['Saat ini bekerja sebagai frontliner / akan menjadi frontliner'],
                'audience' => ['Customer Service Officer', 'Teller', 'Relationship Officer baru'],
            ],
            [
                'title' => 'Leadership Coaching untuk Manajer Baru',
                'subtitle' => 'Transisi sukses dari individual contributor ke leader yang menginspirasi tim.',
                'category' => 'Leadership',
                'instructor_idx' => 5,
                'level' => 'intermediate', 'price' => 799_000, 'compare' => 1_199_000, 'duration' => 600,
                'objectives' => ['Beralih dari mindset doer ke leader', 'Mempraktikkan coaching GROW model', 'Memberikan feedback yang konstruktif', 'Mengelola performance review tim'],
                'requirements' => ['Sudah / akan menjabat sebagai supervisor atau manager', 'Bersedia melakukan praktek role play coaching'],
                'audience' => ['Supervisor baru', 'Manager level junior', 'High potential employee yang dipromosikan'],
            ],
            [
                'title' => 'Anti Money Laundering & Compliance Banking',
                'subtitle' => 'Mendalami regulasi APU-PPT, KYC, CDD, dan red flag transaksi mencurigakan.',
                'category' => 'Compliance & Risk Management',
                'instructor_idx' => 6, // Sari
                'level' => 'advanced', 'price' => 899_000, 'compare' => 1_299_000, 'duration' => 540,
                'objectives' => ['Memahami regulasi POJK & PPATK terbaru', 'Melakukan KYC dan CDD sesuai standar', 'Mengidentifikasi transaksi mencurigakan (STR)', 'Menyusun pelaporan compliance yang akurat'],
                'requirements' => ['Bekerja di bidang compliance, audit, atau operasional bank', 'Memahami operasional perbankan dasar'],
                'audience' => ['Compliance Officer', 'Internal Auditor', 'Operations Manager perbankan'],
            ],
            [
                'title' => 'Public Speaking & Presentation Skill',
                'subtitle' => 'Bangun confidence saat presentasi dan tampil memukau di depan tim, klien, atau panggung.',
                'category' => 'Soft Skill',
                'instructor_idx' => 6,
                'level' => 'beginner', 'price' => 199_000, 'compare' => 299_000, 'duration' => 300,
                'objectives' => ['Mengatasi nervous saat berbicara di depan publik', 'Menyusun struktur presentasi yang persuasif', 'Menggunakan body language efektif', 'Mendesain slide visual yang impactful'],
                'requirements' => ['Tidak ada prasyarat khusus', 'Bersedia mengirim video latihan untuk feedback'],
                'audience' => ['Profesional yang sering meeting / pitching', 'Karyawan yang ingin naik level karir', 'Mahasiswa & fresh graduate'],
            ],
            [
                'title' => 'Data Analytics dengan Microsoft Excel',
                'subtitle' => 'Olah data bisnis dari basic formula sampai pivot table & dashboard interaktif.',
                'category' => 'Teknologi & Data',
                'instructor_idx' => 4,
                'level' => 'intermediate', 'price' => 349_000, 'compare' => 499_000, 'duration' => 540,
                'objectives' => ['Menguasai VLOOKUP, INDEX-MATCH, dan formula array', 'Membangun pivot table & pivot chart', 'Mendesain dashboard interaktif dengan slicer', 'Mengotomasi laporan rutin dengan Excel'],
                'requirements' => ['Memiliki Microsoft Excel 2016 atau lebih baru', 'Familiar dengan operasi spreadsheet dasar'],
                'audience' => ['Staff admin & operasional', 'Analyst pemula', 'Mahasiswa jurusan bisnis / ekonomi'],
            ],
            [
                'title' => 'Manajemen Keuangan Pribadi & Investasi',
                'subtitle' => 'Atur cashflow, lunasi hutang, dan mulai investasi untuk financial freedom.',
                'category' => 'Keuangan & Akuntansi',
                'instructor_idx' => 5,
                'level' => 'beginner', 'price' => 0, 'compare' => null, 'duration' => 240,
                'objectives' => ['Membuat budgeting bulanan dengan metode 50/30/20', 'Strategi lunasi hutang konsumtif efektif', 'Memilih instrumen investasi sesuai profil risiko', 'Membangun emergency fund & dana pensiun'],
                'requirements' => ['Memiliki rekening bank aktif'],
                'audience' => ['Karyawan pemula sampai senior', 'Pelaku UMKM', 'Mahasiswa tingkat akhir'],
            ],
            [
                'title' => 'Talent Management & Performance Review',
                'subtitle' => 'Framework end-to-end mengelola talent dari rekrutmen sampai succession planning.',
                'category' => 'Human Resources',
                'instructor_idx' => 6,
                'level' => 'intermediate', 'price' => 549_000, 'compare' => 749_000, 'duration' => 480,
                'objectives' => ['Menyusun talent pool & succession plan', 'Mengelola performance review yang adil', 'Membangun career path & individual development plan', 'Mengukur engagement dan retention karyawan'],
                'requirements' => ['Bekerja di HR atau line manager yang mengelola tim'],
                'audience' => ['HR Business Partner', 'HR Generalist', 'Line Manager / Supervisor'],
            ],
            [
                'title' => 'Bahasa Inggris Bisnis untuk Profesional',
                'subtitle' => 'Percaya diri berkomunikasi via email, meeting, dan presentasi internasional.',
                'category' => 'Bahasa Asing',
                'instructor_idx' => 4,
                'level' => 'intermediate', 'price' => 399_000, 'compare' => 599_000, 'duration' => 600,
                'objectives' => ['Menulis email bisnis yang profesional', 'Memimpin meeting & conference call dalam bahasa Inggris', 'Menyusun presentasi bisnis berbahasa Inggris', 'Menjawab interview kerja bilingual dengan percaya diri'],
                'requirements' => ['Level dasar bahasa Inggris (kira-kira A2)', 'Bersedia ikut latihan speaking mingguan'],
                'audience' => ['Profesional yang sering berurusan dengan mitra asing', 'Karyawan multinasional', 'Pencari kerja MNC'],
            ],
        ];

        foreach ($rows as $row) {
            $instructor = $this->users[$row['instructor_idx']];
            $category = $byCategory[$row['category']];

            $this->courses[] = Course::create([
                'category_id' => $category->id,
                'instructor_id' => $instructor->id,
                'title' => $row['title'],
                'subtitle' => $row['subtitle'],
                'slug' => Str::slug($row['title']),
                'description' => "<p>{$row['subtitle']}</p><p>Course ini disusun oleh praktisi berpengalaman dan dilengkapi studi kasus nyata dari industri Indonesia. Anda akan mendapat akses materi seumur hidup, sertifikat digital, dan ruang diskusi dengan mentor.</p>",
                'learning_objectives' => $row['objectives'],
                'requirements' => $row['requirements'],
                'target_audience' => $row['audience'],
                'thumbnail' => null,
                'price' => $row['price'],
                'compare_at_price' => $row['compare'],
                'level' => $row['level'],
                'delivery_format' => Course::FORMAT_ON_DEMAND,
                'lms_format' => Course::LMS_EMBED_YOUTUBE,
                'is_certified' => true,
                'language' => 'id',
                'duration_minutes' => $row['duration'],
                'pre_test_required' => true,
                'post_test_required' => true,
                'passing_score' => 70,
                'max_attempts' => 3,
                'average_rating' => 4.5 + (random_int(0, 4) / 10),
                'reviews_count' => random_int(20, 200),
                'total_students' => random_int(100, 1500),
                'is_published' => true,
                'review_status' => Course::REVIEW_PUBLISHED,
                'reviewed_by' => $this->users[0]->id,
                'reviewed_at' => now()->subDays(random_int(7, 60)),
                'submitted_at' => now()->subDays(random_int(60, 90)),
                'published_at' => now()->subDays(random_int(1, 60)),
            ]);
        }
    }

    private function seedCourseTags(): void
    {
        // Tiap course tag: level + 1-2 tag tematis.
        $tagsByName = collect($this->tags)->keyBy('name');

        foreach ($this->courses as $idx => $course) {
            $tagNames = match ($course->level) {
                'beginner' => ['Pemula', 'Bersertifikat'],
                'intermediate' => ['Intermediate', 'Bersertifikat'],
                default => ['Advanced', 'Bersertifikat'],
            };

            if ($idx % 3 === 0) {
                $tagNames[] = 'Bestseller';
            } elseif ($idx % 3 === 1) {
                $tagNames[] = 'Self Paced';
            } else {
                $tagNames[] = 'Corporate';
            }

            $ids = array_map(fn (string $n) => $tagsByName[$n]->id, $tagNames);
            $course->tags()->sync($ids);
        }
    }

    private function seedCourseSectionsAndLessons(): void
    {
        $youtubeSamples = [
            'dQw4w9WgXcQ', 'M7lc1UVf-VE', 'jNQXAC9IVRw', '9bZkp7q19f0',
            'kJQP7kiw5Fk', 'YkgkThdzX-8', 'L_jWHffIx5E', 'fJ9rUzIMcZQ',
            'OPf0YbXqDm0', 'CevxZvSJLk8',
        ];

        $videoCounter = 0;
        $curriculum = $this->courseCurriculum();

        foreach ($this->courses as $idx => $course) {
            $courseCurriculum = $curriculum[$idx];
            $lessonOrder = 0;

            foreach ($courseCurriculum as $sIdx => $section) {
                $sectionModel = CourseSection::create([
                    'course_id' => $course->id,
                    'title' => 'Modul '.($sIdx + 1).' — '.$section['title'],
                    'description' => $section['description'],
                    'sort_order' => $sIdx + 1,
                ]);

                foreach ($section['lessons'] as $lIdx => $lessonTitle) {
                    $lessonOrder++;
                    $videoId = $youtubeSamples[$videoCounter % count($youtubeSamples)];
                    $videoCounter++;

                    $lesson = Lesson::create([
                        'course_id' => $course->id,
                        'course_section_id' => $sectionModel->id,
                        'title' => $lessonTitle,
                        'description' => "Materi {$lessonTitle} dengan studi kasus praktis.",
                        'type' => 'youtube',
                        'youtube_url' => "https://www.youtube.com/watch?v={$videoId}",
                        'youtube_video_id' => $videoId,
                        'duration_minutes' => random_int(8, 25),
                        'sort_order' => $lessonOrder,
                        'is_preview' => $sIdx === 0 && $lIdx === 0,
                        'is_required' => true,
                    ]);

                    $this->lessons[] = $lesson;
                }
            }
        }
    }

    /**
     * Kurikulum 10 lesson per course (3 section per course).
     *
     * @return array<int, array<int, array{title: string, description: string, lessons: array<int, string>}>>
     */
    private function courseCurriculum(): array
    {
        return [
            // Course 0 — Fundamental Digital Marketing untuk Pemula
            [
                ['title' => 'Pengantar Digital Marketing', 'description' => 'Fondasi pola pikir dan landscape digital marketing modern.', 'lessons' => [
                    'Apa itu Digital Marketing & Mengapa Penting',
                    'Roadmap Belajar 30 Hari ke Marketer Profesional',
                    'Memahami Customer Journey Era Digital',
                ]],
                ['title' => 'Channel & Strategi Pemasaran Online', 'description' => 'Kuasai channel utama dan strategi konten yang efektif.', 'lessons' => [
                    'SEO Fundamental: On-Page Optimization',
                    'SEO Off-Page: Backlink & Authority Building',
                    'Social Media Marketing untuk Brand Awareness',
                    'Content Marketing & Storytelling yang Engaging',
                ]],
                ['title' => 'Eksekusi & Optimasi Kampanye', 'description' => 'Praktik menjalankan kampanye dan mengukur performanya.', 'lessons' => [
                    'Email Marketing & Marketing Automation',
                    'Setup Google Analytics & Conversion Tracking',
                    'Studi Kasus: Launching Produk Lokal End-to-End',
                ]],
            ],
            // Course 1 — Mastery Analisa Kredit Perbankan
            [
                ['title' => 'Fundamental Kredit Perbankan', 'description' => 'Konsep dasar dan prinsip universal analisa kredit.', 'lessons' => [
                    'Pengantar Kredit Konsumer vs Komersial',
                    'Prinsip 5C: Character, Capacity, Capital',
                    'Prinsip 5C: Collateral & Condition',
                ]],
                ['title' => 'Teknik Analisa & Risk Assessment', 'description' => 'Tools dan teknik analisa keuangan calon debitur.', 'lessons' => [
                    'Membaca Laporan Keuangan UMKM',
                    'Cash Flow Analysis & Debt Service Coverage',
                    'Credit Scoring & Risk Rating',
                    'Identifikasi Red Flag Fraud Aplikasi Kredit',
                ]],
                ['title' => 'Memorandum & Eksekusi Lapangan', 'description' => 'Survey, dokumentasi, dan studi kasus approval/rejection.', 'lessons' => [
                    'Survey Lapangan: Best Practice & Checklist',
                    'Menyusun Memorandum Analisa Kredit',
                    'Studi Kasus: Approval & Rejection Letter',
                ]],
            ],
            // Course 2 — Service Excellence untuk Frontliner Bank
            [
                ['title' => 'Mindset & Standar Pelayanan', 'description' => 'Pondasi service excellence dan tipologi nasabah.', 'lessons' => [
                    'Filosofi Service Excellence di Perbankan',
                    'Memahami Tipologi Nasabah Indonesia',
                    'Service Standard Frontliner Profesional',
                ]],
                ['title' => 'Teknik Komunikasi & Pelayanan', 'description' => 'Skill operasional harian frontliner.', 'lessons' => [
                    'Active Listening & Empati Komunikasi',
                    'SLA & Standar Waktu Layanan Teller',
                    'Cross-Selling & Up-Selling yang Etis',
                    'Greeting, Body Language & Grooming',
                ]],
                ['title' => 'Service Recovery & Studi Kasus', 'description' => 'Menangani komplain dan memulihkan kepercayaan.', 'lessons' => [
                    'Menangani Complain Nasabah Marah',
                    'Service Recovery Framework',
                    'Studi Kasus: Restoring Trust Pasca Complain',
                ]],
            ],
            // Course 3 — Leadership Coaching untuk Manajer Baru
            [
                ['title' => 'Transisi ke Leader', 'description' => 'Pondasi pola pikir leadership untuk manajer baru.', 'lessons' => [
                    'Dari Individual Contributor ke Leader',
                    'Empat Gaya Kepemimpinan Situasional',
                    'Self-Awareness & Personal Leadership Brand',
                ]],
                ['title' => 'Coaching & Komunikasi Efektif', 'description' => 'Framework coaching dan feedback yang konstruktif.', 'lessons' => [
                    'GROW Model Coaching: Goal & Reality',
                    'GROW Model Coaching: Options & Will',
                    'Memberi Feedback Konstruktif (SBI Model)',
                    'Difficult Conversation: Performa & Konflik',
                ]],
                ['title' => 'Mengelola Tim & Performa', 'description' => 'Eksekusi praktis sebagai leader sehari-hari.', 'lessons' => [
                    'Delegasi Efektif & Empowerment Tim',
                    'Performance Review: 1-on-1 yang Bermakna',
                    'Studi Kasus: Turnaround Tim Underperform',
                ]],
            ],
            // Course 4 — Anti Money Laundering & Compliance Banking
            [
                ['title' => 'Regulasi & Framework AML', 'description' => 'Memahami regulasi APU-PPT dan POJK terbaru.', 'lessons' => [
                    'Pengantar APU-PPT & Regulasi PPATK',
                    'POJK Terbaru tentang AML & KYC',
                    'Risk-Based Approach Compliance',
                ]],
                ['title' => 'KYC, CDD & EDD', 'description' => 'Praktik due diligence dan deteksi red flag.', 'lessons' => [
                    'Customer Due Diligence (CDD) Step-by-Step',
                    'Enhanced Due Diligence (EDD) untuk PEP',
                    'Beneficial Owner Identification',
                    'Red Flag Transaksi Mencurigakan',
                ]],
                ['title' => 'Pelaporan & Tata Kelola', 'description' => 'Pelaporan STR/CTR dan investigasi internal.', 'lessons' => [
                    'Suspicious Transaction Report (STR)',
                    'Cash Transaction Report (CTR) & LKB',
                    'Studi Kasus: Investigasi Internal AML',
                ]],
            ],
            // Course 5 — Public Speaking & Presentation Skill
            [
                ['title' => 'Mindset & Persiapan Presentasi', 'description' => 'Mengatasi nervous dan menyusun pesan.', 'lessons' => [
                    'Mengatasi Nervous & Stage Fright',
                    'Membangun Confidence Sebelum Presentasi',
                    'Menyusun Struktur Pesan dengan PEEL',
                ]],
                ['title' => 'Teknik Penyampaian Memikat', 'description' => 'Skill vokal, body language, dan storytelling.', 'lessons' => [
                    'Vocal Variety: Pitch, Pace, Pause',
                    'Body Language & Stage Movement',
                    'Storytelling yang Memikat Audience',
                    'Slide Design: Less is More',
                ]],
                ['title' => 'Latihan & Eksekusi', 'description' => 'Latihan praktis dan studi kasus pitching.', 'lessons' => [
                    'Menangani Q&A dengan Percaya Diri',
                    'Latihan Impromptu Speaking',
                    'Studi Kasus: Pitching ke Direksi',
                ]],
            ],
            // Course 6 — Data Analytics dengan Microsoft Excel
            [
                ['title' => 'Fundamental Excel & Produktivitas', 'description' => 'Navigasi cepat dan formula dasar Excel.', 'lessons' => [
                    'Navigasi Excel & Shortcut Produktivitas',
                    'Formula Dasar: SUM, IF, COUNTIF, SUMIF',
                    'Format Cell & Conditional Formatting',
                ]],
                ['title' => 'Lookup & Manipulasi Data', 'description' => 'Olah data kompleks dengan formula lookup.', 'lessons' => [
                    'VLOOKUP, HLOOKUP, dan Limitasinya',
                    'INDEX-MATCH untuk Kasus Kompleks',
                    'Text Function: LEFT, RIGHT, MID, CONCAT',
                    'Data Cleansing & Remove Duplicates',
                ]],
                ['title' => 'Analisa & Dashboard Interaktif', 'description' => 'Membuat ringkasan dan dashboard interaktif.', 'lessons' => [
                    'Pivot Table & Pivot Chart',
                    'Slicer & Timeline untuk Interaktivitas',
                    'Studi Kasus: Dashboard Penjualan Bulanan',
                ]],
            ],
            // Course 7 — Manajemen Keuangan Pribadi & Investasi
            [
                ['title' => 'Foundation Keuangan Pribadi', 'description' => 'Pondasi cashflow dan budgeting bulanan.', 'lessons' => [
                    'Cek Kesehatan Keuangan Pribadi',
                    'Budgeting Metode 50/30/20',
                    'Membangun Emergency Fund 6 Bulan',
                ]],
                ['title' => 'Hutang & Proteksi Finansial', 'description' => 'Strategi lunas hutang dan asuransi.', 'lessons' => [
                    'Lunasi Hutang Konsumtif dengan Snowball Method',
                    'Memilih Kartu Kredit & Pinjaman Bijak',
                    'Asuransi Jiwa, Kesehatan & Kerugian',
                    'Dana Pensiun: BPJS-TK vs DPLK vs DPPK',
                ]],
                ['title' => 'Investasi Jangka Panjang', 'description' => 'Memilih instrumen investasi sesuai profil.', 'lessons' => [
                    'Profil Risiko & Asset Allocation',
                    'Reksadana, Saham, Obligasi, Emas',
                    'Studi Kasus: Rencana 10 Tahun Financial Freedom',
                ]],
            ],
            // Course 8 — Talent Management & Performance Review
            [
                ['title' => 'Talent Acquisition & Onboarding', 'description' => 'Workforce planning dan onboarding karyawan baru.', 'lessons' => [
                    'Workforce Planning & Manpower Forecast',
                    'Behavioral Interview & Competency Assessment',
                    'Onboarding 30-60-90 Hari yang Efektif',
                ]],
                ['title' => 'Performance & Development', 'description' => 'Mengelola performa dan rencana pengembangan.', 'lessons' => [
                    'Goal Setting dengan OKR & SMART',
                    'Performance Review Cycle Tahunan',
                    'Individual Development Plan (IDP)',
                    'Career Path & Succession Planning',
                ]],
                ['title' => 'Engagement & Retention', 'description' => 'Strategi mempertahankan top talent.', 'lessons' => [
                    'Mengukur Employee Engagement',
                    'Retensi Top Talent: Reward & Recognition',
                    'Studi Kasus: Talent Review Calibration',
                ]],
            ],
            // Course 9 — Bahasa Inggris Bisnis untuk Profesional
            [
                ['title' => 'Written Business Communication', 'description' => 'Skill menulis email dan dokumen bisnis.', 'lessons' => [
                    'Business Email: Subject, Opening, Closing',
                    'Email Negosiasi & Permintaan Formal',
                    'Membalas Komplain dalam Bahasa Inggris',
                ]],
                ['title' => 'Meeting & Verbal Communication', 'description' => 'Komunikasi lisan untuk meeting & presentasi.', 'lessons' => [
                    'Memimpin Meeting Bilingual',
                    'Frasa Penting Conference Call',
                    'Presentasi Bisnis: Opening yang Impactful',
                    'Q&A Handling & Diplomatic Answers',
                ]],
                ['title' => 'Latihan & Real-life Practice', 'description' => 'Praktik networking dan interview MNC.', 'lessons' => [
                    'Small Talk & Networking Profesional',
                    'Interview Kerja MNC: Common Questions',
                    'Studi Kasus: Pitching ke Klien Asing',
                ]],
            ],
        ];
    }

    private function seedAssessments(): void
    {
        // Bangun 5 pre-test + 5 post-test untuk 5 course pertama → total 10 assessments.
        $bank = [
            ['q' => 'Apa langkah pertama analisa kredit?', 'options' => ['Mengumpulkan dokumen calon debitur', 'Mencairkan dana', 'Menelpon supervisor', 'Mengabaikan riwayat']],
            ['q' => 'Komunikasi efektif dengan nasabah dilakukan dengan?', 'options' => ['Mendengarkan dan menjelaskan sederhana', 'Banyak istilah teknis', 'Buru-buru', 'Berdebat']],
            ['q' => 'Tujuan utama survey debitur?', 'options' => ['Verifikasi data & kapasitas bayar', 'Promosi produk lain', 'Mengisi jam kerja', 'Memberi hadiah']],
            ['q' => 'Komponen 5C analisa kredit?', 'options' => ['Character, Capacity, Capital, Collateral, Condition', 'Color, Cost, Concept, Currency, Channel', 'Cash, Card, Credit, Crypto, Coin', 'Bank, Branch, Bond, Bill, Balance']],
            ['q' => 'Pernyataan terbaik tentang collection?', 'options' => ['Pencegahan lebih efektif daripada penagihan akhir', 'Tagih terus tanpa pendekatan', 'Tidak perlu mencatat komunikasi', 'Langsung eskalasi hari pertama']],
        ];

        foreach (array_slice($this->courses, 0, 5) as $idx => $course) {
            foreach (['pre_test', 'post_test'] as $type) {
                $assessment = Assessment::create([
                    'course_id' => $course->id,
                    'title' => ($type === 'pre_test' ? 'Pre-Test ' : 'Post-Test ').$course->title,
                    'type' => $type,
                    'description' => $type === 'pre_test'
                        ? 'Cek pemahaman awal Anda sebelum mulai kursus.'
                        : 'Lulus post-test untuk menyelesaikan course dan mendapat sertifikat.',
                    'passing_score' => 70,
                    'max_attempts' => 3,
                    'duration_minutes' => 20,
                    'is_required' => $type === 'post_test',
                    'sort_order' => $type === 'pre_test' ? 1 : 99,
                ]);

                foreach ($bank as $qi => $row) {
                    $q = Question::create([
                        'assessment_id' => $assessment->id,
                        'question_text' => $row['q'],
                        'type' => 'multiple_choice',
                        'points' => 1,
                        'sort_order' => $qi + 1,
                    ]);

                    foreach ($row['options'] as $oi => $opt) {
                        QuestionOption::create([
                            'question_id' => $q->id,
                            'option_text' => $opt,
                            'is_correct' => $oi === 0,
                            'sort_order' => $oi + 1,
                        ]);
                    }
                }
            }
        }
    }

    private function seedCourseCompetencyMappings(): void
    {
        // Petakan 10 course ke 10 competency dengan bobot acak realistis.
        foreach ($this->courses as $idx => $course) {
            $competency = $this->competencies[$idx];
            CourseCompetencyMapping::create([
                'course_id' => $course->id,
                'competency_id' => $competency->id,
                'weight' => random_int(40, 100),
                'target_level_impact' => random_int(1, 3),
            ]);
        }
    }

    private function seedBundles(): void
    {
        $rows = [
            ['title' => 'Paket Account Officer Lengkap', 'courses' => [1, 0, 6], 'price' => 999_000],
            ['title' => 'Paket Frontliner Excellence', 'courses' => [2, 5], 'price' => 449_000],
            ['title' => 'Paket New Manager Bootcamp', 'courses' => [3, 5, 8], 'price' => 1_499_000],
            ['title' => 'Paket Compliance & Risk', 'courses' => [4, 1], 'price' => 1_299_000],
            ['title' => 'Paket Digital Marketing Pro', 'courses' => [0, 6], 'price' => 549_000],
            ['title' => 'Paket Data Profesional', 'courses' => [6, 7], 'price' => 599_000],
            ['title' => 'Paket Soft Skill Karir', 'courses' => [5, 7, 9], 'price' => 699_000],
            ['title' => 'Paket HR Business Partner', 'courses' => [8, 3], 'price' => 1_199_000],
            ['title' => 'Paket Bilingual Profesional', 'courses' => [9, 5], 'price' => 549_000],
            ['title' => 'Paket All-Access Corporate', 'courses' => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 'price' => 4_999_000],
        ];

        foreach ($rows as $idx => $row) {
            $bundle = Bundle::create([
                'title' => $row['title'],
                'slug' => Str::slug($row['title']).'-'.($idx + 1),
                'description' => "Hemat hingga 30% dengan paket {$row['title']}. Dapat akses semua course di paket ini seumur hidup beserta sertifikat penyelesaian.",
                'thumbnail' => null,
                'price' => $row['price'],
                'compare_at_price' => (int) ($row['price'] * 1.3),
                'is_published' => true,
                'published_at' => now()->subDays(random_int(1, 30)),
            ]);

            $pivot = [];
            foreach ($row['courses'] as $order => $courseIdx) {
                $pivot[$this->courses[$courseIdx]->id] = ['sort_order' => $order + 1];
            }
            $bundle->courses()->sync($pivot);

            $this->bundles[] = $bundle;
        }
    }

    private function seedCoupons(): void
    {
        $rows = [
            ['code' => 'WELCOME10', 'name' => 'Diskon Selamat Datang 10%', 'type' => 'percentage', 'value' => 10, 'max_discount' => 50_000, 'scope' => 'all'],
            ['code' => 'NEWUSER20', 'name' => 'New User Bonus 20%', 'type' => 'percentage', 'value' => 20, 'max_discount' => 100_000, 'scope' => 'all'],
            ['code' => 'RAMADHAN50K', 'name' => 'Promo Ramadhan Potongan 50K', 'type' => 'fixed', 'value' => 50_000, 'max_discount' => null, 'scope' => 'all'],
            ['code' => 'LEARN2026', 'name' => 'Promo Tahun Baru 2026', 'type' => 'percentage', 'value' => 15, 'max_discount' => 75_000, 'scope' => 'all'],
            ['code' => 'BUNDLE25', 'name' => 'Bundle Mania 25%', 'type' => 'percentage', 'value' => 25, 'max_discount' => 200_000, 'scope' => 'all'],
            ['code' => 'CASHBACK100K', 'name' => 'Cashback 100K untuk Course Premium', 'type' => 'fixed', 'value' => 100_000, 'max_discount' => null, 'scope' => 'specific'],
            ['code' => 'FLASH30', 'name' => 'Flash Sale 30%', 'type' => 'percentage', 'value' => 30, 'max_discount' => 150_000, 'scope' => 'all'],
            ['code' => 'CORPORATEHR', 'name' => 'Promo Corporate HR', 'type' => 'percentage', 'value' => 35, 'max_discount' => 300_000, 'scope' => 'specific'],
            ['code' => 'STUDENT15', 'name' => 'Diskon Pelajar 15%', 'type' => 'percentage', 'value' => 15, 'max_discount' => 60_000, 'scope' => 'all'],
            ['code' => 'EARLYBIRD', 'name' => 'Early Bird Bootcamp', 'type' => 'fixed', 'value' => 150_000, 'max_discount' => null, 'scope' => 'specific'],
        ];

        foreach ($rows as $row) {
            $this->coupons[] = Coupon::create([
                'code' => $row['code'],
                'name' => $row['name'],
                'discount_type' => $row['type'],
                'discount_value' => $row['value'],
                'max_discount' => $row['max_discount'],
                'applicable_to' => $row['scope'],
                'max_uses' => 100,
                'uses_count' => random_int(0, 30),
                'is_active' => true,
            ]);
        }

        // Coupon specific → attach ke 2-3 courses.
        $specificCoupons = array_filter($this->coupons, fn (Coupon $c) => $c->applicable_to === 'specific');
        foreach ($specificCoupons as $coupon) {
            $coupon->courses()->sync(collect($this->courses)->random(3)->pluck('id')->all());
        }
    }

    private function seedLearningPaths(): void
    {
        $positionByName = collect($this->positions)->keyBy('name');

        $rows = [
            ['title' => 'Roadmap Account Officer', 'position' => 'Account Officer', 'level' => 'beginner', 'weeks' => 8, 'courses' => [1, 0, 6]],
            ['title' => 'Roadmap Branch Manager', 'position' => 'Branch Manager', 'level' => 'advanced', 'weeks' => 12, 'courses' => [3, 1, 5]],
            ['title' => 'Roadmap Compliance Officer', 'position' => 'Compliance Officer', 'level' => 'intermediate', 'weeks' => 6, 'courses' => [4, 7]],
            ['title' => 'Roadmap Customer Service Excellence', 'position' => 'Customer Service', 'level' => 'beginner', 'weeks' => 4, 'courses' => [2, 5]],
            ['title' => 'Roadmap Marketing Profesional', 'position' => 'Marketing Manager', 'level' => 'intermediate', 'weeks' => 8, 'courses' => [0, 6, 5]],
            ['title' => 'Roadmap HR Business Partner', 'position' => 'HR Business Partner', 'level' => 'intermediate', 'weeks' => 10, 'courses' => [8, 3, 5]],
            ['title' => 'Roadmap Data Analyst Pemula', 'position' => 'Risk Analyst', 'level' => 'beginner', 'weeks' => 6, 'courses' => [6, 7]],
            ['title' => 'Roadmap Leader Baru', 'position' => 'Operations Manager', 'level' => 'intermediate', 'weeks' => 8, 'courses' => [3, 5]],
            ['title' => 'Roadmap Public Speaker Pro', 'position' => 'Product Owner', 'level' => 'intermediate', 'weeks' => 5, 'courses' => [5, 9]],
            ['title' => 'Roadmap Bahasa Inggris Profesional', 'position' => 'Internal Auditor', 'level' => 'intermediate', 'weeks' => 10, 'courses' => [9, 5]],
        ];

        foreach ($rows as $row) {
            $path = LearningPath::create([
                'title' => $row['title'],
                'slug' => Str::slug($row['title']),
                'subtitle' => "Jalur belajar terstruktur untuk posisi {$row['position']}.",
                'description' => "<p>Learning path {$row['title']} dirancang khusus untuk membangun kompetensi peserta dari level dasar sampai siap eksekusi. Berisi gabungan kursus berbasis video, assessment, dan studi kasus.</p>",
                'thumbnail' => null,
                'level' => $row['level'],
                'duration_weeks' => $row['weeks'],
                'target_audience' => ["Karyawan posisi {$row['position']}", 'High potential employee', 'Trainee program internal'],
                'outcomes' => ['Menguasai kompetensi utama posisi', 'Siap mengikuti OJT atau assessment supervisor', 'Mendapat sertifikat learning path Learnpath'],
                'position_id' => $positionByName[$row['position']]?->id,
                'total_courses' => count($row['courses']),
                'total_students' => random_int(20, 250),
                'is_published' => true,
                'published_at' => now()->subDays(random_int(10, 90)),
            ]);

            $pivot = [];
            foreach ($row['courses'] as $order => $courseIdx) {
                $pivot[$this->courses[$courseIdx]->id] = [
                    'sort_order' => $order + 1,
                    'is_required' => true,
                ];
            }
            $path->courses()->sync($pivot);

            $this->learningPaths[] = $path;
        }
    }

    private function seedOrdersPaymentsEnrollments(): void
    {
        // Pasangan student ↔ course untuk 10 order.
        $studentIdx = [7, 8, 9, 7, 8, 9, 7, 8, 9, 7]; // Andi, Rina, Citra ulang
        $courseIdx = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

        foreach ($courseIdx as $i => $cIdx) {
            $user = $this->users[$studentIdx[$i]];
            $course = $this->courses[$cIdx];
            // Semua order dianggap paid sehingga tiap order menghasilkan enrollment & 10 record genap.
            $status = 'paid';
            $paidAt = now()->subDays(random_int(1, 60));

            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => 'ORD-'.now()->format('Ymd').'-'.str_pad((string) ($i + 1), 5, '0', STR_PAD_LEFT),
                'type' => 'course',
                'subtotal' => $course->price,
                'discount' => 0,
                'tax' => 0,
                'total' => $course->price,
                'currency' => 'IDR',
                'status' => $status,
                'customer_name' => $user->name,
                'customer_email' => $user->email,
                'customer_phone' => $user->phone,
                'expires_at' => now()->addDay(),
                'paid_at' => $paidAt,
            ]);

            OrderItem::create([
                'order_id' => $order->id,
                'purchasable_type' => Course::class,
                'purchasable_id' => $course->id,
                'name' => $course->title,
                'quantity' => 1,
                'unit_price' => $course->price,
                'subtotal' => $course->price,
            ]);

            Payment::create([
                'order_id' => $order->id,
                'gateway' => 'pakasir',
                'payment_method' => $i % 2 === 0 ? 'qris' : 'va_bca',
                'payment_number' => 'PAY-'.now()->format('Ymd').'-'.str_pad((string) ($i + 1), 5, '0', STR_PAD_LEFT),
                'amount' => $course->price,
                'fee' => 0,
                'total_payment' => $course->price,
                'status' => $status === 'paid' ? 'completed' : 'pending',
                'gateway_reference' => $status === 'paid' ? Str::upper(Str::random(16)) : null,
                'expired_at' => now()->addDay(),
                'completed_at' => $paidAt,
            ]);

            $this->orders[] = $order;

            // Mix: 7 enrollment completed (untuk certificate course) + 3 in progress.
            $progress = $i < 7 ? 100 : random_int(20, 80);
            $startedAt = now()->subDays(random_int(5, 50));
            $completedAt = $progress === 100 ? $startedAt->copy()->addDays(random_int(7, 30)) : null;

            $enrollment = Enrollment::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'status' => $progress === 100 ? 'completed' : 'active',
                'progress_percent' => $progress,
                'pre_test_status' => 'completed',
                'post_test_status' => $progress === 100 ? 'completed' : 'not_started',
                'certificate_status' => $progress === 100 ? 'issued' : 'not_issued',
                'enrolled_at' => $startedAt,
                'started_at' => $startedAt,
                'completed_at' => $completedAt,
            ]);
            $this->enrollments[] = $enrollment;
        }
    }

    private function seedLearningPathEnrollments(): void
    {
        $studentIdx = [7, 8, 9];
        $count = 0;

        foreach ($this->learningPaths as $i => $path) {
            $user = $this->users[$studentIdx[$count % 3]];
            $isCompleted = $i < 3;

            LearningPathEnrollment::create([
                'user_id' => $user->id,
                'learning_path_id' => $path->id,
                'status' => $isCompleted ? 'completed' : 'active',
                'progress_percent' => $isCompleted ? 100 : random_int(10, 70),
                'courses_completed' => $isCompleted ? $path->total_courses : random_int(0, max(0, $path->total_courses - 1)),
                'enrolled_at' => now()->subDays(random_int(10, 120)),
                'started_at' => now()->subDays(random_int(5, 100)),
                'completed_at' => $isCompleted ? now()->subDays(random_int(1, 30)) : null,
            ]);
            $count++;
        }
    }

    private function seedLessonProgress(): void
    {
        // Buat lesson_progress untuk 10 (enrollment, lesson) pertama.
        $count = 0;
        foreach ($this->enrollments as $enrollment) {
            foreach ($this->lessons as $lesson) {
                if ($lesson->course_id !== $enrollment->course_id) {
                    continue;
                }

                LessonProgress::create([
                    'user_id' => $enrollment->user_id,
                    'course_id' => $enrollment->course_id,
                    'lesson_id' => $lesson->id,
                    'status' => $enrollment->status === 'completed' ? 'completed' : 'in_progress',
                    'progress_percent' => $enrollment->status === 'completed' ? 100 : random_int(30, 90),
                    'last_position' => random_int(0, 600),
                    'started_at' => $enrollment->started_at,
                    'completed_at' => $enrollment->completed_at,
                ]);
                $count++;
                break;
            }

            if ($count >= 10) {
                break;
            }
        }

        // Lengkapi sampai 10 dengan progress placeholder jika kurang.
        while ($count < 10) {
            $user = $this->users[7 + ($count % 3)];
            $lesson = $this->lessons[$count % count($this->lessons)];
            LessonProgress::create([
                'user_id' => $user->id,
                'course_id' => $lesson->course_id,
                'lesson_id' => $lesson->id,
                'status' => 'not_started',
                'progress_percent' => 0,
                'last_position' => 0,
            ]);
            $count++;
        }
    }

    private function seedReviews(): void
    {
        $contents = [
            'Materinya jelas, instruktur sangat berpengalaman. Studi kasusnya relevan dengan kondisi lapangan.',
            'Salah satu kursus terbaik di Learnpath, struktur belajarnya terurut dan mudah diikuti.',
            'Worth every rupiah. Bisa langsung aplikasi ke pekerjaan saya minggu depan.',
            'Sertifikatnya bagus dan diakui di tempat kerja. Highly recommended!',
            'Saya jadi lebih percaya diri menjalankan tugas setelah selesai kursus ini.',
            'Mentor responsif di forum diskusi, banyak insight yang tidak ada di buku.',
            'Kualitas video bagus, audio jelas, dan slide rapi. Pengalaman belajar mulus.',
            'Cocok untuk pemula sampai yang sudah berpengalaman. Banyak hal baru yang saya pelajari.',
            'Kontennya update sesuai kondisi industri saat ini, bukan teori usang.',
            'Setelah ikut kursus ini, KPI saya naik signifikan. Trims Learnpath!',
        ];

        foreach ($this->enrollments as $i => $enrollment) {
            if ($i >= 10) {
                break;
            }
            Review::create([
                'user_id' => $enrollment->user_id,
                'course_id' => $enrollment->course_id,
                'enrollment_id' => $enrollment->id,
                'rating' => random_int(4, 5),
                'content' => $contents[$i % count($contents)],
                'is_public' => true,
            ]);
        }

        // Pad sampai 10 jika enrollment < 10.
        $existing = Review::count();
        while ($existing < 10) {
            $user = $this->users[7 + ($existing % 3)];
            $course = $this->courses[$existing % count($this->courses)];
            Review::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'rating' => random_int(4, 5),
                'content' => $contents[$existing % count($contents)],
                'is_public' => true,
            ]);
            $existing++;
        }
    }

    private function seedCertificates(): void
    {
        $count = 0;
        foreach ($this->enrollments as $enrollment) {
            if ($enrollment->status !== 'completed') {
                continue;
            }
            Certificate::create([
                'user_id' => $enrollment->user_id,
                'course_id' => $enrollment->course_id,
                'subject_type' => Certificate::SUBJECT_COURSE,
                'certificate_number' => 'LP-CERT-'.now()->format('Y').'-'.str_pad((string) ($count + 1), 5, '0', STR_PAD_LEFT),
                'verification_code' => Str::upper(Str::random(12)),
                'issued_at' => $enrollment->completed_at,
                'status' => 'issued',
            ]);
            $count++;
        }

        // Tambah sertifikat learning path untuk hit total 10.
        $pathEnrollments = LearningPathEnrollment::where('status', 'completed')->get();
        foreach ($pathEnrollments as $pe) {
            if ($count >= 10) {
                break;
            }
            Certificate::create([
                'user_id' => $pe->user_id,
                'learning_path_id' => $pe->learning_path_id,
                'subject_type' => Certificate::SUBJECT_PATH,
                'certificate_number' => 'LP-PATH-'.now()->format('Y').'-'.str_pad((string) ($count + 1), 5, '0', STR_PAD_LEFT),
                'verification_code' => Str::upper(Str::random(12)),
                'issued_at' => $pe->completed_at,
                'status' => 'issued',
            ]);
            $count++;
        }
    }

    private function seedWishlists(): void
    {
        $studentIdx = [7, 8, 9];
        $count = 0;
        $created = [];

        // Iterasi semua pasangan (student, course) sampai dapat 10 unique pair
        // yang belum di-enroll dan belum ada di wishlist.
        foreach ($studentIdx as $sIdx) {
            $user = $this->users[$sIdx];
            foreach ($this->courses as $course) {
                if ($count >= 10) {
                    break 2;
                }

                $pairKey = "{$user->id}-{$course->id}";
                if (isset($created[$pairKey])) {
                    continue;
                }

                if (Enrollment::where('user_id', $user->id)->where('course_id', $course->id)->exists()) {
                    continue;
                }

                Wishlist::create([
                    'user_id' => $user->id,
                    'course_id' => $course->id,
                ]);
                $created[$pairKey] = true;
                $count++;
            }
        }
    }

    private function seedPayoutRequests(): void
    {
        $instructorIdx = [4, 5, 6];
        $statuses = ['pending', 'pending', 'approved', 'approved', 'paid', 'paid', 'paid', 'rejected', 'pending', 'paid'];

        foreach ($statuses as $i => $status) {
            $instructor = $this->users[$instructorIdx[$i % 3]];
            $gross = random_int(500_000, 5_000_000);
            $fee = (int) ($gross * 0.05);
            $reviewedAt = in_array($status, ['approved', 'paid', 'rejected'], true) ? now()->subDays(random_int(1, 30)) : null;

            PayoutRequest::create([
                'user_id' => $instructor->id,
                'gross_amount' => $gross,
                'fee_amount' => $fee,
                'net_amount' => $gross - $fee,
                'bank_name' => $i % 2 === 0 ? 'BCA' : 'Mandiri',
                'account_number' => (string) random_int(1000000000, 9999999999),
                'account_holder' => $instructor->name,
                'status' => $status,
                'admin_note' => $status === 'rejected' ? null : 'Pencairan sesuai jadwal pekanan.',
                'reject_reason' => $status === 'rejected' ? 'Nomor rekening tidak sesuai, mohon diperbarui.' : null,
                'reviewed_by' => $reviewedAt ? $this->users[0]->id : null,
                'reviewed_at' => $reviewedAt,
                'paid_at' => $status === 'paid' ? $reviewedAt?->copy()->addDay() : null,
            ]);
        }
    }

    private function seedCouponRedemptions(): void
    {
        foreach (array_slice($this->orders, 0, 10) as $i => $order) {
            $coupon = $this->coupons[$i % count($this->coupons)];
            CouponRedemption::create([
                'coupon_id' => $coupon->id,
                'user_id' => $order->user_id,
                'order_id' => $order->id,
                'discount_applied' => random_int(10_000, 100_000),
            ]);
        }
    }

    private function seedLessonNotes(): void
    {
        $notes = [
            'Catatan penting: rumus VLOOKUP butuh exact match untuk data kategorikal.',
            'Highlight: framework 5C analisa kredit jangan dilewat saat review aplikasi.',
            'Tip dari mentor: gunakan empati saat handle komplain nasabah marah.',
            'Ingat: SLA layanan teller maksimal 5 menit per transaksi.',
            'Quote menarik: "Leader bukan tentang title, tapi tentang dampak ke tim".',
            'Action item: latihan presentasi 3x sebelum demo ke client.',
            'Reminder: STR wajib dilaporkan dalam 3 hari kerja sejak terdeteksi.',
            'Notes: gunakan pivot table untuk summarize data > 1000 baris.',
            'Catatan: emergency fund minimal 6x pengeluaran bulanan.',
            'Penting: setiap email business diawali greeting & ditutup signature lengkap.',
        ];

        $studentIdx = [7, 8, 9];
        // Group lessons by course so we can pick lessons that belong to the
        // user's enrolled courses (notes without enrollment break the player flow).
        $lessonsByCourse = collect($this->lessons)->groupBy('course_id');

        foreach ($notes as $i => $content) {
            $user = $this->users[$studentIdx[$i % 3]];
            $enrolledCourseIds = Enrollment::query()
                ->where('user_id', $user->id)
                ->pluck('course_id')
                ->all();

            if (empty($enrolledCourseIds)) {
                continue;
            }

            $availableLessons = collect($enrolledCourseIds)
                ->flatMap(fn ($cid) => $lessonsByCourse->get($cid, collect()))
                ->values();

            if ($availableLessons->isEmpty()) {
                continue;
            }

            $lesson = $availableLessons->random();

            LessonNote::create([
                'user_id' => $user->id,
                'course_id' => $lesson->course_id,
                'lesson_id' => $lesson->id,
                'timestamp_seconds' => random_int(30, 1200),
                'content' => $content,
            ]);
        }
    }

    private function seedLearningStreaks(): void
    {
        foreach ($this->users as $i => $user) {
            LearningStreak::create([
                'user_id' => $user->id,
                'current_streak' => $i < 5 ? random_int(0, 14) : random_int(0, 3),
                'longest_streak' => random_int(5, 60),
                'last_active_date' => Carbon::today()->subDays(random_int(0, 5)),
            ]);
        }
    }

    private function seedUserBadges(): void
    {
        $badges = Badge::limit(5)->get();
        if ($badges->isEmpty()) {
            return;
        }

        $studentIdx = [7, 8, 9];
        $count = 0;

        foreach ($studentIdx as $sIdx) {
            $user = $this->users[$sIdx];
            foreach ($badges as $badge) {
                if ($count >= 10) {
                    break 2;
                }
                UserBadge::create([
                    'user_id' => $user->id,
                    'badge_id' => $badge->id,
                    'earned_at' => now()->subDays(random_int(1, 60)),
                ]);
                $count++;
            }
        }

        // Pad sampai 10 jika kurang.
        $extras = [$this->users[3], $this->users[4]];
        $i = 0;
        while ($count < 10) {
            $user = $extras[$i % count($extras)];
            $badge = $badges[$i % $badges->count()];
            if (! UserBadge::where('user_id', $user->id)->where('badge_id', $badge->id)->exists()) {
                UserBadge::create([
                    'user_id' => $user->id,
                    'badge_id' => $badge->id,
                    'earned_at' => now()->subDays(random_int(1, 60)),
                ]);
                $count++;
            }
            $i++;
        }
    }

    private function seedUserCompetencies(): void
    {
        $primaryTenantId = $this->organizations[0]->id;
        $employeeIdx = [7, 8, 3]; // Andi, Rina, Supervisor
        $count = 0;

        foreach ($employeeIdx as $sIdx) {
            $user = $this->users[$sIdx];
            foreach ($this->competencies as $comp) {
                if ($count >= 10) {
                    break 2;
                }
                UserCompetency::create([
                    'tenant_id' => $primaryTenantId,
                    'user_id' => $user->id,
                    'competency_id' => $comp->id,
                    'actual_level' => random_int(1, 5),
                    'source' => 'course_completion',
                    'confidence_score' => random_int(60, 100),
                    'last_evaluated_at' => now()->subDays(random_int(1, 60)),
                ]);
                $count++;
            }
        }
    }

    private function seedSkillGaps(): void
    {
        $primaryTenantId = $this->organizations[0]->id;
        $byPosition = collect($this->positions)->keyBy('name');
        $aoPosition = $byPosition['Account Officer'];
        $employeeIdx = [7, 8, 3];

        $count = 0;
        foreach ($employeeIdx as $sIdx) {
            $user = $this->users[$sIdx];
            foreach ($this->competencies as $comp) {
                if ($count >= 10) {
                    break 2;
                }
                $target = random_int(3, 5);
                $actual = random_int(1, 5);
                $gap = $actual - $target;

                SkillGap::create([
                    'tenant_id' => $primaryTenantId,
                    'user_id' => $user->id,
                    'position_id' => $aoPosition->id,
                    'competency_id' => $comp->id,
                    'target_level' => $target,
                    'actual_level' => $actual,
                    'gap' => $gap,
                    'recommendation' => $gap < 0
                        ? "Ikuti kursus terkait {$comp->name} untuk meningkatkan level."
                        : 'Pertahankan dengan refresher tahunan.',
                    'status' => match (true) {
                        $actual === 0 => 'no_data',
                        $gap > 0 => 'exceeded',
                        $gap === 0 => 'met',
                        default => 'gap',
                    },
                    'calculated_at' => now()->subDays(random_int(1, 14)),
                ]);
                $count++;
            }
        }
    }

    private function seedOjtAssessments(): void
    {
        $primaryTenantId = $this->organizations[0]->id;
        $employeeIdx = [7, 8];
        $count = 0;

        foreach ($employeeIdx as $sIdx) {
            $user = $this->users[$sIdx];
            foreach ($this->competencies as $i => $comp) {
                if ($count >= 10) {
                    break 2;
                }
                OjtAssessment::create([
                    'tenant_id' => $primaryTenantId,
                    'user_id' => $user->id,
                    'course_id' => $this->courses[$i % count($this->courses)]->id,
                    'competency_id' => $comp->id,
                    'supervisor_id' => $this->users[3]->id,
                    'rubric_score' => random_int(70, 100),
                    'actual_level' => random_int(3, 5),
                    'notes' => 'Performa OJT memenuhi standar minimum dengan beberapa area improvement.',
                    'status' => $count < 7 ? 'approved' : 'pending_review',
                    'assessed_at' => now()->subDays(random_int(1, 30)),
                ]);
                $count++;
            }
        }
    }

    private function seedSupervisorReviews(): void
    {
        $primaryTenantId = $this->organizations[0]->id;
        $employeeIdx = [7, 8];
        $count = 0;

        foreach ($employeeIdx as $sIdx) {
            $user = $this->users[$sIdx];
            foreach ($this->competencies as $comp) {
                if ($count >= 10) {
                    break 2;
                }
                SupervisorReview::create([
                    'tenant_id' => $primaryTenantId,
                    'user_id' => $user->id,
                    'competency_id' => $comp->id,
                    'reviewer_id' => $this->users[3]->id,
                    'rating' => random_int(3, 5),
                    'actual_level' => random_int(3, 5),
                    'notes' => 'Konsisten menunjukkan progress di kuartal ini, lanjutkan dengan stretch project.',
                    'approval_status' => $count < 6 ? 'approved' : 'pending_review',
                    'reviewed_at' => now()->subDays(random_int(1, 30)),
                ]);
                $count++;
            }
        }
    }

    private function seedDiscussions(): void
    {
        $primaryTenantId = $this->organizations[0]->id;
        $titles = [
            'Bagaimana approach analisa kredit untuk UMKM tanpa laporan keuangan formal?',
            'Tips menghadapi nasabah yang selalu menawar bunga?',
            'Software AML terbaik untuk bank menengah?',
            'Cara overcome demam panggung saat pitching ke direksi?',
            'Pivot table vs Power Query, mana yang lebih cepat?',
            'Rekomendasi reksadana untuk pemula konservatif?',
            'KPI HRBP yang reasonable untuk perusahaan 200 karyawan?',
            'Latihan speaking efektif untuk bahasa Inggris bisnis?',
            'Pengalaman kepemimpinan saat handle konflik tim?',
            'Cara dokumentasi service recovery yang baik?',
        ];

        $studentIdx = [7, 8, 9];
        foreach ($titles as $i => $title) {
            $course = $this->courses[$i % count($this->courses)];
            $user = $this->users[$studentIdx[$i % 3]];

            $thread = DiscussionThread::create([
                'tenant_id' => $primaryTenantId,
                'course_id' => $course->id,
                'user_id' => $user->id,
                'title' => $title,
                'body' => 'Mau diskusi mengenai topik ini berdasarkan modul yang baru saya pelajari. Mohon insight dari rekan-rekan lainnya yang sudah punya pengalaman.',
                'upvotes_count' => random_int(0, 25),
                'replies_count' => random_int(1, 5),
                'last_reply_at' => now()->subDays(random_int(1, 10)),
            ]);

            // 1 reply per thread (total ~10 replies).
            DiscussionReply::create([
                'discussion_thread_id' => $thread->id,
                'user_id' => $course->instructor_id,
                'body' => 'Pertanyaan bagus! Coba lihat ulang modul 2 bagian studi kasus — di sana ada framework praktis yang relevan. Kalau masih ada yang kurang jelas, share contoh data dummy-nya ya.',
                'upvotes_count' => random_int(0, 15),
            ]);
        }
    }

    private function seedChats(): void
    {
        $studentIdx = [7, 8, 9];
        foreach (range(0, 9) as $i) {
            $user = $this->users[$studentIdx[$i % 3]];
            $course = $this->courses[$i % count($this->courses)];

            $thread = ChatThread::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'title' => 'Tanya AI Tutor: '.Str::limit($course->title, 40),
                'last_message_at' => now()->subDays(random_int(0, 10)),
            ]);

            ChatMessage::create([
                'chat_thread_id' => $thread->id,
                'role' => 'user',
                'content' => 'Bisa jelaskan konsep utama di modul ini dalam 3 poin singkat?',
            ]);
            ChatMessage::create([
                'chat_thread_id' => $thread->id,
                'role' => 'assistant',
                'content' => "Tentu! Tiga poin utama:\n1. Konsep dasar dan kenapa relevan untuk pekerjaan Anda.\n2. Framework praktis yang langsung bisa diterapkan.\n3. Studi kasus singkat untuk konteks Indonesia.",
                'tokens' => 120,
                'model' => 'gpt-4o-mini',
            ]);
        }
    }

    private function seedMessages(): void
    {
        $rows = [
            ['from' => 2, 'to' => 7, 'subject' => 'Welcome aboard Learnpath', 'body' => 'Selamat datang di program training internal! Silakan login dan lengkapi profil Anda.'],
            ['from' => 2, 'to' => 8, 'subject' => 'Welcome aboard Learnpath', 'body' => 'Selamat datang di program training internal! Silakan login dan lengkapi profil Anda.'],
            ['from' => 3, 'to' => 7, 'subject' => 'Reminder pre-test minggu ini', 'body' => 'Jangan lupa selesaikan pre-test untuk course Analisa Kredit sebelum Jumat ya.'],
            ['from' => 3, 'to' => 8, 'subject' => 'Update jadwal coaching', 'body' => 'Sesi coaching personal dijadwalkan ulang ke hari Selasa pukul 10:00 WIB.'],
            ['from' => 7, 'to' => 3, 'subject' => 'Ijin reschedule OJT', 'body' => 'Mohon ijin reschedule OJT ke minggu depan karena ada audit cabang mendadak.'],
            ['from' => 8, 'to' => 3, 'subject' => 'Konfirmasi enrollment learning path', 'body' => 'Apakah saya bisa enroll roadmap Customer Service Excellence sekaligus dengan path saat ini?'],
            ['from' => 4, 'to' => 7, 'subject' => 'Feedback assignment minggu lalu', 'body' => 'Assignment Anda sudah saya review. Overall bagus, tinggal perbaiki bagian analisa risiko.'],
            ['from' => 5, 'to' => 8, 'subject' => 'Tugas presentasi minggu depan', 'body' => 'Siapkan presentasi 5 menit tentang case service recovery untuk sesi live class minggu depan.'],
            ['from' => 6, 'to' => 9, 'subject' => 'Resource tambahan compliance', 'body' => 'Saya kirim link e-book tambahan untuk pendalaman materi compliance. Selamat belajar!'],
            ['from' => 0, 'to' => 1, 'subject' => 'Setup tenant onboarding', 'body' => 'Tenant Bank Mandiri sudah siap. Silakan undang batch pertama karyawan via menu undangan.'],
        ];

        foreach ($rows as $r) {
            Message::create([
                'sender_id' => $this->users[$r['from']]->id,
                'recipient_id' => $this->users[$r['to']]->id,
                'subject' => $r['subject'],
                'body' => $r['body'],
                'read_at' => random_int(0, 1) ? now()->subDays(random_int(1, 5)) : null,
            ]);
        }
    }

    private function seedOrganizationInvitations(): void
    {
        $primary = $this->organizations[0];
        $invitedBy = $this->users[2]->id; // HR

        $invitees = [
            ['name' => 'Faisal Rahman', 'email' => 'faisal.rahman@learnpath.id', 'position' => 'Account Officer'],
            ['name' => 'Lina Marlina', 'email' => 'lina.marlina@learnpath.id', 'position' => 'Customer Service'],
            ['name' => 'Bayu Sutanto', 'email' => 'bayu.sutanto@learnpath.id', 'position' => 'Account Officer'],
            ['name' => 'Maya Sari', 'email' => 'maya.sari@learnpath.id', 'position' => 'Marketing Manager'],
            ['name' => 'Reza Pratama', 'email' => 'reza.pratama@learnpath.id', 'position' => 'Compliance Officer'],
            ['name' => 'Putri Wulandari', 'email' => 'putri.wulandari@learnpath.id', 'position' => 'HR Business Partner'],
            ['name' => 'Gilang Ramadhan', 'email' => 'gilang.ramadhan@learnpath.id', 'position' => 'Product Owner'],
            ['name' => 'Sintia Kurnia', 'email' => 'sintia.kurnia@learnpath.id', 'position' => 'Internal Auditor'],
            ['name' => 'Hendra Wijaya', 'email' => 'hendra.wijaya@learnpath.id', 'position' => 'Branch Manager'],
            ['name' => 'Anita Permata', 'email' => 'anita.permata@learnpath.id', 'position' => 'Risk Analyst'],
        ];

        $positionByName = collect($this->positions)->keyBy('name');

        foreach ($invitees as $i => $row) {
            OrganizationInvitation::create([
                'organization_id' => $primary->id,
                'invited_by_user_id' => $invitedBy,
                'email' => $row['email'],
                'name' => $row['name'],
                'role' => 'member',
                'position_id' => $positionByName[$row['position']]->id,
                'employee_number' => 'EMP-INV-'.str_pad((string) ($i + 100), 5, '0', STR_PAD_LEFT),
                'division' => $positionByName[$row['position']]->division,
                'branch' => 'Jakarta Pusat',
                'last_sent_at' => now()->subDays(random_int(0, 5)),
            ]);
        }
    }
}
