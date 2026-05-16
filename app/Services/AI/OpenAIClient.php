<?php

namespace App\Services\AI;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Thin HTTP client for OpenAI Chat Completions.
 * Endpoint: https://api.openai.com/v1/chat/completions
 *
 * Kept dependency-free (no SDK) per project policy.
 */
final class OpenAIClient
{
    private const ENDPOINT = 'https://api.openai.com/v1/chat/completions';

    /**
     * Send a chat completion request.
     *
     * @param  array<int, array{role: string, content: string}>  $messages
     * @return array{content: string, model: string, prompt_tokens: int, completion_tokens: int, total_tokens: int}
     */
    public function chat(array $messages, ?string $model = null, array $options = []): array
    {
        $apiKey = (string) config('services.openai.api_key');
        if ($apiKey === '') {
            throw new RuntimeException('OPENAI_API_KEY is not configured.');
        }

        $payload = array_merge([
            'model' => $model ?? config('services.openai.model', 'gpt-5'),
            'messages' => $messages,
        ], $options);

        /** @var Response $response */
        $response = Http::withToken($apiKey)
            ->acceptJson()
            ->timeout(60)
            ->retry(2, 500, throw: false)
            ->post(self::ENDPOINT, $payload);

        if (! $response->successful()) {
            $body = $response->body();
            Log::warning('OpenAI chat completion failed', [
                'status' => $response->status(),
                'body' => mb_substr($body, 0, 1000),
            ]);
            throw new RuntimeException(
                "OpenAI API error (HTTP {$response->status()}): ".mb_substr($body, 0, 200),
            );
        }

        $json = $response->json();
        $choice = $json['choices'][0] ?? null;
        $content = $choice['message']['content'] ?? null;

        if (! is_string($content) || $content === '') {
            throw new RuntimeException('OpenAI returned empty content.');
        }

        $usage = $json['usage'] ?? [];

        return [
            'content' => trim($content),
            'model' => (string) ($json['model'] ?? $payload['model']),
            'prompt_tokens' => (int) ($usage['prompt_tokens'] ?? 0),
            'completion_tokens' => (int) ($usage['completion_tokens'] ?? 0),
            'total_tokens' => (int) ($usage['total_tokens'] ?? 0),
        ];
    }
}
