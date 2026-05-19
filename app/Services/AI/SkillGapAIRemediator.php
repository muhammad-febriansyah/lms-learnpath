<?php

namespace App\Services\AI;

use App\Models\Course;
use App\Models\CourseCompetencyMapping;
use App\Models\SkillGap;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Asks OpenAI to pick 2-3 internal courses that best close a given skill gap.
 *
 * Strategy:
 *  1. Pull all published courses mapped to the gap's competency
 *     (via CourseCompetencyMapping). If none — fall back to all published
 *     courses (broader recommendation pool).
 *  2. Send compact catalog (id, title, level, summary) to OpenAI with
 *     gap metadata (target/actual level, role, gap size).
 *  3. Expect JSON back: { recommendations: [{course_id, rationale, order}], summary }.
 *  4. Resolve course_id → ensure they exist in catalog (defensive),
 *     then persist on the SkillGap.
 */
final class SkillGapAIRemediator
{
    public function __construct(
        private readonly OpenAIClient $client,
    ) {}

    /**
     * @return array{
     *   summary: string,
     *   recommendations: list<array{course_id:int, title:string, slug:string, rationale:string, order:int}>,
     *   generated_at: string
     * }
     */
    public function remediate(SkillGap $gap): array
    {
        $gap->loadMissing(['user:id,name', 'position:id,name', 'competency:id,name,category']);

        $catalog = $this->candidateCatalog($gap);
        if ($catalog->isEmpty()) {
            $payload = [
                'summary' => 'Belum ada course di katalog yang tertaut dengan kompetensi ini. HR perlu menambahkan course atau memetakan course existing ke kompetensi.',
                'recommendations' => [],
                'generated_at' => now()->toIso8601String(),
            ];
            $gap->forceFill([
                'ai_recommendation' => $payload,
                'ai_recommended_at' => now(),
            ])->save();

            return $payload;
        }

        $messages = $this->buildPrompt($gap, $catalog);
        $response = $this->client->chat($messages, options: [
            'response_format' => ['type' => 'json_object'],
        ]);

        $parsed = $this->parseResponse($response['content'], $catalog);

        $payload = [
            'summary' => $parsed['summary'],
            'recommendations' => $parsed['recommendations'],
            'generated_at' => now()->toIso8601String(),
        ];

        $gap->forceFill([
            'ai_recommendation' => $payload,
            'ai_recommended_at' => now(),
        ])->save();

        return $payload;
    }

    /**
     * @return Collection<int, Course>
     */
    private function candidateCatalog(SkillGap $gap): Collection
    {
        $courseIds = CourseCompetencyMapping::query()
            ->where('competency_id', $gap->competency_id)
            ->pluck('course_id');

        $query = Course::query()
            ->where('is_published', true)
            ->select(['id', 'title', 'slug', 'subtitle', 'level']);

        if ($courseIds->isNotEmpty()) {
            $query->whereIn('id', $courseIds);
        }

        return $query->limit(20)->get();
    }

    /**
     * @param  Collection<int, Course>  $catalog
     * @return list<array{role: string, content: string}>
     */
    private function buildPrompt(SkillGap $gap, Collection $catalog): array
    {
        $catalogJson = $catalog->map(fn (Course $c) => [
            'id' => $c->id,
            'title' => $c->title,
            'level' => $c->level,
            'summary' => $c->subtitle ?: 'Tidak ada ringkasan.',
        ])->values()->toJson(JSON_UNESCAPED_UNICODE);

        $system = <<<'TXT'
Anda adalah Learning Advisor di sebuah LMS perusahaan. Tugas Anda: memilih 2-3 course internal yang paling tepat untuk menutup skill gap seorang karyawan.

ATURAN:
- Pilih maksimum 3 course, minimum 1 (jika ada di katalog).
- Urutkan dari yang paling fundamental ke yang advanced (sesuai gap).
- Berikan rationale singkat (1-2 kalimat per course) yang menjelaskan KENAPA course ini cocok untuk gap ini.
- Tulis summary 1-2 kalimat sebagai opening.
- Jawab dalam Bahasa Indonesia.
- Hanya pakai course dari katalog yang diberikan — JANGAN mengarang ID atau judul.
- Output WAJIB JSON dengan struktur:
  {
    "summary": "...",
    "recommendations": [
      {"course_id": <int>, "rationale": "...", "order": 1},
      {"course_id": <int>, "rationale": "...", "order": 2}
    ]
  }
TXT;

        $user = sprintf(
            "DATA GAP\n- Karyawan: %s\n- Jabatan: %s\n- Kompetensi: %s (kategori: %s)\n- Level target: %d\n- Level aktual: %d\n- Gap: %d (semakin besar = semakin urgent)\n\nKATALOG COURSE TERSEDIA:\n%s",
            $gap->user?->name ?? '-',
            $gap->position?->name ?? '-',
            $gap->competency?->name ?? '-',
            $gap->competency?->category ?? '-',
            $gap->target_level,
            $gap->actual_level,
            $gap->gap,
            $catalogJson,
        );

        return [
            ['role' => 'system', 'content' => $system],
            ['role' => 'user', 'content' => $user],
        ];
    }

    /**
     * @param  Collection<int, Course>  $catalog
     * @return array{summary: string, recommendations: list<array{course_id:int, title:string, slug:string, rationale:string, order:int}>}
     */
    private function parseResponse(string $content, Collection $catalog): array
    {
        try {
            $decoded = json_decode($content, true, flags: JSON_THROW_ON_ERROR);
        } catch (Throwable $e) {
            Log::warning('SkillGap AI response JSON parse failed', ['content' => mb_substr($content, 0, 500)]);

            return ['summary' => 'AI tidak dapat memformat rekomendasi. Coba lagi.', 'recommendations' => []];
        }

        $summary = (string) ($decoded['summary'] ?? '');
        $catalogById = $catalog->keyBy('id');

        $recommendations = collect($decoded['recommendations'] ?? [])
            ->map(function ($r) use ($catalogById) {
                $courseId = (int) ($r['course_id'] ?? 0);
                $course = $catalogById->get($courseId);
                if (! $course) {
                    return null;
                }

                return [
                    'course_id' => $courseId,
                    'title' => (string) $course->title,
                    'slug' => (string) $course->slug,
                    'rationale' => (string) ($r['rationale'] ?? ''),
                    'order' => (int) ($r['order'] ?? 0),
                ];
            })
            ->filter()
            ->sortBy('order')
            ->values()
            ->all();

        return [
            'summary' => $summary,
            'recommendations' => $recommendations,
        ];
    }
}
