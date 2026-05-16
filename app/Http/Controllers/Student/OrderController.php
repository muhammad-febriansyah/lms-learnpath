<?php

namespace App\Http\Controllers\Student;

use App\Actions\Marketplace\InitiatePakasirPayment;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Payment\Enums\PaymentMethod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        private readonly InitiatePakasirPayment $initiatePayment,
    ) {}

    public function index(Request $request): Response
    {
        $orders = Order::query()
            ->where('user_id', $request->user()->id)
            ->with(['items', 'payments' => fn ($q) => $q->latest('id')])
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('student/orders/index', [
            'orders' => $orders,
        ]);
    }

    public function show(Request $request, string $order): Response
    {
        $orderModel = Order::query()
            ->where('order_number', $order)
            ->where('user_id', $request->user()->id)
            ->with(['items.purchasable', 'payments' => fn ($q) => $q->latest('id')])
            ->firstOrFail();

        return Inertia::render('student/orders/show', [
            'order' => $orderModel,
            'paymentMethods' => collect(PaymentMethod::cases())->map(fn (PaymentMethod $m) => [
                'value' => $m->value,
                'label' => $m->label(),
                'is_va' => $m->isVirtualAccount(),
            ])->all(),
        ]);
    }

    public function retryPayment(Request $request, string $order): RedirectResponse
    {
        $orderModel = Order::query()
            ->where('order_number', $order)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($orderModel->status !== 'pending') {
            return back()->with('error', 'Pesanan ini tidak bisa dibayar ulang.');
        }

        $data = $request->validate([
            'payment_method' => ['required', 'string'],
        ], [
            'required' => ':attribute wajib diisi.',
        ], [
            'payment_method' => 'Metode pembayaran',
        ]);

        $method = PaymentMethod::from($data['payment_method']);
        $payment = $this->initiatePayment->execute(
            $orderModel,
            $method,
            route('orders.show', ['order' => $orderModel->order_number]),
        );

        return redirect()->away($payment->payment_url ?? route('orders.show', ['order' => $orderModel->order_number]));
    }
}
