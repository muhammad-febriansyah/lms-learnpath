<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('gateway')->default('pakasir');
            $table->string('payment_method')->nullable();
            $table->string('payment_number')->nullable();
            $table->string('payment_url')->nullable();
            $table->unsignedBigInteger('amount');
            $table->unsignedBigInteger('fee')->default(0);
            $table->unsignedBigInteger('total_payment');
            $table->string('status')->default('pending');
            $table->string('gateway_reference')->nullable();
            $table->json('raw_response')->nullable();
            $table->timestamp('expired_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['order_id', 'status']);
            $table->index('gateway');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
