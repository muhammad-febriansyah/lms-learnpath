<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\SkillGap;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LearnerDashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        if ($user->hasRole('employee')) {
            return $this->employeeDashboard($user);
        }

        if ($user->hasRole('user_public')) {
            return $this->userPublicDashboard($user);
        }

        // Fallback: render the legacy dashboard for users without explicit B2B/B2C role.
        return Inertia::render('dashboard');
    }

    private function employeeDashboard(User $user): Response
    {
        $totalEnrolled = Enrollment::where('user_id', $user->id)->count();
        $inProgress = Enrollment::where('user_id', $user->id)
            ->where('status', 'active')
            ->count();
        $completed = Enrollment::where('user_id', $user->id)
            ->where('status', 'completed')
            ->count();
        $totalCertificates = Certificate::where('user_id', $user->id)->count();

        $totalSkillGaps = SkillGap::where('user_id', $user->id)->count();
        $criticalGaps = SkillGap::where('user_id', $user->id)
            ->where('gap', '>=', 2)
            ->count();

        $recentEnrollments = Enrollment::query()
            ->where('user_id', $user->id)
            ->with(['course:id,title,slug,thumbnail'])
            ->latest('enrolled_at')
            ->limit(5)
            ->get(['id', 'course_id', 'status', 'progress_percent', 'enrolled_at']);

        $topGaps = SkillGap::query()
            ->where('user_id', $user->id)
            ->where('gap', '>', 0)
            ->with(['competency:id,name,category'])
            ->orderByDesc('gap')
            ->limit(5)
            ->get();

        return Inertia::render('dashboard-employee', [
            'employee' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
            'stats' => [
                'total_enrolled' => $totalEnrolled,
                'in_progress' => $inProgress,
                'completed' => $completed,
                'completion_rate' => $totalEnrolled > 0
                    ? round(($completed / $totalEnrolled) * 100, 1)
                    : 0,
                'total_certificates' => $totalCertificates,
                'total_skill_gaps' => $totalSkillGaps,
                'critical_gaps' => $criticalGaps,
            ],
            'recentEnrollments' => $recentEnrollments,
            'topGaps' => $topGaps,
        ]);
    }

    private function userPublicDashboard(User $user): Response
    {
        $totalCourses = Enrollment::where('user_id', $user->id)->count();
        $inProgress = Enrollment::where('user_id', $user->id)
            ->where('status', 'active')
            ->count();
        $completed = Enrollment::where('user_id', $user->id)
            ->where('status', 'completed')
            ->count();
        $totalCertificates = Certificate::where('user_id', $user->id)->count();

        $totalOrders = Order::where('user_id', $user->id)->count();
        $totalSpent = (int) Order::where('user_id', $user->id)
            ->where('status', 'paid')
            ->sum('total');

        $recentEnrollments = Enrollment::query()
            ->where('user_id', $user->id)
            ->with(['course:id,title,slug,thumbnail'])
            ->latest('enrolled_at')
            ->limit(5)
            ->get(['id', 'course_id', 'status', 'progress_percent', 'enrolled_at']);

        $recentOrders = Order::query()
            ->where('user_id', $user->id)
            ->latest('id')
            ->limit(5)
            ->get(['id', 'order_number', 'total', 'status', 'created_at']);

        return Inertia::render('dashboard-user-public', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
            'stats' => [
                'total_courses' => $totalCourses,
                'in_progress' => $inProgress,
                'completed' => $completed,
                'total_certificates' => $totalCertificates,
                'total_orders' => $totalOrders,
                'total_spent' => $totalSpent,
            ],
            'recentEnrollments' => $recentEnrollments,
            'recentOrders' => $recentOrders,
        ]);
    }
}
