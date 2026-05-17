<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->string('lms_format', 32)->default('video')->after('delivery_format');
            $table->foreignId('scorm_package_id')
                ->nullable()
                ->after('lms_format')
                ->constrained('scorm_packages')
                ->nullOnDelete();

            $table->index('lms_format');
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropIndex(['lms_format']);
            $table->dropForeign(['scorm_package_id']);
            $table->dropColumn(['lms_format', 'scorm_package_id']);
        });
    }
};
