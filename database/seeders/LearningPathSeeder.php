<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\LearningPath;
use App\Models\Position;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class LearningPathSeeder extends Seeder
{
    public function run(): void
    {
        $courses = Course::query()
            ->where('is_published', true)
            ->orderBy('id')
            ->get();

        if ($courses->isEmpty()) {
            $this->command?->warn('LearningPathSeeder: no published courses found. Skipping.');

            return;
        }

        $paths = [
            [
                'title' => 'Roadmap Account Officer',
                'position_name' => 'Account Officer',
                'subtitle' => 'Kurikulum lengkap untuk Account Officer baru — dari dasar perbankan sampai siap turun lapangan.',
                'duration_weeks' => 8,
                'level' => 'beginner',
                'target_audience' => [
                    'Karyawan baru di posisi Account Officer',
                    'Trainee program MDP / management trainee',
                    'Karyawan internal yang mutasi ke unit Lending',
                ],
                'outcomes' => [
                    'Memahami fundamental analisa kredit dan survey debitur',
                    'Mampu melakukan komunikasi efektif dengan calon nasabah',
                    'Siap mengikuti OJT dengan supervisor',
                ],
                'course_count' => 4,
            ],
            [
                'title' => 'Roadmap Branch Manager',
                'position_name' => 'Branch Manager',
                'subtitle' => 'Pengembangan leadership dan operational excellence untuk kepala cabang.',
                'duration_weeks' => 10,
                'level' => 'advanced',
                'target_audience' => [
                    'Branch Manager baru atau yang sedang dipersiapkan',
                    'Senior Account Officer dengan jalur karir ke BM',
                ],
                'outcomes' => [
                    'Menguasai prinsip kepemimpinan operasional cabang',
                    'Memahami manajemen risiko portfolio',
                    'Mampu coaching tim sales & operasional',
                ],
                'course_count' => 5,
            ],
            [
                'title' => 'Roadmap Compliance Officer',
                'position_name' => 'Compliance Officer',
                'subtitle' => 'Penguatan compliance awareness dan implementasi regulasi terbaru.',
                'duration_weeks' => 6,
                'level' => 'intermediate',
                'target_audience' => [
                    'Compliance Officer & staff',
                    'Internal auditor',
                ],
                'outcomes' => [
                    'Memahami regulasi perbankan terkini',
                    'Mampu menjalankan compliance check secara independen',
                ],
                'course_count' => 3,
            ],
        ];

        foreach ($paths as $row) {
            $position = Position::where('name', $row['position_name'])->first();

            $path = LearningPath::firstOrCreate(
                ['slug' => Str::slug($row['title'])],
                [
                    'title' => $row['title'],
                    'subtitle' => $row['subtitle'],
                    'description' => $row['subtitle'],
                    'level' => $row['level'],
                    'duration_weeks' => $row['duration_weeks'],
                    'target_audience' => $row['target_audience'],
                    'outcomes' => $row['outcomes'],
                    'position_id' => $position?->id,
                    'is_published' => true,
                    'published_at' => now(),
                ],
            );

            $attached = $courses
                ->take($row['course_count'])
                ->values()
                ->map(fn (Course $course, int $idx) => [
                    'course_id' => $course->id,
                    'sort_order' => $idx + 1,
                    'is_required' => true,
                ])
                ->keyBy('course_id')
                ->toArray();

            $path->courses()->syncWithoutDetaching(
                collect($attached)->mapWithKeys(fn ($pivot, $courseId) => [
                    $courseId => [
                        'sort_order' => $pivot['sort_order'],
                        'is_required' => $pivot['is_required'],
                    ],
                ])->all(),
            );

            $path->update(['total_courses' => $path->courses()->count()]);
        }
    }
}
