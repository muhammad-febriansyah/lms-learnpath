<?php

namespace App\Services\Learning;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LearningPath;
use App\Models\LearningPathEnrollment;
use App\Models\User;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;

/**
 * Handles user enrollment to a LearningPath and progress aggregation
 * across the path's underlying course enrollments.
 */
final class PathEnrollmentService
{
    /**
     * Enroll the user into the path. Side-effect: also creates child
     * Enrollment rows for each course in the path that the user is not
     * yet enrolled in. Idempotent.
     *
     * @return array{path_enrolled: bool, child_enrollments_created: int}
     */
    public function enroll(User $user, LearningPath $path): array
    {
        $courseIds = $path->courses()->pluck('courses.id');

        return DB::transaction(function () use ($user, $path, $courseIds) {
            $pathEnrollment = LearningPathEnrollment::firstOrCreate(
                ['user_id' => $user->id, 'learning_path_id' => $path->id],
                [
                    'status' => 'active',
                    'progress_percent' => 0,
                    'courses_completed' => 0,
                    'enrolled_at' => now(),
                ],
            );

            $alreadyEnrolledCourseIds = Enrollment::query()
                ->where('user_id', $user->id)
                ->whereIn('course_id', $courseIds)
                ->pluck('course_id')
                ->all();

            $missing = $courseIds->diff($alreadyEnrolledCourseIds);

            if ($missing->isNotEmpty()) {
                $now = now();
                Enrollment::insert(
                    $missing->map(fn (int $courseId) => [
                        'user_id' => $user->id,
                        'course_id' => $courseId,
                        'status' => 'active',
                        'progress_percent' => 0,
                        'pre_test_status' => 'not_started',
                        'post_test_status' => 'not_started',
                        'certificate_status' => 'not_issued',
                        'enrolled_at' => $now,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ])->all(),
                );

                Course::whereIn('id', $missing)->increment('total_students');
            }

            $isNew = $pathEnrollment->wasRecentlyCreated;
            if ($isNew) {
                $path->increment('total_students');
            }

            $this->recomputeProgress($user, $path, $pathEnrollment);

            return [
                'path_enrolled' => $isNew,
                'child_enrollments_created' => $missing->count(),
            ];
        });
    }

    /**
     * Aggregate progress from child Enrollment rows into the
     * LearningPathEnrollment. Returns updated progress percent.
     */
    public function recomputeProgress(
        User $user,
        LearningPath $path,
        ?LearningPathEnrollment $pathEnrollment = null,
    ): int {
        $pathEnrollment ??= LearningPathEnrollment::query()
            ->where('user_id', $user->id)
            ->where('learning_path_id', $path->id)
            ->first();

        if (! $pathEnrollment) {
            return 0;
        }

        $courseIds = $path->courses()->pluck('courses.id');
        $total = $courseIds->count();

        if ($total === 0) {
            $pathEnrollment->update(['progress_percent' => 0, 'courses_completed' => 0]);

            return 0;
        }

        $childEnrollments = Enrollment::query()
            ->where('user_id', $user->id)
            ->whereIn('course_id', $courseIds)
            ->get(['status', 'progress_percent']);

        $sumProgress = $childEnrollments->sum(fn ($e) => (int) $e->progress_percent);
        $completed = $childEnrollments->where('status', 'completed')->count();
        $progress = (int) round($sumProgress / $total);
        $progress = max(0, min(100, $progress));

        $update = [
            'progress_percent' => $progress,
            'courses_completed' => $completed,
        ];

        if ($progress > 0 && ! $pathEnrollment->started_at) {
            $update['started_at'] = now();
        }

        $justCompleted = false;
        if ($completed === $total && $pathEnrollment->status !== 'completed') {
            $update['status'] = 'completed';
            $update['completed_at'] = now();
            $justCompleted = true;
        }

        $pathEnrollment->update($update);

        if ($justCompleted) {
            App::make(CertificateIssuanceService::class)
                ->issueForPathEnrollment($pathEnrollment->fresh());

            App::make(\App\Services\Gamification\BadgeAwardingService::class)
                ->evaluateForUser($user);
        }

        return $progress;
    }
}
