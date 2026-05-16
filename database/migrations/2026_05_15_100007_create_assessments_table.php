<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('type');
            $table->text('description')->nullable();
            $table->unsignedTinyInteger('passing_score')->default(70);
            $table->unsignedTinyInteger('max_attempts')->default(3);
            $table->unsignedInteger('duration_minutes')->nullable();
            $table->boolean('is_required')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['course_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessments');
    }
};
