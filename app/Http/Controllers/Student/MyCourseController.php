<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MyCourseController extends Controller
{
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;

        $enrollments = Enrollment::query()
            ->where('user_id', $userId)
            ->with([
                'course:id,title,subtitle,slug,thumbnail,duration_minutes,total_students',
                'course.category:id,name',
                'course.instructor:id,name',
            ])
            ->when($request->string('status')->toString(), function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest('enrolled_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('student/my-courses/index', [
            'enrollments' => $enrollments,
            'filters' => $request->only('status'),
            'stats' => [
                'total' => Enrollment::where('user_id', $userId)->count(),
                'in_progress' => Enrollment::where('user_id', $userId)
                    ->where('status', 'active')
                    ->where('progress_percent', '>', 0)
                    ->count(),
                'completed' => Enrollment::where('user_id', $userId)
                    ->where('status', 'completed')
                    ->count(),
                'not_started' => Enrollment::where('user_id', $userId)
                    ->where('progress_percent', 0)
                    ->count(),
            ],
        ]);
    }
}
