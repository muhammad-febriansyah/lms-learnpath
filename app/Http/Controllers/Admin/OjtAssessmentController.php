<?php

namespace App\Http\Controllers\Admin;

use App\Actions\SkillMatrix\SyncUserCompetencyFromSources;
use App\Http\Controllers\Controller;
use App\Models\Competency;
use App\Models\Course;
use App\Models\OjtAssessment;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OjtAssessmentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user?->can('ojt.create') || $user?->can('ojt.review'), 403);

        $query = OjtAssessment::query()
            ->with([
                'user:id,name,email',
                'supervisor:id,name',
                'competency:id,name,category',
                'course:id,title',
            ]);

        // Supervisors see only their own assessments by default.
        if ($user->hasRole('supervisor') && ! $user->hasAnyRole(['admin_tenant', 'superadmin', 'hr'])) {
            $query->where('supervisor_id', $user->id);
        }

        $assessments = $query
            ->when($request->string('search')->toString(), function ($q, $search) {
                $q->whereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%"));
            })
            ->when($request->string('status')->toString(), function ($q, $status) {
                $q->where('status', $status);
            })
            ->when($request->string('competency')->toString(), function ($q, $id) {
                $q->where('competency_id', $id);
            })
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/ojt-assessments/index', [
            'assessments' => $assessments,
            'filters' => $request->only('search', 'status', 'competency'),
            'competencyOptions' => Competency::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
            'stats' => [
                'total' => OjtAssessment::count(),
                'pending' => OjtAssessment::where('status', 'pending_review')->count(),
                'approved' => OjtAssessment::where('status', 'approved')->count(),
                'rejected' => OjtAssessment::where('status', 'rejected')->count(),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        abort_unless($request->user()?->can('ojt.create'), 403);

        $supervisor = $request->user();

        // Direct reports: users where this supervisor is set in employee_profiles.
        $directReports = User::query()
            ->whereHas('employeeProfile', fn ($q) => $q->where('supervisor_id', $supervisor->id))
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('admin/ojt-assessments/form', [
            'assessment' => null,
            'userOptions' => $directReports,
            'competencyOptions' => Competency::query()
                ->where('is_active', true)
                ->orderBy('category')
                ->orderBy('name')
                ->get(['id', 'name', 'category']),
            'courseOptions' => Course::query()
                ->orderBy('title')
                ->get(['id', 'title']),
        ]);
    }

    public function store(Request $request, SyncUserCompetencyFromSources $sync): RedirectResponse
    {
        abort_unless($request->user()?->can('ojt.create'), 403);

        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'competency_id' => ['required', 'integer', 'exists:competencies,id'],
            'course_id' => ['nullable', 'integer', 'exists:courses,id'],
            'rubric_score' => ['required', 'integer', 'min:0', 'max:100'],
            'actual_level' => ['required', 'integer', 'min:0', 'max:5'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'status' => ['required', 'in:pending_review,approved,rejected'],
        ], [
            'required' => ':attribute wajib diisi.',
        ]);

        $assessment = OjtAssessment::create([
            ...$data,
            'supervisor_id' => $request->user()->id,
            'assessed_at' => now(),
        ]);

        if ($assessment->status === 'approved') {
            $sync->execute($assessment->user_id, $assessment->competency_id);
        }

        return redirect()
            ->route('admin.ojt-assessments.index')
            ->with('success', 'OJT Assessment berhasil disimpan.');
    }

    public function updateStatus(
        Request $request,
        OjtAssessment $ojtAssessment,
        SyncUserCompetencyFromSources $sync,
    ): RedirectResponse {
        abort_unless($request->user()?->can('ojt.review'), 403);

        $data = $request->validate([
            'status' => ['required', 'in:approved,rejected'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $ojtAssessment->update($data);

        if ($data['status'] === 'approved') {
            $sync->execute($ojtAssessment->user_id, $ojtAssessment->competency_id);
        }

        return back()->with(
            'success',
            $data['status'] === 'approved' ? 'OJT disetujui.' : 'OJT ditolak.',
        );
    }
}
