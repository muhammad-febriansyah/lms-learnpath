<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('learning_paths', function (Blueprint $table) {
            $table->unsignedInteger('price')->default(0)->after('outcomes');
            $table->unsignedInteger('compare_at_price')->nullable()->after('price');
        });
    }

    public function down(): void
    {
        Schema::table('learning_paths', function (Blueprint $table) {
            $table->dropColumn(['price', 'compare_at_price']);
        });
    }
};
