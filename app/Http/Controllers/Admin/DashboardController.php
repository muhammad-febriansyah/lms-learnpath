<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Competency;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\OrganizationInvitation;
use App\Models\Payment;
use App\Models\Position;
use App\Models\Review;
use App\Models\SkillGap;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user->hasRole('instructor') && ! $user->hasAnyRole(['superadmin', 'admin_tenant', 'hr', 'supervisor'])) {
            return $this->mentorDashboard($user);
        }

        if ($user->hasRole('hr') && ! $user->hasAnyRole(['superadmin', 'admin_tenant'])) {
            return $this->hrDashboard($user);
        }

        $now = now();
        $monthStart = $now->copy()->startOfMonth();
        $lastMonthStart = $now->copy()->subMonth()->startOfMonth();
        $lastMonthEnd = $now->copy()->subMonth()->endOfMonth();

        // KPIs with month-over-month delta
        $thisMonthRevenue = (int) Order::query()
            ->where('status', 'paid')
            ->whereBetween('paid_at', [$monthStart, $now])
            ->sum('total');
        $lastMonthRevenue = (int) Order::query()
            ->where('status', 'paid')
            ->whereBetween('paid_at', [$lastMonthStart, $lastMonthEnd])
            ->sum('total');

        $thisMonthEnrolls = Enrollment::query()
            ->whereBetween('enrolled_at', [$monthStart, $now])
            ->count();
        $lastMonthEnrolls = Enrollment::query()
            ->whereBetween('enrolled_at', [$lastMonthStart, $lastMonthEnd])
            ->count();

        $thisMonthUsers = User::query()
            ->whereBetween('created_at', [$monthStart, $now])
            ->count();
        $lastMonthUsers = User::query()
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->count();

        $thisMonthCerts = Certificate::query()
            ->whereBetween('issued_at', [$monthStart, $now])
            ->count();
        $lastMonthCerts = Certificate::query()
            ->whereBetween('issued_at', [$lastMonthStart, $lastMonthEnd])
            ->count();

        $kpis = [
            'students' => [
                'total' => User::role('employee')->count(),
                'new_this_month' => $thisMonthUsers,
                'delta_pct' => $this->delta($thisMonthUsers, $lastMonthUsers),
            ],
            'courses' => [
                'total' => Course::count(),
                'published' => Course::where('is_published', true)->count(),
            ],
            'revenue' => [
                'this_month' => $thisMonthRevenue,
                'all_time' => (int) Order::where('status', 'paid')->sum('total'),
                'delta_pct' => $this->delta($thisMonthRevenue, $lastMonthRevenue),
            ],
            'enrollments' => [
                'this_month' => $thisMonthEnrolls,
                'completed_all_time' => Enrollment::where('status', 'completed')->count(),
                'delta_pct' => $this->delta($thisMonthEnrolls, $lastMonthEnrolls),
            ],
            'certificates' => [
                'this_month' => $thisMonthCerts,
                'delta_pct' => $this->delta($thisMonthCerts, $lastMonthCerts),
            ],
        ];

        // 14-day revenue trend
        $revenueTrend = Order::query()
            ->where('status', 'paid')
            ->where('paid_at', '>=', $now->copy()->subDays(14)->startOfDay())
            ->selectRaw('DATE(paid_at) as day, SUM(total) as revenue, COUNT(*) as orders')
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        // 14-day enrollment trend
        $enrollTrend = Enrollment::query()
            ->where('enrolled_at', '>=', $now->copy()->subDays(14)->startOfDay())
            ->selectRaw('DATE(enrolled_at) as day, COUNT(*) as c')
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        // Top 5 courses by enrollment all-time
        $topCourses = Course::query()
            ->select('courses.id', 'courses.title', 'courses.thumbnail', 'courses.price', 'courses.average_rating')
            ->selectSub(
                Enrollment::selectRaw('COUNT(*)')->whereColumn('enrollments.course_id', 'courses.id'),
                'enroll_count',
            )
            ->orderByDesc('enroll_count')
            ->limit(5)
            ->get();

        // Recent orders
        $recentOrders = Order::query()
            ->with('user:id,name,email')
            ->whereIn('status', ['paid', 'pending'])
            ->latest('id')
            ->limit(6)
            ->get(['id', 'order_number', 'user_id', 'customer_name', 'total', 'status', 'created_at', 'paid_at']);

        // Recent users
        $recentUsers = User::query()
            ->with('roles:id,name')
            ->latest('id')
            ->limit(6)
            ->get(['id', 'name', 'email', 'avatar_path', 'created_at']);

        // Pending action counts for shortcuts
        $pending = [
            'orders' => Order::where('status', 'pending')->count(),
            'ojt' => DB::table('ojt_assessments')->where('status', 'pending_review')->count(),
            'reviews' => DB::table('supervisor_reviews')->where('approval_status', 'pending_review')->count(),
            'public_reviews' => Review::where('is_public', false)->count(),
            'gaps' => SkillGap::where('status', 'gap')->count(),
        ];

        // Payment status breakdown
        $paymentStatus = Payment::query()
            ->groupBy('status')
            ->selectRaw('status, COUNT(*) as c')
            ->pluck('c', 'status');

        return Inertia::render('admin/dashboard', [
            'kpis' => $kpis,
            'revenueTrend' => $revenueTrend,
            'enrollTrend' => $enrollTrend,
            'topCourses' => $topCourses->map(fn ($c) => [
                'id' => $c->id,
                'title' => $c->title,
                'thumbnail' => $c->thumbnail,
                'price' => (int) $c->price,
                'rating' => (float) $c->average_rating,
                'enroll_count' => (int) $c->enroll_count,
            ]),
            'recentOrders' => $recentOrders->map(fn ($o) => [
                'id' => $o->id,
                'order_number' => $o->order_number,
                'customer' => $o->user?->name ?? $o->customer_name ?? '-',
                'email' => $o->user?->email,
                'total' => (int) $o->total,
                'status' => $o->status,
                'created_at' => $o->created_at?->toIso8601String(),
                'paid_at' => $o->paid_at?->toIso8601String(),
            ]),
            'recentUsers' => $recentUsers->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'avatar_url' => $u->avatar_url,
                'role' => $u->roles->first()?->name,
                'created_at' => $u->created_at?->toIso8601String(),
            ]),
            'pending' => $pending,
            'paymentStatus' => [
                'completed' => (int) ($paymentStatus['completed'] ?? 0),
                'pending' => (int) ($paymentStatus['pending'] ?? 0),
                'expired' => (int) ($paymentStatus['expired'] ?? 0),
                'failed' => (int) ($paymentStatus['failed'] ?? 0),
            ],
        ]);
    }

    private function delta(int $current, int $previous): float
    {
        if ($previous === 0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }

    private function mentorDashboard(User $mentor): Response
    {
        $myCourseIds = Course::query()->forInstructor($mentor->id)->pluck('id');

        $totalCourses = $myCourseIds->count();
        $draftCount = Course::forInstructor($mentor->id)
            ->where('review_status', Course::REVIEW_DRAFT)->count();
        $pendingCount = Course::forInstructor($mentor->id)
            ->where('review_status', Course::REVIEW_PENDING)->count();
        $publishedCount = Course::forInstructor($mentor->id)
            ->where('review_status', Course::REVIEW_PUBLISHED)->count();
        $rejectedCount = Course::forInstructor($mentor->id)
            ->where('review_status', Course::REVIEW_REJECTED)->count();

        $totalStudents = Enrollment::whereIn('course_id', $myCourseIds)->count();
        $newStudentsWeek = Enrollment::whereIn('course_id', $myCourseIds)
            ->where('enrolled_at', '>=', now()->subWeek())
            ->count();

        $totalReviews = Review::whereIn('course_id', $myCourseIds)->count();
        $avgRating = (float) Review::whereIn('course_id', $myCourseIds)->avg('rating');

        $recentCourses = Course::forInstructor($mentor->id)
            ->withCount(['enrollments', 'sections', 'lessons'])
            ->latest('updated_at')
            ->limit(5)
            ->get(['id', 'title', 'slug', 'review_status', 'updated_at']);

        $pendingReviewCourses = Course::forInstructor($mentor->id)
            ->where('review_status', Course::REVIEW_PENDING)
            ->latest('submitted_at')
            ->limit(5)
            ->get(['id', 'title', 'submitted_at']);

        return Inertia::render('admin/dashboard-mentor', [
            'mentor' => [
                'name' => $mentor->name,
                'email' => $mentor->email,
                'avatar' => $mentor->avatar,
            ],
            'stats' => [
                'total_courses' => $totalCourses,
                'draft' => $draftCount,
                'pending' => $pendingCount,
                'published' => $publishedCount,
                'rejected' => $rejectedCount,
                'total_students' => $totalStudents,
                'new_students_week' => $newStudentsWeek,
                'total_reviews' => $totalReviews,
                'avg_rating' => round($avgRating, 2),
            ],
            'recentCourses' => $recentCourses,
            'pendingReviewCourses' => $pendingReviewCourses,
        ]);
    }

    private function hrDashboard(User $hr): Response
    {
        $totalEmployees = User::query()->role('employee')->count();
        $totalPositions = Position::count();
        $totalCompetencies = Competency::count();

        $skillGapTotal = SkillGap::count();
        $skillGapCritical = SkillGap::where('gap', '>=', 2)->count();

        $enrollInProgress = Enrollment::where('status', 'active')->count();
        $enrollCompleted = Enrollment::where('status', 'completed')->count();
        $completionRate = ($enrollInProgress + $enrollCompleted) > 0
            ? round(($enrollCompleted / max(1, $enrollInProgress + $enrollCompleted)) * 100, 1)
            : 0.0;

        $pendingInvitations = OrganizationInvitation::query()
            ->whereNull('accepted_at')
            ->count();

        $topSkillGaps = SkillGap::query()
            ->select('competency_id')
            ->selectRaw('COUNT(*) as affected_count')
            ->selectRaw('AVG(gap) as avg_gap')
            ->with('competency:id,name')
            ->where('gap', '>', 0)
            ->groupBy('competency_id')
            ->orderByDesc('affected_count')
            ->limit(5)
            ->get();

        $recentEnrollments = Enrollment::query()
            ->with(['user:id,name,email', 'course:id,title,slug'])
            ->latest('enrolled_at')
            ->limit(6)
            ->get(['id', 'user_id', 'course_id', 'status', 'progress_percent', 'enrolled_at']);

        return Inertia::render('admin/dashboard-hr', [
            'hr' => [
                'name' => $hr->name,
                'email' => $hr->email,
            ],
            'stats' => [
                'total_employees' => $totalEmployees,
                'total_positions' => $totalPositions,
                'total_competencies' => $totalCompetencies,
                'skill_gap_total' => $skillGapTotal,
                'skill_gap_critical' => $skillGapCritical,
                'enroll_in_progress' => $enrollInProgress,
                'enroll_completed' => $enrollCompleted,
                'completion_rate' => $completionRate,
                'pending_invitations' => $pendingInvitations,
            ],
            'topSkillGaps' => $topSkillGaps,
            'recentEnrollments' => $recentEnrollments,
        ]);
    }
}
