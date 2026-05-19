<?php

namespace App\Http\Controllers\Admin;

use App\Actions\SkillMatrix\CalculateSkillGap;
use App\Http\Controllers\Controller;
use App\Models\Position;
use App\Models\SkillGap;
use App\Services\AI\SkillGapAIRemediator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class SkillGapController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('skill_matrix.view'), 403);

        $gaps = SkillGap::query()
            ->with([
                'user:id,name,email',
                'position:id,name,division',
                'competency:id,name,category',
            ])
            ->when($request->string('search')->toString(), function ($q, $search) {
                $q->whereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%"));
            })
            ->when($request->string('position')->toString(), function ($q, $id) {
                $q->where('position_id', $id);
            })
            ->when($request->string('status')->toString(), function ($q, $status) {
                $q->where('status', $status);
            })
            ->orderBy('user_id')
            ->orderByDesc('gap')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/skill-gaps/index', [
            'gaps' => $gaps,
            'filters' => $request->only('search', 'position', 'status'),
            'positionOptions' => Position::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
            'stats' => [
                'total_employees' => SkillGap::distinct('user_id')->count('user_id'),
                'gap' => SkillGap::where('status', 'gap')->count(),
                'on_target' => SkillGap::where('status', 'on_target')->count(),
                'exceed' => SkillGap::where('status', 'exceed')->count(),
                'last_calculated_at' => SkillGap::max('calculated_at'),
            ],
        ]);
    }

    public function recalculate(Request $request, CalculateSkillGap $action): RedirectResponse
    {
        abort_unless($request->user()?->can('skill_matrix.manage'), 403);

        $count = $action->executeAll();

        return back()->with('success', "Berhasil menghitung ulang {$count} entri skill gap.");
    }

    public function recommendAi(Request $request, SkillGap $skillGap, SkillGapAIRemediator $remediator): RedirectResponse
    {
        abort_unless($request->user()?->can('skill_matrix.view'), 403);

        try {
            $remediator->remediate($skillGap);
        } catch (Throwable $e) {
            return back()->with('error', 'Gagal generate rekomendasi AI: '.mb_substr($e->getMessage(), 0, 200));
        }

        return back()->with('success', 'Rekomendasi AI berhasil dibuat.');
    }
}
