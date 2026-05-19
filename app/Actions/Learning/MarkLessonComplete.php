<?php

namespace App\Actions\Learning;

use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\User;
use App\Services\Gamification\BadgeAwardingService;
use App\Services\Gamification\PointService;
use App\Services\Gamification\StreakService;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;

/**
 * Tandai lesson sebagai selesai untuk user tertentu + hitung ulang progress course.
 */
final class MarkLessonComplete
{
    public function execute(User $user, Lesson $lesson): array
    {
        return DB::transaction(function () use ($user, $lesson) {
            $existing = LessonProgress::query()
                ->where('user_id', $user->id)
                ->where('lesson_id', $lesson->id)
                ->first();

            $progress = LessonProgress::query()->updateOrCreate(
                [
                    'user_id' => $user->id,
                    'lesson_id' => $lesson->id,
                ],
                [
                    'course_id' => $lesson->course_id,
                    'status' => 'completed',
                    'progress_percent' => 100,
                    'completed_at' => now(),
                    'started_at' => $existing?->started_at ?? now(),
                ],
            );

            // Recalculate course progress
            $totalLessons = Lesson::where('course_id', $lesson->course_id)
                ->where('is_required', true)
                ->count();
            $completedLessons = LessonProgress::query()
                ->where('user_id', $user->id)
                ->where('course_id', $lesson->course_id)
                ->where('status', 'completed')
                ->whereHas('lesson', fn ($q) => $q->where('is_required', true))
                ->count();

            $progressPercent = $totalLessons > 0
                ? min(100, (int) round(($completedLessons / $totalLessons) * 100))
                : 0;

            $enrollment = Enrollment::query()
                ->where('user_id', $user->id)
                ->where('course_id', $lesson->course_id)
                ->with('course')
                ->first();

            if ($enrollment) {
                $update = [
                    'progress_percent' => $progressPercent,
                    'started_at' => $enrollment->started_at ?? now(),
                ];

                if ($progressPercent >= 100 && $enrollment->status !== 'completed') {
                    $course = $enrollment->course;
                    $needsPostTest = $course?->post_test_required
                        && $course->postTest()->exists();
                    $postTestPassed = $enrollment->post_test_status === 'passed';

                    if (! $needsPostTest || $postTestPassed) {
                        $update['status'] = 'completed';
                        $update['completed_at'] = now();
                    }
                }

                $enrollment->update($update);
            }

            $result = [
                'progress' => $progress->fresh(),
                'course_progress_percent' => $progressPercent,
                'enrollment_status' => $enrollment?->fresh()->status,
            ];

            // Gamification side-effects (idempotent per day)
            App::make(StreakService::class)->recordActivity($user);

            $points = App::make(PointService::class);
            $points->award($user, 'lesson_complete', $lesson);

            if (
                $enrollment
                && $enrollment->fresh()?->status === 'completed'
            ) {
                $points->award($user, 'course_complete', $enrollment);
            }

            App::make(BadgeAwardingService::class)->evaluateForUser($user);

            return $result;
        });
    }
}
