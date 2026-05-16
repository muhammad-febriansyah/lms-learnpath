<?php

use App\Actions\Learning\MarkLessonComplete;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\User;
use App\Services\Learning\CertificateIssuanceService;
use Illuminate\Support\Facades\Http;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Http::fake([
        'app.mailketing.co.id/*' => Http::response(['status' => 'success'], 200),
    ]);
    config()->set('services.mailketing.api_key', 'test-key');

    Role::findOrCreate('student', 'web');
    $this->service = app(CertificateIssuanceService::class);
});

it('issues a certificate for a completed enrollment on a certified course', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['is_certified' => true]);

    $enrollment = Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => 'completed',
        'progress_percent' => 100,
        'enrolled_at' => now()->subDay(),
        'completed_at' => now(),
    ]);

    $certificate = $this->service->issueForEnrollment($enrollment);

    expect($certificate)->not->toBeNull();
    expect($certificate->user_id)->toBe($user->id);
    expect($certificate->course_id)->toBe($course->id);
    expect($certificate->status)->toBe('issued');
    expect($certificate->certificate_number)->toMatch('/^CERT-\d{4}-\d{4}-[A-Z0-9]{6}$/');
    expect($certificate->verification_code)->toMatch('/^[A-Z0-9]{10}$/');
    expect($enrollment->fresh()->certificate_status)->toBe('issued');
});

it('does not issue a certificate for non-certified courses', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['is_certified' => false]);

    $enrollment = Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => 'completed',
        'enrolled_at' => now(),
    ]);

    $certificate = $this->service->issueForEnrollment($enrollment);

    expect($certificate)->toBeNull();
    expect(Certificate::count())->toBe(0);
});

it('does not issue a certificate when enrollment is not yet completed', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['is_certified' => true]);

    $enrollment = Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => 'active',
        'enrolled_at' => now(),
    ]);

    $certificate = $this->service->issueForEnrollment($enrollment);

    expect($certificate)->toBeNull();
});

it('is idempotent: re-issuing returns the existing certificate', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['is_certified' => true]);

    $enrollment = Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => 'completed',
        'enrolled_at' => now(),
    ]);

    $first = $this->service->issueForEnrollment($enrollment);
    $second = $this->service->issueForEnrollment($enrollment);

    expect($first->id)->toBe($second->id);
    expect(Certificate::count())->toBe(1);
});

it('automatically issues a certificate when a lesson completion finishes the course', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['is_certified' => true]);
    $lesson = Lesson::factory()->create([
        'course_id' => $course->id,
        'is_required' => true,
    ]);

    Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => 'active',
        'progress_percent' => 0,
        'enrolled_at' => now(),
    ]);

    app(MarkLessonComplete::class)->execute($user, $lesson);

    $certificate = Certificate::where('user_id', $user->id)
        ->where('course_id', $course->id)
        ->first();

    expect($certificate)->not->toBeNull();
    expect($certificate->status)->toBe('issued');
});

it('does not auto-issue when the course is not certified', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['is_certified' => false]);
    $lesson = Lesson::factory()->create([
        'course_id' => $course->id,
        'is_required' => true,
    ]);

    Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => 'active',
        'enrolled_at' => now(),
    ]);

    app(MarkLessonComplete::class)->execute($user, $lesson);

    expect(Certificate::count())->toBe(0);
});

it('sends a Mailketing email when certificate is issued', function () {
    $user = User::factory()->create(['email' => 'learner@test.id']);
    $course = Course::factory()->create([
        'is_certified' => true,
        'title' => 'Test Course',
    ]);

    $enrollment = Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => 'completed',
        'enrolled_at' => now(),
    ]);

    $this->service->issueForEnrollment($enrollment);

    Http::assertSent(function ($request) {
        if (! str_contains($request->url(), 'app.mailketing.co.id/api/v1/send')) {
            return false;
        }
        $body = $request->data();

        return $body['recipient'] === 'learner@test.id'
            && str_contains($body['subject'], 'Sertifikat')
            && str_contains($body['subject'], 'Test Course');
    });
});

it('allows the certificate owner to access the print view', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['is_certified' => true]);
    $certificate = Certificate::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'certificate_number' => 'CERT-2026-0001-ABCDEF',
        'verification_code' => 'ABC123XYZ0',
        'issued_at' => now(),
        'status' => 'issued',
    ]);

    $this->actingAs($user)
        ->get("/my-certificates/{$certificate->verification_code}/print")
        ->assertOk()
        ->assertSee($certificate->certificate_number)
        ->assertSee($user->name);
});

it('forbids another user from printing someone elses certificate', function () {
    $owner = User::factory()->create();
    $stranger = User::factory()->create();
    $course = Course::factory()->create(['is_certified' => true]);

    $certificate = Certificate::create([
        'user_id' => $owner->id,
        'course_id' => $course->id,
        'certificate_number' => 'CERT-2026-0002-AAAAAA',
        'verification_code' => 'OTHERUSER0',
        'issued_at' => now(),
        'status' => 'issued',
    ]);

    $this->actingAs($stranger)
        ->get("/my-certificates/{$certificate->verification_code}/print")
        ->assertForbidden();
});

it('public verify page shows valid certificate as valid', function () {
    $user = User::factory()->create(['name' => 'Andi']);
    $course = Course::factory()->create(['title' => 'Excel Mastery']);

    $certificate = Certificate::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'certificate_number' => 'CERT-2026-0003-BBBBBB',
        'verification_code' => 'PUBVERIFY1',
        'issued_at' => now(),
        'status' => 'issued',
    ]);

    $this->get("/verify-certificate/{$certificate->verification_code}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/certificate-verify')
            ->where('isValid', true)
            ->where('certificate.certificate_number', 'CERT-2026-0003-BBBBBB')
        );
});

it('public verify page reports invalid for non-existent code', function () {
    $this->get('/verify-certificate/DOESNOTEXIST')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('isValid', false)
            ->where('certificate', null)
        );
});
