<?php

use App\Actions\Learning\MarkLessonComplete;
use App\Models\Assessment;
use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\LearningStreak;
use App\Models\Lesson;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\User;
use App\Models\UserBadge;
use App\Services\Learning\AssessmentService;
use Database\Seeders\BadgeSeeder;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Http::fake([
        'app.mailketing.co.id/*' => Http::response(['status' => 'success'], 200),
    ]);
    config()->set('services.mailketing.api_key', 'test-key');
    $this->seed(BadgeSeeder::class);
});

it('marking a lesson complete records streak + awards milestone badges', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create();
    $section = CourseSection::create([
        'course_id' => $course->id,
        'title' => 'Bab 1',
        'sort_order' => 1,
    ]);
    $lesson = Lesson::factory()->create([
        'course_id' => $course->id,
        'course_section_id' => $section->id,
        'is_required' => true,
    ]);
    Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => 'active',
        'enrolled_at' => now(),
    ]);

    app(MarkLessonComplete::class)->execute($user, $lesson);

    // Streak recorded
    $streak = LearningStreak::where('user_id', $user->id)->first();
    expect($streak)->not->toBeNull();
    expect($streak->current_streak)->toBe(1);

    // 1 lesson done → course completes (only 1 required lesson) → milestone first-course
    expect(UserBadge::query()
        ->where('user_id', $user->id)
        ->whereHas('badge', fn ($q) => $q->where('slug', 'first-course'))
        ->exists())->toBeTrue();
});

it('passing assessment with 100% awards perfect-score badge', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create();
    Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => 'active',
        'enrolled_at' => now(),
    ]);

    $assessment = Assessment::factory()->create([
        'course_id' => $course->id,
        'type' => 'quiz',
        'passing_score' => 70,
    ]);
    $q = Question::factory()->create([
        'assessment_id' => $assessment->id,
        'points' => 1,
        'sort_order' => 1,
    ]);
    $correct = QuestionOption::factory()->correct()->create(['question_id' => $q->id]);
    QuestionOption::factory()->create(['question_id' => $q->id]);

    $service = app(AssessmentService::class);
    $attempt = $service->startAttempt($user, $assessment);
    $service->submitAttempt($attempt, [$q->id => $correct->id]);

    expect(UserBadge::query()
        ->where('user_id', $user->id)
        ->whereHas('badge', fn ($q) => $q->where('slug', 'perfect-score'))
        ->exists())->toBeTrue();
});

it('does not award perfect-score when score is below 100', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create();
    Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => 'active',
        'enrolled_at' => now(),
    ]);

    $assessment = Assessment::factory()->create([
        'course_id' => $course->id,
        'type' => 'quiz',
        'passing_score' => 70,
    ]);
    // 2 questions: get only 1 right → 50%
    $qa = Question::factory()->create(['assessment_id' => $assessment->id, 'sort_order' => 1, 'points' => 1]);
    $qaCorrect = QuestionOption::factory()->correct()->create(['question_id' => $qa->id]);
    QuestionOption::factory()->create(['question_id' => $qa->id]);

    $qb = Question::factory()->create(['assessment_id' => $assessment->id, 'sort_order' => 2, 'points' => 1]);
    QuestionOption::factory()->correct()->create(['question_id' => $qb->id]);
    $qbWrong = QuestionOption::factory()->create(['question_id' => $qb->id]);

    $service = app(AssessmentService::class);
    $attempt = $service->startAttempt($user, $assessment);
    $service->submitAttempt($attempt, [$qa->id => $qaCorrect->id, $qb->id => $qbWrong->id]);

    expect(UserBadge::query()
        ->where('user_id', $user->id)
        ->whereHas('badge', fn ($q) => $q->where('slug', 'perfect-score'))
        ->exists())->toBeFalse();
});
