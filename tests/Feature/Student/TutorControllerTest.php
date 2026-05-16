<?php

use App\Models\ChatMessage;
use App\Models\ChatThread;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    config()->set('services.openai.api_key', 'test-key');
    config()->set('services.openai.model', 'gpt-5');
    Http::fake([
        'api.openai.com/v1/chat/completions' => Http::response([
            'choices' => [['message' => ['content' => 'AI reply']]],
            'usage' => ['total_tokens' => 10, 'prompt_tokens' => 6, 'completion_tokens' => 4],
            'model' => 'gpt-5',
        ], 200),
    ]);
    Role::findOrCreate('student', 'web');
    $this->user = User::factory()->create(['email_verified_at' => now()]);
    $this->user->assignRole('student');
});

it('requires authentication', function () {
    $this->get('/my-tutor')->assertRedirect('/login');
});

it('renders the tutor index page', function () {
    $this->actingAs($this->user)
        ->get('/my-tutor')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('student/my-tutor/index')
            ->has('threads')
            ->where('available', true)
            ->where('activeThread', null)
        );
});

it('creates a new thread when posting without thread_id', function () {
    $course = Course::factory()->create();

    $this->actingAs($this->user)
        ->post('/my-tutor/messages', [
            'content' => 'Apa itu compounding?',
            'course_id' => $course->id,
        ])
        ->assertRedirect();

    $thread = ChatThread::where('user_id', $this->user->id)->first();
    expect($thread)->not->toBeNull();
    expect(ChatMessage::where('chat_thread_id', $thread->id)->count())->toBe(2);
});

it('renders show page with messages for thread owner', function () {
    $thread = ChatThread::factory()->create(['user_id' => $this->user->id]);
    ChatMessage::factory()->create([
        'chat_thread_id' => $thread->id,
        'role' => 'user',
        'content' => 'Hai',
    ]);
    ChatMessage::factory()->create([
        'chat_thread_id' => $thread->id,
        'role' => 'assistant',
        'content' => 'Halo!',
    ]);

    $this->actingAs($this->user)
        ->get("/my-tutor/{$thread->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('student/my-tutor/index')
            ->where('activeThread.id', $thread->id)
            ->has('activeThread.messages', 2)
        );
});

it('forbids accessing another users thread', function () {
    $stranger = User::factory()->create(['email_verified_at' => now()]);
    $thread = ChatThread::factory()->create(['user_id' => $stranger->id]);

    $this->actingAs($this->user)
        ->get("/my-tutor/{$thread->id}")
        ->assertForbidden();
});

it('forbids deleting another users thread', function () {
    $stranger = User::factory()->create(['email_verified_at' => now()]);
    $thread = ChatThread::factory()->create(['user_id' => $stranger->id]);

    $this->actingAs($this->user)
        ->delete("/my-tutor/{$thread->id}")
        ->assertForbidden();
});

it('returns error flash when API key is missing', function () {
    config()->set('services.openai.api_key', '');

    $this->actingAs($this->user)
        ->post('/my-tutor/messages', ['content' => 'hi'])
        ->assertSessionHas('error');
});

it('owner can post a follow-up message to existing thread', function () {
    $thread = ChatThread::factory()->create(['user_id' => $this->user->id]);

    $this->actingAs($this->user)
        ->post('/my-tutor/messages', [
            'thread_id' => $thread->id,
            'content' => 'follow up',
        ])
        ->assertRedirect();

    expect(ChatMessage::where('chat_thread_id', $thread->id)->count())->toBe(2);
});

it('exposes quota usage and limits on index page', function () {
    config()->set('services.openai.daily_message_limit', 50);
    config()->set('services.openai.daily_token_limit', 100000);

    $this->actingAs($this->user)
        ->get('/my-tutor')
        ->assertInertia(fn ($page) => $page
            ->where('quota.ok', true)
            ->where('quota.limits.daily_message_limit', 50)
            ->where('quota.limits.daily_token_limit', 100000)
            ->where('quota.usage.messages', 0)
            ->where('quota.usage.tokens', 0)
        );
});

it('blocks new message when daily message quota is reached', function () {
    config()->set('services.openai.daily_message_limit', 2);

    $thread = ChatThread::factory()->create(['user_id' => $this->user->id]);
    ChatMessage::factory()->count(2)->create([
        'chat_thread_id' => $thread->id,
        'role' => 'user',
    ]);

    $this->actingAs($this->user)
        ->post('/my-tutor/messages', ['content' => 'satu lagi'])
        ->assertSessionHas('error');

    expect(ChatMessage::where('chat_thread_id', $thread->id)->count())->toBe(2);
});

it('blocks new message when daily token quota is reached', function () {
    config()->set('services.openai.daily_token_limit', 50);

    $thread = ChatThread::factory()->create(['user_id' => $this->user->id]);
    ChatMessage::factory()->create([
        'chat_thread_id' => $thread->id,
        'role' => 'assistant',
        'tokens' => 60,
    ]);

    $this->actingAs($this->user)
        ->post('/my-tutor/messages', ['content' => 'satu lagi'])
        ->assertSessionHas('error');
});
