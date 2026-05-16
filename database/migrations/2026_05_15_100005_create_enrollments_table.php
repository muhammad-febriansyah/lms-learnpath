<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('active');
            $table->unsignedTinyInteger('progress_percent')->default(0);
            $table->string('pre_test_status')->default('not_started');
            $table->string('post_test_status')->default('not_started');
            $table->string('certificate_status')->default('not_issued');
            $table->timestamp('enrolled_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('expired_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'course_id']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enrollments');
    }
};
