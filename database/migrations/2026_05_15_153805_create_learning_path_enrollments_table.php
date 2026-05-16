<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('learning_path_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('learning_path_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('active');
            $table->unsignedTinyInteger('progress_percent')->default(0);
            $table->unsignedSmallInteger('courses_completed')->default(0);
            $table->timestamp('enrolled_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'learning_path_id']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('learning_path_enrollments');
    }
};
