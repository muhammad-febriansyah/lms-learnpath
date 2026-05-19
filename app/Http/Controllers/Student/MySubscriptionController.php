<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\B2cSubscription;
use App\Services\Subscription\B2cSubscriptionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MySubscriptionController extends Controller
{
    public function __construct(
        private readonly B2cSubscriptionService $subscriptions,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $active = $this->subscriptions->activeFor($user);
        $active?->load('plan');

        $history = B2cSubscription::query()
            ->where('user_id', $user->id)
            ->with(['plan:id,name,billing_period', 'lastOrder:id,order_number,total,paid_at'])
            ->latest('id')
            ->limit(20)
            ->get()
            ->map(fn (B2cSubscription $s) => [
                'id' => $s->id,
                'plan_name' => $s->plan?->name,
                'billing_period' => $s->plan?->billing_period,
                'status' => $s->status,
                'started_at' => $s->started_at?->toIso8601String(),
                'ends_at' => $s->ends_at?->toIso8601String(),
                'last_order' => $s->lastOrder ? [
                    'order_number' => $s->lastOrder->order_number,
                    'total' => (int) $s->lastOrder->total,
                    'paid_at' => $s->lastOrder->paid_at?->toIso8601String(),
                ] : null,
            ]);

        return Inertia::render('student/my-subscription/index', [
            'active' => $active ? [
                'id' => $active->id,
                'plan_name' => $active->plan?->name,
                'plan_code' => $active->plan?->code,
                'billing_period' => $active->plan?->billing_period,
                'started_at' => $active->started_at?->toIso8601String(),
                'ends_at' => $active->ends_at?->toIso8601String(),
                'days_remaining' => $active->daysRemaining(),
                'features' => $active->plan?->features ?? [],
            ] : null,
            'history' => $history,
        ]);
    }

    public function cancel(Request $request): RedirectResponse
    {
        $user = $request->user();
        $active = $this->subscriptions->activeFor($user);

        if (! $active) {
            return back()->with('info', 'Tidak ada langganan aktif.');
        }

        $this->subscriptions->cancel($active);

        return back()->with('success', 'Langganan dibatalkan. Akses tetap berjalan sampai berakhir.');
    }
}
