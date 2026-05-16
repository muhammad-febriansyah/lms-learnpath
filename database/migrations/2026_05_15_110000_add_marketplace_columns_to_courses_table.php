<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->string('subtitle')->nullable()->after('title');
            $table->string('language', 32)->default('id')->after('level');
            $table->string('preview_video_url')->nullable()->after('thumbnail');
            $table->json('learning_objectives')->nullable()->after('description');
            $table->json('requirements')->nullable()->after('learning_objectives');
            $table->json('target_audience')->nullable()->after('requirements');
            $table->decimal('average_rating', 3, 2)->default(0)->after('max_attempts');
            $table->unsignedInteger('reviews_count')->default(0)->after('average_rating');
            $table->unsignedInteger('total_students')->default(0)->after('reviews_count');
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn([
                'subtitle',
                'language',
                'preview_video_url',
                'learning_objectives',
                'requirements',
                'target_audience',
                'average_rating',
                'reviews_count',
                'total_students',
            ]);
        });
    }
};
