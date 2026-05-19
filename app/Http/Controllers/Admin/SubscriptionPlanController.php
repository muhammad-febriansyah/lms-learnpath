<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionPlanController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('subscription.manage'), 403);

        $plans = SubscriptionPlan::query()
            ->withCount('organizations')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (SubscriptionPlan $p) => $this->present($p));

        return Inertia::render('admin/subscription-plans/index', [
            'plans' => $plans,
        ]);
    }

    public function create(Request $request): Response
    {
        abort_unless($request->user()?->can('subscription.manage'), 403);

        return Inertia::render('admin/subscription-plans/form', [
            'plan' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->can('subscription.manage'), 403);

        $data = $this->validated($request);
        SubscriptionPlan::create($data);

        return redirect()
            ->route('admin.subscription-plans.index')
            ->with('success', 'Paket subscription dibuat.');
    }

    public function edit(Request $request, SubscriptionPlan $plan): Response
    {
        abort_unless($request->user()?->can('subscription.manage'), 403);

        return Inertia::render('admin/subscription-plans/form', [
            'plan' => $this->present($plan),
        ]);
    }

    public function update(Request $request, SubscriptionPlan $plan): RedirectResponse
    {
        abort_unless($request->user()?->can('subscription.manage'), 403);

        $data = $this->validated($request, $plan->id);
        $plan->update($data);

        return redirect()
            ->route('admin.subscription-plans.index')
            ->with('success', 'Paket subscription diperbarui.');
    }

    public function destroy(Request $request, SubscriptionPlan $plan): RedirectResponse
    {
        abort_unless($request->user()?->can('subscription.manage'), 403);

        if ($plan->organizations()->exists()) {
            return back()->with('error', 'Paket masih dipakai organisasi. Nonaktifkan saja.');
        }

        $plan->delete();

        return back()->with('success', 'Paket dihapus.');
    }

    private function validated(Request $request, ?int $planId = null): array
    {
        return $request->validate([
            'code' => ['required', 'string', 'max:32', 'regex:/^[a-z0-9_-]+$/', Rule::unique('subscription_plans', 'code')->ignore($planId)],
            'name' => ['required', 'string', 'max:120'],
            'tagline' => ['nullable', 'string', 'max:200'],
            'min_users' => ['required', 'integer', 'min:1', 'max:1000000'],
            'max_users' => ['nullable', 'integer', 'min:1', 'max:1000000', 'gte:min_users'],
            'price_per_user_per_month' => ['required', 'integer', 'min:0', 'max:100000000'],
            'currency' => ['required', 'string', 'max:8'],
            'features' => ['nullable', 'array'],
            'features.*' => ['string', 'max:200'],
            'addons' => ['nullable', 'array'],
            'addons.*.name' => ['required', 'string', 'max:120'],
            'addons.*.price' => ['required', 'integer', 'min:0'],
            'addons.*.note' => ['nullable', 'string', 'max:255'],
            'is_popular' => ['boolean'],
            'is_active' => ['boolean'],
            'contact_sales_only' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ], [
            'code.regex' => 'Kode hanya boleh huruf kecil, angka, underscore, dan strip.',
        ]);
    }

    private function present(SubscriptionPlan $p): array
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
            'is_active' => $p->is_active,
            'contact_sales_only' => $p->contact_sales_only,
            'sort_order' => $p->sort_order,
            'organizations_count' => $p->organizations_count ?? 0,
        ];
    }
}
