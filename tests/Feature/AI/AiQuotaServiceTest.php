<?php

use App\Models\ChatMessage;
use App\Models\ChatThread;
use App\Models\User;
use App\Services\AI\AiQuotaService;
use Illuminate\Support\Carbon;

beforeEach(function () {
    config()->set('services.openai.daily_message_limit', 50);
    config()->set('services.openai.daily_token_limit', 100000);

    $this->service = app(AiQuotaService::class);
    $this->user = User::factory()->create();
});

it('returns zero usage when user has no messages', function () {
    $usage = $this->service->usageToday($this->user);

    expect($usage['messages'])->toBe(0)
        ->and($usage['tokens'])->toBe(0);
});

it('counts only user role messages towards message count', function () {
    $thread = ChatThread::factory()->create(['user_id' => $this->user->id]);
    ChatMessage::factory()->create([
        'chat_thread_id' => $thread->id,
        'role' => 'user',
        'tokens' => null,
    ]);
    ChatMessage::factory()->create([
        'chat_thread_id' => $thread->id,
        'role' => 'assistant',
        'tokens' => 42,
    ]);
    ChatMessage::factory()->create([
        'chat_thread_id' => $thread->id,
        'role' => 'system',
        'tokens' => null,
    ]);

    $usage = $this->service->usageToday($this->user);

    expect($usage['messages'])->toBe(1)
        ->and($usage['tokens'])->toBe(42);
});

it('sums tokens only from assistant messages', function () {
    $thread = ChatThread::factory()->create(['user_id' => $this->user->id]);
    ChatMessage::factory()->create([
        'chat_thread_id' => $thread->id,
        'role' => 'assistant',
        'tokens' => 100,
    ]);
    ChatMessage::factory()->create([
        'chat_thread_id' => $thread->id,
        'role' => 'assistant',
        'tokens' => 250,
    ]);

    $usage = $this->service->usageToday($this->user);

    expect($usage['tokens'])->toBe(350);
});

it('does not count messages from other users', function () {
    $stranger = User::factory()->create();
    $strangerThread = ChatThread::factory()->create(['user_id' => $stranger->id]);
    ChatMessage::factory()->count(5)->create([
        'chat_thread_id' => $strangerThread->id,
        'role' => 'user',
    ]);
    ChatMessage::factory()->create([
        'chat_thread_id' => $strangerThread->id,
        'role' => 'assistant',
        'tokens' => 999,
    ]);

    $usage = $this->service->usageToday($this->user);

    expect($usage['messages'])->toBe(0)
        ->and($usage['tokens'])->toBe(0);
});

it('only counts messages from today (excludes yesterday and tomorrow)', function () {
    $thread = ChatThread::factory()->create(['user_id' => $this->user->id]);

    ChatMessage::factory()->create([
        'chat_thread_id' => $thread->id,
        'role' => 'user',
        'created_at' => Carbon::yesterday()->setTime(10, 0),
    ]);
    ChatMessage::factory()->create([
        'chat_thread_id' => $thread->id,
        'role' => 'assistant',
        'tokens' => 1000,
        'created_at' => Carbon::yesterday()->setTime(10, 0),
    ]);

    ChatMessage::factory()->create([
        'chat_thread_id' => $thread->id,
        'role' => 'user',
        'created_at' => Carbon::tomorrow()->setTime(10, 0),
    ]);

    ChatMessage::factory()->create([
        'chat_thread_id' => $thread->id,
        'role' => 'user',
        'created_at' => Carbon::now()->setTime(9, 0),
    ]);
    ChatMessage::factory()->create([
        'chat_thread_id' => $thread->id,
        'role' => 'assistant',
        'tokens' => 30,
        'created_at' => Carbon::now()->setTime(9, 0),
    ]);

    $usage = $this->service->usageToday($this->user);

    expect($usage['messages'])->toBe(1)
        ->and($usage['tokens'])->toBe(30);
});

it('reports within quota when fresh', function () {
    $result = $this->service->withinQuota($this->user);

    expect($result['ok'])->toBeTrue()
        ->and($result['reason'])->toBeNull()
        ->and($result['usage']['messages'])->toBe(0)
        ->and($result['limits']['daily_message_limit'])->toBe(50);
});

it('blocks when message limit reached', function () {
    config()->set('services.openai.daily_message_limit', 3);

    $thread = ChatThread::factory()->create(['user_id' => $this->user->id]);
    ChatMessage::factory()->count(3)->create([
        'chat_thread_id' => $thread->id,
        'role' => 'user',
    ]);

    $result = $this->service->withinQuota($this->user);

    expect($result['ok'])->toBeFalse()
        ->and($result['reason'])->toContain('pesan');
});

it('blocks when token limit reached', function () {
    config()->set('services.openai.daily_token_limit', 100);

    $thread = ChatThread::factory()->create(['user_id' => $this->user->id]);
    ChatMessage::factory()->create([
        'chat_thread_id' => $thread->id,
        'role' => 'assistant',
        'tokens' => 150,
    ]);

    $result = $this->service->withinQuota($this->user);

    expect($result['ok'])->toBeFalse()
        ->and($result['reason'])->toContain('token');
});

it('returns configured limits', function () {
    config()->set('services.openai.daily_message_limit', 25);
    config()->set('services.openai.daily_token_limit', 50000);

    $limits = $this->service->getLimits();

    expect($limits['daily_message_limit'])->toBe(25)
        ->and($limits['daily_token_limit'])->toBe(50000);
});
