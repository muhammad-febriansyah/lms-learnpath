<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Competency;
use App\Models\Course;
use App\Models\CourseCompetencyMapping;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CourseMappingController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('skill_matrix.manage'), 403);

        $courses = Course::query()
            ->orderBy('title')
            ->get(['id', 'title', 'slug', 'thumbnail']);

        $selectedCourseId = (int) $request->integer('course_id', $courses->first()?->id ?? 0);

        $course = $selectedCourseId
            ? Course::query()->find($selectedCourseId)
            : null;

        $competencies = Competency::query()
            ->where('is_active', true)
            ->orderBy('category')
            ->orderBy('name')
            ->get(['id', 'name', 'category']);

        $existing = $course
            ? CourseCompetencyMapping::query()
                ->where('course_id', $course->id)
                ->get()
                ->keyBy('competency_id')
            : collect();

        $mappings = $competencies->map(fn ($c) => [
            'competency_id' => $c->id,
            'competency_name' => $c->name,
            'competency_category' => $c->category,
            'weight' => (int) ($existing[$c->id]?->weight ?? 0),
            'target_level_impact' => (int) ($existing[$c->id]?->target_level_impact ?? 1),
        ]);

        return Inertia::render('admin/course-mappings/index', [
            'courses' => $courses,
            'course' => $course,
            'mappings' => $mappings,
        ]);
    }

    public function update(Request $request, Course $course): RedirectResponse
    {
        abort_unless($request->user()?->can('skill_matrix.manage'), 403);

        $data = $request->validate([
            'mappings' => ['present', 'array'],
            'mappings.*.competency_id' => ['required', 'integer', 'exists:competencies,id'],
            'mappings.*.weight' => ['required', 'integer', 'min:0', 'max:10'],
            'mappings.*.target_level_impact' => ['required', 'integer', 'min:1', 'max:5'],
        ]);

        DB::transaction(function () use ($course, $data) {
            foreach ($data['mappings'] as $m) {
                if ((int) $m['weight'] === 0) {
                    CourseCompetencyMapping::query()
                        ->where('course_id', $course->id)
                        ->where('competency_id', $m['competency_id'])
                        ->delete();

                    continue;
                }

                CourseCompetencyMapping::updateOrCreate(
                    [
                        'course_id' => $course->id,
                        'competency_id' => $m['competency_id'],
                    ],
                    [
                        'weight' => (int) $m['weight'],
                        'target_level_impact' => (int) $m['target_level_impact'],
                    ],
                );
            }
        });

        return back()->with('success', 'Mapping kompetensi course berhasil disimpan.');
    }
}
