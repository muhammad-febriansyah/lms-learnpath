<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('skill_gaps', function (Blueprint $table) {
            $table->json('ai_recommendation')->nullable()->after('recommendation');
            $table->timestamp('ai_recommended_at')->nullable()->after('ai_recommendation');
        });
    }

    public function down(): void
    {
        Schema::table('skill_gaps', function (Blueprint $table) {
            $table->dropColumn(['ai_recommendation', 'ai_recommended_at']);
        });
    }
};
