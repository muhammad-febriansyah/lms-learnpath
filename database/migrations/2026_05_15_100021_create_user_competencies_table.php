<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_competencies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('competency_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('actual_level')->default(0);
            $table->string('source')->default('no_data');
            $table->unsignedBigInteger('source_id')->nullable();
            $table->unsignedTinyInteger('confidence_score')->default(0);
            $table->timestamp('last_evaluated_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'competency_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_competencies');
    }
};
