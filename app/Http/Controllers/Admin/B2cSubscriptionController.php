<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\B2cSubscription;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class B2cSubscriptionController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('subscription.manage'), 403);

        $status = $request->string('status')->trim()->value();
        $search = $request->string('search')->trim()->value();

        $query = B2cSubscription::query()
            ->with(['user:id,name,email', 'plan:id,name,code,billing_period']);

        if ($status !== '' && in_array($status, [
            B2cSubscription::STATUS_ACTIVE,
            B2cSubscription::STATUS_EXPIRED,
            B2cSubscription::STATUS_CANCELLED,
        ], true)) {
            $query->where('status', $status);
        }

        if ($search !== '') {
            $query->whereHas('user', fn ($q) => $q
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%"));
        }

        $subscriptions = $query
            ->latest('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (B2cSubscription $s) => [
                'id' => $s->id,
                'user' => $s->user ? [
                    'id' => $s->user->id,
                    'name' => $s->user->name,
                    'email' => $s->user->email,
                ] : null,
                'plan' => $s->plan ? [
                    'id' => $s->plan->id,
                    'name' => $s->plan->name,
                    'code' => $s->plan->code,
                    'billing_period' => $s->plan->billing_period,
                ] : null,
                'status' => $s->status,
                'started_at' => $s->started_at?->toIso8601String(),
                'ends_at' => $s->ends_at?->toIso8601String(),
                'cancelled_at' => $s->cancelled_at?->toIso8601String(),
            ]);

        $stats = [
            'total' => B2cSubscription::query()->count(),
            'active' => B2cSubscription::query()->where('status', B2cSubscription::STATUS_ACTIVE)->count(),
            'expired' => B2cSubscription::query()->where('status', B2cSubscription::STATUS_EXPIRED)->count(),
            'cancelled' => B2cSubscription::query()->where('status', B2cSubscription::STATUS_CANCELLED)->count(),
        ];

        return Inertia::render('admin/b2c-subscriptions/index', [
            'subscriptions' => $subscriptions,
            'stats' => $stats,
            'filters' => [
                'status' => $status ?: null,
                'search' => $search ?: null,
            ],
        ]);
    }
}
