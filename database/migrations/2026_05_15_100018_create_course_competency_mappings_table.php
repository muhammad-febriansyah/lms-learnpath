<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_competency_mappings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('competency_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('weight')->default(1);
            $table->unsignedTinyInteger('target_level_impact')->default(1);
            $table->timestamps();

            $table->unique(['course_id', 'competency_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_competency_mappings');
    }
};
