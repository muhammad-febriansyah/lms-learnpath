<?php

namespace Database\Factories;

use App\Models\Setting;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Setting>
 */
class SettingFactory extends Factory
{
    public function definition(): array
    {
        $key = Str::slug(fake()->unique()->words(2, true), '_');

        return [
            'key' => $key,
            'value' => fake()->sentence(),
            'type' => 'text',
            'group' => 'general',
            'label' => Str::title(str_replace('_', ' ', $key)),
            'description' => null,
            'sort_order' => 0,
            'is_public' => false,
        ];
    }
}
