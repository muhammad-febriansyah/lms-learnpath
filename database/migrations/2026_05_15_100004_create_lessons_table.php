<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_section_id')->constrained()->cascadeOnDelete();
            $table->foreignId('scorm_package_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('type');
            $table->longText('content')->nullable();
            $table->string('video_path')->nullable();
            $table->string('embed_url')->nullable();
            $table->string('youtube_url')->nullable();
            $table->string('youtube_video_id')->nullable();
            $table->unsignedInteger('duration_minutes')->default(0);
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_preview')->default(false);
            $table->boolean('is_required')->default(true);
            $table->timestamps();

            $table->index(['course_id', 'course_section_id']);
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
