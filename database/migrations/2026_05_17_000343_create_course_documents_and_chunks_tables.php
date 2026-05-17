<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()
                ->constrained('organizations')->nullOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('uploaded_by_user_id')->nullable()
                ->constrained('users')->nullOnDelete();
            $table->string('title', 200);
            $table->enum('source_type', ['upload', 'paste'])->default('upload');
            $table->string('filename', 200)->nullable();
            $table->string('mime', 100)->nullable();
            $table->string('storage_path', 255)->nullable();
            $table->enum('status', ['pending', 'ready', 'failed'])->default('pending');
            $table->text('error_message')->nullable();
            $table->unsignedInteger('total_chunks')->default(0);
            $table->unsignedInteger('total_tokens')->default(0);
            $table->timestamps();

            $table->index(['tenant_id', 'course_id']);
            $table->index('status');
        });

        Schema::create('course_document_chunks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_document_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('chunk_index');
            $table->text('content');
            $table->json('embedding');
            $table->unsignedInteger('token_count')->default(0);
            $table->timestamps();

            $table->index('course_document_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_document_chunks');
        Schema::dropIfExists('course_documents');
    }
};
