<?php

use App\Models\LearningStreak;
use App\Models\User;
use App\Services\Gamification\StreakService;
use Illuminate\Support\Carbon;

beforeEach(function () {
    $this->service = app(StreakService::class);
});

it('starts a fresh streak at 1 on first activity', function () {
    $user = User::factory()->create();

    $streak = $this->service->recordActivity($user, Carbon::parse('2026-05-15 10:00'));

    expect($streak->current_streak)->toBe(1);
    expect($streak->longest_streak)->toBe(1);
    expect((string) $streak->last_active_date->toDateString())->toBe('2026-05-15');
});

it('is idempotent within the same day', function () {
    $user = User::factory()->create();

    $this->service->recordActivity($user, Carbon::parse('2026-05-15 09:00'));
    $this->service->recordActivity($user, Carbon::parse('2026-05-15 21:00'));

    $streak = LearningStreak::where('user_id', $user->id)->first();
    expect($streak->current_streak)->toBe(1);
});

it('increments streak on consecutive day', function () {
    $user = User::factory()->create();

    $this->service->recordActivity($user, Carbon::parse('2026-05-13 10:00'));
    $this->service->recordActivity($user, Carbon::parse('2026-05-14 10:00'));
    $this->service->recordActivity($user, Carbon::parse('2026-05-15 10:00'));

    $streak = LearningStreak::where('user_id', $user->id)->first();
    expect($streak->current_streak)->toBe(3);
    expect($streak->longest_streak)->toBe(3);
});

it('resets streak when a day is missed', function () {
    $user = User::factory()->create();

    $this->service->recordActivity($user, Carbon::parse('2026-05-13 10:00'));
    $this->service->recordActivity($user, Carbon::parse('2026-05-14 10:00'));
    // Skip 15 and 16
    $this->service->recordActivity($user, Carbon::parse('2026-05-17 10:00'));

    $streak = LearningStreak::where('user_id', $user->id)->first();
    expect($streak->current_streak)->toBe(1);
    expect($streak->longest_streak)->toBe(2); // longest preserved
});

it('preserves the longest streak across resets', function () {
    $user = User::factory()->create();

    foreach (range(10, 14) as $day) {
        $this->service->recordActivity($user, Carbon::parse("2026-05-{$day} 10:00"));
    }
    // Gap
    $this->service->recordActivity($user, Carbon::parse('2026-05-20 10:00'));

    $streak = LearningStreak::where('user_id', $user->id)->first();
    expect($streak->current_streak)->toBe(1);
    expect($streak->longest_streak)->toBe(5);
});
