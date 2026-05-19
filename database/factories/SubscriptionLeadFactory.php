<?php

namespace Database\Factories;

use App\Models\SubscriptionLead;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SubscriptionLead>
 */
class SubscriptionLeadFactory extends Factory
{
    public function definition(): array
    {
        return [
            'subscription_plan_id' => null,
            'company_name' => fake()->company(),
            'contact_name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'employee_count' => fake()->numberBetween(10, 500),
            'message' => fake()->paragraph(),
            'status' => SubscriptionLead::STATUS_NEW,
            'assigned_to' => null,
            'contacted_at' => null,
            'notes' => null,
            'source' => 'pricing_page',
            'meta' => null,
        ];
    }
}
