<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $baseFeatures = [
            'Akses katalog course unlimited',
            'Microlearning & artikel',
            'Custom Learning Paths',
            'Single Sign-On (SSO)',
            'Learning Analytics',
        ];

        $plans = [
            [
                'code' => 'starter',
                'name' => 'Starter',
                'tagline' => 'Mulai perjalanan learning tim Anda',
                'min_users' => 1,
                'max_users' => 49,
                'price_per_user_per_month' => 500_000,
                'features' => array_merge($baseFeatures, ['Basic Support']),
                'addons' => null,
                'is_popular' => false,
                'sort_order' => 1,
            ],
            [
                'code' => 'growth',
                'name' => 'Growth',
                'tagline' => 'Percepat pengembangan skill tim',
                'min_users' => 50,
                'max_users' => 200,
                'price_per_user_per_month' => 450_000,
                'features' => array_merge($baseFeatures, ['Priority Support', 'HR Report Dashboard']),
                'addons' => null,
                'is_popular' => false,
                'sort_order' => 2,
            ],
            [
                'code' => 'pro',
                'name' => 'Pro',
                'tagline' => 'Solusi learning lengkap perusahaan',
                'min_users' => 201,
                'max_users' => 1000,
                'price_per_user_per_month' => 350_000,
                'features' => array_merge($baseFeatures, [
                    'Priority Support 24/7',
                    'API Integration',
                    'Custom Branding',
                    'Skill Matrix & Competency Mapping',
                ]),
                'addons' => [
                    ['name' => 'LX Forum', 'price' => 10_000_000, 'note' => 'Forum eksklusif untuk learning experience'],
                    ['name' => 'CDHX & BFB', 'price' => 15_000_000, 'note' => 'Career Development & Behavioral Feedback'],
                ],
                'is_popular' => true,
                'sort_order' => 3,
            ],
            [
                'code' => 'enterprise',
                'name' => 'Enterprise',
                'tagline' => 'Learning ecosystem untuk perusahaan berskala besar',
                'min_users' => 1001,
                'max_users' => null,
                'price_per_user_per_month' => 0,
                'features' => array_merge($baseFeatures, [
                    'Dedicated Customer Success Manager',
                    'API Integration & Custom Workflow',
                    'Full White-label',
                    'Advanced Analytics & BI Integration',
                    'On-site Training Available',
                ]),
                'addons' => [
                    ['name' => 'LX Forum', 'price' => 45_000_000, 'note' => 'Forum eksklusif premium'],
                    ['name' => 'CDHX & BFB', 'price' => 60_000_000, 'note' => 'Premium career development program'],
                ],
                'is_popular' => false,
                'sort_order' => 4,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(
                ['code' => $plan['code']],
                array_merge($plan, [
                    'currency' => 'IDR',
                    'is_active' => true,
                    'contact_sales_only' => true,
                ]),
            );
        }
    }
}
