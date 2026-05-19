<?php

namespace Database\Factories;

use App\Models\OrganizationWallet;
use App\Models\WalletTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WalletTransaction>
 */
class WalletTransactionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'organization_wallet_id' => OrganizationWallet::factory(),
            'type' => WalletTransaction::TYPE_TOP_UP,
            'amount' => 100_000,
            'balance_after' => 100_000,
            'description' => 'Top up via Pakasir',
            'metadata' => null,
        ];
    }
}
