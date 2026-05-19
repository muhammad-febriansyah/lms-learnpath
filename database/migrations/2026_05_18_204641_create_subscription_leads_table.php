<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscription_plan_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();
            $table->string('company_name', 200);
            $table->string('contact_name', 120);
            $table->string('email', 200);
            $table->string('phone', 32)->nullable();
            $table->unsignedInteger('employee_count')->nullable();
            $table->text('message')->nullable();
            $table->string('status', 24)->default('new');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('contacted_at')->nullable();
            $table->text('notes')->nullable();
            $table->string('source', 64)->default('pricing_page');
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_leads');
    }
};
