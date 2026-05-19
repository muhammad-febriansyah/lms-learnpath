<?php

use App\Actions\Marketplace\CreateOrderForWalletTopUp;
use App\Actions\Marketplace\MarkOrderAsPaid;
use App\DataTransferObjects\Marketplace\CreateWalletTopUpOrderData;
use App\DataTransferObjects\Marketplace\PakasirWebhookData;
use App\Models\Order;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\OrganizationWallet;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Services\Wallet\InsufficientBalanceException;
use App\Services\Wallet\WalletService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Permission::findOrCreate('payment.view', 'web');
    Role::findOrCreate('hr', 'web');
    Role::findOrCreate('superadmin', 'web')->givePermissionTo('payment.view');

    $this->org = Organization::create([
        'name' => 'PT Wallet Test',
        'slug' => 'pt-wallet-test',
        'contact_name' => 'HR',
        'contact_email' => 'hr@wallet.test',
        'seat_quota' => 10,
        'seats_used' => 0,
        'status' => 'active',
    ]);

    $this->hr = User::factory()->create(['email_verified_at' => now()]);
    $this->hr->assignRole('hr');
    OrganizationMember::create([
        'organization_id' => $this->org->id,
        'user_id' => $this->hr->id,
        'role' => 'admin',
        'joined_at' => now(),
    ]);
});

it('lazily creates the org wallet via ensureFor', function () {
    expect($this->org->wallet)->toBeNull();

    $wallet = app(WalletService::class)->ensureFor($this->org);

    expect($wallet)->toBeInstanceOf(OrganizationWallet::class);
    expect((int) $wallet->balance)->toBe(0);
});

it('credit increases balance and writes a positive ledger entry', function () {
    $wallet = app(WalletService::class)->ensureFor($this->org);

    $tx = app(WalletService::class)->credit(
        wallet: $wallet,
        amount: 500_000,
        type: WalletTransaction::TYPE_TOP_UP,
        description: 'Test top up',
        performedBy: $this->hr,
    );

    expect((int) $tx->amount)->toBe(500_000);
    expect((int) $tx->balance_after)->toBe(500_000);
    expect((int) $wallet->fresh()->balance)->toBe(500_000);
});

it('debit decreases balance and records a negative ledger entry', function () {
    $service = app(WalletService::class);
    $wallet = $service->ensureFor($this->org);
    $service->credit($wallet, 1_000_000, WalletTransaction::TYPE_TOP_UP);

    $tx = $service->debit(
        wallet: $wallet,
        amount: 300_000,
        type: WalletTransaction::TYPE_DEBIT,
        description: 'Test debit',
    );

    expect((int) $tx->amount)->toBe(-300_000);
    expect((int) $tx->balance_after)->toBe(700_000);
    expect((int) $wallet->fresh()->balance)->toBe(700_000);
});

it('debit throws when balance is insufficient', function () {
    $service = app(WalletService::class);
    $wallet = $service->ensureFor($this->org);
    $service->credit($wallet, 100_000, WalletTransaction::TYPE_TOP_UP);

    expect(fn () => $service->debit(
        wallet: $wallet,
        amount: 200_000,
        type: WalletTransaction::TYPE_DEBIT,
    ))->toThrow(InsufficientBalanceException::class);

    expect((int) $wallet->fresh()->balance)->toBe(100_000);
});

it('rejects credit type used for debit and vice versa', function () {
    $wallet = app(WalletService::class)->ensureFor($this->org);

    expect(fn () => app(WalletService::class)->credit(
        $wallet,
        100,
        WalletTransaction::TYPE_DEBIT,
    ))->toThrow(InvalidArgumentException::class);

    expect(fn () => app(WalletService::class)->debit(
        $wallet,
        100,
        WalletTransaction::TYPE_TOP_UP,
    ))->toThrow(InvalidArgumentException::class);
});

