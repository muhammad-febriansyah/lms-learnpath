<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('learning_paths', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('subtitle')->nullable();
            $table->text('description')->nullable();
            $table->string('thumbnail')->nullable();
            $table->string('level')->nullable();
            $table->unsignedSmallInteger('duration_weeks')->nullable();
            $table->json('target_audience')->nullable();
            $table->json('outcomes')->nullable();
            $table->foreignId('position_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('total_courses')->default(0);
            $table->unsignedInteger('total_students')->default(0);
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index(['is_published', 'published_at']);
            $table->index('position_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('learning_paths');
    }
};
