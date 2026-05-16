<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('payment.view'), 403);

        $payments = Payment::query()
            ->with([
                'order:id,order_number,user_id,total',
                'order.user:id,name,email',
            ])
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->whereHas('order', function ($q) use ($search) {
                    $q->where('order_number', 'like', "%{$search}%")
                        ->orWhere('customer_name', 'like', "%{$search}%")
                        ->orWhere('customer_email', 'like', "%{$search}%");
                });
            })
            ->when($request->string('gateway')->toString(), function ($query, $gateway) {
                $query->where('gateway', $gateway);
            })
            ->when($request->string('status')->toString(), function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/payments/index', [
            'payments' => $payments,
            'filters' => $request->only('search', 'gateway', 'status'),
            'stats' => [
                'total' => Payment::count(),
                'completed' => Payment::where('status', 'completed')->count(),
                'pending' => Payment::where('status', 'pending')->count(),
                'total_received' => (int) Payment::where('status', 'completed')->sum('amount'),
            ],
        ]);
    }
}
