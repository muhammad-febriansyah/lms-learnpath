<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Master switch
    |--------------------------------------------------------------------------
    | When false, the SecurityHeaders middleware does nothing. Useful for
    | local dev troubleshooting. Default: enabled.
    */
    'enabled' => env('SECURITY_HEADERS_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | HSTS
    |--------------------------------------------------------------------------
    | Strict-Transport-Security. Only attached when the request is HTTPS, so it
    | won't break local HTTP dev. Default: 1 year, include subdomains, preload.
    */
    'hsts' => [
        'enabled' => env('SECURITY_HSTS_ENABLED', true),
        'max_age' => env('SECURITY_HSTS_MAX_AGE', 31_536_000),
        'include_subdomains' => env('SECURITY_HSTS_SUBDOMAINS', true),
        'preload' => env('SECURITY_HSTS_PRELOAD', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Content-Security-Policy
    |--------------------------------------------------------------------------
    | Whitelist for external resources the app actually uses:
    |   - Google reCAPTCHA v3        (script + frame)
    |   - YouTube embeds             (frame)
    |   - DiceBear / UI-Avatars      (img)
    |   - Google favicons (s2)       (img)
    |   - Unsplash thumbnails        (img)
    |   - Google Fonts               (style + font)
    |   - Vite dev server / HMR ws   (script + connect) — only when APP_ENV != production
    */
    'csp' => [
        'enabled' => env('SECURITY_CSP_ENABLED', true),
        // Set to true to send Content-Security-Policy-Report-Only instead, for
        // safe rollout. Flip to false to enforce.
        'report_only' => env('SECURITY_CSP_REPORT_ONLY', false),
        // CSP is auto-skipped in local dev because Vite HMR fetches fonts from
        // ports / IPv6 literals that the CSP grammar can't whitelist. Flip
        // this to true to override and emit CSP even in local — useful when
        // testing the production CSP locally.
        'force_in_local' => env('SECURITY_CSP_FORCE_LOCAL', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Frame embedding
    |--------------------------------------------------------------------------
    | X-Frame-Options legacy header (CSP frame-ancestors handles modern browsers).
    | Values: SAMEORIGIN | DENY
    */
    'x_frame_options' => env('SECURITY_X_FRAME_OPTIONS', 'SAMEORIGIN'),

    /*
    |--------------------------------------------------------------------------
    | Referrer-Policy
    |--------------------------------------------------------------------------
    */
    'referrer_policy' => env('SECURITY_REFERRER_POLICY', 'strict-origin-when-cross-origin'),

    /*
    |--------------------------------------------------------------------------
    | Permissions-Policy
    |--------------------------------------------------------------------------
    | Disable powerful APIs we don't use. Allows camera/microphone only on
    | self (for future video features) — adjust as needed.
    */
    'permissions_policy' => env(
        'SECURITY_PERMISSIONS_POLICY',
        'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()'
    ),

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin policies
    |--------------------------------------------------------------------------
    | COOP isolates browsing context; CORP restricts who can load us as a
    | resource. Off by default because they can break legitimate embeds.
    */
    'cross_origin_opener_policy' => env('SECURITY_COOP', 'same-origin'),
    'cross_origin_resource_policy' => env('SECURITY_CORP', 'same-site'),

    /*
    |--------------------------------------------------------------------------
    | Paths to exclude (e.g., webhook endpoints that talk JSON to gateways)
    |--------------------------------------------------------------------------
    */
    'except' => [
        'api/webhooks/*',
        '_boost/*',
    ],
];
