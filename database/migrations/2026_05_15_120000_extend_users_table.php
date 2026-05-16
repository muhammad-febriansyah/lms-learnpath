<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable()->unique()->after('email');
            $table->string('phone')->nullable()->after('username');
            $table->timestamp('phone_verified_at')->nullable()->after('phone');
            $table->string('avatar_path')->nullable()->after('phone_verified_at');
            $table->text('bio')->nullable()->after('avatar_path');
            $table->string('gender', 16)->nullable()->after('bio');
            $table->date('date_of_birth')->nullable()->after('gender');
            $table->string('address')->nullable()->after('date_of_birth');
            $table->string('city')->nullable()->after('address');
            $table->string('province')->nullable()->after('city');
            $table->string('country', 2)->default('ID')->after('province');
            $table->string('language', 5)->default('id')->after('country');
            $table->string('timezone', 64)->default('Asia/Jakarta')->after('language');
            $table->string('status', 32)->default('active')->after('timezone');
            $table->string('google_id')->nullable()->unique()->after('status');
            $table->string('referral_code', 32)->nullable()->unique()->after('google_id');
            $table->foreignId('referred_by')->nullable()->after('referral_code')->constrained('users')->nullOnDelete();
            $table->boolean('marketing_consent')->default(false)->after('referred_by');
            $table->json('notification_preferences')->nullable()->after('marketing_consent');
            $table->timestamp('last_login_at')->nullable()->after('notification_preferences');
            $table->string('last_login_ip', 45)->nullable()->after('last_login_at');
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('referred_by');
            $table->dropColumn([
                'username',
                'phone',
                'phone_verified_at',
                'avatar_path',
                'bio',
                'gender',
                'date_of_birth',
                'address',
                'city',
                'province',
                'country',
                'language',
                'timezone',
                'status',
                'google_id',
                'referral_code',
                'marketing_consent',
                'notification_preferences',
                'last_login_at',
                'last_login_ip',
            ]);
            $table->dropSoftDeletes();
        });
    }
};
