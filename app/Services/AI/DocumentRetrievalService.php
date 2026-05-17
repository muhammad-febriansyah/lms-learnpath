<?php

namespace App\Services\AI;

use App\Models\Course;
use App\Models\CourseDocument;
use App\Models\CourseDocumentChunk;
use Illuminate\Support\Collection;

/**
 * Retrieves the most relevant document chunks for a query within a course.
 *
 * MySQL-friendly (no pgvector): loads ready chunks into memory and computes
 * cosine in PHP. Fine up to a few thousand chunks per course — for larger
 * corpora we'd switch to a real vector store.
 */
final class DocumentRetrievalService
{
    public function __construct(
        private readonly EmbeddingService $embedder,
    ) {}

    /**
     * @return Collection<int, array{document: CourseDocument, chunk: CourseDocumentChunk, score: float}>
     */
    public function retrieveForCourse(Course $course, string $query, int $topK = 3): Collection
    {
        $query = trim($query);
        if ($query === '') {
            return collect();
        }

        $documents = CourseDocument::query()
            ->where('course_id', $course->id)
            ->where('status', CourseDocument::STATUS_READY)
            ->with(['chunks' => fn ($q) => $q->orderBy('chunk_index')])
            ->get();

        if ($documents->isEmpty()) {
            return collect();
        }

        $queryEmbedding = $this->embedder->embed($query);
        if ($queryEmbedding === []) {
            return collect();
        }

        $scored = collect();
        foreach ($documents as $doc) {
            foreach ($doc->chunks as $chunk) {
                $embedding = $chunk->embedding;
                if (! is_array($embedding) || $embedding === []) {
                    continue;
                }
                $score = EmbeddingService::cosine($queryEmbedding, $embedding);
                $scored->push([
                    'document' => $doc,
                    'chunk' => $chunk,
                    'score' => $score,
                ]);
            }
        }

        return $scored
            ->sortByDesc('score')
            ->take($topK)
            ->values();
    }
}
