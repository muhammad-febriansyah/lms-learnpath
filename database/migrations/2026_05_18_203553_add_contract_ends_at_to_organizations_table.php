<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->date('contract_ends_at')->nullable()->after('status');
            $table->string('billing_address')->nullable()->after('contract_ends_at');
            $table->string('billing_tax_id', 32)->nullable()->after('billing_address');
        });
    }

    public function down(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn(['contract_ends_at', 'billing_address', 'billing_tax_id']);
        });
    }
};
