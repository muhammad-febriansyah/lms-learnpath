<?php

use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonNote;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
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
});

function enroll(User $user, Course $course, string $status = 'active'): void
{
    Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => $status,
        'enrolled_at' => now(),
    ]);
}

it('lets an enrolled user store a note', function () {
    enroll($this->user, $this->course);

    $this->actingAs($this->user)
        ->post("/lessons/{$this->lesson->id}/notes", [
            'content' => 'Poin penting',
            'timestamp_seconds' => 120,
        ])
        ->assertRedirect();

    $note = LessonNote::where('user_id', $this->user->id)->first();
    expect($note)->not->toBeNull()
        ->and($note->content)->toBe('Poin penting')
        ->and($note->timestamp_seconds)->toBe(120)
        ->and($note->lesson_id)->toBe($this->lesson->id)
        ->and($note->course_id)->toBe($this->course->id);
});

it('forbids storing a note when not enrolled', function () {
    $this->actingAs($this->user)
        ->post("/lessons/{$this->lesson->id}/notes", [
            'content' => 'Tanpa enroll',
        ])
        ->assertForbidden();

    expect(LessonNote::count())->toBe(0);
});

it('allows completed enrollee to store a note (review-period)', function () {
    enroll($this->user, $this->course, status: 'completed');

    $this->actingAs($this->user)
        ->post("/lessons/{$this->lesson->id}/notes", ['content' => 'Catatan akhir'])
        ->assertRedirect();

    expect(LessonNote::count())->toBe(1);
});

it('validates note content is required', function () {
    enroll($this->user, $this->course);

    $this->actingAs($this->user)
        ->from('/')
        ->post("/lessons/{$this->lesson->id}/notes", ['content' => ''])
        ->assertSessionHasErrors('content');
});

it('lets the owner update their note', function () {
    enroll($this->user, $this->course);
    $note = LessonNote::factory()->create([
        'user_id' => $this->user->id,
        'course_id' => $this->course->id,
        'lesson_id' => $this->lesson->id,
        'content' => 'awal',
    ]);

    $this->actingAs($this->user)
        ->patch("/notes/{$note->id}", ['content' => 'revisi'])
        ->assertRedirect();

    expect($note->fresh()->content)->toBe('revisi');
});

it('forbids updating another users note', function () {
    $stranger = User::factory()->create();
    $note = LessonNote::factory()->create([
        'user_id' => $stranger->id,
        'course_id' => $this->course->id,
        'lesson_id' => $this->lesson->id,
    ]);

    $this->actingAs($this->user)
        ->patch("/notes/{$note->id}", ['content' => 'hacked'])
        ->assertForbidden();
});

it('lets the owner delete their note', function () {
    $note = LessonNote::factory()->create([
        'user_id' => $this->user->id,
        'course_id' => $this->course->id,
        'lesson_id' => $this->lesson->id,
    ]);

    $this->actingAs($this->user)
        ->delete("/notes/{$note->id}")
        ->assertRedirect();

    expect(LessonNote::find($note->id))->toBeNull();
});

it('forbids deleting another users note', function () {
    $stranger = User::factory()->create();
    $note = LessonNote::factory()->create([
        'user_id' => $stranger->id,
        'course_id' => $this->course->id,
        'lesson_id' => $this->lesson->id,
    ]);

    $this->actingAs($this->user)
        ->delete("/notes/{$note->id}")
        ->assertForbidden();

    expect(LessonNote::find($note->id))->not->toBeNull();
});

it('lists only the users own notes', function () {
    $stranger = User::factory()->create();
    LessonNote::factory()->count(2)->create([
        'user_id' => $this->user->id,
        'course_id' => $this->course->id,
        'lesson_id' => $this->lesson->id,
    ]);
    LessonNote::factory()->create([
        'user_id' => $stranger->id,
        'course_id' => $this->course->id,
        'lesson_id' => $this->lesson->id,
    ]);

    $this->actingAs($this->user)
        ->get('/my-notes')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('student/my-notes/index')
            ->has('notes', 2)
        );
});

it('filters notes by course_id', function () {
    $otherCourse = Course::factory()->create();
    $otherSection = CourseSection::create([
        'course_id' => $otherCourse->id,
        'title' => 'B',
        'sort_order' => 1,
    ]);
    $otherLesson = Lesson::factory()->create([
        'course_id' => $otherCourse->id,
        'course_section_id' => $otherSection->id,
    ]);

    LessonNote::factory()->create([
        'user_id' => $this->user->id,
        'course_id' => $this->course->id,
        'lesson_id' => $this->lesson->id,
    ]);
    LessonNote::factory()->create([
        'user_id' => $this->user->id,
        'course_id' => $otherCourse->id,
        'lesson_id' => $otherLesson->id,
    ]);

    $this->actingAs($this->user)
        ->get('/my-notes?course_id='.$this->course->id)
        ->assertInertia(fn ($page) => $page->has('notes', 1));
});

it('exposes lesson notes on the lesson player', function () {
    enroll($this->user, $this->course);
    LessonNote::factory()->count(3)->create([
        'user_id' => $this->user->id,
        'course_id' => $this->course->id,
        'lesson_id' => $this->lesson->id,
    ]);

    $this->actingAs($this->user)
        ->get(route('learn.lesson', [
            'course' => $this->course->slug,
            'lesson' => $this->lesson->id,
        ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('lessonNotes', 3));
});
