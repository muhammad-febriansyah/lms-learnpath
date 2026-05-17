<?php

use App\Models\Organization;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tables yang dimiliki per-tenant. Saat scoping aktif, query otomatis
     * di-filter berdasarkan tenant_id user yang sedang login.
     */
    private array $tables = [
        'positions',
        'competencies',
        'position_competency_targets',
        'course_competency_mappings',
        'skill_gaps',
        'employee_profiles',
        'ojt_assessments',
        'supervisor_reviews',
        'user_competencies',
    ];

    public function up(): void
    {
        // 1) Tambah kolom tenant_id (nullable dulu agar backfill bisa jalan).
        foreach ($this->tables as $tableName) {
            if (! Schema::hasTable($tableName)) {
                continue;
            }

            if (Schema::hasColumn($tableName, 'tenant_id')) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) {
                $table->foreignId('tenant_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('organizations')
                    ->cascadeOnDelete();

                $table->index('tenant_id');
            });
        }

        // 2) Backfill data existing → default ke organization pertama yang ada.
        $defaultTenant = Organization::query()->orderBy('id')->first();

        if ($defaultTenant) {
            foreach ($this->tables as $tableName) {
                if (! Schema::hasTable($tableName)) {
                    continue;
                }

                DB::table($tableName)
                    ->whereNull('tenant_id')
                    ->update(['tenant_id' => $defaultTenant->id]);
            }
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $tableName) {
            if (! Schema::hasTable($tableName) || ! Schema::hasColumn($tableName, 'tenant_id')) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) {
                $table->dropForeign(['tenant_id']);
                $table->dropIndex(['tenant_id']);
                $table->dropColumn('tenant_id');
            });
        }
    }
};
