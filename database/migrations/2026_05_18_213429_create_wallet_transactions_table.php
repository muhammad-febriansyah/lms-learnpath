<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_wallet_id')->constrained()->cascadeOnDelete();
            // Movement direction. top_up/refund/adjustment_credit increase balance;
            // debit/adjustment_debit decrease it. We store the signed amount so the
            // running balance_after stays internally consistent.
            $table->string('type', 32);
            $table->bigInteger('amount');
            $table->unsignedBigInteger('balance_after');
            $table->nullableMorphs('reference', 'wallet_tx_ref_idx');
            $table->string('description', 255)->nullable();
            $table->foreignId('performed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['organization_wallet_id', 'created_at'], 'wallet_tx_wallet_created_idx');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};
