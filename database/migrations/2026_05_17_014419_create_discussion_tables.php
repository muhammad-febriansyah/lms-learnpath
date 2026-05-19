<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('discussion_threads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()
                ->constrained('organizations')->nullOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lesson_id')->nullable()
                ->constrained('lessons')->nullOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 200);
            $table->text('body');
            $table->unsignedInteger('upvotes_count')->default(0);
            $table->unsignedInteger('replies_count')->default(0);
            $table->timestamp('last_reply_at')->nullable();
            $table->timestamp('locked_at')->nullable();
            $table->timestamps();

            $table->index(['course_id', 'last_reply_at']);
            $table->index(['tenant_id', 'course_id']);
        });

        Schema::create('discussion_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('discussion_thread_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('body');
            $table->unsignedInteger('upvotes_count')->default(0);
            $table->timestamps();

            $table->index(['discussion_thread_id', 'created_at']);
        });

        Schema::create('discussion_thread_upvotes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('discussion_thread_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['discussion_thread_id', 'user_id']);
        });

        Schema::create('discussion_reply_upvotes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('discussion_reply_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['discussion_reply_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discussion_reply_upvotes');
        Schema::dropIfExists('discussion_thread_upvotes');
        Schema::dropIfExists('discussion_replies');
        Schema::dropIfExists('discussion_threads');
    }
};
