<?php

use App\Models\Assessment;
use App\Models\AssessmentAttempt;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Http::fake([
        'app.mailketing.co.id/*' => Http::response(['status' => 'success'], 200),
    ]);
    config()->set('services.mailketing.api_key', 'test-key');

    Role::findOrCreate('student', 'web');
    $this->user = User::factory()->create(['email_verified_at' => now()]);
    $this->user->assignRole('student');
    $this->course = Course::factory()->create();

    Enrollment::create([
        'user_id' => $this->user->id,
        'course_id' => $this->course->id,
        'status' => 'active',
        'enrolled_at' => now(),
    ]);

    $this->assessment = Assessment::factory()->create([
        'course_id' => $this->course->id,
        'type' => 'post_test',
        'passing_score' => 70,
        'max_attempts' => 3,
    ]);

    $this->correctOptions = [];
    foreach ([1, 2] as $sortOrder) {
        $q = Question::factory()->create([
            'assessment_id' => $this->assessment->id,
            'points' => 1,
            'sort_order' => $sortOrder,
        ]);
        $correct = QuestionOption::factory()->correct()->create([
            'question_id' => $q->id,
            'sort_order' => 1,
        ]);
        QuestionOption::factory()->create([
            'question_id' => $q->id,
            'sort_order' => 2,
        ]);
        $this->correctOptions[$q->id] = $correct->id;
    }
});

it('renders the assessment landing page for enrolled user', function () {
    $this->actingAs($this->user)
        ->get("/learn/{$this->course->slug}/assessments/{$this->assessment->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('student/assessments/show')
            ->where('assessment.id', $this->assessment->id)
            ->where('state.can_start', true)
            ->where('state.attempts_left', 3)
        );
});

it('redirects user that is not enrolled when accessing the assessment landing', function () {
    $stranger = User::factory()->create(['email_verified_at' => now()]);
    $stranger->assignRole('student');

    $this->actingAs($stranger)
        ->get("/learn/{$this->course->slug}/assessments/{$this->assessment->id}")
        ->assertRedirect(route('courses.show', ['course' => $this->course->slug]));
});

it('starts an attempt and redirects to take page', function () {
    $this->actingAs($this->user)
        ->post("/learn/{$this->course->slug}/assessments/{$this->assessment->id}/start")
        ->assertRedirect();

    $attempt = AssessmentAttempt::where('user_id', $this->user->id)->first();
    expect($attempt)->not->toBeNull();
    expect($attempt->status)->toBe('in_progress');
});

it('forbids another user from accessing someone elses attempt take page', function () {
    $attempt = AssessmentAttempt::factory()->create([
        'assessment_id' => $this->assessment->id,
        'user_id' => $this->user->id,
        'course_id' => $this->course->id,
        'status' => 'in_progress',
    ]);
    $stranger = User::factory()->create();

    $this->actingAs($stranger)
        ->get("/learn/{$this->course->slug}/assessments/{$this->assessment->id}/attempts/{$attempt->id}")
        ->assertForbidden();
});

it('submits answers and redirects to result page', function () {
    $this->actingAs($this->user)
        ->post("/learn/{$this->course->slug}/assessments/{$this->assessment->id}/start");

    $attempt = AssessmentAttempt::where('user_id', $this->user->id)->first();

    $this->actingAs($this->user)
        ->post("/learn/{$this->course->slug}/assessments/{$this->assessment->id}/attempts/{$attempt->id}/submit", [
            'answers' => $this->correctOptions,
        ])
        ->assertRedirect(route('assessments.result', [
            'course' => $this->course->slug,
            'assessment' => $this->assessment->id,
            'attempt' => $attempt->id,
        ]));

    expect($attempt->fresh()->score)->toBe(100);
    expect($attempt->fresh()->passed)->toBeTrue();
});

it('renders the result page with question pembahasan', function () {
    $attempt = AssessmentAttempt::factory()->create([
        'assessment_id' => $this->assessment->id,
        'user_id' => $this->user->id,
        'course_id' => $this->course->id,
        'status' => 'submitted',
        'score' => 100,
        'passed' => true,
        'submitted_at' => now(),
    ]);

    foreach ($this->correctOptions as $questionId => $optionId) {
        \App\Models\AssessmentAnswer::create([
            'assessment_attempt_id' => $attempt->id,
            'question_id' => $questionId,
            'selected_option_id' => $optionId,
            'is_correct' => true,
            'point_earned' => 1,
        ]);
    }

    $this->actingAs($this->user)
        ->get("/learn/{$this->course->slug}/assessments/{$this->assessment->id}/attempts/{$attempt->id}/result")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('student/assessments/result')
            ->where('attempt.score', 100)
            ->where('attempt.passed', true)
            ->has('questions', 2)
        );
});

it('flashes error when attempts exceeded', function () {
    AssessmentAttempt::factory()->count(3)->create([
        'assessment_id' => $this->assessment->id,
        'user_id' => $this->user->id,
        'course_id' => $this->course->id,
        'status' => 'submitted',
    ]);

    $this->actingAs($this->user)
        ->post("/learn/{$this->course->slug}/assessments/{$this->assessment->id}/start")
        ->assertSessionHas('error');
});
