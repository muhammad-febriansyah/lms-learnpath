<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Wraps OpenAI /v1/embeddings.
 *
 * Default model: text-embedding-3-small (1536 dimensions, cheap & accurate enough for RAG).
 */
final class EmbeddingService
{
    private const ENDPOINT = 'https://api.openai.com/v1/embeddings';

    private const DEFAULT_MODEL = 'text-embedding-3-small';

    /**
     * Embed multiple inputs in one call.
     *
     * @param  list<string>  $inputs
     * @return array{embeddings: list<list<float>>, model: string, total_tokens: int}
     */
    public function embedBatch(array $inputs, ?string $model = null): array
    {
        $inputs = array_values(array_filter(
            array_map(fn ($t) => trim((string) $t), $inputs),
            fn ($t) => $t !== '',
        ));

        if ($inputs === []) {
            return ['embeddings' => [], 'model' => $model ?? self::DEFAULT_MODEL, 'total_tokens' => 0];
        }

        $apiKey = (string) config('services.openai.api_key');
        if ($apiKey === '') {
            throw new RuntimeException('OPENAI_API_KEY is not configured.');
        }

        $payload = [
            'model' => $model ?? config('services.openai.embedding_model', self::DEFAULT_MODEL),
            'input' => $inputs,
        ];

        $response = Http::withToken($apiKey)
            ->acceptJson()
            ->timeout(60)
            ->retry(2, 500, throw: false)
            ->post(self::ENDPOINT, $payload);

        if (! $response->successful()) {
            Log::warning('OpenAI embeddings failed', [
                'status' => $response->status(),
                'body' => mb_substr($response->body(), 0, 1000),
            ]);
            throw new RuntimeException(
                "OpenAI embeddings error (HTTP {$response->status()}): ".mb_substr($response->body(), 0, 200),
            );
        }

        $json = $response->json();
        $embeddings = collect($json['data'] ?? [])
            ->sortBy('index')
            ->pluck('embedding')
            ->map(fn ($e) => array_map('floatval', (array) $e))
            ->values()
            ->all();

        return [
            'embeddings' => $embeddings,
            'model' => (string) ($json['model'] ?? $payload['model']),
            'total_tokens' => (int) ($json['usage']['total_tokens'] ?? 0),
        ];
    }

    /**
     * @return list<float>
     */
    public function embed(string $input, ?string $model = null): array
    {
        $result = $this->embedBatch([$input], $model);

        return $result['embeddings'][0] ?? [];
    }

    /**
     * Cosine similarity. Asumsi kedua vector punya dimensi yang sama.
     *
     * @param  list<float>  $a
     * @param  list<float>  $b
     */
    public static function cosine(array $a, array $b): float
    {
        $n = min(count($a), count($b));
        if ($n === 0) {
            return 0.0;
        }

        $dot = 0.0;
        $magA = 0.0;
        $magB = 0.0;
        for ($i = 0; $i < $n; $i++) {
            $dot += $a[$i] * $b[$i];
            $magA += $a[$i] * $a[$i];
            $magB += $b[$i] * $b[$i];
        }

        if ($magA === 0.0 || $magB === 0.0) {
            return 0.0;
        }

        return $dot / (sqrt($magA) * sqrt($magB));
    }
}
