<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Mail\NewSubscriptionLeadMail;
use App\Models\SubscriptionLead;
use App\Models\SubscriptionPlan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class PricingController extends Controller
{
    public function index(Request $request): Response
    {
        $plans = SubscriptionPlan::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (SubscriptionPlan $p) => $this->presentPlan($p));

        return Inertia::render('public/corporate/pricing', [
            'plans' => $plans,
        ]);
    }

    public function contact(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'subscription_plan_id' => ['nullable', 'integer', 'exists:subscription_plans,id'],
            'company_name' => ['required', 'string', 'max:200'],
            'contact_name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:200'],
            'phone' => ['nullable', 'string', 'max:32'],
            'employee_count' => ['nullable', 'integer', 'min:1', 'max:1000000'],
            'message' => ['nullable', 'string', 'max:2000'],
        ], [
            'required' => ':attribute wajib diisi.',
            'email' => 'Format email tidak valid.',
        ], [
            'company_name' => 'Nama perusahaan',
            'contact_name' => 'Nama kontak',
            'email' => 'Email',
            'phone' => 'No HP / WhatsApp',
            'employee_count' => 'Jumlah karyawan',
            'message' => 'Pesan',
        ]);

        $lead = SubscriptionLead::create([
            'subscription_plan_id' => $data['subscription_plan_id'] ?? null,
            'company_name' => $data['company_name'],
            'contact_name' => $data['contact_name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'employee_count' => $data['employee_count'] ?? null,
            'message' => $data['message'] ?? null,
            'status' => SubscriptionLead::STATUS_NEW,
            'source' => 'pricing_page',
            'meta' => [
                'user_agent' => $request->userAgent(),
                'ip' => $request->ip(),
            ],
        ]);

        $salesEmail = config('mail.sales_address')
            ?? env('SALES_INBOX_EMAIL')
            ?? config('mail.from.address');

        if ($salesEmail) {
            try {
                Mail::to($salesEmail)->send(new NewSubscriptionLeadMail($lead->fresh('plan')));
            } catch (\Throwable $e) {
                Log::warning('Failed to send subscription lead email', [
                    'lead_id' => $lead->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return back()->with('success', 'Terima kasih! Tim sales kami akan menghubungi Anda dalam 1x24 jam.');
    }

    private function presentPlan(SubscriptionPlan $p): array
    {
        return [
            'id' => $p->id,
            'code' => $p->code,
            'name' => $p->name,
            'tagline' => $p->tagline,
            'min_users' => $p->min_users,
            'max_users' => $p->max_users,
            'user_range' => $p->userRange(),
            'price_per_user_per_month' => $p->price_per_user_per_month,
            'currency' => $p->currency,
            'features' => $p->features ?? [],
            'addons' => $p->addons ?? [],
            'is_popular' => $p->is_popular,
            'contact_sales_only' => $p->contact_sales_only,
            'is_custom_price' => (int) $p->price_per_user_per_month === 0,
        ];
    }
}
