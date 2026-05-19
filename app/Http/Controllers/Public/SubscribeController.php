<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\B2cPlan;
use App\Models\User;
use App\Services\Subscription\B2cSubscriptionService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscribeController extends Controller
{
    public function __construct(
        private readonly B2cSubscriptionService $subscriptions,
    ) {}

    public function index(Request $request): Response
    {
        $plans = B2cPlan::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (B2cPlan $p) => $this->present($p));

        $user = $request->user();
        $current = $user instanceof User ? $this->subscriptions->activeFor($user) : null;
        $currentSubscription = $current
            ? [
                'id' => $current->id,
                'plan_name' => $current->plan?->name,
                'ends_at' => $current->ends_at?->toIso8601String(),
                'days_remaining' => $current->daysRemaining(),
            ]
            : null;

        return Inertia::render('public/subscribe/index', [
            'plans' => $plans,
            'currentSubscription' => $currentSubscription,
        ]);
    }

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
            'currency' => $p->currency,
            'features' => $p->features ?? [],
            'is_popular' => $p->is_popular,
        ];
    }
}
