<?php

use App\Actions\Learning\MarkLessonComplete;
use App\Models\Assessment;
use App\Models\AssessmentAttempt;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\User;
use App\Services\Learning\AssessmentService;
use Illuminate\Support\Facades\Http;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Http::fake([
        'app.mailketing.co.id/*' => Http::response(['status' => 'success'], 200),
    ]);
    config()->set('services.mailketing.api_key', 'test-key');

    Role::findOrCreate('employee', 'web');
    $this->service = app(AssessmentService::class);
});

/**
 * Build a 2-question assessment where the correct option for each
 * question is the FIRST option (sort_order 1).
 */
function buildAssessmentWithTwoQuestions(Course $course, string $type = 'post_test', int $passingScore = 70, int $maxAttempts = 3): Assessment
{
    $assessment = Assessment::factory()->create([
        'course_id' => $course->id,
        'type' => $type,
        'passing_score' => $passingScore,
        'max_attempts' => $maxAttempts,
    ]);

    foreach ([1, 2] as $i) {
        $q = Question::factory()->create([
            'assessment_id' => $assessment->id,
            'points' => 1,
            'sort_order' => $i,
        ]);
        QuestionOption::factory()->correct()->create([
            'question_id' => $q->id,
            'sort_order' => 1,
        ]);
        QuestionOption::factory()->create([
            'question_id' => $q->id,
            'sort_order' => 2,
        ]);
    }

    return $assessment->fresh(['questions.options']);
}

it('starts a new attempt for an enrolled user', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create();
    Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => 'active',
        'enrolled_at' => now(),
    ]);
    $assessment = buildAssessmentWithTwoQuestions($course);

    $attempt = $this->service->startAttempt($user, $assessment);

    expect($attempt->status)->toBe('in_progress');
    expect($attempt->user_id)->toBe($user->id);
});

it('resumes existing in_progress attempt rather than creating a duplicate', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create();
    Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => 'active',
        'enrolled_at' => now(),
    ]);
    $assessment = buildAssessmentWithTwoQuestions($course);

    $first = $this->service->startAttempt($user, $assessment);
    $second = $this->service->startAttempt($user, $assessment);

    expect($first->id)->toBe($second->id);
    expect(AssessmentAttempt::count())->toBe(1);
});

it('blocks starting once max_attempts is reached', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create();
    Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => 'active',
        'enrolled_at' => now(),
    ]);
    $assessment = buildAssessmentWithTwoQuestions($course, maxAttempts: 2);

    // Simulate 2 submitted attempts
    AssessmentAttempt::factory()->create([
        'assessment_id' => $assessment->id,
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => 'submitted',
    ]);
    AssessmentAttempt::factory()->create([
        'assessment_id' => $assessment->id,
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => 'submitted',
    ]);

    expect(fn () => $this->service->startAttempt($user, $assessment))
        ->toThrow(RuntimeException::class, 'batas maksimal');
});

it('refuses to start when the user is not enrolled', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create();
    $assessment = buildAssessmentWithTwoQuestions($course);

    expect(fn () => $this->service->startAttempt($user, $assessment))
        ->toThrow(RuntimeException::class, 'belum terdaftar');
});

it('scores submitted answers and marks attempt as passed when above threshold', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create();
    Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => 'active',
        'enrolled_at' => now(),
    ]);
    $assessment = buildAssessmentWithTwoQuestions($course, passingScore: 70);

    $attempt = $this->service->startAttempt($user, $assessment);

    $questions = $assessment->questions;
    $correctOptionIds = $questions->mapWithKeys(fn ($q) => [
        $q->id => $q->options->firstWhere('is_correct', true)->id,
    ])->all();

    $result = $this->service->submitAttempt($attempt, $correctOptionIds);

    expect($result->status)->toBe('submitted');
    expect($result->score)->toBe(100);
    expect($result->passed)->toBeTrue();
});

it('marks attempt as failed when score is below passing_score', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create();
    Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => 'active',
        'enrolled_at' => now(),
    ]);
    $assessment = buildAssessmentWithTwoQuestions($course, passingScore: 80);

    $attempt = $this->service->startAttempt($user, $assessment);

    // Answer all wrong: pick second (incorrect) option for each
    $wrongAnswers = $assessment->questions->mapWithKeys(fn ($q) => [
        $q->id => $q->options->firstWhere('is_correct', false)->id,
    ])->all();

    $result = $this->service->submitAttempt($attempt, $wrongAnswers);

    expect($result->score)->toBe(0);
    expect($result->passed)->toBeFalse();
});

it('updates enrollment.pre_test_status when pre_test is submitted', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create();
    $enrollment = Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => 'active',
        'enrolled_at' => now(),
    ]);
    $assessment = buildAssessmentWithTwoQuestions($course, type: 'pre_test', passingScore: 70);

    $attempt = $this->service->startAttempt($user, $assessment);
    $correctAnswers = $assessment->questions->mapWithKeys(fn ($q) => [
        $q->id => $q->options->firstWhere('is_correct', true)->id,
    ])->all();

    $this->service->submitAttempt($attempt, $correctAnswers);

    expect($enrollment->fresh()->pre_test_status)->toBe('passed');
    expect($enrollment->fresh()->status)->toBe('active'); // pre_test does NOT complete
});

it('completes enrollment + issues cert when post_test passes AND lessons are done', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create([
        'is_certified' => true,
        'post_test_required' => true,
    ]);
    $enrollment = Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => 'active',
        'progress_percent' => 100, // lessons already done
        'enrolled_at' => now(),
    ]);
    $assessment = buildAssessmentWithTwoQuestions($course, type: 'post_test');

    $attempt = $this->service->startAttempt($user, $assessment);
    $correctAnswers = $assessment->questions->mapWithKeys(fn ($q) => [
        $q->id => $q->options->firstWhere('is_correct', true)->id,
    ])->all();

    $this->service->submitAttempt($attempt, $correctAnswers);

    $fresh = $enrollment->fresh();
    expect($fresh->post_test_status)->toBe('passed');
    expect($fresh->status)->toBe('completed');
    expect($fresh->completed_at)->not->toBeNull();
    expect(Certificate::where('user_id', $user->id)->count())->toBe(1);
});

it('does not complete enrollment when post_test passes but lessons are not done', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['post_test_required' => true]);
    $enrollment = Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => 'active',
        'progress_percent' => 50,
        'enrolled_at' => now(),
    ]);
    $assessment = buildAssessmentWithTwoQuestions($course, type: 'post_test');

    $attempt = $this->service->startAttempt($user, $assessment);
    $correctAnswers = $assessment->questions->mapWithKeys(fn ($q) => [
        $q->id => $q->options->firstWhere('is_correct', true)->id,
    ])->all();

    $this->service->submitAttempt($attempt, $correctAnswers);

    $fresh = $enrollment->fresh();
    expect($fresh->post_test_status)->toBe('passed');
    expect($fresh->status)->toBe('active');
});

it('lessons reaching 100% do NOT auto-complete when course requires post_test that has not passed', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['post_test_required' => true]);

    // Create the post-test assessment so `course->postTest()->exists()` is true
    Assessment::factory()->postTest()->create(['course_id' => $course->id]);

    $lesson = Lesson::factory()->create([
        'course_id' => $course->id,
        'is_required' => true,
    ]);
    Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => 'active',
        'progress_percent' => 0,
        'enrolled_at' => now(),
    ]);

    app(MarkLessonComplete::class)->execute($user, $lesson);

    $fresh = Enrollment::where('user_id', $user->id)->first();
    expect($fresh->progress_percent)->toBe(100);
    expect($fresh->status)->toBe('active');
});
