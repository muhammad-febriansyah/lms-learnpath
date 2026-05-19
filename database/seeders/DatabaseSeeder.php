<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Seed dasar (role/permission, settings, template, badge, faq, about).
        $this->call([
            RolePermissionSeeder::class,
            SettingSeeder::class,
            CertificateTemplateSeeder::class,
            BadgeSeeder::class,
            FaqSeeder::class,
            AboutSettingSeeder::class,
        ]);

        // Dataset demo Learnpath — 10 record per entitas utama dengan data realistis.
        $this->call(LearnpathDemoSeeder::class);
    }
}
