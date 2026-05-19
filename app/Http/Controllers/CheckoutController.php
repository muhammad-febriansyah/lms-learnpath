<?php

namespace App\Http\Controllers;

use App\Actions\Marketplace\CreateOrderForB2cSubscription;
use App\Actions\Marketplace\CreateOrderForBundle;
use App\Actions\Marketplace\CreateOrderForCourse;
use App\Actions\Marketplace\CreateOrderForLearningPath;
use App\Actions\Marketplace\InitiatePakasirPayment;
use App\Actions\Marketplace\MarkOrderAsPaid;
use App\DataTransferObjects\Marketplace\CouponQuote;
use App\DataTransferObjects\Marketplace\CreateB2cSubscriptionOrderData;
use App\DataTransferObjects\Marketplace\CreateBundleOrderData;
use App\DataTransferObjects\Marketplace\CreateLearningPathOrderData;
use App\DataTransferObjects\Marketplace\CreateOrderData;
use App\DataTransferObjects\Marketplace\PakasirWebhookData;
use App\Http\Requests\Checkout\StoreCheckoutRequest;
use App\Models\B2cPlan;
use App\Models\Bundle;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LearningPath;
use App\Models\LearningPathEnrollment;
use App\Services\Marketplace\CouponService;
use App\Services\Payment\Enums\PaymentMethod;
use App\Services\Subscription\B2cSubscriptionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CreateOrderForCourse $createOrder,
        private readonly CreateOrderForBundle $createBundleOrder,
        private readonly CreateOrderForLearningPath $createPathOrder,
        private readonly CreateOrderForB2cSubscription $createSubscriptionOrder,
        private readonly InitiatePakasirPayment $initiatePayment,
        private readonly MarkOrderAsPaid $markPaid,
        private readonly CouponService $coupons,
        private readonly B2cSubscriptionService $b2cSubscriptions,
    ) {}

    public function show(Request $request, Course $course): Response|RedirectResponse
    {
        abort_unless($course->is_published, 404);

        $user = $request->user();

        $alreadyEnrolled = Enrollment::query()
            ->where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->exists();

        if ($alreadyEnrolled) {
            return redirect()
                ->route('my-courses.index')
                ->with('info', 'Anda sudah terdaftar di kursus ini.');
        }

        $orgMembership = $user->organizationMemberships()->with('organization:id,name')->first();
        $isOrgMember = $orgMembership !== null;
        $hasSubscription = $this->b2cSubscriptions->hasAccess($user);

        $couponCode = $request->string('coupon')->trim()->value();
        if ($isOrgMember || $hasSubscription) {
            $coursePrice = (int) $course->price;
            $quote = new CouponQuote(
                valid: true,
                subtotal: $coursePrice,
                discount: $coursePrice,
                total: 0,
            );
        } else {
            $quote = $this->coupons->quote($couponCode === '' ? null : $couponCode, $course);
        }

        return Inertia::render('checkout/show', [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'subtitle' => $course->subtitle,
                'slug' => $course->slug,
                'price' => $course->price,
                'thumbnail' => $course->thumbnail,
            ],
            'paymentMethods' => collect(PaymentMethod::cases())->map(fn (PaymentMethod $m) => [
                'value' => $m->value,
                'label' => $m->label(),
                'is_va' => $m->isVirtualAccount(),
            ])->all(),
            'customer' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
            'corporateAccess' => $isOrgMember ? [
                'organization_name' => $orgMembership->organization?->name,
            ] : null,
            'subscriptionAccess' => $hasSubscription,
            'quote' => [
                'valid' => $quote->valid,
                'subtotal' => $quote->subtotal,
                'discount' => $quote->discount,
                'total' => $quote->total,
                'error' => $quote->error,
                'coupon' => $quote->coupon ? [
                    'code' => $quote->coupon->code,
                    'name' => $quote->coupon->name,
                    'discount_type' => $quote->coupon->discount_type,
                    'discount_value' => $quote->coupon->discount_value,
                ] : null,
            ],
        ]);
    }

    public function store(StoreCheckoutRequest $request, Course $course): RedirectResponse
    {
        abort_unless($course->is_published, 404);

        $user = $request->user();
        $data = $request->validated();

        $coursePrice = (int) $course->price;

        if ($user->isOrgMember() || $this->b2cSubscriptions->hasAccess($user)) {
            $discount = $coursePrice;
            $coupon = null;
        } else {
            $quote = $this->coupons->quote($data['coupon_code'] ?? null, $course);

            if (($data['coupon_code'] ?? null) && ! $quote->valid) {
                return back()
                    ->withInput()
                    ->withErrors(['coupon_code' => $quote->error ?? 'Voucher tidak valid.']);
            }

            $discount = $quote->discount;
            $coupon = $quote->coupon;
        }

        $order = $this->createOrder->execute(new CreateOrderData(
            user: $user,
            course: $course,
            customerName: $data['customer_name'] ?? null,
            customerEmail: $data['customer_email'] ?? null,
            customerPhone: $data['customer_phone'] ?? null,
            discount: $discount,
            coupon: $coupon,
        ));

        if ($order->total === 0) {
            $this->markPaid->execute($order, new PakasirWebhookData(
                orderId: $order->order_number,
                amount: 0,
                status: 'completed',
                paymentMethod: 'free',
            ));

            return redirect()
                ->route('my-courses.index')
                ->with('success', 'Anda berhasil terdaftar di kursus gratis ini.');
        }

        $method = PaymentMethod::from($data['payment_method']);

        $payment = $this->initiatePayment->execute(
            $order,
            $method,
            route('orders.show', ['order' => $order->order_number]),
        );

        return redirect()
            ->route('orders.show', ['order' => $order->order_number])
            ->with('success', 'Pesanan dibuat. Selesaikan pembayaran Anda.')
            ->with('payment_url', $payment->payment_url);
    }

    public function showBundle(Request $request, Bundle $bundle): Response|RedirectResponse
    {
        abort_unless($bundle->is_published, 404);

        $bundle->load(['courses' => fn ($q) => $q->select('courses.id', 'title', 'slug', 'thumbnail', 'price')]);

        $user = $request->user();
        $hasSubscription = $this->b2cSubscriptions->hasAccess($user);
        $couponCode = $request->string('coupon')->trim()->value();
        if ($hasSubscription) {
            $bundlePrice = (int) $bundle->price;
            $quote = new CouponQuote(
                valid: true,
                subtotal: $bundlePrice,
                discount: $bundlePrice,
                total: 0,
            );
        } else {
            $quote = $this->coupons->quoteForBundle(
                $couponCode === '' ? null : $couponCode,
                $bundle,
            );
        }

        return Inertia::render('checkout/bundle', [
            'bundle' => [
                'id' => $bundle->id,
                'title' => $bundle->title,
                'slug' => $bundle->slug,
                'description' => $bundle->description,
                'thumbnail' => $bundle->thumbnail,
                'price' => $bundle->price,
                'compare_at_price' => $bundle->compare_at_price,
                'savings' => $bundle->savings(),
                'courses' => $bundle->courses->map(fn (Course $c) => [
                    'id' => $c->id,
                    'title' => $c->title,
                    'slug' => $c->slug,
                    'thumbnail' => $c->thumbnail,
                    'price' => $c->price,
                ])->all(),
            ],
            'paymentMethods' => collect(PaymentMethod::cases())->map(fn (PaymentMethod $m) => [
                'value' => $m->value,
                'label' => $m->label(),
                'is_va' => $m->isVirtualAccount(),
            ])->all(),
            'customer' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
            'subscriptionAccess' => $hasSubscription,
            'quote' => [
                'valid' => $quote->valid,
                'subtotal' => $quote->subtotal,
                'discount' => $quote->discount,
                'total' => $quote->total,
                'error' => $quote->error,
                'coupon' => $quote->coupon ? [
                    'code' => $quote->coupon->code,
                    'name' => $quote->coupon->name,
                    'discount_type' => $quote->coupon->discount_type,
                    'discount_value' => $quote->coupon->discount_value,
                ] : null,
            ],
        ]);
    }

    public function storeBundle(StoreCheckoutRequest $request, Bundle $bundle): RedirectResponse
    {
        abort_unless($bundle->is_published, 404);

        $user = $request->user();
        $data = $request->validated();
        $hasSubscription = $this->b2cSubscriptions->hasAccess($user);

        if ($hasSubscription) {
            $bundlePrice = (int) $bundle->price;
            $order = $this->createBundleOrder->execute(new CreateBundleOrderData(
                user: $user,
                bundle: $bundle,
                customerName: $data['customer_name'] ?? null,
                customerEmail: $data['customer_email'] ?? null,
                customerPhone: $data['customer_phone'] ?? null,
                discount: $bundlePrice,
                coupon: null,
            ));
        } else {
            $quote = $this->coupons->quoteForBundle($data['coupon_code'] ?? null, $bundle);

            if (($data['coupon_code'] ?? null) && ! $quote->valid) {
                return back()
                    ->withInput()
                    ->withErrors(['coupon_code' => $quote->error ?? 'Voucher tidak valid.']);
            }

            $order = $this->createBundleOrder->execute(new CreateBundleOrderData(
                user: $user,
                bundle: $bundle,
                customerName: $data['customer_name'] ?? null,
                customerEmail: $data['customer_email'] ?? null,
                customerPhone: $data['customer_phone'] ?? null,
                discount: $quote->discount,
                coupon: $quote->coupon,
            ));
        }

        if ($order->total === 0) {
            $this->markPaid->execute($order, new PakasirWebhookData(
                orderId: $order->order_number,
                amount: 0,
                status: 'completed',
                paymentMethod: 'free',
            ));

            return redirect()
                ->route('my-courses.index')
                ->with('success', 'Anda berhasil mendaftar paket bundle.');
        }

        $method = PaymentMethod::from($data['payment_method']);

        $payment = $this->initiatePayment->execute(
            $order,
            $method,
            route('orders.show', ['order' => $order->order_number]),
        );

        return redirect()
            ->route('orders.show', ['order' => $order->order_number])
            ->with('success', 'Pesanan paket dibuat. Selesaikan pembayaran Anda.')
            ->with('payment_url', $payment->payment_url);
    }

    public function showLearningPath(Request $request, LearningPath $path): Response|RedirectResponse
    {
        abort_unless($path->is_published, 404);

        if ($path->isFree()) {
            return redirect()->route('paths.show', $path);
        }

        $user = $request->user();

        $alreadyEnrolled = LearningPathEnrollment::query()
            ->where('user_id', $user->id)
            ->where('learning_path_id', $path->id)
            ->exists();

        if ($alreadyEnrolled) {
            return redirect()
                ->route('my-paths.index')
                ->with('info', 'Anda sudah terdaftar di paket ini.');
        }

        $path->load(['courses' => fn ($q) => $q
            ->select('courses.id', 'title', 'slug', 'thumbnail', 'price', 'duration_minutes', 'level')]);

        $hasSubscription = $this->b2cSubscriptions->hasAccess($user);
        $pathPrice = (int) $path->price;
        $effectiveDiscount = $hasSubscription ? $pathPrice : 0;
        $effectiveTotal = max(0, $pathPrice - $effectiveDiscount);

        return Inertia::render('checkout/learning-path', [
            'path' => [
                'id' => $path->id,
                'title' => $path->title,
                'slug' => $path->slug,
                'subtitle' => $path->subtitle,
                'description' => $path->description,
                'thumbnail' => $path->thumbnail,
                'level' => $path->level,
                'price' => $path->price,
                'compare_at_price' => $path->compare_at_price,
                'savings' => $path->savings(),
                'total_courses' => $path->total_courses ?: $path->courses->count(),
                'courses' => $path->courses->map(fn (Course $c) => [
                    'id' => $c->id,
                    'title' => $c->title,
                    'slug' => $c->slug,
                    'thumbnail' => $c->thumbnail,
                    'price' => $c->price,
                    'duration_minutes' => $c->duration_minutes,
                    'level' => $c->level,
                ])->all(),
            ],
            'paymentMethods' => collect(PaymentMethod::cases())->map(fn (PaymentMethod $m) => [
                'value' => $m->value,
                'label' => $m->label(),
                'is_va' => $m->isVirtualAccount(),
            ])->all(),
            'customer' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
            'subscriptionAccess' => $hasSubscription,
            'quote' => [
                'valid' => true,
                'subtotal' => $pathPrice,
                'discount' => $effectiveDiscount,
                'total' => $effectiveTotal,
                'error' => null,
                'coupon' => null,
            ],
        ]);
    }

    public function storeLearningPath(StoreCheckoutRequest $request, LearningPath $path): RedirectResponse
    {
        abort_unless($path->is_published, 404);

        if ($path->isFree()) {
            return redirect()
                ->route('paths.show', $path)
                ->with('info', 'Paket ini gratis, langsung daftar saja.');
        }

        $user = $request->user();
        $data = $request->validated();
        $discount = $this->b2cSubscriptions->hasAccess($user) ? (int) $path->price : 0;

        $order = $this->createPathOrder->execute(new CreateLearningPathOrderData(
            user: $user,
            path: $path,
            customerName: $data['customer_name'] ?? null,
            customerEmail: $data['customer_email'] ?? null,
            customerPhone: $data['customer_phone'] ?? null,
            discount: $discount,
        ));

        if ($order->total === 0) {
            $this->markPaid->execute($order, new PakasirWebhookData(
                orderId: $order->order_number,
                amount: 0,
                status: 'completed',
                paymentMethod: 'free',
            ));

            return redirect()
                ->route('my-paths.index')
                ->with('success', 'Anda berhasil mendaftar paket learning path.');
        }

        $method = PaymentMethod::from($data['payment_method']);

        $payment = $this->initiatePayment->execute(
            $order,
            $method,
            route('orders.show', ['order' => $order->order_number]),
        );

        return redirect()
            ->route('orders.show', ['order' => $order->order_number])
            ->with('success', 'Pesanan paket dibuat. Selesaikan pembayaran Anda.')
            ->with('payment_url', $payment->payment_url);
    }

    public function showSubscription(Request $request, B2cPlan $plan): Response|RedirectResponse
    {
        abort_unless($plan->is_active, 404);

        $user = $request->user();

        return Inertia::render('checkout/subscription', [
            'plan' => [
                'id' => $plan->id,
                'code' => $plan->code,
                'name' => $plan->name,
                'tagline' => $plan->tagline,
                'price' => (int) $plan->price,
                'compare_at_price' => $plan->compare_at_price,
                'savings' => $plan->savings(),
                'billing_period' => $plan->billing_period,
                'period_label' => $plan->periodLabel(),
                'duration_days' => $plan->durationDays(),
                'features' => $plan->features ?? [],
                'is_popular' => $plan->is_popular,
            ],
            'paymentMethods' => collect(PaymentMethod::cases())->map(fn (PaymentMethod $m) => [
                'value' => $m->value,
                'label' => $m->label(),
                'is_va' => $m->isVirtualAccount(),
            ])->all(),
            'customer' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
        ]);
    }

    public function storeSubscription(StoreCheckoutRequest $request, B2cPlan $plan): RedirectResponse
    {
        abort_unless($plan->is_active, 404);

        $user = $request->user();
        $data = $request->validated();

        $order = $this->createSubscriptionOrder->execute(new CreateB2cSubscriptionOrderData(
            user: $user,
            plan: $plan,
            customerName: $data['customer_name'] ?? null,
            customerEmail: $data['customer_email'] ?? null,
            customerPhone: $data['customer_phone'] ?? null,
        ));

        if ($order->total === 0) {
            $this->markPaid->execute($order, new PakasirWebhookData(
                orderId: $order->order_number,
                amount: 0,
                status: 'completed',
                paymentMethod: 'free',
            ));

            return redirect()
                ->route('my-subscription.index')
                ->with('success', 'Langganan aktif sampai berikutnya.');
        }

        $method = PaymentMethod::from($data['payment_method']);

        $payment = $this->initiatePayment->execute(
            $order,
            $method,
            route('orders.show', ['order' => $order->order_number]),
        );

        return redirect()
            ->route('orders.show', ['order' => $order->order_number])
            ->with('success', 'Pesanan langganan dibuat. Selesaikan pembayaran Anda.')
            ->with('payment_url', $payment->payment_url);
    }
}
