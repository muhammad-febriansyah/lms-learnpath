<?php

use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Permission::findOrCreate('subscription.manage', 'web');
    Role::findOrCreate('superadmin', 'web')->givePermissionTo('subscription.manage');

    $this->admin = User::factory()->create(['email_verified_at' => now()]);
    $this->admin->assignRole('superadmin');
});

it('renders public pricing page with active plans only', function () {
    SubscriptionPlan::factory()->create([
        'code' => 'visible',
        'name' => 'Visible',
        'is_active' => true,
        'sort_order' => 1,
    ]);
    SubscriptionPlan::factory()->create([
        'code' => 'hidden',
        'name' => 'Hidden',
        'is_active' => false,
        'sort_order' => 2,
    ]);

    $this->withoutVite()
        ->get('/corporate/pricing')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/corporate/pricing')
            ->has('plans', 1)
            ->where('plans.0.code', 'visible')
        );
});

it('user_range helper formats correctly', function () {
    $plan = SubscriptionPlan::factory()->create([
        'min_users' => 1,
        'max_users' => 49,
    ]);
    expect($plan->userRange())->toBe('1-49 User');

    $enterprise = SubscriptionPlan::factory()->create([
        'min_users' => 1001,
        'max_users' => null,
    ]);
    expect($enterprise->userRange())->toBe('1001 User Keatas');
});

it('renders admin plans index for authorized admin', function () {
    SubscriptionPlan::factory()->count(3)->create();

    $this->actingAs($this->admin)
        ->withoutVite()
        ->get('/admin/subscription-plans')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/subscription-plans/index')
            ->has('plans', 3)
        );
});

it('forbids non-admin from admin plans', function () {
    $stranger = User::factory()->create(['email_verified_at' => now()]);

    $this->actingAs($stranger)
        ->get('/admin/subscription-plans')
        ->assertForbidden();
});

it('creates a subscription plan via admin endpoint', function () {
    $this->actingAs($this->admin)
        ->post('/admin/subscription-plans', [
            'code' => 'new-plan',
            'name' => 'New Plan',
            'tagline' => 'Testing',
            'min_users' => 10,
            'max_users' => 100,
            'price_per_user_per_month' => 250000,
            'currency' => 'IDR',
            'features' => ['Akses', 'Sertifikat'],
            'addons' => [],
            'is_popular' => false,
            'is_active' => true,
            'contact_sales_only' => true,
            'sort_order' => 5,
        ])
        ->assertRedirect();

    expect(SubscriptionPlan::query()->where('code', 'new-plan')->exists())->toBeTrue();
});

it('rejects duplicate code', function () {
    SubscriptionPlan::factory()->create(['code' => 'dup']);

    $this->actingAs($this->admin)
        ->post('/admin/subscription-plans', [
            'code' => 'dup',
            'name' => 'Dup',
            'min_users' => 1,
            'price_per_user_per_month' => 0,
            'currency' => 'IDR',
        ])
        ->assertSessionHasErrors('code');
});

it('updates a plan', function () {
    $plan = SubscriptionPlan::factory()->create([
        'price_per_user_per_month' => 100,
    ]);

    $this->actingAs($this->admin)
        ->patch("/admin/subscription-plans/{$plan->id}", [
            'code' => $plan->code,
            'name' => 'Updated Name',
            'min_users' => $plan->min_users,
            'max_users' => $plan->max_users,
            'price_per_user_per_month' => 999,
            'currency' => 'IDR',
            'features' => ['Feature A'],
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    expect($plan->fresh()->name)->toBe('Updated Name');
    expect($plan->fresh()->price_per_user_per_month)->toBe(999);
});

it('deletes plan with no organizations', function () {
    $plan = SubscriptionPlan::factory()->create();

    $this->actingAs($this->admin)
        ->delete("/admin/subscription-plans/{$plan->id}")
        ->assertRedirect();

    expect(SubscriptionPlan::query()->whereKey($plan->id)->exists())->toBeFalse();
});
