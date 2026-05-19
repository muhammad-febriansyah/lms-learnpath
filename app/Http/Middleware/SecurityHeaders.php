<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Attaches modern security response headers (HSTS, CSP, X-Frame-Options,
 * X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COOP, CORP).
 *
 * Targets an "A" grade on https://securityheaders.com. Tuned for the actual
 * external resources this app uses — YouTube embeds, Google reCAPTCHA v3,
 * Unsplash thumbnails, DiceBear / UI-Avatars / Google favicon, Google Fonts.
 *
 * In local (non-HTTPS) dev, HSTS is skipped automatically and Vite dev server
 * / HMR WebSocket origins are allowed in CSP.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        if (! config('security.enabled', true)) {
            return $response;
        }

        foreach ((array) config('security.except', []) as $pattern) {
            if ($request->is($pattern)) {
                return $response;
            }
        }

        $contentType = (string) $response->headers->get('Content-Type', '');
        $isHtml = $contentType === '' || str_contains(strtolower($contentType), 'text/html');

        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');

        $this->applyHsts($request, $response);
        $this->applyFraming($response);
        $this->applyContentTypeOptions($response);
        $this->applyReferrerPolicy($response);
        $this->applyPermissionsPolicy($response);
        $this->applyCrossOriginPolicies($response);

        if ($isHtml) {
            $this->applyCsp($response);
        }

        return $response;
    }

    private function applyHsts(Request $request, Response $response): void
    {
        if (! config('security.hsts.enabled', true)) {
            return;
        }

        // Browsers ignore HSTS over HTTP and securityheaders.com would flag it.
        if (! $request->isSecure()) {
            return;
        }

        $maxAge = (int) config('security.hsts.max_age', 31_536_000);
        $value = "max-age={$maxAge}";

        if (config('security.hsts.include_subdomains', true)) {
            $value .= '; includeSubDomains';
        }

        if (config('security.hsts.preload', true)) {
            $value .= '; preload';
        }

        $response->headers->set('Strict-Transport-Security', $value);
    }

    private function applyFraming(Response $response): void
    {
        $value = (string) config('security.x_frame_options', 'SAMEORIGIN');
        if ($value !== '') {
            $response->headers->set('X-Frame-Options', $value);
        }
    }

    private function applyContentTypeOptions(Response $response): void
    {
        $response->headers->set('X-Content-Type-Options', 'nosniff');
    }

    private function applyReferrerPolicy(Response $response): void
    {
        $value = (string) config('security.referrer_policy', 'strict-origin-when-cross-origin');
        if ($value !== '') {
            $response->headers->set('Referrer-Policy', $value);
        }
    }

    private function applyPermissionsPolicy(Response $response): void
    {
        $value = (string) config('security.permissions_policy', '');
        if ($value !== '') {
            $response->headers->set('Permissions-Policy', $value);
        }
    }

    private function applyCrossOriginPolicies(Response $response): void
    {
        $coop = (string) config('security.cross_origin_opener_policy', '');
        if ($coop !== '') {
            $response->headers->set('Cross-Origin-Opener-Policy', $coop);
        }

        $corp = (string) config('security.cross_origin_resource_policy', '');
        if ($corp !== '') {
            $response->headers->set('Cross-Origin-Resource-Policy', $corp);
        }
    }

    private function applyCsp(Response $response): void
    {
        if (! config('security.csp.enabled', true)) {
            return;
        }

        // Skip CSP entirely in local dev: Vite's HMR fetches fonts/scripts from
        // dynamic ports and sometimes the IPv6 literal `[::1]`, which the CSP
        // host-source grammar doesn't support. Production still enforces.
        if (app()->environment('local') && ! config('security.csp.force_in_local', false)) {
            return;
        }

        // Inertia + React inject inline JSON / runtime — 'unsafe-inline' on
        // script-src is required. Upgrading to a nonce-based CSP would need a
        // custom Vite plugin and Inertia render tweaks; out of scope.
        $isLocalDev = app()->environment('local');

        // Vite dev server (HMR, fonts, HMR ws) — only attached when running locally.
        $viteOrigins = 'http://[::1]:5173 http://127.0.0.1:5173 http://localhost:5173';
        $viteWs = 'ws://[::1]:5173 ws://127.0.0.1:5173 ws://localhost:5173';
        $viteHttp = $isLocalDev ? $viteOrigins : null;
        $viteSocket = $isLocalDev ? $viteWs : null;

        $youtube = 'https://www.youtube.com https://www.youtube-nocookie.com';
        $recaptcha = 'https://www.google.com https://www.gstatic.com https://www.recaptcha.net';
        $gFonts = 'https://fonts.googleapis.com https://fonts.gstatic.com';

        $imgSources = implode(' ', array_filter([
            "'self'",
            'data:',
            'blob:',
            'https://images.unsplash.com',
            'https://api.dicebear.com',
            'https://ui-avatars.com',
            'https://www.google.com',
            'https://www.gstatic.com',
            'https://lh3.googleusercontent.com',
            'https://avatars.githubusercontent.com',
            $viteHttp,
        ]));

        $scriptSources = implode(' ', array_filter([
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            $recaptcha,
            $viteHttp,
        ]));

        $connectSources = implode(' ', array_filter([
            "'self'",
            $recaptcha,
            $viteHttp,
            $viteSocket,
        ]));

        $styleSources = implode(' ', array_filter([
            "'self'",
            "'unsafe-inline'",
            $gFonts,
            $viteHttp,
        ]));

        $fontSources = implode(' ', array_filter([
            "'self'",
            'data:',
            $gFonts,
            $viteHttp,
        ]));

        $frameSources = implode(' ', [
            "'self'",
            $youtube,
            $recaptcha,
        ]);

        $directives = [
            "default-src 'self'",
            "script-src {$scriptSources}",
            "style-src {$styleSources}",
            "font-src {$fontSources}",
            "img-src {$imgSources}",
            "media-src 'self' blob:",
            "connect-src {$connectSources}",
            "frame-src {$frameSources}",
            "frame-ancestors 'self'",
            "form-action 'self'",
            "base-uri 'self'",
            "object-src 'none'",
        ];

        // upgrade-insecure-requests only when actually on HTTPS — otherwise
        // it forces the browser to rewrite localhost:5173 to https and break.
        if (! $isLocalDev) {
            $directives[] = 'upgrade-insecure-requests';
        }

        $header = config('security.csp.report_only', false)
            ? 'Content-Security-Policy-Report-Only'
            : 'Content-Security-Policy';

        $response->headers->set($header, implode('; ', $directives));
    }
}
