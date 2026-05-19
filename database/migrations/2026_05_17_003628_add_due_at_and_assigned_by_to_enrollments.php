<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->timestamp('due_at')->nullable()->after('expired_at');
            $table->foreignId('assigned_by_user_id')->nullable()
                ->after('due_at')
                ->constrained('users')->nullOnDelete();
            $table->index('due_at');
        });

        Schema::table('learning_path_enrollments', function (Blueprint $table) {
            $table->timestamp('due_at')->nullable()->after('completed_at');
            $table->foreignId('assigned_by_user_id')->nullable()
                ->after('due_at')
                ->constrained('users')->nullOnDelete();
            $table->index('due_at');
        });
    }

    public function down(): void
    {
        Schema::table('learning_path_enrollments', function (Blueprint $table) {
            $table->dropIndex(['due_at']);
            $table->dropConstrainedForeignId('assigned_by_user_id');
            $table->dropColumn('due_at');
        });
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropIndex(['due_at']);
            $table->dropConstrainedForeignId('assigned_by_user_id');
            $table->dropColumn('due_at');
        });
    }
};
