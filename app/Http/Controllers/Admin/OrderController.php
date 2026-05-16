<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('order.view'), 403);

        $orders = Order::query()
            ->with([
                'user:id,name,email',
                'items',
                'payments' => fn ($q) => $q->latest('id')->limit(1),
            ])
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('order_number', 'like', "%{$search}%")
                        ->orWhere('customer_name', 'like', "%{$search}%")
                        ->orWhere('customer_email', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%"));
                });
            })
            ->when($request->string('status')->toString(), function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'filters' => $request->only('search', 'status'),
            'stats' => [
                'total' => Order::count(),
                'pending' => Order::where('status', 'pending')->count(),
                'paid' => Order::where('status', 'paid')->count(),
                'revenue' => (int) Order::where('status', 'paid')->sum('total'),
            ],
        ]);
    }

    public function show(Request $request, string $order): Response
    {
        abort_unless($request->user()?->can('order.view'), 403);

        $orderModel = Order::query()
            ->where('order_number', $order)
            ->with([
                'user:id,name,email,phone',
                'items.purchasable',
                'payments' => fn ($q) => $q->latest('id'),
            ])
            ->firstOrFail();

        return Inertia::render('admin/orders/show', [
            'order' => $orderModel,
        ]);
    }

    public function cancel(Request $request, string $order): RedirectResponse
    {
        abort_unless($request->user()?->can('order.manage'), 403);

        $orderModel = Order::query()
            ->where('order_number', $order)
            ->firstOrFail();

        if ($orderModel->status !== 'pending') {
            return back()->with('error', 'Hanya pesanan pending yang bisa dibatalkan.');
        }

        $orderModel->update([
            'status' => 'cancelled',
        ]);

        return back()->with('success', 'Pesanan berhasil dibatalkan.');
    }
}
