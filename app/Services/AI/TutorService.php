<?php

namespace App\Services\AI;

use App\Ai\Agents\AiTutorAgent;
use App\Models\ChatMessage;
use App\Models\ChatThread;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Ai\Responses\StreamableAgentResponse;
use Laravel\Ai\Responses\StreamedAgentResponse;

/**
 * Orchestrates AI Tutor conversations on top of the Laravel AI SDK.
 *
 * Provides both a synchronous `sendMessage` path and a streaming
 * `streamMessage` path; both share the same persistence logic.
 */
final class TutorService
{
    public function __construct(
        private readonly DocumentRetrievalService $retrieval,
    ) {}

    /**
     * Synchronous send — waits for full completion before returning.
     */
    public function sendMessage(
        User $user,
        string $userMessage,
        ?ChatThread $thread = null,
        ?Course $course = null,
        ?Lesson $lesson = null,
    ): ChatThread {
        [$thread, $citations] = $this->prepareTurn($user, $userMessage, $thread, $course, $lesson);

        $response = $this->buildAgent($thread, $course, $lesson, $citations, $user)
            ->prompt($userMessage);

        $this->persistAssistantMessage(
            thread: $thread,
            content: (string) $response,
            citations: $citations,
            promptTokens: (int) ($response->usage->promptTokens ?? 0),
            completionTokens: (int) ($response->usage->completionTokens ?? 0),
            model: $response->meta->model ?? null,
        );

        return $thread->fresh(['messages']);
    }

    /**
     * Streaming send — returns the SDK streamable response that the controller
     * can return as SSE. Persists the assistant message via the `then()` hook
     * once the stream has fully drained.
     *
     * @return array{thread: ChatThread, stream: StreamableAgentResponse}
     */
    public function streamMessage(
        User $user,
        string $userMessage,
        ?ChatThread $thread = null,
        ?Course $course = null,
        ?Lesson $lesson = null,
    ): array {
        [$thread, $citations] = $this->prepareTurn($user, $userMessage, $thread, $course, $lesson);

        $stream = $this->buildAgent($thread, $course, $lesson, $citations, $user)
            ->stream($userMessage)
            ->then(function (StreamedAgentResponse $response) use ($thread, $citations) {
                $this->persistAssistantMessage(
                    thread: $thread,
                    content: (string) $response,
                    citations: $citations,
                    promptTokens: (int) ($response->usage->promptTokens ?? 0),
                    completionTokens: (int) ($response->usage->completionTokens ?? 0),
                    model: $response->meta->model ?? null,
                );
            });

        return ['thread' => $thread, 'stream' => $stream];
    }

    /**
     * Create/load the thread, persist the user message, and gather citations.
     *
     * @return array{0: ChatThread, 1: list<array{title: string, content: string, document_id?: int}>}
     */
    private function prepareTurn(
        User $user,
        string $userMessage,
        ?ChatThread $thread,
        ?Course $course,
        ?Lesson $lesson,
    ): array {
        $userMessage = trim($userMessage);
        if ($userMessage === '') {
            throw new \InvalidArgumentException('Pesan tidak boleh kosong.');
        }

        $thread = DB::transaction(function () use ($user, $userMessage, $thread, $course, $lesson) {
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

            return $thread;
        });

        return [$thread, $this->retrieveCitations($userMessage, $course, $lesson)];
    }

    private function buildAgent(
        ChatThread $thread,
        ?Course $course,
        ?Lesson $lesson,
        array $citations,
        User $user,
    ): AiTutorAgent {
        return new AiTutorAgent(
            thread: $thread,
            course: $course ?? $thread->course,
            lesson: $lesson ?? $thread->lesson,
            citations: $citations,
            user: $user,
        );
    }

    /**
     * @param  list<array{title: string, content: string, document_id?: int}>  $citations
     */
    private function persistAssistantMessage(
        ChatThread $thread,
        string $content,
        array $citations,
        int $promptTokens,
        int $completionTokens,
        ?string $model,
    ): void {
        $content = trim($content);
        if ($content === '') {
            return;
        }

        ChatMessage::create([
            'chat_thread_id' => $thread->id,
            'role' => ChatMessage::ROLE_ASSISTANT,
            'content' => $content,
            'tokens' => $promptTokens + $completionTokens,
            'model' => $model,
            'citations' => $citations !== [] ? $citations : null,
        ]);

        $thread->forceFill(['last_message_at' => now()])->save();
    }

    /**
     * @return list<array{title: string, content: string, document_id: int}>
     */
    private function retrieveCitations(string $query, ?Course $course, ?Lesson $lesson): array
    {
        $course ??= $lesson?->course;
        if (! $course) {
            return [];
        }

        try {
            $hits = $this->retrieval->retrieveForCourse($course, $query, topK: 3);
        } catch (\Throwable) {
            // Embedding failure must not block the chat — degrade gracefully.
            return [];
        }

        return $hits
            ->map(fn (array $hit) => [
                'title' => (string) $hit['document']->title,
                'content' => (string) $hit['chunk']->content,
                'document_id' => (int) $hit['document']->id,
            ])
            ->all();
    }
}
