<?php

use App\Actions\Learning\MarkLessonComplete;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\LearningPath;
use App\Models\LearningPathEnrollment;
use App\Models\Lesson;
use App\Models\User;
use App\Services\Learning\CertificateIssuanceService;
use App\Services\Learning\PathEnrollmentService;
use Illuminate\Support\Facades\Http;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Http::fake([
        'app.mailketing.co.id/*' => Http::response(['status' => 'success'], 200),
    ]);
    config()->set('services.mailketing.api_key', 'test-key');

    Role::findOrCreate('employee', 'web');
});

it('issues a path certificate when a completed LearningPathEnrollment is passed', function () {
    $user = User::factory()->create();
    $path = LearningPath::factory()->create();

    $pathEnrollment = LearningPathEnrollment::factory()->completed()->create([
        'user_id' => $user->id,
        'learning_path_id' => $path->id,
    ]);

    $cert = app(CertificateIssuanceService::class)->issueForPathEnrollment($pathEnrollment);

    expect($cert)->not->toBeNull();
    expect($cert->subject_type)->toBe('path');
    expect($cert->learning_path_id)->toBe($path->id);
    expect($cert->course_id)->toBeNull();
    expect($cert->certificate_number)->toMatch('/^PATH-\d{4}-\d{4}-[A-Z0-9]{6}$/');
});

it('does not issue a path certificate for an active (uncompleted) path enrollment', function () {
    $user = User::factory()->create();
    $path = LearningPath::factory()->create();

    $pathEnrollment = LearningPathEnrollment::factory()->create([
        'user_id' => $user->id,
        'learning_path_id' => $path->id,
        'status' => 'active',
    ]);

    $cert = app(CertificateIssuanceService::class)->issueForPathEnrollment($pathEnrollment);

    expect($cert)->toBeNull();
    expect(Certificate::count())->toBe(0);
});

it('is idempotent when issued twice for the same path enrollment', function () {
    $user = User::factory()->create();
    $path = LearningPath::factory()->create();

    $pathEnrollment = LearningPathEnrollment::factory()->completed()->create([
        'user_id' => $user->id,
        'learning_path_id' => $path->id,
    ]);

    $service = app(CertificateIssuanceService::class);
    $first = $service->issueForPathEnrollment($pathEnrollment);
    $second = $service->issueForPathEnrollment($pathEnrollment);

    expect($first->id)->toBe($second->id);
    expect(Certificate::count())->toBe(1);
});

it('issues path certificate via recompute cascade when all child courses complete', function () {
    $user = User::factory()->create();
    $path = LearningPath::factory()->create();
    $course = Course::factory()->create();
    $lesson = Lesson::factory()->create(['course_id' => $course->id, 'is_required' => true]);
    $path->courses()->sync([$course->id => ['sort_order' => 1, 'is_required' => true]]);
    $path->update(['total_courses' => 1]);

    app(PathEnrollmentService::class)->enroll($user, $path);

    expect(Certificate::where('subject_type', 'path')->count())->toBe(0);

    // Complete the only lesson → course completes → observer fires → path completes → path cert
    app(MarkLessonComplete::class)->execute($user, $lesson);

    $pathCert = Certificate::where('subject_type', 'path')
        ->where('user_id', $user->id)
        ->where('learning_path_id', $path->id)
        ->first();

    expect($pathCert)->not->toBeNull();
    expect($pathCert->learning_path_id)->toBe($path->id);
});

it('sends a Mailketing email for path certificate with correct subject wording', function () {
    $user = User::factory()->create(['email' => 'pathlearner@test.id']);
    $path = LearningPath::factory()->create(['title' => 'Roadmap Test']);

    $pathEnrollment = LearningPathEnrollment::factory()->completed()->create([
        'user_id' => $user->id,
        'learning_path_id' => $path->id,
    ]);

    app(CertificateIssuanceService::class)->issueForPathEnrollment($pathEnrollment);

    Http::assertSent(function ($request) use ($user) {
        if (! str_contains($request->url(), 'app.mailketing.co.id/api/v1/send')) {
            return false;
        }
        $body = $request->data();

        return $body['recipient'] === $user->email
            && str_contains($body['subject'], 'Learning Path')
            && str_contains($body['subject'], 'Roadmap Test');
    });
});

it('lets the owner print a path certificate via the same /print route', function () {
    $user = User::factory()->create();
    $path = LearningPath::factory()->create(['title' => 'Roadmap Owner Print']);

    $cert = Certificate::create([
        'user_id' => $user->id,
        'course_id' => null,
        'learning_path_id' => $path->id,
        'subject_type' => 'path',
        'certificate_number' => 'PATH-2026-0001-AAAAAA',
        'verification_code' => 'PATHCERT01',
        'issued_at' => now(),
        'status' => 'issued',
    ]);

    $this->actingAs($user)
        ->get("/my-certificates/{$cert->verification_code}/print")
        ->assertOk()
        ->assertSee($cert->certificate_number)
        ->assertSee('Roadmap Owner Print')
        ->assertSee('Sertifikat Penyelesaian Learning Path');
});

it('public verify page renders path certificate with learning_path field', function () {
    $user = User::factory()->create(['name' => 'Andi']);
    $path = LearningPath::factory()->create(['title' => 'Roadmap Verify']);

    $cert = Certificate::create([
        'user_id' => $user->id,
        'course_id' => null,
        'learning_path_id' => $path->id,
        'subject_type' => 'path',
        'certificate_number' => 'PATH-2026-0002-BBBBBB',
        'verification_code' => 'PATHVERIFY',
        'issued_at' => now(),
        'status' => 'issued',
    ]);

    $this->get("/verify-certificate/{$cert->verification_code}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/certificate-verify')
            ->where('isValid', true)
            ->where('certificate.subject_type', 'path')
            ->where('certificate.learning_path.title', 'Roadmap Verify')
        );
});

it('my-certificates lists both course and path certificates', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $user->assignRole('employee');

    $course = Course::factory()->create();
    $path = LearningPath::factory()->create();

    Certificate::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'subject_type' => 'course',
        'certificate_number' => 'CERT-2026-0001-AAAAAA',
        'verification_code' => 'COURSECERT',
        'issued_at' => now(),
        'status' => 'issued',
    ]);
    Certificate::create([
        'user_id' => $user->id,
        'learning_path_id' => $path->id,
        'subject_type' => 'path',
        'certificate_number' => 'PATH-2026-0001-BBBBBB',
        'verification_code' => 'PATHCERT99',
        'issued_at' => now(),
        'status' => 'issued',
    ]);

    $this->actingAs($user)
        ->get('/my-certificates')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('student/my-certificates/index')
            ->has('certificates.data', 2)
        );
});
