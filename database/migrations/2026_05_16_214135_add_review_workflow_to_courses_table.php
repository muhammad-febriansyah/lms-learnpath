<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->string('review_status', 32)->default('draft')->after('is_published');
            $table->text('review_notes')->nullable()->after('review_status');
            $table->timestamp('submitted_at')->nullable()->after('review_notes');
            $table->timestamp('reviewed_at')->nullable()->after('submitted_at');
            $table->foreignId('reviewed_by')->nullable()->after('reviewed_at')->constrained('users')->nullOnDelete();
            $table->unsignedInteger('max_participants')->nullable()->after('schedule_location');

            $table->index('review_status');
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropIndex(['review_status']);
            $table->dropForeign(['reviewed_by']);
            $table->dropColumn([
                'review_status',
                'review_notes',
                'submitted_at',
                'reviewed_at',
                'reviewed_by',
                'max_participants',
            ]);
        });
    }
};
