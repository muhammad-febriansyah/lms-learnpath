<?php

namespace Database\Factories;

use App\Models\Certificate;
use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Certificate>
 */
class CertificateFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'course_id' => Course::factory(),
            'learning_path_id' => null,
            'subject_type' => 'course',
            'certificate_number' => 'CERT-'.strtoupper(fake()->bothify('####-????')),
            'verification_code' => Str::upper(Str::random(12)),
            'pdf_path' => null,
            'issued_at' => now(),
            'expired_at' => null,
            'status' => 'issued',
        ];
    }

    public function forPath(\App\Models\LearningPath $path): static
    {
        return $this->state(fn () => [
            'course_id' => null,
            'learning_path_id' => $path->id,
            'subject_type' => 'path',
        ]);
    }
}
