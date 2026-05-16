<?php

namespace App\Services\AI;

use App\Models\ChatMessage;
use App\Models\ChatThread;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Orchestrates AI Tutor conversations: assembles a lesson/course-aware
 * system prompt, calls OpenAI, persists user + assistant messages.
 */
final class TutorService
{
    /**
     * Max messages of prior history to include in the request (excluding system).
     */
    private const HISTORY_WINDOW = 12;

    public function __construct(
        private readonly OpenAIClient $client,
    ) {}

    /**
     * Send a user message in an existing thread, or create a new thread if null.
     */
    public function sendMessage(
        User $user,
        string $userMessage,
        ?ChatThread $thread = null,
        ?Course $course = null,
        ?Lesson $lesson = null,
    ): ChatThread {
        $userMessage = trim($userMessage);
        if ($userMessage === '') {
            throw new \InvalidArgumentException('Pesan tidak boleh kosong.');
        }

        return DB::transaction(function () use ($user, $userMessage, $thread, $course, $lesson) {
            if (! $thread) {
                $thread = ChatThread::create([
                    'user_id' => $user->id,
                    'course_id' => $course?->id ?? $lesson?->course_id,
                    'lesson_id' => $lesson?->id,
                    'title' => Str::limit($userMessage, 60),
                    'last_message_at' => now(),
                ]);
            } else {
                $thread->forceFill(['last_message_at' => now()])->save();
            }

            ChatMessage::create([
                'chat_thread_id' => $thread->id,
                'role' => ChatMessage::ROLE_USER,
                'content' => $userMessage,
            ]);

            $messages = $this->buildMessages($thread, $course, $lesson);

            $result = $this->client->chat($messages);

            ChatMessage::create([
                'chat_thread_id' => $thread->id,
                'role' => ChatMessage::ROLE_ASSISTANT,
                'content' => $result['content'],
                'tokens' => $result['total_tokens'],
                'model' => $result['model'],
            ]);

            $thread->forceFill(['last_message_at' => now()])->save();

            return $thread->fresh(['messages']);
        });
    }

    /**
     * @return array<int, array{role: string, content: string}>
     */
    private function buildMessages(ChatThread $thread, ?Course $course, ?Lesson $lesson): array
    {
        // Resolve context — prefer relations on the thread when not explicitly passed.
        $course ??= $thread->course;
        $lesson ??= $thread->lesson;

        $messages = [[
            'role' => ChatMessage::ROLE_SYSTEM,
            'content' => $this->systemPrompt($course, $lesson),
        ]];

        $history = $thread->messages()
            ->orderByDesc('id')
            ->limit(self::HISTORY_WINDOW)
            ->get()
            ->reverse()
            ->values();

        foreach ($history as $msg) {
            $messages[] = [
                'role' => $msg->role,
                'content' => $msg->content,
            ];
        }

        return $messages;
    }

    private function systemPrompt(?Course $course, ?Lesson $lesson): string
    {
        $appName = (string) config('app.name', 'LearnPath');

        $lines = [
            "Anda adalah AI Tutor di platform {$appName}, sebuah LMS profesional.",
            'Tugas Anda: membantu siswa memahami materi kursus, menjawab pertanyaan teknis, memberi contoh, dan mendorong refleksi pembelajaran.',
            'Gunakan Bahasa Indonesia yang jelas dan ramah. Hindari jargon kecuali memang dibutuhkan oleh konteks materi.',
            'Jawablah dengan ringkas tapi lengkap. Kalau soalnya pilihan ganda dari assessment, jangan langsung kasih jawaban — pandu siswa berpikir.',
        ];

        if ($course) {
            $lines[] = "\nKonteks kursus saat ini:";
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
            $lines[] = "\nLesson yang sedang dibuka:";
            $lines[] = "- Judul: {$lesson->title}";
            if ($lesson->description) {
                $lines[] = '- Deskripsi: '.Str::limit($lesson->description, 400);
            }
            if ($lesson->content && is_string($lesson->content)) {
                $lines[] = '- Materi (cuplikan): '.Str::limit(strip_tags($lesson->content), 1500);
            }
        }

        if (! $course && ! $lesson) {
            $lines[] = "\nSiswa belum membuka course/lesson tertentu, jadi jawab pertanyaan secara umum.";
        }

        return implode("\n", $lines);
    }
}
