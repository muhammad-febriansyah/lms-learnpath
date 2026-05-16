<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ojt_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('competency_id')->constrained()->cascadeOnDelete();
            $table->foreignId('supervisor_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('rubric_score')->default(0);
            $table->unsignedTinyInteger('actual_level')->default(0);
            $table->text('notes')->nullable();
            $table->string('status')->default('pending_review');
            $table->timestamp('assessed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'competency_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ojt_assessments');
    }
};
