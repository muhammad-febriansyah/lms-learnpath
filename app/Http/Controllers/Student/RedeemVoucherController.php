<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Services\Voucher\InvalidVoucherException;
use App\Services\Voucher\VoucherService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RedeemVoucherController extends Controller
{
    public function __construct(private readonly VoucherService $service) {}

    public function index(): Response
    {
        return Inertia::render('student/redeem-voucher/index');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:64'],
        ], [
            'code.required' => 'Masukkan kode voucher.',
        ]);

        try {
            $redemption = $this->service->redeem($request->user(), $data['code']);
        } catch (InvalidVoucherException $e) {
            return back()->withErrors(['code' => $e->getMessage()])->withInput();
        }

        $summary = $redemption->result_summary ?? [];

        $message = $summary['message'] ?? 'Voucher berhasil ditukar.';
        $href = $summary['href'] ?? null;

        $redirect = $href
            ? redirect($href)
            : redirect()->route('redeem.voucher.index');

        return $redirect->with('success', $message);
    }
}
