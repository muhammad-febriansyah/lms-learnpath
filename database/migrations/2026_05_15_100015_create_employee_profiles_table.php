<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('position_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('supervisor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('employee_number')->nullable();
            $table->string('division')->nullable();
            $table->string('branch')->nullable();
            $table->date('joined_at')->nullable();
            $table->timestamps();

            $table->unique('user_id');
            $table->index(['position_id', 'division', 'branch']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_profiles');
    }
};
