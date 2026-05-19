<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MyStudentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user->hasRole('instructor'), 403);

        $myCourseIds = Course::query()
            ->forInstructor($user->id)
            ->pluck('id');

        $enrollments = Enrollment::query()
            ->with([
                'user:id,name,email,avatar_path',
                'course:id,title,slug',
            ])
            ->whereIn('course_id', $myCourseIds)
            ->when($request->integer('course_id'), function ($q, $id) {
                $q->where('course_id', $id);
            })
            ->when($request->string('search')->toString(), function ($q, $search) {
                $q->whereHas('user', function ($qq) use ($search) {
                    $qq->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->latest('enrolled_at')
            ->paginate(15)
            ->withQueryString();

        $courseOptions = Course::query()
            ->forInstructor($user->id)
            ->orderBy('title')
            ->get(['id', 'title']);

        return Inertia::render('admin/my-students/index', [
            'enrollments' => $enrollments,
            'courseOptions' => $courseOptions,
            'filters' => $request->only('search', 'course_id'),
            'stats' => [
                'total_enrollments' => Enrollment::whereIn('course_id', $myCourseIds)->count(),
                'total_courses' => $myCourseIds->count(),
                'active_this_week' => Enrollment::whereIn('course_id', $myCourseIds)
                    ->where('updated_at', '>=', now()->subWeek())
                    ->count(),
            ],
        ]);
    }
}
