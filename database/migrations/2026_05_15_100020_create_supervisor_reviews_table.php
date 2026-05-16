<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('supervisor_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('competency_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reviewer_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('rating')->default(0);
            $table->unsignedTinyInteger('actual_level')->default(0);
            $table->text('notes')->nullable();
            $table->string('approval_status')->default('pending_review');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'competency_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supervisor_reviews');
    }
};
