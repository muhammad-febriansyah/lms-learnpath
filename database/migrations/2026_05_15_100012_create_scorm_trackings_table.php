<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scorm_trackings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            $table->foreignId('scorm_package_id')->constrained()->cascadeOnDelete();
            $table->string('lesson_status')->nullable();
            $table->string('completion_status')->nullable();
            $table->decimal('score_raw', 8, 2)->nullable();
            $table->decimal('score_min', 8, 2)->nullable();
            $table->decimal('score_max', 8, 2)->nullable();
            $table->string('total_time')->nullable();
            $table->string('session_time')->nullable();
            $table->longText('suspend_data')->nullable();
            $table->json('cmi_data')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'course_id', 'lesson_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scorm_trackings');
    }
};
