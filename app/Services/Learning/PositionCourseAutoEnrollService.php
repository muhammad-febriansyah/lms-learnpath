<?php

namespace App\Services\Learning;

use App\Models\Course;
use App\Models\CourseCompetencyMapping;
use App\Models\EmployeeProfile;
use App\Models\Enrollment;
use App\Models\LearningPath;
use App\Models\Position;
use App\Models\PositionCompetencyTarget;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Enrolls users into published courses linked to their position via
 * PositionCompetencyTarget -> Competency -> CourseCompetencyMapping.
 *
 * Idempotent: never duplicates existing enrollments.
 */
final class PositionCourseAutoEnrollService
{
    public function __construct(
        private readonly PathEnrollmentService $pathEnrollment,
    ) {}

    /**
     * @return array{enrolled: int, skipped: int, course_ids: list<int>}
     */
    public function syncForUser(User $user, ?int $positionId = null): array
    {
        $positionId ??= $user->employeeProfile?->position_id;

        if (! $positionId) {
            return ['enrolled' => 0, 'skipped' => 0, 'course_ids' => []];
        }

        $courseIds = $this->resolveCourseIdsForPosition($positionId);

        if ($courseIds->isEmpty()) {
            return ['enrolled' => 0, 'skipped' => 0, 'course_ids' => []];
        }

        return $this->enrollUserToCourses($user, $courseIds);
    }

    /**
     * Enroll the user into every published LearningPath linked to their position.
     * Side-effect: each enrolled path will also create child course Enrollments
     * via PathEnrollmentService (idempotent).
     *
     * @return array{paths_enrolled: int, child_courses_created: int, path_ids: list<int>}
     */
    public function syncPathsForUser(User $user, ?int $positionId = null): array
    {
        $positionId ??= $user->employeeProfile?->position_id;

        if (! $positionId) {
            return ['paths_enrolled' => 0, 'child_courses_created' => 0, 'path_ids' => []];
        }

        $paths = LearningPath::query()
            ->where('position_id', $positionId)
            ->where('is_published', true)
            ->get();

        if ($paths->isEmpty()) {
            return ['paths_enrolled' => 0, 'child_courses_created' => 0, 'path_ids' => []];
        }

        $newlyEnrolledPathIds = [];
        $totalChildCoursesCreated = 0;

        foreach ($paths as $path) {
            $result = $this->pathEnrollment->enroll($user, $path);
            if ($result['path_enrolled']) {
                $newlyEnrolledPathIds[] = $path->id;
            }
            $totalChildCoursesCreated += $result['child_enrollments_created'];
        }

        return [
            'paths_enrolled' => count($newlyEnrolledPathIds),
            'child_courses_created' => $totalChildCoursesCreated,
            'path_ids' => $newlyEnrolledPathIds,
        ];
    }

    /**
     * Re-sync every employee that holds this position to its mapped courses.
     *
     * @return array{enrolled: int, users: int}
     */
    public function syncForPosition(Position $position): array
    {
        $courseIds = $this->resolveCourseIdsForPosition($position->id);

        if ($courseIds->isEmpty()) {
            return ['enrolled' => 0, 'users' => 0];
        }

        $userIds = EmployeeProfile::query()
            ->where('position_id', $position->id)
            ->pluck('user_id');

        $totalEnrolled = 0;

        foreach ($userIds as $userId) {
            $user = User::find($userId);
            if (! $user) {
                continue;
            }

            $result = $this->enrollUserToCourses($user, $courseIds);
            $totalEnrolled += $result['enrolled'];
        }

        return ['enrolled' => $totalEnrolled, 'users' => $userIds->count()];
    }

    /**
     * @return Collection<int, int>
     */
    private function resolveCourseIdsForPosition(int $positionId): Collection
    {
        $competencyIds = PositionCompetencyTarget::query()
            ->where('position_id', $positionId)
            ->where('is_required', true)
            ->pluck('competency_id');

        if ($competencyIds->isEmpty()) {
            return collect();
        }

        return CourseCompetencyMapping::query()
            ->whereIn('competency_id', $competencyIds)
            ->whereHas('course', fn ($q) => $q->where('is_published', true))
            ->pluck('course_id')
            ->unique()
            ->values();
    }

    /**
     * @param  Collection<int, int>  $courseIds
     * @return array{enrolled: int, skipped: int, course_ids: list<int>}
     */
    private function enrollUserToCourses(User $user, Collection $courseIds): array
    {
        $existing = Enrollment::query()
            ->where('user_id', $user->id)
            ->whereIn('course_id', $courseIds)
            ->pluck('course_id')
            ->all();

        $toEnroll = $courseIds->diff($existing)->values();

        if ($toEnroll->isEmpty()) {
            return ['enrolled' => 0, 'skipped' => count($existing), 'course_ids' => []];
        }

        $now = now();
        $rows = $toEnroll->map(fn (int $courseId) => [
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
        ])->all();

        DB::transaction(function () use ($rows, $toEnroll) {
            Enrollment::insert($rows);
            Course::whereIn('id', $toEnroll)->increment('total_students');
        });

        return [
            'enrolled' => $toEnroll->count(),
            'skipped' => count($existing),
            'course_ids' => $toEnroll->all(),
        ];
    }
}
