<?php

namespace Database\Seeders;

use App\Models\Badge;
use Illuminate\Database\Seeder;

class BadgeSeeder extends Seeder
{
    public function run(): void
    {
        $badges = [
            // Milestone
            [
                'slug' => 'first-course',
                'name' => 'Langkah Pertama',
                'description' => 'Menyelesaikan course pertama Anda.',
                'icon' => 'Sparkles',
                'category' => 'milestone',
                'criteria' => ['type' => 'course_count', 'threshold' => 1],
                'sort_order' => 1,
            ],
            [
                'slug' => 'five-courses',
                'name' => 'Pembelajar Konsisten',
                'description' => 'Menyelesaikan 5 course.',
                'icon' => 'BookOpen',
                'category' => 'milestone',
                'criteria' => ['type' => 'course_count', 'threshold' => 5],
                'sort_order' => 2,
            ],
            [
                'slug' => 'ten-courses',
                'name' => 'Veteran Pembelajar',
                'description' => 'Menyelesaikan 10 course.',
                'icon' => 'GraduationCap',
                'category' => 'milestone',
                'criteria' => ['type' => 'course_count', 'threshold' => 10],
                'sort_order' => 3,
            ],
            [
                'slug' => 'twenty-five-courses',
                'name' => 'Master Pembelajar',
                'description' => 'Menyelesaikan 25 course.',
                'icon' => 'Trophy',
                'category' => 'milestone',
                'criteria' => ['type' => 'course_count', 'threshold' => 25],
                'sort_order' => 4,
            ],

            // Streak
            [
                'slug' => 'streak-3',
                'name' => 'Konsisten 3 Hari',
                'description' => 'Belajar 3 hari berturut-turut.',
                'icon' => 'Flame',
                'category' => 'streak',
                'criteria' => ['type' => 'streak_days', 'threshold' => 3],
                'sort_order' => 10,
            ],
            [
                'slug' => 'streak-7',
                'name' => 'Seminggu Penuh',
                'description' => 'Belajar 7 hari berturut-turut.',
                'icon' => 'Flame',
                'category' => 'streak',
                'criteria' => ['type' => 'streak_days', 'threshold' => 7],
                'sort_order' => 11,
            ],
            [
                'slug' => 'streak-30',
                'name' => 'Komitmen Sebulan',
                'description' => 'Belajar 30 hari berturut-turut.',
                'icon' => 'Flame',
                'category' => 'streak',
                'criteria' => ['type' => 'streak_days', 'threshold' => 30],
                'sort_order' => 12,
            ],
            [
                'slug' => 'streak-100',
                'name' => 'Legenda 100 Hari',
                'description' => 'Belajar 100 hari berturut-turut.',
                'icon' => 'Flame',
                'category' => 'streak',
                'criteria' => ['type' => 'streak_days', 'threshold' => 100],
                'sort_order' => 13,
            ],

            // Mastery
            [
                'slug' => 'perfect-score',
                'name' => 'Skor Sempurna',
                'description' => 'Mendapat 100% di assessment.',
                'icon' => 'Target',
                'category' => 'mastery',
                'criteria' => ['type' => 'perfect_score'],
                'sort_order' => 20,
            ],

            // Path
            [
                'slug' => 'first-path',
                'name' => 'Roadmap Pertama',
                'description' => 'Menyelesaikan learning path pertama.',
                'icon' => 'Compass',
                'category' => 'path',
                'criteria' => ['type' => 'path_completed', 'threshold' => 1],
                'sort_order' => 30,
            ],
        ];

        foreach ($badges as $row) {
            Badge::firstOrCreate(
                ['slug' => $row['slug']],
                array_merge($row, ['is_active' => true]),
            );
        }
    }
}
