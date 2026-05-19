<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('voucher_batch_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('code', 64)->unique();
            $table->string('grant_kind', 32);
            $table->nullableMorphs('grantable');
            $table->unsignedInteger('points_amount')->nullable();
            $table->dateTime('valid_from')->nullable();
            $table->dateTime('valid_until')->nullable();
            $table->unsignedInteger('max_uses')->default(1);
            $table->unsignedInteger('uses_count')->default(0);
            $table->boolean('single_use_per_user')->default(true);
            $table->boolean('is_active')->default(true);
            $table->string('bound_email')->nullable();
            $table->foreignId('bound_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('note')->nullable();
            $table->timestamps();

            $table->index(['is_active', 'valid_from', 'valid_until'], 'voucher_active_window_idx');
            $table->index(['grantable_type', 'grantable_id'], 'voucher_grantable_idx');
            $table->index('bound_email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};
