<?php

use App\Models\InstructorProfile;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Laravel\Fortify\Features;

/**
 * Build the bare-minimum payload Fortify expects to create a mentor.
 *
 * @return array<string, mixed>
 */
function mentorRegisterPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Mentor One',
        'email' => 'mentor@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'intended_role' => 'instructor',
        'headline' => 'Senior Data Engineer at Tokopedia',
        'phone' => '+62 812 0000 0000',
        'expertise' => ['Data Science', 'Machine Learning'],
        'linkedin_url' => 'https://linkedin.com/in/mentor',
        'cv' => UploadedFile::fake()->create('cv.pdf', 200, 'application/pdf'),
    ], $overrides);
}

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
    config()->set('services.recaptcha.site_key', null);
    config()->set('services.recaptcha.secret_key', null);
    $this->seed(RolePermissionSeeder::class);
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register and are assigned the user_public role', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    $user = User::where('email', 'test@example.com')->first();
    expect($user)->not->toBeNull()
        ->and($user->hasRole('user_public'))->toBeTrue();
});

test('new users can register with a valid recaptcha token when recaptcha is enabled', function () {
    config()->set('services.recaptcha.enabled', true);
    config()->set('services.recaptcha.site_key', 'test-site-key');
    config()->set('services.recaptcha.secret_key', 'test-secret-key');

    Http::fake([
        'https://www.google.com/recaptcha/api/siteverify' => Http::response([
            'success' => true,
            'score' => 0.9,
            'action' => 'register',
        ]),
    ]);

    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'recaptcha@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'recaptcha_token' => 'register-token',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    Http::assertSent(fn ($request) => $request['response'] === 'register-token');
});

test('new users can not register without a valid recaptcha token when recaptcha is enabled', function () {
    config()->set('services.recaptcha.enabled', true);
    config()->set('services.recaptcha.site_key', 'test-site-key');
    config()->set('services.recaptcha.secret_key', 'test-secret-key');

    $response = $this->from(route('register'))->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'blocked@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertRedirect(route('register'));
    $response->assertSessionHasErrors('recaptcha_token');
    $this->assertGuest();
});

test('users can self-register as instructor when intended_role=instructor', function () {
    Storage::fake('local');

    $this->post(route('register.store'), mentorRegisterPayload())
        ->assertRedirect(route('auth.pending-approval'));

    $user = User::where('email', 'mentor@example.com')->first();
    expect($user)->not->toBeNull()
        ->and($user->hasRole('instructor'))->toBeTrue()
        ->and($user->hasRole('user_public'))->toBeFalse()
        ->and($user->status)->toBe(User::STATUS_PENDING_APPROVAL)
        ->and($user->phone)->toBe('+62 812 0000 0000');

    $profile = $user->instructorProfile;
    expect($profile)->not->toBeNull()
        ->and($profile->headline)->toBe('Senior Data Engineer at Tokopedia')
        ->and($profile->expertise)->toBe(['Data Science', 'Machine Learning'])
        ->and($profile->social_links['linkedin'] ?? null)->toBe('https://linkedin.com/in/mentor')
        ->and($profile->cv_path)->not->toBeNull()
        ->and($profile->cv_original_name)->toBe('cv.pdf')
        ->and($profile->is_verified)->toBeFalse()
        ->and($profile->is_active)->toBeFalse();

    Storage::disk('local')->assertExists($profile->cv_path);

    // Instructor must NOT be auto-logged-in after register.
    $this->assertGuest();
});

test('mentor registration requires headline, phone, expertise, linkedin and CV', function () {
    Storage::fake('local');

    $response = $this->from(route('register'))->post(route('register.store'), [
        'name' => 'Incomplete Mentor',
        'email' => 'incomplete@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'intended_role' => 'instructor',
    ]);

    $response->assertSessionHasErrors(['headline', 'phone', 'expertise', 'linkedin_url', 'cv']);
    expect(User::where('email', 'incomplete@example.com')->exists())->toBeFalse();
});

test('mentor registration rejects non-PDF CV uploads', function () {
    Storage::fake('local');

    $response = $this->from(route('register'))->post(route('register.store'), mentorRegisterPayload([
        'email' => 'wrong-format@example.com',
        'cv' => UploadedFile::fake()->image('cv.png'),
    ]));

    $response->assertSessionHasErrors('cv');
    expect(User::where('email', 'wrong-format@example.com')->exists())->toBeFalse();
});

test('intended_role is rejected when not in the allowed list', function () {
    $response = $this->from(route('register'))->post(route('register.store'), [
        'name' => 'Test',
        'email' => 'evil@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'intended_role' => 'superadmin',
    ]);

    $response->assertSessionHasErrors('intended_role');
    expect(User::where('email', 'evil@example.com')->exists())->toBeFalse();
});

