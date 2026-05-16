<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('position_competency_targets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('position_id')->constrained()->cascadeOnDelete();
            $table->foreignId('competency_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('target_level');
            $table->boolean('is_required')->default(true);
            $table->timestamps();

            $table->unique(['position_id', 'competency_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('position_competency_targets');
    }
};
