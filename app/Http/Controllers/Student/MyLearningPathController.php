<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\LearningPath;
use App\Models\LearningPathEnrollment;
use App\Services\Learning\PathEnrollmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MyLearningPathController extends Controller
{
    public function __construct(
        private readonly PathEnrollmentService $service,
    ) {}

    public function index(Request $request): Response
    {
        $userId = $request->user()->id;

        $enrollments = LearningPathEnrollment::query()
            ->where('user_id', $userId)
            ->with([
                'learningPath:id,title,slug,subtitle,thumbnail,level,duration_weeks,total_courses',
                'learningPath.position:id,name',
            ])
            ->latest('enrolled_at')
            ->paginate(12)
            ->withQueryString();

        $stats = [
            'total' => LearningPathEnrollment::where('user_id', $userId)->count(),
            'in_progress' => LearningPathEnrollment::where('user_id', $userId)
                ->where('status', 'active')
                ->where('progress_percent', '>', 0)
                ->count(),
            'completed' => LearningPathEnrollment::where('user_id', $userId)
                ->where('status', 'completed')
                ->count(),
            'not_started' => LearningPathEnrollment::where('user_id', $userId)
                ->where('progress_percent', 0)
                ->count(),
        ];

        return Inertia::render('student/my-paths/index', [
            'enrollments' => $enrollments,
            'stats' => $stats,
        ]);
    }

    public function enroll(Request $request, LearningPath $path): RedirectResponse
    {
        abort_unless($path->is_published, 404);

        $result = $this->service->enroll($request->user(), $path);

        if (! $result['path_enrolled'] && $result['child_enrollments_created'] === 0) {
            return redirect()
                ->route('paths.show', $path)
                ->with('info', 'Anda sudah terdaftar di path ini.');
        }

        $message = $result['child_enrollments_created'] > 0
            ? "Berhasil enroll. {$result['child_enrollments_created']} course otomatis ditambahkan ke akun Anda."
            : 'Berhasil enroll path ini.';

        return redirect()
            ->route('paths.show', $path)
            ->with('success', $message);
    }
}
