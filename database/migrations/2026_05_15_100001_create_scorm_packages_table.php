<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scorm_packages', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('zip_path');
            $table->string('extracted_path')->nullable();
            $table->string('manifest_path')->nullable();
            $table->string('launch_file')->nullable();
            $table->string('version')->nullable();
            $table->string('status')->default('uploaded');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scorm_packages');
    }
};
