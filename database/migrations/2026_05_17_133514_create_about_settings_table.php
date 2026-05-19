<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('about_settings', function (Blueprint $table) {
            $table->id();

            // Hero
            $table->string('title')->nullable();
            $table->string('tagline')->nullable();
            $table->string('hero_image')->nullable();

            // Tentang
            $table->text('description')->nullable();
            $table->unsignedSmallInteger('founded_year')->nullable();

            // Visi & Misi
            $table->text('vision')->nullable();
            $table->text('mission')->nullable();

            // Nilai-nilai (array of { title, description })
            $table->json('values')->nullable();

            // Statistik (array of { label, value, suffix })
            $table->json('stats')->nullable();

            // Founder / CEO
            $table->string('founder_name')->nullable();
            $table->string('founder_role')->nullable();
            $table->string('founder_photo')->nullable();
            $table->text('founder_message')->nullable();

            // Kontak
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->text('contact_address')->nullable();
            $table->string('contact_map_url')->nullable();

            // Sosial media
            $table->string('social_facebook')->nullable();
            $table->string('social_instagram')->nullable();
            $table->string('social_twitter')->nullable();
            $table->string('social_linkedin')->nullable();
            $table->string('social_youtube')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('about_settings');
    }
};
