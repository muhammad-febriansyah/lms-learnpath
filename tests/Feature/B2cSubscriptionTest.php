<?php

use App\Actions\Marketplace\CreateOrderForB2cSubscription;
use App\Actions\Marketplace\MarkOrderAsPaid;
use App\DataTransferObjects\Marketplace\CreateB2cSubscriptionOrderData;
use App\DataTransferObjects\Marketplace\PakasirWebhookData;
use App\Models\B2cPlan;
use App\Models\B2cSubscription;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use App\Services\Subscription\B2cSubscriptionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Permission::findOrCreate('subscription.manage', 'web');
    Role::findOrCreate('superadmin', 'web')->givePermissionTo('subscription.manage');

    $this->user = User::factory()->create(['email_verified_at' => now()]);
});

it('renders the public subscribe page with active plans', function () {
    B2cPlan::factory()->create(['name' => 'Personal Monthly', 'price' => 99_000, 'is_active' => true]);
    B2cPlan::factory()->create(['name' => 'Personal Yearly', 'price' => 999_000, 'is_active' => true]);
    B2cPlan::factory()->create(['name' => 'Hidden', 'is_active' => false]);

    $this->withoutVite()
        ->get('/subscribe')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/subscribe/index')
            ->has('plans', 2)
        );
});

it('creates an order with b2c_subscription type when checkout submitted', function () {
    $plan = B2cPlan::factory()->create([
        'code' => 'personal-monthly',
        'price' => 99_000,
        'billing_period' => B2cPlan::PERIOD_MONTHLY,
    ]);

    $order = app(CreateOrderForB2cSubscription::class)->execute(
        new CreateB2cSubscriptionOrderData(user: $this->user, plan: $plan),
    );

    expect($order->type)->toBe('b2c_subscription');
    expect($order->total)->toBe(99_000);
    expect($order->items)->toHaveCount(1);
    expect($order->items->first()->purchasable_type)->toBe(B2cPlan::class);
    expect($order->items->first()->purchasable_id)->toBe($plan->id);
});

it('activates subscription when b2c order is paid', function () {
    $plan = B2cPlan::factory()->create([
        'price' => 99_000,
        'billing_period' => B2cPlan::PERIOD_MONTHLY,
    ]);

    $order = app(CreateOrderForB2cSubscription::class)->execute(
        new CreateB2cSubscriptionOrderData(user: $this->user, plan: $plan),
    );

    app(MarkOrderAsPaid::class)->execute($order, new PakasirWebhookData(
        orderId: $order->order_number,
        amount: $order->total,
        status: 'completed',
        paymentMethod: 'qris',
    ));

    $sub = B2cSubscription::query()
        ->where('user_id', $this->user->id)
        ->first();

    expect($sub)->not->toBeNull();
    expect($sub->status)->toBe(B2cSubscription::STATUS_ACTIVE);
    expect($sub->ends_at->toDateString())->toBe(now()->addDays(30)->toDateString());
});

it('extends existing active subscription instead of creating a new one', function () {
    $plan = B2cPlan::factory()->create([
        'price' => 99_000,
        'billing_period' => B2cPlan::PERIOD_MONTHLY,
    ]);

    $service = app(B2cSubscriptionService::class);
    $first = $service->extendOrCreate($this->user, $plan);
    $originalEndsAt = $first->ends_at->copy();

    $second = $service->extendOrCreate($this->user, $plan);

    expect($second->id)->toBe($first->id);
    expect($second->ends_at->toDateString())
        ->toBe($originalEndsAt->copy()->addDays(30)->toDateString());

    expect(B2cSubscription::query()->count())->toBe(1);
});

it('hasAccess returns true for user with active subscription', function () {
    $plan = B2cPlan::factory()->create();
    B2cSubscription::factory()->create([
        'user_id' => $this->user->id,
        'b2c_plan_id' => $plan->id,
        'status' => B2cSubscription::STATUS_ACTIVE,
        'ends_at' => now()->addDays(15),
    ]);

    expect(app(B2cSubscriptionService::class)->hasAccess($this->user))->toBeTrue();
});

it('hasAccess returns false for expired subscription', function () {
    $plan = B2cPlan::factory()->create();
    B2cSubscription::factory()->expired()->create([
        'user_id' => $this->user->id,
        'b2c_plan_id' => $plan->id,
    ]);

    expect(app(B2cSubscriptionService::class)->hasAccess($this->user))->toBeFalse();
});

