<?php

namespace Database\Factories;

use App\Models\CertificateTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CertificateTemplate>
 */
class CertificateTemplateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => 'Template '.$this->faker->unique()->word(),
            'scope' => $this->faker->randomElement([
                CertificateTemplate::SCOPE_COURSE,
                CertificateTemplate::SCOPE_LEARNING_PATH,
                CertificateTemplate::SCOPE_CORPORATE,
            ]),
            'orientation' => $this->faker->randomElement(['landscape', 'portrait']),
            'status' => $this->faker->randomElement(['draft', 'active']),
            'background_type' => CertificateTemplate::BACKGROUND_PRESET,
            'background_preset' => $this->faker->randomElement(array_keys(CertificateTemplate::backgroundPresets())),
            'background_path' => null,
            'title' => 'Sertifikat Penyelesaian',
            'subtitle' => 'Diberikan kepada peserta terbaik',
            'body_text' => 'Template ini diberikan untuk peserta yang telah menyelesaikan program pembelajaran.',
            'show_qr' => true,
            'show_signature' => true,
            'sort_order' => $this->faker->numberBetween(0, 20),
        ];
    }
}
