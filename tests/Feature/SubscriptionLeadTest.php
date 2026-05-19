<?php

use App\Mail\NewSubscriptionLeadMail;
use App\Models\SubscriptionLead;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Permission::findOrCreate('subscription.manage', 'web');
    Role::findOrCreate('superadmin', 'web')->givePermissionTo('subscription.manage');

    $this->admin = User::factory()->create(['email_verified_at' => now()]);
    $this->admin->assignRole('superadmin');
});

it('captures a lead from the pricing page', function () {
    Mail::fake();

    $plan = SubscriptionPlan::factory()->create();

    $this->post('/corporate/pricing/contact', [
        'subscription_plan_id' => $plan->id,
        'company_name' => 'PT Maju Bersama',
        'contact_name' => 'Pak Budi',
        'email' => 'budi@majubersama.test',
        'phone' => '081234567890',
        'employee_count' => 75,
        'message' => 'Mau training tim sales 75 orang',
    ])->assertRedirect();

    $lead = SubscriptionLead::query()->where('company_name', 'PT Maju Bersama')->first();
    expect($lead)->not->toBeNull();
    expect($lead->status)->toBe('new');
    expect($lead->subscription_plan_id)->toBe($plan->id);

    Mail::assertSent(NewSubscriptionLeadMail::class);
});

it('validates email and required fields', function () {
    $this->post('/corporate/pricing/contact', [
        'company_name' => '',
        'contact_name' => '',
        'email' => 'not-an-email',
    ])->assertSessionHasErrors(['company_name', 'contact_name', 'email']);
});

it('renders admin leads inbox', function () {
    SubscriptionLead::factory()->count(3)->create(['status' => 'new']);

    $this->actingAs($this->admin)
        ->withoutVite()
        ->get('/admin/subscription-leads')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/subscription-leads/index')
            ->has('leads.data', 3)
            ->where('stats.new', 3)
        );
});

it('filters by status', function () {
    SubscriptionLead::factory()->count(2)->create(['status' => 'new']);
    SubscriptionLead::factory()->create(['status' => 'qualified']);

    $this->actingAs($this->admin)
        ->withoutVite()
        ->get('/admin/subscription-leads?status=qualified')
        ->assertInertia(fn ($page) => $page->has('leads.data', 1));
});

it('updates lead status + sets contacted_at on first contact', function () {
    $lead = SubscriptionLead::factory()->create(['status' => 'new']);

    $this->actingAs($this->admin)
        ->patch("/admin/subscription-leads/{$lead->id}", [
            'status' => 'contacted',
            'notes' => 'Sudah call, scheduled demo',
        ])
        ->assertRedirect();

    $fresh = $lead->fresh();
    expect($fresh->status)->toBe('contacted');
    expect($fresh->notes)->toContain('Sudah call');
    expect($fresh->contacted_at)->not->toBeNull();
});

it('forbids non-admin from admin leads endpoints', function () {
    $stranger = User::factory()->create(['email_verified_at' => now()]);

    $this->actingAs($stranger)
        ->get('/admin/subscription-leads')
        ->assertForbidden();
});

it('email mailable subject contains company name and plan', function () {
    $plan = SubscriptionPlan::factory()->create(['name' => 'Growth']);
    $lead = SubscriptionLead::factory()->create([
        'subscription_plan_id' => $plan->id,
        'company_name' => 'PT XYZ',
    ]);

    $mailable = new NewSubscriptionLeadMail($lead->fresh('plan'));
    $envelope = $mailable->envelope();
    expect($envelope->subject)->toContain('PT XYZ');
    expect($envelope->subject)->toContain('Growth');
});
