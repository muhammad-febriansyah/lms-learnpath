<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\B2cPlan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class B2cPlanController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('subscription.manage'), 403);

        $plans = B2cPlan::query()
            ->withCount(['subscriptions as active_count' => fn ($q) => $q->where('status', 'active')])
            ->withCount('subscriptions')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (B2cPlan $p) => $this->present($p));

        return Inertia::render('admin/b2c-plans/index', [
            'plans' => $plans,
        ]);
    }

    public function create(Request $request): Response
    {
        abort_unless($request->user()?->can('subscription.manage'), 403);

        return Inertia::render('admin/b2c-plans/form', [
            'plan' => null,
            'periods' => B2cPlan::PERIODS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->can('subscription.manage'), 403);

        $data = $this->validated($request);
        B2cPlan::create($data);

        return redirect()
            ->route('admin.b2c-plans.index')
            ->with('success', 'Paket langganan dibuat.');
    }

    public function edit(Request $request, B2cPlan $plan): Response
    {
        abort_unless($request->user()?->can('subscription.manage'), 403);

        return Inertia::render('admin/b2c-plans/form', [
            'plan' => $this->present($plan),
            'periods' => B2cPlan::PERIODS,
        ]);
    }

    public function update(Request $request, B2cPlan $plan): RedirectResponse
    {
        abort_unless($request->user()?->can('subscription.manage'), 403);

        $data = $this->validated($request, $plan->id);
        $plan->update($data);

        return redirect()
            ->route('admin.b2c-plans.index')
            ->with('success', 'Paket langganan diperbarui.');
    }

    public function destroy(Request $request, B2cPlan $plan): RedirectResponse
    {
        abort_unless($request->user()?->can('subscription.manage'), 403);

        if ($plan->subscriptions()->exists()) {
            return back()->with('error', 'Paket masih memiliki langganan. Nonaktifkan saja.');
        }

        $plan->delete();

        return back()->with('success', 'Paket dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?int $planId = null): array
    {
        return $request->validate([
            'code' => ['required', 'string', 'max:32', 'regex:/^[a-z0-9_-]+$/', Rule::unique('b2c_plans', 'code')->ignore($planId)],
            'name' => ['required', 'string', 'max:120'],
            'tagline' => ['nullable', 'string', 'max:200'],
            'price' => ['required', 'integer', 'min:0', 'max:100000000'],
            'compare_at_price' => ['nullable', 'integer', 'min:0', 'max:100000000'],
            'billing_period' => ['required', Rule::in(B2cPlan::PERIODS)],
            'currency' => ['required', 'string', 'max:8'],
            'features' => ['nullable', 'array'],
            'features.*' => ['string', 'max:200'],
            'is_popular' => ['boolean'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ], [
            'code.regex' => 'Kode hanya boleh huruf kecil, angka, underscore, dan strip.',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function present(B2cPlan $p): array
    {
        return [
            'id' => $p->id,
            'code' => $p->code,
            'name' => $p->name,
            'tagline' => $p->tagline,
            'price' => (int) $p->price,
            'compare_at_price' => $p->compare_at_price,
            'savings' => $p->savings(),
            'billing_period' => $p->billing_period,
            'period_label' => $p->periodLabel(),
            'duration_days' => $p->durationDays(),
            'currency' => $p->currency,
            'features' => $p->features ?? [],
            'is_popular' => $p->is_popular,
            'is_active' => $p->is_active,
            'sort_order' => $p->sort_order,
            'subscriptions_count' => $p->subscriptions_count ?? 0,
            'active_count' => $p->active_count ?? 0,
        ];
    }
}
