<?php

namespace App\Http\Controllers\Admin;

use App\Actions\SkillMatrix\SyncUserCompetencyFromSources;
use App\Http\Controllers\Controller;
use App\Models\Competency;
use App\Models\SupervisorReview;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupervisorReviewController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless(
            $user?->can('supervisor_review.create') || $user?->can('supervisor_review.approve'),
            403,
        );

        $query = SupervisorReview::query()
            ->with([
                'user:id,name,email',
                'reviewer:id,name',
                'competency:id,name,category',
            ]);

        if ($user->hasRole('supervisor') && ! $user->hasAnyRole(['admin', 'super_admin', 'hr'])) {
            $query->where('reviewer_id', $user->id);
        }

        $reviews = $query
            ->when($request->string('search')->toString(), function ($q, $search) {
                $q->whereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%"));
            })
            ->when($request->string('status')->toString(), function ($q, $status) {
                $q->where('approval_status', $status);
            })
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/supervisor-reviews/index', [
            'reviews' => $reviews,
            'filters' => $request->only('search', 'status'),
            'stats' => [
                'total' => SupervisorReview::count(),
                'pending' => SupervisorReview::where('approval_status', 'pending_review')->count(),
                'approved' => SupervisorReview::where('approval_status', 'approved')->count(),
                'rejected' => SupervisorReview::where('approval_status', 'rejected')->count(),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        abort_unless($request->user()?->can('supervisor_review.create'), 403);

        $supervisor = $request->user();

        $directReports = User::query()
            ->whereHas('employeeProfile', fn ($q) => $q->where('supervisor_id', $supervisor->id))
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('admin/supervisor-reviews/form', [
            'review' => null,
            'userOptions' => $directReports,
            'competencyOptions' => Competency::query()
                ->where('is_active', true)
                ->orderBy('category')
                ->orderBy('name')
                ->get(['id', 'name', 'category']),
        ]);
    }

    public function store(Request $request, SyncUserCompetencyFromSources $sync): RedirectResponse
    {
        abort_unless($request->user()?->can('supervisor_review.create'), 403);

        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'competency_id' => ['required', 'integer', 'exists:competencies,id'],
            'rating' => ['required', 'integer', 'min:0', 'max:5'],
            'actual_level' => ['required', 'integer', 'min:0', 'max:5'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'approval_status' => ['required', 'in:pending_review,approved,rejected'],
        ], [
            'required' => ':attribute wajib diisi.',
        ]);

        $review = SupervisorReview::create([
            ...$data,
            'reviewer_id' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        if ($review->approval_status === 'approved') {
            $sync->execute($review->user_id, $review->competency_id);
        }

        return redirect()
            ->route('admin.supervisor-reviews.index')
            ->with('success', 'Supervisor review berhasil disimpan.');
    }

    public function updateStatus(
        Request $request,
        SupervisorReview $supervisorReview,
        SyncUserCompetencyFromSources $sync,
    ): RedirectResponse {
        abort_unless($request->user()?->can('supervisor_review.approve'), 403);

        $data = $request->validate([
            'approval_status' => ['required', 'in:approved,rejected'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $supervisorReview->update($data);

        if ($data['approval_status'] === 'approved') {
            $sync->execute($supervisorReview->user_id, $supervisorReview->competency_id);
        }

        return back()->with(
            'success',
            $data['approval_status'] === 'approved' ? 'Review disetujui.' : 'Review ditolak.',
        );
    }
}
