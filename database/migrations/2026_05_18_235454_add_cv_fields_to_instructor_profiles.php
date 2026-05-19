<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('instructor_profiles', function (Blueprint $table) {
            $table->string('cv_path')->nullable()->after('photo_path');
            $table->string('cv_original_name')->nullable()->after('cv_path');
            $table->timestamp('cv_uploaded_at')->nullable()->after('cv_original_name');
        });
    }

    public function down(): void
    {
        Schema::table('instructor_profiles', function (Blueprint $table) {
            $table->dropColumn(['cv_path', 'cv_original_name', 'cv_uploaded_at']);
        });
    }
};
