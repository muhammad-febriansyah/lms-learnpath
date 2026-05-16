<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CourseCompetencyMapping;
use App\Models\SkillGap;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrainingRecommendationController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('skill_matrix.view'), 403);

        // For each skill gap, find courses that develop that competency.
        $gaps = SkillGap::query()
            ->where('status', 'gap')
            ->with([
                'user:id,name,email',
                'competency:id,name,category',
                'position:id,name',
            ])
            ->orderByDesc('gap')
            ->limit(50)
            ->get();

        $mappingsByCompetency = CourseCompetencyMapping::query()
            ->whereIn('competency_id', $gaps->pluck('competency_id')->unique())
            ->with('course:id,title,slug,thumbnail,price')
            ->get()
            ->groupBy('competency_id');

        $recommendations = $gaps->map(function ($gap) use ($mappingsByCompetency) {
            $mappings = $mappingsByCompetency[$gap->competency_id] ?? collect();

            return [
                'gap_id' => $gap->id,
                'user' => $gap->user,
                'position' => $gap->position,
                'competency' => $gap->competency,
                'target_level' => $gap->target_level,
                'actual_level' => $gap->actual_level,
                'gap' => $gap->gap,
                'courses' => $mappings
                    ->sortByDesc('weight')
                    ->take(3)
                    ->map(fn ($m) => [
                        'id' => $m->course?->id,
                        'title' => $m->course?->title,
                        'slug' => $m->course?->slug,
                        'thumbnail' => $m->course?->thumbnail,
                        'price' => (int) ($m->course?->price ?? 0),
                        'weight' => $m->weight,
                        'target_level_impact' => $m->target_level_impact,
                    ])
                    ->values(),
            ];
        });

        return Inertia::render('admin/training-recommendations/index', [
            'recommendations' => $recommendations,
            'stats' => [
                'gap_total' => SkillGap::where('status', 'gap')->count(),
                'with_course' => $recommendations->filter(fn ($r) => count($r['courses']) > 0)->count(),
                'without_course' => $recommendations->filter(fn ($r) => count($r['courses']) === 0)->count(),
            ],
        ]);
    }
}
