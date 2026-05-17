<?php

use App\Models\Assessment;
use App\Models\Course;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('superadmin', 'web');
    Permission::findOrCreate('assessment.manage', 'web');
    Role::findByName('superadmin', 'web')->givePermissionTo('assessment.manage');

    $this->admin = User::factory()->create(['email_verified_at' => now()]);
    $this->admin->assignRole('superadmin');

    $this->course = Course::factory()->create(['title' => 'Test Course']);
});

it('shows the assessment list with create button to admins', function () {
    $this->actingAs($this->admin)
        ->get('/admin/assessments')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/assessments/index'));
});

it('renders the create form with course options', function () {
    $this->actingAs($this->admin)
        ->get('/admin/assessments/create')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/assessments/form')
            ->where('assessment', null)
            ->has('courses', 1)
        );
});

it('creates an assessment and redirects to its show page', function () {
    $response = $this->actingAs($this->admin)
        ->post('/admin/assessments', [
            'course_id' => $this->course->id,
            'title' => 'Post-Test Saya',
            'type' => 'post_test',
            'passing_score' => 75,
            'max_attempts' => 2,
            'duration_minutes' => 25,
            'is_required' => true,
        ]);

    $assessment = Assessment::where('title', 'Post-Test Saya')->first();
    expect($assessment)->not->toBeNull();
    $response->assertRedirect("/admin/assessments/{$assessment->id}")
        ->assertSessionHas('success');
});

it('rejects invalid type when creating', function () {
    $this->actingAs($this->admin)
        ->post('/admin/assessments', [
            'course_id' => $this->course->id,
            'title' => 'Bad',
            'type' => 'something_else',
            'passing_score' => 70,
            'max_attempts' => 3,
        ])
        ->assertSessionHasErrors('type');
});

it('forbids users without assessment.manage from creating', function () {
    $stranger = User::factory()->create(['email_verified_at' => now()]);

    $this->actingAs($stranger)
        ->post('/admin/assessments', [
            'course_id' => $this->course->id,
            'title' => 'X',
            'type' => 'post_test',
            'passing_score' => 70,
            'max_attempts' => 3,
        ])
        ->assertForbidden();
});

it('shows the assessment with questions', function () {
    $assessment = Assessment::factory()->create(['course_id' => $this->course->id]);
    $q = Question::factory()->create(['assessment_id' => $assessment->id, 'sort_order' => 1]);
    QuestionOption::factory()->correct()->create(['question_id' => $q->id]);
    QuestionOption::factory()->create(['question_id' => $q->id]);

    $this->actingAs($this->admin)
        ->get("/admin/assessments/{$assessment->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/assessments/show')
            ->has('assessment.questions', 1)
            ->has('assessment.questions.0.options', 2)
        );
});

it('adds a new question with options', function () {
    $assessment = Assessment::factory()->create(['course_id' => $this->course->id]);

    $this->actingAs($this->admin)
        ->post("/admin/assessments/{$assessment->id}/questions", [
            'question_text' => 'What is 2+2?',
            'points' => 1,
            'options' => [
                ['option_text' => '3', 'is_correct' => false],
                ['option_text' => '4', 'is_correct' => true],
                ['option_text' => '5', 'is_correct' => false],
            ],
        ])
        ->assertSessionHas('success');

    $q = Question::where('assessment_id', $assessment->id)->first();
    expect($q)->not->toBeNull();
    expect($q->options()->count())->toBe(3);
    expect($q->options()->where('is_correct', true)->first()->option_text)->toBe('4');
});

it('rejects question without at least one correct option', function () {
    $assessment = Assessment::factory()->create(['course_id' => $this->course->id]);

    $this->actingAs($this->admin)
        ->post("/admin/assessments/{$assessment->id}/questions", [
            'question_text' => 'Bad question',
            'points' => 1,
            'options' => [
                ['option_text' => 'A', 'is_correct' => false],
                ['option_text' => 'B', 'is_correct' => false],
            ],
        ])
        ->assertSessionHasErrors('options');

    expect(Question::count())->toBe(0);
});

it('updates a question and replaces its options', function () {
    $assessment = Assessment::factory()->create(['course_id' => $this->course->id]);
    $q = Question::factory()->create([
        'assessment_id' => $assessment->id,
        'question_text' => 'Old text',
        'points' => 1,
    ]);
    QuestionOption::factory()->correct()->create(['question_id' => $q->id, 'option_text' => 'Old A']);
    QuestionOption::factory()->create(['question_id' => $q->id, 'option_text' => 'Old B']);

    $this->actingAs($this->admin)
        ->patch("/admin/assessments/{$assessment->id}/questions/{$q->id}", [
            'question_text' => 'New text',
            'points' => 2,
            'options' => [
                ['option_text' => 'New A', 'is_correct' => false],
                ['option_text' => 'New B', 'is_correct' => true],
            ],
        ])
        ->assertSessionHas('success');

    $q->refresh();
    expect($q->question_text)->toBe('New text');
    expect($q->points)->toBe(2);
    expect($q->options()->count())->toBe(2);
    expect($q->options()->pluck('option_text')->all())->toBe(['New A', 'New B']);
});

it('deletes a question', function () {
    $assessment = Assessment::factory()->create(['course_id' => $this->course->id]);
    $q = Question::factory()->create(['assessment_id' => $assessment->id]);
    QuestionOption::factory()->correct()->create(['question_id' => $q->id]);

    $this->actingAs($this->admin)
        ->delete("/admin/assessments/{$assessment->id}/questions/{$q->id}")
        ->assertSessionHas('success');

    expect(Question::count())->toBe(0);
    expect(QuestionOption::count())->toBe(0);
});

it('refuses to delete a question that belongs to a different assessment', function () {
    $assessmentA = Assessment::factory()->create(['course_id' => $this->course->id]);
    $assessmentB = Assessment::factory()->create(['course_id' => $this->course->id]);
    $q = Question::factory()->create(['assessment_id' => $assessmentB->id]);

    $this->actingAs($this->admin)
        ->delete("/admin/assessments/{$assessmentA->id}/questions/{$q->id}")
        ->assertNotFound();
});

it('deletes the assessment', function () {
    $assessment = Assessment::factory()->create(['course_id' => $this->course->id]);

    $this->actingAs($this->admin)
        ->delete("/admin/assessments/{$assessment->id}")
        ->assertRedirect('/admin/assessments')
        ->assertSessionHas('success');

    expect(Assessment::count())->toBe(0);
});
