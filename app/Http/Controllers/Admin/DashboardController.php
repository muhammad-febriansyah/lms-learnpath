<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\Payment;
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
                'total' => User::role('student')->count(),
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
}
