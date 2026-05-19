<?php

namespace App\Services\Business;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use App\Notifications\TrainingAssigned;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

/**
 * Tugaskan satu course ke banyak karyawan sekaligus.
 *
 * Idempotent: karyawan yang sudah enroll dilewati di tahap commit.
 * Tahap preview dipakai HR untuk lihat efeknya sebelum klik konfirmasi.
 */
final class BulkEnrollmentService
{
    /**
     * @param  list<int>  $userIds
     * @return array{
     *   rows: list<array<string,mixed>>,
     *   summary: array{total:int, will_enroll:int, already_enrolled:int}
     * }
     */
    public function previewForCourse(Course $course, array $userIds): array
    {
        $userIds = array_values(array_unique(array_filter($userIds, fn ($id) => is_numeric($id))));

        if ($userIds === []) {
            return [
                'rows' => [],
                'summary' => ['total' => 0, 'will_enroll' => 0, 'already_enrolled' => 0],
            ];
        }

        $users = User::query()
            ->whereIn('id', $userIds)
            ->with('employeeProfile.position:id,name')
            ->get(['id', 'name', 'email']);

        $alreadyEnrolled = Enrollment::query()
            ->where('course_id', $course->id)
            ->whereIn('user_id', $userIds)
            ->pluck('user_id')
            ->all();

        $rows = $users->map(function (User $u) use ($alreadyEnrolled) {
            $isEnrolled = in_array($u->id, $alreadyEnrolled, true);

            return [
                'user_id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'position' => $u->employeeProfile?->position?->name,
                'status' => $isEnrolled ? 'already_enrolled' : 'will_enroll',
            ];
        })->all();

        $willEnroll = count(array_filter($rows, fn ($r) => $r['status'] === 'will_enroll'));

        return [
            'rows' => array_values($rows),
            'summary' => [
                'total' => count($rows),
                'will_enroll' => $willEnroll,
                'already_enrolled' => count($rows) - $willEnroll,
            ],
        ];
    }

    /**
     * @param  list<int>  $userIds
     * @return array{enrolled:int, skipped:int}
     */
    public function commitForCourse(
        Course $course,
        array $userIds,
        ?CarbonInterface $dueAt = null,
        ?User $assignedBy = null,
    ): array {
        $userIds = array_values(array_unique(array_filter($userIds, fn ($id) => is_numeric($id))));
        if ($userIds === []) {
            return ['enrolled' => 0, 'skipped' => 0];
        }

        $alreadyEnrolled = Enrollment::query()
            ->where('course_id', $course->id)
            ->whereIn('user_id', $userIds)
            ->pluck('user_id')
            ->all();

        $toEnroll = array_values(array_diff($userIds, $alreadyEnrolled));
        if ($toEnroll === []) {
            return ['enrolled' => 0, 'skipped' => count($alreadyEnrolled)];
        }

        $now = Carbon::now();
        $rows = collect($toEnroll)->map(fn (int $userId) => [
            'user_id' => $userId,
            'course_id' => $course->id,
            'status' => 'active',
            'progress_percent' => 0,
            'pre_test_status' => 'not_started',
            'post_test_status' => 'not_started',
            'certificate_status' => 'not_issued',
            'enrolled_at' => $now,
            'due_at' => $dueAt,
            'assigned_by_user_id' => $assignedBy?->id,
            'created_at' => $now,
            'updated_at' => $now,
        ])->all();

        DB::transaction(function () use ($rows, $toEnroll, $course) {
            Enrollment::insert($rows);
            Course::whereKey($course->id)->increment('total_students', count($toEnroll));
        });

        $this->notifyAssignees($course, $toEnroll, $dueAt, $assignedBy);

        return ['enrolled' => count($toEnroll), 'skipped' => count($alreadyEnrolled)];
    }

    /**
     * @param  list<int>  $userIds
     */
    private function notifyAssignees(
        Course $course,
        array $userIds,
        ?CarbonInterface $dueAt,
        ?User $assignedBy,
    ): void {
        /** @var Collection<int, User> $users */
        $users = User::query()->whereIn('id', $userIds)->get();
        if ($users->isEmpty()) {
            return;
        }

        Notification::send($users, new TrainingAssigned(
            courseId: $course->id,
            courseTitle: $course->title,
            courseSlug: $course->slug,
            dueAt: $dueAt,
            assignedByName: $assignedBy?->name,
        ));
    }
}
