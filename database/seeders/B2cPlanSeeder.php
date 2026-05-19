<?php

namespace Database\Seeders;

use App\Models\B2cPlan;
use Illuminate\Database\Seeder;

class B2cPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'code' => 'personal-monthly',
                'name' => 'Personal',
                'tagline' => 'Cocok untuk belajar mandiri',
                'price' => 99_000,
                'billing_period' => B2cPlan::PERIOD_MONTHLY,
                'compare_at_price' => null,
                'features' => [
                    'Akses semua course publish',
                    'Sertifikat untuk setiap course lulus',
                    'AI Tutor dasar',
                    'Akses dari semua device',
                ],
                'is_popular' => false,
                'sort_order' => 1,
            ],
            [
                'code' => 'premium-monthly',
                'name' => 'Premium',
                'tagline' => 'Untuk yang serius upgrade skill',
                'price' => 199_000,
                'billing_period' => B2cPlan::PERIOD_MONTHLY,
                'compare_at_price' => null,
                'features' => [
                    'Semua benefit Personal',
                    'AI Tutor lengkap (unlimited query)',
                    'Akses Learning Path premium',
                    'Sesi mentoring 1x1 per bulan',
                    'Download materi PDF',
                    'Priority support',
                ],
                'is_popular' => true,
                'sort_order' => 2,
            ],
            [
                'code' => 'personal-yearly',
                'name' => 'Personal Tahunan',
                'tagline' => 'Hemat 20% dengan bayar tahunan',
                'price' => 950_000,
                'billing_period' => B2cPlan::PERIOD_YEARLY,
                'compare_at_price' => 1_188_000,
                'features' => [
                    'Akses semua course publish',
                    'Sertifikat untuk setiap course lulus',
                    'AI Tutor dasar',
                    'Akses dari semua device',
                    'Hemat Rp 238.000 vs bulanan',
                ],
                'is_popular' => false,
                'sort_order' => 3,
            ],
            [
                'code' => 'premium-yearly',
                'name' => 'Premium Tahunan',
                'tagline' => 'Bonus 2 bulan gratis',
                'price' => 1_990_000,
                'billing_period' => B2cPlan::PERIOD_YEARLY,
                'compare_at_price' => 2_388_000,
                'features' => [
                    'Semua benefit Premium bulanan',
                    'Hemat Rp 398.000 (sekitar 2 bulan gratis)',
                    'Akses event eksklusif member',
                    'Priority support 24/7',
                ],
                'is_popular' => false,
                'sort_order' => 4,
            ],
        ];

        foreach ($plans as $plan) {
            B2cPlan::updateOrCreate(
                ['code' => $plan['code']],
                array_merge($plan, [
                    'currency' => 'IDR',
                    'is_active' => true,
                ]),
            );
        }
    }
}
