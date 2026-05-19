<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('point_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('reason', 64);
            $table->integer('amount');
            $table->nullableMorphs('reference');
            $table->string('dedupe_key')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->unique('dedupe_key');
            $table->index(['user_id', 'created_at']);
            $table->index(['user_id', 'reason', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('point_transactions');
    }
};
