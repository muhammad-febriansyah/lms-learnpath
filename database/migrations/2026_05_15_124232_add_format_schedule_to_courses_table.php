<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->string('delivery_format', 32)->default('on_demand')->after('level');
            $table->boolean('is_certified')->default(false)->after('delivery_format');
            $table->unsignedBigInteger('compare_at_price')->nullable()->after('price');
            $table->timestamp('schedule_start')->nullable()->after('duration_minutes');
            $table->timestamp('schedule_end')->nullable()->after('schedule_start');
            $table->string('schedule_location')->nullable()->after('schedule_end');

            $table->index(['delivery_format', 'is_published']);
            $table->index('is_certified');
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropIndex(['delivery_format', 'is_published']);
            $table->dropIndex(['is_certified']);
            $table->dropColumn([
                'delivery_format',
                'is_certified',
                'compare_at_price',
                'schedule_start',
                'schedule_end',
                'schedule_location',
            ]);
        });
    }
};
