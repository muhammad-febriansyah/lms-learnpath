<?php

namespace App\Services\Security;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class RecaptchaVerifier
{
    /**
     * Verify a reCAPTCHA v3 token for the expected action.
     *
     * @throws ValidationException
     */
    public function verify(?string $token, string $action, ?string $ip = null): void
    {
        if (! $this->isEnabled()) {
            return;
        }

        if (! is_string($token) || trim($token) === '') {
            throw ValidationException::withMessages([
                'recaptcha_token' => 'Verifikasi reCAPTCHA gagal. Silakan coba lagi.',
            ]);
        }

        /** @var Response $response */
        $response = Http::asForm()
            ->acceptJson()
            ->timeout(10)
            ->retry(2, 200, throw: false)
            ->post((string) config('services.recaptcha.verify_url'), [
                'secret' => config('services.recaptcha.secret_key'),
                'response' => $token,
                'remoteip' => $ip,
            ]);

        if (! $response->successful()) {
            Log::warning('reCAPTCHA verification request failed.', [
                'status' => $response->status(),
                'body' => mb_substr($response->body(), 0, 500),
                'action' => $action,
            ]);

            throw ValidationException::withMessages([
                'recaptcha_token' => 'Verifikasi reCAPTCHA gagal. Silakan coba lagi.',
            ]);
        }

        $payload = $response->json();
        $score = (float) ($payload['score'] ?? 0);
        $resolvedAction = (string) ($payload['action'] ?? '');
        $minimumScore = (float) config('services.recaptcha.min_score', 0.5);

        if (
            ! ($payload['success'] ?? false)
            || $resolvedAction !== $action
            || $score < $minimumScore
        ) {
            Log::info('reCAPTCHA verification rejected.', [
                'action' => $action,
                'resolved_action' => $resolvedAction,
                'score' => $score,
                'minimum_score' => $minimumScore,
                'error_codes' => $payload['error-codes'] ?? [],
            ]);

            throw ValidationException::withMessages([
                'recaptcha_token' => 'Verifikasi reCAPTCHA gagal. Silakan coba lagi.',
            ]);
        }
    }

    public function isEnabled(): bool
    {
        return (bool) config('services.recaptcha.enabled')
            && filled(config('services.recaptcha.site_key'))
            && filled(config('services.recaptcha.secret_key'));
    }
}
