<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('certificate_templates', function (Blueprint $table) {
            if (! Schema::hasColumn('certificate_templates', 'background_type')) {
                $table->string('background_type', 16)->default('preset')->after('status');
            }
            if (! Schema::hasColumn('certificate_templates', 'background_preset')) {
                $table->string('background_preset', 64)->nullable()->after('background_type');
            }
            $table->string('primary_color', 9)->default('#1d4ed8');
            $table->string('accent_color', 9)->default('#f59e0b');
            $table->string('font_family', 32)->default('sans');
            $table->string('issuer_name')->nullable();
            $table->string('issuer_logo_path')->nullable();
            $table->string('signatory_name')->nullable();
            $table->string('signatory_title')->nullable();
            $table->string('signature_path')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('certificate_templates', function (Blueprint $table) {
            $table->dropColumn([
                'primary_color',
                'accent_color',
                'font_family',
                'issuer_name',
                'issuer_logo_path',
                'signatory_name',
                'signatory_title',
                'signature_path',
            ]);
        });
    }
};
