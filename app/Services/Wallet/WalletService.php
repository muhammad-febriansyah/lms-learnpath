<?php

namespace App\Services\Wallet;

use App\Models\Organization;
use App\Models\OrganizationWallet;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * Atomic wallet operations. All balance mutations go through credit() / debit()
 * so the ledger (wallet_transactions) and the wallet's current balance stay
 * consistent. Both methods acquire a row lock to prevent race conditions on
 * concurrent debits.
 */
final class WalletService
{
    public function ensureFor(Organization $organization): OrganizationWallet
    {
        return OrganizationWallet::firstOrCreate(
            ['organization_id' => $organization->id],
            ['balance' => 0, 'currency' => 'IDR'],
        );
    }

    /**
     * Add funds to wallet (top-up / refund / manual adjustment).
     */
    public function credit(
        OrganizationWallet $wallet,
        int $amount,
        string $type,
        ?Model $reference = null,
        ?string $description = null,
        ?User $performedBy = null,
        ?array $metadata = null,
    ): WalletTransaction {
        if ($amount <= 0) {
            throw new InvalidArgumentException('Credit amount must be positive.');
        }
        if (! in_array($type, WalletTransaction::CREDIT_TYPES, true)) {
            throw new InvalidArgumentException("Type {$type} is not a credit type.");
        }

        return DB::transaction(function () use ($wallet, $amount, $type, $reference, $description, $performedBy, $metadata) {
            $locked = OrganizationWallet::query()
                ->whereKey($wallet->id)
                ->lockForUpdate()
                ->firstOrFail();

            $newBalance = (int) $locked->balance + $amount;

            $locked->update(['balance' => $newBalance]);

            return WalletTransaction::create([
                'organization_wallet_id' => $locked->id,
                'type' => $type,
                'amount' => $amount,
                'balance_after' => $newBalance,
                'reference_type' => $reference ? $reference::class : null,
                'reference_id' => $reference?->getKey(),
                'description' => $description,
                'performed_by_user_id' => $performedBy?->id,
                'metadata' => $metadata,
            ]);
        });
    }

    /**
     * Spend from wallet (purchase / manual adjustment). Throws when insufficient.
     */
    public function debit(
        OrganizationWallet $wallet,
        int $amount,
        string $type,
        ?Model $reference = null,
        ?string $description = null,
        ?User $performedBy = null,
        ?array $metadata = null,
    ): WalletTransaction {
        if ($amount <= 0) {
            throw new InvalidArgumentException('Debit amount must be positive.');
        }
        if (! in_array($type, WalletTransaction::DEBIT_TYPES, true)) {
            throw new InvalidArgumentException("Type {$type} is not a debit type.");
        }

        return DB::transaction(function () use ($wallet, $amount, $type, $reference, $description, $performedBy, $metadata) {
            $locked = OrganizationWallet::query()
                ->whereKey($wallet->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ((int) $locked->balance < $amount) {
                throw new InsufficientBalanceException(
                    "Wallet balance {$locked->balance} insufficient for debit of {$amount}.",
                );
            }

            $newBalance = (int) $locked->balance - $amount;

            $locked->update(['balance' => $newBalance]);

            return WalletTransaction::create([
                'organization_wallet_id' => $locked->id,
                'type' => $type,
                'amount' => -$amount,
                'balance_after' => $newBalance,
                'reference_type' => $reference ? $reference::class : null,
                'reference_id' => $reference?->getKey(),
                'description' => $description,
                'performed_by_user_id' => $performedBy?->id,
                'metadata' => $metadata,
            ]);
        });
    }

    public function hasSufficientBalance(OrganizationWallet $wallet, int $amount): bool
    {
        return (int) $wallet->balance >= $amount;
    }
}
