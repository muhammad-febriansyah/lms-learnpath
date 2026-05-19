<?php

use App\Models\Course;
use App\Models\User;
use App\Models\Voucher;
use App\Models\VoucherBatch;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Permission::findOrCreate('voucher.manage', 'web');
    Role::findOrCreate('superadmin', 'web')->givePermissionTo('voucher.manage');

    $this->admin = User::factory()->create(['email_verified_at' => now()]);
    $this->admin->assignRole('superadmin');
});

it('renders the voucher index for an authorized admin', function () {
    Voucher::factory()->count(3)->create();

    $this->actingAs($this->admin)
        ->withoutVite()
        ->get('/admin/vouchers')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/vouchers/index')
            ->has('vouchers.data', 3)
            ->where('stats.total', 3)
        );
});

it('forbids non-admin users', function () {
    $stranger = User::factory()->create(['email_verified_at' => now()]);

    $this->actingAs($stranger)
        ->get('/admin/vouchers')
        ->assertForbidden();
});

it('creates a single course voucher', function () {
    $course = Course::factory()->create();

    $this->actingAs($this->admin)
        ->post('/admin/vouchers', [
            'code' => 'NEWCODE1',
            'grant_kind' => 'course',
            'grantable_id' => $course->id,
            'max_uses' => 1,
            'single_use_per_user' => true,
            'is_active' => true,
        ])
        ->assertRedirect();

    expect(Voucher::query()->where('code', 'NEWCODE1')->exists())->toBeTrue();
});

it('rejects duplicate codes', function () {
    Voucher::factory()->create(['code' => 'DUPCODE']);
    $course = Course::factory()->create();

    $this->actingAs($this->admin)
        ->post('/admin/vouchers', [
            'code' => 'DUPCODE',
            'grant_kind' => 'course',
            'grantable_id' => $course->id,
            'max_uses' => 1,
            'is_active' => true,
        ])
        ->assertSessionHasErrors('code');
});

it('creates a points voucher without grantable item', function () {
    $this->actingAs($this->admin)
        ->post('/admin/vouchers', [
            'code' => 'POINTV1',
            'grant_kind' => 'points',
            'points_amount' => 500,
            'max_uses' => 5,
            'is_active' => true,
        ])
        ->assertRedirect();

    $voucher = Voucher::query()->where('code', 'POINTV1')->first();
    expect($voucher)->not->toBeNull();
    expect($voucher->grantable_id)->toBeNull();
    expect($voucher->points_amount)->toBe(500);
});

it('toggles voucher active state', function () {
    $voucher = Voucher::factory()->create(['is_active' => true]);

    $this->actingAs($this->admin)
        ->post("/admin/vouchers/{$voucher->id}/toggle")
        ->assertRedirect();

    expect($voucher->fresh()->is_active)->toBeFalse();
});

it('deletes an unused voucher', function () {
    $voucher = Voucher::factory()->create();

    $this->actingAs($this->admin)
        ->delete("/admin/vouchers/{$voucher->id}")
        ->assertRedirect();

    expect(Voucher::query()->whereKey($voucher->id)->exists())->toBeFalse();
});

it('generates a batch of vouchers', function () {
    $course = Course::factory()->create();

    $this->actingAs($this->admin)
        ->post('/admin/voucher-batches', [
            'name' => 'Harbolnas Test',
            'prefix' => 'HBN',
            'grant_kind' => 'course',
            'grantable_id' => $course->id,
            'count' => 25,
            'single_use_per_user' => true,
            'is_active' => true,
        ])
        ->assertRedirect();

    $batch = VoucherBatch::query()->where('name', 'Harbolnas Test')->first();
    expect($batch)->not->toBeNull();
    expect($batch->total_codes)->toBe(25);
    expect($batch->vouchers()->count())->toBe(25);
});

it('streams the batch CSV download', function () {
    $batch = VoucherBatch::factory()->create();
    Voucher::factory()->count(3)->create(['voucher_batch_id' => $batch->id]);

    $response = $this->actingAs($this->admin)
        ->get("/admin/voucher-batches/{$batch->id}/export");

    $response->assertOk();
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');

    $csv = $response->streamedContent();
    expect($csv)->toContain('Code,Status,Uses');
    expect($csv)->toContain('Max Uses');
});

it('blocks deleting a batch with redeemed codes', function () {
    $batch = VoucherBatch::factory()->create();
    Voucher::factory()->create([
        'voucher_batch_id' => $batch->id,
        'uses_count' => 1,
    ]);

    $this->actingAs($this->admin)
        ->delete("/admin/voucher-batches/{$batch->id}")
        ->assertRedirect();

    expect(VoucherBatch::query()->whereKey($batch->id)->exists())->toBeTrue();
});
