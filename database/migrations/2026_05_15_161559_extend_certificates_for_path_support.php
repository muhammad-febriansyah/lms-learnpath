<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            // MySQL path — handle a potentially partial state from earlier failed runs.
            $foreignKeys = collect(\DB::select(
                "SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
                 WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME = 'certificates'
                   AND COLUMN_NAME = 'course_id'
                   AND REFERENCED_TABLE_NAME IS NOT NULL"
            ))->pluck('CONSTRAINT_NAME');

            Schema::table('certificates', function (Blueprint $table) use ($foreignKeys) {
                foreach ($foreignKeys as $fk) {
                    $table->dropForeign($fk);
                }
            });

            $uniques = collect(\DB::select(
                "SELECT INDEX_NAME FROM information_schema.STATISTICS
                 WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME = 'certificates'
                   AND INDEX_NAME = 'certificates_user_id_course_id_unique'"
            ));

            if ($uniques->isNotEmpty()) {
                Schema::table('certificates', function (Blueprint $table) {
                    $table->index('user_id', 'certificates_user_id_index');
                });
                Schema::table('certificates', function (Blueprint $table) {
                    $table->dropUnique('certificates_user_id_course_id_unique');
                });
            }
        } else {
            // SQLite (tests) — fresh run, simple sequence works.
            Schema::table('certificates', function (Blueprint $table) {
                $table->dropForeign(['course_id']);
                $table->dropUnique(['user_id', 'course_id']);
            });
        }

        Schema::table('certificates', function (Blueprint $table) {
            $table->foreignId('course_id')->nullable()->change();
            $table->foreign('course_id')->references('id')->on('courses')->cascadeOnDelete();

            $table->foreignId('learning_path_id')
                ->nullable()
                ->after('course_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('subject_type', 32)
                ->default('course')
                ->after('learning_path_id');

            $table->index(['user_id', 'subject_type']);
        });
    }

    public function down(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'subject_type']);
            $table->dropColumn('subject_type');
            $table->dropConstrainedForeignId('learning_path_id');
            $table->dropForeign(['course_id']);
        });

        Schema::table('certificates', function (Blueprint $table) {
            $table->foreignId('course_id')->nullable(false)->change();
            $table->foreign('course_id')->references('id')->on('courses')->cascadeOnDelete();
            $table->unique(['user_id', 'course_id']);
        });
    }
};
