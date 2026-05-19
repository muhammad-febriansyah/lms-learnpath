<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Organization;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * HR/Finance billing view (F-047). Read-only — pembayaran tetap di sales/Pakasir.
 *
 * Order yang ditampilkan: yang dimiliki anggota org dan related ke organization
 * tersebut (b2b_seat = Organization purchasable, plus future order types via metadata).
 */
class BillingController extends Controller
{
    use ResolvesOrganization;

    public function index(Request $request): Response
    {
        $org = $this->resolveOrganization($request);

        $orders = $this->orgOrders($org)
            ->latest('created_at')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Order $o) => $this->presentOrder($o));

        $stats = [
            'total_spent' => (int) $this->orgOrders($org)
                ->where('status', 'paid')
                ->sum('total'),
            'paid_count' => $this->orgOrders($org)->where('status', 'paid')->count(),
            'pending_count' => $this->orgOrders($org)->where('status', 'pending')->count(),
            'last_payment_at' => $this->orgOrders($org)
                ->where('status', 'paid')
                ->latest('paid_at')
                ->value('paid_at')
                ?->toIso8601String(),
        ];

        return Inertia::render('business/billing/index', [
            'organization' => $this->presentOrg($org),
            'orders' => $orders,
            'stats' => $stats,
            'contract' => [
                'ends_at' => $org->contract_ends_at?->toDateString(),
                'days_left' => $org->daysUntilContractEnd(),
                'expiring_soon' => $org->isContractExpiringSoon(30),
                'expired' => $org->isContractExpired(),
            ],
        ]);
    }

    public function show(Request $request, Order $order): Response
    {
        $org = $this->resolveOrganization($request);
        $this->ensureOrderBelongsToOrg($org, $order);

        $order->load(['items', 'payments', 'user:id,name,email']);

        return Inertia::render('business/billing/show', [
            'organization' => $this->presentOrg($org),
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'type' => $order->type,
                'status' => $order->status,
                'subtotal' => (int) $order->subtotal,
                'discount' => (int) $order->discount,
                'tax' => (int) $order->tax,
                'total' => (int) $order->total,
                'currency' => $order->currency,
                'customer_name' => $order->customer_name,
                'customer_email' => $order->customer_email,
                'customer_phone' => $order->customer_phone,
                'metadata' => $order->metadata,
                'created_at' => $order->created_at?->toIso8601String(),
                'paid_at' => $order->paid_at?->toIso8601String(),
                'expires_at' => $order->expires_at?->toIso8601String(),
                'items' => $order->items->map(fn ($item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'quantity' => (int) $item->quantity,
                    'unit_price' => (int) $item->unit_price,
                    'subtotal' => (int) $item->subtotal,
                ]),
                'payments' => $order->payments->map(fn ($p) => [
                    'id' => $p->id,
                    'amount' => (int) $p->amount,
                    'method' => $p->payment_method,
                    'status' => $p->status,
                    'paid_at' => $p->paid_at?->toIso8601String(),
                ]),
                'requested_by' => $order->user ? [
                    'id' => $order->user->id,
                    'name' => $order->user->name,
                    'email' => $order->user->email,
                ] : null,
            ],
        ]);
    }

    public function invoice(Request $request, Order $order): View
    {
        $org = $this->resolveOrganization($request);
        $this->ensureOrderBelongsToOrg($org, $order);
        abort_unless($order->status === 'paid', 404, 'Invoice tersedia setelah pembayaran sukses.');

        $order->load(['items', 'payments']);

        return view('business.invoice', [
            'organization' => $org,
            'order' => $order,
        ]);
    }

    public function seats(Request $request): Response
    {
        $org = $this->resolveOrganization($request);

        $org->loadMissing('members.user:id,name,email,last_login_at,created_at');

        $now = now();
        $thresholdInactive = $now->copy()->subDays(30);

        $members = $org->members
            ->map(function ($m) use ($thresholdInactive) {
                $lastActive = $m->user?->last_login_at;
                $isInactive = $lastActive !== null && $lastActive < $thresholdInactive;
                $isNeverLogged = $lastActive === null;

                return [
                    'id' => $m->id,
                    'role' => $m->role,
                    'joined_at' => $m->joined_at?->toDateString(),
                    'user' => $m->user ? [
                        'id' => $m->user->id,
                        'name' => $m->user->name,
                        'email' => $m->user->email,
                        'last_login_at' => $lastActive?->toIso8601String(),
                    ] : null,
                    'utilization_status' => $isNeverLogged
                        ? 'never_logged_in'
                        : ($isInactive ? 'inactive' : 'active'),
                ];
            })
            ->sortBy(fn ($row) => $row['utilization_status'] === 'active' ? 0 : 1)
            ->values();

        $breakdown = [
            'active' => $members->where('utilization_status', 'active')->count(),
            'inactive' => $members->where('utilization_status', 'inactive')->count(),
            'never_logged_in' => $members->where('utilization_status', 'never_logged_in')->count(),
        ];

        return Inertia::render('business/seats/index', [
            'organization' => $this->presentOrg($org),
            'members' => $members,
            'breakdown' => $breakdown,
        ]);
    }

    private function orgOrders(Organization $org)
    {
        $memberUserIds = $org->members()->pluck('user_id');

        return Order::query()
            ->where(function ($q) use ($org, $memberUserIds) {
                $q->whereHas('items', function ($iq) use ($org) {
                    $iq->where('purchasable_type', Organization::class)
                        ->where('purchasable_id', $org->id);
                })->orWhere(function ($q2) use ($memberUserIds) {
                    // Future-proof: order yang dibuat anggota org (jika kelak ada
                    // checkout B2B di luar b2b_seat).
                    $q2->whereIn('user_id', $memberUserIds);
                });
            });
    }

    private function ensureOrderBelongsToOrg(Organization $org, Order $order): void
    {
        $exists = $this->orgOrders($org)->whereKey($order->id)->exists();
        abort_unless($exists, 403, 'Order ini bukan milik organisasi Anda.');
    }

    private function presentOrg(Organization $org): array
    {
        return [
            'id' => $org->id,
            'name' => $org->name,
            'slug' => $org->slug,
            'industry' => $org->industry,
            'seat_quota' => (int) $org->seat_quota,
            'seats_used' => (int) $org->seats_used,
            'seats_available' => $org->seatsAvailable(),
            'contact_email' => $org->contact_email,
            'billing_address' => $org->billing_address,
            'billing_tax_id' => $org->billing_tax_id,
        ];
    }

    private function presentOrder(Order $o): array
    {
        return [
            'id' => $o->id,
            'order_number' => $o->order_number,
            'type' => $o->type,
            'status' => $o->status,
            'total' => (int) $o->total,
            'currency' => $o->currency,
            'created_at' => $o->created_at?->toIso8601String(),
            'paid_at' => $o->paid_at?->toIso8601String(),
            'description' => $o->metadata['learning_path_title']
                ?? $o->metadata['bundle_title']
                ?? $o->items->first()?->name
                ?? '-',
        ];
    }
}
