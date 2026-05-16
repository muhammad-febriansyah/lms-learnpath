<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'pakasir' => [
        'base_url' => env('PAKASIR_BASE_URL', 'https://app.pakasir.com'),
        'project' => env('PAKASIR_PROJECT'),
        'api_key' => env('PAKASIR_API_KEY'),
        'sandbox' => (bool) env('PAKASIR_SANDBOX', false),
        'webhook_secret' => env('PAKASIR_WEBHOOK_SECRET'),
        'allowed_ips' => array_filter(explode(',', (string) env('PAKASIR_ALLOWED_IPS', ''))),
    ],

    'google' => [
        'client_id' => env('GOOGLE_LOGIN_CLIENT_ID'),
        'client_secret' => env('GOOGLE_LOGIN_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_LOGIN_REDIRECT_URI'),
    ],

    'openai' => [
        'api_key' => env('OPENAI_API_KEY'),
        'model' => env('OPENAI_MODEL', 'gpt-5'),
        'daily_message_limit' => env('OPENAI_DAILY_MESSAGE_LIMIT', 50),
        'daily_token_limit' => env('OPENAI_DAILY_TOKEN_LIMIT', 100000),
    ],

    'mailketing' => [
        'api_key' => env('MAILKETING_API_KEY'),
    ],

    'recaptcha' => [
        'enabled' => env('RECAPTCHA_ENABLED', env('APP_ENV') === 'production'),
        'site_key' => env('RECAPTCHA_SITE_KEY'),
        'secret_key' => env('RECAPTCHA_SECRET_KEY'),
        'min_score' => (float) env('RECAPTCHA_MIN_SCORE', 0.5),
        'verify_url' => env('RECAPTCHA_VERIFY_URL', 'https://www.google.com/recaptcha/api/siteverify'),
    ],

];
