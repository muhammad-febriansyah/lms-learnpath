<?php

use Illuminate\Support\Facades\Http;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
    config()->set('services.recaptcha.site_key', null);
    config()->set('services.recaptcha.secret_key', null);
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
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
