<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('instructor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->longText('description')->nullable();
            $table->string('thumbnail')->nullable();
            $table->unsignedBigInteger('price')->default(0);
            $table->string('level')->nullable();
            $table->unsignedInteger('duration_minutes')->default(0);
            $table->boolean('pre_test_required')->default(false);
            $table->boolean('post_test_required')->default(false);
            $table->unsignedTinyInteger('passing_score')->default(70);
            $table->unsignedTinyInteger('max_attempts')->default(3);
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
