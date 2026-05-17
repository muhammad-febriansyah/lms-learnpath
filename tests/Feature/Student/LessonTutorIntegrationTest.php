<?php

use App\Models\ChatMessage;
use App\Models\ChatThread;
use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Enrollment;
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

    Role::findOrCreate('employee', 'web');
    $this->user = User::factory()->create(['email_verified_at' => now()]);
    $this->user->assignRole('employee');

    $this->course = Course::factory()->create();
    $section = CourseSection::create([
        'course_id' => $this->course->id,
        'title' => 'Bab 1',
        'sort_order' => 1,
    ]);
    $this->lesson = Lesson::factory()->create([
        'course_id' => $this->course->id,
        'course_section_id' => $section->id,
    ]);
    Enrollment::create([
        'user_id' => $this->user->id,
        'course_id' => $this->course->id,
        'status' => 'active',
        'enrolled_at' => now(),
    ]);
});

it('exposes tutorAvailable=true when OPENAI_API_KEY is set', function () {
    $this->actingAs($this->user)
        ->get(route('learn.lesson', [
            'course' => $this->course->slug,
            'lesson' => $this->lesson->id,
        ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('tutorAvailable', true)
            ->where('tutorThread', null)
        );
});

it('exposes tutorAvailable=false when OPENAI_API_KEY is missing', function () {
    config()->set('services.openai.api_key', '');

    $this->actingAs($this->user)
        ->get(route('learn.lesson', [
            'course' => $this->course->slug,
            'lesson' => $this->lesson->id,
        ]))
        ->assertInertia(fn ($page) => $page->where('tutorAvailable', false));
});

it('returns the most recent lesson-scoped thread with messages', function () {
    $thread = ChatThread::factory()->create([
        'user_id' => $this->user->id,
        'course_id' => $this->course->id,
        'lesson_id' => $this->lesson->id,
        'title' => 'Pertanyaan saya',
        'last_message_at' => now(),
    ]);
    ChatMessage::factory()->create([
        'chat_thread_id' => $thread->id,
        'role' => 'user',
        'content' => 'Halo',
    ]);
    ChatMessage::factory()->create([
        'chat_thread_id' => $thread->id,
        'role' => 'assistant',
        'content' => 'Hai!',
    ]);

    $this->actingAs($this->user)
        ->get(route('learn.lesson', [
            'course' => $this->course->slug,
            'lesson' => $this->lesson->id,
        ]))
        ->assertInertia(fn ($page) => $page
            ->where('tutorThread.id', $thread->id)
            ->where('tutorThread.title', 'Pertanyaan saya')
            ->has('tutorThread.messages', 2)
        );
});

it('falls back to a course-level thread when no lesson-specific thread exists', function () {
    $courseThread = ChatThread::factory()->create([
        'user_id' => $this->user->id,
        'course_id' => $this->course->id,
        'lesson_id' => null,
        'last_message_at' => now()->subHour(),
    ]);

    $this->actingAs($this->user)
        ->get(route('learn.lesson', [
            'course' => $this->course->slug,
            'lesson' => $this->lesson->id,
        ]))
        ->assertInertia(fn ($page) => $page
            ->where('tutorThread.id', $courseThread->id)
        );
});

it('prefers lesson-scoped thread over course-level when both exist', function () {
    ChatThread::factory()->create([
        'user_id' => $this->user->id,
        'course_id' => $this->course->id,
        'lesson_id' => null,
        'last_message_at' => now(),
    ]);
    $lessonThread = ChatThread::factory()->create([
        'user_id' => $this->user->id,
        'course_id' => $this->course->id,
        'lesson_id' => $this->lesson->id,
        'last_message_at' => now()->subHour(),
    ]);

    $this->actingAs($this->user)
        ->get(route('learn.lesson', [
            'course' => $this->course->slug,
            'lesson' => $this->lesson->id,
        ]))
        ->assertInertia(fn ($page) => $page->where('tutorThread.id', $lessonThread->id));
});

it('does not expose another users thread', function () {
    $stranger = User::factory()->create();
    ChatThread::factory()->create([
        'user_id' => $stranger->id,
        'course_id' => $this->course->id,
        'lesson_id' => $this->lesson->id,
        'last_message_at' => now(),
    ]);

    $this->actingAs($this->user)
        ->get(route('learn.lesson', [
            'course' => $this->course->slug,
            'lesson' => $this->lesson->id,
        ]))
        ->assertInertia(fn ($page) => $page->where('tutorThread', null));
});

it('drawer submit goes to /my-tutor/messages with lesson context and creates thread', function () {
    $this->actingAs($this->user)
        ->post('/my-tutor/messages', [
            'content' => 'Apa itu lesson ini?',
            'course_id' => $this->course->id,
            'lesson_id' => $this->lesson->id,
        ])
        ->assertRedirect();

    $thread = ChatThread::where('user_id', $this->user->id)->first();
    expect($thread)->not->toBeNull();
    expect($thread->course_id)->toBe($this->course->id);
    expect($thread->lesson_id)->toBe($this->lesson->id);
});
