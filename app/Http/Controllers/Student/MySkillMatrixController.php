<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Competency;
use App\Models\CourseCompetencyMapping;
use App\Models\SkillGap;
use App\Models\UserCompetency;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MySkillMatrixController extends Controller
{
    public function show(Request $request): Response
    {
        $user = $request->user();
        $profile = $user->employeeProfile;
        $position = $profile?->position;

        $userCompetencies = UserCompetency::query()
            ->where('user_id', $user->id)
            ->with('competency:id,name,category')
            ->get();

        $gaps = $position
            ? SkillGap::query()
                ->where('user_id', $user->id)
                ->where('position_id', $position->id)
                ->with('competency:id,name,category')
                ->orderByDesc('gap')
                ->get()
            : collect();

        $positionTargets = $position
            ? $position->competencyTargets()
                ->with('competency:id,name,category')
                ->orderBy('competency_id')
                ->get()
            : collect();

        return Inertia::render('student/skill-matrix/show', [
            'profile' => $profile,
            'position' => $position,
            'competencies' => $userCompetencies->map(fn ($uc) => [
                'id' => $uc->competency_id,
                'name' => $uc->competency?->name,
                'category' => $uc->competency?->category,
                'actual_level' => $uc->actual_level,
                'source' => $uc->source,
                'confidence_score' => $uc->confidence_score,
                'last_evaluated_at' => $uc->last_evaluated_at,
            ]),
            'gaps' => $gaps->map(fn ($g) => [
                'id' => $g->id,
                'competency_id' => $g->competency_id,
                'competency_name' => $g->competency?->name,
                'category' => $g->competency?->category,
                'target_level' => $g->target_level,
                'actual_level' => $g->actual_level,
                'gap' => $g->gap,
                'status' => $g->status,
            ]),
            'targetCompetencies' => $positionTargets->map(fn ($t) => [
                'id' => $t->competency_id,
                'name' => $t->competency?->name,
                'category' => $t->competency?->category,
                'target_level' => (int) $t->target_level,
                'is_required' => (bool) $t->is_required,
            ]),
            'totalCompetencies' => $position
                ? $positionTargets->count()
                : Competency::where('is_active', true)->count(),
        ]);
    }

    public function recommendations(Request $request): Response
    {
        $user = $request->user();
        $profile = $user->employeeProfile;
        $position = $profile?->position;

        $gaps = $position
            ? SkillGap::query()
                ->where('user_id', $user->id)
                ->where('position_id', $position->id)
                ->where('status', 'gap')
                ->with('competency:id,name,category')
                ->orderByDesc('gap')
                ->get()
            : collect();

        $mappingsByCompetency = $gaps->isEmpty()
            ? collect()
            : CourseCompetencyMapping::query()
                ->whereIn('competency_id', $gaps->pluck('competency_id')->unique())
                ->with('course:id,title,slug,thumbnail,subtitle,price')
                ->get()
                ->groupBy('competency_id');

        $recommendations = $gaps->map(function ($gap) use ($mappingsByCompetency) {
            $mappings = $mappingsByCompetency[$gap->competency_id] ?? collect();

            return [
                'gap_id' => $gap->id,
                'competency' => [
                    'name' => $gap->competency?->name,
                    'category' => $gap->competency?->category,
                ],
                'target_level' => $gap->target_level,
                'actual_level' => $gap->actual_level,
                'gap' => $gap->gap,
                'courses' => $mappings
                    ->sortByDesc('weight')
                    ->take(3)
                    ->values()
                    ->map(fn ($m) => [
                        'id' => $m->course?->id,
                        'title' => $m->course?->title,
                        'subtitle' => $m->course?->subtitle,
                        'slug' => $m->course?->slug,
                        'thumbnail' => $m->course?->thumbnail,
                        'price' => (int) ($m->course?->price ?? 0),
                    ]),
            ];
        });

        return Inertia::render('student/skill-matrix/recommendations', [
            'recommendations' => $recommendations,
            'position' => $position,
        ]);
    }
}
