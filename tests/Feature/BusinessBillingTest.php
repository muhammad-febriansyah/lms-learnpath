<?php

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::findOrCreate('hr', 'web');
    Role::findOrCreate('admin_tenant', 'web');

    $this->org = Organization::create([
        'name' => 'Acme Billing',
        'slug' => 'acme-billing',
        'contact_name' => 'HR Acme',
        'contact_email' => 'hr@acme-billing.test',
        'seat_quota' => 50,
        'seats_used' => 0,
        'status' => 'active',
    ]);

    $this->hr = User::factory()->create(['email_verified_at' => now()]);
    $this->hr->assignRole('hr');
    OrganizationMember::create([
        'organization_id' => $this->org->id,
        'user_id' => $this->hr->id,
        'role' => 'admin',
        'joined_at' => now(),
    ]);
});

function makeB2bSeatOrder(Organization $org, User $user, string $status = 'paid'): Order
{
    $order = Order::create([
        'user_id' => $user->id,
        'order_number' => 'ORD-'.uniqid(),
        'type' => 'b2b_seat',
        'subtotal' => 5_000_000,
        'discount' => 0,
        'tax' => 0,
        'total' => 5_000_000,
        'currency' => 'IDR',
        'status' => $status,
        'customer_name' => $user->name,
        'customer_email' => $user->email,
        'paid_at' => $status === 'paid' ? now() : null,
        'metadata' => ['organization_id' => $org->id, 'seats' => 50],
    ]);

    OrderItem::create([
        'order_id' => $order->id,
        'purchasable_type' => Organization::class,
        'purchasable_id' => $org->id,
        'name' => "Paket 50 seat - {$org->name}",
        'quantity' => 50,
        'unit_price' => 100_000,
        'subtotal' => 5_000_000,
    ]);

    return $order;
}

it('renders billing index for HR admin with org orders', function () {
    makeB2bSeatOrder($this->org, $this->hr, 'paid');
    makeB2bSeatOrder($this->org, $this->hr, 'pending');

    $this->actingAs($this->hr)
        ->withoutVite()
        ->get('/business/billing')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('business/billing/index')
            ->has('orders.data', 2)
            ->where('stats.paid_count', 1)
            ->where('stats.pending_count', 1)
            ->where('stats.total_spent', 5_000_000)
        );
});

it('forbids non-admin members from billing', function () {
    $member = User::factory()->create(['email_verified_at' => now()]);
    OrganizationMember::create([
        'organization_id' => $this->org->id,
        'user_id' => $member->id,
        'role' => 'member',
        'joined_at' => now(),
    ]);

    // The route middleware requires hr/admin_tenant/superadmin role, so first
    // give the user a Spatie role that bypasses the role guard, but they still
    // shouldn't see the org because they aren't an 'admin' pivot.
    Role::findOrCreate('hr', 'web');
    $member->assignRole('hr');

    $this->actingAs($member)
        ->get('/business/billing')
        ->assertForbidden();
});

it('renders order detail for HR admin', function () {
    $order = makeB2bSeatOrder($this->org, $this->hr, 'paid');

    $this->actingAs($this->hr)
        ->withoutVite()
        ->get("/business/billing/{$order->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('business/billing/show')
            ->where('order.order_number', $order->order_number)
            ->where('order.total', 5_000_000)
            ->has('order.items', 1)
        );
});

it('includes the stored payment method on billing detail payload', function () {
    $order = makeB2bSeatOrder($this->org, $this->hr, 'paid');

    Payment::factory()->create([
        'order_id' => $order->id,
        'payment_method' => 'va_bca',
        'status' => 'completed',
    ]);

    $this->actingAs($this->hr)
        ->withoutVite()
        ->get("/business/billing/{$order->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('business/billing/show')
            ->where('order.payments.0.method', 'va_bca')
        );
});

it('blocks order detail for orders from other organizations', function () {
    $otherOrg = Organization::create([
        'name' => 'Other Co',
        'slug' => 'other-co',
        'contact_name' => 'X',
        'contact_email' => 'x@other.test',
        'seat_quota' => 10,
        'seats_used' => 0,
        'status' => 'active',
    ]);
    $otherHr = User::factory()->create();
    OrganizationMember::create([
        'organization_id' => $otherOrg->id,
        'user_id' => $otherHr->id,
        'role' => 'admin',
        'joined_at' => now(),
    ]);
    $otherOrder = makeB2bSeatOrder($otherOrg, $otherHr, 'paid');

    $this->actingAs($this->hr)
        ->get("/business/billing/{$otherOrder->id}")
        ->assertForbidden();
});

it('returns invoice HTML for paid orders', function () {
    $order = makeB2bSeatOrder($this->org, $this->hr, 'paid');

    $response = $this->actingAs($this->hr)
        ->get("/business/billing/{$order->id}/invoice");

    $response->assertOk();
    $response->assertSee($order->order_number);
    $response->assertSee('INVOICE', false);
    $response->assertSee('Acme Billing');
});

it('404 for invoice of pending (unpaid) orders', function () {
    $order = makeB2bSeatOrder($this->org, $this->hr, 'pending');

    $this->actingAs($this->hr)
        ->get("/business/billing/{$order->id}/invoice")
        ->assertNotFound();
});

it('renders seats utilization report with breakdown', function () {
    // Active member (logged in yesterday)
    $active = User::factory()->create(['last_login_at' => now()->subDay()]);
    OrganizationMember::create([
        'organization_id' => $this->org->id,
        'user_id' => $active->id,
        'role' => 'member',
        'joined_at' => now()->subMonths(2),
    ]);

    // Inactive (last login 60 days ago)
    $inactive = User::factory()->create(['last_login_at' => now()->subDays(60)]);
    OrganizationMember::create([
        'organization_id' => $this->org->id,
        'user_id' => $inactive->id,
        'role' => 'member',
        'joined_at' => now()->subMonths(3),
    ]);

    // Never logged in
    $never = User::factory()->create(['last_login_at' => null]);
    OrganizationMember::create([
        'organization_id' => $this->org->id,
        'user_id' => $never->id,
        'role' => 'member',
        'joined_at' => now()->subDays(5),
    ]);

    $this->actingAs($this->hr)
        ->withoutVite()
        ->get('/business/seats')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('business/seats/index')
            ->where('breakdown.active', 1)
            ->where('breakdown.inactive', 1)
            ->where('breakdown.never_logged_in', 2) // hr + never-logged
        );
});

it('shows expiring contract via contract prop', function () {
    $this->org->update(['contract_ends_at' => now()->addDays(10)]);

    $this->actingAs($this->hr)
        ->withoutVite()
        ->get('/business/billing')
        ->assertInertia(fn ($page) => $page
            ->where('contract.expiring_soon', true)
            ->where('contract.expired', false)
            ->where('contract.days_left', 10)
        );
});

it('shows expired contract', function () {
    $this->org->update(['contract_ends_at' => now()->subDays(5)]);

    $this->actingAs($this->hr)
        ->withoutVite()
        ->get('/business/billing')
        ->assertInertia(fn ($page) => $page
            ->where('contract.expired', true)
        );
});
