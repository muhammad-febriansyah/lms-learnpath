<?php

namespace App\Ai\Agents;

use App\Models\ChatMessage;
use App\Models\ChatThread;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Support\Str;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Attributes\Timeout;
use Laravel\Ai\Attributes\UseCheapestModel;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;
use Stringable;

/**
 * AI Tutor agent powered by the Laravel AI SDK.
 *
 * Builds course/lesson aware instructions plus RAG citations, and replays the
 * existing chat thread as conversational context. Use `->stream(...)` to push
 * tokens to the browser via SSE.
 */
#[Provider(Lab::OpenAI)]
#[UseCheapestModel]
#[Timeout(90)]
final class AiTutorAgent implements Agent, Conversational
{
    use Promptable;

    /**
     * Max prior chat turns to replay as context (excludes the latest user turn).
     */
    private const HISTORY_WINDOW = 12;

    /**
     * @param  list<array{title: string, content: string, document_id?: int}>  $citations
     */
    public function __construct(
        public readonly ?ChatThread $thread = null,
        public readonly ?Course $course = null,
        public readonly ?Lesson $lesson = null,
        public readonly array $citations = [],
        public readonly ?User $user = null,
    ) {}

    public function instructions(): Stringable|string
    {
        $appName = (string) config('app.name', 'LearnPath');
        $course = $this->course ?? $this->thread?->course;
        $lesson = $this->lesson ?? $this->thread?->lesson;
        $isInstructor = $this->isInstructor();

        if ($isInstructor) {
            $lines = [
                "Anda adalah AI Asisten Mentor di platform {$appName}, sebuah LMS profesional.",
                'Anda berbicara dengan seorang INSTRUKTUR/MENTOR yang sedang menyiapkan atau mengembangkan materi pembelajaran — BUKAN dengan siswa.',
                'Tugas Anda: bantu instruktur menghasilkan ide topik, kerangka course, outline lesson, contoh kasus, latihan soal, rubrik penilaian, referensi sumber bacaan, dan ide aktivitas kelas.',
                'Jangan menanyakan "topik apa yang ingin kamu pelajari" — anggap user sudah punya konteks mengajar. Jika permintaan ambigu, tawarkan 2-3 sudut pendekatan sebagai opsi.',
                'Gunakan Bahasa Indonesia profesional. Jawab terstruktur (heading/bullet) saat berguna. Tetap ringkas; tawarkan untuk memperdalam bagian tertentu daripada menulis panjang lebar.',
                'Saat menyarankan referensi, prioritaskan sumber yang reputable (buku akademis, paper, dokumentasi resmi). Tandai jelas mana yang asumsi/perlu diverifikasi.',
            ];
        } else {
            $lines = [
                "Anda adalah AI Tutor di platform {$appName}, sebuah LMS profesional.",
                'Tugas Anda: membantu siswa memahami materi kursus, menjawab pertanyaan teknis, memberi contoh, dan mendorong refleksi pembelajaran.',
                'Gunakan Bahasa Indonesia yang jelas dan ramah. Hindari jargon kecuali memang dibutuhkan oleh konteks materi.',
                'Jawablah dengan ringkas tapi lengkap. Kalau soalnya pilihan ganda dari assessment, jangan langsung kasih jawaban — pandu siswa berpikir.',
            ];
        }

        if ($course) {
            $lines[] = $isInstructor
                ? "\nKonteks course yang sedang dikembangkan:"
                : "\nKonteks kursus saat ini:";
            $lines[] = "- Judul: {$course->title}";
            if ($course->subtitle) {
                $lines[] = "- Subtitle: {$course->subtitle}";
            }
            if ($course->level) {
                $lines[] = "- Level: {$course->level}";
            }
            if ($course->category?->name) {
                $lines[] = "- Kategori: {$course->category->name}";
            }
        }

        if ($lesson) {
            $lines[] = $isInstructor
                ? "\nLesson yang sedang disiapkan:"
                : "\nLesson yang sedang dibuka:";
            $lines[] = "- Judul: {$lesson->title}";
            if ($lesson->description) {
                $lines[] = '- Deskripsi: '.Str::limit($lesson->description, 400);
            }
            if ($lesson->content && is_string($lesson->content)) {
                $lines[] = '- Materi (cuplikan): '.Str::limit(strip_tags($lesson->content), 1500);
            }
        }

        if (! $course && ! $lesson) {
            $lines[] = $isInstructor
                ? "\nBelum ada course/lesson spesifik yang dibuka. Jawab dalam konteks umum perancangan materi pembelajaran."
                : "\nSiswa belum membuka course/lesson tertentu, jadi jawab pertanyaan secara umum.";
        }

        if ($this->citations !== []) {
            $lines[] = "\nREFERENSI MATERI (gunakan ini sebagai sumber otoritatif; saat mengutip, sebutkan '[Sumber N]'):";
            foreach ($this->citations as $i => $cite) {
                $n = $i + 1;
                $title = $cite['title'] !== '' ? $cite['title'] : "Dokumen #{$n}";
                $body = Str::limit($cite['content'], 1200);
                $lines[] = "\n[Sumber {$n}] {$title}\n{$body}";
            }
            $lines[] = "\nJika jawaban berasal dari referensi di atas, kutip nomor sumbernya. Jika referensi tidak relevan, jawab dari pengetahuan umum tanpa mengutip.";
        }

        return implode("\n", $lines);
    }

    /**
     * Replay the chat thread as conversation context. The latest user message
     * is NOT included here — it is passed via ->prompt()/->stream().
     *
     * @return list<Message>
     */
    public function messages(): iterable
    {
        if (! $this->thread) {
            return [];
        }

        $history = $this->thread->messages()
            ->where('role', '!=', ChatMessage::ROLE_SYSTEM)
            ->orderByDesc('id')
            ->limit(self::HISTORY_WINDOW + 1)
            ->get()
            ->reverse()
            ->values();

        // Drop the most recent message — it represents the just-saved user turn
        // which is sent through ->prompt()/->stream() as the active prompt and
        // would otherwise be duplicated.
        if ($history->last()?->role === ChatMessage::ROLE_USER) {
            $history = $history->slice(0, $history->count() - 1);
        }

        return $history
            ->map(fn (ChatMessage $m) => new Message($m->role, $m->content))
            ->all();
    }

    /**
     * True when the user is a mentor/instructor and should get the
     * teaching-assistant persona instead of the student tutor persona.
     */
    private function isInstructor(): bool
    {
        $user = $this->user ?? $this->thread?->user;
        if (! $user) {
            return false;
        }

        return $user->hasAnyRole(['instructor', 'mentor', 'admin', 'tenant-admin']);
    }
}
