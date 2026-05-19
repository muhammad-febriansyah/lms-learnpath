<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->string('display_name', 120)->nullable()->after('name');
            $table->string('tagline', 200)->nullable()->after('display_name');
            $table->string('brand_primary_color', 7)->nullable()->after('logo_path');
        });
    }

    public function down(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn(['display_name', 'tagline', 'brand_primary_color']);
        });
    }
};