it('creates a wallet_topup order and credits the wallet when paid', function () {
    $order = app(CreateOrderForWalletTopUp::class)->execute(
        new CreateWalletTopUpOrderData(
            user: $this->hr,
            organization: $this->org,
            amount: 1_500_000,
        ),
    );

    expect($order->type)->toBe('wallet_topup');
    expect($order->total)->toBe(1_500_000);

    app(MarkOrderAsPaid::class)->execute($order, new PakasirWebhookData(
        orderId: $order->order_number,
        amount: $order->total,
        status: 'completed',
        paymentMethod: 'qris',
    ));

    $wallet = $this->org->wallet()->first();
    expect($wallet)->not->toBeNull();
    expect((int) $wallet->balance)->toBe(1_500_000);

    expect(WalletTransaction::query()
        ->where('organization_wallet_id', $wallet->id)
        ->where('type', WalletTransaction::TYPE_TOP_UP)
        ->count())->toBe(1);
});

it('HR can view the wallet page and ledger', function () {
    $wallet = app(WalletService::class)->ensureFor($this->org);
    app(WalletService::class)->credit($wallet, 2_000_000, WalletTransaction::TYPE_TOP_UP);

    $this->actingAs($this->hr)
        ->withoutVite()
        ->get('/business/wallet')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('business/wallet/index')
            ->where('wallet.balance', 2_000_000)
            ->where('stats.topup_total', 2_000_000)
        );
});

it('HR can submit a wallet top-up order', function () {
    $this->actingAs($this->hr)
        ->post('/business/wallet/top-up', [
            'amount' => 750_000,
            'payment_method' => 'qris',
        ])
        ->assertRedirect();

    expect(Order::query()
        ->where('user_id', $this->hr->id)
        ->where('type', 'wallet_topup')
        ->where('total', 750_000)
        ->exists())->toBeTrue();
});

it('HR can buy additional seats by debiting the wallet', function () {
    $wallet = app(WalletService::class)->ensureFor($this->org);
    app(WalletService::class)->credit($wallet, 1_000_000, WalletTransaction::TYPE_TOP_UP);

    $startingQuota = $this->org->seat_quota;

    $this->actingAs($this->hr)
        ->post('/business/wallet/purchase-seats', ['seats' => 3])
        ->assertRedirect();

    expect((int) $this->org->fresh()->seat_quota)->toBe($startingQuota + 3);
    expect((int) $wallet->fresh()->balance)->toBe(1_000_000 - 750_000);
});

it('blocks seat purchase when wallet balance is insufficient', function () {
    app(WalletService::class)->ensureFor($this->org);

    $this->actingAs($this->hr)
        ->post('/business/wallet/purchase-seats', ['seats' => 1])
        ->assertSessionHasErrors('seats');

    expect((int) $this->org->fresh()->seat_quota)->toBe(10);
});

it('admin can list all org wallets', function () {
    $admin = User::factory()->create(['email_verified_at' => now()]);
    $admin->assignRole('superadmin');

    app(WalletService::class)->ensureFor($this->org);

    $this->actingAs($admin)
        ->withoutVite()
        ->get('/admin/organization-wallets')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/organization-wallets/index')
            ->has('wallets.data', 1)
            ->where('stats.total_wallets', 1)
        );
});

it('admin can apply a manual credit adjustment', function () {
    $admin = User::factory()->create(['email_verified_at' => now()]);
    $admin->assignRole('superadmin');

    $wallet = app(WalletService::class)->ensureFor($this->org);

    $this->actingAs($admin)
        ->post("/admin/organization-wallets/{$wallet->id}/adjust", [
            'direction' => 'credit',
            'amount' => 250_000,
            'reason' => 'Refund di luar sistem',
        ])
        ->assertRedirect();

    expect((int) $wallet->fresh()->balance)->toBe(250_000);
    expect(WalletTransaction::query()
        ->where('organization_wallet_id', $wallet->id)
        ->where('type', WalletTransaction::TYPE_ADJUSTMENT_CREDIT)
        ->where('performed_by_user_id', $admin->id)
        ->exists())->toBeTrue();
});

it('forbids non-admin from admin wallet endpoints', function () {
    $stranger = User::factory()->create(['email_verified_at' => now()]);

    $this->actingAs($stranger)
        ->get('/admin/organization-wallets')
        ->assertForbidden();
});

it('forbids non-org-admin from business wallet endpoints', function () {
    $stranger = User::factory()->create(['email_verified_at' => now()]);
    $stranger->assignRole('hr');

    $this->actingAs($stranger)
        ->get('/business/wallet')
        ->assertForbidden();
});
