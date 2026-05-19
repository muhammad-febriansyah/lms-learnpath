<?php

namespace App\Http\Middleware;

use App\Services\Security\RecaptchaVerifier;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyRecaptcha
{
    public function __construct(private readonly RecaptchaVerifier $verifier) {}

    /**
     * Verify reCAPTCHA v3 token for the action passed as the first middleware
     * parameter — e.g. ->middleware('recaptcha:forgot_password').
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $action = 'submit'): Response
    {
        $token = $request->input('recaptcha_token');
        $this->verifier->verify(is_string($token) ? $token : null, $action, $request->ip());

        return $next($request);
    }
}
