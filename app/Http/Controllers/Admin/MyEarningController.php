<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PayoutRequest;
use App\Services\Payout\EarningsCalculator;
use App\Support\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MyEarningController extends Controller
{
    public function __construct(private readonly EarningsCalculator $earnings) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user->hasRole('instructor'), 403);

        $minAmount = (int) Setting::get('payout_min_amount', 50_000);
        $feePct = (float) Setting::get('payout_fee_percent', 0);
        $sharePct = (float) Setting::get('payout_revenue_share_percent', 100);

        $history = PayoutRequest::query()
            ->where('user_id', $user->id)
            ->latest('id')
            ->limit(20)
            ->get()
            ->map(fn (PayoutRequest $p) => [
                'id' => $p->id,
                'gross_amount' => $p->gross_amount,
                'fee_amount' => $p->fee_amount,
                'net_amount' => $p->net_amount,
                'bank_name' => $p->bank_name,
                'account_number' => $p->account_number,
                'account_holder' => $p->account_holder,
                'status' => $p->status,
                'admin_note' => $p->admin_note,
                'reject_reason' => $p->reject_reason,
                'proof_url' => $p->proof_path ? asset('storage/'.$p->proof_path) : null,
                'created_at' => $p->created_at?->toIso8601String(),
                'paid_at' => $p->paid_at?->toIso8601String(),
            ]);

        $lastBank = $history->first();

        return Inertia::render('admin/my-earnings/index', [
            'summary' => [
                'gross' => $this->earnings->grossEarnings($user),
                'share' => $this->earnings->shareEarnings($user),
                'paid' => $this->earnings->totalPaid($user),
                'locked' => $this->earnings->locked($user),
                'available' => $this->earnings->availableBalance($user),
            ],
            'config' => [
                'min_amount' => $minAmount,
                'fee_percent' => $feePct,
                'share_percent' => $sharePct,
            ],
            'history' => $history,
            'lastBank' => $lastBank ? [
                'bank_name' => $lastBank['bank_name'],
                'account_number' => $lastBank['account_number'],
                'account_holder' => $lastBank['account_holder'],
            ] : null,
        ]);
    }

    public function withdraw(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->hasRole('instructor'), 403);

        $minAmount = (int) Setting::get('payout_min_amount', 50_000);
        $available = $this->earnings->availableBalance($user);

        $data = $request->validate([
            'gross_amount' => ['required', 'integer', "min:{$minAmount}", "max:{$available}"],
            'bank_name' => ['required', 'string', 'max:64'],
            'account_number' => ['required', 'string', 'max:32'],
            'account_holder' => ['required', 'string', 'max:120'],
        ], [
            'gross_amount.min' => 'Minimum penarikan Rp '.number_format($minAmount, 0, ',', '.'),
            'gross_amount.max' => 'Saldo tersedia tidak cukup.',
        ]);

        $quote = $this->earnings->quoteFee((int) $data['gross_amount']);

        PayoutRequest::create([
            'user_id' => $user->id,
            'gross_amount' => $data['gross_amount'],
            'fee_amount' => $quote['fee'],
            'net_amount' => $quote['net'],
            'bank_name' => $data['bank_name'],
            'account_number' => $data['account_number'],
            'account_holder' => $data['account_holder'],
            'status' => PayoutRequest::STATUS_PENDING,
        ]);

        return back()->with('success', 'Permintaan penarikan dikirim. Admin akan memprosesnya.');
    }
}
