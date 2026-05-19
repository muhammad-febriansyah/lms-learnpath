<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('point_redemption_offers', function (Blueprint $table) {
            $table->id();
            $table->morphs('redeemable');
            $table->unsignedInteger('point_price');
            $table->boolean('is_active')->default(true);
            $table->dateTime('redeemable_from')->nullable();
            $table->dateTime('redeemable_until')->nullable();
            $table->unsignedInteger('max_per_user')->nullable();
            $table->unsignedInteger('max_total')->nullable();
            $table->unsignedInteger('redemptions_count')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('note')->nullable();
            $table->timestamps();

            $table->unique(['redeemable_type', 'redeemable_id'], 'point_redemption_offers_redeemable_unique');
            $table->index(['is_active', 'redeemable_from', 'redeemable_until'], 'pro_active_window_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('point_redemption_offers');
    }
};
