<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('enrollment_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->text('content')->nullable();
            $table->boolean('is_public')->default(true);
            $table->timestamps();

            $table->unique(['user_id', 'course_id']);
            $table->index(['course_id', 'is_public']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
