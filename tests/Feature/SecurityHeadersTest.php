<?php

it('sends all required security headers on HTML responses', function () {
    config()->set('security.enabled', true);
    config()->set('security.csp.enabled', true);
    config()->set('security.csp.force_in_local', true);

    $response = $this->get('/login');

    $response->assertSuccessful();
    $response->assertHeader('X-Content-Type-Options', 'nosniff');
    $response->assertHeader('X-Frame-Options', 'SAMEORIGIN');
    $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    $response->assertHeader('Cross-Origin-Opener-Policy', 'same-origin');

    expect($response->headers->get('Permissions-Policy'))->toContain('camera=()');
    expect($response->headers->get('Content-Security-Policy'))
        ->toContain("default-src 'self'")
        ->toContain('frame-ancestors')
        ->toContain('https://www.youtube.com')
        ->toContain('https://www.google.com');
});

it('skips HSTS over plain HTTP', function () {
    $response = $this->get('/login');

    expect($response->headers->has('Strict-Transport-Security'))->toBeFalse();
});

it('emits HSTS over HTTPS', function () {
    $response = $this->get('https://localhost/login');

    expect($response->headers->get('Strict-Transport-Security'))
        ->toContain('max-age=')
        ->toContain('includeSubDomains');
});

it('uses report-only header when configured', function () {
    config()->set('security.csp.report_only', true);
    config()->set('security.csp.force_in_local', true);

    $response = $this->get('/login');

    expect($response->headers->has('Content-Security-Policy'))->toBeFalse();
    expect($response->headers->has('Content-Security-Policy-Report-Only'))->toBeTrue();
});

it('respects the master enabled switch', function () {
    config()->set('security.enabled', false);

    $response = $this->get('/login');

    expect($response->headers->has('X-Content-Type-Options'))->toBeFalse();
    expect($response->headers->has('Content-Security-Policy'))->toBeFalse();
});

it('auto-skips CSP in local env (still sends other headers)', function () {
    $this->app->detectEnvironment(fn () => 'local');
    config()->set('security.csp.force_in_local', false);

    $response = $this->get('/login');

    expect($response->headers->has('Content-Security-Policy'))->toBeFalse();
    expect($response->headers->has('Content-Security-Policy-Report-Only'))->toBeFalse();
    $response->assertHeader('X-Content-Type-Options', 'nosniff');
    $response->assertHeader('X-Frame-Options', 'SAMEORIGIN');
});
