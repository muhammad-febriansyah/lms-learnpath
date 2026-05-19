<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('b2c_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('b2c_plan_id')->constrained()->cascadeOnDelete();
            $table->string('status', 24)->default('active');
            $table->dateTime('started_at');
            $table->dateTime('ends_at');
            $table->foreignId('last_order_id')
                ->nullable()
                ->constrained('orders')
                ->nullOnDelete();
            $table->dateTime('cancelled_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['status', 'ends_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('b2c_subscriptions');
    }
};
