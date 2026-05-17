<?php

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Fortify\Features;

beforeEach(function () {
    config()->set('services.recaptcha.site_key', null);
    config()->set('services.recaptcha.secret_key', null);
});

test('login screen can be rendered', function () {
    $response = $this->get(route('login'));

    $response->assertOk();
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('users with two factor enabled are redirected to two factor challenge', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $user = User::factory()->withTwoFactor()->create();

    $response = $this->post(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('two-factor.login'));
    $response->assertSessionHas('login.id', $user->id);
    $this->assertGuest();
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('logout'));

    $response->assertRedirect(route('home'));

    $this->assertGuest();
});

test('users are rate limited', function () {
    $user = User::factory()->create();

    RateLimiter::increment(md5('login'.implode('|', [$user->email, '127.0.0.1'])), amount: 5);

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $response->assertTooManyRequests();
});

test('users can authenticate with a valid recaptcha token when recaptcha is enabled', function () {
    config()->set('services.recaptcha.enabled', true);
    config()->set('services.recaptcha.site_key', 'test-site-key');
    config()->set('services.recaptcha.secret_key', 'test-secret-key');

    Http::fake([
        'https://www.google.com/recaptcha/api/siteverify' => Http::response([
            'success' => true,
            'score' => 0.9,
            'action' => 'login',
        ]),
    ]);

    $user = User::factory()->create();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
        'recaptcha_token' => 'login-token',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    Http::assertSent(fn ($request) => $request['response'] === 'login-token' && $request['remoteip'] === '127.0.0.1');
});

test('users can not authenticate without a valid recaptcha token when recaptcha is enabled', function () {
    config()->set('services.recaptcha.enabled', true);
    config()->set('services.recaptcha.site_key', 'test-site-key');
    config()->set('services.recaptcha.secret_key', 'test-secret-key');

    $user = User::factory()->create();

    $response = $this->from(route('login'))->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('login'));
    $response->assertSessionHasErrors('recaptcha_token');
    $this->assertGuest();
});

test('recaptcha token is verified only once per request even when fortify pipeline calls authenticateUsing twice', function () {
    config()->set('services.recaptcha.enabled', true);
    config()->set('services.recaptcha.site_key', 'test-site-key');
    config()->set('services.recaptcha.secret_key', 'test-secret-key');

    Http::fake([
        'https://www.google.com/recaptcha/api/siteverify' => Http::response([
            'success' => true,
            'score' => 0.9,
            'action' => 'login',
        ]),
    ]);

    $user = User::factory()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
        'recaptcha_token' => 'single-use-token',
    ]);

    $this->assertAuthenticated();

    Http::assertSentCount(1);
});
