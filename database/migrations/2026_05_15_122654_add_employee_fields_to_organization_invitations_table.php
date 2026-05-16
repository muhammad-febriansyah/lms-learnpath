<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organization_invitations', function (Blueprint $table) {
            $table->foreignId('position_id')->nullable()->after('role')->constrained()->nullOnDelete();
            $table->string('employee_number')->nullable()->after('position_id');
            $table->string('division')->nullable()->after('employee_number');
            $table->string('branch')->nullable()->after('division');
            $table->timestamp('last_sent_at')->nullable()->after('expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('organization_invitations', function (Blueprint $table) {
            $table->dropConstrainedForeignId('position_id');
            $table->dropColumn(['employee_number', 'division', 'branch', 'last_sent_at']);
        });
    }
};
