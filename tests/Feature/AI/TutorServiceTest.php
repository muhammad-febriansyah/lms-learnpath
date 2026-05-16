<?php

use App\Models\ChatMessage;
use App\Models\ChatThread;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\User;
use App\Services\AI\TutorService;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config()->set('services.openai.api_key', 'test-key');
    config()->set('services.openai.model', 'gpt-5');

    Http::fake([
        'api.openai.com/v1/chat/completions' => Http::response([
            'model' => 'gpt-5',
            'choices' => [['message' => ['role' => 'assistant', 'content' => 'Jawaban AI']]],
            'usage' => ['prompt_tokens' => 10, 'completion_tokens' => 5, 'total_tokens' => 15],
        ], 200),
    ]);

    $this->service = app(TutorService::class);
});

it('creates a new thread when none is passed and persists both messages', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['title' => 'Analisa Kredit AO']);

    $thread = $this->service->sendMessage(
        user: $user,
        userMessage: 'Apa itu 5C?',
        course: $course,
    );

    expect($thread)->not->toBeNull();
    expect($thread->user_id)->toBe($user->id);
    expect($thread->course_id)->toBe($course->id);
    expect($thread->title)->toContain('Apa itu 5C?');
    expect($thread->messages->count())->toBe(2);
    expect($thread->messages[0]->role)->toBe('user');
    expect($thread->messages[0]->content)->toBe('Apa itu 5C?');
    expect($thread->messages[1]->role)->toBe('assistant');
    expect($thread->messages[1]->content)->toBe('Jawaban AI');
    expect($thread->messages[1]->tokens)->toBe(15);
});

it('appends to existing thread when one is passed', function () {
    $user = User::factory()->create();
    $thread = ChatThread::factory()->create(['user_id' => $user->id]);

    $this->service->sendMessage(
        user: $user,
        userMessage: 'Pertanyaan pertama',
        thread: $thread,
    );
    $this->service->sendMessage(
        user: $user,
        userMessage: 'Lanjutan',
        thread: $thread,
    );

    expect($thread->fresh()->messages->count())->toBe(4);
});

it('includes course and lesson context in the system prompt', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['title' => 'Course X', 'level' => 'beginner']);
    $lesson = Lesson::factory()->create([
        'course_id' => $course->id,
        'title' => 'Lesson Y',
        'description' => 'Pengenalan dasar',
    ]);

    $this->service->sendMessage(
        user: $user,
        userMessage: 'Boleh dijelaskan?',
        course: $course,
        lesson: $lesson,
    );

    Http::assertSent(function ($request) {
        $messages = $request->data()['messages'] ?? [];
        $system = $messages[0]['content'] ?? '';

        return $messages[0]['role'] === 'system'
            && str_contains($system, 'Course X')
            && str_contains($system, 'beginner')
            && str_contains($system, 'Lesson Y');
    });
});

it('rejects empty message content', function () {
    $user = User::factory()->create();

    expect(fn () => $this->service->sendMessage($user, '   '))
        ->toThrow(InvalidArgumentException::class);
});

it('inherits course/lesson from thread when not explicitly passed', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['title' => 'Stored Course']);
    $thread = ChatThread::factory()->create([
        'user_id' => $user->id,
        'course_id' => $course->id,
    ]);

    $this->service->sendMessage(
        user: $user,
        userMessage: 'Hai',
        thread: $thread,
    );

    Http::assertSent(function ($request) {
        $system = $request->data()['messages'][0]['content'] ?? '';
        return str_contains($system, 'Stored Course');
    });
});

it('uses generic prompt when no course/lesson context exists', function () {
    $user = User::factory()->create();

    $this->service->sendMessage(
        user: $user,
        userMessage: 'pertanyaan umum',
    );

    Http::assertSent(function ($request) {
        $system = $request->data()['messages'][0]['content'] ?? '';
        return str_contains($system, 'umum');
    });
});
