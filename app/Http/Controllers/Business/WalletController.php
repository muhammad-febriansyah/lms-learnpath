<?php

namespace App\Http\Controllers\Business;

use App\Actions\Marketplace\CreateOrderForWalletTopUp;
use App\Actions\Marketplace\InitiatePakasirPayment;
use App\DataTransferObjects\Marketplace\CreateWalletTopUpOrderData;
use App\Http\Controllers\Controller;
use App\Models\WalletTransaction;
use App\Services\Payment\Enums\PaymentMethod;
use App\Services\Wallet\InsufficientBalanceException;
use App\Services\Wallet\WalletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    use ResolvesOrganization;

    public const PRESET_AMOUNTS = [500_000, 1_000_000, 2_500_000, 5_000_000, 10_000_000];

    public const PRICE_PER_SEAT = 250_000;

    public function __construct(
        private readonly WalletService $wallet,
        private readonly CreateOrderForWalletTopUp $createOrder,
        private readonly InitiatePakasirPayment $initiatePayment,
    ) {}

    public function index(Request $request): Response
    {
        $org = $this->resolveOrganization($request);
        $wallet = $this->wallet->ensureFor($org);

        $transactions = WalletTransaction::query()
            ->where('organization_wallet_id', $wallet->id)
            ->with('performedBy:id,name')
            ->latest('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (WalletTransaction $t) => [
                'id' => $t->id,
                'type' => $t->type,
                'amount' => (int) $t->amount,
                'balance_after' => (int) $t->balance_after,
                'description' => $t->description,
                'performed_by' => $t->performedBy?->name,
                'created_at' => $t->created_at?->toIso8601String(),
            ]);

        $stats = [
            'topup_total' => (int) WalletTransaction::query()
                ->where('organization_wallet_id', $wallet->id)
                ->whereIn('type', WalletTransaction::CREDIT_TYPES)
                ->sum('amount'),
            'debit_total' => (int) abs((int) WalletTransaction::query()
                ->where('organization_wallet_id', $wallet->id)
                ->whereIn('type', WalletTransaction::DEBIT_TYPES)
                ->sum('amount')),
            'last_topup_at' => WalletTransaction::query()
                ->where('organization_wallet_id', $wallet->id)
                ->where('type', WalletTransaction::TYPE_TOP_UP)
                ->latest('id')
                ->value('created_at')
                ?->toIso8601String(),
        ];

        return Inertia::render('business/wallet/index', [
            'organization' => [
                'id' => $org->id,
                'name' => $org->name,
                'seat_quota' => (int) $org->seat_quota,
                'seats_used' => (int) $org->seats_used,
            ],
            'wallet' => [
                'balance' => (int) $wallet->balance,
                'currency' => $wallet->currency,
                'low_balance_threshold' => (int) $wallet->low_balance_threshold,
                'is_low' => $wallet->isLow(),
            ],
            'transactions' => $transactions,
            'stats' => $stats,
            'pricing' => [
                'price_per_seat' => self::PRICE_PER_SEAT,
            ],
        ]);
    }

    public function showTopUp(Request $request): Response
    {
        $org = $this->resolveOrganization($request);
        $wallet = $this->wallet->ensureFor($org);

        $user = $request->user();

        return Inertia::render('business/wallet/top-up', [
            'organization' => [
                'id' => $org->id,
                'name' => $org->name,
            ],
            'wallet' => [
                'balance' => (int) $wallet->balance,
                'currency' => $wallet->currency,
            ],
            'presetAmounts' => self::PRESET_AMOUNTS,
            'paymentMethods' => collect(PaymentMethod::cases())->map(fn (PaymentMethod $m) => [
                'value' => $m->value,
                'label' => $m->label(),
                'is_va' => $m->isVirtualAccount(),
            ])->all(),
            'customer' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
        ]);
    }

    public function storeTopUp(Request $request): RedirectResponse
    {
        $org = $this->resolveOrganization($request);
        $user = $request->user();

        $data = $request->validate([
            'amount' => ['required', 'integer', 'min:50000', 'max:500000000'],
            'payment_method' => [
                'required',
                Rule::in(array_map(fn (PaymentMethod $m) => $m->value, PaymentMethod::cases())),
            ],
            'customer_name' => ['nullable', 'string', 'max:255'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:32'],
        ], [
            'amount.min' => 'Top-up minimal Rp 50.000.',
        ]);

        $order = $this->createOrder->execute(new CreateWalletTopUpOrderData(
            user: $user,
            organization: $org,
            amount: (int) $data['amount'],
            customerName: $data['customer_name'] ?? null,
            customerEmail: $data['customer_email'] ?? null,
            customerPhone: $data['customer_phone'] ?? null,
        ));

        $method = PaymentMethod::from($data['payment_method']);

        $payment = $this->initiatePayment->execute(
            $order,
            $method,
            route('business.wallet.index'),
        );

        return redirect()
            ->route('orders.show', ['order' => $order->order_number])
            ->with('success', 'Order top-up dibuat. Selesaikan pembayaran Anda.')
            ->with('payment_url', $payment->payment_url);
    }

    public function updateThreshold(Request $request): RedirectResponse
    {
        $org = $this->resolveOrganization($request);
        $wallet = $this->wallet->ensureFor($org);

        $data = $request->validate([
            'low_balance_threshold' => ['required', 'integer', 'min:0', 'max:500000000'],
        ]);

        $wallet->update(['low_balance_threshold' => (int) $data['low_balance_threshold']]);

        return back()->with('success', 'Threshold notifikasi diperbarui.');
    }

    /**
     * Purchase additional seats by debiting the org's wallet. Bypasses Pakasir
     * since the funds are already in our system.
     */
    public function purchaseSeatsFromWallet(Request $request): RedirectResponse
    {
        $org = $this->resolveOrganization($request);
        $wallet = $this->wallet->ensureFor($org);
        $user = $request->user();

        $data = $request->validate([
            'seats' => ['required', 'integer', 'min:1', 'max:10000'],
        ]);

        $seats = (int) $data['seats'];
        $cost = $seats * self::PRICE_PER_SEAT;

        try {
            $this->wallet->debit(
                wallet: $wallet,
                amount: $cost,
                type: WalletTransaction::TYPE_DEBIT,
                reference: $org,
                description: "Pembelian {$seats} seat tambahan",
                performedBy: $user,
                metadata: [
                    'seats' => $seats,
                    'price_per_seat' => self::PRICE_PER_SEAT,
                ],
            );
        } catch (InsufficientBalanceException) {
            return back()->withErrors([
                'seats' => 'Saldo wallet tidak cukup. Silakan top-up dulu.',
            ]);
        }

        $org->increment('seat_quota', $seats);

        return redirect()
            ->route('business.seats.index')
            ->with('success', "Berhasil menambah {$seats} seat dari saldo wallet.");
    }
}