test('intended_role defaults to user_public when not provided', function () {
    $this->post(route('register.store'), [
        'name' => 'Default',
        'email' => 'default@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertRedirect(route('dashboard', absolute: false));

    $user = User::where('email', 'default@example.com')->first();
    expect($user->hasRole('user_public'))->toBeTrue();
});

test('user_public is redirected to verify email after self registration', function () {
    $this->post(route('register.store'), [
        'name' => 'Dashboard User',
        'email' => 'dashboard-user@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'intended_role' => 'user_public',
    ])->assertRedirect(route('dashboard', absolute: false));

    // With MustVerifyEmail enabled, accessing protected routes redirects to verify.
    $this->get(route('dashboard'))->assertRedirect(route('verification.notice'));
});

test('user_public can access dashboard after email verification', function () {
    $this->post(route('register.store'), [
        'name' => 'Verified User',
        'email' => 'verified-user@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'intended_role' => 'user_public',
    ]);

    $user = User::where('email', 'verified-user@example.com')->firstOrFail();
    $user->forceFill(['email_verified_at' => now()])->save();

    $this->actingAs($user->fresh())
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard-user-public'));
});

test('instructor is redirected to pending-approval after self registration', function () {
    Storage::fake('local');

    $this->post(route('register.store'), mentorRegisterPayload([
        'name' => 'Pending Instructor',
        'email' => 'pending-instructor@example.com',
    ]))->assertRedirect(route('auth.pending-approval'));

    $this->assertGuest();

    // Even with correct password, pending instructor cannot login.
    $this->post(route('login'), [
        'email' => 'pending-instructor@example.com',
        'password' => 'password',
    ])->assertSessionHasErrors('email');

    $this->assertGuest();
});

test('approved instructor can login and reach admin dashboard', function () {
    Storage::fake('local');

    $this->post(route('register.store'), mentorRegisterPayload([
        'name' => 'Approved Instructor',
        'email' => 'approved-instructor@example.com',
    ]))->assertRedirect(route('auth.pending-approval'));

    $user = User::where('email', 'approved-instructor@example.com')->firstOrFail();
    $user->forceFill([
        'status' => User::STATUS_ACTIVE,
        'email_verified_at' => now(),
    ])->save();

    $this->post(route('login'), [
        'email' => 'approved-instructor@example.com',
        'password' => 'password',
    ])->assertRedirect(route('dashboard', absolute: false));

    $this->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/dashboard-mentor'));
});

test('admin can download mentor CV via private disk', function () {
    Storage::fake('local');

    $this->post(route('register.store'), mentorRegisterPayload([
        'email' => 'cv-mentor@example.com',
    ]));

    $mentor = User::where('email', 'cv-mentor@example.com')->firstOrFail();

    $admin = User::factory()->create(['status' => User::STATUS_ACTIVE]);
    $admin->assignRole('superadmin');

    $this->actingAs($admin)
        ->get(route('admin.instructors.cv.download', $mentor))
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});

test('non-admin cannot download mentor CV', function () {
    Storage::fake('local');

    $this->post(route('register.store'), mentorRegisterPayload([
        'email' => 'cv-private@example.com',
    ]));

    $mentor = User::where('email', 'cv-private@example.com')->firstOrFail();

    $public = User::factory()->create(['status' => User::STATUS_ACTIVE]);
    $public->assignRole('user_public');

    $this->actingAs($public)
        ->get(route('admin.instructors.cv.download', $mentor))
        ->assertForbidden();
});

test('mentor onboarding form is shown to Google-registered pending mentor', function () {
    $user = User::factory()->create([
        'status' => User::STATUS_PENDING_APPROVAL,
        'email_verified_at' => now(),
    ]);
    $user->assignRole('instructor');

    $this->actingAs($user)
        ->get(route('mentor.onboarding.show'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('auth/mentor-onboarding'));
});

test('mentor onboarding stores profile and logs the user out', function () {
    Storage::fake('local');

    $user = User::factory()->create([
        'status' => User::STATUS_PENDING_APPROVAL,
        'email_verified_at' => now(),
    ]);
    $user->assignRole('instructor');

    $this->actingAs($user)
        ->post(route('mentor.onboarding.store'), [
            'headline' => 'Senior Frontend Engineer',
            'phone' => '+62 812 1111 2222',
            'expertise' => ['React', 'TypeScript'],
            'linkedin_url' => 'https://linkedin.com/in/onboarding',
            'cv' => UploadedFile::fake()->create('resume.pdf', 100, 'application/pdf'),
        ])
        ->assertRedirect(route('auth.pending-approval'));

    $this->assertGuest();

    $profile = InstructorProfile::where('user_id', $user->id)->first();
    expect($profile)->not->toBeNull()
        ->and($profile->headline)->toBe('Senior Frontend Engineer')
        ->and($profile->expertise)->toBe(['React', 'TypeScript'])
        ->and($profile->cv_path)->not->toBeNull();
});

test('mentor onboarding rejects user_public and active mentors', function () {
    $publicUser = User::factory()->create(['status' => User::STATUS_ACTIVE]);
    $publicUser->assignRole('user_public');

    $this->actingAs($publicUser)
        ->get(route('mentor.onboarding.show'))
        ->assertRedirect(route('dashboard'));

    $activeInstructor = User::factory()->create(['status' => User::STATUS_ACTIVE]);
    $activeInstructor->assignRole('instructor');

    $this->actingAs($activeInstructor)
        ->get(route('mentor.onboarding.show'))
        ->assertRedirect(route('dashboard'));
});
