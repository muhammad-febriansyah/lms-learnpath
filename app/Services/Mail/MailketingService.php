<?php

namespace App\Services\Mail;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Klien HTTP untuk Mailketing.co.id transactional email API.
 * Endpoint: https://app.mailketing.co.id/api/v1/send (form-encoded).
 */
final class MailketingService
{
    private const ENDPOINT = 'https://app.mailketing.co.id/api/v1/send';

    public function send(
        string $to,
        string $subject,
        string $html,
        ?string $fromName = null,
        ?string $fromEmail = null,
    ): bool {
        $apiKey = (string) config('services.mailketing.api_key');

        if ($apiKey === '') {
            Log::warning('Mailketing API key missing; email not sent.', ['to' => $to, 'subject' => $subject]);

            return false;
        }

        $payload = [
            'api_token' => $apiKey,
            'from_name' => $fromName ?? (string) config('mail.from.name'),
            'from_email' => $fromEmail ?? (string) config('mail.from.address'),
            'recipient' => $to,
            'subject' => $subject,
            'content' => $html,
        ];

        try {
            /** @var Response $response */
            $response = Http::asForm()
                ->timeout(15)
                ->post(self::ENDPOINT, $payload);

            if (! $response->successful()) {
                Log::warning('Mailketing send failed', [
                    'to' => $to,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return false;
            }

            $body = $response->json();
            $statusKey = $body['status'] ?? null;

            // Mailketing returns {"status":"success"} on OK.
            if ($statusKey === 'success' || $response->status() === 200) {
                return true;
            }

            Log::warning('Mailketing returned non-success', [
                'to' => $to,
                'body' => $body,
            ]);

            return false;
        } catch (\Throwable $e) {
            Log::error('Mailketing send exception', [
                'to' => $to,
                'message' => $e->getMessage(),
            ]);

            return false;
        }
    }
}
