<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('voucher_batches', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('prefix', 16)->nullable();
            $table->string('grant_kind', 32);
            $table->nullableMorphs('grantable');
            $table->unsignedInteger('points_amount')->nullable();
            $table->dateTime('valid_from')->nullable();
            $table->dateTime('valid_until')->nullable();
            $table->unsignedInteger('total_codes')->default(0);
            $table->unsignedInteger('redeemed_count')->default(0);
            $table->boolean('single_use_per_user')->default(true);
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('note')->nullable();
            $table->timestamps();

            $table->index(['is_active', 'valid_from', 'valid_until'], 'vb_active_window_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('voucher_batches');
    }
};
