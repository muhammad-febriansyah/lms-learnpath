<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Competency;
use App\Models\EmployeeProfile;
use App\Models\InstructorProfile;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Position;
use App\Models\PositionCompetencyTarget;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            SettingSeeder::class,
            CertificateTemplateSeeder::class,
        ]);

        $this->seedUsers();
        $this->seedCategories();
        $positions = $this->seedPositions();
        $competencies = $this->seedCompetencies();
        $this->seedPositionCompetencyTargets($positions, $competencies);

        $this->call(AssessmentSeeder::class);
        $this->call(LearningPathSeeder::class);
        $this->call(BadgeSeeder::class);
    }

    private function seedUsers(): void
    {
        $admin = User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
            'username' => 'superadmin',
        ]);
        $admin->assignRole('superadmin');

        $hr = User::factory()->create([
            'name' => 'HR Manager',
            'email' => 'hr@example.com',
            'username' => 'hr',
        ]);
        $hr->assignRole('hr');

        // Attach HR as admin of the demo organization so /business/* routes work.
        $defaultOrg = Organization::query()->first();
        if ($defaultOrg) {
            OrganizationMember::firstOrCreate(
                ['organization_id' => $defaultOrg->id, 'user_id' => $hr->id],
                ['role' => 'admin', 'joined_at' => now()],
            );
        }

        $instructor = User::factory()->create([
            'name' => 'Instructor One',
            'email' => 'instructor@example.com',
            'username' => 'instructor',
        ]);
        $instructor->assignRole('instructor');
        InstructorProfile::factory()->create([
            'user_id' => $instructor->id,
            'headline' => 'Senior Banking Trainer',
            'is_verified' => true,
        ]);

        $supervisor = User::factory()->create([
            'name' => 'Supervisor One',
            'email' => 'supervisor@example.com',
            'username' => 'supervisor',
        ]);
        $supervisor->assignRole('supervisor');

        $student = User::factory()->create([
            'name' => 'Andi Saputra',
            'email' => 'andi@example.com',
            'username' => 'andi',
        ]);
        $student->assignRole('employee');

        // Karyawan harus jadi member tenant.
        if ($defaultOrg) {
            OrganizationMember::firstOrCreate(
                ['organization_id' => $defaultOrg->id, 'user_id' => $student->id],
                ['role' => 'member', 'joined_at' => now()],
            );
        }

        EmployeeProfile::factory()->create([
            'user_id' => $student->id,
            'position_id' => null,
            'supervisor_id' => $supervisor->id,
            'employee_number' => 'EMP-10001',
            'division' => 'Sales & Lending',
            'branch' => 'Jakarta Selatan',
        ]);
    }

    private function seedCategories(): void
    {
        $categories = [
            ['name' => 'Digital Marketing', 'slug' => 'digital-marketing'],
            ['name' => 'Sales & Lending', 'slug' => 'sales-lending'],
            ['name' => 'Operations', 'slug' => 'operations'],
            ['name' => 'Leadership', 'slug' => 'leadership'],
            ['name' => 'Compliance', 'slug' => 'compliance'],
        ];

        foreach ($categories as $data) {
            Category::firstOrCreate(
                ['slug' => $data['slug']],
                [
                    'name' => $data['name'],
                    'description' => $data['name'].' courses',
                    'is_active' => true,
                ]
            );
        }
    }

    /**
     * @return array<string, Position>
     */
    private function seedPositions(): array
    {
        $rows = [
            ['name' => 'Account Officer', 'division' => 'Sales & Lending'],
            ['name' => 'Customer Service', 'division' => 'Operations'],
            ['name' => 'Branch Manager', 'division' => 'Sales & Lending'],
            ['name' => 'Compliance Officer', 'division' => 'Compliance'],
        ];

        $positions = [];

        foreach ($rows as $row) {
            $positions[$row['name']] = Position::firstOrCreate(
                ['name' => $row['name']],
                [
                    'division' => $row['division'],
                    'branch' => null,
                    'description' => $row['name'].' position',
                    'is_active' => true,
                ]
            );
        }

        return $positions;
    }

    /**
     * @return array<string, Competency>
     */
    private function seedCompetencies(): array
    {
        $rows = [
            ['name' => 'Analisa Kredit', 'category' => 'Technical Skill'],
            ['name' => 'Survey Debitur', 'category' => 'Technical Skill'],
            ['name' => 'Komunikasi Nasabah', 'category' => 'Soft Skill'],
            ['name' => 'Manajemen Risiko', 'category' => 'Technical Skill'],
            ['name' => 'Collection Dasar', 'category' => 'Technical Skill'],
            ['name' => 'Kepemimpinan', 'category' => 'Leadership'],
            ['name' => 'Compliance Awareness', 'category' => 'Compliance'],
        ];

        $competencies = [];

        foreach ($rows as $row) {
            $competencies[$row['name']] = Competency::firstOrCreate(
                ['name' => $row['name']],
                [
                    'category' => $row['category'],
                    'description' => $row['name'].' competency',
                    'is_active' => true,
                ]
            );
        }

        return $competencies;
    }

    /**
     * @param  array<string, Position>  $positions
     * @param  array<string, Competency>  $competencies
     */
    private function seedPositionCompetencyTargets(array $positions, array $competencies): void
    {
        $targets = [
            ['Account Officer', 'Analisa Kredit', 4],
            ['Account Officer', 'Survey Debitur', 4],
            ['Account Officer', 'Komunikasi Nasabah', 3],
            ['Account Officer', 'Manajemen Risiko', 3],
            ['Account Officer', 'Collection Dasar', 2],
            ['Branch Manager', 'Kepemimpinan', 4],
            ['Branch Manager', 'Manajemen Risiko', 4],
            ['Compliance Officer', 'Compliance Awareness', 5],
        ];

        foreach ($targets as [$positionName, $competencyName, $targetLevel]) {
            PositionCompetencyTarget::firstOrCreate(
                [
                    'position_id' => $positions[$positionName]->id,
                    'competency_id' => $competencies[$competencyName]->id,
                ],
                [
                    'target_level' => $targetLevel,
                    'is_required' => true,
                ]
            );
        }
    }
}
