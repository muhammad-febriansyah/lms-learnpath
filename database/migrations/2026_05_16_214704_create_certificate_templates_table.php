<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('certificate_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('scope', 32)->default('course');
            $table->string('orientation', 16)->default('landscape');
            $table->string('status', 16)->default('draft');
            $table->string('background_path')->nullable();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->text('body_text')->nullable();
            $table->boolean('show_qr')->default(true);
            $table->boolean('show_signature')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['scope', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificate_templates');
    }
};
