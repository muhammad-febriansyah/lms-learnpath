<?php

namespace App\Services\AI;

use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

/**
 * Asks OpenAI to generate multiple-choice quiz questions from a piece of
 * source material (a lesson or a hand-pasted blob).
 *
 * Returns NOT persisted — caller (controller) shows the instructor a
 * preview, lets them edit, then calls the bulk-store endpoint.
 */
class QuizGenerator
{
    public function __construct(
        private readonly OpenAIClient $client,
    ) {}

    /**
     * @return list<array{question:string, options:list<string>, correct_index:int, explanation:string}>
     */
    public function generate(
        Course $course,
        ?Lesson $lesson,
        string $extraContext,
        int $count = 5,
        string $difficulty = 'medium',
    ): array {
        $count = max(1, min(10, $count));

        $source = $this->resolveSource($course, $lesson, $extraContext);
        if (mb_strlen($source) < 60) {
            throw new RuntimeException('Materi sumber terlalu pendek untuk generate quiz. Tambah konten dulu atau paste teks tambahan.');
        }

        $messages = $this->buildPrompt($course, $lesson, $source, $count, $difficulty);
        $response = $this->client->chat($messages, options: [
            'response_format' => ['type' => 'json_object'],
        ]);

        return $this->parseResponse($response['content']);
    }

    private function resolveSource(Course $course, ?Lesson $lesson, string $extraContext): string
    {
        $parts = [];
        $parts[] = "Course: {$course->title}";

        if ($lesson) {
            $parts[] = "Lesson: {$lesson->title}";
            if ($lesson->description) {
                $parts[] = 'Lesson description: '.$lesson->description;
            }
            if ($lesson->content && is_string($lesson->content)) {
                $parts[] = 'Lesson content: '.mb_substr(strip_tags($lesson->content), 0, 4000);
            }
        }

        if (trim($extraContext) !== '') {
            $parts[] = 'Tambahan konteks instructor: '.mb_substr($extraContext, 0, 4000);
        }

        return implode("\n\n", $parts);
    }

    /**
     * @return list<array{role:string, content:string}>
     */
    private function buildPrompt(Course $course, ?Lesson $lesson, string $source, int $count, string $difficulty): array
    {
        $difficultyLabel = match ($difficulty) {
            'easy' => 'mudah (recall fakta dasar)',
            'hard' => 'sulit (apply / analisis)',
            default => 'sedang (pemahaman konseptual)',
        };

        $system = <<<TXT
Anda adalah penyusun soal di sebuah LMS profesional. Generate {$count} soal pilihan ganda (multiple choice) dari materi yang diberikan.

ATURAN KETAT:
- Setiap soal: TEPAT 4 opsi (A, B, C, D), dengan tepat 1 jawaban benar.
- Tingkat kesulitan: {$difficultyLabel}.
- Tulis dalam Bahasa Indonesia yang lugas.
- Jangan ada "semua benar" atau "tidak ada yang benar".
- Sertakan penjelasan singkat 1-2 kalimat untuk jawaban yang benar.
- HANYA gunakan informasi dari materi sumber. Jangan ngarang fakta di luar materi.
- Output WAJIB JSON dengan struktur:
{
  "questions": [
    {
      "question": "<pertanyaan>",
      "options": ["A...", "B...", "C...", "D..."],
      "correct_index": 0,
      "explanation": "<1-2 kalimat>"
    }
  ]
}
TXT;

        $user = "MATERI SUMBER:\n\n{$source}";

        return [
            ['role' => 'system', 'content' => $system],
            ['role' => 'user', 'content' => $user],
        ];
    }

    /**
     * @return list<array{question:string, options:list<string>, correct_index:int, explanation:string}>
     */
    private function parseResponse(string $content): array
    {
        try {
            $decoded = json_decode($content, true, flags: JSON_THROW_ON_ERROR);
        } catch (Throwable $e) {
            Log::warning('QuizGenerator JSON parse failed', ['content' => mb_substr($content, 0, 500)]);
            throw new RuntimeException('AI tidak dapat memformat soal. Coba lagi.');
        }

        $items = $decoded['questions'] ?? [];
        if (! is_array($items) || $items === []) {
            throw new RuntimeException('AI tidak menghasilkan soal.');
        }

        $out = [];
        foreach ($items as $item) {
            $question = trim((string) ($item['question'] ?? ''));
            $options = $item['options'] ?? [];
            $correctIndex = (int) ($item['correct_index'] ?? -1);
            $explanation = trim((string) ($item['explanation'] ?? ''));

            if ($question === '' || ! is_array($options) || count($options) !== 4) {
                continue;
            }
            if ($correctIndex < 0 || $correctIndex > 3) {
                continue;
            }

            $out[] = [
                'question' => $question,
                'options' => array_values(array_map(fn ($o) => trim((string) $o), $options)),
                'correct_index' => $correctIndex,
                'explanation' => $explanation,
            ];
        }

        if ($out === []) {
            throw new RuntimeException('AI menghasilkan soal yang tidak valid (struktur).');
        }

        return $out;
    }
}
