<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_points', function (Blueprint $table) {
            $table->foreignId('user_id')->primary()->constrained()->cascadeOnDelete();
            $table->unsignedInteger('total_points')->default(0);
            $table->unsignedInteger('lifetime_points')->default(0);
            $table->string('level', 32)->default('bronze');
            $table->date('last_login_award_date')->nullable();
            $table->timestamps();

            $table->index('total_points');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_points');
    }
};
