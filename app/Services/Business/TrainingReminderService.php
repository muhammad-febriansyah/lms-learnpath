<?php

namespace App\Services\Business;

use App\Models\Enrollment;
use App\Notifications\TrainingDueReminder;
use Illuminate\Support\Carbon;

/**
 * Sends "training due" reminders at H-7, H-3, and H-0.
 *
 * Idempotent: each enrollment carries a `reminders_sent` JSON array of
 * milestone ints already dispatched. A daily cron can run this safely.
 */
final class TrainingReminderService
{
    /** @var list<int> */
    public const MILESTONES = [7, 3, 0];

    /**
     * @return array{processed:int, sent:int, by_milestone:array<int,int>}
     */
    public function dispatch(?Carbon $today = null): array
    {
        $today = ($today ?? Carbon::today())->copy()->startOfDay();

        $byMilestone = [];
        $sent = 0;
        $processed = 0;

        foreach (self::MILESTONES as $days) {
            $target = $today->copy()->addDays($days);
            $enrollments = Enrollment::query()
                ->whereNotNull('due_at')
                ->whereBetween('due_at', [$target->copy()->startOfDay(), $target->copy()->endOfDay()])
                ->whereIn('status', ['active', 'in_progress'])
                ->with(['user', 'course:id,title,slug'])
                ->get();

            $milestoneSent = 0;
            foreach ($enrollments as $enrollment) {
                $processed++;
                $already = $enrollment->reminders_sent ?? [];
                if (in_array($days, $already, true)) {
                    continue;
                }

                if (! $enrollment->user || ! $enrollment->course) {
                    continue;
                }

                $enrollment->user->notify(new TrainingDueReminder(
                    courseId: $enrollment->course->id,
                    courseTitle: $enrollment->course->title,
                    courseSlug: $enrollment->course->slug,
                    dueAt: $enrollment->due_at,
                    daysUntilDue: $days,
                ));

                $already[] = $days;
                $enrollment->forceFill(['reminders_sent' => array_values(array_unique($already))])->save();

                $milestoneSent++;
                $sent++;
            }
            $byMilestone[$days] = $milestoneSent;
        }

        return [
            'processed' => $processed,
            'sent' => $sent,
            'by_milestone' => $byMilestone,
        ];
    }
}
