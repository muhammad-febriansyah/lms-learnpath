<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('point_redemptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('point_redemption_offer_id')
                ->constrained('point_redemption_offers')
                ->cascadeOnDelete();
            $table->morphs('redeemable');
            $table->unsignedInteger('points_spent');
            $table->foreignId('point_transaction_id')
                ->nullable()
                ->constrained('point_transactions')
                ->nullOnDelete();
            $table->string('status', 24)->default('completed');
            $table->foreignId('refund_transaction_id')
                ->nullable()
                ->constrained('point_transactions')
                ->nullOnDelete();
            $table->dateTime('refunded_at')->nullable();
            $table->string('refund_reason')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['point_redemption_offer_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('point_redemptions');
    }
};
