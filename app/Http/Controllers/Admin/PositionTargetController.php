<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Competency;
use App\Models\Position;
use App\Models\PositionCompetencyTarget;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PositionTargetController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('skill_matrix.manage'), 403);

        $positions = Position::query()
            ->where('is_active', true)
            ->orderBy('division')
            ->orderBy('name')
            ->get(['id', 'name', 'division', 'branch']);

        $selectedPositionId = (int) $request->integer('position_id', $positions->first()?->id ?? 0);

        $position = $selectedPositionId
            ? Position::query()->find($selectedPositionId)
            : null;

        $competencies = Competency::query()
            ->where('is_active', true)
            ->orderBy('category')
            ->orderBy('name')
            ->get(['id', 'name', 'category', 'description']);

        $existingTargets = $position
            ? PositionCompetencyTarget::query()
                ->where('position_id', $position->id)
                ->get()
                ->keyBy('competency_id')
            : collect();

        $targets = $competencies->map(fn ($c) => [
            'competency_id' => $c->id,
            'competency_name' => $c->name,
            'competency_category' => $c->category,
            'target_level' => (int) ($existingTargets[$c->id]?->target_level ?? 0),
            'is_required' => (bool) ($existingTargets[$c->id]?->is_required ?? false),
        ]);

        return Inertia::render('admin/position-targets/index', [
            'positions' => $positions,
            'position' => $position,
            'targets' => $targets,
        ]);
    }

    public function update(Request $request, Position $position): RedirectResponse
    {
        abort_unless($request->user()?->can('skill_matrix.manage'), 403);

        $data = $request->validate([
            'targets' => ['present', 'array'],
            'targets.*.competency_id' => ['required', 'integer', 'exists:competencies,id'],
            'targets.*.target_level' => ['required', 'integer', 'min:0', 'max:5'],
            'targets.*.is_required' => ['boolean'],
        ]);

        DB::transaction(function () use ($position, $data) {
            foreach ($data['targets'] as $target) {
                if ((int) $target['target_level'] === 0) {
                    PositionCompetencyTarget::query()
                        ->where('position_id', $position->id)
                        ->where('competency_id', $target['competency_id'])
                        ->delete();

                    continue;
                }

                PositionCompetencyTarget::updateOrCreate(
                    [
                        'position_id' => $position->id,
                        'competency_id' => $target['competency_id'],
                    ],
                    [
                        'target_level' => (int) $target['target_level'],
                        'is_required' => (bool) ($target['is_required'] ?? true),
                    ],
                );
            }
        });

        return back()->with('success', 'Target kompetensi jabatan berhasil disimpan.');
    }
}
