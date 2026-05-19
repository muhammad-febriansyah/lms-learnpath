<?php

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    config()->set('services.google.client_id', 'test-client-id.apps.googleusercontent.com');
    config()->set('services.google.client_secret', 'test-secret');
});

function fakeGoogleHttp(array $tokenInfo = [], bool $tokenOk = true): void
{
    $payload = array_merge([
        'aud' => 'test-client-id.apps.googleusercontent.com',
        'email' => 'tester@example.com',
        'email_verified' => true,
        'name' => 'Test Person',
    ], $tokenInfo);

    Http::fake([
        'oauth2.googleapis.com/token' => Http::response($tokenOk ? ['id_token' => 'fake.id.token'] : [], $tokenOk ? 200 : 400),
        'oauth2.googleapis.com/tokeninfo*' => Http::response($payload),
    ]);
}

it('redirects to Google with a state cookie and stored intent', function () {
    $response = $this->get('/auth/google?intent=register&role=instructor');

    $response->assertStatus(302);
    expect($response->headers->get('Location'))->toContain('accounts.google.com/o/oauth2/v2/auth');

    expect(session('google_oauth_state'))->not->toBeNull();
    expect(session('google_oauth_intent'))->toBe('register');
    expect(session('google_oauth_role'))->toBe('instructor');
});

it('falls back to user_public when an invalid role is requested', function () {
    $this->get('/auth/google?intent=register&role=superadmin');

    expect(session('google_oauth_role'))->toBe('user_public');
});

it('logs in an existing user via Google callback', function () {
    $user = User::factory()->create([
        'email' => 'existing@example.com',
        'email_verified_at' => now(),
    ]);
    $user->assignRole('user_public');

    fakeGoogleHttp(['email' => 'existing@example.com']);

    $response = $this->withSession([
        'google_oauth_state' => 'state-abc',
        'google_oauth_intent' => 'login',
        'google_oauth_role' => 'user_public',
    ])->get('/auth/google/callback?state=state-abc&code=fake-code');

    $response->assertRedirect();
    $this->assertAuthenticatedAs($user);
});

it('creates a new instructor when callback comes from register intent with role=instructor', function () {
    fakeGoogleHttp(['email' => 'newmentor@example.com', 'name' => 'New Mentor']);

    $this->withSession([
        'google_oauth_state' => 'state-xyz',
        'google_oauth_intent' => 'register',
        'google_oauth_role' => 'instructor',
    ])->get('/auth/google/callback?state=state-xyz&code=fake-code')
        ->assertRedirect();

    $user = User::where('email', 'newmentor@example.com')->first();
    expect($user)->not->toBeNull()
        ->and($user->hasRole('instructor'))->toBeTrue()
        ->and($user->email_verified_at)->not->toBeNull();
});

it('creates a new user_public account from Google register and can open learner dashboard', function () {
    fakeGoogleHttp(['email' => 'newpublic@example.com', 'name' => 'New Public']);

    $this->withSession([
        'google_oauth_state' => 'state-public',
        'google_oauth_intent' => 'register',
        'google_oauth_role' => 'user_public',
    ])->get('/auth/google/callback?state=state-public&code=fake-code')
        ->assertRedirect(route('dashboard', absolute: false));

    $user = User::where('email', 'newpublic@example.com')->first();

    expect($user)->not->toBeNull()
        ->and($user->hasRole('user_public'))->toBeTrue();

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard-user-public'));
});

it('routes new Google mentor to onboarding with pending_approval status', function () {
    fakeGoogleHttp(['email' => 'googlementor@example.com', 'name' => 'Google Mentor']);

    $this->withSession([
        'google_oauth_state' => 'state-mentor',
        'google_oauth_intent' => 'register',
        'google_oauth_role' => 'instructor',
    ])->get('/auth/google/callback?state=state-mentor&code=fake-code')
        ->assertRedirect(route('mentor.onboarding.show'));

    $user = User::where('email', 'googlementor@example.com')->first();

    expect($user)->not->toBeNull()
        ->and($user->hasRole('instructor'))->toBeTrue()
        ->and($user->status)->toBe(User::STATUS_PENDING_APPROVAL);

    // The onboarding page itself is reachable while the form is unfilled.
    $this->get(route('mentor.onboarding.show'))->assertOk();
});

it('refuses to create a new user with login intent', function () {
    fakeGoogleHttp(['email' => 'unknown@example.com']);

    $this->withSession([
        'google_oauth_state' => 'state-1',
        'google_oauth_intent' => 'login',
        'google_oauth_role' => 'user_public',
    ])->get('/auth/google/callback?state=state-1&code=fake-code')
        ->assertRedirect(route('login'))
        ->assertSessionHasErrors('google');

    $this->assertGuest();
    expect(User::where('email', 'unknown@example.com')->exists())->toBeFalse();
});

it('rejects mismatched audience', function () {
    fakeGoogleHttp(['aud' => 'someone-else.apps.googleusercontent.com']);

    $this->withSession([
        'google_oauth_state' => 'state-aud',
        'google_oauth_intent' => 'login',
    ])->get('/auth/google/callback?state=state-aud&code=fake-code')
        ->assertSessionHasErrors('google');

    $this->assertGuest();
});

it('rejects unverified email', function () {
    fakeGoogleHttp(['email_verified' => false]);

    $this->withSession([
        'google_oauth_state' => 'state-uv',
        'google_oauth_intent' => 'register',
        'google_oauth_role' => 'user_public',
    ])->get('/auth/google/callback?state=state-uv&code=fake-code')
        ->assertSessionHasErrors('google');

    $this->assertGuest();
});

it('rejects mismatched state (CSRF guard)', function () {
    $this->withSession([
        'google_oauth_state' => 'expected-state',
        'google_oauth_intent' => 'login',
    ])->get('/auth/google/callback?state=different-state&code=fake-code')
        ->assertRedirect(route('login'))
        ->assertSessionHasErrors('google');

    $this->assertGuest();
});
