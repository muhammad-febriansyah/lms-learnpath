<?php

namespace App\Services\AI;

use App\Models\CourseDocument;
use App\Models\CourseDocumentChunk;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Chunks the document text, embeds each chunk via OpenAI, and persists.
 * Runs sync — caller is responsible for queueing if file is large.
 *
 * Chunk strategy: ~1000 char windows with 100 char overlap.
 * Cheap, simple, and adequate for English/Indonesian prose.
 */
final class DocumentIngestionService
{
    private const CHUNK_SIZE = 1000;

    private const CHUNK_OVERLAP = 100;

    public function __construct(
        private readonly EmbeddingService $embedder,
    ) {}

    public function ingest(CourseDocument $document, string $rawText): void
    {
        $text = $this->normalize($rawText);

        if ($text === '') {
            $document->forceFill([
                'status' => CourseDocument::STATUS_FAILED,
                'error_message' => 'Konten kosong setelah normalisasi.',
            ])->save();

            return;
        }

        $chunks = $this->chunkText($text);

        try {
            $result = $this->embedder->embedBatch($chunks);
            $embeddings = $result['embeddings'];

            DB::transaction(function () use ($document, $chunks, $embeddings, $result) {
                $document->chunks()->delete();

                foreach ($chunks as $i => $chunk) {
                    CourseDocumentChunk::create([
                        'course_document_id' => $document->id,
                        'chunk_index' => $i,
                        'content' => $chunk,
                        'embedding' => $embeddings[$i] ?? [],
                        'token_count' => 0,
                    ]);
                }

                $document->forceFill([
                    'status' => CourseDocument::STATUS_READY,
                    'error_message' => null,
                    'total_chunks' => count($chunks),
                    'total_tokens' => $result['total_tokens'],
                ])->save();
            });
        } catch (Throwable $e) {
            Log::warning('Document ingestion failed', [
                'document_id' => $document->id,
                'error' => $e->getMessage(),
            ]);
            $document->forceFill([
                'status' => CourseDocument::STATUS_FAILED,
                'error_message' => mb_substr($e->getMessage(), 0, 500),
            ])->save();
        }
    }

    /**
     * @return list<string>
     */
    public function chunkText(string $text): array
    {
        $length = mb_strlen($text);
        if ($length <= self::CHUNK_SIZE) {
            return [$text];
        }

        $chunks = [];
        $start = 0;
        while ($start < $length) {
            $piece = mb_substr($text, $start, self::CHUNK_SIZE);
            $piece = trim($piece);
            if ($piece !== '') {
                $chunks[] = $piece;
            }
            $start += self::CHUNK_SIZE - self::CHUNK_OVERLAP;
        }

        return $chunks;
    }

    private function normalize(string $text): string
    {
        $text = preg_replace('/\r\n?/', "\n", $text) ?? $text;
        $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $text) ?? $text;
        $text = preg_replace("/\n{3,}/", "\n\n", $text) ?? $text;

        return trim($text);
    }
}
