<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CompetencyRequest;
use App\Models\Competency;
use App\Models\CourseCompetencyMapping;
use App\Models\PositionCompetencyTarget;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompetencyController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('competency.manage'), 403);

        $competencies = Competency::query()
            ->withCount(['positionTargets', 'courseMappings', 'userCompetencies'])
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%");
                });
            })
            ->when($request->string('category')->toString(), function ($query, $category) {
                $query->where('category', $category);
            })
            ->when($request->string('status')->toString(), function ($query, $status) {
                $query->where('is_active', $status === 'active');
            })
            ->orderBy('category')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/competencies/index', [
            'competencies' => $competencies,
            'filters' => $request->only('search', 'category', 'status'),
            'categoryOptions' => Competency::query()
                ->whereNotNull('category')
                ->distinct()
                ->orderBy('category')
                ->pluck('category'),
            'stats' => [
                'total' => Competency::count(),
                'active' => Competency::where('is_active', true)->count(),
                'mapped_to_position' => PositionCompetencyTarget::distinct('competency_id')->count('competency_id'),
                'mapped_to_course' => CourseCompetencyMapping::distinct('competency_id')->count('competency_id'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        abort_unless($request->user()?->can('competency.manage'), 403);

        return Inertia::render('admin/competencies/form', [
            'competency' => null,
            'categoryOptions' => Competency::query()
                ->whereNotNull('category')
                ->distinct()
                ->orderBy('category')
                ->pluck('category'),
        ]);
    }

    public function store(CompetencyRequest $request): RedirectResponse
    {
        Competency::create($request->validated());

        return redirect()
            ->route('admin.competencies.index')
            ->with('success', 'Kompetensi berhasil ditambahkan.');
    }

    public function edit(Request $request, Competency $competency): Response
    {
        abort_unless($request->user()?->can('competency.manage'), 403);

        return Inertia::render('admin/competencies/form', [
            'competency' => $competency,
            'categoryOptions' => Competency::query()
                ->whereNotNull('category')
                ->distinct()
                ->orderBy('category')
                ->pluck('category'),
        ]);
    }

    public function update(CompetencyRequest $request, Competency $competency): RedirectResponse
    {
        $competency->update($request->validated());

        return redirect()
            ->route('admin.competencies.index')
            ->with('success', 'Kompetensi berhasil diperbarui.');
    }

    public function destroy(Request $request, Competency $competency): RedirectResponse
    {
        abort_unless($request->user()?->can('competency.manage'), 403);

        if ($competency->positionTargets()->exists() || $competency->courseMappings()->exists()) {
            return back()->with('error', 'Kompetensi masih dipakai di target jabatan/course mapping, tidak bisa dihapus.');
        }

        $competency->delete();

        return back()->with('success', 'Kompetensi berhasil dihapus.');
    }
}
