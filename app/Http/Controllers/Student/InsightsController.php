<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\LearningStreak;
use App\Models\Lesson;
use App\Models\LessonProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Personal learning analytics dashboard. Estimates time-on-task from completed
 * lesson durations rather than per-second heartbeats — accuracy trade for
 * simplicity (no extra writes during playback). Future heartbeat tracking can
 * promote `time_spent_seconds` to the source of truth.
 */
class InsightsController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $weeksWindow = (int) $request->integer('weeks', 12);
        if (! in_array($weeksWindow, [4, 12, 26], true)) {
            $weeksWindow = 12;
        }
        $daysWindow = (int) $request->integer('days', 30);
        if (! in_array($daysWindow, [7, 30, 90], true)) {
            $daysWindow = 30;
        }

        $progresses = LessonProgress::query()
            ->where('user_id', $user->id)
            ->with(['lesson:id,course_id,duration_minutes,title', 'course:id,title,slug,thumbnail'])
            ->get();

        $completed = $progresses->where('status', 'completed');

        // Total time learned = sum lesson.duration_minutes for completed lessons
        // + partial estimate for in-progress (progress_percent × duration).
        $totalMinutes = $completed->sum(fn ($p) => (int) ($p->lesson?->duration_minutes ?? 0))
            + $progresses->where('status', '!=', 'completed')
                ->sum(fn ($p) => (int) (($p->lesson?->duration_minutes ?? 0) * ($p->progress_percent / 100)));

        $totalMinutes = (int) round($totalMinutes);

        // Per-course breakdown
        $perCourse = $completed
            ->groupBy(fn ($p) => $p->course_id)
            ->map(function ($items, $courseId) use ($progresses) {
                $course = $items->first()->course;
                $minutes = $items->sum(fn ($p) => (int) ($p->lesson?->duration_minutes ?? 0));
                $totalLessons = Lesson::query()->where('course_id', $courseId)->count();
                $completedLessons = $items->count();
                $inProgress = $progresses->where('course_id', $courseId)
                    ->where('status', '!=', 'completed')->count();

                return [
                    'course_id' => $courseId,
                    'title' => $course?->title,
                    'slug' => $course?->slug,
                    'thumbnail' => $course?->thumbnail,
                    'minutes' => $minutes,
                    'lessons_completed' => $completedLessons,
                    'lessons_in_progress' => $inProgress,
                    'lessons_total' => $totalLessons,
                    'percent' => $totalLessons > 0
                        ? (int) round(($completedLessons / $totalLessons) * 100)
                        : 0,
                ];
            })
            ->sortByDesc('minutes')
            ->values()
            ->take(8);

        // Daily activity for selected window
        $startTimeline = Carbon::now()->subDays($daysWindow - 1)->startOfDay();
        $timelineRaw = $completed
            ->filter(fn ($p) => $p->completed_at && $p->completed_at->gte($startTimeline))
            ->groupBy(fn ($p) => $p->completed_at->toDateString());

        $timeline = collect();
        for ($i = 0; $i < $daysWindow; $i++) {
            $date = $startTimeline->copy()->addDays($i);
            $key = $date->toDateString();
            $items = $timelineRaw->get($key, collect());
            $timeline->push([
                'date' => $key,
                'label' => $date->isoFormat('D MMM'),
                'lessons' => $items->count(),
                'minutes' => (int) $items->sum(fn ($p) => (int) ($p->lesson?->duration_minutes ?? 0)),
            ]);
        }

        // Weekly aggregation for selected window
        $weekStart = Carbon::now()->startOfWeek(Carbon::MONDAY)->subWeeks($weeksWindow - 1);
        $weeklyRaw = $completed
            ->filter(fn ($p) => $p->completed_at && $p->completed_at->gte($weekStart))
            ->groupBy(fn ($p) => $p->completed_at->copy()->startOfWeek(Carbon::MONDAY)->toDateString());

        $weekly = collect();
        for ($i = 0; $i < $weeksWindow; $i++) {
            $start = $weekStart->copy()->addWeeks($i);
            $end = $start->copy()->endOfWeek(Carbon::SUNDAY);
            $key = $start->toDateString();
            $items = $weeklyRaw->get($key, collect());
            $activeDays = $items->groupBy(fn ($p) => $p->completed_at->toDateString())->count();
            $weekly->push([
                'week_start' => $key,
                'label' => $start->isoFormat('D MMM'),
                'range' => $start->isoFormat('D MMM').' - '.$end->isoFormat('D MMM'),
                'lessons' => $items->count(),
                'minutes' => (int) $items->sum(fn ($p) => (int) ($p->lesson?->duration_minutes ?? 0)),
                'active_days' => $activeDays,
            ]);
        }

        $streak = LearningStreak::query()->where('user_id', $user->id)->first();

        // Most active day of week (over completed lessons)
        $byDow = $completed
            ->filter(fn ($p) => $p->completed_at)
            ->groupBy(fn ($p) => $p->completed_at->dayOfWeek)
            ->map(fn ($items) => $items->count());
        $dowLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        $dayOfWeek = collect();
        for ($d = 0; $d < 7; $d++) {
            $dayOfWeek->push([
                'label' => $dowLabels[$d],
                'count' => (int) ($byDow[$d] ?? 0),
            ]);
        }

        $enrolledCount = Enrollment::query()->where('user_id', $user->id)->count();
        $completedCourses = Enrollment::query()
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->count();

        return Inertia::render('student/my-insights/index', [
            'stats' => [
                'total_minutes' => $totalMinutes,
                'total_hours' => round($totalMinutes / 60, 1),
                'lessons_completed' => $completed->count(),
                'courses_enrolled' => $enrolledCount,
                'courses_completed' => $completedCourses,
                'current_streak' => (int) ($streak?->current_streak ?? 0),
                'longest_streak' => (int) ($streak?->longest_streak ?? 0),
                'last_active_date' => $streak?->last_active_date?->toDateString(),
            ],
            'perCourse' => $perCourse,
            'timeline' => $timeline,
            'weekly' => $weekly,
            'dayOfWeek' => $dayOfWeek,
            'filters' => [
                'weeks' => $weeksWindow,
                'days' => $daysWindow,
            ],
        ]);
    }
}
