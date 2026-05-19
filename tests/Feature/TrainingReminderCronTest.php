<?php

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use App\Notifications\TrainingDueReminder;
use App\Services\Business\TrainingReminderService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    Notification::fake();

    $this->today = Carbon::create(2026, 6, 1, 0, 0, 0);
    Carbon::setTestNow($this->today);

    $this->user = User::factory()->create();
    $this->course = Course::factory()->create(['title' => 'Modul Risiko', 'slug' => 'modul-risiko']);
});

afterEach(function () {
    Carbon::setTestNow();
});

function makeEnrollment(array $overrides = []): Enrollment
{
    return Enrollment::create(array_merge([
        'user_id' => test()->user->id,
        'course_id' => test()->course->id,
        'status' => 'active',
        'progress_percent' => 0,
        'pre_test_status' => 'not_started',
        'post_test_status' => 'not_started',
        'certificate_status' => 'not_issued',
        'enrolled_at' => test()->today,
    ], $overrides));
}

it('sends H-7 / H-3 / H-0 reminders to learners with matching due_at', function () {
    makeEnrollment(['due_at' => test()->today->copy()->addDays(7)->endOfDay()]);
    makeEnrollment(['due_at' => test()->today->copy()->addDays(3)->endOfDay(),
        'user_id' => User::factory()->create()->id]);
    makeEnrollment(['due_at' => test()->today->copy()->endOfDay(),
        'user_id' => User::factory()->create()->id]);

    $result = app(TrainingReminderService::class)->dispatch(test()->today);

    expect($result['sent'])->toBe(3);
    expect($result['by_milestone'])->toBe([7 => 1, 3 => 1, 0 => 1]);
    Notification::assertSentTimes(TrainingDueReminder::class, 3);
});

it('is idempotent across runs — second invocation sends nothing new', function () {
    makeEnrollment(['due_at' => test()->today->copy()->addDays(7)->endOfDay()]);

    $svc = app(TrainingReminderService::class);
    $svc->dispatch(test()->today);
    $second = $svc->dispatch(test()->today);

    expect($second['sent'])->toBe(0);
    Notification::assertSentTimes(TrainingDueReminder::class, 1);
});

it('still sends H-3 later even if H-7 was already sent', function () {
    $enrollment = makeEnrollment(['due_at' => test()->today->copy()->addDays(7)->endOfDay()]);

    app(TrainingReminderService::class)->dispatch(test()->today);
    expect($enrollment->fresh()->reminders_sent)->toBe([7]);

    // 4 days later → due_at is now H-3 from "today"
    $later = test()->today->copy()->addDays(4);
    Carbon::setTestNow($later);

    $second = app(TrainingReminderService::class)->dispatch($later);
    expect($second['sent'])->toBe(1);
    expect($enrollment->fresh()->reminders_sent)->toBe([7, 3]);
    Notification::assertSentTimes(TrainingDueReminder::class, 2);
});

it('skips enrollments with no due_at', function () {
    makeEnrollment(['due_at' => null]);

    $result = app(TrainingReminderService::class)->dispatch(test()->today);

    expect($result['sent'])->toBe(0);
    Notification::assertNothingSent();
});

it('skips completed enrollments even if their due_at matches', function () {
    makeEnrollment([
        'due_at' => test()->today->copy()->endOfDay(),
        'status' => 'completed',
    ]);

    $result = app(TrainingReminderService::class)->dispatch(test()->today);

    expect($result['sent'])->toBe(0);
    Notification::assertNothingSent();
});

it('artisan command invokes the service and prints summary', function () {
    makeEnrollment(['due_at' => test()->today->copy()->addDays(7)->endOfDay()]);

    $this->artisan('training:send-due-reminders')
        ->expectsOutputToContain('Reminder cron selesai')
        ->expectsOutputToContain('H-7: 1 dikirim')
        ->assertSuccessful();
});
