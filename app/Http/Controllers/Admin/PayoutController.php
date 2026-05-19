<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PayoutRequest;
use App\Services\Audit\Auditor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PayoutController extends Controller
{
    public function __construct(private readonly Auditor $auditor) {}

    public function index(Request $request): Response
    {
        $this->guard($request);

        $query = PayoutRequest::query()->with('user:id,name,email');

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }
        if ($search = $request->string('search')->toString()) {
            $query->whereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%"));
        }

        $payouts = $query->latest('id')->paginate(20)->withQueryString();

        $payouts->getCollection()->transform(fn (PayoutRequest $p) => [
            'id' => $p->id,
            'user' => $p->user ? ['id' => $p->user->id, 'name' => $p->user->name, 'email' => $p->user->email] : null,
            'gross_amount' => $p->gross_amount,
            'fee_amount' => $p->fee_amount,
            'net_amount' => $p->net_amount,
            'bank_name' => $p->bank_name,
            'account_number' => $p->account_number,
            'account_holder' => $p->account_holder,
            'status' => $p->status,
            'created_at' => $p->created_at?->toIso8601String(),
            'paid_at' => $p->paid_at?->toIso8601String(),
        ]);

        return Inertia::render('admin/payouts/index', [
            'payouts' => $payouts,
            'filters' => [
                'status' => $request->string('status')->toString() ?: null,
                'search' => $request->string('search')->toString() ?: null,
            ],
            'statusOptions' => [
                ['value' => 'pending', 'label' => 'Menunggu'],
                ['value' => 'approved', 'label' => 'Disetujui'],
                ['value' => 'rejected', 'label' => 'Ditolak'],
                ['value' => 'paid', 'label' => 'Lunas'],
            ],
            'counts' => [
                'pending' => PayoutRequest::where('status', PayoutRequest::STATUS_PENDING)->count(),
                'approved' => PayoutRequest::where('status', PayoutRequest::STATUS_APPROVED)->count(),
                'rejected' => PayoutRequest::where('status', PayoutRequest::STATUS_REJECTED)->count(),
                'paid' => PayoutRequest::where('status', PayoutRequest::STATUS_PAID)->count(),
            ],
        ]);
    }

    public function show(Request $request, PayoutRequest $payout): Response
    {
        $this->guard($request);
        $payout->load('user:id,name,email', 'reviewer:id,name');

        return Inertia::render('admin/payouts/show', [
            'payout' => [
                'id' => $payout->id,
                'user' => $payout->user ? ['id' => $payout->user->id, 'name' => $payout->user->name, 'email' => $payout->user->email] : null,
                'gross_amount' => $payout->gross_amount,
                'fee_amount' => $payout->fee_amount,
                'net_amount' => $payout->net_amount,
                'bank_name' => $payout->bank_name,
                'account_number' => $payout->account_number,
                'account_holder' => $payout->account_holder,
                'status' => $payout->status,
                'admin_note' => $payout->admin_note,
                'reject_reason' => $payout->reject_reason,
                'proof_url' => $payout->proof_path ? asset('storage/'.$payout->proof_path) : null,
                'reviewer' => $payout->reviewer ? ['id' => $payout->reviewer->id, 'name' => $payout->reviewer->name] : null,
                'reviewed_at' => $payout->reviewed_at?->toIso8601String(),
                'paid_at' => $payout->paid_at?->toIso8601String(),
                'created_at' => $payout->created_at?->toIso8601String(),
            ],
        ]);
    }

    public function approve(Request $request, PayoutRequest $payout): RedirectResponse
    {
        $this->guard($request);

        if ($payout->status !== PayoutRequest::STATUS_PENDING) {
            return back()->with('error', 'Hanya request status "Menunggu" yang bisa disetujui.');
        }

        $data = $request->validate([
            'admin_note' => ['nullable', 'string', 'max:500'],
        ]);

        $payout->update([
            'status' => PayoutRequest::STATUS_APPROVED,
            'admin_note' => $data['admin_note'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $this->auditor->record('payout.approved', $payout, ['amount' => $payout->gross_amount]);

        return back()->with('success', 'Penarikan disetujui. Lanjutkan dengan transfer dan tandai lunas.');
    }

    public function reject(Request $request, PayoutRequest $payout): RedirectResponse
    {
        $this->guard($request);

        if (! in_array($payout->status, [PayoutRequest::STATUS_PENDING, PayoutRequest::STATUS_APPROVED], true)) {
            return back()->with('error', 'Status tidak bisa ditolak.');
        }

        $data = $request->validate([
            'reject_reason' => ['required', 'string', 'min:5', 'max:500'],
        ], [
            'reject_reason.required' => 'Alasan penolakan wajib diisi.',
        ]);

        $payout->update([
            'status' => PayoutRequest::STATUS_REJECTED,
            'reject_reason' => $data['reject_reason'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $this->auditor->record('payout.rejected', $payout, ['reason' => $data['reject_reason']]);

        return back()->with('success', 'Permintaan penarikan ditolak.');
    }

    public function markPaid(Request $request, PayoutRequest $payout): RedirectResponse
    {
        $this->guard($request);

        if (! in_array($payout->status, [PayoutRequest::STATUS_PENDING, PayoutRequest::STATUS_APPROVED], true)) {
            return back()->with('error', 'Status tidak bisa ditandai lunas.');
        }

        $data = $request->validate([
            'proof' => ['required', 'file', 'image', 'mimes:png,jpg,jpeg,webp', 'max:2048'],
            'admin_note' => ['nullable', 'string', 'max:500'],
        ], [
            'proof.required' => 'Bukti transfer wajib diunggah.',
            'proof.image' => 'Bukti harus berupa gambar (PNG/JPG/WEBP).',
            'proof.max' => 'Maks 2MB.',
        ]);

        $path = $request->file('proof')->store("payouts/{$payout->user_id}", 'public');

        $payout->update([
            'status' => PayoutRequest::STATUS_PAID,
            'proof_path' => $path,
            'admin_note' => $data['admin_note'] ?? $payout->admin_note,
            'reviewed_by' => $payout->reviewed_by ?? $request->user()->id,
            'reviewed_at' => $payout->reviewed_at ?? now(),
            'paid_at' => now(),
        ]);

        $this->auditor->record('payout.paid', $payout, [
            'amount' => $payout->net_amount,
            'gross' => $payout->gross_amount,
        ]);

        return back()->with('success', 'Penarikan ditandai lunas dengan bukti transfer terlampir.');
    }

    private function guard(Request $request): void
    {
        abort_unless(
            $request->user()?->hasAnyRole(['superadmin', 'admin_tenant']),
            403,
            'Hanya superadmin / admin tenant yang boleh mengelola penarikan.',
        );
    }
}
