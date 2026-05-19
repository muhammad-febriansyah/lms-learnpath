<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use App\Services\Business\BulkEnrollmentService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EnrollmentController extends Controller
{
    public function __construct(
        private readonly BulkEnrollmentService $bulk,
    ) {}

    public function index(Request $request): Response
    {
        $enrollments = Enrollment::query()
            ->with([
                'user:id,name,email',
                'course:id,title,slug',
                'assignedBy:id,name',
            ])
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('course', function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%");
                });
            })
            ->when($request->string('status')->toString(), function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest('enrolled_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/enrollments/index', [
            'enrollments' => $enrollments,
            'filters' => $request->only('search', 'status'),
            'stats' => [
                'total' => Enrollment::count(),
                'active' => Enrollment::where('status', 'active')->count(),
                'completed' => Enrollment::where('status', 'completed')->count(),
                'expired' => Enrollment::where('status', 'expired')->count(),
            ],
        ]);
    }

    public function assignForm(Request $request): Response
    {
        $this->authorizeHrOrAdmin($request);

        $courses = Course::query()
            ->where('is_published', true)
            ->orderBy('title')
            ->get(['id', 'title', 'slug']);

        $members = User::query()
            ->whereHas('roles', fn ($q) => $q->whereIn('name', ['employee', 'instructor']))
            ->with('employeeProfile:user_id,position_id,division')
            ->with('employeeProfile.position:id,name')
            ->orderBy('name')
            ->get(['id', 'name', 'email'])
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'position' => $u->employeeProfile?->position?->name,
                'division' => $u->employeeProfile?->division,
            ]);

        $divisions = $members->pluck('division')->filter()->unique()->sort()->values();

        return Inertia::render('admin/enrollments/assign', [
            'courses' => $courses,
            'members' => $members,
            'divisions' => $divisions,
        ]);
    }

    public function assignPreview(Request $request): RedirectResponse
    {
        $this->authorizeHrOrAdmin($request);

        $data = $request->validate([
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'user_ids' => ['required', 'array', 'min:1'],
            'user_ids.*' => ['integer', 'exists:users,id'],
            'due_date' => ['nullable', 'date', 'after:today'],
        ], [
            'course_id.required' => 'Pilih course terlebih dahulu.',
            'user_ids.required' => 'Pilih minimal satu karyawan.',
            'user_ids.min' => 'Pilih minimal satu karyawan.',
            'due_date.after' => 'Tanggal due harus di masa depan.',
        ]);

        $course = Course::findOrFail($data['course_id']);
        $result = $this->bulk->previewForCourse($course, $data['user_ids']);

        $token = Str::random(40);
        Cache::put($this->previewKey($request->user()->id, $token), [
            'course_id' => $course->id,
            'user_ids' => $data['user_ids'],
            'due_date' => $data['due_date'] ?? null,
            'rows' => $result['rows'],
            'summary' => $result['summary'],
        ], now()->addMinutes(15));

        return back()->with('assign_preview', [
            'token' => $token,
            'course' => ['id' => $course->id, 'title' => $course->title],
            'due_date' => $data['due_date'] ?? null,
            'rows' => $result['rows'],
            'summary' => $result['summary'],
        ]);
    }

    public function assignCommit(Request $request): RedirectResponse
    {
        $this->authorizeHrOrAdmin($request);

        $data = $request->validate([
            'token' => ['required', 'string', 'max:60'],
        ], [
            'token.required' => 'Preview kedaluwarsa. Buat ulang penugasan.',
        ]);

        $cacheKey = $this->previewKey($request->user()->id, $data['token']);
        $cached = Cache::pull($cacheKey);
        if (! $cached) {
            return back()->withErrors(['token' => 'Preview kedaluwarsa. Buat ulang penugasan.']);
        }

        $course = Course::findOrFail($cached['course_id']);
        $dueAt = $cached['due_date'] ? Carbon::parse($cached['due_date'])->endOfDay() : null;

        $result = $this->bulk->commitForCourse(
            course: $course,
            userIds: $cached['user_ids'],
            dueAt: $dueAt,
            assignedBy: $request->user(),
        );

        $message = "{$result['enrolled']} karyawan ditugaskan ke '{$course->title}'.";
        if ($result['skipped'] > 0) {
            $message .= " {$result['skipped']} dilewati (sudah enroll).";
        }

        return redirect()->route('admin.enrollments.index')->with('success', $message);
    }

    private function authorizeHrOrAdmin(Request $request): void
    {
        abort_unless(
            $request->user()?->hasAnyRole(['superadmin', 'admin_tenant', 'hr']),
            403,
            'Hanya HR/admin yang boleh menugaskan training.',
        );
    }

    private function previewKey(int $userId, string $token): string
    {
        return "bulk-enroll-preview:{$userId}:{$token}";
    }
}