it('renders my-subscription page with active subscription details', function () {
    $plan = B2cPlan::factory()->create(['name' => 'Personal Premium']);
    B2cSubscription::factory()->create([
        'user_id' => $this->user->id,
        'b2c_plan_id' => $plan->id,
        'ends_at' => now()->addDays(30),
    ]);

    $this->actingAs($this->user)
        ->withoutVite()
        ->get('/my-subscription')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('student/my-subscription/index')
            ->where('active.plan_name', 'Personal Premium')
            ->has('history')
        );
});

it('cancels an active subscription', function () {
    $plan = B2cPlan::factory()->create();
    $sub = B2cSubscription::factory()->create([
        'user_id' => $this->user->id,
        'b2c_plan_id' => $plan->id,
    ]);

    $this->actingAs($this->user)
        ->post('/my-subscription/cancel')
        ->assertRedirect();

    expect($sub->fresh()->status)->toBe(B2cSubscription::STATUS_CANCELLED);
    expect($sub->fresh()->cancelled_at)->not->toBeNull();
});

it('allows free course enroll for users with active subscription', function () {
    $plan = B2cPlan::factory()->create();
    B2cSubscription::factory()->create([
        'user_id' => $this->user->id,
        'b2c_plan_id' => $plan->id,
        'ends_at' => now()->addDays(30),
    ]);

    $course = Course::factory()->create([
        'price' => 250_000,
        'is_published' => true,
    ]);

    $this->actingAs($this->user)
        ->withoutVite()
        ->get("/checkout/{$course->slug}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('checkout/show')
            ->where('subscriptionAccess', true)
        );

    // Submitting the checkout form yields a free order + immediate enrollment.
    $this->actingAs($this->user)
        ->post("/checkout/{$course->slug}", [
            'payment_method' => 'qris',
            'customer_name' => 'Test',
            'customer_email' => 'test@example.com',
        ])
        ->assertRedirect();

    expect(Enrollment::query()
        ->where('user_id', $this->user->id)
        ->where('course_id', $course->id)
        ->exists())->toBeTrue();
});

it('admin can list b2c plans', function () {
    $admin = User::factory()->create(['email_verified_at' => now()]);
    $admin->assignRole('superadmin');

    B2cPlan::factory()->count(3)->create();

    $this->actingAs($admin)
        ->withoutVite()
        ->get('/admin/b2c-plans')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/b2c-plans/index')
            ->has('plans', 3)
        );
});

it('admin can create a new b2c plan', function () {
    $admin = User::factory()->create(['email_verified_at' => now()]);
    $admin->assignRole('superadmin');

    $this->actingAs($admin)
        ->post('/admin/b2c-plans', [
            'code' => 'team-monthly',
            'name' => 'Team Monthly',
            'price' => 149_000,
            'billing_period' => B2cPlan::PERIOD_MONTHLY,
            'currency' => 'IDR',
            'features' => ['Akses semua kursus'],
            'is_popular' => false,
            'is_active' => true,
            'sort_order' => 1,
        ])
        ->assertRedirect('/admin/b2c-plans');

    expect(B2cPlan::where('code', 'team-monthly')->exists())->toBeTrue();
});

it('forbids non-admin from admin b2c endpoints', function () {
    $stranger = User::factory()->create(['email_verified_at' => now()]);

    $this->actingAs($stranger)
        ->get('/admin/b2c-plans')
        ->assertForbidden();
});

it('renders admin b2c subscriptions list with filters', function () {
    $admin = User::factory()->create(['email_verified_at' => now()]);
    $admin->assignRole('superadmin');

    $plan = B2cPlan::factory()->create();
    B2cSubscription::factory()->count(2)->create(['b2c_plan_id' => $plan->id]);
    B2cSubscription::factory()->expired()->create(['b2c_plan_id' => $plan->id]);

    $this->actingAs($admin)
        ->withoutVite()
        ->get('/admin/b2c-subscriptions?status=active')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/b2c-subscriptions/index')
            ->where('stats.active', 2)
            ->where('stats.expired', 1)
            ->has('subscriptions.data', 2)
        );
});
