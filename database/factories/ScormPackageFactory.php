<?php

namespace Database\Factories;

use App\Models\ScormPackage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ScormPackage>
 */
class ScormPackageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => 'SCORM Package '.fake()->words(2, true),
            'zip_path' => 'scorm/'.fake()->uuid().'.zip',
            'extracted_path' => null,
            'manifest_path' => null,
            'launch_file' => null,
            'version' => '1.2',
            'status' => 'uploaded',
        ];
    }
}
