<?php

namespace App\Http\Controllers\Business;

use App\Actions\Marketplace\GenerateOrderNumber;
use App\Actions\Marketplace\InitiatePakasirPayment;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\User;
use App\Services\Payment\Enums\PaymentMethod;
use App\Services\Settings\SettingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RegistrationController extends Controller
{
    /** Price per seat (IDR). Move to settings later for runtime config. */
    private const PRICE_PER_SEAT = 250_000;

    private const MIN_SEATS = 5;

    private const MAX_SEATS = 1000;

    public function landing(): Response
    {
        return Inertia::render('business/landing', [
            'pricePerSeat' => self::PRICE_PER_SEAT,
            'minSeats' => self::MIN_SEATS,
            'maxSeats' => self::MAX_SEATS,
        ]);
    }

    public function showRegister(): Response
    {
        return Inertia::render('business/register', [
            'pricePerSeat' => self::PRICE_PER_SEAT,
            'minSeats' => self::MIN_SEATS,
            'maxSeats' => self::MAX_SEATS,
        ]);
    }

    public function register(
        Request $request,
        GenerateOrderNumber $generateOrderNumber,
        SettingService $settings,
    ): RedirectResponse {
        $data = $request->validate([
            'company_name' => ['required', 'string', 'max:150'],
            'industry' => ['nullable', 'string', 'max:100'],
            'size_range' => ['nullable', 'string', 'max:50'],
            'contact_name' => ['required', 'string', 'max:150'],
            'contact_email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'contact_phone' => ['required', 'string', 'max:30'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'seats' => ['required', 'integer', 'min:'.self::MIN_SEATS, 'max:'.self::MAX_SEATS],
            'agreed_terms' => ['accepted'],
        ], [
            'required' => ':attribute wajib diisi.',
            'email' => ':attribute harus berupa email valid.',
            'unique' => ':attribute sudah terdaftar di sistem.',
            'min' => 'Minimal :min seat.',
            'max' => 'Maksimal :max seat.',
            'confirmed' => 'Konfirmasi password tidak cocok.',
            'accepted' => 'Anda harus menyetujui syarat & ketentuan.',
        ], [
            'company_name' => 'Nama perusahaan',
            'contact_name' => 'Nama PIC',
            'contact_email' => 'Email PIC',
            'contact_phone' => 'Telepon PIC',
            'password' => 'Password',
            'seats' => 'Jumlah seat',
        ]);

        $subtotal = self::PRICE_PER_SEAT * (int) $data['seats'];
        $taxPercent = (float) $settings->get('payment_tax_percent', 0);
        $tax = (int) round($subtotal * $taxPercent / 100);
        $total = $subtotal + $tax;

        $order = DB::transaction(function () use ($data, $subtotal, $tax, $total, $generateOrderNumber) {
            $user = User::create([
                'name' => $data['contact_name'],
                'email' => $data['contact_email'],
                'phone' => $data['contact_phone'],
                'password' => Hash::make($data['password']),
                'status' => 'active',
                'email_verified_at' => now(),
            ]);
            $user->assignRole('hr');

            $organization = Organization::create([
                'name' => $data['company_name'],
                'slug' => $this->uniqueSlug($data['company_name']),
                'industry' => $data['industry'] ?? null,
                'size_range' => $data['size_range'] ?? null,
                'contact_name' => $data['contact_name'],
                'contact_email' => $data['contact_email'],
                'contact_phone' => $data['contact_phone'],
                'seat_quota' => 0,
                'seats_used' => 0,
                'status' => 'active',
            ]);

            OrganizationMember::create([
                'organization_id' => $organization->id,
                'user_id' => $user->id,
                'role' => 'admin',
                'joined_at' => now(),
            ]);

            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => $generateOrderNumber->execute(),
                'type' => 'b2b_seat',
                'subtotal' => $subtotal,
                'discount' => 0,
                'tax' => $tax,
                'total' => $total,
                'currency' => 'IDR',
                'status' => 'pending',
                'customer_name' => $data['contact_name'],
                'customer_email' => $data['contact_email'],
                'customer_phone' => $data['contact_phone'],
                'expires_at' => now()->addDay(),
                'metadata' => [
                    'organization_id' => $organization->id,
                    'seats' => (int) $data['seats'],
                    'price_per_seat' => self::PRICE_PER_SEAT,
                ],
            ]);

            OrderItem::create([
                'order_id' => $order->id,
                'purchasable_type' => Organization::class,
                'purchasable_id' => $organization->id,
                'name' => "Paket {$data['seats']} seat - {$organization->name}",
                'quantity' => (int) $data['seats'],
                'unit_price' => self::PRICE_PER_SEAT,
                'subtotal' => $subtotal,
            ]);

            return $order;
        });

        auth()->login($order->user);

        return redirect()
            ->route('business.checkout.show', ['order' => $order->order_number])
            ->with('success', 'Pendaftaran berhasil. Selesaikan pembayaran untuk mengaktifkan paket.');
    }

    public function showCheckout(Request $request, string $order): Response
    {
        $orderModel = Order::query()
            ->where('order_number', $order)
            ->where('type', 'b2b_seat')
            ->with('items')
            ->firstOrFail();

        abort_unless($orderModel->user_id === $request->user()?->id, 403);

        $latestPayment = $orderModel->payments()->latest('id')->first();

        return Inertia::render('business/checkout', [
            'order' => [
                'order_number' => $orderModel->order_number,
                'status' => $orderModel->status,
                'subtotal' => (int) $orderModel->subtotal,
                'tax' => (int) $orderModel->tax,
                'total' => (int) $orderModel->total,
                'seats' => (int) ($orderModel->metadata['seats'] ?? 0),
                'price_per_seat' => (int) ($orderModel->metadata['price_per_seat'] ?? 0),
                'paid_at' => $orderModel->paid_at?->toIso8601String(),
                'expires_at' => $orderModel->expires_at?->toIso8601String(),
            ],
            'paymentMethods' => collect(PaymentMethod::cases())
                ->map(fn (PaymentMethod $m) => [
                    'value' => $m->value,
                    'label' => $m->label(),
                    'is_va' => $m->isVirtualAccount(),
                ])
                ->values(),
            'currentPayment' => $latestPayment ? [
                'status' => $latestPayment->status,
                'payment_url' => $latestPayment->payment_url,
                'payment_method' => $latestPayment->payment_method,
            ] : null,
        ]);
    }

    public function pay(Request $request, string $order, InitiatePakasirPayment $initiate): RedirectResponse
    {
        $data = $request->validate([
            'payment_method' => ['required', 'string'],
        ]);

        $orderModel = Order::query()
            ->where('order_number', $order)
            ->where('type', 'b2b_seat')
            ->firstOrFail();

        abort_unless($orderModel->user_id === $request->user()?->id, 403);
        abort_if($orderModel->status === 'paid', 422, 'Order sudah dibayar.');

        $method = PaymentMethod::from($data['payment_method']);

        $payment = $initiate->execute(
            $orderModel,
            $method,
            route('business.checkout.show', ['order' => $orderModel->order_number]),
        );

        if ($payment->payment_url) {
            return redirect()->away($payment->payment_url);
        }

        return redirect()
            ->route('business.checkout.show', ['order' => $orderModel->order_number])
            ->with('success', 'Pembayaran dibuat. Selesaikan via instruksi pembayaran.');
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 1;

        while (Organization::query()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
