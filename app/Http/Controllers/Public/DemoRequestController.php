<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionLead;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DemoRequestController extends Controller
{
    /**
     * @var array<int, string>
     */
    private const INDUSTRIES = [
        'banking', 'manufacturing', 'technology', 'retail', 'government', 'fmcg', 'education', 'healthcare', 'other',
    ];

    public function create(): Response
    {
        return Inertia::render('public/demo-request', [
            'industries' => self::INDUSTRIES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'contact_name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:160'],
            'phone' => ['nullable', 'string', 'max:30'],
            'company_name' => ['required', 'string', 'max:160'],
            'industry' => ['nullable', 'string', 'max:60'],
            'employee_count' => ['nullable', 'integer', 'min:1', 'max:1000000'],
            'preferred_date' => ['nullable', 'date', 'after_or_equal:today'],
            'message' => ['nullable', 'string', 'max:1500'],
        ], [
            'contact_name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'company_name.required' => 'Nama perusahaan wajib diisi.',
            'preferred_date.after_or_equal' => 'Tanggal preferensi minimal hari ini.',
        ]);

        SubscriptionLead::create([
            'company_name' => $data['company_name'],
            'contact_name' => $data['contact_name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'employee_count' => $data['employee_count'] ?? null,
            'message' => $data['message'] ?? null,
            'status' => SubscriptionLead::STATUS_NEW,
            'source' => 'demo_request',
            'meta' => [
                'industry' => $data['industry'] ?? null,
                'preferred_date' => $data['preferred_date'] ?? null,
                'submitted_at' => now()->toIso8601String(),
                'ip' => $request->ip(),
                'user_agent' => substr((string) $request->userAgent(), 0, 255),
            ],
        ]);

        return redirect()
            ->route('corporate.demo.create')
            ->with('success', 'Terima kasih! Tim kami akan menghubungi Anda dalam 1x24 jam kerja.');
    }
}
