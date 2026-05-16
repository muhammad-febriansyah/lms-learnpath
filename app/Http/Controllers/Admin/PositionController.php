<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PositionRequest;
use App\Models\Position;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PositionController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('position.manage'), 403);

        $positions = Position::query()
            ->withCount(['employeeProfiles', 'competencyTargets'])
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('division', 'like', "%{$search}%")
                        ->orWhere('branch', 'like', "%{$search}%");
                });
            })
            ->when($request->string('division')->toString(), function ($query, $division) {
                $query->where('division', $division);
            })
            ->when($request->string('status')->toString(), function ($query, $status) {
                $query->where('is_active', $status === 'active');
            })
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/positions/index', [
            'positions' => $positions,
            'filters' => $request->only('search', 'division', 'status'),
            'divisionOptions' => Position::query()
                ->whereNotNull('division')
                ->distinct()
                ->orderBy('division')
                ->pluck('division'),
            'stats' => [
                'total' => Position::count(),
                'active' => Position::where('is_active', true)->count(),
                'employees' => \App\Models\EmployeeProfile::whereNotNull('position_id')->count(),
                'targets' => \App\Models\PositionCompetencyTarget::count(),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        abort_unless($request->user()?->can('position.manage'), 403);

        return Inertia::render('admin/positions/form', [
            'position' => null,
        ]);
    }

    public function store(PositionRequest $request): RedirectResponse
    {
        Position::create($request->validated());

        return redirect()
            ->route('admin.positions.index')
            ->with('success', 'Jabatan berhasil ditambahkan.');
    }

    public function edit(Request $request, Position $position): Response
    {
        abort_unless($request->user()?->can('position.manage'), 403);

        return Inertia::render('admin/positions/form', [
            'position' => $position,
        ]);
    }

    public function update(PositionRequest $request, Position $position): RedirectResponse
    {
        $position->update($request->validated());

        return redirect()
            ->route('admin.positions.index')
            ->with('success', 'Jabatan berhasil diperbarui.');
    }

    public function destroy(Request $request, Position $position): RedirectResponse
    {
        abort_unless($request->user()?->can('position.manage'), 403);

        if ($position->employeeProfiles()->exists()) {
            return back()->with('error', 'Jabatan masih dipakai karyawan, tidak bisa dihapus.');
        }

        $position->delete();

        return back()->with('success', 'Jabatan berhasil dihapus.');
    }
}
