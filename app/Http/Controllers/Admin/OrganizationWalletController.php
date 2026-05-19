<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrganizationWallet;
use App\Models\WalletTransaction;
use App\Services\Wallet\InsufficientBalanceException;
use App\Services\Wallet\WalletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationWalletController extends Controller
{
    public function __construct(
        private readonly WalletService $wallet,
    ) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('payment.view'), 403);

        $search = $request->string('search')->trim()->value();

        $wallets = OrganizationWallet::query()
            ->with('organization:id,name,slug,contact_email')
            ->when($search !== '', function ($q) use ($search) {
                $q->whereHas('organization', fn ($oq) => $oq
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%"));
            })
            ->orderByDesc('balance')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (OrganizationWallet $w) => [
                'id' => $w->id,
                'organization' => [
                    'id' => $w->organization?->id,
                    'name' => $w->organization?->name,
                    'slug' => $w->organization?->slug,
                ],
                'balance' => (int) $w->balance,
                'currency' => $w->currency,
                'low_balance_threshold' => (int) $w->low_balance_threshold,
                'is_low' => $w->isLow(),
                'updated_at' => $w->updated_at?->toIso8601String(),
            ]);

        $stats = [
            'total_wallets' => OrganizationWallet::query()->count(),
            'total_balance' => (int) OrganizationWallet::query()->sum('balance'),
            'low_count' => OrganizationWallet::query()
                ->whereColumn('balance', '<=', 'low_balance_threshold')
                ->where('low_balance_threshold', '>', 0)
                ->count(),
        ];

        return Inertia::render('admin/organization-wallets/index', [
            'wallets' => $wallets,
            'stats' => $stats,
            'filters' => ['search' => $search ?: null],
        ]);
    }

    public function show(Request $request, OrganizationWallet $wallet): Response
    {
        abort_unless($request->user()?->can('payment.view'), 403);

        $wallet->load('organization');

        $transactions = WalletTransaction::query()
            ->where('organization_wallet_id', $wallet->id)
            ->with('performedBy:id,name')
            ->latest('id')
            ->paginate(25)
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

        return Inertia::render('admin/organization-wallets/show', [
            'wallet' => [
                'id' => $wallet->id,
                'balance' => (int) $wallet->balance,
                'currency' => $wallet->currency,
                'low_balance_threshold' => (int) $wallet->low_balance_threshold,
                'is_low' => $wallet->isLow(),
                'updated_at' => $wallet->updated_at?->toIso8601String(),
            ],
            'organization' => [
                'id' => $wallet->organization?->id,
                'name' => $wallet->organization?->name,
                'slug' => $wallet->organization?->slug,
                'contact_email' => $wallet->organization?->contact_email,
            ],
            'transactions' => $transactions,
        ]);
    }

    public function adjust(Request $request, OrganizationWallet $wallet): RedirectResponse
    {
        abort_unless($request->user()?->can('payment.view'), 403);

        $data = $request->validate([
            'direction' => ['required', 'in:credit,debit'],
            'amount' => ['required', 'integer', 'min:1', 'max:1000000000'],
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $amount = (int) $data['amount'];
        $direction = $data['direction'];

        try {
            if ($direction === 'credit') {
                $this->wallet->credit(
                    wallet: $wallet,
                    amount: $amount,
                    type: WalletTransaction::TYPE_ADJUSTMENT_CREDIT,
                    reference: $wallet->organization,
                    description: 'Manual: '.$data['reason'],
                    performedBy: $request->user(),
                );
            } else {
                $this->wallet->debit(
                    wallet: $wallet,
                    amount: $amount,
                    type: WalletTransaction::TYPE_ADJUSTMENT_DEBIT,
                    reference: $wallet->organization,
                    description: 'Manual: '.$data['reason'],
                    performedBy: $request->user(),
                );
            }
        } catch (InsufficientBalanceException) {
            return back()->withErrors(['amount' => 'Saldo wallet tidak cukup untuk debit ini.']);
        }

        return back()->with('success', 'Penyesuaian saldo berhasil.');
    }
}
