<?php

use App\Models\Competency;
use App\Models\Course;
use App\Models\CourseCompetencyMapping;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Position;
use App\Models\SkillGap;
use App\Models\User;
use App\Services\AI\SkillGapAIRemediator;
use Illuminate\Support\Facades\Http;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    config()->set('services.openai.api_key', 'test-key');
    config()->set('services.openai.model', 'gpt-5');

    Permission::findOrCreate('skill_matrix.view', 'web');
    $hrRole = Role::findOrCreate('hr', 'web');
    $hrRole->syncPermissions(['skill_matrix.view']);
    Role::findOrCreate('employee', 'web');

    $this->org = Organization::create([
        'name' => 'Acme AI Gap',
        'slug' => 'acme-ai-gap',
        'contact_name' => 'HR',
        'contact_email' => 'hr@ai.test',
        'seat_quota' => 10,
        'seats_used' => 0,
        'status' => 'active',
    ]);

    $this->hr = User::factory()->create(['email_verified_at' => now()]);
    $this->hr->assignRole('hr');
    OrganizationMember::create([
        'organization_id' => $this->org->id,
        'user_id' => $this->hr->id,
        'role' => 'admin',
        'joined_at' => now(),
    ]);

    $this->employee = User::factory()->create(['name' => 'Andi Karyawan']);
    $this->employee->assignRole('employee');

    $this->competency = tenancy()->runWithTenant($this->org, fn () => Competency::create([
        'name' => 'Analisa Kredit', 'category' => 'Technical Skill', 'is_active' => true,
    ]));
    $this->position = tenancy()->runWithTenant($this->org, fn () => Position::create([
        'name' => 'Account Officer', 'is_active' => true,
    ]));

    $this->gap = tenancy()->runWithTenant($this->org, fn () => SkillGap::create([
        'user_id' => $this->employee->id,
        'position_id' => $this->position->id,
        'competency_id' => $this->competency->id,
        'target_level' => 5,
        'actual_level' => 2,
        'gap' => 3,
        'status' => 'gap',
        'calculated_at' => now(),
    ]));
});

it('generates AI recommendation using courses mapped to the competency', function () {
    $course = Course::factory()->create([
        'title' => 'Dasar Analisa Kredit',
        'slug' => 'dasar-analisa-kredit',
        'is_published' => true,
    ]);
    tenancy()->runWithTenant($this->org, fn () => CourseCompetencyMapping::create([
        'course_id' => $course->id,
        'competency_id' => $this->competency->id,
    ]));

    Http::fake([
        'api.openai.com/v1/chat/completions' => Http::response([
            'model' => 'gpt-5',
            'choices' => [['message' => ['content' => json_encode([
                'summary' => 'Andi perlu fondasi dulu sebelum advanced.',
                'recommendations' => [
                    ['course_id' => $course->id, 'rationale' => 'Materi fundamental cocok untuk gap besar.', 'order' => 1],
                ],
            ])]]],
            'usage' => ['prompt_tokens' => 10, 'completion_tokens' => 20, 'total_tokens' => 30],
        ], 200),
    ]);

    $result = app(SkillGapAIRemediator::class)->remediate($this->gap);

    expect($result['summary'])->toContain('Andi perlu fondasi');
    expect($result['recommendations'])->toHaveCount(1);
    expect($result['recommendations'][0]['title'])->toBe('Dasar Analisa Kredit');
    expect($result['recommendations'][0]['slug'])->toBe('dasar-analisa-kredit');
    expect($result['recommendations'][0]['rationale'])->toContain('fundamental');

    $fresh = $this->gap->fresh();
    expect($fresh->ai_recommendation)->toBeArray();
    expect($fresh->ai_recommendation['recommendations'][0]['course_id'])->toBe($course->id);
    expect($fresh->ai_recommended_at)->not->toBeNull();
});

it('returns empty recommendations when no mapped course exists', function () {
    $result = app(SkillGapAIRemediator::class)->remediate($this->gap);

    expect($result['recommendations'])->toBeArray()->toBeEmpty();
    expect($result['summary'])->toContain('Belum ada course');

    // No OpenAI call should be made when catalog is empty.
    Http::assertNothingSent();
});

it('drops hallucinated course IDs not in the catalog', function () {
    $course = Course::factory()->create(['is_published' => true]);
    tenancy()->runWithTenant($this->org, fn () => CourseCompetencyMapping::create([
        'course_id' => $course->id,
        'competency_id' => $this->competency->id,
    ]));

    Http::fake([
        'api.openai.com/v1/chat/completions' => Http::response([
            'model' => 'gpt-5',
            'choices' => [['message' => ['content' => json_encode([
                'summary' => 'Test',
                'recommendations' => [
                    ['course_id' => $course->id, 'rationale' => 'real', 'order' => 1],
                    ['course_id' => 99999, 'rationale' => 'fake', 'order' => 2],
                ],
            ])]]],
            'usage' => ['prompt_tokens' => 5, 'completion_tokens' => 5, 'total_tokens' => 10],
        ], 200),
    ]);

    $result = app(SkillGapAIRemediator::class)->remediate($this->gap);

    expect($result['recommendations'])->toHaveCount(1);
    expect($result['recommendations'][0]['course_id'])->toBe($course->id);
});

it('exposes the recommend-ai endpoint for HR and persists result', function () {
    $course = Course::factory()->create(['is_published' => true]);
    tenancy()->runWithTenant($this->org, fn () => CourseCompetencyMapping::create([
        'course_id' => $course->id,
        'competency_id' => $this->competency->id,
    ]));

    Http::fake([
        'api.openai.com/v1/chat/completions' => Http::response([
            'model' => 'gpt-5',
            'choices' => [['message' => ['content' => json_encode([
                'summary' => 'Cocok',
                'recommendations' => [
                    ['course_id' => $course->id, 'rationale' => 'OK', 'order' => 1],
                ],
            ])]]],
            'usage' => ['total_tokens' => 1],
        ], 200),
    ]);

    $this->actingAs($this->hr)
        ->post("/admin/skill-gaps/{$this->gap->id}/recommend-ai")
        ->assertSessionHas('success');

    expect($this->gap->fresh()->ai_recommendation)->not->toBeNull();
});

it('blocks non-HR users from the recommend-ai endpoint', function () {
    $u = User::factory()->create();
    $u->assignRole('employee');

    $this->actingAs($u)
        ->post("/admin/skill-gaps/{$this->gap->id}/recommend-ai")
        ->assertForbidden();
});
