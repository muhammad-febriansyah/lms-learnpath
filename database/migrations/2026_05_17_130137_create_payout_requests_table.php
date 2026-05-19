<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payout_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Money amounts stored as integer rupiah (no fractional cents).
            $table->unsignedBigInteger('gross_amount');
            $table->unsignedBigInteger('fee_amount')->default(0);
            $table->unsignedBigInteger('net_amount');

            // Bank info captured per-request — instructor can update each time.
            $table->string('bank_name', 64);
            $table->string('account_number', 32);
            $table->string('account_holder', 120);

            $table->string('status', 20)->default('pending');
            $table->string('admin_note', 500)->nullable();
            $table->string('reject_reason', 500)->nullable();
            $table->string('proof_path', 500)->nullable();

            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payout_requests');
    }
};
