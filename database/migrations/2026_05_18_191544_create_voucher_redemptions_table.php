<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('voucher_redemptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('voucher_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('grant_kind', 32);
            $table->nullableMorphs('grantable');
            $table->unsignedInteger('points_credited')->nullable();
            $table->json('result_summary')->nullable();
            $table->dateTime('redeemed_at');
            $table->timestamps();

            $table->unique(['voucher_id', 'user_id'], 'voucher_redemptions_voucher_user_unique');
            $table->index(['user_id', 'redeemed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('voucher_redemptions');
    }
};
