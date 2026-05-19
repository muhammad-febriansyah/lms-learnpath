<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\OrganizationWallet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrganizationWallet>
 */
class OrganizationWalletFactory extends Factory
{
    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'balance' => 0,
            'currency' => 'IDR',
            'low_balance_threshold' => 0,
        ];
    }
}
